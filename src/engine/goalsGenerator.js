// Pure deterministic goal generator engine

const TIER_TARGETS = {
  tier1: {
    car: 800000,
    weddingMin: 1000000,
    weddingMax: 1400000,
    homeDownPayment: 2800000,
    childEdu: 3200000,
    domesticTrip: 60000,
    intlTrip: 180000,
  },
  tier2: {
    car: 650000,
    weddingMin: 700000,
    weddingMax: 1000000,
    homeDownPayment: 1800000,
    childEdu: 2200000,
    domesticTrip: 45000,
    intlTrip: 140000,
  },
  tier3: {
    car: 500000,
    weddingMin: 500000,
    weddingMax: 700000,
    homeDownPayment: 1100000,
    childEdu: 1500000,
    domesticTrip: 35000,
    intlTrip: 110000,
  },
};

/**
 * Generates the initial goals roadmap based on character demographics and financials.
 */
export function generateInitialGoals(character) {
  const tier = TIER_TARGETS[character.cityTier] || TIER_TARGETS.tier2;
  const startAge = character.age;

  // 1. Emergency Fund (Mandatory • Continuous Dynamic Buffer)
  const emergencyTarget = Math.round((character.totalMonthlyOutflow * 6) / 5000) * 5000;

  // 2. Annual Vacation (Recurring • 12-Month Cycle)
  const defaultTripOption = 'domestic';
  const vacationTarget = tier.domesticTrip;

  // 3. First Car (Milestone • Age 27)
  const carTargetAge = Math.max(startAge + 2, 27);
  const carTarget = tier.car;

  // 4. Marriage & Wedding (Milestone • Age 29)
  const weddingTargetAge = Math.max(startAge + 3, 29);
  const rawWedding = character.monthlyTakeHome * 12;
  const weddingTarget = Math.round(
    Math.min(tier.weddingMax, Math.max(tier.weddingMin, rawWedding)) / 25000
  ) * 25000;

  // 5. Home Down Payment (Milestone • Age 34)
  const homeTargetAge = Math.max(startAge + 5, 34);
  const homeTarget = tier.homeDownPayment;

  // 6. Child Higher Education (Milestone • Age 46)
  const childTargetAge = 46;
  const childTarget = tier.childEdu;

  // 7. Retirement Corpus (Mandatory • Age 60 • Rule of 25)
  const retirementTargetAge = 60;
  const retirementTarget = Math.round((character.totalFixedExpenses * 300) / 50000) * 50000;

  return [
    {
      id: 'goal_emergency',
      name: 'Emergency Fund (6 Months)',
      kind: 'recurring',
      category: 'safety',
      description: 'Non-negotiable liquid safety buffer. Auto-pauses when full; refills if emergencies strike.',
      targetAmount: emergencyTarget,
      currentAmount: 0,
      targetAge: startAge + 2,
      targetMonthsRemaining: (startAge + 2 - startAge) * 12,
      recurrenceIntervalMonths: 0,
      isMandatory: true,
      priority: 1,
      status: 'in_progress',
      icon: '🛡️',
    },
    {
      id: 'goal_vacation',
      name: 'Annual Vacation / Trip',
      kind: 'recurring',
      category: 'lifestyle',
      description: 'Recurring yearly trip. Resets burnout and boosts lifestyle happiness every 12 months.',
      targetAmount: vacationTarget,
      currentAmount: 0,
      targetAge: startAge + 1,
      targetMonthsRemaining: 12,
      recurrenceIntervalMonths: 12,
      selectedTierOption: defaultTripOption,
      isMandatory: false,
      priority: 3,
      status: 'in_progress',
      icon: '✈️',
    },
    {
      id: 'goal_car',
      name: 'Buy First Car',
      kind: 'milestone',
      category: 'lifestyle',
      description: 'Convenient daily commute. Adds maintenance and fuel running costs upon purchase.',
      targetAmount: carTarget,
      currentAmount: 0,
      targetAge: carTargetAge,
      targetMonthsRemaining: (carTargetAge - startAge) * 12,
      isMandatory: false,
      priority: 3,
      status: 'in_progress',
      icon: '🚗',
    },
    {
      id: 'goal_marriage',
      name: 'Marriage & Wedding',
      kind: 'milestone',
      category: 'lifestyle',
      description: 'Traditional wedding ceremony. Unlocks dual-income household earnings.',
      targetAmount: weddingTarget,
      currentAmount: 0,
      targetAge: weddingTargetAge,
      targetMonthsRemaining: (weddingTargetAge - startAge) * 12,
      isMandatory: false,
      priority: 2,
      status: 'in_progress',
      icon: '💍',
    },
    {
      id: 'goal_home',
      name: 'Home Down Payment',
      kind: 'milestone',
      category: 'asset',
      description: '25% down payment on apartment. Eliminates rent and starts real estate equity.',
      targetAmount: homeTarget,
      currentAmount: 0,
      targetAge: homeTargetAge,
      targetMonthsRemaining: (homeTargetAge - startAge) * 12,
      isMandatory: false,
      priority: 2,
      status: 'in_progress',
      icon: '🏠',
    },
    {
      id: 'goal_child',
      name: 'Child Higher Education',
      kind: 'milestone',
      category: 'long_term',
      description: 'Professional college degree corpus for children debt-free.',
      targetAmount: childTarget,
      currentAmount: 0,
      targetAge: childTargetAge,
      targetMonthsRemaining: (childTargetAge - startAge) * 12,
      isMandatory: false,
      priority: 3,
      status: 'in_progress',
      icon: '🎓',
    },
    {
      id: 'goal_retirement',
      name: 'Retirement Corpus (FI/RE)',
      kind: 'milestone',
      category: 'long_term',
      description: 'Financial independence corpus. Generates 4% safe passive withdrawal income forever.',
      targetAmount: retirementTarget,
      currentAmount: 0,
      targetAge: retirementTargetAge,
      targetMonthsRemaining: (retirementTargetAge - startAge) * 12,
      isMandatory: true,
      priority: 1,
      status: 'in_progress',
      icon: '🌴',
    },
  ];
}
