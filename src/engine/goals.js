import { GOAL_COSTS, CITY_TIERS } from './constants.js';
import { randInt, randFloat } from '../utils/random.js';

export const createGoal = (type, name, targetAmount, inflationRate, currentDay, isBonus = false, isLocked = false) => {
  return {
    id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type,
    name,
    originalTarget: targetAmount,
    currentTarget: targetAmount,
    inflationRate,
    achieved: false,
    sacrificed: false,
    bonus: isBonus,
    locked: isLocked,
    addedDay: currentDay,
    bucketPercent: 0,
  };
};

export const FUND_PRESETS = [
  {
    type: 'emergency',
    name: 'Emergency Buffer Fund',
    icon: '🛡️',
    description: 'Shields against job loss, urgent repairs, scams, and sudden shocks before touching savings or investments.',
    suggestedMonths: 6,
    defaultInstruments: { savings: 80, fd: 20, gold: 0, mf: 0, stocks: 0 },
  },
  {
    type: 'medical',
    name: 'Parent / Family Medical Reserve',
    icon: '🏥',
    description: 'Dedicated fund for hospital bills, surgeries, and pre-existing medical conditions not covered by insurance.',
    suggestedAmount: 500000,
    defaultInstruments: { savings: 75, fd: 25, gold: 0, mf: 0, stocks: 0 },
  },
  {
    type: 'vacation',
    name: 'Annual Travel & Vacation Fund',
    icon: '✈️',
    description: 'Plan for yearly leisure travel without disturbing long-term wealth investments.',
    suggestedAmount: 150000,
    defaultInstruments: { savings: 40, fd: 20, gold: 20, mf: 20, stocks: 0 },
  },
  {
    type: 'general',
    name: 'Rainy Day Contingency Buffer',
    icon: '💰',
    description: 'Catch-all liquid buffer for gifts, wedding contributions, and family requests.',
    suggestedAmount: 100000,
    defaultInstruments: { savings: 90, fd: 10, gold: 0, mf: 0, stocks: 0 },
  },
];

export const createFund = (type, name, targetAmount, instrumentSplit = null) => {
  const preset = FUND_PRESETS.find(p => p.type === type) || FUND_PRESETS[0];
  return {
    id: `fund_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type,
    name: name || preset.name,
    icon: preset.icon,
    targetAmount: Math.round(targetAmount),
    currentAmount: 0,
    allocationPercent: 0,
    instruments: instrumentSplit || { ...preset.defaultInstruments },
    createdDay: 0,
  };
};

export const getSuggestedSeedGoals = (cityTier) => {
  const homeSug = getSuggestedGoal('home', cityTier);
  const carSug = getSuggestedGoal('car', cityTier);
  const marriageSug = getSuggestedGoal('marriage', cityTier);
  const bizSug = getSuggestedGoal('business', cityTier);

  return [
    {
      type: 'home',
      name: '🏠 Buy a Home in Town',
      targetAmount: homeSug.suggestedAmount,
      inflationRate: homeSug.inflationRate,
      locked: true,
      description: 'Acquire permanent home equity to eliminate rent permanently.',
    },
    {
      type: 'marriage',
      name: '💍 Grand Wedding Celebration',
      targetAmount: marriageSug.suggestedAmount,
      inflationRate: marriageSug.inflationRate,
      locked: true,
      description: 'Fund life milestone wedding celebration debt-free.',
    },
    {
      type: 'car',
      name: '🚗 Family Car',
      targetAmount: carSug.suggestedAmount,
      inflationRate: carSug.inflationRate,
      locked: true,
      description: 'Reliable personal car for urban commute and family comfort.',
    },
    {
      type: 'custom',
      name: "🎓 Child's Higher Education",
      targetAmount: cityTier === 1 ? 5000000 : cityTier === 2 ? 3500000 : 2500000,
      inflationRate: 0.08,
      locked: true,
      description: 'Secure quality higher education and coaching corpus.',
    },
    {
      type: 'business',
      name: '💼 Commercial Business Setup',
      targetAmount: bizSug.suggestedAmount,
      inflationRate: bizSug.inflationRate,
      locked: true,
      description: 'Seed capital to build independent commercial cashflow.',
    },
  ];
};

export const inflateGoalTarget = (goal, elapsedYears) => {
  return goal.originalTarget * Math.pow(1 + goal.inflationRate, elapsedYears);
};

export const getSuggestedGoal = (type, cityTier) => {
  if (type === 'custom') {
    return { name: 'Custom Goal', suggestedAmount: 100000, inflationRate: GOAL_COSTS.custom.inflation };
  }
  const limits = GOAL_COSTS[type][cityTier];
  return {
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Goal`,
    suggestedAmount: randInt(limits.min, limits.max),
    inflationRate: randFloat(limits.inflation[0], limits.inflation[1]),
  };
};

export const checkMilestone = (goal, bucketValue) => {
  return bucketValue >= goal.currentTarget;
};

export const redistributeBuckets = (goals, removedGoalId, mode) => {
  const removedGoal = goals.find(g => g.id === removedGoalId);
  const percentToDistribute = removedGoal ? removedGoal.bucketPercent : 0;
  
  const remainingGoals = goals.filter(g => g.id !== removedGoalId && !g.achieved && !g.sacrificed);
  
  if (remainingGoals.length === 0 || percentToDistribute === 0) return {};

  const totalRemainingPercent = remainingGoals.reduce((sum, g) => sum + g.bucketPercent, 0);
  const newBuckets = {};

  if (totalRemainingPercent === 0) {
    // Distribute evenly if all were 0
    const evenSplit = percentToDistribute / remainingGoals.length;
    remainingGoals.forEach(g => {
      newBuckets[g.id] = g.bucketPercent + evenSplit;
    });
  } else {
    // Distribute proportionally
    remainingGoals.forEach(g => {
      const share = g.bucketPercent / totalRemainingPercent;
      newBuckets[g.id] = g.bucketPercent + (percentToDistribute * share);
    });
  }

  // Ensure total is 100 (due to floating point)
  const sum = Object.values(newBuckets).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - totalRemainingPercent - percentToDistribute) > 0.1) {
    // fix rounding error on first goal
    if (remainingGoals[0]) {
      newBuckets[remainingGoals[0].id] += ((totalRemainingPercent + percentToDistribute) - sum);
    }
  }

  return newBuckets;
};
