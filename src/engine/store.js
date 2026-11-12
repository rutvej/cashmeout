import { create } from 'zustand';
import { generateRandomSeedString } from './prng.js';
import { generateCharacter } from './characterGenerator.js';
import { generateInitialGoals } from './goalsGenerator.js';
import { tickMonthlySimulation } from './simulationEngine.js';
import { UPSKILLING_COURSES, evaluateJobApplication } from './careerEngine.js';
import { VENTURE_CATALOG, createVentureGoal } from './ventureEngine.js';

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

  // Phase 2: Surplus Allocation & Auto-Split Config
  surplusAllocation: {
    autoSplitOnRaise: false,
    raiseRoutingStrategy: 'ask_every_time', // 'proportional_split' | 'bank_cash' | 'ask_every_time'
    autoSplitTimerSeconds: 3,
    unallocatedPercent: 0,
  },

  // Simulation state
  simulation: {
    currentMonthIndex: 0,
    currentAge: 23,
    currentMonthOfYear: 1,
    isPaused: true,
    gameSpeed: 1, // 1 | 2 | 5
    activeModal: null, // null | { type, ... }
    modalQueue: [],
    autoVacation: false, // automated annual vacation without pausing
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
      surplusAllocation: {
        autoSplitOnRaise: false,
        raiseRoutingStrategy: 'ask_every_time',
        autoSplitTimerSeconds: 3,
        unallocatedPercent: 0,
      },
      simulation: {
        currentMonthIndex: 0,
        currentAge: character.age,
        currentMonthOfYear: 1,
        isPaused: true,
        gameSpeed: 1,
        activeModal: null,
        modalQueue: [],
        autoVacation: false,
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

  // Phase 2: Bidirectionally synced goal allocation (₹ ↔ %)
  setGoalAllocation: (goalId, allocationUpdates) =>
    set((state) => {
      const surplus = state.character?.monthlySurplus || 0;
      return {
        goals: state.goals.map((g) => {
          if (g.id !== goalId) return g;
          let updates = { ...allocationUpdates };

          if ('baseMonthlySIP' in updates && !('allocationPercent' in updates)) {
            updates.allocationPercent = surplus > 0 ? Math.round((updates.baseMonthlySIP / surplus) * 100) : 0;
          } else if ('allocationPercent' in updates && !('baseMonthlySIP' in updates)) {
            updates.baseMonthlySIP = surplus > 0 ? Math.round((updates.allocationPercent / 100) * surplus) : 0;
          }

          return { ...g, ...updates };
        }),
      };
    }),

  // Phase 2: Switch allocation mode for a goal (percentage vs fixed)
  setAllocationMode: (goalId, mode) =>
    set((state) => {
      const isMidGame = (state.simulation?.currentMonthIndex || 0) > 0;
      const healthPremium = state.insurance?.health?.isPurchased ? state.insurance.health.monthlyPremium : 0;
      const termPremium = state.insurance?.termLife?.isPurchased ? state.insurance.termLife.monthlyPremium : 0;
      const surplus = isMidGame
        ? (state.character?.monthlySurplus || 0)
        : Math.max(0, (state.character?.monthlySurplus || 0) - (healthPremium + termPremium));

      return {
        goals: state.goals.map((g) => {
          if (g.id !== goalId) return g;
          let allocationPercent = g.allocationPercent ?? 0;
          let baseMonthlySIP = g.baseMonthlySIP ?? 0;

          if (mode === 'percentage') {
            if (surplus > 0 && (allocationPercent === 0 || allocationPercent === undefined) && baseMonthlySIP > 0) {
              allocationPercent = Math.round((baseMonthlySIP / surplus) * 100);
            }
            baseMonthlySIP = surplus > 0 ? Math.round((allocationPercent / 100) * surplus) : 0;
          } else {
            // Switching to fixed: preserve rupee SIP or compute from %
            if (surplus > 0 && baseMonthlySIP === 0 && allocationPercent > 0) {
              baseMonthlySIP = Math.round((allocationPercent / 100) * surplus);
            }
          }

          return {
            ...g,
            allocationMode: mode,
            allocationPercent,
            baseMonthlySIP,
          };
        }),
      };
    }),

  setSurplusAllocation: (partial) =>
    set((state) => ({
      surplusAllocation: {
        ...state.surplusAllocation,
        ...partial,
      },
    })),

  // Phase 2: Auto-split on raise strategy execution
  applyRaiseStrategy: (strategy) => {
    const { character, goals, simulation } = get();
    const modalData = simulation.activeModal;
    const deltaSurplus = modalData?.deltaSurplus || 0;
    const currentSurplus = character.monthlySurplus;

    let updatedGoals = goals.map((g) => ({ ...g }));

    if (strategy === 'proportional_split') {
      // Proportionally scales all active goal SIPs by their current % weights
      const activeGoals = updatedGoals.filter(
        (g) => (g.currentAmount || 0) < (g.targetAmount || 1)
      );
      const totalWeight = activeGoals.reduce((sum, g) => {
        let w = g.allocationPercent;
        if (w === undefined || w === null || w === 0) {
          const oldSurplus = currentSurplus - deltaSurplus;
          w = oldSurplus > 0 ? Math.round(((g.baseMonthlySIP || 0) / oldSurplus) * 100) : 0;
        }
        return sum + (w || 0);
      }, 0);

      let allocatedSoFar = 0;
      updatedGoals = updatedGoals.map((g) => {
        const isFull = (g.currentAmount || 0) >= (g.targetAmount || 1);
        if (isFull) return g;

        let weight = g.allocationPercent;
        if (weight === undefined || weight === null || weight === 0) {
          const oldSurplus = currentSurplus - deltaSurplus;
          weight = oldSurplus > 0 ? Math.round(((g.baseMonthlySIP || 0) / oldSurplus) * 100) : 0;
        }

        if (weight > 0 && currentSurplus > 0) {
          const isLastActive = g.id === activeGoals[activeGoals.length - 1]?.id;
          let newSIP = 0;
          if (isLastActive && totalWeight === 100) {
            newSIP = Math.max(0, currentSurplus - allocatedSoFar);
          } else {
            newSIP = Math.round((weight / 100) * currentSurplus);
            allocatedSoFar += newSIP;
          }
          return {
            ...g,
            allocationPercent: weight,
            baseMonthlySIP: newSIP,
          };
        }
        return g;
      });
    } else if (strategy === 'bank_cash') {
      // Keep existing SIPs unchanged, allowing extra surplus to flow to liquid bank cash
      updatedGoals = updatedGoals.map((g) => {
        const newPercent = currentSurplus > 0 ? Math.round(((g.baseMonthlySIP || 0) / currentSurplus) * 100) : (g.allocationPercent || 0);
        return {
          ...g,
          allocationPercent: newPercent,
        };
      });
    } else if (strategy === 'all_to_retirement') {
      // Keeps all existing SIPs unchanged, funnels entire ΔS into goal_retirement
      updatedGoals = updatedGoals.map((g) => {
        if (g.id === 'goal_retirement') {
          const newSIP = (g.baseMonthlySIP || 0) + deltaSurplus;
          const newPercent = currentSurplus > 0 ? Math.round((newSIP / currentSurplus) * 100) : (g.allocationPercent || 0);
          return {
            ...g,
            baseMonthlySIP: newSIP,
            allocationPercent: newPercent,
          };
        }
        const newPercent = currentSurplus > 0 ? Math.round(((g.baseMonthlySIP || 0) / currentSurplus) * 100) : (g.allocationPercent || 0);
        return {
          ...g,
          allocationPercent: newPercent,
        };
      });
    }

    // Resume instantly: advance modal queue or resume simulation
    const queue = simulation.modalQueue || [];
    const hasNext = queue.length > 0;
    const nextModal = hasNext ? queue[0] : null;
    const nextQueue = hasNext ? queue.slice(1) : [];

    set({
      goals: updatedGoals,
      simulation: {
        ...simulation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNext ? true : false,
      },
    });
  },

  addCustomGoal: ({ name, targetAmount, instrumentId = 'equity', icon = '💎' }) => {
    const goalId = `goal_custom_${Date.now()}`;
    const newGoal = {
      id: goalId,
      name: name || 'Wealth Multiplier Fund',
      icon,
      kind: 'milestone',
      targetAmount: Number(targetAmount) || 2500000,
      currentAmount: 0,
      allocationMode: 'fixed',
      allocationPercent: 0,
      baseMonthlySIP: 0,
      effectiveMonthlySIP: 0,
      instrumentId: instrumentId || 'equity',
      redirectGoalId: null,
      isMandatory: false,
      priority: 3,
      minPriority: 3,
      targetAge: 50,
      description: 'Custom wealth creation milestone',
      status: 'in_progress',
    };
    set((state) => ({
      goals: [...state.goals, newGoal],
    }));
    return goalId;
  },

  // ─── Phase 4: Extra Opt-In Goals & Cash-Flow Ventures ─────────────────────
  addVentureGoal: (catalogId) => {
    const template = VENTURE_CATALOG.find((v) => v.id === catalogId);
    if (!template) return null;

    const { goals, simulation } = get();
    // Prevent duplicate venture of same template if already active or incubating
    const existing = goals.find((g) => g.ventureCatalogId === catalogId);
    if (existing) return existing.id;

    const currentAge = simulation?.currentAge || 25;
    const newVenture = createVentureGoal(template, currentAge);

    set((state) => ({
      goals: [...state.goals, newVenture],
    }));
    return newVenture.id;
  },

  launchVenture: (goalId) => {
    const { character, goals, simulation, insurance } = get();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    let updatedLoans = [...(character.loans || [])];
    let updatedGoals = goals.map((g) => {
      if (g.id !== goalId) return g;

      if (g.ventureType === 'rental_property') {
        const propVal = g.propertyInitialValue || 5000000;
        return {
          ...g,
          isLaunched: true,
          status: 'active_asset',
          launchedAtMonthIndex: simulation.currentMonthIndex,
          baseMonthlySIP: 0,
          effectiveMonthlySIP: 0,
          allocationPercent: 0,
          currentAmount: propVal,
          propertyAssetValue: propVal,
          netMonthlyCashFlow: g.monthlyRevenueBase || 28000,
          lastMonthNetCashFlow: g.monthlyRevenueBase || 28000,
        };
      }

      return {
        ...g,
        isLaunched: true,
        status: 'active_asset',
        launchedAtMonthIndex: simulation.currentMonthIndex,
        baseMonthlySIP: 0,
        effectiveMonthlySIP: 0,
        allocationPercent: 0,
        netMonthlyCashFlow: (g.monthlyRevenueBase || 0) - (g.monthlyOperationalCost || 0),
        lastMonthNetCashFlow: (g.monthlyRevenueBase || 0) - (g.monthlyOperationalCost || 0),
      };
    });

    if (goal.ventureType === 'rental_property') {
      const mortgage = {
        id: `loan_mortgage_${goal.id}`,
        name: 'Rental Property Mortgage',
        principalRemaining: goal.mortgageAmount || 4000000,
        interestRateAnnual: goal.mortgageInterestRate || 0.085,
        tenureMonthsRemaining: goal.mortgageTenureMonths || 180,
        emi: goal.mortgageEMI || 39388,
      };
      updatedLoans.push(mortgage);
    }

    const nextTotalLoanEMIs = updatedLoans.reduce((sum, l) => sum + l.emi, 0);
    const healthPremium = insurance.health?.isPurchased ? insurance.health.monthlyPremium : 0;
    const termPremium = insurance.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0;
    const totalInsurance = healthPremium + termPremium;
    const courseFee = character.activeCourse ? character.activeCourse.monthlyFee : 0;
    const nextTotalMonthlyOutflow = character.totalFixedExpenses + nextTotalLoanEMIs + totalInsurance + courseFee;

    // Advance modal queue if activeModal was launch_venture
    const queue = simulation.modalQueue || [];
    const isCurrentLaunchModal = simulation.activeModal?.type === 'launch_venture';
    const hasNextModal = isCurrentLaunchModal && queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : (isCurrentLaunchModal ? null : simulation.activeModal);
    const nextQueue = hasNextModal ? queue.slice(1) : (isCurrentLaunchModal ? [] : queue);

    set((state) => ({
      character: {
        ...state.character,
        loans: updatedLoans,
        totalLoanEMIs: nextTotalLoanEMIs,
        totalMonthlyOutflow: nextTotalMonthlyOutflow,
        monthlySurplus: state.character.monthlyTakeHome - nextTotalMonthlyOutflow,
      },
      goals: updatedGoals,
      simulation: {
        ...state.simulation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal,
      },
    }));
  },

  dismissLaunchVentureModal: () => {
    const { simulation } = get();
    const queue = simulation.modalQueue || [];
    const hasNextModal = queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : null;
    const nextQueue = hasNextModal ? queue.slice(1) : [];

    set((state) => ({
      simulation: {
        ...state.simulation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal ? true : false,
      },
    }));
  },

  scaleVenture: (goalId) => {
    const { character, goals } = get();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !goal.isLaunched || goal.isScaledUp) return false;

    const cost = goal.scaleUpCost || 100000;
    if ((character.liquidCash || 0) < cost) return false;

    const updatedGoals = goals.map((g) => {
      if (g.id !== goalId) return g;
      const boostedRevenue = Math.round((g.monthlyRevenueBase || 0) * 1.30);
      return {
        ...g,
        isScaledUp: true,
        monthlyRevenueBase: boostedRevenue,
        netMonthlyCashFlow: Math.max(0, boostedRevenue - (g.monthlyOperationalCost || 0)),
      };
    });

    set((state) => ({
      character: {
        ...state.character,
        liquidCash: state.character.liquidCash - cost,
      },
      goals: updatedGoals,
    }));
    return true;
  },

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

  toggleAutoVacation: (enabled) =>
    set((state) => ({
      simulation: {
        ...state.simulation,
        autoVacation: typeof enabled === 'boolean' ? enabled : !state.simulation.autoVacation,
      },
    })),

  tickMonth: () => {
    const currentState = get();
    const nextState = tickMonthlySimulation(currentState);
    set(nextState);
  },

  closeModal: () =>
    set((state) => {
      const queue = state.simulation.modalQueue || [];
      if (queue.length > 0) {
        const [nextModal, ...rest] = queue;
        return {
          simulation: { ...state.simulation, activeModal: nextModal, modalQueue: rest, isPaused: true },
        };
      }
      return {
        simulation: { ...state.simulation, activeModal: null, isPaused: false },
      };
    }),

  // Phase 1: Acknowledge shock event and resume (or move to next queued modal)
  acknowledgeShock: () =>
    set((state) => {
      const queue = state.simulation.modalQueue || [];
      if (queue.length > 0) {
        const [nextModal, ...rest] = queue;
        return {
          simulation: { ...state.simulation, activeModal: nextModal, modalQueue: rest, isPaused: true },
        };
      }
      return {
        simulation: { ...state.simulation, activeModal: null, isPaused: false },
      };
    }),

  // Vacation resolution with 3 options: Loan / Other Fund / Acquired Only + Auto-vacation toggle
  resolveVacationShortfall: ({ resolutionType, nextYearTripOption = 'domestic', autoVacation = false }) => {
    const { character, simulation, goals, insurance } = get();
    const modalData = simulation.activeModal?.data || {};
    const shortfall = modalData.shortfall || 0;
    const nextAmount = nextYearTripOption === 'international' ? 150000 : 50000;

    let updatedLoans = [...(character.loans || [])];
    let updatedLiquidCash = character.liquidCash;
    let updatedGoals = goals.map((g) => ({ ...g }));

    if (shortfall > 0) {
      if (resolutionType === 'loan') {
        // Take a 12-month travel loan at 12% p.a.
        const r = 0.12 / 12;
        const emi = Math.round((shortfall * r * Math.pow(1 + r, 12)) / (Math.pow(1 + r, 12) - 1));
        updatedLoans.push({
          id: `loan_travel_${Date.now()}`,
          name: 'Travel Vacation Loan',
          principalRemaining: shortfall,
          interestRateAnnual: 0.12,
          tenureMonthsRemaining: 12,
          emi,
        });
      } else if (resolutionType === 'other_fund') {
        // Pay from bank liquid cash first; remainder from emergency fund
        if (updatedLiquidCash >= shortfall) {
          updatedLiquidCash -= shortfall;
        } else {
          const remainingFromEmergency = shortfall - updatedLiquidCash;
          updatedLiquidCash = 0;
          const emgIndex = updatedGoals.findIndex((g) => g.id === 'goal_emergency');
          if (emgIndex >= 0) {
            updatedGoals[emgIndex].currentAmount = Math.max(
              0,
              (updatedGoals[emgIndex].currentAmount || 0) - remainingFromEmergency
            );
            updatedGoals[emgIndex].status = 'refill_needed';
          }
        }
      }
      // resolutionType === 'acquired_only': no extra deductions, took budget trip
    }

    // Reset vacation fund for upcoming year and auto-align baseMonthlySIP so shortfall doesn't repeat!
    const neededVacationSIP = Math.round((nextAmount / 12) / 500) * 500;
    updatedGoals = updatedGoals.map((g) =>
      g.id === 'goal_vacation'
        ? {
            ...g,
            targetAmount: nextAmount,
            selectedTierOption: nextYearTripOption,
            currentAmount: 0,
            baseMonthlySIP: Math.max(g.baseMonthlySIP || 0, neededVacationSIP),
          }
        : g
    );

    const nextTotalLoanEMIs = updatedLoans.reduce((sum, l) => sum + l.emi, 0);
    const totalInsurance =
      (insurance.health.isPurchased ? insurance.health.monthlyPremium : 0) +
      (insurance.termLife.isPurchased ? insurance.termLife.monthlyPremium : 0);
    const nextTotalMonthlyOutflow = character.totalFixedExpenses + nextTotalLoanEMIs + totalInsurance;

    const queue = simulation.modalQueue || [];
    const hasNextModal = queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : null;
    const nextQueue = hasNextModal ? queue.slice(1) : [];

    set({
      character: {
        ...character,
        liquidCash: updatedLiquidCash,
        loans: updatedLoans,
        totalLoanEMIs: nextTotalLoanEMIs,
        totalMonthlyOutflow: nextTotalMonthlyOutflow,
        monthlySurplus: character.monthlyTakeHome - nextTotalMonthlyOutflow,
      },
      goals: updatedGoals,
      simulation: {
        ...simulation,
        autoVacation: autoVacation || simulation.autoVacation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal ? true : false,
      },
    });
  },

  // Milestone resolution: Postpone Event / Other Fund / Take a Loan
  resolveMilestoneShortfall: ({ goalId, resolutionType, postponeYears = 2 }) => {
    const { character, simulation, goals, insurance } = get();
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) {
      get().closeModal();
      return;
    }

    const current = goal.currentAmount || 0;
    const target = goal.targetAmount || 1;
    const shortfall = Math.max(0, target - current);

    let updatedLoans = [...(character.loans || [])];
    let updatedLiquidCash = character.liquidCash;
    let updatedGoals = goals.map((g) => ({ ...g }));
    const currentAge = simulation.currentAge;

    if (resolutionType === 'postpone') {
      // Postpone milestone by postponeYears (e.g. +2 years)
      const nextTargetAge = currentAge + postponeYears;
      updatedGoals = updatedGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              targetAge: nextTargetAge,
              targetMonthsRemaining: postponeYears * 12,
              milestoneTriggered: false, // allow re-triggering at new age
            }
          : g
      );
    } else if (resolutionType === 'other_fund') {
      // Pay shortfall from bank liquid cash first; remainder from emergency fund
      const drawnFromCash = Math.min(updatedLiquidCash, shortfall);
      updatedLiquidCash -= drawnFromCash;
      const remainingShortfall = shortfall - drawnFromCash;

      let drawnFromEmergency = 0;
      const emgIndex = updatedGoals.findIndex((g) => g.id === 'goal_emergency');
      if (emgIndex >= 0 && remainingShortfall > 0) {
        const emgBal = updatedGoals[emgIndex].currentAmount || 0;
        drawnFromEmergency = Math.min(emgBal, remainingShortfall);
        updatedGoals[emgIndex].currentAmount = Math.max(0, emgBal - drawnFromEmergency);
        if (drawnFromEmergency > 0) {
          updatedGoals[emgIndex].status = 'refill_needed';
        }
      }
      // Milestone is 100% completed
      updatedGoals = updatedGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: target,
              status: 'completed',
              milestoneTriggered: true,
            }
          : g
      );
    } else if (resolutionType === 'loan') {
      // Finance shortfall via loan
      let tenureMonths = 36;
      let interestRate = 0.12;
      let loanName = `${goal.name} Personal Loan`;

      if (goal.id === 'goal_car') {
        tenureMonths = 48;
        interestRate = 0.095;
        loanName = 'Auto / Car Loan';
      } else if (goal.id === 'goal_home') {
        tenureMonths = 180;
        interestRate = 0.085;
        loanName = 'Home Mortgage Loan';
      }

      const r = interestRate / 12;
      const emi = Math.round((shortfall * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
      updatedLoans.push({
        id: `loan_${goal.id}_${Date.now()}`,
        name: loanName,
        principalRemaining: shortfall,
        interestRateAnnual: interestRate,
        tenureMonthsRemaining: tenureMonths,
        emi,
      });

      // Milestone is 100% completed
      updatedGoals = updatedGoals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: target,
              status: 'completed',
              milestoneTriggered: true,
            }
          : g
      );
    }

    const nextTotalLoanEMIs = updatedLoans.reduce((sum, l) => sum + l.emi, 0);
    const totalInsurance =
      (insurance.health.isPurchased ? insurance.health.monthlyPremium : 0) +
      (insurance.termLife.isPurchased ? insurance.termLife.monthlyPremium : 0);
    const nextTotalMonthlyOutflow = character.totalFixedExpenses + nextTotalLoanEMIs + totalInsurance;

    const queue = simulation.modalQueue || [];
    const hasNextModal = queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : null;
    const nextQueue = hasNextModal ? queue.slice(1) : [];

    set({
      character: {
        ...character,
        liquidCash: updatedLiquidCash,
        loans: updatedLoans,
        totalLoanEMIs: nextTotalLoanEMIs,
        totalMonthlyOutflow: nextTotalMonthlyOutflow,
        monthlySurplus: character.monthlyTakeHome - nextTotalMonthlyOutflow,
      },
      goals: updatedGoals,
      simulation: {
        ...simulation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal ? true : false,
      },
    });
  },

  // ─── Phase 3: Career & Upskilling Actions ────────────────────────────────
  enrollInCourse: (courseId) => {
    const { character } = get();
    if (!character || character.activeCourse) return false;

    const course = UPSKILLING_COURSES.find((c) => c.id === courseId);
    if (!course) return false;

    const activeCourse = {
      courseId: course.id,
      courseName: course.name,
      totalDurationMonths: course.durationMonths,
      monthsCompleted: 0,
      monthlyFee: course.monthlyFee,
      skillBoostReward: course.skillBoostReward,
    };

    const nextOutflow = character.totalMonthlyOutflow + course.monthlyFee;
    const nextSurplus = character.monthlyTakeHome - nextOutflow;

    set((state) => ({
      character: {
        ...state.character,
        activeCourse,
        totalMonthlyOutflow: nextOutflow,
        monthlySurplus: nextSurplus,
      },
    }));
    return true;
  },

  dropActiveCourse: () => {
    const { character } = get();
    if (!character || !character.activeCourse) return;

    const fee = character.activeCourse.monthlyFee || 0;
    const nextOutflow = Math.max(0, character.totalMonthlyOutflow - fee);
    const nextSurplus = character.monthlyTakeHome - nextOutflow;

    set((state) => ({
      character: {
        ...state.character,
        activeCourse: null,
        totalMonthlyOutflow: nextOutflow,
        monthlySurplus: nextSurplus,
      },
    }));
  },

  applyForJob: (job) => {
    const { character, simulation } = get();
    if (!character) return { isAccepted: false };

    // Check cooldown
    const cooldowns = character.jobApplicationCooldowns || {};
    const currentMonth = simulation.currentMonthIndex || 0;
    if (cooldowns[job.id] && cooldowns[job.id] > currentMonth) {
      return {
        isAccepted: false,
        cooldownRemaining: cooldowns[job.id] - currentMonth,
        reason: 'cooldown',
      };
    }

    const result = evaluateJobApplication(job, character, currentMonth);

    if (result.isAccepted) {
      // Pause simulation and show offer letter modal
      set((state) => ({
        simulation: {
          ...state.simulation,
          isPaused: true,
          activeModal: {
            type: 'job_offer',
            offer: job,
          },
        },
      }));
      return { isAccepted: true, offer: job };
    } else {
      // Set 3-month cooldown
      const nextCooldowns = {
        ...cooldowns,
        [job.id]: currentMonth + 3,
      };
      set((state) => ({
        character: {
          ...state.character,
          jobApplicationCooldowns: nextCooldowns,
        },
      }));
      return { isAccepted: false, cooldownRemaining: 3, reason: 'rejected' };
    }
  },

  acceptJobOffer: (offer) => {
    const { character, simulation, insurance } = get();
    if (!character || !offer) return;

    const healthPremium = insurance?.health?.isPurchased ? insurance.health.monthlyPremium : 0;
    const termPremium = insurance?.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0;
    const totalInsurance = healthPremium + termPremium;
    const totalLoanEMIs = (character.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
    const courseFee = character.activeCourse ? character.activeCourse.monthlyFee : 0;
    const totalOutflow = character.totalFixedExpenses + totalLoanEMIs + totalInsurance + courseFee;
    const newSurplus = offer.monthlyTakeHome - totalOutflow;

    const signingBonus = offer.signingBonus || 0;
    const nextLiquidCash = character.liquidCash + signingBonus;

    const queue = simulation.modalQueue || [];
    const hasNextModal = queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : null;
    const nextQueue = hasNextModal ? queue.slice(1) : [];

    set((state) => ({
      character: {
        ...state.character,
        jobTitle: offer.title,
        jobTier: offer.tier,
        grossMonthlySalary: offer.grossMonthlySalary,
        monthlyTakeHome: offer.monthlyTakeHome,
        city: offer.city || state.character.city,
        cityTier: offer.cityTier || state.character.cityTier,
        liquidCash: nextLiquidCash,
        totalMonthlyOutflow: totalOutflow,
        monthlySurplus: newSurplus,
        // Immediately restores active employment if previously laid off
        employmentStatus: 'employed',
        unemploymentDurationMonths: 0,
        preLayoffTakeHome: null,
      },
      simulation: {
        ...state.simulation,
        unemploymentReminder: null,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal ? true : false,
      },
    }));
  },

  declineJobOffer: () => {
    const { simulation } = get();
    const queue = simulation.modalQueue || [];
    const hasNextModal = queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : null;
    const nextQueue = hasNextModal ? queue.slice(1) : [];

    set((state) => ({
      simulation: {
        ...state.simulation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal ? true : false,
      },
    }));
  },

  dismissCourseCompletion: () => {
    const { simulation } = get();
    const queue = simulation.modalQueue || [];
    const hasNextModal = queue.length > 0;
    const nextModal = hasNextModal ? queue[0] : null;
    const nextQueue = hasNextModal ? queue.slice(1) : [];

    set((state) => ({
      simulation: {
        ...state.simulation,
        activeModal: nextModal,
        modalQueue: nextQueue,
        isPaused: hasNextModal ? true : false,
      },
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
      surplusAllocation: {
        autoSplitOnRaise: false,
        raiseRoutingStrategy: 'ask_every_time',
        autoSplitTimerSeconds: 3,
        unallocatedPercent: 0,
      },
      simulation: {
        currentMonthIndex: 0,
        currentAge: 23,
        currentMonthOfYear: 1,
        isPaused: true,
        gameSpeed: 1,
        activeModal: null,
        modalQueue: [],
        autoVacation: false,
        history: [],
      },
    }),
}));

if (typeof window !== 'undefined') {
  window.__GAME_STORE__ = useGameStore;
}
