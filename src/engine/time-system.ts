import { GameState } from '../types/game';

export const MS_PER_GAME_DAY = 2 * 60 * 1000; // 2 minutes = 1 game day
export const FAST_SIM_MAX_DAYS = 45;

export function calculateElapsedGameDays(lastActiveTimestamp: number, currentTimestamp = Date.now()): number {
  if (!lastActiveTimestamp || lastActiveTimestamp > currentTimestamp) return 0;
  return Math.floor((currentTimestamp - lastActiveTimestamp) / MS_PER_GAME_DAY);
}

export function getOfflineCatchUpPlan(elapsedDays: number) {
  if (elapsedDays <= 0) {
    return { mode: 'none' as const, days: 0 };
  }
  if (elapsedDays <= FAST_SIM_MAX_DAYS) {
    return { mode: 'fast-sim' as const, days: elapsedDays };
  }
  return { mode: 'aggregate' as const, days: elapsedDays };
}

export function applyAggregateOfflineSimulation(state: GameState, days: number): string[] {
  const notes: string[] = [];
  const p = state.player;

  // Approximate salary
  const payCycles = Math.floor(days / p.job.payCycleDays);
  const salaryTotal = payCycles * p.job.salaryPerCycle;
  p.money += salaryTotal;
  p.taxes.incomeThisCycle += salaryTotal;

  // Approximate rent
  const rentCycles = Math.floor(days / p.housing.cycleDays);
  const rentTotal = rentCycles * p.housing.amountPerCycle;
  p.money -= rentTotal;

  // Living expenses
  const estimatedDailyCost = 150 * state.inflationMultiplier;
  const totalLivingCost = Math.round(estimatedDailyCost * days);
  p.money = Math.max(0, p.money - totalLivingCost);

  // Interest on savings
  const savingsInterest = Math.round(p.savingsBalance * (0.035 / 360) * days);
  p.savingsBalance += savingsInterest;

  // Inflation update
  state.inflationMultiplier *= Math.pow(1 + state.inflationRate / 360, days);

  p.currentDay += days;
  p.lastActiveTimestamp = Date.now();

  notes.push(`Simulated ${days} days in aggregate mode.`);
  notes.push(`Earned ₹${salaryTotal.toLocaleString('en-IN')} in salary over ${payCycles} cycles.`);
  notes.push(`Paid ₹${rentTotal.toLocaleString('en-IN')} in rent and approx ₹${totalLivingCost.toLocaleString('en-IN')} in living expenses.`);
  notes.push(`Savings earned ₹${savingsInterest.toLocaleString('en-IN')} in interest.`);

  return notes;
}
