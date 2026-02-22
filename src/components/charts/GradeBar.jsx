import { tokens } from '../../styles/tokens';
import { gradeColor } from '../../lib/grading';

export default function GradeBar({ grade, count, maxCount }) {
  const color = gradeColor(grade);
  const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color,
          minWidth: 24,
          textAlign: 'right',
        }}
      >
        {grade}
      </span>
      <div
        style={{
          flex: 1,
          height: 20,
          background: tokens.color.elevated,
          borderRadius: tokens.radius.sm,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${widthPct}%`,
            background: `${color}33`,
            borderLeft: count > 0 ? `3px solid ${color}` : 'none',
            borderRadius: tokens.radius.sm,
            transition: `width 0.5s ${tokens.ease.snappy}`,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 12,
          color: tokens.color.textSecondary,
          minWidth: 16,
          textAlign: 'right',
        }}
      >
        {count}
      </span>
    </div>
  );
}
