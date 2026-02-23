/**
 * Singleton mic stream manager.
 * Requests getUserMedia once, caches the stream, and reuses it
 * for both the audio analyser and to pre-grant permission so
 * SpeechRecognition doesn't re-prompt the user.
 */

let cachedStream = null;
let pendingRequest = null;

/**
 * Request mic access and cache the stream.
 * If already granted, returns the cached stream instantly.
 * If a request is in flight, deduplicates by returning the same promise.
 */
export async function requestMicStream() {
  if (cachedStream && cachedStream.active) {
    return cachedStream;
  }

  // Deduplicate concurrent calls
  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      cachedStream = stream;
      pendingRequest = null;
      return stream;
    })
    .catch((err) => {
      pendingRequest = null;
      throw err;
    });

  return pendingRequest;
}

/**
 * Get the cached stream without triggering a new request.
 * Returns null if no stream has been acquired yet.
 */
export function getCachedMicStream() {
  if (cachedStream && cachedStream.active) {
    return cachedStream;
  }
  return null;
}

/**
 * Release the cached stream (stops all tracks).
 * Call this on unmount / session end.
 */
export function releaseMicStream() {
  if (cachedStream) {
    cachedStream.getTracks().forEach((t) => t.stop());
    cachedStream = null;
  }
  pendingRequest = null;
}

/**
 * Check mic permission state without triggering a prompt.
 * Falls back to 'unknown' if the Permissions API is not available.
 */
export async function getMicPermissionState() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unknown';
  }
}
