import { GameState } from '../types/game';
import { createInitialState } from '../data/initial-state';

const STORAGE_KEY = 'cashflow_lifesim_save_v2';

export function saveGame(state: GameState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.warn('Failed to save game state to LocalStorage', err);
  }
}

export function loadGame(): GameState {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();
      const parsed = JSON.parse(raw) as GameState;
      if (!parsed.player || !parsed.resources) {
        return createInitialState();
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse save, returning fresh state', err);
  }
  return createInitialState();
}

export function resetGame(): GameState {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Error clearing storage', err);
  }
  return createInitialState();
}
