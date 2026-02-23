/**
 * Microphone audio analyser utility.
 * Pipes an audio stream through an AnalyserNode
 * to provide real-time RMS amplitude (0-1).
 *
 * @param {MediaStream} [existingStream] - Reuse a cached getUserMedia stream
 *   to avoid triggering a duplicate browser permission prompt.
 */
export async function createMicAnalyser(existingStream) {
  const stream = existingStream || await navigator.mediaDevices.getUserMedia({ audio: true });
  const ownsStream = !existingStream; // only stop tracks if we created them
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Chrome suspends AudioContext until a user gesture — resume it explicitly
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();

  analyser.fftSize = 128;                // smaller window → faster response
  analyser.smoothingTimeConstant = 0.3;   // reduced from 0.8 → less browser-side lag

  source.connect(analyser);
  // Do NOT connect to destination (no feedback loop)

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function getAmplitude() {
    analyser.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);

    // Soft noise gate with smooth knee (avoids hard cutoff jitter)
    const GATE_LO = 0.01;
    const GATE_HI = 0.04;
    const gate = rms < GATE_LO ? 0 : rms > GATE_HI ? 1
      : ((rms - GATE_LO) / (GATE_HI - GATE_LO)) ** 2; // smooth quadratic ramp
    const gated = rms * gate;

    return Math.min(gated * 2.2, 1.0);   // boosted gain (was 1.8) to compensate lower smoothing
  }

  function destroy() {
    source.disconnect();
    analyser.disconnect();
    // Only stop tracks if we created the stream ourselves;
    // a shared/cached stream is managed by micStream.js.
    if (ownsStream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    if (audioCtx.state !== 'closed') {
      audioCtx.close();
    }
  }

  return { getAmplitude, destroy };
}
