import { GameState } from '../types/game';
import { FOOD_TIERS, TRANSPORT_MODES } from '../data/static-data';

export interface HealthWarning {
  meterKey: 'cheapFoodDays' | 'noExerciseDays' | 'highStressDays' | 'lowEnergyDays' | 'unhealthyDays';
  title: string;
  doctorName: string;
  meterName: string;
  currentDays: number;
  maxDays: number;
  pct: number;
  impendingCrisis: string;
  expectedCost: number;
  advice: string;
}

export interface HealthConsequenceResult {
  triggered: boolean;
  name?: string;
  medicalBill?: number;
  outOfPocketCost?: number;
  description?: string;
  warning?: HealthWarning;
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

  // Check 60% Early Doctor Warning (Entering the red zone)
  if (p.consequenceMeters.cheapFoodDays === 12) {
    result.warning = {
      meterKey: 'cheapFoodDays',
      title: 'Digestive Inflammation Warning (60% Risk)',
      doctorName: 'Dr. Nair (Gastroenterologist)',
      meterName: 'Street Food Strain',
      currentDays: p.consequenceMeters.cheapFoodDays,
      maxDays: 20,
      pct: 60,
      impendingCrisis: 'Acute Gastroenteritis',
      expectedCost: 3500,
      advice: 'Your digestive tract has sustained 12 consecutive days of cheap, unhygienic street oils. If this reaches 20 days, bacterial infection will trigger Acute Gastroenteritis with a ₹3,500 clinic bill! Switch to clean home food or take prescribed probiotics now.'
    };
  } else if (p.consequenceMeters.noExerciseDays === 21) {
    result.warning = {
      meterKey: 'noExerciseDays',
      title: 'Lumbar Spine Compression Warning (60% Risk)',
      doctorName: 'Dr. Kapoor (Orthopedic)',
      meterName: 'Sedentary Inactivity',
      currentDays: p.consequenceMeters.noExerciseDays,
      maxDays: 35,
      pct: 60,
      impendingCrisis: 'Severe Lumbar Spasm',
      expectedCost: 5500,
      advice: '21 consecutive days of sitting have compressed your L4-L5 vertebrae. In just 14 more days, you will trigger an acute lumbar spasm costing ₹5,500 in emergency physio! Allocate workout time or schedule daily cardio immediately.'
    };
  } else if (p.consequenceMeters.highStressDays === 15) {
    result.warning = {
      meterKey: 'highStressDays',
      title: 'Nervous Exhaustion Warning (60% Risk)',
      doctorName: 'Dr. Shenoy (Psychiatrist)',
      meterName: 'Stress & Cortisol Fatigue',
      currentDays: p.consequenceMeters.highStressDays,
      maxDays: 25,
      pct: 60,
      impendingCrisis: 'Panic & Clinical Burnout',
      expectedCost: 7000,
      advice: 'Your stress levels have been in the danger zone for 15 straight days. In 10 days, adrenal collapse and panic episodes will force ₹7,000 in psychiatric care! Take a rest slot and unplug tonight.'
    };
  } else if (p.consequenceMeters.lowEnergyDays === 9) {
    result.warning = {
      meterKey: 'lowEnergyDays',
      title: 'Severe Sleep Debt Warning (60% Risk)',
      doctorName: 'Dr. Verma (Physician)',
      meterName: 'Energy Depletion',
      currentDays: p.consequenceMeters.lowEnergyDays,
      maxDays: 15,
      pct: 60,
      impendingCrisis: 'Adrenal Burnout',
      expectedCost: 4000,
      advice: 'Operating on under 25% energy for 9 consecutive days has drained your cellular reserves. In 6 days, total adrenal burnout will cost ₹4,000 in hospitalization! Sleep 8 hours tonight.'
    };
  }

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

export function getConsequenceWarnings(state: GameState): HealthWarning[] {
  const p = state.player;
  const warnings: HealthWarning[] = [];

  const check = (
    key: 'cheapFoodDays' | 'noExerciseDays' | 'highStressDays' | 'lowEnergyDays' | 'unhealthyDays',
    cur: number,
    max: number,
    title: string,
    doctorName: string,
    meterName: string,
    crisis: string,
    cost: number,
    advice: string
  ) => {
    const pct = Math.round((cur / max) * 100);
    if (pct >= 60) {
      warnings.push({
        meterKey: key,
        title,
        doctorName,
        meterName,
        currentDays: cur,
        maxDays: max,
        pct,
        impendingCrisis: crisis,
        expectedCost: cost,
        advice
      });
    }
  };

  check(
    'cheapFoodDays',
    p.consequenceMeters.cheapFoodDays,
    20,
    'Gut Inflammation Alert',
    'Dr. Nair (Gastroenterologist)',
    'Street Food Strain',
    'Acute Gastroenteritis',
    3500,
    '12+ days of cheap street food is eroding stomach lining. Switch to home food before hospital bills hit!'
  );

  check(
    'noExerciseDays',
    p.consequenceMeters.noExerciseDays,
    35,
    'Spinal Compression Alert',
    'Dr. Kapoor (Orthopedic)',
    'Sedentary Inactivity',
    'Severe Lumbar Spasm',
    5500,
    '21+ days without workout has frozen your lumbar joints. Add a workout slot to avoid ₹5,500 physio bills.'
  );

  check(
    'highStressDays',
    p.consequenceMeters.highStressDays,
    25,
    'Adrenal Burnout Alert',
    'Dr. Shenoy (Psychiatrist)',
    'High Stress Fatigue',
    'Panic & Nervous Exhaustion',
    7000,
    '15+ days in high stress danger zone. Unplug and rest before a severe panic crash occurs.'
  );

  check(
    'lowEnergyDays',
    p.consequenceMeters.lowEnergyDays,
    15,
    'Cellular Fatigue Alert',
    'Dr. Verma (Physician)',
    'Low Energy Fatigue',
    'Adrenal Burnout',
    4000,
    'Running on empty for 9+ days. Get deep sleep tonight to protect your immune system.'
  );

  return warnings;
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
