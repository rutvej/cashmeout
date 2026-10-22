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

  // Insurance policies
  insurance: {
    health: {
      id: 'health_insurance',
      name: 'Comprehensive Health Insurance',
      isPurchased: true,
      monthlyPremium: 800,
      sumInsured: 1000000,
      deductible: 5000,
      description: 'Protects emergency fund from sudden medical bills up to ₹10 Lakh.',
    },
    termLife: {
      id: 'term_life_insurance',
      name: 'Term Life Cover',
      isPurchased: false,
      monthlyPremium: 600,
      sumInsured: 5000000,
      deductible: 0,
      description: 'Protects dependants with ₹50 Lakh pure risk coverage.',
    },
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

  setGoalAllocation: (goalId, allocationUpdates) =>
    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...allocationUpdates } : g)),
    })),

  toggleInsurance: (type) =>
    set((state) => ({
      insurance: {
        ...state.insurance,
        [type]: {
          ...state.insurance[type],
          isPurchased: !state.insurance[type].isPurchased,
        },
      },
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
