import { useEffect, useRef } from 'react';
import { tokens } from '../styles/tokens';

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: tokens.font.body,
        fontSize: 12,
        fontWeight: 500,
        padding: '5px 12px',
        borderRadius: tokens.radius.full,
        border: `1px solid ${active ? tokens.color.accent : tokens.color.borderLight}`,
        background: active ? 'rgba(62,232,181,0.1)' : 'transparent',
        color: active ? tokens.color.accent : tokens.color.textSecondary,
        cursor: 'pointer',
        transition: `all 0.2s ${tokens.ease.snappy}`,
      }}
    >
      {label}
    </button>
  );
}

export default function SettingsPanel({ lang, setLang, textMode, setTextMode, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 56,
        right: 20,
        zIndex: 200,
        background: 'rgba(17,17,20,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        minWidth: 180,
      }}
    >
      {/* Language */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: tokens.color.textSecondary,
            marginBottom: 8,
          }}
        >
          Language
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Chip label="EN" active={lang === 'en-US'} onClick={() => setLang('en-US')} />
          <Chip label="ES" active={lang === 'es-ES'} onClick={() => setLang('es-ES')} />
        </div>
      </div>

      {/* Input Mode */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: tokens.color.textSecondary,
            marginBottom: 8,
          }}
        >
          Input
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Chip label="Voice" active={!textMode} onClick={() => setTextMode(false)} />
          <Chip label="Text" active={textMode} onClick={() => setTextMode(true)} />
        </div>
      </div>
    </div>
  );
}
