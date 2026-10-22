import { create } from 'zustand';
import { generateRandomSeedString } from './prng.js';

export const useGameStore = create((set) => ({
  // Active screen state
  currentScreen: 'landing', // 'landing' | 'spawn_reveal' | 'goal_setup' | 'financial_setup' | 'main_game' | 'scorecard'

  // Initial config state
  config: {
    seed: generateRandomSeedString(),
    cityTier: 'tier1', // 'tier1' | 'tier2' | 'tier3'
    careerField: 'science', // 'science' | 'commerce' | 'arts'
  },

  // Actions
  setConfig: (partialConfig) =>
    set((state) => ({
      config: { ...state.config, ...partialConfig },
    })),

  randomizeSeed: () =>
    set((state) => ({
      config: { ...state.config, seed: generateRandomSeedString() },
    })),

  navigateTo: (screen) => set({ currentScreen: screen }),

  // Reset all state to defaults
  resetGame: () =>
    set({
      currentScreen: 'landing',
      config: {
        seed: generateRandomSeedString(),
        cityTier: 'tier1',
        careerField: 'science',
      },
    }),
}));
