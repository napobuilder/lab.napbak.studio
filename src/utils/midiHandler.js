// Napbak MIDI Engine - SMF (Standard MIDI File) Format 0 & 1 Parser & Exporter
// Zero-dependency, ultra-lightweight client-side MIDI processing

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiNumberToName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return `${name}${octave}`;
}

// Read Variable-Length Quantity (VLQ)
function readVLQ(view, offset) {
  let value = 0;
  let bytesRead = 0;
  while (offset + bytesRead < view.byteLength) {
    const byte = view.getUint8(offset + bytesRead);
    bytesRead++;
    value = (value << 7) | (byte & 0x7f);
    if ((byte & 0x80) === 0) break;
  }
  return { value, bytesRead };
}

// Encode Variable-Length Quantity
function encodeVLQ(value) {
  const bytes = [];
  bytes.push(value & 0x7f);
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return bytes;
}

/**
 * Parse an ArrayBuffer of a .mid / .midi file
 * Supports Standard MIDI Format 0 and Format 1
 * Returns { duration, bpm, name, notes: [{ midi, noteName, time, duration, velocity }] }
 */
export function parseMidiFile(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  // 1. Verify "MThd" header chunk
  if (view.byteLength < 14) throw new Error('File is too small to be a valid MIDI file.');
  const mthdStr = String.fromCharCode(
    view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
  );
  if (mthdStr !== 'MThd') throw new Error('Invalid MIDI header: missing MThd chunk');

  const headerLength = view.getUint32(4);
  const format = view.getUint16(8);
  const trackCount = view.getUint16(10);
  const timeDivision = view.getUint16(12);

  // PPQ (ticks per quarter note)
  if ((timeDivision & 0x8000) !== 0) {
    throw new Error('SMPTE time division format not supported');
  }
  const ticksPerBeat = timeDivision;
  offset = 8 + headerLength;

  // Track raw events across all tracks: array of { trackIndex, tick, type, midi, velocity, tempo, text }
  const allEvents = [];
  let detectedTitle = '';

  for (let t = 0; t < trackCount && offset < view.byteLength; t++) {
    // Read MTrk chunk
    if (offset + 8 > view.byteLength) break;
    const chunkType = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3)
    );
    const chunkLength = view.getUint32(offset + 4);
    offset += 8;

    if (chunkType !== 'MTrk') {
      offset += chunkLength;
      continue;
    }

    const trackEnd = offset + chunkLength;
    let currentTick = 0;
    let runningStatus = null;

    while (offset < trackEnd && offset < view.byteLength) {
      const { value: delta, bytesRead: deltaBytes } = readVLQ(view, offset);
      offset += deltaBytes;
      currentTick += delta;

      if (offset >= trackEnd || offset >= view.byteLength) break;

      let status = view.getUint8(offset);

      if (status < 0x80) {
        if (!runningStatus) break;
        status = runningStatus;
      } else {
        offset++;
        if (status < 0xf0) {
          runningStatus = status;
        }
      }

      const command = status >> 4;

      if (command === 0x8) {
        // Note Off
        const note = view.getUint8(offset++);
        const vel = view.getUint8(offset++);
        allEvents.push({ track: t, tick: currentTick, type: 'noteOff', midi: note, vel });
      } else if (command === 0x9) {
        // Note On (or Note Off if vel === 0)
        const note = view.getUint8(offset++);
        const vel = view.getUint8(offset++);
        if (vel === 0) {
          allEvents.push({ track: t, tick: currentTick, type: 'noteOff', midi: note, vel: 0 });
        } else {
          allEvents.push({ track: t, tick: currentTick, type: 'noteOn', midi: note, vel });
        }
      } else if (command === 0xa || command === 0xb || command === 0xe) {
        // Poly Key Pressure, Control Change, Pitch Bend (2 data bytes)
        offset += 2;
      } else if (command === 0xc || command === 0xd) {
        // Program Change, Channel Pressure (1 data byte)
        offset += 1;
      } else if (status === 0xf0 || status === 0xf7) {
        // Sysex event
        const { value: sysexLen, bytesRead: sysexBytes } = readVLQ(view, offset);
        offset += sysexBytes + sysexLen;
      } else if (status === 0xff) {
        // Meta Event
        const metaType = view.getUint8(offset++);
        const { value: metaLen, bytesRead: metaBytes } = readVLQ(view, offset);
        offset += metaBytes;

        if (metaType === 0x51 && metaLen === 3) {
          // Set Tempo (microseconds per quarter note)
          const micros = (view.getUint8(offset) << 16) | (view.getUint8(offset + 1) << 8) | view.getUint8(offset + 2);
          const bpm = Math.round(60000000 / micros);
          allEvents.push({ track: t, tick: currentTick, type: 'tempo', micros, bpm });
        } else if (metaType === 0x03 && !detectedTitle) {
          // Track Name / Title
          let str = '';
          for (let i = 0; i < metaLen; i++) {
            str += String.fromCharCode(view.getUint8(offset + i));
          }
          if (str.trim()) detectedTitle = str.trim();
        }

        offset += metaLen;
      }
    }
  }

  // Sort all events chronologically by tick
  allEvents.sort((a, b) => a.tick - b.tick);

  // Calculate real time in seconds for each tick using tempo map
  let currentMicrosPerBeat = 500000; // default 120 BPM
  let lastTempoTick = 0;
  let lastTempoTime = 0;
  let initialBpm = 120;
  let hasSetInitialBpm = false;

  const tickToSeconds = (tick) => {
    return lastTempoTime + ((tick - lastTempoTick) / ticksPerBeat) * (currentMicrosPerBeat / 1000000);
  };

  // Pre-calculate exact timestamps
  const timedEvents = [];
  for (const ev of allEvents) {
    if (ev.type === 'tempo') {
      lastTempoTime = tickToSeconds(ev.tick);
      lastTempoTick = ev.tick;
      currentMicrosPerBeat = ev.micros;
      if (!hasSetInitialBpm) {
        initialBpm = ev.bpm;
        hasSetInitialBpm = true;
      }
    } else {
      timedEvents.push({
        ...ev,
        time: tickToSeconds(ev.tick)
      });
    }
  }

  // Pair Note On with Note Off to determine duration
  const activeNotes = new Map(); // key: `${track}-${midi}` -> { time, midi, vel }
  const notes = [];
  let maxDuration = 0;

  for (const ev of timedEvents) {
    const key = `${ev.track}-${ev.midi}`;
    if (ev.type === 'noteOn') {
      // If note already ringing on this track, close it
      if (activeNotes.has(key)) {
        const prior = activeNotes.get(key);
        const duration = Math.max(0.08, ev.time - prior.time);
        notes.push({
          midi: prior.midi,
          noteName: midiNumberToName(prior.midi),
          time: prior.time,
          duration,
          velocity: prior.vel
        });
        if (prior.time + duration > maxDuration) maxDuration = prior.time + duration;
      }
      activeNotes.set(key, { time: ev.time, midi: ev.midi, vel: ev.vel });
    } else if (ev.type === 'noteOff') {
      if (activeNotes.has(key)) {
        const prior = activeNotes.get(key);
        activeNotes.delete(key);
        const duration = Math.max(0.08, ev.time - prior.time);
        notes.push({
          midi: prior.midi,
          noteName: midiNumberToName(prior.midi),
          time: prior.time,
          duration,
          velocity: prior.vel
        });
        if (prior.time + duration > maxDuration) maxDuration = prior.time + duration;
      }
    }
  }

  // Close any leftover open notes
  activeNotes.forEach((prior) => {
    const duration = 0.5;
    notes.push({
      midi: prior.midi,
      noteName: midiNumberToName(prior.midi),
      time: prior.time,
      duration,
      velocity: prior.vel
    });
    if (prior.time + duration > maxDuration) maxDuration = prior.time + duration;
  });

  // Sort notes by start time
  notes.sort((a, b) => a.time - b.time);

  return {
    name: detectedTitle || 'Piano MIDI Clip',
    format,
    trackCount,
    bpm: initialBpm,
    duration: Math.max(1, Math.round(maxDuration * 100) / 100),
    totalNotes: notes.length,
    notes
  };
}

/**
 * Export an array of notes to a standard Format 0 .mid File Blob
 * notes format: [{ midi: 60, time: 0.5, duration: 1.2, velocity: 90 }]
 */
export function exportMidiFile(notes, bpm = 120, clipName = 'Napbak Piano Take') {
  const ppq = 480;
  const microsPerBeat = Math.round(60000000 / bpm);
  const secondsPerTick = (microsPerBeat / 1000000) / ppq;

  // Convert note events to timeline of note_on and note_off
  const rawEvents = [];
  for (const n of notes) {
    const startTick = Math.max(0, Math.round(n.time / secondsPerTick));
    const endTick = Math.max(startTick + 1, Math.round((n.time + n.duration) / secondsPerTick));
    const vel = Math.min(127, Math.max(1, Math.round(n.velocity || 90)));

    rawEvents.push({ tick: startTick, type: 0x90, midi: n.midi, vel });
    rawEvents.push({ tick: endTick, type: 0x80, midi: n.midi, vel: 0 });
  }

  // Sort by tick (if same tick, Note Off before Note On)
  rawEvents.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    return a.type - b.type;
  });

  // Build Track Data
  const trackBytes = [];

  // Track Name Meta Event
  trackBytes.push(0x00, 0xff, 0x03, clipName.length);
  for (let i = 0; i < clipName.length; i++) {
    trackBytes.push(clipName.charCodeAt(i));
  }

  // Set Tempo Meta Event (0xFF 0x51 0x03)
  trackBytes.push(
    0x00, 0xff, 0x51, 0x03,
    (microsPerBeat >> 16) & 0xff,
    (microsPerBeat >> 8) & 0xff,
    microsPerBeat & 0xff
  );

  let lastTick = 0;
  for (const ev of rawEvents) {
    const delta = ev.tick - lastTick;
    lastTick = ev.tick;
    const vlqBytes = encodeVLQ(delta);
    trackBytes.push(...vlqBytes);
    trackBytes.push(ev.type, ev.midi, ev.vel);
  }

  // End of Track Meta Event (0x00 0xFF 0x2F 0x00)
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // Total buffer length: Header (14 bytes) + Track Header (8 bytes) + trackBytes.length
  const totalLength = 14 + 8 + trackBytes.length;
  const buffer = new Uint8Array(totalLength);
  const view = new DataView(buffer.buffer);

  // Header "MThd"
  buffer.set([0x4d, 0x54, 0x68, 0x64], 0);
  view.setUint32(4, 6);        // Length = 6
  view.setUint16(8, 0);        // Format 0 (Single Track)
  view.setUint16(10, 1);       // 1 Track
  view.setUint16(12, ppq);     // PPQ

  // Track Header "MTrk"
  buffer.set([0x4d, 0x54, 0x72, 0x6b], 14);
  view.setUint32(18, trackBytes.length);

  // Track Data
  buffer.set(trackBytes, 22);

  return new Blob([buffer], { type: 'audio/midi' });
}
