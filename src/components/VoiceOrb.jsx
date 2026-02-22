import { useRef, useEffect } from 'react';

const STATE_COLORS = {
  idle: [255, 255, 255],
  listening: [160, 232, 181],
  speaking: [94, 170, 255],
  processing: [240, 198, 84],
};

export default function VoiceOrb({ state = 'idle', amplitude = 0, size = 150 }) {
  const canvasRef = useRef(null);
  const smoothAmp = useRef(0);
  const rafRef = useRef(null);
  const startTime = useRef(Date.now());
  const lastFrameTime = useRef(Date.now());

  // Bridge dynamic props into refs so the canvas is never torn down
  const stateRef = useRef(state);
  const amplitudeRef = useRef(amplitude);
  stateRef.current = state;
  amplitudeRef.current = amplitude;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    function draw() {
      const now = Date.now();
      const time = (now - startTime.current) / 1000;
      const dt = Math.min((now - lastFrameTime.current) * 0.001, 0.1);
      lastFrameTime.current = now;
      const curState = stateRef.current;
      const [r, g, b] = STATE_COLORS[curState] || STATE_COLORS.idle;

      // Delta-time-aware smooth amplitude interpolation
      const ampAlpha = 1 - Math.exp(-6 * dt);
      smoothAmp.current += (amplitudeRef.current - smoothAmp.current) * ampAlpha;
      const amp = smoothAmp.current;

      const cx = size / 2;
      const cy = size / 2;
      const baseRadius = size * 0.22;

      ctx.clearRect(0, 0, size, size);

      // --- Layer 1: Atmospheric rings ---
      for (let i = 0; i < 4; i++) {
        const ringRadius = baseRadius * (1.4 + i * 0.35);
        const alpha = 0.04 - i * 0.008;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, ringRadius);
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // --- Layer 2: Wobble ring (not visible when idle) ---
      if (curState !== 'idle') {
        ctx.beginPath();
        const wobblePoints = 64;
        for (let i = 0; i <= wobblePoints; i++) {
          const angle = (i / wobblePoints) * Math.PI * 2;
          const wobble =
            1 +
            amp *
              0.08 *
              (Math.sin(angle * 3 + time * 2) +
                Math.sin(angle * 5 + time * 2.6));
          const wr = baseRadius * 1.3 * wobble;
          const x = cx + Math.cos(angle) * wr;
          const y = cy + Math.sin(angle) * wr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${r},${g},${b},0.15)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // --- Layer 3: Core orb ---
      let scale = 1;
      if (curState === 'idle') {
        scale = 1 + 0.03 * Math.sin(time * 0.8 * Math.PI * 2);
      } else {
        scale = 1 + amp * 0.12;
      }
      const coreRadius = baseRadius * scale;
      const hlOffX = cx - coreRadius * 0.3;
      const hlOffY = cy - coreRadius * 0.3;
      const coreGrad = ctx.createRadialGradient(
        hlOffX,
        hlOffY,
        coreRadius * 0.1,
        cx,
        cy,
        coreRadius
      );
      coreGrad.addColorStop(0, `rgba(${Math.min(r + 60, 255)},${Math.min(g + 60, 255)},${Math.min(b + 60, 255)},0.35)`);
      coreGrad.addColorStop(0.6, `rgba(${r},${g},${b},0.2)`);
      coreGrad.addColorStop(1, `rgba(${r},${g},${b},0.05)`);
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // --- Layer 4: Glass highlight ---
      const glassGrad = ctx.createRadialGradient(
        cx - coreRadius * 0.25,
        cy - coreRadius * 0.25,
        0,
        cx - coreRadius * 0.25,
        cy - coreRadius * 0.25,
        coreRadius * 0.5
      );
      glassGrad.addColorStop(0, 'rgba(255,255,255,0.12)');
      glassGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = glassGrad;
      ctx.fill();

      // --- Layer 5: Center dot ---
      const dotRadius = curState === 'idle' ? 2.5 : 2.5 + amp * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${curState === 'idle' ? 0.3 : 0.5})`;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        display: 'block',
      }}
    />
  );
}
