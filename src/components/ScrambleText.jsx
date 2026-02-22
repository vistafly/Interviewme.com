import { useEffect, useRef } from 'react';

/**
 * One letter changes at a time, left to right.
 * Uses simple setInterval — no rAF cascades, no DOM manipulation.
 * Pure textContent updates for zero layout thrash.
 */
export default function ScrambleText({
  words = [],
  interval = 2500,
  charDelay = 80,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (words.length === 0) return;

    let wordIndex = 0;
    let chars = Array.from(words[0]);
    let stepping = false;
    let paused = false;
    let pauseUntil = 0;
    let pos = 0;
    let target = [];

    if (ref.current) ref.current.textContent = chars.join('');

    const id = setInterval(() => {
      if (!ref.current) return;

      // Hold the completed name for `interval` ms before starting next
      if (paused) {
        if (Date.now() < pauseUntil) return;
        paused = false;
      }

      if (!stepping) {
        wordIndex = (wordIndex + 1) % words.length;
        target = Array.from(words[wordIndex]);
        pos = 0;
        stepping = true;
      }

      // Skip positions that already match
      while (pos < target.length && pos < chars.length && chars[pos] === target[pos]) {
        pos++;
      }

      if (pos < target.length) {
        if (pos < chars.length) {
          chars[pos] = target[pos];
        } else {
          chars.push(target[pos]);
        }
        pos++;
        ref.current.textContent = chars.join('');
      }

      if (pos >= target.length) {
        chars.length = target.length;
        ref.current.textContent = chars.join('');
        stepping = false;
        paused = true;
        pauseUntil = Date.now() + interval;
      }
    }, charDelay);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span ref={ref} />;
}
