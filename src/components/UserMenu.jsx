import { useState, useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useAuth } from '../contexts/AuthContext';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  if (!user) return null;

  const initial = (user.displayName || user.email || '?')[0].toUpperCase();
  const photoURL = user.photoURL;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)',
          background: photoURL ? 'transparent' : 'rgba(62,232,181,0.15)',
          color: tokens.color.accent,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: tokens.font.body,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 0,
          transition: 'border-color 0.2s',
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            referrerPolicy="no-referrer"
          />
        ) : (
          initial
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 200,
            padding: 12,
            background: 'rgba(17,17,20,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: tokens.radius.md,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 400,
          }}
        >
          {/* User info */}
          <div style={{ marginBottom: 10 }}>
            {user.displayName && (
              <p
                style={{
                  fontFamily: tokens.font.body,
                  fontSize: 13,
                  fontWeight: 600,
                  color: tokens.color.text,
                  margin: 0,
                }}
              >
                {user.displayName}
              </p>
            )}
            <p
              style={{
                fontFamily: tokens.font.body,
                fontSize: 11,
                color: tokens.color.textSecondary,
                margin: user.displayName ? '2px 0 0' : 0,
                wordBreak: 'break-all',
              }}
            >
              {user.email}
            </p>
          </div>

          <div style={{ height: 1, background: tokens.color.border, margin: '0 0 8px' }} />

          {/* Sign out */}
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 8px',
              fontSize: 12,
              fontFamily: tokens.font.body,
              color: tokens.color.textSecondary,
              background: 'none',
              border: 'none',
              borderRadius: tokens.radius.sm,
              cursor: 'pointer',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = tokens.color.text;
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = tokens.color.textSecondary;
              e.currentTarget.style.background = 'none';
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
