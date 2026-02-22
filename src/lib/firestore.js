import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { loadHistory } from './storage';

function sessionsRef(uid) {
  return collection(db, 'users', uid, 'sessions');
}

export async function loadFirestoreHistory(uid) {
  try {
    const q = query(sessionsRef(uid), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch {
    return [];
  }
}

export async function saveFirestoreSession(uid, sessionData) {
  try {
    await addDoc(sessionsRef(uid), sessionData);
  } catch {
    // silently fail — localStorage fallback still works
  }
}

export async function migrateLocalToFirestore(uid) {
  const flag = `migrated_${uid}`;
  if (localStorage.getItem(flag)) return;

  const local = loadHistory();
  if (local.length === 0) {
    localStorage.setItem(flag, '1');
    return;
  }

  try {
    const ref = sessionsRef(uid);
    await Promise.all(local.map((session) => addDoc(ref, session)));
    localStorage.setItem(flag, '1');
  } catch {
    // retry next sign-in
  }
}
