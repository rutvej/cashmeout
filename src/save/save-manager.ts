import { GameState } from '../types/game';
import { createInitialState } from '../data/initial-state';

export const SAVE_STORAGE_KEY = 'cashflow_state_save_v2';

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) {
      const fresh = createInitialState();
      saveGame(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.schemaVersion || parsed.schemaVersion < 1) {
      const fresh = createInitialState();
      saveGame(fresh);
      return fresh;
    }
    // Migrate: fill in missing fields added after initial release
    if (parsed.player.activeCourseId === undefined) {
      parsed.player.activeCourseId = null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse save file, creating new game', err);
    const fresh = createInitialState();
    saveGame(fresh);
    return fresh;
  }
}

export function saveGame(state: GameState): void {
  try {
    state.player.lastActiveTimestamp = Date.now();
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Save failed', err);
  }
}

export function exportSaveFile(state: GameState): void {
  saveGame(state);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cashflow-save-day${state.player.currentDay}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importSaveFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as GameState;
        if (!parsed.player || !parsed.market) {
          throw new Error('Invalid save structure');
        }
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(parsed));
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}

export function resetGame(): GameState {
  localStorage.removeItem(SAVE_STORAGE_KEY);
  const fresh = createInitialState();
  saveGame(fresh);
  return fresh;
}
