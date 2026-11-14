import { createPRNG } from './prng.js';

// Phase 5: Life Event Recurring Outflows Constants
export const CAR_MONTHLY_UPKEEP = 3500;
export const CAR_UPKEEP_BREAKDOWN = {
  fuelCharging: 2200,
  servicingReserve: 800,
  motorInsurance: 500,
};

export const HOME_MONTHLY_MAINTENANCE = 5500;
export const HOME_MAINTENANCE_BREAKDOWN = {
  societyMaintenance: 3500,
  civicUtilities: 1000,
  municipalTaxes: 1000,
};

export const SPOUSE_ARCHETYPES = {
  high_earner: {
    id: 'high_earner',
    name: 'Dual Income High Earner',
    probability: 0.35,
    monthlyTakeHome: 65000,
    addedHouseholdExpenses: 22000,
    netSurplusDelta: 43000,
    isEmployed: true,
    tagline: 'High-powered corporate career accelerating household wealth and savings.',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-800',
    professions: [
      'Senior Product Manager',
      'Management Consultant',
      'Tech Lead',
      'Data Architect',
      'Investment Banker',
      'Cloud Solutions Architect',
    ],
  },
  equal_earner: {
    id: 'equal_earner',
    name: 'Dual Income Equal Earner',
    probability: 0.40,
    monthlyTakeHome: 40000,
    addedHouseholdExpenses: 20000,
    netSurplusDelta: 20000,
    isEmployed: true,
    tagline: 'Balanced dual-earner partnership building steady compounding and stability.',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-800',
    professions: [
      'Corporate HR Specialist',
      'Financial Analyst',
      'Content Strategist',
      'Operations Manager',
      'High School Educator',
      'UX/UI Designer',
    ],
  },
  single_income: {
    id: 'single_income',
    name: 'Single Income Household',
    probability: 0.25,
    monthlyTakeHome: 0,
    addedHouseholdExpenses: 18000,
    netSurplusDelta: -18000,
    isEmployed: false,
    tagline: 'Full-time family manager and home guardian; tightens monthly discretionary budget.',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-800',
    professions: [
      'Homemaker & Community Lead',
      'Freelance Artist & Homemaker',
      'Caregiver & Family Manager',
      'Independent Content Creator',
    ],
  },
};

const SPOUSE_NAMES = [
  'Ananya Iyer', 'Priya Nair', 'Sneha Patel', 'Meera Rao',
  'Divya Menon', 'Tanvi Deshmukh', 'Isha Mehra', 'Pooja Reddy',
  'Rohan Verma', 'Aditya Kulkarni', 'Vikram Joshi', 'Kabir Sengupta',
  'Arjun Kapoor', 'Siddharth Pillai', 'Rishi Choudhury', 'Aarav Sharma'
];

export function getInitialAssetMaintenanceState() {
  return {
    hasCar: false,
    carMonthlyUpkeep: 0,
    hasOwnedHome: false,
    homeMonthlyMaintenance: 0,
    isMarried: false,
    spouse: null,
  };
}

/**
 * Deterministically rolls a spouse profile based on the character seed.
 */
export function generateSpouseProfile(seed) {
  const rng = createPRNG(`${seed}_spouse_profile`);
  const roll = rng();

  let archetypeConfig;
  if (roll < 0.35) {
    archetypeConfig = SPOUSE_ARCHETYPES.high_earner;
  } else if (roll < 0.75) {
    archetypeConfig = SPOUSE_ARCHETYPES.equal_earner;
  } else {
    archetypeConfig = SPOUSE_ARCHETYPES.single_income;
  }

  const professionIndex = Math.floor(rng() * archetypeConfig.professions.length);
  const profession = archetypeConfig.professions[professionIndex];

  const nameIndex = Math.floor(rng() * SPOUSE_NAMES.length);
  const name = SPOUSE_NAMES[nameIndex];

  return {
    name,
    profession,
    archetype: archetypeConfig.name,
    archetypeId: archetypeConfig.id,
    monthlyTakeHome: archetypeConfig.monthlyTakeHome,
    addedHouseholdExpenses: archetypeConfig.addedHouseholdExpenses,
    netSurplusDelta: archetypeConfig.netSurplusDelta,
    isEmployed: archetypeConfig.isEmployed,
    tagline: archetypeConfig.tagline,
    badgeBg: archetypeConfig.badgeBg,
  };
}

/**
 * Cleanly itemizes ongoing monthly recurring costs into base living, car upkeep,
 * home maintenance, spouse addon, and active loan EMIs.
 */
export function getOutflowItemization(character) {
  const asset = character?.assetMaintenanceState || {};
  const carUpkeep = asset.hasCar ? (asset.carMonthlyUpkeep || CAR_MONTHLY_UPKEEP) : 0;
  const homeMaintenance = asset.hasOwnedHome ? (asset.homeMonthlyMaintenance || HOME_MONTHLY_MAINTENANCE) : 0;
  const spouseAddon = (asset.isMarried && asset.spouse) ? (asset.spouse.addedHouseholdExpenses || 0) : 0;

  const totalFixed = character?.totalFixedExpenses || 0;
  const baseLiving = Math.max(0, totalFixed - carUpkeep - homeMaintenance - spouseAddon);
  const loanEMIs = (character?.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalOutflow = totalFixed + loanEMIs;

  return {
    baseLiving,
    carUpkeep,
    homeMaintenance,
    spouseAddon,
    loanEMIs,
    totalFixed,
    totalOutflow,
    hasCar: !!asset.hasCar,
    hasOwnedHome: !!asset.hasOwnedHome,
    isMarried: !!asset.isMarried,
    spouse: asset.spouse || null,
  };
}

/**
 * Applies vehicle ownership: adds +₹3,500/mo vehicle upkeep to fixed expenses,
 * expands Emergency Fund by +6 * ₹3,500 = +₹21,000, and updates outflows/surplus.
 * Idempotent: safe to call multiple times without duplicating costs.
 */
// Apply Car Ownership
export function applyCarOwnership(character, goals = [], insurance = {}) {
  const currentAsset = character.assetMaintenanceState || getInitialAssetMaintenanceState();
  if (currentAsset.hasCar) {
    return { character, goals }; // Already owns car, idempotent
  }

  const updatedAsset = {
    ...currentAsset,
    hasCar: true,
    carMonthlyUpkeep: CAR_MONTHLY_UPKEEP,
  };

  const updatedFixedExpenses = character.totalFixedExpenses + CAR_MONTHLY_UPKEEP;
  const totalLoanEMIs = (character.loans || []).reduce((s, l) => s + (l.emi || 0), 0);
  const totalInsurance =
    ((insurance?.health?.isPurchased ? insurance.health.monthlyPremium : 0) || 0) +
    ((insurance?.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0) || 0);
  const courseFee = character.activeCourse ? (character.activeCourse.monthlyFee || 0) : 0;
  const updatedMonthlyOutflow = updatedFixedExpenses + totalLoanEMIs + totalInsurance + courseFee;

  const spouseIncome = (updatedAsset.isMarried && updatedAsset.spouse) ? (updatedAsset.spouse.monthlyTakeHome || 0) : 0;
  const actualSalary = character.employmentStatus === 'unemployed' ? 0 : (character.monthlyTakeHome || 0);
  const ventureIncome = character.ventureIncome || 0;
  const totalMonthlyInflow = actualSalary + spouseIncome + ventureIncome;
  const updatedMonthlySurplus = totalMonthlyInflow - updatedMonthlyOutflow;

  const currentEmergencyGoal = goals.find((g) => g.id === 'goal_emergency');
  const baseEmergencyTarget = currentEmergencyGoal?.targetAmount || Math.round(6 * (character.totalFixedExpenses + totalInsurance + totalLoanEMIs));
  const dynamicEmergencyTarget = baseEmergencyTarget + (6 * CAR_MONTHLY_UPKEEP);

  const updatedGoals = goals.map((g) => {
    if (g.id === 'goal_emergency') {
      const current = g.currentAmount || 0;
      const newStatus = current >= dynamicEmergencyTarget ? 'buffer_full' : (current > 0 ? 'refill_needed' : 'in_progress');
      return {
        ...g,
        targetAmount: dynamicEmergencyTarget,
        status: newStatus,
      };
    }
    if (g.id === 'goal_car') {
      return {
        ...g,
        status: 'completed',
        milestoneTriggered: true,
      };
    }
    return g;
  });

  const updatedCharacter = {
    ...character,
    assetMaintenanceState: updatedAsset,
    totalFixedExpenses: updatedFixedExpenses,
    totalMonthlyOutflow: updatedMonthlyOutflow,
    monthlySurplus: updatedMonthlySurplus,
  };

  return { character: updatedCharacter, goals: updatedGoals };
}

/**
 * Finalizes home purchase: adds +₹5,500/mo property maintenance to fixed expenses,
 * optionally adds mortgage loan, expands Emergency Fund accordingly, and updates outflows/surplus.
 * Idempotent: safe to call multiple times without duplicating costs.
 */
export function applyHomeOwnership(character, goals = [], insurance = {}, mortgageLoan = null, options = {}) {
  const currentAsset = character.assetMaintenanceState || getInitialAssetMaintenanceState();
  if (currentAsset.hasOwnedHome) {
    return { character, goals }; // Idempotent
  }

  const propertyCost = options.propertyCost || character.homePropertyAssetValue || 7500000;
  const shouldEliminateRent = options.eliminateRent === true;

  const updatedAsset = {
    ...currentAsset,
    hasOwnedHome: true,
    homeMonthlyMaintenance: HOME_MONTHLY_MAINTENANCE,
  };

  let updatedLoans = [...(character.loans || [])];
  if (mortgageLoan) {
    updatedLoans.push(mortgageLoan);
  }

  // When moving into owned home with financing: eliminate rent (if tracked and enabled)
  let currentRent = 0;
  let updatedExpenses = character.expenses ? { ...character.expenses } : null;
  if (shouldEliminateRent && updatedExpenses && updatedExpenses.rent) {
    currentRent = updatedExpenses.rent;
    updatedExpenses.rent = 0;
  }

  const updatedFixedExpenses = Math.max(0, character.totalFixedExpenses - currentRent + HOME_MONTHLY_MAINTENANCE);
  const totalLoanEMIs = updatedLoans.reduce((s, l) => s + (l.emi || 0), 0);
  const totalInsurance =
    ((insurance?.health?.isPurchased ? insurance.health.monthlyPremium : 0) || 0) +
    ((insurance?.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0) || 0);
  const courseFee = character.activeCourse ? (character.activeCourse.monthlyFee || 0) : 0;
  const updatedMonthlyOutflow = updatedFixedExpenses + totalLoanEMIs + totalInsurance + courseFee;

  const spouseIncome = (updatedAsset.isMarried && updatedAsset.spouse) ? (updatedAsset.spouse.monthlyTakeHome || 0) : 0;
  const actualSalary = character.employmentStatus === 'unemployed' ? 0 : (character.monthlyTakeHome || 0);
  const ventureIncome = character.ventureIncome || 0;
  const totalMonthlyInflow = actualSalary + spouseIncome + ventureIncome;
  const updatedMonthlySurplus = totalMonthlyInflow - updatedMonthlyOutflow;

  const currentEmergencyGoal = goals.find((g) => g.id === 'goal_emergency');
  const baseEmergencyTarget = currentEmergencyGoal?.targetAmount || Math.round(6 * (character.totalFixedExpenses + totalInsurance + totalLoanEMIs));
  const dynamicEmergencyTarget = baseEmergencyTarget + (6 * HOME_MONTHLY_MAINTENANCE) + (mortgageLoan ? Math.round(6 * (mortgageLoan.emi || 0)) : 0);

  const updatedGoals = goals.map((g) => {
    if (g.id === 'goal_emergency') {
      const current = g.currentAmount || 0;
      const newStatus = current >= dynamicEmergencyTarget ? 'buffer_full' : (current > 0 ? 'refill_needed' : 'in_progress');
      return {
        ...g,
        targetAmount: dynamicEmergencyTarget,
        status: newStatus,
      };
    }
    if (g.id === 'goal_home') {
      return {
        ...g,
        downPaymentPaid: g.currentAmount || options.downPayment || 0,
        currentAmount: 0,
        status: 'completed',
        milestoneTriggered: true,
        downPaymentSpent: true,
      };
    }
    return g;
  });

  const updatedCharacter = {
    ...character,
    assetMaintenanceState: updatedAsset,
    homePropertyAssetValue: propertyCost,
    expenses: updatedExpenses || character.expenses,
    loans: updatedLoans,
    totalLoanEMIs,
    totalFixedExpenses: updatedFixedExpenses,
    totalMonthlyOutflow: updatedMonthlyOutflow,
    monthlySurplus: updatedMonthlySurplus,
  };

  return { character: updatedCharacter, goals: updatedGoals };
}

/**
 * Applies wedding milestone & spouse household economics:
 * Updates combined household take-home, fixed living expenses (+addedHouseholdExpenses),
 * scales joint Emergency Fund target, spends wedding corpus, and updates monthly surplus.
 * Idempotent: safe to call multiple times without duplicating economics.
 */
export function applyMarriageEconomics(character, spouseProfile, goals = [], insurance = {}) {
  const currentAsset = character.assetMaintenanceState || getInitialAssetMaintenanceState();
  if (currentAsset.isMarried) {
    return { character, goals }; // Idempotent
  }

  const updatedAsset = {
    ...currentAsset,
    isMarried: true,
    spouse: spouseProfile,
  };

  const updatedFixedExpenses = character.totalFixedExpenses + spouseProfile.addedHouseholdExpenses;
  const totalLoanEMIs = (character.loans || []).reduce((s, l) => s + (l.emi || 0), 0);
  const totalInsurance =
    ((insurance?.health?.isPurchased ? insurance.health.monthlyPremium : 0) || 0) +
    ((insurance?.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0) || 0);
  const courseFee = character.activeCourse ? (character.activeCourse.monthlyFee || 0) : 0;
  const updatedMonthlyOutflow = updatedFixedExpenses + totalLoanEMIs + totalInsurance + courseFee;

  const actualSalary = character.employmentStatus === 'unemployed' ? 0 : (character.monthlyTakeHome || 0);
  const spouseIncome = spouseProfile.monthlyTakeHome || 0;
  const ventureIncome = character.ventureIncome || 0;
  const totalMonthlyInflow = actualSalary + spouseIncome + ventureIncome;
  const updatedMonthlySurplus = totalMonthlyInflow - updatedMonthlyOutflow;

  const currentEmergencyGoal = goals.find((g) => g.id === 'goal_emergency');
  const baseEmergencyTarget = currentEmergencyGoal?.targetAmount || Math.round(6 * (character.totalFixedExpenses + totalInsurance + totalLoanEMIs));
  const dynamicEmergencyTarget = baseEmergencyTarget + (6 * spouseProfile.addedHouseholdExpenses);

  const updatedGoals = goals.map((g) => {
    if (g.id === 'goal_emergency') {
      const current = g.currentAmount || 0;
      const newStatus = current >= dynamicEmergencyTarget ? 'buffer_full' : (current > 0 ? 'refill_needed' : 'in_progress');
      return {
        ...g,
        targetAmount: dynamicEmergencyTarget,
        status: newStatus,
      };
    }
    if (g.id === 'goal_marriage') {
      return {
        ...g,
        spentCorpus: g.currentAmount || g.targetAmount || 0,
        currentAmount: 0,
        status: 'completed',
        milestoneTriggered: true,
        weddingCorpusSpent: true,
      };
    }
    return g;
  });

  const updatedCharacter = {
    ...character,
    assetMaintenanceState: updatedAsset,
    spouseTakeHome: spouseIncome,
    totalFixedExpenses: updatedFixedExpenses,
    totalMonthlyOutflow: updatedMonthlyOutflow,
    monthlySurplus: updatedMonthlySurplus,
  };

  return { character: updatedCharacter, goals: updatedGoals };
}
