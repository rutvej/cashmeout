import { create } from 'zustand';
import { generateRandomSeedString } from './prng.js';
import { generateCharacter } from './characterGenerator.js';
import { generateInitialGoals } from './goalsGenerator.js';

export const useGameStore = create((set, get) => ({
  // Active screen state: 'landing' | 'spawn_reveal' | 'goal_setup' | 'financial_setup' | 'main_game' | 'scorecard'
  currentScreen: 'landing',

  // Config state from Landing screen
  config: {
    seed: generateRandomSeedString(),
    cityTier: 'tier1',
    careerField: 'science',
  },

  // Generated character state
  character: null,

  // Generated goals roadmap
  goals: [],

  // Actions
  setConfig: (partialConfig) =>
    set((state) => ({
      config: { ...state.config, ...partialConfig },
    })),

  randomizeSeed: () =>
    set((state) => ({
      config: { ...state.config, seed: generateRandomSeedString() },
    })),

  generateAndSetCharacter: () => {
    const { config } = get();
    const character = generateCharacter(config.seed, config.cityTier, config.careerField);
    const goals = generateInitialGoals(character);
    set({
      character,
      goals,
      currentScreen: 'spawn_reveal',
    });
  },

  updateGoal: (goalId, updates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)),
    })),

  setGoals: (goals) => set({ goals }),

  navigateTo: (screen) => set({ currentScreen: screen }),

  resetGame: () =>
    set({
      currentScreen: 'landing',
      config: {
        seed: generateRandomSeedString(),
        cityTier: 'tier1',
        careerField: 'science',
      },
      character: null,
      goals: [],
    }),
}));
