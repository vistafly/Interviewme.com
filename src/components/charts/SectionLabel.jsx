import { tokens } from '../../styles/tokens';

export default function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: tokens.color.textSecondary,
        marginBottom: 12,
        marginTop: 24,
      }}
    >
      {children}
    </div>
  );
}
