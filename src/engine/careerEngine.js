import { createPRNG } from './prng.js';

export const UPSKILLING_COURSES = [
  {
    id: 'course_bootcamp',
    name: 'Professional Specialization Bootcamp',
    shortName: 'Bootcamp / Specialization',
    tierName: 'Intermediate Specialization',
    totalCost: 30000,
    durationMonths: 3,
    monthlyFee: 10000,
    skillBoostReward: 0.4,
    icon: '⚡',
    badgeColor: 'amber',
    tagline: 'Master specialized tools & practical domain frameworks',
    description: 'An intensive 3-month modular curriculum focused on modern industry tools, rapid execution, and hands-on domain mastery.',
    topics: ['Modern Frameworks', 'Hands-on Sprints', 'Tooling Mastery'],
  },
  {
    id: 'course_cert',
    name: 'Advanced Industry Certification',
    shortName: 'Advanced Certification',
    tierName: 'Senior Accreditation',
    totalCost: 75000,
    durationMonths: 6,
    monthlyFee: 12500,
    skillBoostReward: 0.8,
    icon: '📜',
    badgeColor: 'blue',
    tagline: 'Global professional standard for senior architecture',
    description: 'A rigorous 6-month industry-recognized certification validating complex system design, risk mitigation, and senior execution.',
    topics: ['System Architecture', 'Production Reliability', 'Performance Scaling'],
  },
  {
    id: 'course_exec',
    name: 'Executive Leadership Masterclass',
    shortName: 'Executive Masterclass',
    tierName: 'Executive / Director',
    totalCost: 180000,
    durationMonths: 12,
    monthlyFee: 15000,
    skillBoostReward: 1.5,
    icon: '👑',
    badgeColor: 'purple',
    tagline: 'Elite management, strategy & organizational scaling',
    description: 'A prestigious 12-month executive program training directors, managers, and aspiring CxOs in high-stakes capital allocation and leadership.',
    topics: ['Strategic Scaling', 'P&L Ownership', 'Cross-Functional Leadership'],
  },
];

export const JOB_TIERS = {
  1: {
    tier: 1,
    name: 'Junior Specialist',
    label: 'Entry / Junior',
    requiredExperienceYears: 0,
    requiredSkillLevel: 1.0,
    baseGrossMin: 40000,
    baseGrossMax: 65000,
    color: 'emerald',
  },
  2: {
    tier: 2,
    name: 'Senior Specialist',
    label: 'Senior',
    requiredExperienceYears: 3,
    requiredSkillLevel: 2.0,
    baseGrossMin: 75000,
    baseGrossMax: 120000,
    color: 'blue',
  },
  3: {
    tier: 3,
    name: 'Lead / Manager',
    label: 'Lead / Manager',
    requiredExperienceYears: 6,
    requiredSkillLevel: 3.2,
    baseGrossMin: 140000,
    baseGrossMax: 220000,
    color: 'purple',
  },
  4: {
    tier: 4,
    name: 'Principal / Director',
    label: 'Executive / Director',
    requiredExperienceYears: 10,
    requiredSkillLevel: 4.2,
    baseGrossMin: 250000,
    baseGrossMax: 400000,
    color: 'amber',
  },
};

export const CAREER_ROLES = {
  science: {
    1: [
      { title: 'Junior Software Engineer', company: 'Razorpay' },
      { title: 'Associate Data Analyst', company: 'Swiggy' },
      { title: 'Cloud Systems Associate', company: 'Infosys R&D' },
      { title: 'Biotech Research Associate', company: 'Biocon Labs' },
    ],
    2: [
      { title: 'Senior Software Engineer', company: 'Flipkart' },
      { title: 'Senior Data Scientist', company: 'Zerodha' },
      { title: 'Cloud Infrastructure Architect', company: 'Microsoft IDC' },
      { title: 'Full-Stack Systems Lead', company: 'Atlassian' },
    ],
    3: [
      { title: 'Engineering Manager', company: 'Google India' },
      { title: 'Head of Data Platforms', company: 'Swiggy' },
      { title: 'Principal Systems Architect', company: 'Razorpay' },
      { title: 'Director of Machine Learning', company: 'Flipkart' },
    ],
    4: [
      { title: 'VP of Engineering', company: 'Zerodha' },
      { title: 'Chief Technology Officer (CTO)', company: 'Razorpay' },
      { title: 'Chief Architect & Distinguished Fellow', company: 'Google India' },
      { title: 'Head of Global AI Research', company: 'Microsoft IDC' },
    ],
  },
  commerce: {
    1: [
      { title: 'Financial Analyst', company: 'HDFC Capital' },
      { title: 'Junior Auditor', company: 'KPMG Advisory' },
      { title: 'Tax Operations Associate', company: 'Deloitte' },
      { title: 'Risk Operations Analyst', company: 'Kotak Institutional' },
    ],
    2: [
      { title: 'Senior Financial Analyst', company: 'Morgan Stanley' },
      { title: 'Portfolio Strategy Lead', company: 'Goldman Sachs' },
      { title: 'Senior Risk Consultant', company: 'Bain & Company' },
      { title: 'Corporate Finance Associate', company: 'J.P. Morgan' },
    ],
    3: [
      { title: 'Finance Director', company: 'Deloitte India' },
      { title: 'AVP Asset Management', company: 'Goldman Sachs' },
      { title: 'Head of Internal Audit', company: 'HDFC Bank' },
      { title: 'Treasury & Liquidity Lead', company: 'Morgan Stanley' },
    ],
    4: [
      { title: 'Chief Financial Officer (CFO)', company: 'Kotak Mahindra' },
      { title: 'Managing Director - Capital Markets', company: 'Goldman Sachs' },
      { title: 'Partner - Strategic Advisory', company: 'Bain & Company' },
      { title: 'Global Head of Investment Banking', company: 'Morgan Stanley' },
    ],
  },
  arts: {
    1: [
      { title: 'UI/UX Designer', company: 'CRED Design Studio' },
      { title: 'Brand Strategist', company: 'Ogilvy India' },
      { title: 'Digital Media Associate', company: 'Zomato Creative' },
      { title: 'Junior Spatial Architect', company: 'Morphogenesis' },
    ],
    2: [
      { title: 'Senior Product Designer', company: 'Swiggy Design' },
      { title: 'Senior Creative Lead', company: 'Landor & Fitch' },
      { title: 'Design Systems Architect', company: 'CRED Studio' },
      { title: 'Senior Brand Architect', company: 'DDB Mudra' },
    ],
    3: [
      { title: 'Design Director', company: 'Adobe Experience Lab' },
      { title: 'Head of Brand Strategy', company: 'Ogilvy & Mather' },
      { title: 'Studio Creative Director', company: 'Pentagram India' },
      { title: 'Principal Product Experience Lead', company: 'CRED' },
    ],
    4: [
      { title: 'Chief Creative Officer (CCO)', company: 'Ogilvy Global' },
      { title: 'VP of Product Design', company: 'CRED Design Studio' },
      { title: 'Executive Creative Director', company: 'Landor & Fitch' },
      { title: 'Managing Partner - Brand Architecture', company: 'Pentagram' },
    ],
  },
};

const CITIES_BY_TIER = {
  tier1: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad'],
  tier2: ['Pune', 'Ahmedabad', 'Chandigarh', 'Chennai', 'Kochi'],
  tier3: ['Indore', 'Jaipur', 'Coimbatore', 'Nagpur', 'Bhubaneswar'],
};

const CITY_TIER_SALARY_MULT = {
  tier1: 1.30,
  tier2: 1.00,
  tier3: 0.85,
};

/**
 * Calculates interview acceptance probability based on candidate vs required metrics.
 * Equation from Phase 3 spec:
 * P_offer = clamp(0.30 + 0.20 * (exp - exp_req) + 0.25 * (skill - skill_req), 0.10, 0.95)
 */
export function calculateOfferProbability(exp, skill, expReq, skillReq) {
  const p = 0.30 + 0.20 * (exp - expReq) + 0.25 * (skill - skillReq);
  const clamped = Math.min(0.95, Math.max(0.10, p));
  return Number(clamped.toFixed(2));
}

/**
 * Calculates monthly EPF and progressive income tax with Section 87A rebate.
 * Section 87A rebate eliminates income tax for annual gross up to ₹7,00,000/yr.
 * Above ₹7,00,000/yr, 15% marginal tax applies strictly to the excess income,
 * with standard 5% employee provident fund (PF) deduction across all tiers.
 */
export function calculateTaxAndPFDeductions(grossMonthlySalary) {
  const annualGross = grossMonthlySalary * 12;
  const monthlyPF = Math.round(grossMonthlySalary * 0.05);
  const taxableExcess = Math.max(0, annualGross - 700000);
  const monthlyTax = Math.round((taxableExcess * 0.15) / 12);
  return monthlyPF + monthlyTax;
}

/**
 * Calculates net monthly take-home salary from monthly gross salary.
 */
export function calculateTakeHomeFromGross(grossMonthlySalary) {
  return grossMonthlySalary - calculateTaxAndPFDeductions(grossMonthlySalary);
}

/**
 * Deterministically generates active job listings for the dynamic job board.
 * Ensures available positions across tiers 1 through 4.
 */
export function generateJobMarket(careerField = 'science', seed = 'default', monthIndex = 0) {
  // Regenerates every 6 simulation months for dynamic market feel
  const marketCycle = Math.floor(monthIndex / 6);
  const rng = createPRNG(`${seed}_job_market_${careerField}_cycle_${marketCycle}`);
  const fieldRoles = CAREER_ROLES[careerField] || CAREER_ROLES.science;

  const listings = [];

  // Generate 1-2 openings per tier (tiers 1 through 4)
  [1, 2, 3, 4].forEach((tier) => {
    const tierConfig = JOB_TIERS[tier];
    const rolesList = fieldRoles[tier] || fieldRoles[1];

    // Pick 1 or 2 roles for this tier
    const count = tier <= 2 ? (rng() < 0.6 ? 2 : 1) : 1;

    for (let i = 0; i < count; i++) {
      const roleIndex = Math.floor(rng() * rolesList.length);
      const role = rolesList[roleIndex];

      // City & tier assignment
      const tierRoll = rng();
      const cityTier = tierRoll < 0.55 ? 'tier1' : tierRoll < 0.85 ? 'tier2' : 'tier3';
      const cityList = CITIES_BY_TIER[cityTier];
      const city = cityList[Math.floor(rng() * cityList.length)];

      const cityMult = CITY_TIER_SALARY_MULT[cityTier];
      const rawBase = tierConfig.baseGrossMin + rng() * (tierConfig.baseGrossMax - tierConfig.baseGrossMin);
      const grossMonthlySalary = Math.round((rawBase * cityMult) / 500) * 500;
      const monthlyTakeHome = calculateTakeHomeFromGross(grossMonthlySalary);

      // Signing / relocation bonus
      const hasBonus = rng() < 0.45;
      const signingBonus = hasBonus ? Math.round((grossMonthlySalary * (0.5 + rng() * 0.5)) / 5000) * 5000 : 0;

      listings.push({
        id: `job_${careerField}_t${tier}_${marketCycle}_${i}_${roleIndex}`,
        companyName: role.company,
        title: role.title,
        tier,
        tierName: tierConfig.name,
        field: careerField,
        requiredExperienceYears: tierConfig.requiredExperienceYears,
        requiredSkillLevel: tierConfig.requiredSkillLevel,
        grossMonthlySalary,
        annualCTC: grossMonthlySalary * 12,
        monthlyTakeHome,
        city,
        cityTier,
        signingBonus,
      });
    }
  });

  return listings;
}

/**
 * Evaluates whether an interview produces a job offer using PRNG.
 */
export function evaluateJobApplication(job, character, monthIndex = 0) {
  const exp = character.yearsOfExperience || 0;
  const skill = character.skillLevel || 1.0;
  const expReq = job.requiredExperienceYears;
  const skillReq = job.requiredSkillLevel;

  const probability = calculateOfferProbability(exp, skill, expReq, skillReq);

  // Deterministic roll keyed to character seed, job ID, and application month
  const rng = createPRNG(`${character.seed}_app_${job.id}_m${monthIndex}`);
  const roll = rng();

  const isAccepted = roll < probability;

  return {
    isAccepted,
    probability,
    roll: Number(roll.toFixed(3)),
  };
}

/**
 * Calculates dynamic annual career appraisal for employed characters.
 * Handles tenure stagnation (>=3 years without job hopping), recent upskilling boosts,
 * and deterministic variable raises (freeze 0-2%, normal 4-7%, boom 10-16%).
 *
 * @param {object} character - Character object containing tenure and course history
 * @param {number} monthIndex - Simulation month index (e.g. 12, 24, 36)
 * @param {string} seed - PRNG seed for deterministic outcome
 * @returns {{ hikeRate: number, category: 'freeze' | 'normal' | 'boom', headline: string, reason: string, isStagnated: boolean }}
 */
export function calculateAnnualAppraisal(character, monthIndex = 0, seed = 'default') {
  const actualSeed = seed !== 'default' && seed ? seed : (character?.seed || 'default');
  const tenureAtCurrentCompany = character?.tenureYearsAtCurrentCompany || 0;
  const isStagnated = tenureAtCurrentCompany >= 3;
  const monthsSinceLastCourse = character?.monthsSinceLastCourseCompletion ?? 999;
  const hasUpskilledRecently = monthsSinceLastCourse <= 24;

  const rng = createPRNG(`${actualSeed}_appraisal_m${monthIndex}`);
  const roll = rng();

  // If stagnated at same employer for 3+ years: 70% chance of freeze/minimal raise (0.5-2%)
  if (isStagnated && roll < 0.70) {
    const hikeRate = Number((0.005 + rng() * 0.015).toFixed(3)); // 0.5% to 2.0%
    return {
      hikeRate,
      category: 'freeze',
      headline: 'Company Salary Freeze / Minimal Raise',
      reason: 'Tenure Stagnation: Staying at the same company without switching has plateaued your pay.',
      isStagnated: true,
    };
  }

  // Upskilling boost: increases probability of high appraisal
  const boomThreshold = hasUpskilledRecently ? 0.35 : 0.20;
  const freezeThreshold = isStagnated ? 0.35 : 0.15;

  if (roll < freezeThreshold) {
    // 0% to 2% (Freeze / Modest)
    const hikeRate = Number((0.00 + rng() * 0.02).toFixed(3));
    return {
      hikeRate,
      category: 'freeze',
      headline: 'Modest Raise / Cost-of-Living Adjustment',
      reason: 'Company-wide budget tightening. Market rates are significantly higher on the Job Market!',
      isStagnated: Boolean(isStagnated),
    };
  } else if (roll < freezeThreshold + (1.0 - freezeThreshold - boomThreshold)) {
    // 4% to 7% (Normal)
    const hikeRate = Number((0.04 + rng() * 0.03).toFixed(3));
    return {
      hikeRate,
      category: 'normal',
      headline: 'Standard Performance Appraisal',
      reason: 'Solid corporate contribution meeting standard expectations.',
      isStagnated: Boolean(isStagnated),
    };
  } else {
    // 10% to 16% (High / Boom)
    const hikeRate = Number((0.10 + rng() * 0.06).toFixed(3));
    return {
      hikeRate,
      category: 'boom',
      headline: 'Top-Tier Performance Hike & Bonus',
      reason: 'Outstanding contribution and high skill execution rewarded with top-bracket appraisal!',
      isStagnated: false,
    };
  }
}

