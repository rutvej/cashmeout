import { GOAL_COSTS, CITY_TIERS } from './constants.js';
import { randInt, randFloat } from '../utils/random.js';

export const createGoal = (type, name, targetAmount, inflationRate, currentDay, isBonus = false) => {
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
    addedDay: currentDay,
    bucketPercent: 0,
  };
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
