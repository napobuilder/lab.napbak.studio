// Napbak Studio Grade WAV Exporter
// Encodes Web Audio Float32Array PCM buffers into uncompressed 16-bit Stereo RIFF/WAV

export function encodeWAV(audioBuffers, sampleRate = 44100) {
  // audioBuffers: array of Float32Array (channel 0, channel 1)
  const numChannels = audioBuffers.length;
  const length = audioBuffers[0].length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Write ASCII helper
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(8, 'WAVE');

  // 2. fmt Subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);             // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);              // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);    // NumChannels
  view.setUint32(24, sampleRate, true);     // SampleRate
  view.setUint32(28, byteRate, true);       // ByteRate
  view.setUint16(32, blockAlign, true);     // BlockAlign
  view.setUint16(34, 16, true);             // BitsPerSample (16-bit)

  // 3. data Subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave and quantize Float32 (-1.0 to 1.0) -> Int16 (-32768 to 32767)
  let offset = 44;
  const left = audioBuffers[0];
  const right = numChannels > 1 ? audioBuffers[1] : audioBuffers[0];

  for (let i = 0; i < length; i++) {
    // Left Channel
    let sL = Math.max(-1, Math.min(1, left[i]));
    let valL = sL < 0 ? sL * 0x8000 : sL * 0x7FFF;
    view.setInt16(offset, valL, true);
    offset += 2;

    // Right Channel
    let sR = Math.max(-1, Math.min(1, right[i]));
    let valR = sR < 0 ? sR * 0x8000 : sR * 0x7FFF;
    view.setInt16(offset, valR, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}
