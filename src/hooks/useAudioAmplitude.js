import { useRef, useCallback } from 'react';
import { createMicAnalyser } from '../lib/audioAnalyser';

/**
 * Hook that manages a mic audio analyser lifecycle.
 * Exposes amplitudeRef (read from rAF, never causes re-render).
 *
 * The pump keeps running as long as the analyser is alive,
 * and self-recovers if a frame is missed.
 */
export function useAudioAmplitude() {
  const amplitudeRef = useRef(0);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const pumpingRef = useRef(false);

  const pump = useCallback(() => {
    // Keep the loop alive as long as pumping is true
    if (!pumpingRef.current) return;

    if (analyserRef.current) {
      amplitudeRef.current = analyserRef.current.getAmplitude();
    }
    // Always reschedule — the loop only stops when pumpingRef is set false
    rafRef.current = requestAnimationFrame(pump);
  }, []);

  const startAnalyser = useCallback(async (existingStream) => {
    if (analyserRef.current) return;

    const analyser = await createMicAnalyser(existingStream);
    analyserRef.current = analyser;

    // Start pump if not already running
    if (!pumpingRef.current) {
      pumpingRef.current = true;
      rafRef.current = requestAnimationFrame(pump);
    }
  }, [pump]);

  const stopAnalyser = useCallback(() => {
    // Stop the pump loop
    pumpingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.destroy();
      analyserRef.current = null;
    }
    amplitudeRef.current = 0;
  }, []);

  return { amplitudeRef, startAnalyser, stopAnalyser };
}
