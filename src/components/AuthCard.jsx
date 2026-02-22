import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useAuth } from '../contexts/AuthContext';

const SNAPPY = [0.16, 1, 0.3, 1];

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 13,
  fontFamily: tokens.font.body,
  color: 'rgba(255,255,255,0.85)',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: tokens.radius.full,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, background 0.2s',
  letterSpacing: 0.2,
};

const btnStyle = {
  width: '100%',
  padding: '10px 0',
  fontSize: 13,
  fontWeight: 400,
  fontFamily: tokens.font.body,
  color: 'rgba(255,255,255,0.7)',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: tokens.radius.full,
  cursor: 'pointer',
  letterSpacing: 0.3,
  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
};

export default function AuthCard({ open, onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState('main');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setMode('main');
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      handleClose();
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please enter your name.');
          setBusy(false);
          return;
        }
        await signUpWithEmail(name.trim(), email, password);
      } else {
        await signInWithEmail(email, password);
      }
      handleClose();
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'Email already in use. Try signing in.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-not-found': 'No account with that email.',
        'auth/wrong-password': 'Incorrect password.',
      };
      setError(msg[err.code] || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const hoverIn = (e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
    e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
  };
  const hoverOut = (e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: SNAPPY }}
          style={{
            position: 'fixed',
            top: 64,
            right: 24,
            zIndex: 300,
            width: 300,
            maxWidth: 'calc(100vw - 48px)',
            padding: 28,
            background: 'rgba(8,8,10,0.35)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: tokens.radius.xl,
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.02), 0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              padding: 4,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          >
            <X size={14} />
          </button>

          {mode === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p
                style={{
                  fontFamily: tokens.font.body,
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.6)',
                  margin: '0 0 6px',
                  letterSpacing: 0.3,
                }}
              >
                Sign in to save your progress
              </p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={busy}
                style={btnStyle}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Continue with Google
                </span>
              </button>

              {/* Email */}
              <button
                onClick={() => setMode('signin')}
                style={btnStyle}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Mail size={14} strokeWidth={1.5} />
                  Continue with email
                </span>
              </button>

              {/* Guest */}
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: 12,
                  fontFamily: tokens.font.body,
                  cursor: 'pointer',
                  padding: '6px 0 0',
                  letterSpacing: 0.5,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                Continue as guest
              </button>
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <form
              onSubmit={handleEmailSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <p
                style={{
                  fontFamily: tokens.font.body,
                  fontSize: 14,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.6)',
                  margin: '0 0 4px',
                  letterSpacing: 0.3,
                }}
              >
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </p>

              {mode === 'signup' && (
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                autoFocus={mode === 'signin'}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
                minLength={6}
              />

              {error && (
                <p
                  style={{
                    fontFamily: tokens.font.body,
                    fontSize: 11,
                    color: 'rgba(255,82,82,0.8)',
                    margin: 0,
                    letterSpacing: 0.2,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{
                  ...btnStyle,
                  color: 'rgba(255,255,255,0.85)',
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                {busy
                  ? 'Please wait...'
                  : mode === 'signup'
                    ? 'Create account'
                    : 'Sign in'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'signup' ? 'signin' : 'signup');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 11,
                    fontFamily: tokens.font.body,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  {mode === 'signup' ? 'Sign in instead' : 'Create account'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('main');
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: 11,
                    fontFamily: tokens.font.body,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
