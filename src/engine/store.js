import { create } from 'zustand';
import { generateRandomSeedString } from './prng.js';
import { generateCharacter } from './characterGenerator.js';
import { generateInitialGoals } from './goalsGenerator.js';
import { tickMonthlySimulation } from './simulationEngine.js';

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

  // Simulation state
  simulation: {
    currentMonthIndex: 0,
    currentAge: 23,
    currentMonthOfYear: 1,
    isPaused: true,
    gameSpeed: 1, // 1 | 2 | 5
    activeModal: null, // null | { type, ... }
    history: [],
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
      simulation: {
        currentMonthIndex: 0,
        currentAge: character.age,
        currentMonthOfYear: 1,
        isPaused: true,
        gameSpeed: 1,
        activeModal: null,
        history: [
          {
            month: 0,
            age: character.age,
            netWorth: character.liquidCash - (character.loans || []).reduce((s, l) => s + l.principalRemaining, 0),
            liquidCash: character.liquidCash,
            totalInvestments: 0,
            totalDebt: (character.loans || []).reduce((s, l) => s + l.principalRemaining, 0),
          },
        ],
      },
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

  // Simulation Controls
  play: () =>
    set((state) => ({
      simulation: { ...state.simulation, isPaused: false },
    })),

  pause: () =>
    set((state) => ({
      simulation: { ...state.simulation, isPaused: true },
    })),

  setSpeed: (gameSpeed) =>
    set((state) => ({
      simulation: { ...state.simulation, gameSpeed },
    })),

  tickMonth: () => {
    const currentState = get();
    const nextState = tickMonthlySimulation(currentState);
    set(nextState);
  },

  closeModal: () =>
    set((state) => ({
      simulation: { ...state.simulation, activeModal: null, isPaused: false },
    })),

  executeVacationSelection: (option) => {
    const amount = option === 'domestic' ? 50000 : 150000;
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === 'goal_vacation'
          ? { ...g, targetAmount: amount, selectedTierOption: option, currentAmount: 0 }
          : g
      ),
      simulation: { ...state.simulation, activeModal: null, isPaused: false },
    }));
  },

  prepayLoan: (loanId, amount) => {
    const { character } = get();
    const payAmount = Math.min(amount, character.liquidCash);
    if (payAmount <= 0) return;

    const updatedLoans = character.loans.map((l) => {
      if (l.id === loanId) {
        const nextPrincipal = Math.max(0, l.principalRemaining - payAmount);
        return {
          ...l,
          principalRemaining: nextPrincipal,
          tenureMonthsRemaining: nextPrincipal === 0 ? 0 : l.tenureMonthsRemaining,
        };
      }
      return l;
    }).filter((l) => l.principalRemaining > 0);

    set((state) => ({
      character: {
        ...state.character,
        liquidCash: state.character.liquidCash - payAmount,
        loans: updatedLoans,
      },
    }));
  },

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
      simulation: {
        currentMonthIndex: 0,
        currentAge: 23,
        currentMonthOfYear: 1,
        isPaused: true,
        gameSpeed: 1,
        activeModal: null,
        history: [],
      },
    }),
}));
