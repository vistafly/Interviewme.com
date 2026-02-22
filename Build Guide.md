# VoicePrep — Complete Build Guide for Claude Code

## What This Is

A step-by-step build guide that Claude Code can execute to create VoicePrep from scratch — a premium, voice-first mock interview web application where users paste a job description and company name, and AI generates a tailored mock interview with voice interaction and real-time grading.

---

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or pnpm available
- An Anthropic API key (for the AI interview generation feature — the app calls Claude's API from the browser)

---

## React Bits Component Integration

This project uses components from **React Bits** (https://reactbits.dev) — an open-source library of 110+ animated, interactive React components including text animations, backgrounds, UI elements, and effects.

### How this works:

The user (Ron) will be providing React Bits components to elevate the design. **Claude Code must ASK the user for components at specific integration points rather than building everything from scratch.**

### When to ask:

At each phase below, there are `[ASK FOR COMPONENT]` markers. When you reach one, **stop and ask the user** which React Bits component they want to use. Describe what you need (e.g. "I need a text animation for the hero headline — do you have a React Bits component you'd like to use here?") and wait for them to provide the code or component name.

### React Bits install methods:

```bash
# Via shadcn CLI
npx shadcn@latest add "https://reactbits.dev/r/ComponentName-JS-CSS"

# Via jsrepo CLI
npx jsrepo add https://reactbits.dev/content/TextAnimations/SplitText

# Or: user will paste the component source directly
```

### Component categories from React Bits that are relevant to this project:

**Text Animations** (for headings, grade reveals, question display):
- SplitText, BlurText, GradientText, ShinyText, DecryptedText, GlitchText, CountUp, RotatingText, TrueFocus, TextPressure, ASCIIText, VariableProximity

**Animations/Effects** (for transitions, orb effects, micro-interactions):
- BlobCursor, SplashCursor, Magnet, Noise, PixelTransition, Crosshair, GooeyNav

**Backgrounds** (for page atmosphere):
- Aurora, Beams, Particles, Hyperspeed, Iridescence, LiquidChrome, LetterGlitch, Squares, GridDistortion, ShaderGradient, Orb

**Components** (for UI elements):
- AnimatedList, Dock, InfiniteScroll, Masonry, PixelCard, SpotlightCard, TiltedScroll, Stack, Lanyard, StickyNote, CodeComparison

### Integration points (Claude Code should ask at each):

1. **Landing page hero headline** → ask for text animation component (SplitText, BlurText, GradientText, etc.)
2. **Landing page background** → ask for background component (Aurora, Particles, Iridescence, etc.)
3. **Page transitions** → ask for transition/animation component (PixelTransition, etc.)
4. **Grade reveal animation** → ask for text animation (CountUp, DecryptedText, etc.)
5. **Button/card hover effects** → ask for interactive component (SpotlightCard, Magnet, etc.)
6. **Session history list** → ask for list component (AnimatedList, etc.)
7. **Interview room atmosphere** → ask for background/effect (Noise, Aurora, Orb, etc.)
8. **Question text display** → ask for text animation (TrueFocus, VariableProximity, etc.)
9. **Any other UI element** where an animated component would elevate the experience

### Rules for Claude Code:

- **DO NOT** build custom animations for things React Bits already provides (text reveals, backgrounds, card effects, cursor effects)
- **DO** build custom components for domain-specific things React Bits doesn't cover (VoiceOrb, speech recognition, grading engine)
- **ALWAYS** ask before picking a React Bits component — the user wants to choose
- **PREFER** the JS-CSS variant unless the user specifies Tailwind
- When the user provides a component, integrate it and make sure its props/styling match the design system (colors, fonts, spacing from tokens.js)
- Some React Bits components may need dependencies like `framer-motion`, `gsap`, or `three.js` — install them when needed

---

## Phase 0: Project Scaffold

```bash
# Create the project
npm create vite@latest voiceprep -- --template react
cd voiceprep

# Install dependencies
npm install

# Install additional packages
npm install lucide-react

# Create folder structure
mkdir -p src/components src/hooks src/lib src/pages src/styles

# Remove boilerplate
rm src/App.css src/index.css
```

---

## Phase 1: Design System & Global Styles

### File: `src/styles/global.css`

Create the global stylesheet. This is the foundation of the entire visual identity.

**Design direction:** Luxury editorial meets recording studio. Near-black background, warm white text, teal accent. NOT generic dark mode — atmospheric and textured.

```
Typography:
- Display: "Instrument Serif" (Google Fonts) — elegant, editorial
- Body: "DM Sans" (Google Fonts) — clean, professional
- NEVER use Inter, Roboto, or system fonts for display

Colors:
- Background: #08080a (near-black with slight warmth)
- Surface: #111114 (cards, panels)
- Elevated: #1a1a1f (hover states)
- Text primary: #e8e4dd (warm white, NOT pure white)
- Text secondary: rgba(255,255,255,0.35)
- Text muted: rgba(255,255,255,0.15)
- Accent: #3ee8b5 (teal — calm, premium, not "AI blue/purple")
- Accent secondary: #5eaaff (soft blue for gradients)
- Success: #3ee8b5
- Warning: #f0c654
- Error: #ff5252
- Borders: rgba(255,255,255,0.04) to rgba(255,255,255,0.08)

Spacing scale:
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120

Border radii:
- Small: 8px, Medium: 12px, Large: 16px, XL: 20px, Full: 99px (pills)

Transitions:
- Default: cubic-bezier(0.16, 1, 0.3, 1) — snappy with overshoot
- Smooth: cubic-bezier(0.65, 0, 0.35, 1)

Key CSS features to include:
- Noise texture overlay (SVG feTurbulence, opacity 0.02) on body for depth
- Custom scrollbar (4px, near-invisible)
- Selection color using accent
- Font smoothing (antialiased)
- Keyframe animations: fadeUp, fadeIn, slideIn, pulse, gentleFloat, progressGlow
- Staggered animation delay utility classes (.delay-1 through .delay-5)
```

### File: `src/styles/tokens.js`

Export design tokens as a JS object for use in styled components or inline styles:

```javascript
export const tokens = {
  color: {
    bg: '#08080a',
    surface: '#111114',
    elevated: '#1a1a1f',
    text: '#e8e4dd',
    textSecondary: 'rgba(255,255,255,0.35)',
    textMuted: 'rgba(255,255,255,0.15)',
    accent: '#3ee8b5',
    accentBlue: '#5eaaff',
    warning: '#f0c654',
    error: '#ff5252',
    border: 'rgba(255,255,255,0.04)',
    borderLight: 'rgba(255,255,255,0.08)',
  },
  font: {
    display: "'Instrument Serif', serif",
    body: "'DM Sans', sans-serif",
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 99 },
  ease: {
    snappy: 'cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
};

export function gradeColor(grade) {
  const map = { A:'#3ee8b5','B+':'#3ee8b5',B:'#5eaaff','C+':'#f0c654',C:'#f0c654',D:'#ff7e6b',F:'#ff5252' };
  return map[grade] || '#666';
}
```

---

## Phase 2: Core Components

### File: `src/components/VoiceOrb.jsx`

The centerpiece visual element. A canvas-based animated orb that represents the AI interviewer.

**Technical requirements:**
- Uses `<canvas>` with `requestAnimationFrame` for 60fps rendering
- Handles device pixel ratio for sharp rendering on retina displays
- Props: `state` (idle | listening | speaking | processing), `amplitude` (0-1), `size` (px)
- Smoothly interpolates amplitude changes (don't chase every frame — use exponential smoothing)

**Visual layers (painted back to front):**

1. **Outer atmospheric rings** (4 rings) — Very faint radial gradients emanating from center. Each ring is progressively larger and more transparent. These create the "glow" effect.

2. **Dynamic wobble ring** (only visible when NOT idle) — A single circle path that wobbles based on amplitude. Use `sin(angle * 3 + time)` and `sin(angle * 5 + time)` for organic distortion. Draw with thin stroke (1.5px), semi-transparent.

3. **Core orb** — A radial gradient circle. Slightly offset highlight (top-left) for a 3D glass effect. Size pulses gently when idle ("breathing"), reacts to amplitude when active.

4. **Glass highlight** — Small radial gradient in the upper-left of the core for a specular reflection look.

5. **Center dot** — Tiny circle in the dead center. Size subtly varies with state.

**Color mapping by state:**
- idle: white/neutral (very subtle)
- listening: teal `160,232,181`
- speaking: blue `94,170,255`
- processing: gold `240,198,84`

**Animation behavior:**
- idle: Slow sinusoidal breathing (~0.8Hz), very subtle scale 1.0-1.03
- speaking: Faster pulse (~1.4Hz), amplitude drives scale and glow intensity
- listening: Amplitude-reactive scaling (up to 1.12x), glow flares with voice input
- processing: Gentle rotation-like shimmer

### File: `src/components/NoiseOverlay.jsx`

A fixed-position full-screen div with an SVG noise texture. Opacity ~0.02. Pure visual — no interaction.

### File: `src/components/GlowBackground.jsx`

Reusable ambient glow component. Props: `top`, `color`. Renders a large (700px+) radial gradient circle positioned absolutely. Used on every page for atmospheric depth.

### File: `src/components/NavBar.jsx`

Minimal top navigation bar.
- Fixed position, glassmorphism background (rgba(8,8,10,0.65) + backdrop-filter: blur(24px))
- Very subtle bottom border
- Height: 52px
- Props: `left` (React node), `center` (React node), `right` (React node)

### File: `src/components/Button.jsx`

Reusable button with variants:
- `primary`: Warm white bg (#e8e4dd), dark text, pill shape (border-radius: 99px). Hover: subtle translateY(-1px) + shadow. Active: scale(0.98).
- `ghost`: Transparent bg, subtle border, muted text. Hover: brighter border + text.
- `stop`: Red-tinted for "Done Speaking" action. Subtle red bg + red border.
- All variants: DM Sans font, 600 weight for primary, 500 for others.

### File: `src/components/SettingsPanel.jsx`

Dropdown panel anchored to top-right of the interview nav.
- Fixed position, dark glass background, rounded corners (14px), subtle shadow
- Contains: Language toggle (EN/ES), Input mode toggle (Voice/Text)
- Each toggle is a pair of small chip-buttons with active state highlighting
- Props: `lang`, `setLang`, `textMode`, `setTextMode`, `onClose`

---

## Phase 3: Library / Utilities

### File: `src/lib/api.js`

AI interview generation via Anthropic API.

```javascript
export async function generateInterview(jobDescription, companyName) {
  // System prompt instructs Claude to generate exactly 8 interview questions
  // tailored to the specific role and company.
  //
  // Each question must include:
  //   q: string    — the interview question
  //   tip: string  — coaching advice for the candidate
  //   keys: string[] — 5-6 key phrases that indicate a strong answer
  //
  // Question mix: 1 opener, 2 behavioral, 2 technical/skill,
  //               1 why-this-company, 1 situational, 1 closing
  //
  // Response format: {"questions": [...]}
  // JSON only, no markdown wrapping

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Company: ${companyName}\n\nJob Description:\n${jobDescription}` }],
    }),
  });

  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
```

**Important:** The Anthropic API is called directly from the browser. No API key is passed in the headers — this is handled by the Anthropic proxy when running inside Claude artifacts. If deploying standalone, you'll need a backend proxy or edge function to add the API key server-side.

### File: `src/lib/grading.js`

Grading engine for evaluating spoken/typed answers.

```javascript
export function gradeAnswer(transcript, keys, timeUsed) {
  // Input: transcript (string), keys (string[]), timeUsed (seconds)
  // Output: { pct, grade, hits, total } or null

  // Algorithm:
  // 1. Check which key phrases appear in the lowercase transcript
  // 2. Base score = (hits / total) * 80 (max 80% from keyword coverage alone)
  // 3. Engagement bonus: +10 if 150+ words, +6 if 80+, +3 if 40+
  // 4. Brevity bonus: +5 if under 90s AND 30+ words
  // 5. Word count floor: if < 15 words, cap at 25%
  // 6. Clamp to 0-100
  // 7. Map to letter grade: A (93+), B+ (87+), B (80+), C+ (73+), C (65+), D (55+), F

  // Return { pct, grade, hits (array of matched keys), total (number of keys) }
}

export function gradeColor(grade) {
  // Returns hex color for grade display
  // A/B+ → #3ee8b5 (teal), B → #5eaaff (blue), C+/C → #f0c654 (gold),
  // D → #ff7e6b (orange), F → #ff5252 (red)
}
```

### File: `src/lib/speech.js`

Speech recognition and text-to-speech utilities.

```javascript
// --- Text-to-Speech ---
export function speakText(text, lang = 'en-US') {
  // Returns a Promise that resolves when speech finishes
  // Uses SpeechSynthesisUtterance
  // Rate: 0.92, Pitch: 1
  // Prefers Google voices, falls back to any matching language voice
  // 15-second timeout safety net
  // Exposes a cancel method via window.speechSynthesis.cancel()
}

// --- Speech Recognition ---
export function createSpeechRecognition(lang, callbacks) {
  // callbacks: { onResult, onError, onEnd }
  // Returns a SpeechRecognition instance configured for:
  //   continuous: true, interimResults: true, maxAlternatives: 1
  //
  // onResult receives { finalTranscript, interimTranscript, fullText }
  // onError handles: not-allowed (→ text fallback), network, no-speech, aborted
  // onEnd auto-restarts if still recording (with 400ms delay, max 3 abort retries)
  //
  // Returns: { start(), stop(), isSupported: boolean }
}

// --- Mic Permission Check ---
export async function checkMicPermission() {
  // Calls getUserMedia to trigger permission prompt
  // Immediately releases the stream
  // Returns: 'granted' | 'denied' | 'unavailable'
}
```

### File: `src/lib/storage.js`

Session history persistence.

```javascript
const STORAGE_KEY = 'voiceprep_history';

export function loadHistory() {
  // Returns array of session objects from localStorage
  // Gracefully handles parse errors → returns []
}

export function saveHistory(history) {
  // Saves array to localStorage
  // Keeps only the last 20 sessions to prevent bloat
}

// Session object shape:
// {
//   date: ISO string,
//   company: string,
//   pct: number (0-100),
//   grade: string,
//   count: number (questions answered),
//   total: number (total questions),
// }
```

---

## Phase 4: Custom Hooks

### File: `src/hooks/useInterview.js`

The core state machine for the interview flow. This is the most complex piece.

```javascript
export function useInterview() {
  // STATE:
  // phase: 'pre' | 'speaking' | 'listening' | 'feedback' | 'review'
  // questions: array from API
  // questionIndex: current question number
  // seconds: countdown timer (starts at 120)
  // transcript: live speech-to-text output
  // gradeData: result from gradeAnswer()
  // sessionData: array of per-question results
  // textMode: boolean (voice vs text fallback)
  // textInput: string (for text mode)
  // orbState: 'idle' | 'listening' | 'speaking' | 'processing'
  // orbAmplitude: 0-1 float

  // ACTIONS:
  // startQuestion() → transitions pre→speaking→listening
  //   1. Set phase to 'speaking', orbState to 'speaking'
  //   2. Speak question via TTS (animate orb amplitude during speech)
  //   3. When TTS finishes: set phase to 'listening', start 120s timer
  //   4. If voice mode: start speech recognition after 400ms delay
  //   5. If text mode: just show textarea
  //
  // finishAnswer() → transitions listening→feedback
  //   1. Stop timer, stop recording, cancel TTS
  //   2. Calculate time used
  //   3. Get transcript (from speech rec OR text input)
  //   4. Run gradeAnswer()
  //   5. Store result in sessionData
  //   6. Set phase to 'feedback'
  //
  // nextQuestion() → transitions feedback→pre (next question)
  // retryQuestion() → transitions feedback→pre (same question)
  // showReview() → transitions to 'review'
  //
  // COMPUTED:
  // answeredCount, allAnswered, currentQuestion, wordCount

  // CLEANUP: clear timers and stop recording on unmount

  return {
    phase, questions, questionIndex, seconds, transcript,
    gradeData, sessionData, textMode, textInput, setTextInput,
    orbState, orbAmplitude, errorMsg,
    startQuestion, finishAnswer, nextQuestion, retryQuestion, showReview,
    answeredCount, allAnswered, currentQuestion, wordCount,
    setTextMode,
  };
}
```

### File: `src/hooks/useInterviewSetup.js`

Handles the setup page state and API call.

```javascript
export function useInterviewSetup() {
  // STATE: jobDescription, companyName, generating, error, progress

  // generate() → calls generateInterview API
  //   1. Start progress animation (fake increments up to ~92%)
  //   2. Call generateInterview(jd, company)
  //   3. On success: jump progress to 100%, return questions after 600ms delay
  //   4. On error: set error message, stop loading
  //
  // canGenerate: boolean (both fields non-empty)

  return {
    jobDescription, setJobDescription,
    companyName, setCompanyName,
    generating, error, progress,
    generate, canGenerate,
  };
}
```

---

## Phase 5: Pages

### File: `src/pages/LandingPage.jsx`

The entry point. Sets the tone for the entire product.

**Layout (centered, max-width 560px):**
1. VoiceOrb (idle state, size 110) — centered, with staggered fade-up animation
2. Eyebrow text: "AI-Powered Mock Interviews" — uppercase, accent color, letter-spaced. `[ASK FOR COMPONENT: ShinyText or similar for the eyebrow?]`
3. Headline: "Paste the job." / "Practice the interview." — Instrument Serif, large (clamp 34-52px). Second line uses gradient text (teal→blue). `[ASK FOR COMPONENT: text animation for headline reveal — SplitText, BlurText, GradientText, etc.?]`
4. Subtitle: One sentence describing the product — muted text, max-width 420px
5. CTA button: "Get Started" — primary button, larger padding
6. Features row: Three items with geometric icons (◎ ◈ ◇) and labels — separated by top border, very subtle
7. Session history (if any): "Recent Sessions" header, list of past sessions showing grade (Instrument Serif, colored), company name, date, question count, score. `[ASK FOR COMPONENT: AnimatedList for history items?]`

`[ASK FOR COMPONENT: background effect for landing page — Aurora, Particles, Iridescence, Hyperspeed, etc.?]`

**Animations:** Every element uses staggered fadeUp with increasing delay classes.

**Navigation:** NavBar with logo ("◉ VoicePrep") on left, session count on right.

### File: `src/pages/SetupPage.jsx`

Where the user configures their interview.

**Layout (centered, max-width 520px):**
1. Heading: "Set up your interview" — Instrument Serif, 32px
2. Subtitle: Brief instruction text — muted
3. Company Name field: text input, clean styling, uppercase label
4. Job Description field: large textarea (min-height 180px), word count display below
5. Error message (if any): red text
6. Generate button: primary, disabled state when fields empty (opacity 0.25)
7. Info note: small text explaining AI generation

**Generating state (replaces form):**
1. VoiceOrb (processing state, size 100, floating animation)
2. "Preparing your interview" — Instrument Serif heading. `[ASK FOR COMPONENT: text animation for this heading — DecryptedText, BlurText?]`
3. "Analyzing the role at **{company}**..." — subtitle
4. Progress bar: thin (3px), gradient fill (teal→blue), animated glow

**Navigation:** NavBar with back button ("← Back") on left.

### File: `src/pages/InterviewPage.jsx`

The core experience. Must feel immersive and focused.

`[ASK FOR COMPONENT: subtle background effect for interview room — Noise, Aurora (dimmed), Squares, etc.?]`

**Navigation:** Compact (height 48px). Back/End button left, company name centered (small, muted), question counter + settings button right.

**Layout (centered, max-width 520px, flex column):**

All states share the VoiceOrb at the top (size 150).

**State: `pre`**
- Small uppercase label: "Ready when you are" (first question) or "Question N"
- Question text: Instrument Serif, 22px. `[ASK FOR COMPONENT: text animation for question reveal — SplitText, TrueFocus, VariableProximity?]`
- Primary button: "Begin Interview" or "Start Question"
- Warning text if voice unsupported

**State: `speaking`**
- Question text: Instrument Serif, 22px
- Status text: "Interviewer is speaking..." with pulse animation
- Skip button: ghost style

**State: `listening`**
- Question text: slightly smaller (18px)
- Error message (if mic issues)
- Content area: either textarea (text mode) or transcript box (voice mode) or "Listening..." placeholder
- HUD row: timer (color shifts green→yellow→red), separator dot, word count. `[ASK FOR COMPONENT: CountUp for the timer or word count?]`
- Stop button: red-tinted "Done" button

**State: `feedback`**
- Grade display: Instrument Serif, 60px, colored by grade. `[ASK FOR COMPONENT: grade reveal animation — CountUp, DecryptedText, or custom?]`
- Percentage below grade
- Rubric list: checkmarks (teal) for hits, circles (very muted) for misses, with key phrase text
- Coaching tip panel (shown on demand): accent-tinted background, small uppercase "Coaching" label
- Stats pills: word count, time used
- Action buttons: Show Tip (ghost), Retry (ghost), Next (primary) OR See Review (primary). `[ASK FOR COMPONENT: button hover/click effects — Magnet, SpotlightCard for cards?]`
- Early review link: subtle underlined text if multiple questions answered

**State: `review`**
- Large grade: Instrument Serif, 76px, colored. `[ASK FOR COMPONENT: grade reveal animation]`
- Average percentage
- Stats pills: questions answered, total words, total time
- Question breakdown: list with grade, question text, and percentage per row. `[ASK FOR COMPONENT: AnimatedList for the breakdown?]`
- Action buttons: "Save & Exit" (primary), "Restart" (ghost)

---

## Phase 6: App Shell & Routing

### File: `src/App.jsx`

Simple page-level state management (no router library needed).

```javascript
function App() {
  const [page, setPage] = useState('landing'); // landing | setup | interview
  const [questions, setQuestions] = useState([]);
  const [companyName, setCompanyName] = useState('');

  // Page transitions:
  // landing → setup (user clicks "Get Started")
  // setup → interview (generation complete, pass questions + company)
  // interview → landing (session ends, save to history)
  // setup → landing (user clicks back)
  // interview → landing (user exits early)

  return (
    <>
      {page === 'landing' && <LandingPage onStart={() => setPage('setup')} />}
      {page === 'setup' && <SetupPage onBack={() => setPage('landing')} onReady={(qs, co) => { setQuestions(qs); setCompanyName(co); setPage('interview'); }} />}
      {page === 'interview' && <InterviewPage questions={questions} company={companyName} onExit={() => setPage('landing')} />}
    </>
  );
}
```

### File: `src/main.jsx`

Standard Vite entry point. Import global CSS, render App.

### File: `index.html`

Add Google Fonts link in `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

---

## Phase 7: Polish & Details

### Animations to implement:

1. **Page transitions:** Each page fades up on mount (fadeUp, 0.7s, snappy easing)
2. **Staggered reveals:** On landing page, each element has increasing animation-delay
3. **Orb amplitude:** During "speaking" phase, fake amplitude with `setInterval` (0.2 + Math.random() * 0.4, every 120ms). During "listening", similar pattern tied to recording state.
4. **Grade reveal:** Grade letter uses fadeUp animation on feedback state
5. **Timer color transition:** Smooth color change via inline style, not class toggle
6. **Progress bar:** Gradient fill + animated glow (box-shadow pulse)
7. **Button hover:** translateY(-1px) + subtle shadow for primary, border brightness for ghost
8. **Button press:** scale(0.98) active state

### Responsive behavior:

- All page content: max-width container, centered, with 24px horizontal padding
- Orb scales down on smaller viewports (150 → 120 on mobile)
- Textarea inputs: full-width
- Button groups: flex-wrap for small screens
- Nav: reduce padding on mobile (20px → 16px)
- Font sizes: use clamp() for hero heading

### Error handling:

- API call failure: Show error message, allow retry
- Mic permission denied: Auto-switch to text mode, show brief message
- Speech recognition drops: Auto-restart (max 3 retries), then fall back to text
- Browser doesn't support Web Speech API: Start in text mode
- No TTS voices available: Skip speaking phase, go directly to listening
- Empty transcript submitted: Grade normally (will get low score due to word count floor)

---

## Phase 8: Deployment

### For Vercel:
```bash
npm run build
# Deploy the `dist` folder
# Add environment variable if using a backend proxy for API key
```

### For GitHub Pages:
```javascript
// vite.config.js
export default defineConfig({
  base: '/voiceprep/',
  plugins: [react()],
});
```

### Important deployment notes:
- **HTTPS required** for speech recognition (mic access)
- **API key handling:** In production, you need a backend proxy (Vercel serverless function, Cloudflare Worker, etc.) to inject the Anthropic API key. Never expose it in client code.
- **CORS:** The Anthropic API doesn't allow direct browser calls in production. Use a proxy.

---

## File Tree (Final)

```
voiceprep/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   ├── global.css
│   │   └── tokens.js
│   ├── components/
│   │   ├── VoiceOrb.jsx
│   │   ├── NoiseOverlay.jsx
│   │   ├── GlowBackground.jsx
│   │   ├── NavBar.jsx
│   │   ├── Button.jsx
│   │   └── SettingsPanel.jsx
│   ├── hooks/
│   │   ├── useInterview.js
│   │   └── useInterviewSetup.js
│   ├── lib/
│   │   ├── api.js
│   │   ├── grading.js
│   │   ├── speech.js
│   │   └── storage.js
│   └── pages/
│       ├── LandingPage.jsx
│       ├── SetupPage.jsx
│       └── InterviewPage.jsx
```

---

## Critical Reminders for Claude Code

1. **Do NOT use Inter, Roboto, Space Grotesk, or system fonts.** Use Instrument Serif + DM Sans only.
2. **Do NOT use purple/violet accents.** The accent is teal (#3ee8b5). That's it.
3. **Do NOT add unnecessary UI.** This is a voice-first product. The orb is the focal point. Everything else supports the conversation.
4. **Do NOT add a sidebar, footer nav, or dashboard layout.** Single centered column, generous whitespace.
5. **Do NOT use emoji in the UI.** Use geometric symbols (◉ ◎ ◈ ◇ ✓ ○) sparingly.
6. **The VoiceOrb MUST be canvas-based.** CSS animations cannot achieve the layered radial gradient + wobble ring effect smoothly.
7. **All animations must use transform/opacity only.** No layout-triggering properties.
8. **The grading keyword matching is case-insensitive substring matching.** Not regex, not fuzzy matching. Simple `toLowerCase().includes()`.
9. **Speech recognition auto-restarts on `onend` if still recording.** This is critical — Chrome's speech recognition stops after silence. The restart loop keeps it alive.
10. **Test in Chrome.** Speech recognition only works reliably in Chrome/Edge. Firefox and Safari have limited or no support.
