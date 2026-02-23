// --- Text-to-Speech ---
export function speakText(text, lang = 'en-US') {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.lang = lang;

    // Pick a voice — prefer Google voices
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith(lang.split('-')[0]) && v.name.includes('Google')
    );
    const fallback = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
    if (preferred) utterance.voice = preferred;
    else if (fallback) utterance.voice = fallback;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    // 15-second safety timeout
    const timeout = setTimeout(() => {
      window.speechSynthesis.cancel();
      resolve();
    }, 15000);

    utterance.onend = () => {
      clearTimeout(timeout);
      resolve();
    };
    utterance.onerror = () => {
      clearTimeout(timeout);
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

// --- Speech Recognition ---
export function createSpeechRecognition(lang, callbacks) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRec) {
    return { start: () => {}, stop: () => {}, isSupported: false };
  }

  const recognition = new SpeechRec();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = lang;

  let fullText = '';
  let recording = false;
  let abortCount = 0;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      fullText += finalTranscript + ' ';
      abortCount = 0; // Reset abort counter on successful result
    }

    callbacks.onResult?.({
      finalTranscript,
      interimTranscript,
      fullText: fullText + interimTranscript,
    });
  };

  recognition.onerror = (event) => {
    if (event.error === 'aborted') {
      abortCount++;
    } else if (event.error === 'not-allowed') {
      callbacks.onError?.('Microphone access denied. Switching to text mode.');
      recording = false;
      return;
    } else if (event.error === 'network') {
      callbacks.onError?.('Network error with speech recognition.');
    } else if (event.error === 'no-speech') {
      // Ignore — will auto-restart
    }
  };

  recognition.onend = () => {
    if (recording && abortCount < 3) {
      // Restart off the critical path to avoid main-thread stalls.
      // Use requestIdleCallback (falls back to setTimeout 150ms) so the
      // browser can finish any pending layout/paint before we restart.
      const restart = () => {
        if (!recording) return;
        try { recognition.start(); } catch { /* already running */ }
      };
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(restart, { timeout: 200 });
      } else {
        setTimeout(restart, 150);
      }
    } else if (abortCount >= 3) {
      callbacks.onError?.('Speech recognition failed. Switching to text mode.');
      callbacks.onEnd?.();
    } else {
      callbacks.onEnd?.();
    }
  };

  return {
    start() {
      fullText = '';
      recording = true;
      abortCount = 0;
      try {
        recognition.start();
      } catch {
        // Already running
      }
    },
    stop() {
      recording = false;
      try {
        recognition.stop();
      } catch {
        // Not running
      }
    },
    isSupported: true,
  };
}

// --- Mic Permission Check (non-prompting) ---
export async function checkMicPermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'unavailable';
  }
  try {
    // Use the Permissions API to check state without triggering a browser prompt.
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    // Permissions API not supported — return unknown rather than prompting
    return 'unknown';
  }
}
