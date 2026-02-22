/**
 * Site-wide Performance Profiler
 *
 * Tracks Web Vitals (FCP, LCP, CLS, TTFB, INP, FID), long tasks, TBT,
 * memory trends, DOM, resources, frame rate, network info, navigation
 * timing breakdown, and slow resource identification.
 *
 * OFF by default. To enable, flip PROFILER_ENABLED to true below.
 * Automatically stripped from production builds via import.meta.env.DEV.
 */

// ⬇️ Flip this to true to enable the profiler in dev ⬇️
const PROFILER_ENABLED = false;

const active = import.meta.env.DEV && PROFILER_ENABLED;

export const setInterviewState = active ? _setInterviewState : () => {};
export const setTransitionState = active ? _setTransitionState : () => {};
export const initProfiler       = active ? _initProfiler       : () => {};
export const destroyProfiler    = active ? _destroyProfiler    : () => {};

// --- Everything below is DEV-only implementation ---

let initialized = false;

// --- Metrics ---
const vitals = { fcp: null, lcp: null, cls: 0, ttfb: null, fid: null, inp: null };
const longTasks = [];

// INP tracking — collect all interaction durations, report the worst
const interactions = [];

// Frame tracking via rAF (only during recording)
const frameSamples = [];
let recRafId = null;
let recPrev = -1;
let recStart = -1;
let recMaxMs = 0;
let recording = false;

// Memory samples during recording (sampled at ~1Hz)
const memorySamples = [];

// HUD state (updated via lightweight performance.now delta)
let hudInterval = null;
let hudLastTime = 0;
let hudFrames = 0;
let hudFps = 0;
let hudFrameMs = 0;
let hudMinFps = Infinity;
let cachedDomCount = 0;
let cachedGpu = '';
let domCountTimer = 0;

// Interview state (fed from useInterview hook)
let ivState = null;
// Amplitude history during recording for export
const ampSamples = [];
let ampPeak = 0;

// Transition state (fed from pages with hover/transition effects)
let trState = null;
let trCount = 0;
// Transition timing log — tracks enter/leave durations
const trLog = [];
let trLastEnterTime = 0;

// DOM refs
let debugEl = null;
let exportBtn = null;

// --- Observers ---
function initObservers() {
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        if (e.name === 'first-contentful-paint') vitals.fcp = Math.round(e.startTime);
    }).observe({ type: 'paint', buffered: true });
  } catch (_) {}

  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) vitals.lcp = Math.round(entries[entries.length - 1].startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (_) {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) vitals.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (_) {}

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        longTasks.push({ start: Math.round(e.startTime), duration: Math.round(e.duration) });
        if (longTasks.length > 100) longTasks.shift();
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch (_) {}

  // FID — First Input Delay
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length && vitals.fid === null) {
        vitals.fid = Math.round(entries[0].processingStart - entries[0].startTime);
      }
    }).observe({ type: 'first-input', buffered: true });
  } catch (_) {}

  // INP — Interaction to Next Paint (all event durations)
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.interactionId && e.interactionId > 0) {
          const delay = Math.round(e.duration);
          interactions.push({ type: e.name, delay, t: Math.round(e.startTime) });
          if (interactions.length > 500) interactions.shift();
          // INP = worst interaction (p98 approximation for high counts)
          if (vitals.inp === null || delay > vitals.inp) vitals.inp = delay;
        }
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch (_) {}

  try {
    const nav = performance.getEntriesByType('navigation');
    if (nav.length) vitals.ttfb = Math.round(nav[0].responseStart);
  } catch (_) {}
}

// --- Navigation timing breakdown (only called on export) ---
function getNavigationTiming() {
  try {
    const nav = performance.getEntriesByType('navigation');
    if (!nav.length) return null;
    const n = nav[0];
    return {
      redirect: Math.round(n.redirectEnd - n.redirectStart),
      dns: Math.round(n.domainLookupEnd - n.domainLookupStart),
      tcp: Math.round(n.connectEnd - n.connectStart),
      ssl: n.secureConnectionStart > 0 ? Math.round(n.connectEnd - n.secureConnectionStart) : 0,
      ttfb: Math.round(n.responseStart - n.requestStart),
      download: Math.round(n.responseEnd - n.responseStart),
      domParsing: Math.round(n.domInteractive - n.responseEnd),
      domContentLoaded: Math.round(n.domContentLoadedEventEnd - n.domContentLoadedEventStart),
      load: Math.round(n.loadEventEnd - n.loadEventStart),
      totalMs: Math.round(n.loadEventEnd - n.startTime),
    };
  } catch (_) { return null; }
}

// --- Total Blocking Time (sum of blocking portion of each long task) ---
function computeTBT() {
  let tbt = 0;
  for (const lt of longTasks) {
    if (lt.duration > 50) tbt += lt.duration - 50;
  }
  return tbt;
}

// --- Resource summary (only called on export) ---
function getResourceSummary() {
  try {
    const resources = performance.getEntriesByType('resource');
    const byType = {};
    let totalBytes = 0;
    for (const r of resources) {
      const ext = r.name.split('?')[0].split('.').pop().toLowerCase();
      const type = categorize(ext, r.initiatorType);
      if (!byType[type]) byType[type] = { count: 0, totalMs: 0, maxMs: 0 };
      const dur = Math.round(r.duration);
      byType[type].count++;
      byType[type].totalMs += dur;
      if (dur > byType[type].maxMs) byType[type].maxMs = dur;
      if (r.transferSize) totalBytes += r.transferSize;
    }
    return { byType, totalResources: resources.length, totalTransferredKB: Math.round(totalBytes / 1024) };
  } catch (_) { return null; }
}

// --- Slow resources (top 10 by duration) ---
function getSlowestResources() {
  try {
    const resources = performance.getEntriesByType('resource');
    return resources
      .map(r => ({
        name: r.name.split('/').pop().split('?')[0] || r.name.slice(-60),
        type: categorize(r.name.split('?')[0].split('.').pop().toLowerCase(), r.initiatorType),
        durationMs: Math.round(r.duration),
        sizeKB: r.transferSize ? Math.round(r.transferSize / 1024) : null,
        startMs: Math.round(r.startTime),
      }))
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 10);
  } catch (_) { return []; }
}

// --- Network info ---
function getNetworkInfo() {
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return null;
    return {
      effectiveType: conn.effectiveType || null,
      downlinkMbps: conn.downlink || null,
      rttMs: conn.rtt || null,
      saveData: conn.saveData || false,
    };
  } catch (_) { return null; }
}

function categorize(ext, init) {
  if (['js', 'mjs'].includes(ext) || init === 'script') return 'script';
  if (ext === 'css' || init === 'css') return 'style';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'ico'].includes(ext) || init === 'img') return 'image';
  if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) return 'font';
  return 'other';
}

// --- Memory ---
function getMemory() {
  const m = performance.memory;
  return m ? { usedMB: Math.round(m.usedJSHeapSize / 1048576), totalMB: Math.round(m.totalJSHeapSize / 1048576) } : null;
}

// --- Detect GPU (once) ---
function detectGPU() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return 'No WebGL';
    const info = gl.getParameter(gl.RENDERER) || 'Unknown';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return info;
  } catch (_) { return 'Unknown'; }
}

// --- INP computation (p98 of worst interactions) ---
function computeINP() {
  if (interactions.length === 0) return null;
  const sorted = interactions.map(i => i.delay).sort((a, b) => a - b);
  const idx = Math.min(Math.floor(sorted.length * 0.98), sorted.length - 1);
  return sorted[idx];
}

// --- HUD (setInterval, no rAF) ---
function updateHUD() {
  const now = performance.now();
  const dt = now - hudLastTime;
  if (dt > 0) {
    hudFps = Math.round((hudFrames / dt) * 1000) || hudFps;
    hudFrameMs = hudFrames > 0 ? (dt / hudFrames).toFixed(1) : hudFrameMs;
    if (hudFps > 0 && hudFps < hudMinFps) hudMinFps = hudFps;
  }
  hudFrames = 0;
  hudLastTime = now;

  // Update DOM count every 5s
  domCountTimer++;
  if (domCountTimer >= 5) {
    domCountTimer = 0;
    cachedDomCount = document.getElementsByTagName('*').length;
  }

  // Track amplitude peak
  if (ivState?.amplitude > ampPeak) ampPeak = ivState.amplitude;

  // Sample memory during recording (~1Hz)
  if (recording) {
    const mem = getMemory();
    if (mem) {
      memorySamples.push({ t: Math.round(performance.now() - recStart), ...mem });
    }
  }

  if (!debugEl) return;
  const mem = getMemory();
  const isSW = /swiftshader|llvmpipe|software|webkit webgl/i.test(cachedGpu);
  const tbt = computeTBT();
  const inpVal = computeINP();

  // Base system metrics
  let text =
    `${hudFps} FPS | ${hudFrameMs}ms | Min ${hudMinFps === Infinity ? '--' : hudMinFps}\n` +
    `${mem ? mem.usedMB + 'MB' : '--'} mem | ${cachedDomCount} DOM | TBT ${tbt}ms\n` +
    `FCP ${vitals.fcp ?? '--'} | LCP ${vitals.lcp ?? '--'} | CLS ${vitals.cls.toFixed(3)}\n` +
    `INP ${inpVal ?? '--'}ms | FID ${vitals.fid ?? '--'}ms\n` +
    `Jank: ${longTasks.length} | GPU: ${cachedGpu.slice(0, 28)}${isSW ? ' (SW)' : ''}`;

  // Interview metrics (only shown when interview is active)
  if (ivState) {
    const amp = ivState.amplitude?.toFixed(2) ?? '0.00';
    const peak = ampPeak.toFixed(2);
    const phase = ivState.phase ?? '--';
    const qi = ivState.questionIndex != null ? `Q${ivState.questionIndex + 1}` : '--';
    const wc = ivState.wordCount ?? 0;
    const mode = ivState.textMode ? 'TXT' : 'MIC';
    text += `\n--- Interview ---\n`;
    text += `${qi} | ${phase} | ${mode}\n`;
    text += `Amp: ${amp} | Peak: ${peak} | Words: ${wc}`;
  }

  // Transition metrics (shown when transition tracking is active)
  if (trState) {
    text += `\n--- Transitions ---\n`;
    text += `${trState.name}: ${trState.active ? 'ON' : 'off'} | Triggers: ${trCount}`;
    if (trState.filter) text += `\nFilter: ${trState.filter}`;
    if (trState.transform) text += `\nTransform: ${trState.transform}`;
  }

  if (recording) text += '\n[REC]';
  debugEl.textContent = text;
}

// Count frames via a lightweight rAF shim (always running but trivially cheap)
function countFrame() {
  hudFrames++;
  requestAnimationFrame(countFrame);
}

// --- Recording rAF (only during 10s export) ---
function recTick(t) {
  if (!recording) return;
  recRafId = requestAnimationFrame(recTick);

  if (recPrev < 0) { recPrev = t; return; }
  const ms = t - recPrev;
  if (ms < 1) return;
  recPrev = t;

  const elapsed = performance.now() - recStart;
  const sample = { t: Math.round(elapsed), fps: Math.round(1000 / ms), ms: +ms.toFixed(2) };

  // Include interview amplitude in frame samples during recording
  if (ivState) {
    sample.amp = +(ivState.amplitude?.toFixed(3) ?? 0);
    sample.phase = ivState.phase;
  }

  frameSamples.push(sample);
  if (ms > recMaxMs) recMaxMs = ms;

  // Sample amplitude at ~4Hz for the export
  if (ivState && (ampSamples.length === 0 || elapsed - ampSamples[ampSamples.length - 1].t > 250)) {
    ampSamples.push({ t: Math.round(elapsed), amp: +(ivState.amplitude?.toFixed(3) ?? 0) });
  }

  if (elapsed >= 10000) finishExport();
}

function startRecording() {
  frameSamples.length = 0;
  ampSamples.length = 0;
  memorySamples.length = 0;
  ampPeak = 0;
  recMaxMs = 0;
  recPrev = -1;
  recStart = performance.now();
  recording = true;
  recRafId = requestAnimationFrame(recTick);

  if (exportBtn) {
    exportBtn.textContent = 'Recording 10s...';
    exportBtn.style.borderColor = '#f00';
    exportBtn.style.color = '#f00';
  }
}

function finishExport() {
  recording = false;
  if (recRafId) cancelAnimationFrame(recRafId);

  const times = frameSamples.map(f => f.ms).sort((a, b) => a - b);
  const fpsList = frameSamples.map(f => f.fps);
  const len = times.length;
  const avg = len ? Math.round(fpsList.reduce((s, v) => s + v, 0) / len) : 0;

  // Frame budget analysis
  const BUDGET = 16.67;
  const overBudget = times.filter(t => t > BUDGET).length;
  const overBudgetPct = len ? +((overBudget / len) * 100).toFixed(1) : 0;
  const jankFrames = times.filter(t => t > 33.33).length; // > 2x budget = jank

  const inpVal = computeINP();
  const tbt = computeTBT();

  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    webVitals: {
      ttfb: vitals.ttfb,
      fcp: vitals.fcp,
      lcp: vitals.lcp,
      cls: +vitals.cls.toFixed(4),
      fid: vitals.fid,
      inp: inpVal,
    },
    framePerformance: {
      totalFrames: len,
      durationMs: len ? frameSamples[len - 1].t : 0,
      avgFps: avg,
      minFps: len ? Math.min(...fpsList) : 0,
      maxFrameMs: +recMaxMs.toFixed(2),
      p50ms: times[Math.floor(len * 0.5)] || 0,
      p95ms: times[Math.floor(len * 0.95)] || 0,
      p99ms: times[Math.floor(len * 0.99)] || 0,
      overBudgetFrames: overBudget,
      overBudgetPct,
      jankFrames,
    },
    totalBlockingTime: tbt,
    memory: getMemory(),
    memoryTrend: memorySamples.length > 1 ? {
      samples: memorySamples,
      startMB: memorySamples[0].usedMB,
      endMB: memorySamples[memorySamples.length - 1].usedMB,
      deltaMB: memorySamples[memorySamples.length - 1].usedMB - memorySamples[0].usedMB,
    } : null,
    dom: { nodeCount: document.getElementsByTagName('*').length },
    resources: getResourceSummary(),
    slowestResources: getSlowestResources(),
    longTasks: { count: longTasks.length, samples: longTasks.slice(-20) },
    interactions: {
      count: interactions.length,
      inp: inpVal,
      worst5: interactions.sort((a, b) => b.delay - a.delay).slice(0, 5),
    },
    navigation: getNavigationTiming(),
    network: getNetworkInfo(),
    gpu: cachedGpu,
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 },
    frames: frameSamples,
  };

  // Include transition metrics in export
  if (trState || trLog.length > 0) {
    report.transitions = {
      name: trState?.name || trLog[0]?.name || '--',
      active: trState?.active || false,
      triggerCount: trCount,
      filter: trState?.filter,
      transform: trState?.transform,
      log: trLog.slice(-20),
    };
  }

  // Include interview metrics in export if active
  if (ivState) {
    report.interview = {
      phase: ivState.phase,
      questionIndex: ivState.questionIndex,
      textMode: ivState.textMode,
      wordCount: ivState.wordCount,
      amplitudePeak: +ampPeak.toFixed(3),
      amplitudeSamples: ampSamples,
    };
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site-perf-log.json';
  a.click();
  URL.revokeObjectURL(url);

  if (exportBtn) {
    exportBtn.textContent = 'Export Perf Log';
    exportBtn.style.borderColor = '#0f0';
    exportBtn.style.color = '#0f0';
  }
}

// --- Implementation functions (referenced by conditional exports above) ---

function _setInterviewState(state) {
  ivState = state;
  if (!state) ampPeak = 0;
}

function _setTransitionState(state) {
  const now = performance.now();
  if (state && (!trState || !trState.active) && state.active) {
    trCount++;
    trLastEnterTime = now;
  }
  if (state && trState?.active && !state.active && trLastEnterTime > 0) {
    trLog.push({
      name: trState.name,
      enterMs: Math.round(trLastEnterTime),
      durationMs: Math.round(now - trLastEnterTime),
    });
    if (trLog.length > 50) trLog.shift();
  }
  trState = state;
}

function _initProfiler() {
  if (initialized) return;
  initialized = true;

  initObservers();
  cachedGpu = detectGPU();
  cachedDomCount = document.getElementsByTagName('*').length;
  hudLastTime = performance.now();

  // Debug HUD
  debugEl = document.createElement('div');
  debugEl.style.cssText =
    'position:fixed;bottom:8px;left:8px;z-index:99999;font:11px/1.4 monospace;' +
    'color:#0f0;background:rgba(0,0,0,0.8);padding:6px 10px;border-radius:6px;' +
    'pointer-events:none;white-space:pre';
  document.body.appendChild(debugEl);

  // Export button
  exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export Perf Log';
  exportBtn.style.cssText =
    'position:fixed;bottom:8px;left:230px;z-index:99999;font:11px monospace;' +
    'color:#0f0;background:rgba(0,0,0,0.8);padding:6px 12px;border-radius:6px;' +
    'border:1px solid #0f0;cursor:pointer';
  document.body.appendChild(exportBtn);
  exportBtn.addEventListener('click', startRecording);

  // Lightweight frame counter (single rAF, ~0.01ms overhead)
  requestAnimationFrame(countFrame);

  // HUD updates at 1Hz (no rAF cost)
  hudInterval = setInterval(updateHUD, 1000);
}

function _destroyProfiler() {
  if (hudInterval) clearInterval(hudInterval);
  if (recRafId) cancelAnimationFrame(recRafId);
  if (debugEl) debugEl.remove();
  if (exportBtn) exportBtn.remove();
  debugEl = null;
  exportBtn = null;
  ivState = null;
  initialized = false;
}
