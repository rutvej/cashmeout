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
 * - If a goal is completed/full, its SIP flows forward to redirectGoalId.
 * - If Emergency Fund drops below target, it recalls its base SIP with highest priority.
 */
export function calculateEffectiveSIPs(goals) {
  const effective = {};
  goals.forEach((g) => {
    effective[g.id] = g.baseMonthlySIP || 0;
  });

  // Emergency Fund auto-recall guarantee
  const emergencyGoal = goals.find((g) => g.id === 'goal_emergency');
  const isEmergencyDepleted =
    emergencyGoal && emergencyGoal.currentAmount < emergencyGoal.targetAmount;

  goals.forEach((goal) => {
    const isFull = goal.currentAmount >= goal.targetAmount;

    // Emergency fund only redirects if 100% full
    if (goal.id === 'goal_emergency' && isEmergencyDepleted) {
      return;
    }

    if (isFull && goal.redirectGoalId && effective[goal.redirectGoalId] !== undefined) {
      const outflow = effective[goal.id];
      effective[goal.id] = 0;
      effective[goal.redirectGoalId] += outflow;
    }
  });

  return effective;
}
