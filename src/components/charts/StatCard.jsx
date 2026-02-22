import { tokens } from '../../styles/tokens';

export default function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '14px 8px',
        background: tokens.color.elevated,
        borderRadius: tokens.radius.md,
        border: `1px solid ${tokens.color.border}`,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: tokens.font.body,
          fontSize: 22,
          fontWeight: 300,
          color: color || tokens.color.text,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          color: tokens.color.textSecondary,
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
}
