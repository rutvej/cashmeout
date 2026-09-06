import { GameState } from '../types/game';
import { FOOD_TIERS, TRANSPORT_MODES } from '../data/static-data';

export interface HealthConsequenceResult {
  triggered: boolean;
  name?: string;
  medicalBill?: number;
  outOfPocketCost?: number;
  description?: string;
}

export function processHealthAndConsequences(state: GameState, day: number): HealthConsequenceResult {
  const p = state.player;
  const food = FOOD_TIERS[p.lifestyle.foodTier];
  const transport = TRANSPORT_MODES[p.lifestyle.transportMode];

  // 1. Physical health deltas
  let physicalDelta = food.physicalDelta;
  const hasGym = p.lifestyleAssets.some(a => a.id === 'gym-membership');
  if (p.timeAllocation.exercise > 0) {
    physicalDelta += p.timeAllocation.exercise * (hasGym ? 2.5 : 1.4);
  } else {
    physicalDelta -= 0.4; // Sedentary decay
  }

  // 2. Mental health & stress deltas
  let stressDelta = p.job.stressPerDay + transport.stressPerDay;
  if (p.timeAllocation.rest > 0) {
    stressDelta -= p.timeAllocation.rest * 2.0;
  }
  if (p.timeAllocation.free > 0) {
    stressDelta -= p.timeAllocation.free * 1.5;
  }

  // Side hustle stress
  stressDelta += p.timeAllocation.sideHustle * 1.5;

  p.stats.stress = Math.max(0, Math.min(100, p.stats.stress + stressDelta));

  // Mental health moves opposite to stress
  const mentalDelta = (stressDelta < 0 ? 1.0 : -0.8) + (p.timeAllocation.free * 0.5);
  p.health.mental = Math.max(0, Math.min(100, p.health.mental + mentalDelta));

  // 3. Energy deltas
  let energyDelta = -0.5; // base fatigue
  if (p.timeAllocation.rest > 0) energyDelta += p.timeAllocation.rest * 3.5;
  if (p.timeAllocation.sideHustle > 0) energyDelta -= p.timeAllocation.sideHustle * 2.0;
  if (p.timeAllocation.job > 2) energyDelta -= 2.0;
  p.health.energy = Math.max(0, Math.min(100, p.health.energy + energyDelta));

  p.health.physical = Math.max(0, Math.min(100, p.health.physical + physicalDelta));

  // 4. Consequence Meters (Cause & Effect)
  if (p.lifestyle.foodTier === 'street') {
    p.consequenceMeters.cheapFoodDays++;
  } else {
    p.consequenceMeters.cheapFoodDays = Math.max(0, p.consequenceMeters.cheapFoodDays - 1);
  }

  if (p.timeAllocation.exercise === 0) {
    p.consequenceMeters.noExerciseDays++;
  } else {
    p.consequenceMeters.noExerciseDays = Math.max(0, p.consequenceMeters.noExerciseDays - 2);
  }

  if (p.stats.stress > 70) {
    p.consequenceMeters.highStressDays++;
  } else {
    p.consequenceMeters.highStressDays = Math.max(0, p.consequenceMeters.highStressDays - 1);
  }

  if (p.health.energy < 25) {
    p.consequenceMeters.lowEnergyDays++;
  } else {
    p.consequenceMeters.lowEnergyDays = 0;
  }

  if (p.health.physical < 30) {
    p.consequenceMeters.unhealthyDays++;
  } else {
    p.consequenceMeters.unhealthyDays = 0;
  }

  // 5. Threshold triggers
  let result: HealthConsequenceResult = { triggered: false };

  if (p.consequenceMeters.cheapFoodDays >= 20) {
    p.consequenceMeters.cheapFoodDays = 0;
    result = triggerMedicalEvent(state, day, 'Acute Gastroenteritis (Street Food Streak)', 3500, -18);
  } else if (p.consequenceMeters.noExerciseDays >= 35) {
    p.consequenceMeters.noExerciseDays = 0;
    result = triggerMedicalEvent(state, day, 'Severe Lumbar Spasm (Sedentary Strain)', 5500, -15);
  } else if (p.consequenceMeters.highStressDays >= 25) {
    p.consequenceMeters.highStressDays = 0;
    result = triggerMedicalEvent(state, day, 'Chronic Anxiety & Panic Episode', 7000, -25);
  } else if (p.consequenceMeters.lowEnergyDays >= 15) {
    p.consequenceMeters.lowEnergyDays = 0;
    result = triggerMedicalEvent(state, day, 'Adrenal Burnout & Exhaustion', 4000, -15);
  } else if (p.consequenceMeters.unhealthyDays >= 18) {
    p.consequenceMeters.unhealthyDays = 0;
    result = triggerMedicalEvent(state, day, 'Emergency Hospitalization (Immune Crash)', 25000, -35);
  }

  return result;
}

function triggerMedicalEvent(
  state: GameState,
  day: number,
  title: string,
  baseCost: number,
  healthHit: number
): HealthConsequenceResult {
  const p = state.player;
  const coveragePct = p.insurance.health.coveragePct;
  const outOfPocket = Math.round(baseCost * (1 - coveragePct));

  p.money = Math.max(0, p.money - outOfPocket);
  p.health.physical = Math.max(0, p.health.physical + healthHit);
  p.stats.stress = Math.min(100, p.stats.stress + 15);

  const insNote = coveragePct > 0
    ? `Health insurance covered ${(coveragePct * 100).toFixed(0)}%! Out-of-pocket: ₹${outOfPocket.toLocaleString('en-IN')}`
    : `No health insurance: paid full ₹${baseCost.toLocaleString('en-IN')}!`;

  p.eventLog.unshift({
    day,
    text: `🩺 Medical Emergency: ${title}. ${insNote}`,
    type: 'event'
  });

  return {
    triggered: true,
    name: title,
    medicalBill: baseCost,
    outOfPocketCost: outOfPocket,
    description: insNote
  };
}
