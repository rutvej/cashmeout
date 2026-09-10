import { GameState } from '../types/game';
import { adjustHabitCounter } from './behavioral';

export interface DailyHealthTickResult {
  physicalDelta: number;
  mentalDelta: number;
  energyDelta: number;
  triggeredBurnout: boolean;
  triggeredMedicalEmergency: boolean;
  message?: string;
}

export function clampResource(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val * 10) / 10));
}

export function tickDailyHealth(state: GameState): DailyHealthTickResult {
  const sched = state.resources.dailySchedule;
  let physDelta = 0;
  let mentDelta = 0;
  let energDelta = 0;

  // 1. Sleep impacts
  if (sched.sleepHours < 6) {
    physDelta -= 0.5;
    energDelta -= 3.0;
    mentDelta -= 0.5;
  } else if (sched.sleepHours < 7) {
    energDelta -= 1.0;
  } else if (sched.sleepHours >= 8) {
    physDelta += 0.3;
    energDelta += 3.0;
    mentDelta += 0.5;
  } else {
    energDelta += 1.5;
  }

  // 2. Gym / Exercise
  if (sched.gymHours >= 1) {
    physDelta += 1.5;
    mentDelta += 0.5;
    energDelta += 1.0;
    state.simulation.lifetimeGymSessions += 1;
  } else {
    physDelta -= 0.5;
    energDelta -= 1.0;
  }

  // 3. Meal discipline
  if (sched.mealDisciplineHours >= 1) {
    physDelta += 1.2;
    mentDelta += 0.4;
    energDelta += 0.8;
  } else {
    physDelta -= 1.0;
    adjustHabitCounter(state.behavioral, 'junkFoodCounter', 0.2);
  }

  // 4. Job stress
  if (state.career.currentJob) {
    const dailyJobStress = state.career.currentJob.stressMonthly / 30;
    mentDelta -= dailyJobStress;
    if (dailyJobStress > 1.2) {
      energDelta -= 0.8;
    }
  }

  // 5. Commute drain
  if (sched.commuteHours > 1.5) {
    mentDelta -= 0.4;
    energDelta -= 0.6;
  }

  // 6. Free leisure rest
  if (sched.leisureHours >= 3) {
    mentDelta += 1.0;
    energDelta += 0.5;
  }

  // Apply to resources
  state.resources.physicalHealth = clampResource(state.resources.physicalHealth + physDelta);
  state.resources.mentalHealth = clampResource(state.resources.mentalHealth + mentDelta);
  state.resources.energy = clampResource(state.resources.energy + energDelta);

  let triggeredBurnout = false;
  let triggeredMedicalEmergency = false;
  let message: string | undefined;

  // Check Burnout threshold (Spec 02: Mental <= 20)
  if (state.resources.mentalHealth <= 20) {
    triggeredBurnout = true;
    state.simulation.burnoutEpisodeCount += 1;
    state.resources.mentalHealth = 45; // Forced rest recovery
    state.resources.energy = 50;
    state.resources.cashOnHand = Math.max(0, state.resources.cashOnHand - 400); // Doctor bill
    message = '🚨 Clinical Burnout: Doctor ordered mandatory rest. Incurred $400 medical bill.';
    state.simulation.recentLogs.unshift({
      day: state.player.currentDay,
      message,
      type: 'negative'
    });
  }

  // Check Physical Collapse (Physical <= 15)
  if (state.resources.physicalHealth <= 15) {
    triggeredMedicalEmergency = true;
    state.simulation.hospitalizationCount += 1;
    state.resources.physicalHealth = 40; // Emergency stabilization
    const bill = 1800;
    state.resources.cashOnHand = Math.max(0, state.resources.cashOnHand - bill);
    message = '🏥 Emergency Hospitalization: Physical health collapsed. Urgent care bill: $1,800.';
    state.simulation.recentLogs.unshift({
      day: state.player.currentDay,
      message,
      type: 'negative'
    });
  }

  return {
    physicalDelta: physDelta,
    mentalDelta: mentDelta,
    energyDelta: energDelta,
    triggeredBurnout,
    triggeredMedicalEmergency,
    message
  };
}
