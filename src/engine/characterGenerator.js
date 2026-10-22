import { createPRNG } from './prng.js';

const CITIES = {
  tier1: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad'],
  tier2: ['Pune', 'Ahmedabad', 'Chandigarh', 'Chennai', 'Kochi'],
  tier3: ['Indore', 'Coimbatore', 'Jaipur', 'Nagpur', 'Bhubaneswar'],
};

const TIER_MULTIPLIERS = {
  tier1: { cost: 1.25, salary: 1.30 },
  tier2: { cost: 1.00, salary: 1.00 },
  tier3: { cost: 0.75, salary: 0.85 },
};

const NAMES = [
  'Aarav Sharma', 'Ananya Iyer', 'Rohan Verma', 'Priya Nair', 
  'Aditya Kulkarni', 'Sneha Patel', 'Vikram Joshi', 'Divya Menon',
  'Kabir Sengupta', 'Meera Rao', 'Arjun Kapoor', 'Tanvi Deshmukh',
  'Rishi Choudhury', 'Isha Mehra', 'Siddharth Pillai', 'Pooja Reddy'
];

const CAREER_DATA = {
  science: {
    titles: [
      'Junior Software Engineer',
      'Data Analyst',
      'Cloud Systems Associate',
      'Biotech Research Associate',
    ],
    baseGrossMin: 52000,
    baseGrossMax: 72000,
  },
  commerce: {
    titles: [
      'Financial Analyst',
      'Junior Auditor',
      'Tax Associate',
      'Risk Operations Analyst',
    ],
    baseGrossMin: 44000,
    baseGrossMax: 62000,
  },
  arts: {
    titles: [
      'UI/UX Designer',
      'Brand Strategist',
      'Digital Media Associate',
      'Junior Architect',
    ],
    baseGrossMin: 40000,
    baseGrossMax: 56000,
  },
};

const DREAMS = [
  'Buy a dream home by age 32',
  'Found an independent startup by 30',
  'Achieve complete financial independence by 45',
  'Build a ₹1 Crore investment portfolio by 35',
  'Travel to 20 countries debt-free',
  'Establish a generational wealth corpus for family',
];

function calculateEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12;
  const num = principal * r * Math.pow(1 + r, tenureMonths);
  const den = Math.pow(1 + r, tenureMonths) - 1;
  return Math.round(num / den);
}

/**
 * Generates the full initial character state deterministically from PRNG seed.
 */
export function generateCharacter(seed, cityTier = 'tier1', careerField = 'science') {
  const rng = createPRNG(seed);

  // 1. Identity
  const nameIndex = Math.floor(rng() * NAMES.length);
  const name = NAMES[nameIndex];
  const age = 22 + Math.floor(rng() * 3); // 22, 23, or 24
  const retirementAge = 60;

  const cityList = CITIES[cityTier] || CITIES.tier1;
  const city = cityList[Math.floor(rng() * cityList.length)];

  // 2. Career & Salary
  const fieldData = CAREER_DATA[careerField] || CAREER_DATA.science;
  const jobTitle = fieldData.titles[Math.floor(rng() * fieldData.titles.length)];
  const mult = TIER_MULTIPLIERS[cityTier] || TIER_MULTIPLIERS.tier2;

  const rawBaseGross = fieldData.baseGrossMin + rng() * (fieldData.baseGrossMax - fieldData.baseGrossMin);
  const grossMonthlySalary = Math.round((rawBaseGross * mult.salary) / 500) * 500;

  // Taxes & PF
  const annualGross = grossMonthlySalary * 12;
  const taxRate = annualGross > 700000 ? 0.12 : 0.06;
  const taxAndPFDeductions = Math.round(grossMonthlySalary * taxRate);
  const monthlyTakeHome = grossMonthlySalary - taxAndPFDeductions;

  // 3. Loans (40% chance, scaled to salary so EMI never exceeds 18% of take-home)
  const hasEducationLoan = rng() < 0.40;
  const loans = [];
  if (hasEducationLoan) {
    // Principal between 2L and 4.5L, capped by take-home capacity
    const maxAffordablePrincipal = Math.floor((monthlyTakeHome * 0.18 * 45) / 10000) * 10000;
    const rawPrincipal = Math.min(maxAffordablePrincipal, 200000 + rng() * 250000);
    const principalRemaining = Math.max(150000, Math.round(rawPrincipal / 10000) * 10000);
    const interestRateAnnual = 0.085;
    const tenureMonthsRemaining = 60;
    const emi = calculateEMI(principalRemaining, interestRateAnnual, tenureMonthsRemaining);

    loans.push({
      id: 'loan_education',
      name: 'Education Loan',
      principalRemaining,
      interestRateAnnual,
      tenureMonthsRemaining,
      emi,
    });
  }

  const totalLoanEMIs = loans.reduce((sum, loan) => sum + loan.emi, 0);

  // 4. Living Expenses
  const rentPct = (0.20 + rng() * 0.05) * mult.cost;
  let rent = Math.round((monthlyTakeHome * rentPct) / 500) * 500;
  let utilities = Math.round((2800 + rng() * 1600) / 100) * 100;
  let groceries = Math.round((monthlyTakeHome * (0.11 + rng() * 0.03)) / 500) * 500;
  let lifestyle = Math.round((monthlyTakeHome * (0.07 + rng() * 0.03)) / 500) * 500;
  
  // Dependant support only if take-home pay is healthy (> 35,000)
  const hasDependant = monthlyTakeHome > 35000 && rng() < 0.30;
  let dependantSupport = hasDependant ? 5000 : 0;

  // Enforce Golden Invariant: monthlySurplus >= 10,000
  let totalFixedExpenses = rent + utilities + groceries + lifestyle + dependantSupport;
  let totalMonthlyOutflow = totalFixedExpenses + totalLoanEMIs;
  let monthlySurplus = monthlyTakeHome - totalMonthlyOutflow;

  if (monthlySurplus < 10000) {
    const deficitToCorrect = 10000 - monthlySurplus;
    
    // Step 1: Reduce lifestyle
    const lifestyleReduction = Math.min(deficitToCorrect * 0.4, Math.max(0, lifestyle - 2500));
    lifestyle = Math.round(lifestyle - lifestyleReduction);

    // Step 2: Reduce rent
    let remaining = 10000 - (monthlyTakeHome - (rent + utilities + groceries + lifestyle + dependantSupport + totalLoanEMIs));
    if (remaining > 0) {
      const rentReduction = Math.min(remaining * 0.6, Math.max(0, rent - 4500));
      rent = Math.round(rent - rentReduction);
    }

    // Step 3: If still under 10k, trim groceries & dependant
    remaining = 10000 - (monthlyTakeHome - (rent + utilities + groceries + lifestyle + dependantSupport + totalLoanEMIs));
    if (remaining > 0 && dependantSupport > 0) {
      const depReduction = Math.min(remaining, dependantSupport);
      dependantSupport -= depReduction;
    }

    remaining = 10000 - (monthlyTakeHome - (rent + utilities + groceries + lifestyle + dependantSupport + totalLoanEMIs));
    if (remaining > 0) {
      rent = Math.round(rent - remaining);
    }

    totalFixedExpenses = rent + utilities + groceries + lifestyle + dependantSupport;
    totalMonthlyOutflow = totalFixedExpenses + totalLoanEMIs;
    monthlySurplus = monthlyTakeHome - totalMonthlyOutflow;
  }

  // 5. Initial Bank Liquid Cash Buffer (1.2x to 2.0x of monthly outflow)
  const cashBufferMonths = 1.2 + rng() * 0.8;
  const liquidCash = Math.round((totalMonthlyOutflow * cashBufferMonths) / 1000) * 1000;

  // 6. Primary Life Dream
  const primaryDream = DREAMS[Math.floor(rng() * DREAMS.length)];

  return {
    id: `char_${seed}`,
    seed,
    name,
    age,
    retirementAge,
    city,
    cityTier,
    careerField,
    jobTitle,
    grossMonthlySalary,
    taxAndPFDeductions,
    monthlyTakeHome,
    expenses: {
      rent,
      utilities,
      groceries,
      lifestyle,
      dependantSupport,
    },
    loans,
    liquidCash,
    totalFixedExpenses,
    totalLoanEMIs,
    totalMonthlyOutflow,
    monthlySurplus,
    primaryDream,
  };
}
