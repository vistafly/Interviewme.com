import { loadFirestoreHistory, saveFirestoreSession } from './firestore';

const STORAGE_KEY = 'voiceprep_history';

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-20)));
  } catch {
    // Quota exceeded or unavailable — silently fail
  }
}

/** Async loader: Firestore for signed-in users, localStorage for guests */
export async function loadHistoryForUser(uid) {
  if (!uid) return loadHistory();
  return loadFirestoreHistory(uid);
}

/** Async saver: Firestore for signed-in users, localStorage for guests */
export async function saveSessionForUser(uid, sessionData) {
  if (!uid) {
    const history = loadHistory();
    history.push(sessionData);
    saveHistory(history);
    return;
  }
  await saveFirestoreSession(uid, sessionData);
}
