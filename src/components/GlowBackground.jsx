import { tokens } from '../styles/tokens';

export default function GlowBackground({ top = '0%', color = tokens.color.accent }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top,
        transform: 'translateX(-50%)',
        width: 700,
        height: 700,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: 0.07,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
