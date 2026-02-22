import { tokens } from '../styles/tokens';

const baseStyle = {
  fontFamily: tokens.font.body,
  fontSize: 14,
  borderRadius: tokens.radius.full,
  padding: '10px 24px',
  cursor: 'pointer',
  transition: `all 0.2s ${tokens.ease.snappy}`,
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  lineHeight: 1,
};

const variants = {
  primary: {
    background: tokens.color.text,
    color: tokens.color.bg,
    fontWeight: 600,
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.5)',
    border: `1px solid ${tokens.color.borderLight}`,
    fontWeight: 500,
  },
  stop: {
    background: 'rgba(255,82,82,0.08)',
    color: tokens.color.error,
    border: `1px solid rgba(255,82,82,0.15)`,
    fontWeight: 500,
  },
};

export default function Button({
  variant = 'primary',
  children,
  disabled,
  onClick,
  style,
  ...rest
}) {
  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...(disabled ? { opacity: 0.25, pointerEvents: 'none' } : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        } else {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        if (variant !== 'primary') {
          e.currentTarget.style.borderColor = variantStyle.border
            ? variantStyle.border.split(' ').pop()
            : '';
          e.currentTarget.style.color = variantStyle.color;
        }
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = '';
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
