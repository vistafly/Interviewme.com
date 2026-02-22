import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useInterviewSetup } from '../hooks/useInterviewSetup';
import { useAuth } from '../contexts/AuthContext';
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import DarkVeil from '../components/DarkVeil';
import Hyperspeed from '../components/Hyperspeed';
import LoadingDots from '../components/LoadingDots';
import RotatingText from '../components/RotatingText';
import UserMenu from '../components/UserMenu';

const HYPERSPEED_PRESET = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};

export default function SetupPage({ onBack, onReady }) {
  const { user } = useAuth();
  const {
    jobDescription,
    setJobDescription,
    companyName,
    setCompanyName,
    generating,
    error,
    progress,
    generate,
    canGenerate,
  } = useInterviewSetup();

  const effectOptions = useMemo(() => HYPERSPEED_PRESET, []);

  const handleGenerate = async () => {
    const result = await generate();
    if (result?.questions) {
      onReady(result.questions, companyName);
    }
  };

  const jdWordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  return (
    <div className="page-enter" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {!generating && (
        <>
          {/* DarkVeil canvas — full viewport, dimmed behind content */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              opacity: 0.45,
              animation: 'fadeIn 1.6s ease both',
            }}
          >
            <DarkVeil speed={0.5} />
          </div>
          {/* Edge fade — keeps center visible, darkens periphery */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(ellipse 80% 65% at 50% 40%, transparent 0%, rgba(8,8,10,0.5) 60%, rgba(8,8,10,0.92) 100%)',
            }}
          />
        </>
      )}

      {/* Full-viewport Hyperspeed background when generating */}
      {generating && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            animation: progress >= 100
              ? 'fadeIn 0.8s ease both, warpBurst 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              : 'fadeIn 0.8s ease both',
            transformOrigin: 'center 60%',
          }}
        >
          <Hyperspeed effectOptions={effectOptions} />
        </div>
      )}

      {/* Cinematic vignette overlay — depth + readability */}
      {generating && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, rgba(8,8,10,0.4) 60%, rgba(8,8,10,0.85) 100%),
              linear-gradient(to top, rgba(8,8,10,0.7) 0%, transparent 30%)
            `,
            animation: 'fadeIn 1.2s ease both',
          }}
        />
      )}

      {/* Ultra-thin progress line at bottom */}
      {generating && progress < 100 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              background: 'linear-gradient(90deg, #c89aff, #7ddfff, #3ee8b5)',
              transform: `scaleX(${Math.min(progress / 100, 1)})`,
              transformOrigin: 'left',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 0 12px rgba(125, 223, 255, 0.4), 0 0 30px rgba(200, 154, 255, 0.2)',
            }}
          />
        </div>
      )}

      <NavBar
        left={
          !generating ? (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: tokens.color.textSecondary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                transition: `color 0.2s ${tokens.ease.snappy}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = tokens.color.text)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = tokens.color.textSecondary)
              }
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : null
        }
        right={user ? <UserMenu /> : null}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 520,
          margin: '0 auto',
          padding: '120px 24px 80px',
        }}
      >
        {!generating ? (
          /* --- Form State --- */
          <div
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: tokens.radius.xl,
              padding: '36px 32px 32px',
              animation: 'fadeUp 0.7s var(--ease-snappy) both',
            }}
          >
            <h1
              style={{
                fontFamily: tokens.font.body,
                fontSize: 'clamp(28px, 4vw, 38px)',
                fontWeight: 300,
                letterSpacing: -0.5,
                lineHeight: 1.3,
                color: '#fff',
                marginBottom: 10,
                textAlign: 'center',
                animation: 'fadeUp 0.8s var(--ease-snappy) both',
              }}
            >
              Set up your interview
            </h1>

            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: 32,
                animation: 'fadeUp 0.8s var(--ease-snappy) 0.1s both',
              }}
            >
              Paste a job description · tailored mock interview
            </p>

            {/* Company Name */}
            <div
              style={{
                marginBottom: 20,
                animation: 'fadeUp 0.7s var(--ease-snappy) 0.15s both',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: tokens.color.textSecondary,
                  marginBottom: 8,
                }}
              >
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Stripe, Airbnb"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 15,
                  background: 'rgba(17, 17, 20, 0.6)',
                  border: `1px solid ${tokens.color.borderLight}`,
                  borderRadius: tokens.radius.md,
                  color: tokens.color.text,
                  outline: 'none',
                  transition: `border-color 0.2s ${tokens.ease.snappy}`,
                }}
              />
            </div>

            {/* Job Description */}
            <div
              style={{
                marginBottom: 24,
                animation: 'fadeUp 0.7s var(--ease-snappy) 0.2s both',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  color: tokens.color.textSecondary,
                  marginBottom: 8,
                }}
              >
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                style={{
                  width: '100%',
                  minHeight: 180,
                  padding: '12px 16px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  background: 'rgba(17, 17, 20, 0.6)',
                  border: `1px solid ${tokens.color.borderLight}`,
                  borderRadius: tokens.radius.md,
                  color: tokens.color.text,
                  outline: 'none',
                  resize: 'vertical',
                  transition: `border-color 0.2s ${tokens.ease.snappy}`,
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  color: jdWordCount >= 50
                    ? tokens.color.accent
                    : jdWordCount > 0
                      ? tokens.color.warning
                      : tokens.color.textMuted,
                  marginTop: 6,
                  textAlign: 'right',
                  transition: 'color 0.2s ease',
                }}
              >
                {jdWordCount} / 50 words minimum
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  fontSize: 13,
                  color: tokens.color.error,
                  marginBottom: 16,
                }}
              >
                {error}
              </p>
            )}

            {/* Generate Button */}
            <div
              style={{ animation: 'fadeUp 0.7s var(--ease-snappy) 0.25s both' }}
            >
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={!canGenerate}
                style={{ width: '100%', padding: '14px 24px', fontSize: 15 }}
              >
                Generate Interview
              </Button>
            </div>

            {/* Info */}
            <p
              style={{
                fontSize: 12,
                color: tokens.color.textMuted,
                textAlign: 'center',
                marginTop: 16,
                animation: 'fadeUp 0.7s var(--ease-snappy) 0.3s both',
              }}
            >
              AI will generate 8 tailored questions based on the role.
            </p>
          </div>
        ) : (
          /* --- Generating State: text overlaid on Hyperspeed --- */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: 'calc(100vh - 200px)',
            }}
          >
            {/* Title — stagger 1 */}
            <h2
              style={{
                fontFamily: tokens.font.body,
                fontSize: 28,
                fontWeight: 300,
                color: '#fff',
                marginBottom: 12,
                textShadow:
                  '0 0 40px rgba(200, 154, 255, 0.3), 0 0 80px rgba(125, 223, 255, 0.15), 0 2px 20px rgba(0,0,0,0.8)',
                animation: 'fadeUp 0.9s var(--ease-snappy) 0.3s both',
              }}
            >
              {progress >= 100 ? (
                <span
                  style={{
                    color: tokens.color.accent,
                    filter:
                      'brightness(1.3) drop-shadow(0 0 12px rgba(62, 232, 181, 0.7)) drop-shadow(0 0 40px rgba(62, 232, 181, 0.35))',
                    transition: 'filter 0.6s ease, color 0.6s ease',
                  }}
                >
                  You're ready.
                </span>
              ) : (
                <RotatingText
                  phrases={[
                    'Reading between the lines',
                    'Mapping role expectations',
                    'Tailoring to the brief',
                    'Sharpening the questions',
                  ]}
                  interval={4000}
                  startDelay={0}
                  stagger={0.025}
                />
              )}
            </h2>

            {/* Subtitle — stagger 2 */}
            <p
              style={{
                fontSize: 14,
                textShadow:
                  '0 0 20px rgba(200, 154, 255, 0.2), 0 2px 16px rgba(0,0,0,0.8)',
                transition: 'color 0.6s ease, filter 0.6s ease, text-shadow 0.6s ease',
                color: progress >= 100
                  ? tokens.color.accent
                  : tokens.color.textSecondary,
                filter: progress >= 100
                  ? 'brightness(1.2) drop-shadow(0 0 10px rgba(62, 232, 181, 0.5))'
                  : 'none',
                animation: 'fadeUp 0.9s var(--ease-snappy) 0.5s both',
              }}
            >
              {progress >= 100 ? (
                'Entering your session now'
              ) : (
                <>
                  Building for{' '}
                  <strong style={{ color: tokens.color.text }}>{companyName}</strong>
                </>
              )}
            </p>

            {/* Loading dots — stagger 3 */}
            <div
              style={{
                marginTop: 24,
                animation: 'fadeUp 0.9s var(--ease-snappy) 0.7s both',
              }}
            >
              <LoadingDots success={progress >= 100} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
