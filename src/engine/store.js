import { create } from 'zustand';
import { generateStartingConditions } from './startingConditions.js';
import { simulateTick, shouldTriggerEvent, getEligibleEvents } from './simulation.js';
import { resolveEvent as resolveEventFn } from './eventResolver.js';
import { EVENT_DECK } from './events.js';
import { createGoal, redistributeBuckets } from './goals.js';
import { calculateResults, generateInsights } from './scoring.js';
import { SIMULATION_SPEED_MS, INSURANCE_COSTS, TOTAL_DAYS, RENT_RANGES, CITY_TIERS } from './constants.js';
import { randInt, randFloat, setSeed, getSeed } from '../utils/random.js';
import { getCareerRole, generateJobMarketOffers, CITY_TIER_SALARY_CAPS, getJobSwitchCooldown } from './careers.js';
import { generateEventCalendar } from './calendarQueue.js';

export function normalizeInstruments(instruments) {
  const current = {
    savings: Math.max(0, Number(instruments?.savings) || 0),
    stocks: Math.max(0, Number(instruments?.stocks) || 0),
    gold: Math.max(0, Number(instruments?.gold) || 0),
    mf: Math.max(0, Number(instruments?.mf) || 0),
    fd: Math.max(0, Number(instruments?.fd) || 0),
  };
  const nonSavings = current.stocks + current.gold + current.mf + current.fd;
  if (nonSavings <= 0) {
    return { savings: 100, stocks: 0, gold: 0, mf: 0, fd: 0 };
  }
  if (nonSavings >= 100) {
    const scale = 90 / nonSavings;
    current.stocks = Math.round(current.stocks * scale);
    current.gold = Math.round(current.gold * scale);
    current.mf = Math.round(current.mf * scale);
    current.fd = Math.round(current.fd * scale);
    const sumAfter = current.stocks + current.gold + current.mf + current.fd;
    current.savings = Math.max(0, 100 - sumAfter);
    return current;
  }
  current.savings = 100 - nonSavings;
  return current;
}

export function absorbWithFunds(amount, eventId, funds = []) {
  let remaining = amount;
  let absorbedTotal = 0;
  const fundDeltas = [];
  const updatedFunds = (funds || []).map(f => ({ ...f }));

  const isMedical = eventId === 'medical_emergency' || eventId === 'uninsured_illness';
  const targetTypes = isMedical
    ? ['medical', 'emergency', 'general']
    : ['emergency', 'general', 'medical'];

  for (const t of targetTypes) {
    if (remaining <= 0) break;
    const fund = updatedFunds.find(f => f.type === t && (f.currentAmount || 0) > 0);
    if (fund) {
      const take = Math.min(remaining, fund.currentAmount);
      fund.currentAmount -= take;
      remaining -= take;
      absorbedTotal += take;
      fundDeltas.push({ fundId: fund.id, fundName: fund.name, absorbed: take });
    }
  }

  return { remaining, absorbedTotal, fundDeltas, updatedFunds };
}

/**
 * Central Zustand store — single source of truth for all game state.
 * All mutations flow through store actions. The simulation loop calls tick()
 * on an interval, and tick() applies changes from simulateTick().
 */
const useGameStore = create((set, get) => ({
  // --- Screen & Seed ---
  screen: 'landing',
  gameSeed: null,

  // --- Player profile (set at spawn) ---
  player: null,

  // --- Financial state ---
  pool: 0,
  buckets: {},
  instruments: { savings: 100, stocks: 0, gold: 0, mf: 0, fd: 0 },

  // --- Goals & Safety Funds ---
  goals: [],
  funds: [],
  fundAllocations: {},

  // --- Income & deductions ---
  incomes: [],
  fixedDeductions: [],
  loans: [],

  // --- Insurance ---
  hasHealthInsurance: false,
  hasVehicleInsurance: false,
  healthInsuranceCost: 0,
  vehicleInsuranceCost: 0,
  homeMaintenanceCost: 0,
  carMaintenanceCost: 0,

  // --- Simulation ---
  currentDay: 0,
  lastEventDay: 0,
  simRunning: false,
  simSpeed: 1,
  simIntervalId: null,

  // --- Current event / modal state ---
  currentEvent: null,
  showAllocation: false,
  showMilestone: null,
  activeTab: null,
  deficitInfo: null,
  calendarQueue: null,
  showMonthlyLedger: false,
  financialChanged: true,
  recentAutoToast: null,
  currentYearStatements: [],
  monthlyStatementsHistory: [],

  // --- Game tracking ---
  gameOver: false,
  gameOverReason: null,
  eventHistory: [],
  decisionHistory: [],
  monthlySnapshots: [],
  results: null,

  // --- Owned assets ---
  homesOwned: [],
  carsOwned: [],
  hasActiveBusiness: false,
  businessIncome: 0,

  // --- Player progression ---
  experienceMonths: 0,
  courseCompleted: false,
  courseRaiseUsed: false,
  salaryCeiling: 0,
  economicCycle: 'normal',
  cycleMonthsRemaining: 15,

  // --- Life events ---
  marriageEventFired: false,
  familyWeddingFired: false,
  married: false,
  homeNeedsRenovation: false,
  lastJobSwitchDay: 0,
  lastAppraisalDay: 0,

  // ═══════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════

  startGame: (customSeed = null) => {
    const seed = setSeed(customSeed);
    const p = generateStartingConditions();
    const incomes = [];
    if (p.incomeSource === 'job' || p.incomeSource === 'fresh_start') {
      incomes.push({ id: 'salary_1', type: 'job', amount: p.startingSalary, name: 'Salary' });
    } else if (p.incomeSource === 'family_business') {
      incomes.push({ id: 'biz_1', type: 'family_business', amount: p.startingSalary, name: 'Family Business' });
    } else if (p.incomeSource === 'passive_income') {
      incomes.push({ id: 'passive_1', type: 'passive_income', amount: Math.round(p.startingSalary * 0.6), name: 'Passive Income' });
      incomes.push({ id: 'salary_1', type: 'job', amount: Math.round(p.startingSalary * 0.4), name: 'Part-time Work' });
    }

    const homesOwned = p.homeOwned
      ? [{ id: 'home_start', value: randInt(1500000, 12000000), isRentedOut: false, rentalIncome: 0, maintenanceCost: p.homeMaintenanceCost, purchasePrice: 0, purchaseDay: 0 }]
      : [];
    const carsOwned = p.carOwned
      ? [{ id: 'car_start', maintenanceCost: p.carMaintenanceCost, purchaseDay: 0 }]
      : [];

    const fixedDeductions = [
      { id: 'living', type: 'living', amount: p.livingCost, name: 'Food & Utilities' },
    ];
    if (p.isRenting && p.rentCost > 0) {
      fixedDeductions.push({ id: 'rent', type: 'rent', amount: p.rentCost, name: 'House Rent' });
    }

    set({
      player: p,
      gameSeed: seed,
      pool: p.startingSavings,
      incomes,
      fixedDeductions,
      loans: p.existingLoan ? [{ ...p.existingLoan, name: `${p.existingLoan.type === 'education' ? 'Education' : 'Personal'} Loan` }] : [],
      homeMaintenanceCost: p.homeMaintenanceCost,
      carMaintenanceCost: p.carMaintenanceCost,
      homesOwned,
      carsOwned,
      salaryCeiling: CITY_TIER_SALARY_CAPS[p.cityTier || 2] || 110000,
      economicCycle: 'normal',
      cycleMonthsRemaining: 15,
      screen: 'spawn',
      isAusterityMode: false,
      annualIncomeAcc: 0,
      // Reset everything else
      currentDay: 0,
      lastEventDay: 0,
      simRunning: false,
      simIntervalId: null,
      currentEvent: null,
      showAllocation: false,
      showMilestone: null,
      activeTab: null,
      gameOver: false,
      gameOverReason: null,
      eventHistory: [],
      decisionHistory: [],
      monthlySnapshots: [{ day: 0, pool: p.startingSavings, netWorth: p.startingSavings }],
      results: null,
      goals: (p.seedGoals || []).map(g => createGoal(g.type, g.name, g.targetAmount, g.inflationRate, 0, false, true)),
      funds: [],
      fundAllocations: {},
      buckets: {},
      instruments: { savings: 100, stocks: 0, gold: 0, mf: 0, fd: 0 },
      hasHealthInsurance: false,
      hasVehicleInsurance: false,
      healthInsuranceCost: 0,
      vehicleInsuranceCost: 0,
      hasActiveBusiness: false,
      businessIncome: 0,
      experienceMonths: 0,
      courseCompleted: false,
      courseRaiseUsed: false,
      marriageEventFired: false,
      familyWeddingFired: false,
      married: false,
      homeNeedsRenovation: false,
      calendarQueue: generateEventCalendar(seed, p, EVENT_DECK),
      showMonthlyLedger: false,
      financialChanged: true,
      recentAutoToast: null,
      currentYearStatements: [],
      monthlyStatementsHistory: [],
      lastJobSwitchDay: 0,
      lastAppraisalDay: 0,
    });
  },

  clearAutoToast: () => set({ recentAutoToast: null }),

  setScreen: (screen) => set({ screen }),

  setGoals: (goals) => {
    // Equal-split bucket allocation by default
    const count = Math.max(1, goals.length);
    const evenPercent = Math.floor(100 / count);
    const remainder = 100 - (evenPercent * count);
    const buckets = {};
    goals.forEach((g, i) => {
      const pct = i === 0 ? evenPercent + remainder : evenPercent;
      g.bucketPercent = pct;
      buckets[g.id] = pct;
    });
    set({ goals, buckets, financialChanged: true });
  },

  addGoalMidGame: (goal, mode) => {
    set(s => {
      const newGoals = [...s.goals, { ...goal, bonus: true }];
      let newBuckets = { ...s.buckets };

      if (mode === 'retroactive') {
        const activeGoals = newGoals.filter(g => !g.achieved && !g.sacrificed);
        const count = Math.max(1, activeGoals.length);
        const evenPct = Math.floor(100 / count);
        const rem = 100 - (evenPct * count);
        newBuckets = {};
        activeGoals.forEach((g, i) => {
          const pct = i === 0 ? evenPct + rem : evenPct;
          newBuckets[g.id] = pct;
        });
      } else {
        newBuckets[goal.id] = 0;
      }

      const updatedGoals = newGoals.map(g => ({
        ...g,
        bucketPercent: newBuckets[g.id] || 0,
      }));

      return { goals: updatedGoals, buckets: newBuckets, financialChanged: true };
    });
  },

  removeGoal: (goalId) => {
    const state = get();
    const targetGoal = (state.goals || []).find(g => g.id === goalId);
    if (targetGoal && targetGoal.locked) {
      return false; // Character life commitment cannot be deleted!
    }

    set(s => {
      const updatedGoals = s.goals.map(g =>
        g.id === goalId ? { ...g, sacrificed: true, bucketPercent: 0 } : g
      );
      const newBuckets = redistributeBuckets(s.goals, goalId, 'redistribute');

      const finalGoals = updatedGoals.map(g => ({
        ...g,
        bucketPercent: g.sacrificed ? 0 : (newBuckets[g.id] ?? g.bucketPercent),
      }));

      return {
        goals: finalGoals,
        buckets: newBuckets,
        financialChanged: true,
        decisionHistory: [...s.decisionHistory, { day: s.currentDay, type: 'sacrifice_goal', goalId }],
      };
    });
    return true;
  },

  updateBucketAllocations: (newBuckets) => {
    set(s => ({
      buckets: newBuckets,
      goals: s.goals.map(g => ({ ...g, bucketPercent: newBuckets[g.id] || 0 })),
      financialChanged: true,
    }));
  },

  updateInstrumentAllocations: (newInstruments) => {
    set({
      instruments: newInstruments,
      financialChanged: true,
    });
  },

  // --- Safety Funds Actions ---
  createFund: (fund) => {
    set(s => ({
      funds: [...(s.funds || []), fund],
      financialChanged: true,
    }));
  },

  deleteFund: (fundId) => {
    set(s => {
      const fund = (s.funds || []).find(f => f.id === fundId);
      const freedCash = fund ? (fund.currentAmount || 0) : 0;
      const newFunds = (s.funds || []).filter(f => f.id !== fundId);
      const newAllocations = { ...(s.fundAllocations || {}) };
      delete newAllocations[fundId];
      return {
        funds: newFunds,
        fundAllocations: newAllocations,
        pool: s.pool + freedCash,
        financialChanged: true,
      };
    });
  },

  updateFundTarget: (fundId, newTarget) => {
    set(s => ({
      funds: (s.funds || []).map(f => f.id === fundId ? { ...f, targetAmount: Math.max(10000, Number(newTarget)) } : f),
      financialChanged: true,
    }));
  },

  updateFundInstruments: (fundId, newInstruments) => {
    set(s => ({
      funds: (s.funds || []).map(f => f.id === fundId ? { ...f, instruments: newInstruments } : f),
      financialChanged: true,
    }));
  },

  depositToFund: (fundId, amount) => {
    set(s => {
      const actualAmount = Math.max(0, Math.min(s.pool, Math.round(Number(amount) || 0)));
      if (actualAmount <= 0) return {};
      const targetFund = (s.funds || []).find(f => f.id === fundId);
      return {
        pool: s.pool - actualAmount,
        funds: (s.funds || []).map(f => f.id === fundId ? { ...f, currentAmount: (f.currentAmount || 0) + actualAmount } : f),
        financialChanged: true,
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Safety Fund Deposit',
            icon: '🛡️',
            choice: `Deposited ₹${actualAmount.toLocaleString('en-IN')}`,
            poolDelta: -actualAmount,
            outcome: `Transferred ₹${actualAmount.toLocaleString('en-IN')} from liquid cash into ${targetFund?.name || 'Safety Fund'}.`,
          },
          ...s.eventHistory,
        ],
      };
    });
  },

  withdrawFromFund: (fundId, amount) => {
    set(s => {
      const fund = (s.funds || []).find(f => f.id === fundId);
      if (!fund || !fund.currentAmount) return {};
      const actualAmount = Math.max(0, Math.min(fund.currentAmount, Math.round(Number(amount) || 0)));
      if (actualAmount <= 0) return {};
      return {
        pool: s.pool + actualAmount,
        funds: (s.funds || []).map(f => f.id === fundId ? { ...f, currentAmount: f.currentAmount - actualAmount } : f),
        financialChanged: true,
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Safety Fund Withdrawal',
            icon: '🛡️',
            choice: `Withdrew ₹${actualAmount.toLocaleString('en-IN')}`,
            poolDelta: actualAmount,
            outcome: `Withdrew ₹${actualAmount.toLocaleString('en-IN')} from ${fund.name} into liquid cash buffer.`,
          },
          ...s.eventHistory,
        ],
      };
    });
  },

  applyWindfallAllocation: ({
    totalAmount,
    fundDeposits = {},
    goalDeposits = {},
    newInstruments = null,
    label = 'Windfall Bonus Distribution',
  }) => {
    const s = get();
    const total = Math.max(0, Math.round(Number(totalAmount) || 0));
    
    let totalToFunds = 0;
    const updatedFunds = (s.funds || []).map(f => {
      const dep = Math.max(0, Math.round(Number(fundDeposits[f.id]) || 0));
      if (dep > 0) {
        totalToFunds += dep;
        return { ...f, currentAmount: (f.currentAmount || 0) + dep };
      }
      return f;
    });

    let totalToGoals = 0;
    const updatedGoals = (s.goals || []).map(g => {
      const dep = Math.max(0, Math.round(Number(goalDeposits[g.id]) || 0));
      if (dep > 0) {
        totalToGoals += dep;
        return { ...g, dedicatedContribution: (g.dedicatedContribution || 0) + dep };
      }
      return g;
    });

    const cashRemaining = Math.max(0, total - totalToFunds);
    const newPool = s.pool + cashRemaining;
    const finalInstruments = newInstruments ? normalizeInstruments(newInstruments) : s.instruments;

    const summaryParts = [];
    if (totalToFunds > 0) summaryParts.push(`₹${totalToFunds.toLocaleString('en-IN')} to Safety Funds`);
    if (totalToGoals > 0) summaryParts.push(`₹${totalToGoals.toLocaleString('en-IN')} to Goals`);
    if (cashRemaining > 0) summaryParts.push(`₹${cashRemaining.toLocaleString('en-IN')} to Liquid Portfolio`);

    set({
      pool: newPool,
      funds: updatedFunds,
      goals: updatedGoals,
      instruments: finalInstruments,
      currentEvent: null,
      financialChanged: true,
      eventHistory: [
        {
          day: s.currentDay,
          eventName: label,
          icon: '🎁',
          choice: `Custom Allocated ₹${total.toLocaleString('en-IN')}`,
          poolDelta: cashRemaining,
          outcome: `Allocated windfall: ${summaryParts.join(', ') || 'Deposited to savings'}.`,
        },
        ...s.eventHistory,
      ],
    });

    get().startSimulation();
  },

  // --- Simulation controls ---

  startSimulation: () => {
    const state = get();
    if (state.simRunning || state.gameOver) return;

    const speed = state.simSpeed;
    const intervalMs = Math.max(10, SIMULATION_SPEED_MS / speed);

    const interval = setInterval(() => {
      get().tick();
    }, intervalMs);

    set({ simRunning: true, simIntervalId: interval });
  },

  pauseSimulation: () => {
    const { simIntervalId } = get();
    if (simIntervalId) clearInterval(simIntervalId);
    set({ simRunning: false, simIntervalId: null });
  },

  setSimSpeed: (speed) => {
    const { simRunning, simIntervalId } = get();
    if (simIntervalId) clearInterval(simIntervalId);
    set({ simSpeed: speed, simRunning: false, simIntervalId: null });
    if (simRunning) {
      // Restart with new speed
      setTimeout(() => get().startSimulation(), 0);
    }
  },

  tick: () => {
    const state = get();
    if (state.gameOver || state.currentEvent || state.showMilestone || state.showAllocation || state.deficitInfo || state.showMonthlyLedger) {
      // Auto-pause when something needs player attention
      get().pauseSimulation();
      return;
    }

    const tickResult = simulateTick(state);
    const changes = tickResult.stateChanges;

    // 1. Check deterministic calendar queue first
    let nextEvent = null;
    if (state.calendarQueue) {
      const scheduledEvents = state.calendarQueue.popEventsForDay(changes.currentDay);
      if (scheduledEvents && scheduledEvents.length > 0) {
        for (const se of scheduledEvents) {
          if (se.id === 'marriage_event' || se.id === 'marriage') {
            if (!state.married && !state.marriageEventFired) {
              nextEvent = buildMarriageEvent(state);
              break;
            }
          } else {
            const template = se.template || EVENT_DECK.find(e => e.id === se.id);
            if (template && template.eligibilityCheck(state)) {
              nextEvent = buildEventOptions(template, state);
              break;
            }
          }
        }
      }
    }

    // 2. Check for random event if no calendar event fired
    if (!nextEvent && shouldTriggerEvent(changes.currentDay, state.lastEventDay)) {
      const eligible = getEligibleEvents(state, EVENT_DECK);
      if (eligible.length > 0) {
        // Weighted random pick (lower weight = rarer)
        const totalWeight = eligible.reduce((s, e) => s + (e.weight || 10), 0);
        let r = Math.random() * totalWeight;
        let picked = eligible[eligible.length - 1];
        for (const ev of eligible) {
          r -= (ev.weight || 10);
          if (r <= 0) { picked = ev; break; }
        }
        nextEvent = buildEventOptions(picked, state);
      }
    }

    // Check for scheduled annual events (Tax, Inflation) or random events
    if (tickResult.eventTriggered) {
      nextEvent = tickResult.eventTriggered;
    }

    // Marriage age trigger fallback
    if (changes.shouldTriggerMarriage && !state.married && !state.marriageEventFired && !nextEvent) {
      nextEvent = buildMarriageEvent(state);
    }

    set(s => {
      // Pool floor protection during tick
      let finalPool = s.pool + (changes.poolDelta || 0);

      const newState = {
        currentDay: changes.currentDay,
        pool: finalPool,
        loans: changes.loansUpdate || s.loans,
        funds: changes.fundsUpdate || s.funds || [],
      };

      if (finalPool < 0) {
        const deficit = Math.abs(finalPool);
        finalPool = 0; // NEVER negative!
        newState.pool = finalPool;

        // Check if player has any way out:
        const hasPhysicalAssets = (s.carsOwned || []).length > 0 || (s.homesOwned || []).length > 0 || s.hasActiveBusiness;
        const hasInvestments = ((s.instruments?.stocks || 0) + (s.instruments?.mf || 0) + (s.instruments?.gold || 0) + (s.instruments?.fd || 0)) > 0 && s.pool > 0;

        // Estimate EMI for this deficit
        const mRate = 0.12 / 12;
        const estEMI = Math.max(500, Math.round((deficit * mRate * Math.pow(1 + mRate, 24)) / (Math.pow(1 + mRate, 24) - 1)));
        const canLoan = get().canAffordLoan(estEMI);

        if (!hasPhysicalAssets && !hasInvestments && !canLoan) {
          newState.gameOver = true;
          newState.gameOverReason = 'broke';
          try {
            newState.results = calculateResults({ ...s, ...newState });
          } catch (e) {
            console.error("Scorecard calculation error at insolvency:", e);
          }
          newState.screen = 'scorecard';
        } else {
          newState.deficitInfo = {
            shortfall: deficit,
            reason: 'Monthly expenses exceed cash reserves',
          };
        }
      } else if (changes.monthlySurplus && changes.monthlySurplus > 0) {
        // Monthly cashflow surplus arrives directly into liquid savings account!
        const oldSavingsRupees = Math.round(((s.instruments?.savings || 0) / 100) * s.pool);
        const newSavingsRupees = oldSavingsRupees + changes.monthlySurplus;
        if (finalPool > 0) {
          const newSavingsPct = Math.min(100, Math.max(1, Math.round((newSavingsRupees / finalPool) * 100)));
          const currentNonSavingsSum = (s.instruments?.stocks || 0) + (s.instruments?.mf || 0) + (s.instruments?.gold || 0) + (s.instruments?.fd || 0);
          if (currentNonSavingsSum > 0) {
            const scale = (100 - newSavingsPct) / currentNonSavingsSum;
            const updatedInstruments = {
              savings: newSavingsPct,
              stocks: Math.round((s.instruments.stocks || 0) * scale),
              mf: Math.round((s.instruments.mf || 0) * scale),
              gold: Math.round((s.instruments.gold || 0) * scale),
              fd: Math.round((s.instruments.fd || 0) * scale),
            };
            const sum = Object.values(updatedInstruments).reduce((a, b) => a + b, 0);
            if (sum !== 100) updatedInstruments.savings += (100 - sum);
            newState.instruments = updatedInstruments;
          } else {
            newState.instruments = { savings: 100, stocks: 0, mf: 0, gold: 0, fd: 0 };
          }
        } else {
          newState.instruments = { savings: 100, stocks: 0, mf: 0, gold: 0, fd: 0 };
        }
      } else {
        newState.instruments = normalizeInstruments(s.instruments);
      }

      // Apply goals update (inflation)
      if (changes.goalsUpdate) {
        newState.goals = changes.goalsUpdate;
      }

      if (changes.fixedDeductionsUpdate) {
        newState.fixedDeductions = changes.fixedDeductionsUpdate;
      }

      if (changes.incomesUpdate) {
        newState.incomes = changes.incomesUpdate;
      }

      // Monthly statement tracking and ledger integration
      if (changes.newMonthlyStatement) {
        const stmt = changes.newMonthlyStatement;
        newState.currentYearStatements = [...(s.currentYearStatements || []), stmt];
        newState.monthlyStatementsHistory = [stmt, ...(s.monthlyStatementsHistory || [])];

        // Add to live eventHistory ledger so newest statement appears at top of ledger!
        const stmtEntry = {
          day: changes.currentDay,
          type: 'statement',
          eventName: `Month ${stmt.month} Statement (Year ${stmt.year})`,
          icon: stmt.surplus >= 0 ? '📊' : '📉',
          choice: `Net Surplus: ${stmt.surplus >= 0 ? '+' : ''}₹${stmt.surplus.toLocaleString('en-IN')}`,
          poolDelta: stmt.surplus,
          outcome: `Total Inflow: ₹${stmt.totalEarned.toLocaleString('en-IN')} (Salary: ₹${stmt.salaryEarned.toLocaleString('en-IN')}${stmt.businessEarned ? `, Biz: ₹${stmt.businessEarned.toLocaleString('en-IN')}` : ''}${stmt.rentEarned ? `, Rent: ₹${stmt.rentEarned.toLocaleString('en-IN')}` : ''}${stmt.investmentGains ? `, Returns: ₹${stmt.investmentGains.toLocaleString('en-IN')}` : ''}) · Expenses: -₹${stmt.totalExpenses.toLocaleString('en-IN')}`,
          statementDetails: stmt,
        };
        newState.eventHistory = [stmtEntry, ...(newState.eventHistory || s.eventHistory)];
      }

      if (changes.resetYearStatements) {
        newState.currentYearStatements = [];
      }

      if (changes.annualIncomeAcc !== undefined) {
        newState.annualIncomeAcc = changes.annualIncomeAcc;
      }

      if (changes.economicCycleUpdate) {
        newState.economicCycle = changes.economicCycleUpdate;
      }
      if (changes.cycleMonthsRemainingUpdate !== undefined) {
        newState.cycleMonthsRemaining = changes.cycleMonthsRemainingUpdate;
      }

      // Experience tracking
      if (changes.experienceIncrement) {
        newState.experienceMonths = s.experienceMonths + changes.experienceIncrement;
      }

      // Marriage event fired flag
      if (changes.marriageEventFired || (nextEvent && nextEvent.id === 'marriage_event')) {
        newState.marriageEventFired = true;
      }

      // Monthly snapshot (for net worth graph)
      if (changes.currentDay % 30 === 0) {
        const currentPool = finalPool;
        const fundsVal = (newState.funds || s.funds || []).reduce((sum, f) => sum + (f.currentAmount || 0), 0);
        const assetValue = (s.homesOwned || []).reduce((sum, h) => sum + (h.value || 0), 0);
        newState.monthlySnapshots = [
          ...s.monthlySnapshots,
          { day: changes.currentDay, pool: currentPool, netWorth: currentPool + fundsVal + assetValue },
        ];
      }

      // Event triggered: show the card as it is! 1-option cards auto-select in 5s inside EventCard
      if (nextEvent) {
        newState.currentEvent = nextEvent;
        newState.lastEventDay = changes.currentDay;
        setTimeout(() => get().pauseSimulation(), 0);
      }

      // Milestone triggered
      if (tickResult.milestoneTriggered) {
        newState.showMilestone = tickResult.milestoneTriggered;
      }

      // Game over
      if (changes.gameOverReason) {
        newState.gameOver = true;
        newState.gameOverReason = changes.gameOverReason;
        try {
          newState.results = calculateResults({ ...s, ...newState });
        } catch (e) {
          console.error("Scorecard calculation error at game over:", e);
        }
        newState.screen = 'scorecard';
      }

      return newState;
    });

    // If decision event, milestone, or deficit appeared, pause the sim
    const updated = get();
    if (updated.currentEvent || updated.showMilestone || updated.gameOver || updated.deficitInfo) {
      get().pauseSimulation();
    }
  },

  // --- Event resolution ---

  resolveEvent: (choiceIndex, extraData = {}) => {
    const state = get();
    if (!state.currentEvent) return;

    if (extraData && extraData.customWindfall) {
      get().applyWindfallAllocation({
        totalAmount: extraData.customWindfall.totalAmount,
        fundDeposits: extraData.customWindfall.fundDeposits,
        goalDeposits: extraData.customWindfall.goalDeposits,
        newInstruments: extraData.customWindfall.newInstruments,
        label: state.currentEvent.name || 'Windfall Inflow',
      });
      return;
    }

    const eventWithData = { ...state.currentEvent, ...extraData };
    const changes = resolveEventFn(eventWithData, choiceIndex, state);

    // Safety Fund expense absorption before touching pool / savings buffer!
    let rawDelta = changes.poolDelta || 0;
    let fundShieldMessage = '';
    let updatedFunds = state.funds ? state.funds.map(f => ({ ...f })) : [];

    if (rawDelta < 0 && updatedFunds.length > 0) {
      const absorption = absorbWithFunds(Math.abs(rawDelta), eventWithData.id, updatedFunds);
      if (absorption.absorbedTotal > 0) {
        rawDelta = -absorption.remaining;
        updatedFunds = absorption.updatedFunds;
        const details = absorption.fundDeltas.map(d => `${d.fundName} covered ₹${d.absorbed.toLocaleString('en-IN')}`).join(', ');
        fundShieldMessage = `🛡️ Safety Net Shield: ${details}. `;
      }
    }

    // Expenses deduct strictly from savings buffer first!
    const poolDelta = rawDelta;
    const savingsPercent = state.instruments.savings || 0;
    const savingsRupees = Math.round((savingsPercent / 100) * state.pool);
    const expense = Math.abs(poolDelta);

    // If there is an expense and savings cannot cover it:
    if (poolDelta < 0 && savingsRupees < expense) {
      const shortfall = expense - savingsRupees;
      const remainingPool = Math.max(0, state.pool - savingsRupees);
      
      let updatedInstruments;
      if (remainingPool <= 0) {
        updatedInstruments = { savings: 100, stocks: 0, gold: 0, mf: 0, fd: 0 };
      } else {
        const nonSavingsSum = (state.instruments.stocks || 0) + (state.instruments.mf || 0) + (state.instruments.gold || 0) + (state.instruments.fd || 0);
        if (nonSavingsSum > 0) {
          const factor = 100 / nonSavingsSum;
          updatedInstruments = {
            savings: 0,
            stocks: Math.round((state.instruments.stocks || 0) * factor),
            mf: Math.round((state.instruments.mf || 0) * factor),
            gold: Math.round((state.instruments.gold || 0) * factor),
            fd: Math.round((state.instruments.fd || 0) * factor),
          };
          const totalSum = updatedInstruments.stocks + updatedInstruments.mf + updatedInstruments.gold + updatedInstruments.fd;
          if (totalSum !== 100) updatedInstruments.stocks += (100 - totalSum);
        } else {
          updatedInstruments = { savings: 100, stocks: 0, gold: 0, mf: 0, fd: 0 };
        }
      }

      const finalLoans = [...state.loans];
      if (changes.newLoans && changes.newLoans.length > 0) finalLoans.push(...changes.newLoans);

      const finalDeductions = [...state.fixedDeductions];
      if (changes.newDeductions && changes.newDeductions.length > 0) finalDeductions.push(...changes.newDeductions);

      set(s => {
        const shortfallState = {
          pool: remainingPool,
          instruments: normalizeInstruments(updatedInstruments),
          currentEvent: null,
          loans: finalLoans,
          fixedDeductions: finalDeductions,
          funds: updatedFunds,
          deficitInfo: {
            shortfall,
            reason: eventWithData.name || 'Expense',
          },
          eventHistory: [
            {
              day: s.currentDay,
              eventName: eventWithData.name || 'Life Event',
              icon: eventWithData.icon || '⚠️',
              choice: eventWithData.options?.[choiceIndex]?.label || 'Obligation',
              choiceIndex,
              poolDelta: -savingsRupees,
              outcome: `${fundShieldMessage}Used remaining ₹${savingsRupees.toLocaleString('en-IN')} in savings buffer. Shortfall of ₹${shortfall.toLocaleString('en-IN')} pending liquidation decision.`,
              isAuto: !!extraData.isAuto,
            },
            ...s.eventHistory,
          ],
          decisionHistory: [
            ...(s.decisionHistory || []),
            { day: s.currentDay, type: 'event', eventId: eventWithData.id, choiceIndex, poolDelta, isAuto: !!extraData.isAuto },
          ],
        };

        // Guarantee life milestones are preserved even during shortfall
        if (changes.married || eventWithData.id === 'marriage_event') {
          shortfallState.married = true;
          shortfallState.marriageEventFired = true;
        }
        if (changes.familyWeddingFired || eventWithData.id === 'family_wedding') {
          shortfallState.familyWeddingFired = true;
        }
        if (changes.optInHealthInsurance) {
          shortfallState.hasHealthInsurance = true;
          shortfallState.healthInsuranceCost = 750;
        }
        if (changes.homeNeedsRenovation === false) {
          shortfallState.homeNeedsRenovation = false;
        }
        if (changes.removedIncomes?.length > 0 || changes.newIncomes?.length > 0) {
          shortfallState.incomes = (s.incomes || [])
            .filter(i => !changes.removedIncomes?.includes(i.id))
            .concat(changes.newIncomes || []);
        }

        shortfallState.instruments = normalizeInstruments(shortfallState.instruments);

        return shortfallState;
      });

      get().pauseSimulation();
      return;
    }

    // Savings has enough cash: deduct strictly from savings buffer!
    let newPool = state.pool + poolDelta;
    let newInstruments = changes.newInstruments || { ...state.instruments };

    if (poolDelta < 0 && newPool > 0) {
      const newSavingsRupees = Math.max(0, savingsRupees - expense);
      const newSavingsPct = Math.round((newSavingsRupees / newPool) * 100);
      const oldNonSavingsPct = Math.max(1, 100 - state.instruments.savings);
      const scale = (100 - newSavingsPct) / oldNonSavingsPct;

      newInstruments = {
        savings: newSavingsPct,
        stocks: Math.round(state.instruments.stocks * scale),
        mf: Math.round(state.instruments.mf * scale),
        gold: Math.round(state.instruments.gold * scale),
        fd: Math.round(state.instruments.fd * scale),
      };
      const totalSum = Object.values(newInstruments).reduce((a, b) => a + b, 0);
      if (totalSum !== 100) newInstruments.savings += (100 - totalSum);
    }

    set(s => {
      const currentEvt = s.currentEvent;
      const choiceLabel = currentEvt?.options?.[choiceIndex]?.label || 'Acknowledged';
      const allMessages = [...(changes.statusMessages || [])];

      const finalLoans = [...s.loans];
      if (changes.newLoans && changes.newLoans.length > 0) finalLoans.push(...changes.newLoans);

      const newState = {
        pool: newPool,
        funds: updatedFunds,
        currentEvent: null,
        loans: finalLoans,
        eventHistory: [
          {
            day: s.currentDay,
            eventName: currentEvt?.name || 'Life Event',
            icon: currentEvt?.icon || '📝',
            choice: choiceLabel,
            choiceIndex,
            poolDelta: poolDelta,
            outcome: `${fundShieldMessage}${allMessages.join(' ')}`.trim(),
            isAuto: !!extraData.isAuto,
          },
          ...s.eventHistory,
        ],
        decisionHistory: [
          ...(s.decisionHistory || []),
          { day: s.currentDay, type: 'event', eventId: currentEvt?.id, choiceIndex, poolDelta, isAuto: !!extraData.isAuto },
        ],
        recentAutoToast: extraData.isAuto ? {
          id: Date.now(),
          name: currentEvt?.name,
          icon: currentEvt?.icon || '⚡',
          poolDelta,
          choice: choiceLabel,
          message: allMessages.join(' ') || 'Auto-selected after 5s.',
        } : null,
      };

      // Applied instrument updates (e.g. Booking profit sets stocks to 0%)
      if (changes.newInstruments) {
        newState.instruments = changes.newInstruments;
      }

      // Opt-in health insurance
      if (changes.optInHealthInsurance) {
        newState.hasHealthInsurance = true;
        newState.healthInsuranceCost = 750;
      }

      // Certification completion
      if (changes.courseCompletedDelta) {
        newState.courseCompleted = true;
        newState.salaryCeiling = Math.round(s.salaryCeiling * 1.5);
      }

      // Business changes
      if (changes.businessIncomeDelta) {
        newState.businessIncome = Math.max(0, s.businessIncome + changes.businessIncomeDelta);
      }
      if (changes.hasActiveBusinessDelta !== null && changes.hasActiveBusinessDelta !== undefined) {
        newState.hasActiveBusiness = changes.hasActiveBusinessDelta;
      }

      // Income changes
      if (changes.newIncomes.length > 0 || changes.removedIncomes.length > 0) {
        newState.incomes = s.incomes
          .filter(i => !changes.removedIncomes.includes(i.id))
          .concat(changes.newIncomes);
      }

      // New deductions
      if (changes.newDeductions && changes.newDeductions.length > 0) {
        newState.fixedDeductions = [...s.fixedDeductions, ...changes.newDeductions];
      }

      // Utility hike — permanently raises living expense
      if (changes.utilityHikePercent) {
        const base = newState.fixedDeductions || s.fixedDeductions;
        newState.fixedDeductions = base.map(d =>
          d.type === 'living'
            ? { ...d, amount: Math.round(d.amount * (1 + changes.utilityHikePercent)) }
            : d
        );
      }

      // Home value appreciation from full renovation
      if (changes.homeValueIncrease) {
        newState.homesOwned = s.homesOwned.map((h, i) =>
          i === 0 ? { ...h, value: h.value + changes.homeValueIncrease } : h
        );
      }

      // Renovation flag
      if (changes.homeNeedsRenovation === false) {
        newState.homeNeedsRenovation = false;
      }

      // Marriage & Family Milestone flags
      if (changes.married === true || eventWithData.id === 'marriage_event') {
        newState.married = true;
        newState.marriageEventFired = true;
      }
      if (changes.familyWeddingFired === true || eventWithData.id === 'family_wedding') {
        newState.familyWeddingFired = true;
      }

      // Course raise used (one-time)
      if (changes.courseRaiseUsed) {
        newState.courseRaiseUsed = true;
      }

      // Trigger allocation screen only if there are active goals remaining
      const hasActiveGoals = s.goals.some(g => !g.achieved && !g.sacrificed);
      if (changes.triggerAllocation && hasActiveGoals) {
        newState.showAllocation = true;
      }

      return newState;
    });

    // Resume sim if no allocation needed
    if (!get().showAllocation) {
      get().startSimulation();
    }
  },

  // --- Investment Liquidation Resolution ---

  resolveLiquidation: ({ action, assetKey, amount }) => {
    const state = get();
    const currentShortfall = state.deficitInfo?.shortfall || amount || 0;

    if (action === 'liquidate') {
      const assetPercent = state.instruments[assetKey] || 0;
      const freedPercent = Math.min(assetPercent, Math.max(1, Math.round((amount / Math.max(1, state.pool)) * 100)));
      
      const newInstruments = {
        ...state.instruments,
        [assetKey]: Math.max(0, assetPercent - freedPercent),
      };

      let penalty = 0;
      if (assetKey === 'fd') penalty = Math.round(amount * 0.01);

      const paidAmount = Math.min(amount, currentShortfall);
      const remainingShortfall = currentShortfall - paidAmount;

      set(s => ({
        deficitInfo: remainingShortfall > 0 ? { ...s.deficitInfo, shortfall: remainingShortfall } : null,
        instruments: normalizeInstruments(newInstruments),
        pool: Math.max(0, s.pool - paidAmount - penalty),
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Liquidated Investment Holding',
            icon: '📉',
            choice: `Sold ${assetKey.toUpperCase()} (₹${paidAmount.toLocaleString('en-IN')})`,
            poolDelta: -paidAmount,
            outcome: `Liquidated ₹${paidAmount.toLocaleString('en-IN')} of ${assetKey.toUpperCase()} to cover shortfall.`,
          },
          ...s.eventHistory,
        ]
      }));

      if (remainingShortfall <= 0) {
        get().startSimulation();
      }
    } else if (action === 'sell_car') {
      if (!state.carsOwned || state.carsOwned.length === 0) return false;
      const saleValue = 280000;
      const paidAmount = Math.min(saleValue, currentShortfall);
      const netCashAdded = saleValue - paidAmount;
      const remainingShortfall = currentShortfall - paidAmount;

      set(s => ({
        deficitInfo: remainingShortfall > 0 ? { ...s.deficitInfo, shortfall: remainingShortfall } : null,
        pool: s.pool + netCashAdded,
        instruments: normalizeInstruments(s.instruments),
        carsOwned: [],
        carMaintenanceCost: 0,
        hasVehicleInsurance: false,
        vehicleInsuranceCost: 0,
        player: { ...s.player, carOwned: false },
        financialChanged: true,
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Sold Vehicle to Clear Shortfall',
            icon: '🚗',
            choice: 'Sold Car',
            poolDelta: netCashAdded,
            outcome: `Sold car for ₹${saleValue.toLocaleString('en-IN')}, paid ₹${paidAmount.toLocaleString('en-IN')} shortfall, and pocketed ₹${netCashAdded.toLocaleString('en-IN')} cash buffer!`,
          },
          ...s.eventHistory,
        ]
      }));

      if (remainingShortfall <= 0) {
        get().startSimulation();
      }
    } else if (action === 'sell_home') {
      if (!state.homesOwned || state.homesOwned.length === 0) return false;
      const homeToSell = state.homesOwned[0];
      const saleValue = homeToSell.value || 0;
      const paidAmount = Math.min(saleValue, currentShortfall);
      const netCashAdded = saleValue - paidAmount;
      const remainingShortfall = currentShortfall - paidAmount;
      const remainingHomes = state.homesOwned.slice(1);

      let updatedDeductions = [...state.fixedDeductions];
      if (remainingHomes.length === 0) {
        const cityTier = state.player?.cityTier || 2;
        const rentBand = RENT_RANGES[cityTier] || { min: 8000, max: 15000 };
        const rentCost = state.player?.rentCost || randInt(rentBand.min, rentBand.max);
        const existingRentIndex = updatedDeductions.findIndex(d => d.type === 'rent');
        if (existingRentIndex >= 0) {
          updatedDeductions[existingRentIndex] = { ...updatedDeductions[existingRentIndex], amount: rentCost };
        } else {
          updatedDeductions.push({ id: 'rent', type: 'rent', amount: rentCost, name: 'House Rent' });
        }
      }

      set(s => ({
        deficitInfo: remainingShortfall > 0 ? { ...s.deficitInfo, shortfall: remainingShortfall } : null,
        pool: s.pool + netCashAdded,
        homesOwned: remainingHomes,
        homeMaintenanceCost: Math.max(0, s.homeMaintenanceCost - (homeToSell.maintenanceCost || 0)),
        fixedDeductions: updatedDeductions,
        instruments: normalizeInstruments(s.instruments),
        financialChanged: true,
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Sold Real Estate to Clear Shortfall',
            icon: '🏠',
            choice: 'Sold Property',
            poolDelta: netCashAdded,
            outcome: `Sold property for ₹${saleValue.toLocaleString('en-IN')}, cleared ₹${paidAmount.toLocaleString('en-IN')} shortfall, and added ₹${netCashAdded.toLocaleString('en-IN')} to cash pool!`,
          },
          ...s.eventHistory,
        ]
      }));

      if (remainingShortfall <= 0) {
        get().startSimulation();
      }
    } else if (action === 'sell_business') {
      if (!state.hasActiveBusiness || (state.businessIncome || 0) <= 0) return false;
      const saleValue = Math.round(state.businessIncome * 22);
      const paidAmount = Math.min(saleValue, currentShortfall);
      const netCashAdded = saleValue - paidAmount;
      const remainingShortfall = currentShortfall - paidAmount;

      set(s => ({
        deficitInfo: remainingShortfall > 0 ? { ...s.deficitInfo, shortfall: remainingShortfall } : null,
        pool: s.pool + netCashAdded,
        hasActiveBusiness: false,
        businessIncome: 0,
        instruments: normalizeInstruments(s.instruments),
        financialChanged: true,
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Liquidated Business Equity',
            icon: '💼',
            choice: 'Exited Venture',
            poolDelta: netCashAdded,
            outcome: `Sold venture for ₹${saleValue.toLocaleString('en-IN')}, cleared ₹${paidAmount.toLocaleString('en-IN')} shortfall, and added ₹${netCashAdded.toLocaleString('en-IN')} cash!`,
          },
          ...s.eventHistory,
        ]
      }));

      if (remainingShortfall <= 0) {
        get().startSimulation();
      }
    } else if (action === 'emergency_loan') {
      const loanAmount = currentShortfall || amount || 10000;
      const monthlyRate = 0.12 / 12;
      const tenure = 24;
      const emi = Math.max(500, Math.round(
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1)
      ));

      // Strict underwriting check: player must be able to afford the EMI!
      if (!get().canAffordLoan(emi)) {
        return false;
      }

      const newLoan = {
        id: `loan_emergency_${Date.now()}`,
        name: 'Emergency Personal Loan',
        principal: Math.round(loanAmount),
        emi,
        remainingMonths: tenure,
        rate: 12.0,
        type: 'personal',
      };

      set(s => ({
        deficitInfo: null,
        instruments: normalizeInstruments(s.instruments),
        loans: [...s.loans, newLoan],
        eventHistory: [
          {
            day: s.currentDay,
            eventName: 'Emergency Loan Issued',
            icon: '💳',
            choice: 'Preserved Portfolio via Loan',
            poolDelta: 0,
            outcome: `Funded ₹${loanAmount.toLocaleString('en-IN')} shortfall via an Emergency Loan (EMI: ₹${emi}/mo) at 12% p.a.`,
          },
          ...s.eventHistory,
        ]
      }));

      get().startSimulation();
    } else if (action === 'declare_insolvency') {
      let results = null;
      try {
        results = calculateResults(get());
      } catch (e) {
        console.error("Scorecard calculation error at declare_insolvency:", e);
      }
      set({
        deficitInfo: null,
        gameOver: true,
        gameOverReason: 'broke',
        simRunning: false,
        results,
        screen: 'scorecard',
      });
      get().pauseSimulation();
    }
  },

  downsizeHousing: () => {
    const state = get();
    const rentDeduction = state.fixedDeductions.find(d => d.type === 'rent');
    if (!rentDeduction) return false;

    const minRent = 4000;
    if (rentDeduction.amount <= minRent) return false;

    const savings = Math.max(2000, Math.round(rentDeduction.amount * 0.35));
    const newRent = Math.max(minRent, rentDeduction.amount - savings);

    set(s => ({
      fixedDeductions: s.fixedDeductions.map(d =>
        d.type === 'rent' ? { ...d, amount: newRent, name: 'House Rent (Budget Apartment)' } : d
      ),
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Downsized Rental Housing',
          icon: '📦',
          choice: 'Moved to budget housing',
          poolDelta: 0,
          outcome: `Moved into a modest, older budget home. Saved ₹${savings.toLocaleString('en-IN')}/mo in rent! (Now ₹${newRent.toLocaleString('en-IN')}/mo).`,
        }
      ]
    }));
    return true;
  },

  relocateCity: (targetTier) => {
    const state = get();
    if (state.player.cityTier === targetTier) return;

    const targetMeta = CITY_TIERS[targetTier];
    const newLiving = targetMeta.livingCost[0];
    const newRent = targetMeta.minRent;

    set(s => ({
      player: { ...s.player, cityTier: targetTier },
      fixedDeductions: s.fixedDeductions.map(d => {
        if (d.type === 'living') return { ...d, amount: newLiving };
        if (d.type === 'rent') return { ...d, amount: newRent };
        return d;
      }),
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Relocated City',
          icon: '🚚',
          choice: `Moved to Tier ${targetTier} City`,
          poolDelta: 0,
          outcome: `Relocated to ${targetMeta.name}. Living cost reduced to ₹${newLiving.toLocaleString('en-IN')}/mo and rent to ₹${newRent.toLocaleString('en-IN')}/mo.`,
        }
      ]
    }));
  },

  toggleAusterityMode: () => {
    set(s => {
      const active = !s.isAusterityMode;
      const factor = active ? 0.75 : 1.333;
      return {
        isAusterityMode: active,
        fixedDeductions: s.fixedDeductions.map(d =>
          d.type === 'living'
            ? { ...d, amount: Math.round(d.amount * factor), name: active ? 'Food & Utilities (Austerity Mode: -25%)' : 'Food & Utilities' }
            : d
        ),
        eventHistory: [
          ...s.eventHistory,
          {
            day: s.currentDay,
            eventName: active ? 'Activated Austerity Mode' : 'Deactivated Austerity Mode',
            icon: '✂️',
            choice: active ? 'Cut discretionary expenses' : 'Restored standard lifestyle',
            poolDelta: 0,
            outcome: active
              ? 'Trimmed 25% of discretionary groceries, dining, and utility consumption.'
              : 'Restored standard household consumption.',
          }
        ]
      };
    });
  },

  sellCar: () => {
    const state = get();
    if (!state.carsOwned || state.carsOwned.length === 0) return false;
    const saleValue = 280000;

    set(s => ({
      pool: s.pool + saleValue,
      carsOwned: [],
      carMaintenanceCost: 0,
      hasVehicleInsurance: false,
      vehicleInsuranceCost: 0,
      player: { ...s.player, carOwned: false },
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Sold Vehicle',
          icon: '🚗',
          choice: 'Cashed out Car',
          poolDelta: saleValue,
          outcome: `Sold car for ₹${saleValue.toLocaleString('en-IN')} cash and eliminated ₹${s.carMaintenanceCost}/mo recurring maintenance liability!`,
        }
      ]
    }));
    return true;
  },

  reinvestInBusiness: (amount = 50000) => {
    const state = get();
    if (!state.hasActiveBusiness || state.pool < amount) return false;
    const monthlyBoost = 8000;

    set(s => ({
      pool: s.pool - amount,
      businessIncome: (s.businessIncome || 0) + monthlyBoost,
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Reinvested in Business',
          icon: '💼',
          choice: `Reinvested ₹${amount.toLocaleString('en-IN')}`,
          poolDelta: -amount,
          outcome: `Expanded business equipment and marketing! Monthly venture profit grew by +₹${monthlyBoost.toLocaleString('en-IN')}/mo.`,
        }
      ]
    }));
    return true;
  },

  sellBusiness: () => {
    const state = get();
    if (!state.hasActiveBusiness || (state.businessIncome || 0) <= 0) return false;
    const saleValue = Math.round(state.businessIncome * 22);

    set(s => ({
      pool: s.pool + saleValue,
      hasActiveBusiness: false,
      businessIncome: 0,
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Exited Business Venture',
          icon: '🤝',
          choice: 'Sold Venture',
          poolDelta: saleValue,
          outcome: `Sold business equity for ₹${saleValue.toLocaleString('en-IN')} lump sum into pool! Eliminated ongoing operational risk.`,
        }
      ]
    }));
    return true;
  },

  takeFreelanceGig: () => {
    const state = get();
    const gigPay = 20000;
    set(s => ({
      incomes: [
        ...s.incomes.filter(i => i.type !== 'job'),
        { id: `gig_${Date.now()}`, type: 'job', amount: gigPay, name: 'Freelance Bridge Income' }
      ],
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Freelance Bridge Project',
          icon: '💻',
          choice: 'Started Contract Work',
          poolDelta: 0,
          outcome: `Secured flexible client consulting contract earning ₹${gigPay.toLocaleString('en-IN')}/mo to cover fixed bills while job seeking.`,
        }
      ]
    }));
  },

  resignJob: () => {
    const state = get();
    const job = state.incomes.find(i => i.type === 'job');
    if (!job) return false;

    const rentalIncome = (state.homesOwned || [])
      .filter(h => h.isRentedOut && h.rentalIncome)
      .reduce((sum, h) => sum + h.rentalIncome, 0);
    const nonJobIncome = (state.businessIncome || 0) +
      rentalIncome +
      state.incomes.filter(i => i.type !== 'job').reduce((s, i) => s + i.amount, 0);

    const totalDeductions = state.fixedDeductions.reduce((s, d) => s + d.amount, 0)
      + state.loans.reduce((s, l) => s + l.emi, 0)
      + (state.hasHealthInsurance ? state.healthInsuranceCost : 0)
      + (state.hasVehicleInsurance ? state.vehicleInsuranceCost : 0)
      + (state.homeMaintenanceCost || 0)
      + (state.carMaintenanceCost || 0);

    if (nonJobIncome < totalDeductions * 0.80) {
      return false;
    }

    set(s => ({
      incomes: s.incomes.filter(i => i.type !== 'job'),
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Resigned from Corporate Job',
          icon: '🚪',
          choice: 'Quit 9-to-5 Career',
          poolDelta: 0,
          outcome: `Voluntarily resigned from ${job.name} (₹${job.amount.toLocaleString('en-IN')}/mo). Now sustaining lifestyle independently through passive business and rental income!`,
        }
      ]
    }));
    return true;
  },

  applyForNewJob: (offer) => {
    const state = get();
    if (!offer || !offer.salary) return false;

    const currentJob = state.incomes.find(i => i.type === 'job');
    const oldSalary = currentJob ? currentJob.amount : 0;
    const cooldown = getJobSwitchCooldown(oldSalary);

    // Dynamic Cooldown: increases with seniority
    if (state.lastJobSwitchDay && (state.currentDay - state.lastJobSwitchDay) < cooldown) {
      return false;
    }

    const cityTier = state.player?.cityTier || 2;
    const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;
    const targetSalary = Math.min(cap, offer.salary);
    const hike = targetSalary - oldSalary;
    const hikePct = oldSalary > 0 ? Math.round((hike / oldSalary) * 100) : 100;

    const newIncomes = [
      ...state.incomes.filter(i => i.type !== 'job'),
      {
        id: `job_${Date.now()}`,
        type: 'job',
        amount: targetSalary,
        name: offer.role || 'Corporate Specialist',
      }
    ];

    set(s => ({
      incomes: newIncomes,
      financialChanged: true,
      lastJobSwitchDay: s.currentDay,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Career Move / Job Switch',
          icon: '💼',
          choice: `Accepted offer at ${offer.company}`,
          poolDelta: 0,
          outcome: oldSalary > 0
            ? `Switched to ${offer.role} at ${offer.company}! Salary grew from ₹${oldSalary.toLocaleString('en-IN')}/mo to ₹${targetSalary.toLocaleString('en-IN')}/mo (+₹${hike.toLocaleString('en-IN')}/mo, +${hikePct}% hike).`
            : `Secured full-time employment as ${offer.role} at ${offer.company} earning ₹${targetSalary.toLocaleString('en-IN')}/mo!`,
        }
      ]
    }));

    return true;
  },

  requestAppraisal: () => {
    const state = get();
    const currentJob = state.incomes.find(i => i.type === 'job');
    if (!currentJob) return false;

    // Cooldown: at least 270 days between appraisal reviews
    if (state.lastAppraisalDay && (state.currentDay - state.lastAppraisalDay) < 270) {
      return false;
    }

    const cityTier = state.player?.cityTier || 2;
    const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;
    const currentSalary = currentJob.amount;

    if (currentSalary >= cap) {
      return false; // already at or above ceiling
    }

    const maxAllowedHike = cap - currentSalary;
    const hikePercent = currentSalary < 90000 ? randFloat(0.08, 0.12) : randFloat(0.04, 0.07);
    const hikeAmount = Math.min(maxAllowedHike, Math.round(currentSalary * hikePercent));
    const newSalary = currentSalary + hikeAmount;
    const expMonths = (state.experienceMonths || 0) + 12;
    const newRole = getCareerRole(expMonths, newSalary);

    set(s => ({
      incomes: s.incomes.map(i => i.id === currentJob.id ? { ...i, amount: newSalary, name: newRole } : i),
      financialChanged: true,
      lastAppraisalDay: s.currentDay,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Annual Merit Appraisal',
          icon: '📈',
          choice: 'Requested Performance Appraisal',
          poolDelta: 0,
          outcome: `Management approved your merit appraisal! Promoted to ${newRole} with a +₹${hikeAmount.toLocaleString('en-IN')}/mo (+${Math.round((hikeAmount / currentSalary) * 100)}%) raise to ₹${newSalary.toLocaleString('en-IN')}/mo (Tier ${cityTier} cap: ₹${(cap / 100000).toFixed(1)}L).`,
        }
      ]
    }));

    return true;
  },

  // --- Proactive Financial Actions (Player Choice) ---

  takePersonalLoan: (principal, tenureMonths = 24, rate = 0.12, name = 'Personal Loan') => {
    const monthlyRate = rate / 12;
    const emi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );

    // Check if player can afford this EMI
    if (!get().canAffordLoan(emi)) return false;

    const newLoan = {
      id: `loan_${Date.now()}`,
      name,
      principal,
      emi,
      remainingMonths: tenureMonths,
      rate: rate * 100,
      type: 'personal',
    };

    set(s => ({
      pool: s.pool + principal,
      loans: [...s.loans, newLoan],
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Personal Loan Disbursed',
          icon: '🏦',
          choice: `Took ₹${principal.toLocaleString('en-IN')} loan`,
          poolDelta: principal,
          outcome: `Received ₹${principal.toLocaleString('en-IN')} cash into pool. Monthly EMI: ₹${emi.toLocaleString('en-IN')}/mo.`,
        }
      ]
    }));
  },

  repayLoanEarly: (loanId) => {
    const state = get();
    const loan = state.loans.find(l => l.id === loanId);
    if (!loan) return false;
    // Compute approximate remaining principal based on remaining EMIs
    const monthlyRate = (loan.rate / 100) / 12;
    let remainingPrincipal;
    if (monthlyRate > 0) {
      const totalMonths = loan.remainingMonths;
      remainingPrincipal = Math.round(
        loan.emi * (1 - Math.pow(1 + monthlyRate, -totalMonths)) / monthlyRate
      );
    } else {
      remainingPrincipal = loan.emi * loan.remainingMonths;
    }
    remainingPrincipal = Math.min(remainingPrincipal, loan.principal);
    if (state.pool < remainingPrincipal) return false;

    set(s => ({
      pool: s.pool - remainingPrincipal,
      loans: s.loans.filter(l => l.id !== loanId),
      financialChanged: true,
      eventHistory: [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: 'Loan Prepayment',
          icon: '✅',
          choice: `Repaid ${loan.name}`,
          poolDelta: -remainingPrincipal,
          outcome: `Paid off ₹${remainingPrincipal.toLocaleString('en-IN')} early! Eliminated ₹${loan.emi.toLocaleString('en-IN')}/mo EMI drag.`,
        }
      ]
    }));
    return true;
  },

  achieveGoalEarly: (goalId) => {
    const state = get();
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal || goal.achieved || goal.sacrificed || state.pool < goal.currentTarget) return false;

    get().resolveMilestone(goalId, 'spend');
    return true;
  },

  achieveGoalWithLoan: (goalId, downPaymentAmount = null, tenureMonths = null, interestRate = null) => {
    const state = get();
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return false;

    let tenure = tenureMonths;
    let rate = interestRate;
    let defaultDownPct = 0.20;

    if (goal.type === 'home') {
      tenure = tenure || 180;
      rate = rate || 0.085;
      defaultDownPct = 0.20;
    } else if (goal.type === 'car') {
      tenure = tenure || 60;
      rate = rate || 0.095;
      defaultDownPct = 0.15;
    } else {
      tenure = tenure || 36;
      rate = rate || 0.115;
      defaultDownPct = 0.10;
    }

    const minimumDown = Math.round(goal.currentTarget * 0.05); // At least 5%
    if (state.pool < minimumDown) return false; // Can't afford minimum down payment

    const downPayment = downPaymentAmount !== null
      ? Math.min(state.pool, Math.max(0, downPaymentAmount))
      : Math.min(state.pool, Math.round(goal.currentTarget * defaultDownPct));

    const loanPrincipal = Math.max(0, goal.currentTarget - downPayment);
    if (loanPrincipal <= 0) {
      return get().achieveGoalEarly(goalId);
    }

    const monthlyRate = rate / 12;
    const emi = Math.round(
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1)
    );

    // Strict loan eligibility check
    if (!get().canAffordLoan(emi)) return false;

    const loanType = goal.type === 'home' ? 'home' : goal.type === 'car' ? 'vehicle' : 'personal';
    const newLoan = {
      id: `loan_goal_${Date.now()}`,
      name: `${goal.name} Loan`,
      principal: Math.round(loanPrincipal),
      emi,
      remainingMonths: tenure,
      rate: Math.round(rate * 1000) / 10,
      type: loanType,
    };

    set(s => {
      const newState = {
        pool: Math.max(0, s.pool - downPayment),
        loans: [...s.loans, newLoan],
        goals: s.goals.map(g =>
          g.id === goalId ? { ...g, achieved: true, achievedDay: s.currentDay, bucketPercent: 0 } : g
        ),
      };

      const newBuckets = redistributeBuckets(s.goals, goalId, 'redistribute');
      newState.buckets = newBuckets;
      newState.goals = newState.goals.map(g => ({
        ...g,
        bucketPercent: g.achieved ? 0 : (newBuckets[g.id] ?? g.bucketPercent),
      }));

      newState.decisionHistory = [
        ...s.decisionHistory,
        {
          day: s.currentDay,
          type: 'goal_achieved_with_loan',
          goalId,
          goalName: goal.name,
          downPayment,
          loanPrincipal,
          emi,
        },
      ];

      newState.eventHistory = [
        ...s.eventHistory,
        {
          day: s.currentDay,
          eventName: `Milestone Achieved with Loan: ${goal.name}`,
          icon: goal.type === 'home' ? '🏡' : goal.type === 'car' ? '🚗' : '🎯',
          choice: `Funded via ₹${downPayment.toLocaleString('en-IN')} Down Payment + Loan`,
          poolDelta: -downPayment,
          outcome: `Achieved ${goal.name}! Paid ₹${downPayment.toLocaleString('en-IN')} cash. Took ₹${loanPrincipal.toLocaleString('en-IN')} ${goal.name} Loan (EMI: ₹${emi.toLocaleString('en-IN')}/mo).`,
        },
      ];

      // Post-purchase consequences
      if (goal.type === 'car') {
        const maintenanceCost = randInt(2000, 5000);
        newState.carMaintenanceCost = (s.carMaintenanceCost || 0) + maintenanceCost;
        newState.carsOwned = [...s.carsOwned, { id: `car_${Date.now()}`, maintenanceCost, purchaseDay: s.currentDay }];
        newState.player = { ...s.player, carOwned: true };
        newState.vehicleInsuranceCost = s.vehicleInsuranceCost || 350;
      } else if (goal.type === 'home') {
        const homeValue = goal.currentTarget;
        const isSecondHome = s.homesOwned.length >= 1;
        const rentalIncome = isSecondHome ? randInt(8000, 22000) : 0;

        newState.homesOwned = [...s.homesOwned, {
          id: `home_${Date.now()}`,
          value: homeValue,
          isRentedOut: isSecondHome,
          rentalIncome,
          maintenanceCost: randInt(3000, 8000),
          purchasePrice: homeValue,
          purchaseDay: s.currentDay,
          label: isSecondHome ? 'Investment Property' : 'Primary Residence',
        }];
        newState.homeMaintenanceCost = (s.homeMaintenanceCost || 0) + randInt(3000, 8000);
        if (!isSecondHome) {
          newState.fixedDeductions = s.fixedDeductions.filter(d => d.type !== 'rent');
          newState.player = {
            ...s.player,
            homeOwned: true,
            isRenting: false,
            rentCost: 0,
          };
        }
      } else if (goal.type === 'business') {
        newState.hasActiveBusiness = true;
        newState.businessIncome = randInt(0, 12000);
      } else if (goal.type === 'marriage') {
        newState.married = true;
        newState.marriageEventFired = true;
      }

      return newState;
    });

    return true;
  },

  depositToFd: (amount) => {
    const state = get();
    const savingsAmount = (state.instruments.savings / 100) * state.pool;
    if (amount > savingsAmount || amount <= 0 || state.pool <= 0) return false;

    // Shift percentage from savings to FD
    const shiftPercent = Math.round((amount / state.pool) * 100);
    if (shiftPercent <= 0) return false;

    const newSavings = Math.max(0, state.instruments.savings - shiftPercent);
    const newFd = state.instruments.fd + shiftPercent;

    set({
      instruments: {
        ...state.instruments,
        savings: newSavings,
        fd: newFd,
      }
    });
    return true;
  },

  withdrawFd: (amount) => {
    const state = get();
    const fdAmount = (state.instruments.fd / 100) * state.pool;
    if (amount > fdAmount || amount <= 0 || state.pool <= 0) return false;

    // 1% early break penalty on FD
    const penalty = Math.round(amount * 0.01);
    const shiftPercent = Math.round((amount / state.pool) * 100);

    const newFd = Math.max(0, state.instruments.fd - shiftPercent);
    const newSavings = state.instruments.savings + shiftPercent;

    set(s => ({
      pool: Math.max(0, s.pool - penalty),
      instruments: {
        ...s.instruments,
        fd: newFd,
        savings: newSavings,
      }
    }));
    return true;
  },

  // --- Milestone resolution ---

  resolveMilestone: (goalId, action) => {
    set(s => {
      const goal = s.goals.find(g => g.id === goalId);
      if (!goal) return {};

      const newState = { showMilestone: null };

      if (action === 'spend') {
        // Goal achieved — deduct from pool
        newState.pool = Math.max(0, s.pool - goal.currentTarget);
        newState.goals = s.goals.map(g =>
          g.id === goalId ? { ...g, achieved: true, achievedDay: s.currentDay, bucketPercent: 0 } : g
        );
        // Redistribute the freed bucket percentage
        const newBuckets = redistributeBuckets(s.goals, goalId, 'redistribute');
        newState.buckets = newBuckets;
        newState.goals = newState.goals.map(g => ({
          ...g,
          bucketPercent: g.achieved ? 0 : (newBuckets[g.id] ?? g.bucketPercent),
        }));
        newState.decisionHistory = [
          ...s.decisionHistory,
          { day: s.currentDay, type: 'goal_achieved', goalId, goalName: goal.name },
        ];

        // Post-purchase consequences (§10)
        if (goal.type === 'car') {
          const maintenanceCost = randInt(2000, 5000);
          newState.carMaintenanceCost = (s.carMaintenanceCost || 0) + maintenanceCost;
          newState.carsOwned = [...s.carsOwned, { id: `car_${Date.now()}`, maintenanceCost, purchaseDay: s.currentDay }];
          newState.player = { ...s.player, carOwned: true };
          newState.vehicleInsuranceCost = s.vehicleInsuranceCost || 350;
        } else if (goal.type === 'home') {
          const homeValue = goal.currentTarget;
          const isSecondHome = s.homesOwned.length >= 1;
          const rentalIncome = isSecondHome ? randInt(8000, 22000) : 0;

          newState.homesOwned = [...s.homesOwned, {
            id: `home_${Date.now()}`,
            value: homeValue,
            isRentedOut: isSecondHome,       // auto-rent second home
            rentalIncome,
            maintenanceCost: randInt(3000, 8000),
            purchasePrice: homeValue,
            purchaseDay: s.currentDay,
            label: isSecondHome ? 'Investment Property' : 'Primary Residence',
          }];
          newState.homeMaintenanceCost = (s.homeMaintenanceCost || 0) + randInt(3000, 8000);
          // Only remove rent deduction when buying PRIMARY home
          if (!isSecondHome) {
            newState.fixedDeductions = s.fixedDeductions.filter(d => d.type !== 'rent');
            newState.player = {
              ...s.player,
              homeOwned: true,
              isRenting: false,
              rentCost: 0,
            };
          }
        } else if (goal.type === 'business') {
          newState.hasActiveBusiness = true;
          // Initial venture phase: modest early traction (₹0 - ₹12,000/mo) that fluctuates
          newState.businessIncome = randInt(0, 12000);
        } else if (goal.type === 'marriage') {
          newState.married = true;
          newState.marriageEventFired = true;
        }
      } else if (action === 'grow') {
        // Raise the target by 25%
        newState.goals = s.goals.map(g =>
          g.id === goalId ? { ...g, currentTarget: Math.round(g.currentTarget * 1.25) } : g
        );
      } else if (action === 'delete') {
        // Sacrifice the goal
        newState.goals = s.goals.map(g =>
          g.id === goalId ? { ...g, sacrificed: true, bucketPercent: 0 } : g
        );
        const newBuckets = redistributeBuckets(s.goals, goalId, 'redistribute');
        newState.buckets = newBuckets;
        newState.goals = newState.goals.map(g => ({
          ...g,
          bucketPercent: g.sacrificed ? 0 : (newBuckets[g.id] ?? g.bucketPercent),
        }));
        newState.decisionHistory = [
          ...s.decisionHistory,
          { day: s.currentDay, type: 'sacrifice_goal', goalId, goalName: goal.name },
        ];
      }

      return newState;
    });

    get().startSimulation();
  },

  // --- Insurance ---

  buyInsurance: (type) => {
    set(s => {
      if (type === 'health') {
        const cost = randInt(INSURANCE_COSTS.health[0], INSURANCE_COSTS.health[1]);
        return { hasHealthInsurance: true, healthInsuranceCost: cost, financialChanged: true };
      }
      if (type === 'vehicle') {
        const cost = randInt(INSURANCE_COSTS.vehicle[0], INSURANCE_COSTS.vehicle[1]);
        return { hasVehicleInsurance: true, vehicleInsuranceCost: cost, financialChanged: true };
      }
      return {};
    });
  },

  // --- Asset management ---

  toggleHomeRental: (homeId) => {
    set(s => {
      const home = s.homesOwned.find(h => h.id === homeId);
      if (!home) return {};
      // Cannot rent out primary residence if player lives in it
      const isPrimary = !s.player?.isRenting && s.homesOwned.indexOf(home) === 0;
      if (isPrimary) return {};

      const cityTier = s.player?.cityTier || 2;
      const rentBand = { 1: { min: 15000, max: 30000 }, 2: { min: 8000, max: 18000 }, 3: { min: 5000, max: 10000 } };
      const band = rentBand[cityTier] || rentBand[2];
      const newRentalIncome = home.isRentedOut ? 0 : randInt(band.min, band.max);

      return {
        financialChanged: true,
        homesOwned: s.homesOwned.map(h =>
          h.id === homeId
            ? { ...h, isRentedOut: !h.isRentedOut, rentalIncome: newRentalIncome }
            : h
        ),
      };
    });
  },

  sellHome: (homeId) => {
    set(s => {
      const home = s.homesOwned.find(h => h.id === homeId);
      if (!home) return {};
      const remainingHomes = s.homesOwned.filter(h => h.id !== homeId);
      const newState = {
        pool: s.pool + (home.value || 0),
        homesOwned: remainingHomes,
        homeMaintenanceCost: Math.max(0, s.homeMaintenanceCost - (home.maintenanceCost || 0)),
        financialChanged: true,
        decisionHistory: [
          ...s.decisionHistory,
          { day: s.currentDay, type: 'sell_home', value: home.value },
        ],
      };

      // If no homes are left, the player must rent a place to live! Automatically add rent deduction.
      if (remainingHomes.length === 0) {
        const cityTier = s.player?.cityTier || 2;
        const rentBand = RENT_RANGES[cityTier] || { min: 8000, max: 15000 };
        const rentCost = s.player?.rentCost || randInt(rentBand.min, rentBand.max);

        let updatedDeductions = [...s.fixedDeductions];
        const existingRentIndex = updatedDeductions.findIndex(d => d.type === 'rent');
        if (existingRentIndex >= 0) {
          updatedDeductions[existingRentIndex] = {
            ...updatedDeductions[existingRentIndex],
            amount: rentCost,
          };
        } else {
          updatedDeductions.push({
            id: 'rent',
            type: 'rent',
            amount: rentCost,
            name: 'House Rent',
          });
        }
        newState.fixedDeductions = updatedDeductions;
        newState.player = {
          ...s.player,
          homeOwned: false,
          isRenting: true,
          rentCost,
        };
      }

      return newState;
    });
  },

  upgradeLifestyle: ({ type, name, costDelta }) => {
    set(s => {
      let updatedDeductions = [...s.fixedDeductions];
      let updatedPlayer = { ...s.player };

      if (type === 'city_tier') {
        const currentTier = s.player?.cityTier || 2;
        if (currentTier <= 1) return {};
        const newTier = currentTier - 1;
        const rentIncrease = 12000;
        const livingIncrease = 8000;
        updatedPlayer.cityTier = newTier;
        updatedDeductions = updatedDeductions.map(d => {
          if (d.type === 'living') return { ...d, amount: d.amount + livingIncrease };
          if (d.type === 'rent') return { ...d, amount: d.amount + rentIncrease };
          return d;
        });
      } else {
        // Luxury expense e.g. Gourmet Dining / Premium Leisure / Travel
        updatedDeductions.push({
          id: `luxury_${Date.now()}`,
          type: 'luxury',
          name: name || 'Luxury Dining & Leisure',
          amount: costDelta || 10000,
        });
      }

      return {
        fixedDeductions: updatedDeductions,
        player: updatedPlayer,
        decisionHistory: [
          ...s.decisionHistory,
          { day: s.currentDay, type: 'lifestyle_upgrade', name, costDelta }
        ]
      };
    });
  },

  // --- Allocation ---

  confirmAllocation: (allocationData) => {
    set(s => {
      let goalAllocs = {};
      let fundAllocs = {};

      if (allocationData && (allocationData.goalAllocations || allocationData.fundAllocations)) {
        goalAllocs = allocationData.goalAllocations || {};
        fundAllocs = allocationData.fundAllocations || {};
      } else if (allocationData && typeof allocationData === 'object') {
        Object.entries(allocationData).forEach(([key, val]) => {
          if ((s.funds || []).some(f => f.id === key)) {
            fundAllocs[key] = val;
          } else {
            goalAllocs[key] = val;
          }
        });
      }

      const updatedGoals = s.goals.map(g => ({
        ...g,
        bucketPercent: goalAllocs[g.id] !== undefined ? goalAllocs[g.id] : (s.buckets?.[g.id] || 0),
      }));

      const updatedFunds = (s.funds || []).map(f => ({
        ...f,
        allocationPercent: fundAllocs[f.id] !== undefined ? fundAllocs[f.id] : (s.fundAllocations?.[f.id] || 0),
      }));

      return {
        buckets: goalAllocs,
        goals: updatedGoals,
        fundAllocations: fundAllocs,
        funds: updatedFunds,
        showAllocation: false,
        financialChanged: true,
      };
    });
    get().startSimulation();
  },

  closeAllocation: () => {
    set({ showAllocation: false });
    get().startSimulation();
  },

  closeMonthlyLedger: () => {
    set({ showMonthlyLedger: false });
    get().startSimulation();
  },

  setActiveTab: (tab) => set(s => ({ activeTab: s.activeTab === tab ? null : tab })),

  // --- Save / Load / Reset ---

  saveGame: () => {
    const state = get();
    // Exclude non-serializable values (interval ID)
    const { simIntervalId, ...saveable } = state;
    try {
      localStorage.setItem('cashflow-game-save', JSON.stringify(saveable));
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  },

  loadGame: () => {
    try {
      const saved = localStorage.getItem('cashflow-game-save');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Don't restore running state — player resumes paused
        set({ ...parsed, simRunning: false, simIntervalId: null });
        return true;
      }
    } catch (e) {
      console.warn('Failed to load game:', e);
    }
    return false;
  },

  hasSavedGame: () => {
    return !!localStorage.getItem('cashflow-game-save');
  },

  resetGame: () => {
    const { simIntervalId } = get();
    if (simIntervalId) clearInterval(simIntervalId);
    localStorage.removeItem('cashflow-game-save');
    set({
      screen: 'landing',
      player: null,
      pool: 0,
      buckets: {},
      instruments: { savings: 100, stocks: 0, gold: 0, mf: 0, fd: 0 },
      goals: [],
      funds: [],
      fundAllocations: {},
      incomes: [],
      fixedDeductions: [],
      loans: [],
      hasHealthInsurance: false,
      hasVehicleInsurance: false,
      healthInsuranceCost: 0,
      vehicleInsuranceCost: 0,
      homeMaintenanceCost: 0,
      carMaintenanceCost: 0,
      currentDay: 0,
      lastEventDay: 0,
      simRunning: false,
      simIntervalId: null,
      currentEvent: null,
      showAllocation: false,
      showMilestone: null,
      activeTab: null,
      gameOver: false,
      gameOverReason: null,
      eventHistory: [],
      decisionHistory: [],
      monthlySnapshots: [],
      results: null,
      homesOwned: [],
      carsOwned: [],
      hasActiveBusiness: false,
      businessIncome: 0,
      experienceMonths: 0,
      courseCompleted: false,
      courseRaiseUsed: false,
      salaryCeiling: 0,
      marriageEventFired: false,
      familyWeddingFired: false,
      married: false,
      homeNeedsRenovation: false,
      recentAutoToast: null,
      currentYearStatements: [],
      monthlyStatementsHistory: [],
      annualIncomeAcc: 0,
    });
  },

  canAffordLoan: (proposedEMI) => {
    const state = get();
    const totalIncome = state.incomes.reduce((s, i) => s + i.amount, 0)
      + (state.businessIncome || 0)
      + (state.homesOwned || []).filter(h => h.isRentedOut).reduce((s, h) => s + (h.rentalIncome || 0), 0);
    const totalDeductions = state.fixedDeductions.reduce((s, d) => s + d.amount, 0)
      + state.loans.reduce((s, l) => s + l.emi, 0)
      + (state.hasHealthInsurance ? state.healthInsuranceCost : 0)
      + (state.hasVehicleInsurance ? state.vehicleInsuranceCost : 0)
      + (state.homeMaintenanceCost || 0)
      + (state.carMaintenanceCost || 0);
    const surplus = totalIncome - totalDeductions;
    return surplus >= proposedEMI;
  },
}));

// ─── Helper: build marriage event ───

function buildMarriageEvent(state) {
  const tier = state.player?.cityTier || 2;
  const costs = {
    1: [1200000, 2500000],
    2: [700000, 1800000],
    3: [500000, 1200000],
  };
  const [wMin, wMax] = costs[tier] || costs[2];
  const weddingCost = randInt(wMin, wMax);
  const loanAmt = Math.round(weddingCost * 0.6);
  const monthlyRate = 0.108 / 12;
  const emi = Math.round(
    (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, 36)) /
    (Math.pow(1 + monthlyRate, 36) - 1)
  );
  const marriageAge = state.player?.marriageAge || 28;

  return {
    id: 'marriage_event',
    name: `Your Wedding Day! 💍`,
    type: 'choice',
    icon: '💍',
    description: `You've reached the age of ${Math.floor(marriageAge)}. It's time to celebrate your wedding! How would you like to handle the expenses?`,
    financialImpact: { type: 'marriage', weddingCost, loanAmt, emi },
    options: [
      {
        label: `Grand Wedding — Pay ₹${weddingCost.toLocaleString('en-IN')} from Savings`,
        description: 'Full Indian wedding with all ceremonies. Deducted from your liquid pool.',
      },
      {
        label: `Wedding Loan — EMI ₹${emi.toLocaleString('en-IN')}/mo × 36 months`,
        description: `Borrow ₹${loanAmt.toLocaleString('en-IN')} at 10.8% interest to preserve cash.`,
      },
      {
        label: 'Court Marriage — ₹50,000 Only',
        description: 'Simple registered marriage. Save your money for a home and future.',
      },
    ],
  };
}

// ─── Helper: build player-facing event options ───

function buildEventOptions(event, state) {
  const options = [];
  let financialImpact = null;

  switch (event.id) {
    case 'medical_emergency':
    case 'uninsured_illness': {
      const billAmount = randInt(60000, 250000);
      const insured = state.hasHealthInsurance && event.id !== 'uninsured_illness';
      const outOfPocket = insured ? Math.round(billAmount * 0.2) : billAmount;
      financialImpact = {
        type: 'loss',
        billAmount,
        outOfPocket,
        insured,
        coveredAmount: insured ? billAmount - outOfPocket : 0,
      };
      options.push({
        label: insured ? `Pay Copay (₹${outOfPocket.toLocaleString('en-IN')})` : `Pay Full Bill (₹${billAmount.toLocaleString('en-IN')})`,
        description: insured
          ? `Health Insurance covers 80% (₹${(billAmount - outOfPocket).toLocaleString('en-IN')}). You pay 20%.`
          : `No active health insurance! Full medical cost comes out of pocket.`
      });
      break;
    }

    case 'job_loss': {
      const activeJobs = state.incomes.filter(i => i.type === 'job');
      const currentSalary = activeJobs.reduce((sum, j) => sum + j.amount, 0);
      const severance = currentSalary * 2;
      financialImpact = {
        type: 'income_loss',
        monthlyLoss: currentSalary,
        severance,
        duration: '2-6 months'
      };
      options.push({
        label: severance > 0 ? `Accept Severance (+₹${severance.toLocaleString('en-IN')}) & Hunt for Roles` : 'Acknowledge & Hunt for Roles',
        description: `2 months severance package credited immediately to liquid savings. Monthly salary drops to strict ₹0.`
      });
      break;
    }

    case 'market_crash':
    case 'mf_correction': {
      const stockVal = Math.round((state.pool * (state.instruments.stocks || 0)) / 100);
      const mfVal = Math.round((state.pool * (state.instruments.mf || 0)) / 100);
      const estimatedDrop = Math.round(stockVal * 0.28 + mfVal * 0.12);
      financialImpact = {
        type: 'market_loss',
        lossAmount: estimatedDrop,
        stockVal,
        mfVal
      };
      options.push({
        label: 'Hold Steady (Ride it out)',
        description: `Stay invested. Absorb estimated ~₹${estimatedDrop.toLocaleString('en-IN')} temporary loss.`
      });
      options.push({
        label: 'Sell 50% Equities to Cash',
        description: `Cut losses immediately and move 50% of stocks/MF to safe savings.`
      });
      break;
    }

    case 'market_boom':
    case 'gold_surge': {
      const isGold = event.id === 'gold_surge';
      const equityShare = isGold ? (state.instruments.gold || 0) : (state.instruments.stocks || 0);
      const holdingVal = Math.round((state.pool * equityShare) / 100);
      const estimatedGain = Math.round(holdingVal * (isGold ? 0.20 : 0.30));
      financialImpact = {
        type: 'gain',
        amount: estimatedGain,
        holdingVal
      };
      options.push({
        label: 'Ride the Rally',
        description: `Keep holdings invested to capture potential further upside.`
      });
      options.push({
        label: isGold ? 'Book Profits (Sell Gold)' : 'Book Profits (Sell Stocks to 0%)',
        description: isGold
          ? `Lock in profits and shift gold holdings safely into Savings.`
          : `Zero out stock allocation (currently ${equityShare}%) and move all gains securely into Savings!`
      });
      break;
    }

    case 'salary_hike': {
      const primaryJob = state.incomes.find(i => i.type === 'job');
      const currentSalary = primaryJob?.amount || 40000;
      const cityTier = state.player?.cityTier || 2;
      const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;
      const hikePercent = currentSalary < 50000 ? randFloat(0.08, 0.12) : randFloat(0.05, 0.08);
      const rawHike = Math.round(currentSalary * hikePercent);
      const newSalary = Math.min(cap, currentSalary + rawHike);
      const hikeAmount = newSalary - currentSalary;
      const expMonths = (state.experienceMonths || 0) + 12;
      const newRole = getCareerRole(expMonths, newSalary);

      financialImpact = {
        type: 'gain_recurring',
        hikeAmount,
        hikePercent: Math.round((hikeAmount / Math.max(1, currentSalary)) * 100),
        newSalary,
        newRole,
      };
      options.push({
        label: hikeAmount > 0 ? `Accept Merit Promotion (+₹${hikeAmount.toLocaleString('en-IN')}/mo) 🎉` : 'Acknowledge Review (At Tier Ceiling)',
        description: hikeAmount > 0
          ? `Promoted to ${newRole}! Monthly salary rises from ₹${currentSalary.toLocaleString('en-IN')} to ₹${newSalary.toLocaleString('en-IN')}/mo (+${Math.round((hikeAmount / currentSalary) * 100)}% hike).`
          : `You are at the Tier ${cityTier} corporate base salary cap (₹${(cap / 100000).toFixed(1)}L/mo).`
      });
      break;
    }

    case 'job_switch': {
      const currentJob = state.incomes.find(i => i.type === 'job');
      const currentSalary = currentJob ? currentJob.amount : 40000;
      const expMonths = state.experienceMonths || 0;
      const cityTier = state.player?.cityTier || 2;
      const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;

      // Realistic hike rates:
      // Option 1: Fast-Growing Tech Scaleup (+16% to +22% hike)
      const startupHikePct = randFloat(0.16, 0.22);
      const startupSalary = Math.min(cap, Math.round(currentSalary * (1 + startupHikePct)));
      const startupDiff = startupSalary - currentSalary;
      const startupRole = getCareerRole(expMonths + 18, startupSalary);

      // Option 2: Established Global MNC (+10% to +15% hike, solid stability)
      const mncHikePct = randFloat(0.10, 0.15);
      const mncSalary = Math.min(cap, Math.round(currentSalary * (1 + mncHikePct)));
      const mncDiff = mncSalary - currentSalary;
      const mncRole = getCareerRole(expMonths + 12, mncSalary);

      // Option 3: Counter-offer to stay (+6% to +8% retention raise)
      const retentionPct = randFloat(0.06, 0.08);
      const retentionSalary = Math.min(cap, Math.round(currentSalary * (1 + retentionPct)));
      const retentionHike = retentionSalary - currentSalary;

      financialImpact = {
        type: 'job_switch',
        currentSalary,
        startupSalary,
        startupRole,
        startupHikePct: Math.round((startupDiff / Math.max(1, currentSalary)) * 100),
        mncSalary,
        mncRole,
        mncHikePct: Math.round((mncDiff / Math.max(1, currentSalary)) * 100),
        retentionSalary,
        retentionHike,
        retentionPct: Math.round((retentionHike / Math.max(1, currentSalary)) * 100),
      };

      options.push({
        label: `Join Tech Venture — ₹${startupSalary.toLocaleString('en-IN')}/mo (+${Math.round((startupDiff / Math.max(1, currentSalary)) * 100)}%) 🚀`,
        description: `${startupRole} at high-growth scaleup (+₹${startupDiff.toLocaleString('en-IN')}/mo jump). Higher pace and stock incentives.`
      });
      options.push({
        label: `Join Global MNC — ₹${mncSalary.toLocaleString('en-IN')}/mo (+${Math.round((mncDiff / Math.max(1, currentSalary)) * 100)}%) 🏢`,
        description: `${mncRole} at Tier-1 Enterprise (+₹${mncDiff.toLocaleString('en-IN')}/mo jump). High stability and standard benefits.`
      });
      options.push({
        label: `Negotiate Counter-Offer (+${Math.round((retentionHike / Math.max(1, currentSalary)) * 100)}% Raise to Stay) 💼`,
        description: `Current employer offers retention bump of +₹${retentionHike.toLocaleString('en-IN')}/mo (new pay: ₹${retentionSalary.toLocaleString('en-IN')}/mo).`
      });
      break;
    }

    case 'new_job_offer': {
      const expMonths = state.experienceMonths || 0;
      const cityTier = state.player?.cityTier || 2;
      const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;
      const cityMult = cityTier === 1 ? 1.25 : cityTier === 2 ? 1.0 : 0.8;
      const uncapped = Math.round(Math.max(32000 * cityMult, (state.player?.startingSalary || 35000) * (1 + (expMonths / 60))));
      const baseSalary = Math.min(cap, uncapped);
      const roleName = getCareerRole(expMonths, baseSalary);

      financialImpact = {
        type: 'new_job',
        newSalary: baseSalary,
        roleName,
      };

      options.push({
        label: `Accept Position — ₹${baseSalary.toLocaleString('en-IN')}/mo 🎉`,
        description: `Full-time role as ${roleName} at established firm. Re-enters salaried workforce with steady cashflow.`
      });
      options.push({
        label: 'Decline Offer',
        description: 'Hold out for higher pay or continue freelancing.'
      });
      break;
    }

    case 'vehicle_accident': {
      const repairCost = randInt(15000, 75000);
      const insured = state.hasVehicleInsurance;
      const outOfPocket = insured ? Math.round(repairCost * 0.1) : repairCost;
      financialImpact = {
        type: 'loss',
        repairCost,
        outOfPocket,
        insured,
      };
      options.push({
        label: insured ? `Pay Deductible (₹${outOfPocket.toLocaleString('en-IN')})` : `Pay Repair Bill (₹${repairCost.toLocaleString('en-IN')})`,
        description: insured
          ? `Vehicle insurance covers 90%. You pay 10% copay.`
          : `No vehicle insurance! Full repair bill out of pocket.`
      });
      break;
    }

    case 'family_wedding': {
      const tierAmounts = { tierLow: 10000, tierMid: 25000, tierHigh: 50000 };
      financialImpact = {
        type: 'loss',
        amount: 25000,
        ...tierAmounts,
      };
      options.push({
        label: 'Contribute ₹25,000 to Wedding',
        description: 'Support family milestone and maintain social standing.'
      });
      break;
    }

    case 'scam_fraud': {
      const lossAmount = Math.min(Math.round(state.pool * 0.1), 60000);
      financialImpact = {
        type: 'loss',
        amount: lossAmount,
      };
      options.push({
        label: `File Report (Loss: -₹${lossAmount.toLocaleString('en-IN')})`,
        description: 'Learn valuable lesson about cybersecurity.'
      });
      break;
    }

    case 'inheritance_gift': {
      const giftAmount = randInt(100000, 400000);
      financialImpact = {
        type: 'gain',
        amount: giftAmount,
      };
      options.push({
        label: `Deposit to Liquid Savings (+₹${giftAmount.toLocaleString('en-IN')}) 🏦`,
        description: 'Keep the full windfall safe and liquid in your bank account.'
      });
      options.push({
        label: `Invest in Growth Portfolio (Stocks & Mutual Funds) 📈`,
        description: 'Deploy the full windfall into equities and index funds for long-term compounding.'
      });
      options.push({
        label: `Vacation & Celebration (Save 50%, Spend 50%) ✈️`,
        description: `Enjoy a ₹${Math.round(giftAmount * 0.5).toLocaleString('en-IN')} holiday trip and bank the remaining ₹${Math.round(giftAmount * 0.5).toLocaleString('en-IN')}.`
      });
      break;
    }

    case 'business_opportunity': {
      const investmentCost = 100000;
      const monthlyReturn = randInt(8000, 22000);
      const annualRoi = Math.round(((monthlyReturn * 12) / investmentCost) * 100);
      const paybackMonths = Math.round(investmentCost / monthlyReturn);
      financialImpact = {
        type: 'business',
        investmentCost,
        monthlyReturn,
        annualRoi,
        paybackMonths,
      };
      options.push({
        label: `Invest ₹${(investmentCost / 100000).toFixed(0)}L Upfront`,
        description: `Pay ₹${investmentCost.toLocaleString('en-IN')} upfront. Earn +₹${monthlyReturn.toLocaleString('en-IN')}/mo passive income (~${annualRoi}% annual ROI, ${paybackMonths} mo payback).`
      });
      options.push({
        label: 'Pass on Venture',
        description: 'Preserve cash liquidity and avoid entrepreneurial risk.'
      });
      break;
    }

    case 'business_downturn': {
      const lossMonthly = Math.round((state.businessIncome || 10000) * 0.5);
      financialImpact = {
        type: 'income_loss',
        monthlyLoss: lossMonthly,
      };
      options.push({
        label: 'Cut Costs & Weather Storm',
        description: `Monthly business cashflow temporarily drops by -₹${lossMonthly.toLocaleString('en-IN')}/mo.`
      });
      break;
    }

    case 'business_failure': {
      const currentBizIncome = state.businessIncome || 0;
      financialImpact = {
        type: 'income_loss',
        monthlyLoss: currentBizIncome,
      };
      options.push({
        label: 'Close Down Venture (Accept 100% Loss)',
        description: 'Halt operations, cease cash burn, and eliminate business cashflow.'
      });
      options.push({
        label: 'Inject ₹50,000 Working Capital',
        description: 'Fund an emergency turnaround pivot from liquid savings to restore revenue.'
      });
      break;
    }

    case 'inflation_spike': {
      financialImpact = {
        type: 'inflation',
      };
      options.push({
        label: 'Adjust Lifestyle',
        description: 'Macro inflation rises. Goal targets and living costs accelerate.'
      });
      break;
    }

    case 'tax_event': {
      const isRefund = Math.random() > 0.45;
      const amount = randInt(8000, 25000);
      financialImpact = {
        type: isRefund ? 'gain' : 'loss',
        amount,
        isRefund,
      };
      options.push({
        label: isRefund ? `Accept Refund (+₹${amount.toLocaleString('en-IN')})` : `Pay Tax Due (-₹${amount.toLocaleString('en-IN')})`,
        description: isRefund
          ? 'Income tax assessment resulted in a refund!'
          : 'Dues assessed on capital gains and interest.'
      });
      break;
    }

    case 'theft': {
      const theftAmount = Math.min(Math.round(state.pool * 0.08), 35000);
      financialImpact = {
        type: 'loss',
        amount: theftAmount,
      };
      options.push({
        label: `Acknowledge (-₹${theftAmount.toLocaleString('en-IN')})`,
        description: 'Cash and personal items stolen.'
      });
      break;
    }

    case 'loan_rate_change': {
      financialImpact = {
        type: 'rate_change',
      };
      options.push({
        label: 'Noted',
        description: 'Floating interest rates adjusted by central bank.'
      });
      break;
    }

    case 'work_bonus': {
      const bonusAmount = randInt(25000, 75000);
      financialImpact = {
        type: 'gain',
        amount: bonusAmount,
      };
      options.push({
        label: `Bank Full Bonus (+₹${bonusAmount.toLocaleString('en-IN')}) 🎉`,
        description: 'Deposit 100% of corporate bonus into liquid cash reserves.'
      });
      options.push({
        label: `Auto-Invest into Mutual Funds (SIP Boost) 📊`,
        description: 'Channel bonus directly into diversified equity mutual funds.'
      });
      options.push({
        label: `Celebration & Dining (Splurge 40%, Save 60%) 🍽️`,
        description: `Spend ₹${Math.round(bonusAmount * 0.4).toLocaleString('en-IN')} on celebration; deposit remaining ₹${Math.round(bonusAmount * 0.6).toLocaleString('en-IN')} to savings.`
      });
      break;
    }

    case 'senior_job_offer': {
      const currentJob = state.incomes.find(i => i.type === 'job');
      const base = currentJob ? currentJob.amount : (state.player?.startingSalary || 40000);
      const cityTier = state.player?.cityTier || 2;
      const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;
      const hikePct = randFloat(0.18, 0.26);
      const offeredSalary = Math.min(cap, Math.round(base * (1 + hikePct)));
      const hike = offeredSalary - (currentJob ? currentJob.amount : 0);
      const hikePercent = Math.round((hike / Math.max(1, base)) * 100);
      const expMonths = (state.experienceMonths || 0) + 24;
      const role = getCareerRole(expMonths, offeredSalary, true);
      financialImpact = {
        type: 'job_switch',
        currentSalary: currentJob ? currentJob.amount : 0,
        newSalary: offeredSalary,
        diff: hike,
        hikePercent,
        roleName: role,
      };
      options.push({
        label: `Accept Leadership Role (₹${offeredSalary.toLocaleString('en-IN')}/mo) 🏆`,
        description: `+₹${hike.toLocaleString('en-IN')}/mo (+${hikePercent}% hike) as ${role} with executive oversight.`
      });
      options.push({
        label: 'Decline Executive Role',
        description: 'Stay at current position to maintain work-life balance.'
      });
      break;
    }

    case 'course_upskill': {
      const courseFee = 35000;
      financialImpact = {
        type: 'loss',
        amount: courseFee,
      };
      options.push({
        label: `Enroll in Certification (₹${courseFee.toLocaleString('en-IN')}) 🎓`,
        description: `Pay ₹${courseFee.toLocaleString('en-IN')} upfront to unlock senior executive recruiter offers & raises.`
      });
      options.push({
        label: 'Skip Course',
        description: 'Save cash for now and rely on regular career progression.'
      });
      break;
    }

    case 'freelance_gig': {
      const gigPay = randInt(20000, 35000);
      financialImpact = {
        type: 'gain_recurring',
        gigPay,
        amount: gigPay,
        hikeAmount: gigPay,
      };
      options.push({
        label: `Accept Retainer (+₹${gigPay.toLocaleString('en-IN')}/mo) 💻`,
        description: `Start flexible consulting contract paying ₹${gigPay.toLocaleString('en-IN')} monthly.`
      });
      options.push({
        label: 'Focus on Full-Time Hunt',
        description: 'Pass on contract gig to interview full-time.'
      });
      break;
    }

    case 'home_renovation': {
      const homeValue = (state.homesOwned && state.homesOwned[0]?.value) || 3000000;
      const fullCost = randInt(80000, Math.min(300000, Math.round(homeValue * 0.04)));
      const patchCost = randInt(20000, 55000);
      financialImpact = { type: 'loss', amount: fullCost };
      options.push({
        label: `Full Renovation (₹${fullCost.toLocaleString('en-IN')})`,
        description: 'Complete fix. Home value appreciates by ~60% of cost.',
      });
      options.push({
        label: `Quick Patch (₹${patchCost.toLocaleString('en-IN')})`,
        description: 'Temporary fix. A more thorough renovation will be needed soon.',
      });
      break;
    }

    case 'utility_hike': {
      const hikePercent = Math.round(randFloat(0.08, 0.15) * 100);
      financialImpact = { type: 'inflation', hikePercent };
      options.push({
        label: `Absorb Increase (~${hikePercent}% more/mo)`,
        description: 'Monthly utility cost increases permanently due to revised tariffs.',
      });
      break;
    }

    case 'property_tax': {
      const totalVal = (state.homesOwned || []).reduce((s, h) => s + (h.value || 0), 0);
      const taxBill = Math.round(totalVal * randFloat(0.003, 0.006));
      financialImpact = { type: 'loss', amount: taxBill };
      options.push({
        label: `Pay Property Tax (-₹${taxBill.toLocaleString('en-IN')})`,
        description: 'Annual municipal levy on property guidance value.',
      });
      break;
    }

    default:
      options.push({ label: 'OK', description: '' });
  }

  return {
    ...event,
    financialImpact,
    options,
  };
}

export default useGameStore;
