// Investment instruments, compounding math, and waterfall engine

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
        (targetGoal.currentAmount || 0) >= (targetGoal.targetAmount || 1) || targetGoal.isLaunched;
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
    const isFull = (goal.currentAmount || 0) >= (goal.targetAmount || 1) || goal.isLaunched;

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
