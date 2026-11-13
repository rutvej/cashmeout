// Investment instruments, compounding math, and waterfall engine
import { createPRNG } from './prng.js';

export const INSTRUMENTS = {
  savings: {
    id: 'savings',
    name: 'Liquid Savings',
    annualRate: 0.04,
    monthlyRate: 0.04 / 12,
    volatilityMonthlyStdDev: 0,
    risk: 'low',
    tag: 'Safe & Liquid',
  },
  fd: {
    id: 'fd',
    name: 'Fixed Deposit (FD)',
    annualRate: 0.07,
    monthlyRate: 0.07 / 12,
    volatilityMonthlyStdDev: 0,
    risk: 'low',
    tag: 'Guaranteed Return',
  },
  gold: {
    id: 'gold',
    name: 'Gold / SGB',
    annualRate: 0.085,
    monthlyRate: 0.085 / 12,
    volatilityMonthlyStdDev: 0.008,
    risk: 'moderate',
    tag: 'Inflation Hedge',
  },
  equity: {
    id: 'equity',
    name: 'Equity Mutual Funds',
    annualRate: 0.12,
    monthlyRate: 0.12 / 12,
    volatilityMonthlyStdDev: 0.025,
    risk: 'high',
    tag: 'High Growth',
  },
};

/**
 * Calculates projected future value of a regular SIP annuity.
 * FV = PV * (1 + r)^n + PMT * [ ((1 + r)^n - 1) / r ]
 */
export function calculateProjectedFV(currentBalance, monthlySIP, annualRate, months) {
  const pv = Number(currentBalance) || 0;
  const pmt = Number(monthlySIP) || 0;
  const n = Math.max(1, Number(months) || 1);
  const r = (Number(annualRate) || 0) / 12;

  if (r <= 0) {
    return Math.round(pv + pmt * n);
  }

  const compoundFactor = Math.pow(1 + r, n);
  const pvGrowth = pv * compoundFactor;
  const annuityGrowth = pmt * ((compoundFactor - 1) / r);

  return Math.round(pvGrowth + annuityGrowth);
}

/**
 * Evaluates whether an allocated monthly SIP will hit the target amount by deadline.
 */
export function evaluateGoalFeasibility(goal, monthlySIP, instrumentId) {
  const instrument = INSTRUMENTS[instrumentId] || INSTRUMENTS.savings;
  const months = goal.targetMonthsRemaining || (goal.recurrenceIntervalMonths || 12);
  const projectedAmount = calculateProjectedFV(
    goal.currentAmount || 0,
    monthlySIP,
    instrument.annualRate,
    months
  );

  const target = goal.targetAmount || 1;
  const shortfall = Math.max(0, target - projectedAmount);

  let status = 'underfunded'; // Red
  if (projectedAmount >= target) {
    status = 'on_track'; // Green
  } else if (projectedAmount >= target * 0.8) {
    status = 'borderline'; // Yellow
  }

  return {
    projectedAmount,
    status,
    shortfall,
    ratio: Math.min(2, projectedAmount / target),
  };
}

/**
 * Resolves the Cascading Waterfall SIP allocations.
 * - In Percentage Mode: When a goal fills up, its freed allocation redistributes proportionally
 *   across all remaining active goals (not via redirectGoalId).
 * - In Fixed-₹ Mode: When a goal fills up, its SIP cascades downstream via redirectGoalId waterfall chain.
 * - Emergency Fund auto-recall guarantee:
 *   - If Emergency Fund drops below target, it recalls its base SIP with highest priority.
 */
export function calculateEffectiveSIPs(goals) {
  const effective = {};
  const goalMap = {};

  goals.forEach((g) => {
    // Launched ventures are active cash flow assets and do not take SIPs
    effective[g.id] = g.isLaunched ? 0 : (g.baseMonthlySIP || 0);
    goalMap[g.id] = g;
  });

  // Emergency Fund auto-recall guarantee
  const emergencyGoal = goals.find((g) => g.id === 'goal_emergency');
  const isEmergencyDepleted =
    emergencyGoal && (emergencyGoal.currentAmount || 0) < (emergencyGoal.targetAmount || 1);

  // Helper function to find next incomplete goal in redirection chain (Fixed-₹ mode)
  const findActiveRecipient = (startGoalId) => {
    let currentId = startGoalId;
    const visited = new Set();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const targetGoal = goalMap[currentId];
      if (!targetGoal) return null;

      const isTargetFull =
        (targetGoal.currentAmount || 0) >= (targetGoal.targetAmount || 1) || targetGoal.isLaunched || targetGoal.isLocked;
      // Emergency fund is only full when at 100%
      if (currentId === 'goal_emergency' && isEmergencyDepleted) {
        return currentId;
      }

      if (!isTargetFull) {
        return currentId; // Found an active, incomplete goal!
      }

      // Target is full, continue down redirection chain
      currentId = targetGoal.redirectGoalId;
    }

    return null; // All downstream goals in chain are full or none configured
  };

  let freedPercentageSIP = 0;

  // Process completed goals
  goals.forEach((goal) => {
    const isFull = (goal.currentAmount || 0) >= (goal.targetAmount || 1) || goal.isLaunched || goal.isLocked;

    // Emergency fund that is depleted cannot redirect its SIP
    if (goal.id === 'goal_emergency' && isEmergencyDepleted) {
      return;
    }

    if (isFull) {
      const outflow = effective[goal.id];
      effective[goal.id] = 0; // Stop funding completed goal!

      if (outflow > 0) {
        if (goal.allocationMode === 'percentage') {
          // Percentage mode REPLACES the waterfall redirect chain
          freedPercentageSIP += outflow;
        } else {
          // Fixed-₹ mode uses waterfall cascade via redirectGoalId
          if (goal.redirectGoalId) {
            const activeRecipientId = findActiveRecipient(goal.redirectGoalId);
            if (activeRecipientId && effective[activeRecipientId] !== undefined) {
              effective[activeRecipientId] += outflow;
            }
          }
        }
      }
    }
  });

  // When a goal fills up in % mode, its freed allocation redistributes proportionally across all remaining active goals
  if (freedPercentageSIP > 0) {
    const activeGoals = goals.filter((g) => {
      if (g.isLaunched) return false;
      if (g.id === 'goal_emergency' && isEmergencyDepleted) return true;
      return (g.currentAmount || 0) < (g.targetAmount || 1);
    });

    if (activeGoals.length > 0) {
      // Determine weights of active goals (prefer allocationPercent, then effective SIP, then 1)
      const weights = activeGoals.map((g) => {
        if (typeof g.allocationPercent === 'number' && g.allocationPercent > 0) {
          return g.allocationPercent;
        }
        if (effective[g.id] > 0) {
          return effective[g.id];
        }
        return 1;
      });

      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      let distributed = 0;
      activeGoals.forEach((g, idx) => {
        if (idx === activeGoals.length - 1) {
          effective[g.id] += (freedPercentageSIP - distributed);
        } else {
          const share = Math.round(freedPercentageSIP * (weights[idx] / totalWeight));
          effective[g.id] += share;
          distributed += share;
        }
      });
    }
  }

  return effective;
}

/**
 * Calculates liquidation penalty when breaking an asset early.
 * - Fixed Deposit (FD): 1.5% penalty on the withdrawn amount.
 * - Liquid Savings, Gold, Equity: 0% penalty.
 */
export function calculateLiquidationPenalty(instrumentId, withdrawalAmount) {
  const amt = Number(withdrawalAmount) || 0;
  if (amt <= 0) return 0;
  if (instrumentId === 'fd') {
    return Math.round(amt * 0.015);
  }
  return 0;
}

/**
 * Calculates the equity macro market cycle multiplier M(t) with deterministic monthly noise.
 * M(t) = 1.0 + 0.08 * Math.sin((2 * Math.PI * monthIndex) / 72) + noise_equity
 */
export function getEquityMarketMultiplier(monthIndex, seed = 'default') {
  const m = Number(monthIndex) || 0;
  const rng = createPRNG(`${seed}_equity_${m}`);
  const noise_equity = (rng() * 2 - 1) * 1.05;
  return 1.0 + 0.08 * Math.sin((2 * Math.PI * m) / 72) + noise_equity;
}

/**
 * Checks whether equity market is in correction (M(t) < 0.95).
 */
export function isMarketInCorrection(monthIndex, seed = 'default') {
  return getEquityMarketMultiplier(monthIndex, seed) < 0.95;
}

/**
 * Calculates monthly return rate for an instrument taking into account PRNG seed and month.
 * - savings: 0.04 / 12 (flat, 0 volatility, 100% liquid safe)
 * - fd: 0.07 / 12 (flat guaranteed return)
 * - gold: (0.085 / 12) + noise where noise is bounded within +- 0.008
 * - equity: Models gentle 6-year macro cycle + bounded monthly noise around 12% p.a. mean,
 *   strictly bounded between -0.015 (-1.5%) and +0.025 (+2.5%), preserving ~12% p.a. CAGR.
 */
export function getMonthlyInstrumentReturnRate(instrumentId, monthIndex = 0, seed = 'default') {
  const m = Number(monthIndex) || 0;

  if (instrumentId === 'savings') {
    return 0.04 / 12;
  }

  if (instrumentId === 'fd') {
    return 0.07 / 12;
  }

  if (instrumentId === 'gold') {
    const rng = createPRNG(`${seed}_gold_${m}`);
    const noise = (rng() * 2 - 1) * 0.008;
    return (0.085 / 12) + noise;
  }

  if (instrumentId === 'equity') {
    const M_t = getEquityMarketMultiplier(m, seed);
    const rawRate = (0.12 / 12) * M_t;
    return Math.max(-0.015, Math.min(0.025, rawRate));
  }

  // Fallback to INSTRUMENTS registry or savings
  const inst = INSTRUMENTS[instrumentId];
  return inst ? inst.monthlyRate : 0.04 / 12;
}

/**
 * Processes a liquidation / withdrawal from a goal's balance, applying FD penalty or equity market loss if applicable.
 */
export function processLiquidationFromGoal(goal, requestedAmount, monthIndex = 0, seed = 'default') {
  const currentAmount = goal?.currentAmount || 0;
  const drawnAmount = Math.min(currentAmount, Math.max(0, Number(requestedAmount) || 0));
  const instrumentId = goal?.instrumentId || 'savings';

  const penalty = calculateLiquidationPenalty(instrumentId, drawnAmount);

  let realizedLoss = 0;
  if (instrumentId === 'equity' && isMarketInCorrection(monthIndex, seed)) {
    const M_t = getEquityMarketMultiplier(monthIndex, seed);
    const dipRatio = Math.max(0.05, 1.0 - M_t);
    realizedLoss = Math.round(drawnAmount * dipRatio);
  }

  const totalDeduction = drawnAmount + penalty;
  let remainingInGoal = Math.max(0, currentAmount - totalDeduction);
  let unfundedPenalty = 0;
  if (totalDeduction > currentAmount) {
    unfundedPenalty = totalDeduction - currentAmount;
  }

  return {
    drawnAmount,
    penalty,
    realizedLoss,
    unfundedPenalty,
    updatedGoal: {
      ...goal,
      currentAmount: remainingInGoal,
    },
  };
}
