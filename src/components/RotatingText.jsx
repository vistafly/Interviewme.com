import { useEffect, useMemo, useState } from 'react';
import './RotatingText.css';

export default function RotatingText({
  phrases = [],
  interval = 7000,
  startDelay = 3000,
  stagger = 0.03,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Split phrases into character arrays once
  const chars = useMemo(() => phrases.map((p) => Array.from(p)), [phrases]);

  useEffect(() => {
    if (phrases.length <= 1) return;

    const tid = setTimeout(() => {
      iid = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % phrases.length);
      }, interval);
    }, startDelay);

    let iid;
    return () => { clearTimeout(tid); clearInterval(iid); };
  }, [phrases.length, interval, startDelay]);

  return (
    <span className="rotating-text-wrapper">
      {phrases.map((phrase, i) => {
        const isActive = i === activeIndex;
        return (
          <span key={phrase} className={`rotating-text${isActive ? ' active' : ''}`}>
            {chars[i].map((char, j) => (
              <span
                key={j}
                className={char === ' ' ? 'char-space' : 'char'}
                style={{ transitionDelay: isActive ? `${j * stagger}s` : '0s' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}
