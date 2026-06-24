/**
 * DSP Audio Processing Utilities for Napbak Studio Mastering Analyzer
 * Implements ITU-R BS.1770-4 / EBU R128 standards for Loudness and Peak measurements.
 */

/**
 * Stage 1 & 2 K-Weighting IIR Filter Coefficients calculation & application
 * High shelving filter (head acoustical model) + High-pass filter (low frequency cut)
 */
export function applyKWeighting(channelData, sampleRate) {
  const length = channelData.length;
  const filtered = new Float32Array(length);

  // Stage 1: High Shelving filter parameters
  const G1 = 3.99981075481711;
  const Q1 = 0.707106781186548;
  const fc1 = 1681.97445095553;
  const Vh = Math.pow(10, G1 / 20);
  const K1 = Math.tan(Math.PI * fc1 / sampleRate);
  
  const a0_1 = 1 + K1 / Q1 + K1 * K1;
  const b0_1 = (Vh + Math.sqrt(Vh) * K1 / Q1 + K1 * K1) / a0_1;
  const b1_1 = 2 * (K1 * K1 - Vh) / a0_1;
  const b2_1 = (Vh - Math.sqrt(Vh) * K1 / Q1 + K1 * K1) / a0_1;
  const a1_1 = 2 * (K1 * K1 - 1) / a0_1;
  const a2_1 = (1 - K1 / Q1 + K1 * K1) / a0_1;

  // Stage 2: High Pass filter parameters
  const Q2 = 0.500327037325877;
  const fc2 = 38.1354708761398;
  const K2 = Math.tan(Math.PI * fc2 / sampleRate);
  
  const a0_2 = 1 + K2 / Q2 + K2 * K2;
  const b0_2 = 1 / a0_2;
  const b1_2 = -2 / a0_2;
  const b2_2 = 1 / a0_2;
  const a1_2 = 2 * (K2 * K2 - 1) / a0_2;
  const a2_2 = (1 - K2 / Q2 + K2 * K2) / a0_2;

  // Filter state registers
  let x1_1 = 0, x2_1 = 0, y1_1 = 0, y2_1 = 0;
  let x1_2 = 0, x2_2 = 0, y1_2 = 0, y2_2 = 0;

  for (let i = 0; i < length; i++) {
    const x0 = channelData[i];
    
    // Stage 1 filter (High Shelving)
    const y0_1 = b0_1 * x0 + b1_1 * x1_1 + b2_1 * x2_1 - a1_1 * y1_1 - a2_1 * y2_1;
    x2_1 = x1_1;
    x1_1 = x0;
    y2_1 = y1_1;
    y1_1 = y0_1;

    // Stage 2 filter (High Pass)
    const y0_2 = b0_2 * y0_1 + b1_2 * x1_2 + b2_2 * x2_2 - a1_2 * y1_2 - a2_2 * y2_2;
    x2_2 = x1_2;
    x1_2 = y0_1;
    y2_2 = y1_2;
    y1_2 = y0_2;

    filtered[i] = y0_2;
  }

  return filtered;
}

/**
 * Calculates the Gated Integrated Loudness (LUFS) of a decoded AudioBuffer.
 * Following ITU-R BS.1770-4 gated integration rules.
 */
export function calculateIntegratedLUFS(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  
  // 1. Apply K-Weighting filter to each channel
  const filteredChannels = [];
  for (let c = 0; c < numChannels; c++) {
    filteredChannels.push(applyKWeighting(audioBuffer.getChannelData(c), sampleRate));
  }

  // 2. Define block properties (400ms blocks with 75% overlap, i.e., 100ms stride)
  const blockSize = Math.round(0.4 * sampleRate);
  const strideSize = Math.round(0.1 * sampleRate);
  const bufferLength = audioBuffer.length;
  
  const blocksPower = []; // Will store power for each valid block

  // Channel weightings: Left, Right are 1.0. Surrounds are 1.41. Center is 1.0.
  // Standard stereo: left=1.0, right=1.0
  const channelWeights = Array(numChannels).fill(1.0);

  // 3. Slide through blocks and calculate mean square power
  for (let offset = 0; offset + blockSize <= bufferLength; offset += strideSize) {
    let weightedPowerSum = 0;
    
    for (let c = 0; c < numChannels; c++) {
      const data = filteredChannels[c];
      let sumSquare = 0;
      
      // Calculate RMS for channel block
      for (let i = offset; i < offset + blockSize; i++) {
        sumSquare += data[i] * data[i];
      }
      
      const meanSquare = sumSquare / blockSize;
      weightedPowerSum += channelWeights[c] * meanSquare;
    }
    
    // Loudness level of block j: l_j = -0.691 + 10 * log10(weightedPowerSum)
    const blockLoudness = -0.691 + (weightedPowerSum > 0 ? 10 * Math.log10(weightedPowerSum) : -100);
    
    blocksPower.push({
      loudness: blockLoudness,
      powerSum: weightedPowerSum
    });
  }

  if (blocksPower.length === 0) return -Infinity;

  // 4. Gating Stage 1: Absolute threshold (-70 LUFS)
  const absGateThreshold = -70.0;
  const absGatedBlocks = blocksPower.filter(b => b.loudness >= absGateThreshold);
  
  if (absGatedBlocks.length === 0) return -Infinity;

  // 5. Gating Stage 2: Relative threshold (-10 dB below average of absolute-gated blocks)
  let sumPowerAbsGated = 0;
  for (const block of absGatedBlocks) {
    sumPowerAbsGated += block.powerSum;
  }
  const avgPowerAbsGated = sumPowerAbsGated / absGatedBlocks.length;
  const relGateThreshold = -0.691 + 10 * Math.log10(avgPowerAbsGated) - 10.0;

  // Filter blocks above relative gate threshold
  const finalGatedBlocks = absGatedBlocks.filter(b => b.loudness >= relGateThreshold);

  if (finalGatedBlocks.length === 0) {
    // Fallback if no blocks pass relative threshold
    const avgLoudness = -0.691 + 10 * Math.log10(avgPowerAbsGated);
    return isNaN(avgLoudness) ? -Infinity : avgLoudness;
  }

  // 6. Final average calculation
  let finalPowerSum = 0;
  for (const block of finalGatedBlocks) {
    finalPowerSum += block.powerSum;
  }
  
  const finalIntegratedLoudness = -0.691 + 10 * Math.log10(finalPowerSum / finalGatedBlocks.length);
  return isNaN(finalIntegratedLoudness) ? -Infinity : finalIntegratedLoudness;
}

/**
 * Calculates Loudness Range (LRA) according to EBU Tech 3342.
 * Measures variance of short-term loudness (3-second window, overlapping 2-second or 1-second stride).
 */
export function calculateLoudnessRange(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  
  // 1. Apply K-Weighting
  const filteredChannels = [];
  for (let c = 0; c < numChannels; c++) {
    filteredChannels.push(applyKWeighting(audioBuffer.getChannelData(c), sampleRate));
  }

  // 2. Define short-term blocks (3-second window, 1-second stride)
  const windowSize = Math.round(3.0 * sampleRate);
  const strideSize = Math.round(1.0 * sampleRate);
  const bufferLength = audioBuffer.length;
  
  const shortTermLoudnessList = [];
  const channelWeights = Array(numChannels).fill(1.0);

  for (let offset = 0; offset + windowSize <= bufferLength; offset += strideSize) {
    let weightedPowerSum = 0;
    
    for (let c = 0; c < numChannels; c++) {
      const data = filteredChannels[c];
      let sumSquare = 0;
      for (let i = offset; i < offset + windowSize; i++) {
        sumSquare += data[i] * data[i];
      }
      weightedPowerSum += channelWeights[c] * (sumSquare / windowSize);
    }
    
    const loudness = -0.691 + (weightedPowerSum > 0 ? 10 * Math.log10(weightedPowerSum) : -100);
    shortTermLoudnessList.push(loudness);
  }

  if (shortTermLoudnessList.length < 5) return 0; // Too short for LRA

  // 3. Absolute gate (-70 LUFS)
  let activeST = shortTermLoudnessList.filter(l => l >= -70.0);
  if (activeST.length === 0) return 0;

  // 4. Relative gate (-20 dB below average absolute-gated blocks)
  let sumPower = 0;
  for (const l of activeST) {
    sumPower += Math.pow(10, (l + 0.691) / 10);
  }
  const avgPower = sumPower / activeST.length;
  const relThreshold = -0.691 + 10 * Math.log10(avgPower) - 20.0;

  // Filter ST blocks above relative threshold
  const finalST = activeST.filter(l => l >= relThreshold);
  if (finalST.length < 2) return 0;

  // 5. Order list to calculate percentiles (10% and 95%)
  finalST.sort((a, b) => a - b);
  
  const idx10 = Math.floor(finalST.length * 0.10);
  const idx95 = Math.floor(finalST.length * 0.95);
  
  const lra = finalST[idx95] - finalST[idx10];
  return isNaN(lra) ? 0 : lra;
}

/**
 * Estimates True Peak by upsampling the audio buffer 4 times via Web Audio Offline Context interpolation.
 * Standard ITU BS.1770 recommends 4x oversampling to detect inter-sample clipping.
 */
export function estimateTruePeak(audioBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const numChannels = audioBuffer.numberOfChannels;
      const originalSampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;
      
      // Target upsampled rate: 4x the original rate
      const upsampleRate = originalSampleRate * 4;
      const totalFrames = Math.round(duration * upsampleRate);
      
      const OfflineCtxClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const offlineCtx = new OfflineCtxClass(numChannels, totalFrames, upsampleRate);
      
      // Create source buffer
      const bufferSource = offlineCtx.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(offlineCtx.destination);
      bufferSource.start(0);
      
      offlineCtx.startRendering().then((renderedBuffer) => {
        let maxPeak = 0;
        
        for (let c = 0; c < numChannels; c++) {
          const channelData = renderedBuffer.getChannelData(c);
          const len = channelData.length;
          
          for (let i = 0; i < len; i++) {
            const absVal = Math.abs(channelData[i]);
            if (absVal > maxPeak) {
              maxPeak = absVal;
            }
          }
        }
        
        const peakDBTP = maxPeak > 0 ? 20 * Math.log10(maxPeak) : -100;
        resolve(peakDBTP);
      }).catch((err) => {
        // Fallback to sample peak if rendering fails
        console.error("Upsampling failed, falling back to sample peak:", err);
        let maxPeak = 0;
        for (let c = 0; c < numChannels; c++) {
          const data = audioBuffer.getChannelData(c);
          for (let i = 0; i < data.length; i++) {
            const absVal = Math.abs(data[i]);
            if (absVal > maxPeak) maxPeak = absVal;
          }
        }
        resolve(maxPeak > 0 ? 20 * Math.log10(maxPeak) : -100);
      });
    } catch (e) {
      reject(e);
    }
  });
}
