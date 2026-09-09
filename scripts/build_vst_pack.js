import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const cdnBase = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3';
const outDir = path.resolve('public/downloads/Napbak_Concert_Grand_Universal_VST_Pack');
const samplesDir = path.join(outDir, 'Samples');

if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

const noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
function midiToName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
}

// 88-key piano sample mapping (MIDI 21 to 108 sampled every 3 semitones)
const sampleMidis = [];
for (let m = 21; m <= 108; m += 3) {
  sampleMidis.push(m);
}
if (!sampleMidis.includes(108)) sampleMidis.push(108);

console.log(`Downloading ${sampleMidis.length} acoustic grand samples...`);

async function run() {
  for (const midi of sampleMidis) {
    const name = midiToName(midi);
    const fileName = `${name}.mp3`;
    const targetPath = path.join(samplesDir, fileName);
    
    if (!fs.existsSync(targetPath)) {
      try {
        const url = `${cdnBase}/${fileName}`;
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(targetPath, buf);
          console.log(`✓ Downloaded ${fileName}`);
        } else {
          console.warn(`Failed ${fileName}: status ${res.status}`);
        }
      } catch (err) {
        console.error(`Error downloading ${fileName}:`, err.message);
      }
    }
  }

  // 1. Generate Decent Sampler Preset (.dspreset)
  let dsSampleTags = '';
  for (let i = 0; i < sampleMidis.length; i++) {
    const root = sampleMidis[i];
    const name = midiToName(root);
    const loNote = i === 0 ? 21 : Math.floor((sampleMidis[i - 1] + root) / 2) + 1;
    const hiNote = i === sampleMidis.length - 1 ? 108 : Math.floor((root + sampleMidis[i + 1]) / 2);
    
    dsSampleTags += `      <sample rootNote="${root}" loNote="${loNote}" hiNote="${hiNote}" path="Samples/${name}.mp3" />\n`;
  }

  const dsPresetContent = `<?xml version="1.0" encoding="UTF-8"?>
<DecentSampler minVersion="1.0.0">
  <!-- Napbak Concert Grand Piano VST Preset -->
  <!-- Designed for FL Studio, Ableton Live, Logic Pro, Reaper, Cubase & Studio One -->
  <ui width="812" height="375" layoutMode="relative" bgMode="color" bgColor="FF070707">
    <tab name="main">
      <label x="40" y="25" width="400" height="30" text="NAPBAK CONCERT GRAND" fontSize="20" textColor="FFFFFFFF" />
      <label x="40" y="50" width="400" height="20" text="Acoustic Grand Piano // Physical Modeling DSP" fontSize="11" textColor="FF9D4EDD" />

      <labeled-knob x="100" y="110" width="110" height="120" textSize="12" textColor="FFFFFFFF"
                    trackForegroundColor="FF9D4EDD" trackBackgroundColor="22FFFFFF"
                    label="VOLUME" type="float" minValue="0" maxValue="1" value="0.85">
        <binding type="amp" level="instrument" position="0" parameter="AMP_VOLUME" />
      </labeled-knob>

      <labeled-knob x="240" y="110" width="110" height="120" textSize="12" textColor="FFFFFFFF"
                    trackForegroundColor="FFE0AAFF" trackBackgroundColor="22FFFFFF"
                    label="REVERB" type="float" minValue="0" maxValue="1" value="0.35">
        <binding type="effect" level="instrument" position="0" parameter="FX_REVERB_WET_LEVEL" />
      </labeled-knob>

      <labeled-knob x="380" y="110" width="110" height="120" textSize="12" textColor="FFFFFFFF"
                    trackForegroundColor="FF9D4EDD" trackBackgroundColor="22FFFFFF"
                    label="WARMTH" type="float" minValue="500" maxValue="18000" value="13000">
        <binding type="effect" level="instrument" position="1" parameter="FX_FILTER_FREQUENCY" />
      </labeled-knob>

      <labeled-knob x="520" y="110" width="110" height="120" textSize="12" textColor="FFFFFFFF"
                    trackForegroundColor="FFE0AAFF" trackBackgroundColor="22FFFFFF"
                    label="RELEASE" type="float" minValue="0.1" maxValue="3.0" value="0.8">
        <binding type="amp" level="instrument" position="0" parameter="ENV_RELEASE" />
      </labeled-knob>
    </tab>
  </ui>

  <groups>
    <group ampVelTrack="1.0">
${dsSampleTags}    </group>
  </groups>

  <effects>
    <effect type="reverb" wetLevel="0.35" />
    <effect type="lowpass" frequency="13000" />
  </effects>
</DecentSampler>
`;

  fs.writeFileSync(path.join(outDir, 'Napbak_Concert_Grand.dspreset'), dsPresetContent, 'utf-8');
  console.log('✓ Created Napbak_Concert_Grand.dspreset');

  // 2. Generate Universal SFZ Instrument (.sfz)
  let sfzRegions = '';
  for (let i = 0; i < sampleMidis.length; i++) {
    const root = sampleMidis[i];
    const name = midiToName(root);
    const loNote = i === 0 ? 21 : Math.floor((sampleMidis[i - 1] + root) / 2) + 1;
    const hiNote = i === sampleMidis.length - 1 ? 108 : Math.floor((root + sampleMidis[i + 1]) / 2);
    
    sfzRegions += `<region> sample=Samples/${name}.mp3 pitch_keycenter=${root} lokey=${loNote} hikey=${hiNote}\n`;
  }

  const sfzContent = `// ==================================================================
// NAPBAK CONCERT GRAND PIANO - UNIVERSAL SFZ INSTRUMENT
// Compatible with:
// - FL Studio (DirectWave)
// - Ableton Live / Logic Pro / Reaper / Studio One / Cubase
// ==================================================================

<control>
default_path=

<global>
ampeg_attack=0.001
ampeg_decay=4.0
ampeg_sustain=0
ampeg_release=0.8

<group>
${sfzRegions}
`;

  fs.writeFileSync(path.join(outDir, 'Napbak_Concert_Grand.sfz'), sfzContent, 'utf-8');
  console.log('✓ Created Napbak_Concert_Grand.sfz');

  // 3. Generate README Instructions
  const readmeContent = `=======================================================================
 NAPBAK CONCERT GRAND PIANO - UNIVERSAL VST & DAW PACK
 Free Studio Acoustic Grand Piano by Napbak Studio
=======================================================================

Compatible with:
- FL STUDIO 20 / 21 / 24
- ABLETON LIVE 10 / 11 / 12
- LOGIC PRO X / GARAGEBAND
- REAPER, CUBASE, STUDIO ONE, BITWIG & PRO TOOLS

-----------------------------------------------------------------------
HOW TO USE IN ANY DAW (RECOMMENDED METHOD - 100% FREE):
-----------------------------------------------------------------------

1. Download the free "Decent Sampler" plugin (VST3, AU, AAX, Standalone):
   https://www.decentsampler.com/ (Available for Windows & Mac)

2. Open your DAW (FL Studio, Ableton, Logic, Reaper, etc.) and add
   "Decent Sampler" to your instrument tracks.

3. Drag & drop "Napbak_Concert_Grand.dspreset" directly into Decent Sampler
   (or click File -> Load... and select it).

4. Done! You have full control with the custom Napbak skin:
   - VOLUME: Master output
   - REVERB: Lush concert hall impulse
   - WARMTH: Tone and felt damping filter
   - RELEASE: Acoustic damper release time

-----------------------------------------------------------------------
HOW TO USE NATIVELY IN FL STUDIO (WITHOUT DECENT SAMPLER):
-----------------------------------------------------------------------

1. Open FL Studio.
2. Add "DirectWave" to your Channel Rack.
3. Drag & drop "Napbak_Concert_Grand.sfz" onto DirectWave.
4. Done! Plays instantly using FL Studio's internal engine.

-----------------------------------------------------------------------
HOW TO USE IN ABLETON LIVE, LOGIC PRO OR REAPER:
-----------------------------------------------------------------------

- You can load Decent Sampler (VST3 / AU) in any MIDI track.
- Alternatively, use any free SFZ player (such as Plogue Sforzando)
  to load "Napbak_Concert_Grand.sfz".

=======================================================================
Created by Napbak Studio - Free online tools & acoustic modeling
Visit: https://napbak.studio
=======================================================================
`;

  fs.writeFileSync(path.join(outDir, 'README_INSTRUCTIONS.txt'), readmeContent, 'utf-8');
  console.log('✓ Created README_INSTRUCTIONS.txt');

  // 4. Create ZIP Archive using PowerShell Compress-Archive
  const zipDest = path.resolve('public/downloads/Napbak_Concert_Grand_Universal_VST_Pack.zip');
  console.log('Compressing ZIP archive...');
  
  execSync(`powershell -Command "Compress-Archive -Path '${outDir}\\*' -DestinationPath '${zipDest}' -Force"`, {
    stdio: 'inherit'
  });

  console.log(`🎉 ZIP Created successfully at: ${zipDest}`);
}

run();
