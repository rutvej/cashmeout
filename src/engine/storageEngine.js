/**
 * Browser DB Single-Game Persistence Storage Engine (Phase 11)
 *
 * Implements lightweight IndexedDB persistence with automatic fallback to localStorage
 * and in-memory storage for environments where browser storage APIs are unavailable.
 *
 * Database: "cashmeout_db" (Version 1)
 * Store: "game_session"
 * Key: "active_session"
 * Fallback localStorage Key: "cashmeout_active_session"
 */

export const DB_NAME = 'cashmeout_db';
export const DB_VERSION = 1;
export const STORE_NAME = 'game_session';
export const ACTIVE_SESSION_KEY = 'active_session';
export const LOCAL_STORAGE_KEY = 'cashmeout_active_session';

// In-memory fallback for non-browser or test runner environments
const memoryStorage = new Map();

/**
 * Safely resolves IndexedDB implementation
 */
function getIndexedDB() {
  if (typeof window !== 'undefined' && window.indexedDB) {
    return window.indexedDB;
  }
  if (typeof globalThis !== 'undefined' && globalThis.indexedDB) {
    return globalThis.indexedDB;
  }
  if (typeof indexedDB !== 'undefined') {
    return indexedDB;
  }
  return null;
}

/**
 * Safely resolves localStorage implementation
 */
function getLocalStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch (_) {
    // localStorage may throw security exceptions in sandboxed contexts
  }
  return null;
}

/**
 * Opens or upgrades the IndexedDB database
 */
function openDB() {
  const idb = getIndexedDB();
  if (!idb) {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }

  return new Promise((resolve, reject) => {
    try {
      const request = idb.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Saves the active game session with schema version and timestamp
 *
 * @param {Object} sessionPayload - The full game session state
 * @returns {Promise<Object>} The saved session payload
 */
export async function saveActiveGameSession(sessionPayload) {
  if (!sessionPayload) return null;

  const payload = {
    ...sessionPayload,
    version: sessionPayload.version || 1,
    lastSavedAt: new Date().toISOString(),
    status: sessionPayload.status || 'in_progress',
  };

  // 1. Try IndexedDB
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload, ACTIVE_SESSION_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();

    // Mirror to localStorage as a redundant backup when available
    try {
      const ls = getLocalStorage();
      if (ls) {
        ls.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (_) {}

    return payload;
  } catch (idbErr) {
    // 2. Fallback to localStorage
    try {
      const ls = getLocalStorage();
      if (ls) {
        ls.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
        return payload;
      }
    } catch (_) {}

    // 3. Fallback to in-memory store
    memoryStorage.set(ACTIVE_SESSION_KEY, payload);
    return payload;
  }
}

/**
 * Loads the active game session from IndexedDB (or fallback storage)
 *
 * @returns {Promise<Object|null>} The parsed session payload or null
 */
export async function loadActiveGameSession() {
  let session = null;

  // 1. Try IndexedDB
  try {
    const db = await openDB();
    session = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ACTIVE_SESSION_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (_) {
    session = null;
  }

  // 2. Fallback to localStorage
  if (!session) {
    try {
      const ls = getLocalStorage();
      if (ls) {
        const raw = ls.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          session = JSON.parse(raw);
        }
      }
    } catch (_) {
      session = null;
    }
  }

  // 3. Fallback to memory
  if (!session) {
    session = memoryStorage.get(ACTIVE_SESSION_KEY) || null;
  }

  if (session && typeof session === 'object' && session.character) {
    return session;
  }

  return null;
}

/**
 * Clears the active game session from all storages
 *
 * @returns {Promise<boolean>} True when successfully cleared
 */
export async function clearActiveGameSession() {
  // Clear IndexedDB
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(ACTIVE_SESSION_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch (_) {}

  // Clear localStorage
  try {
    const ls = getLocalStorage();
    if (ls) {
      ls.removeItem(LOCAL_STORAGE_KEY);
    }
  } catch (_) {}

  // Clear in-memory
  memoryStorage.delete(ACTIVE_SESSION_KEY);

  return true;
}

/**
 * Checks whether an active, resumable session exists
 *
 * @returns {Promise<boolean>} True if an in-progress session exists
 */
export async function hasActiveGameSession() {
  try {
    const session = await loadActiveGameSession();
    return Boolean(
      session &&
      session.status === 'in_progress' &&
      session.character &&
      session.simulation
    );
  } catch (_) {
    return false;
  }
}
