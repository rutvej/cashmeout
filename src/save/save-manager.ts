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
    if (parsed.player.onboardingComplete === undefined) {
      parsed.player.onboardingComplete = false;
    }
    if (parsed.player.startingAge === undefined) {
      parsed.player.startingAge = 22;
    }
    if (!parsed.player.careerHistory) {
      parsed.player.careerHistory = [
        {
          jobId: parsed.player.job.id,
          title: parsed.player.job.title,
          startDay: 1,
          endDay: null,
          salary: parsed.player.job.salaryPerCycle
        }
      ];
    }
    if (!parsed.player.behavioralCounters) {
      parsed.player.behavioralCounters = {
        impulseBuyCounter: 1.5,
        junkFoodCounter: 1.5,
        gymSkipCounter: 1.5,
        sleepDebtCounter: 1.5,
        cryptoFomoCounter: 1.0,
        lifestyleCreepCounter: 1.0,
        lateNightWorkCounter: 1.0
      };
    }
    if (!parsed.player.lifeGoals) {
      parsed.player.lifeGoals = {
        wealth: 'six-figure-net-worth',
        health: 'olympic-resilience',
        lifestyle: 'homeowner-pride'
      };
    }
    if (!parsed.player.lifeGoalStats) {
      parsed.player.lifeGoalStats = {
        burnoutEpisodes: 0,
        totalGymSessions: 0,
        totalDaysTracked: parsed.player.currentDay || 1
      };
    }
    if (!parsed.player.salaryDayPreferences) {
      parsed.player.salaryDayPreferences = {
        autoRunBlueprint: false,
        emergencyBufferAllocPct: 30,
        sipAllocPct: 30,
        debtPaydownAllocPct: 20,
        discretionaryAllocPct: 20,
        lastEvaluatedMonth: 0
      };
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
