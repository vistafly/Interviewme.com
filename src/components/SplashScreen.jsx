import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Orb from './Orb';
import './SplashScreen.css';

const MIN_DISPLAY_MS = 2500;
const EXIT_DURATION_MS = 700;

export default function SplashScreen({ onComplete }) {
  const { loading: authLoading } = useAuth();
  const [phase, setPhase] = useState('enter'); // enter | idle | exit | done
  const breathRef = useRef(0);
  const mountTime = useRef(Date.now());
  const readyChecks = useRef({ fonts: false, auth: false, minTime: false, logo: false });
  const exitTriggered = useRef(false);

  // Synthetic breathing effect for the Orb
  useEffect(() => {
    let rafId;
    const breathe = (t) => {
      breathRef.current = 0.15 + 0.1 * Math.sin(t * 0.002) + 0.1 * Math.sin(t * 0.0013);
      rafId = requestAnimationFrame(breathe);
    };
    rafId = requestAnimationFrame(breathe);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Transition enter → idle after entrance animations settle
  useEffect(() => {
    const t = setTimeout(() => setPhase((p) => (p === 'enter' ? 'idle' : p)), 800);
    return () => clearTimeout(t);
  }, []);

  // Orchestrate exit when all readiness gates pass
  const tryExit = useCallback(() => {
    const c = readyChecks.current;
    if (c.fonts && c.auth && c.minTime && c.logo && !exitTriggered.current) {
      exitTriggered.current = true;
      setPhase('exit');
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, EXIT_DURATION_MS);
    }
  }, [onComplete]);

  // Gate: fonts loaded
  useEffect(() => {
    document.fonts.ready.then(() => {
      readyChecks.current.fonts = true;
      tryExit();
    });
  }, [tryExit]);

  // Gate: auth resolved
  useEffect(() => {
    if (!authLoading) {
      readyChecks.current.auth = true;
      tryExit();
    }
  }, [authLoading, tryExit]);

  // Gate: minimum display time
  useEffect(() => {
    const elapsed = Date.now() - mountTime.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const t = setTimeout(() => {
      readyChecks.current.minTime = true;
      tryExit();
    }, remaining);
    return () => clearTimeout(t);
  }, [tryExit]);

  // Gate: logo preloaded
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    const mark = () => {
      readyChecks.current.logo = true;
      tryExit();
    };
    img.onload = mark;
    img.onerror = mark; // don't block on logo failure
  }, [tryExit]);

  if (phase === 'done') return null;

  return (
    <div
      className={`splash-screen splash-screen--${phase}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#08080a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Orb — full viewport, breathing */}
      <div className="splash-orb" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Orb
          hue={0}
          hoverIntensity={0.26}
          rotateOnHover
          forceHoverState={false}
          ctaHover={false}
          backgroundColor="#08080a"
          amplitudeRef={breathRef}
        />
      </div>

      {/* Brand mark — positioned to match LandingPage exactly (top: 38%) */}
      <div
        className="splash-brand"
        style={{
          position: 'fixed',
          top: '38%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(14px, 2vw, 24px)',
          pointerEvents: 'none',
        }}
      >
        <img
          className="splash-logo"
          src="/logo.png"
          alt="InterviewMe"
          style={{
            height: 'clamp(44px, 6vw, 64px)',
            width: 'auto',
            objectFit: 'contain',
            filter:
              'drop-shadow(0 0 16px rgba(156,67,254,0.45)) drop-shadow(0 0 32px rgba(76,194,233,0.2))',
          }}
        />
        <span
          className="splash-title"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(24px, 3.5vw, 40px)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: 2,
            textShadow:
              '0 0 30px rgba(200,154,255,0.2), 0 0 60px rgba(125,223,255,0.1)',
            whiteSpace: 'nowrap',
          }}
        >
          Interview<span style={{ fontWeight: 500 }}>Me</span>
        </span>
      </div>

      {/* Minimal progress indicator — thin gradient line */}
      <div
        className="splash-progress"
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 'clamp(60px, 10vw, 120px)',
            height: 1,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <div
            className="splash-progress-fill"
            style={{
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(90deg, rgba(156,67,254,0.4), rgba(76,194,233,0.4))',
              transformOrigin: 'left',
            }}
          />
        </div>
      </div>
    </div>
  );
}
