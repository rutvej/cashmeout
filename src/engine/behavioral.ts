import { HabitCounters } from '../types/game';

export function clampCounter(value: number): number {
  // Counters NEVER drop below 1.0 per Spec 08 Section 1
  return Math.max(1.0, Math.min(10.0, Number(value.toFixed(2))));
}

export function adjustHabitCounter(
  counters: HabitCounters,
  key: keyof HabitCounters,
  delta: number
): number {
  counters[key] = clampCounter(counters[key] + delta);
  return counters[key];
}

export function calculateEventProbability(baseChance: number, counterValue: number): number {
  // P = Base Chance + (Counter * 0.075) from Spec 08 Section 2
  return Math.min(0.95, Math.max(0.05, baseChance + (counterValue * 0.075)));
}

export function evaluateHabitsDaily(counters: HabitCounters, sleepHours: number, gymHours: number): void {
  // Daily habit effects
  if (sleepHours < 6) {
    adjustHabitCounter(counters, 'sleepDebtCounter', 0.4);
  } else if (sleepHours >= 7.5) {
    adjustHabitCounter(counters, 'sleepDebtCounter', -0.2);
  }

  if (gymHours > 0) {
    adjustHabitCounter(counters, 'gymSkipCounter', -0.3);
  } else {
    adjustHabitCounter(counters, 'gymSkipCounter', 0.15);
  }
}
