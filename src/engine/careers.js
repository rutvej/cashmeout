import { randInt, randFloat } from '../utils/random.js';
import { CITY_TIERS } from './constants.js';

export const CITY_TIER_SALARY_CAPS = {
  1: 160000, // Tier 1: ₹1.6L/mo (₹19.2 LPA base ceiling)
  2: 110000, // Tier 2: ₹1.1L/mo (₹13.2 LPA base ceiling)
  3: 75000,  // Tier 3: ₹75K/mo (₹9.0 LPA base ceiling)
};

/**
 * Returns required switch cooldown in days based on current salary level.
 * Senior roles have longer minimum tenures before recruiters consider them.
 */
export function getJobSwitchCooldown(currentSalary = 35000) {
  if (currentSalary >= 120000) return 365; // 1 year minimum for leadership
  if (currentSalary >= 70000) return 270;  // 9 months for staff/lead
  return 180;                              // 6 months for junior/mid
}

/**
 * Returns a realistic corporate/tech job title based on accumulated experience, salary, and caps.
 */
export function getCareerRole(experienceMonths = 0, currentSalary = 30000, courseCompleted = false) {
  const years = experienceMonths / 12;

  if (currentSalary >= 140000 || (years >= 14 && courseCompleted)) {
    return 'Managing Director / Executive VP';
  }
  if (currentSalary >= 110000 || (years >= 10 && courseCompleted)) {
    return 'Director of Operations & Strategy';
  }
  if (currentSalary >= 85000 || years >= 7) {
    return 'Principal Group Lead / Associate Director';
  }
  if (currentSalary >= 60000 || years >= 4.5) {
    return 'Staff Specialist / Senior Lead';
  }
  if (currentSalary >= 42000 || years >= 2.5) {
    return 'Senior Specialist / Analyst II';
  }
  if (currentSalary >= 28000 || years >= 1) {
    return 'Associate Specialist / Analyst';
  }
  return 'Junior Associate / Trainee';
}

/**
 * Computes a realistic, diminishing hike rate based on current salary band,
 * approaching the city-tier ceiling smoothly.
 */
export function computeDiminishingHike(currentSalary, cityTier, targetType = 'standard', isUpskilled = false) {
  const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;
  if (currentSalary >= cap) return 0;

  // Base hike rates diminishing realistically as salary climbs
  let basePct = 0.12;
  if (currentSalary < 40000) {
    basePct = targetType === 'tech' ? 0.16 : targetType === 'lead' ? 0.14 : 0.10;
  } else if (currentSalary < 70000) {
    basePct = targetType === 'tech' ? 0.12 : targetType === 'lead' ? 0.10 : 0.08;
  } else if (currentSalary < 110000) {
    basePct = targetType === 'tech' ? 0.08 : targetType === 'lead' ? 0.07 : 0.05;
  } else {
    // High earners: modest 3% to 5% incremental steps
    basePct = targetType === 'lead' ? 0.04 : 0.03;
  }

  if (isUpskilled && targetType === 'lead') {
    basePct += 0.03;
  }

  return basePct;
}

/**
 * Generates realistic job market openings strictly bounded by the City Tier Salary Cap.
 */
export function generateJobMarketOffers(state) {
  const currentJob = state.incomes?.find(i => i.type === 'job');
  const currentSalary = currentJob ? currentJob.amount : 0;
  const expMonths = state.experienceMonths || 0;
  const expYears = Number((expMonths / 12).toFixed(1));
  const cityTier = state.player?.cityTier || 2;
  const isUpskilled = state.courseCompleted;
  const cap = CITY_TIER_SALARY_CAPS[cityTier] || 180000;
  const isRecession = state.economicCycle === 'recession';
  const isBull = state.economicCycle === 'bull';

  const cityMult = cityTier === 1 ? 1.25 : cityTier === 2 ? 1.0 : 0.8;
  const baseBaseline = Math.round(
    Math.min(
      cap,
      Math.max(
        28000 * cityMult,
        (currentSalary > 0 ? currentSalary : (state.player?.startingSalary || 35000) * (1 + expMonths / 72))
      )
    )
  );

  // When unemployed: provide realistic re-entry full-time salaried offers
  if (!currentJob) {
    const reEntrySalary1 = Math.min(cap, Math.round(baseBaseline * (isRecession ? 0.80 : 0.95)));
    const reEntrySalary2 = Math.min(cap, Math.round(baseBaseline * (isRecession ? 0.92 : 1.10)));

    return [
      {
        id: 'reentry_enterprise',
        role: getCareerRole(expMonths, reEntrySalary1),
        company: 'Apex Global Enterprises',
        type: 'Established MNC',
        badge: isRecession ? 'Downturn Re-Entry' : 'Immediate Re-Entry',
        salary: reEntrySalary1,
        hikePercent: 0,
        hikeAmount: reEntrySalary1,
        description: isRecession
          ? 'Conservative corporate role in defensive sector during economic downturn. Stable monthly cashflow.'
          : 'Stable corporate position with comprehensive medical coverage and reliable monthly salary.',
        stability: 'High',
        requiredExp: 0,
        canApply: true,
        isAtCeiling: reEntrySalary1 >= cap,
      },
      {
        id: 'reentry_scaleup',
        role: getCareerRole(expMonths + 6, reEntrySalary2),
        company: 'HyperScale Mobility',
        type: 'Series-B Growth Venture',
        badge: isRecession ? 'Hiring Freeze (Locked)' : 'Market Baseline +10%',
        salary: reEntrySalary2,
        hikePercent: isRecession ? 0 : 10,
        hikeAmount: reEntrySalary2,
        description: isRecession
          ? 'Venture freeze: Active recruitment paused due to macro recessionary conditions.'
          : 'Tech-enabled logistics venture hiring experienced talent to lead operations.',
        stability: 'Medium',
        requiredExp: isRecession ? 999 : 6,
        canApply: !isRecession && expMonths >= 6,
        isAtCeiling: reEntrySalary2 >= cap,
      },
    ];
  }

  // If already at or above cap: player has reached the corporate base ceiling!
  const isAtCeiling = currentSalary >= cap;

  // Compute diminishing hikes
  const rawTechHike = computeDiminishingHike(currentSalary, cityTier, 'tech', isUpskilled);
  const rawMncHike = computeDiminishingHike(currentSalary, cityTier, 'standard', isUpskilled);
  const rawLeadHike = computeDiminishingHike(currentSalary, cityTier, 'lead', isUpskilled);

  // Recession dampener or Bull booster
  const cycleMult = isRecession ? 0.4 : isBull ? 1.15 : 1.0;

  const techHikePct = Math.max(0, rawTechHike * cycleMult);
  const mncHikePct = Math.max(0, rawMncHike * cycleMult);
  const leadHikePct = Math.max(0, rawLeadHike * cycleMult);

  // Clamp salaries strictly to City Tier Cap
  const techSalary = Math.min(cap, Math.round(currentSalary * (1 + techHikePct)));
  const mncSalary = Math.min(cap, Math.round(currentSalary * (1 + mncHikePct)));
  const leadSalary = Math.min(cap, Math.round(Math.max(currentSalary * (1 + leadHikePct), 70000)));

  const techActualHike = techSalary - currentSalary;
  const mncActualHike = mncSalary - currentSalary;
  const leadActualHike = leadSalary - currentSalary;

  const techHikeFinalPct = currentSalary > 0 ? Math.round((techActualHike / currentSalary) * 100) : 0;
  const mncHikeFinalPct = currentSalary > 0 ? Math.round((mncActualHike / currentSalary) * 100) : 0;
  const leadHikeFinalPct = currentSalary > 0 ? Math.round((leadActualHike / currentSalary) * 100) : 0;

  const leadMinExp = isUpskilled ? 18 : 36;

  return [
    {
      id: 'offer_tech',
      role: getCareerRole(expMonths + 18, techSalary),
      company: 'Zenith FinTech Unicorn',
      type: 'High-Growth Tech',
      badge: isAtCeiling
        ? 'Tier Cap Reached'
        : isRecession
        ? 'Downturn Slowdown'
        : `+${techHikeFinalPct}% Hike`,
      salary: techSalary,
      hikePercent: techHikeFinalPct,
      hikeAmount: techActualHike,
      description: isAtCeiling
        ? `You have reached the Tier ${cityTier} corporate base salary cap (₹${(cap / 100000).toFixed(1)}L/mo). Further wealth requires equity investments or business ventures.`
        : isRecession
        ? 'Cautious growth hiring amidst market contraction. Tighter compensation bands.'
        : 'High-visibility technical role with attractive performance milestones & fast promotion velocity.',
      stability: 'Medium',
      requiredExp: 12,
      canApply: !isAtCeiling && techActualHike > 0 && expMonths >= 12,
      isAtCeiling,
    },
    {
      id: 'offer_mnc',
      role: getCareerRole(expMonths + 12, mncSalary),
      company: 'Morgan & Stanley Global Solutions',
      type: 'Premier Enterprise MNC',
      badge: isAtCeiling
        ? 'Tier Cap Reached'
        : `+${mncHikeFinalPct}% Hike`,
      salary: mncSalary,
      hikePercent: mncHikeFinalPct,
      hikeAmount: mncActualHike,
      description: isAtCeiling
        ? `Industry base ceiling reached for Tier ${cityTier}. Lateral move with enterprise perks and comprehensive medical coverage.`
        : 'Prestigious institutional employer with stellar work-life balance, structured annual appraisal, and medical coverage.',
      stability: 'High',
      requiredExp: 18,
      canApply: !isAtCeiling && mncActualHike > 0 && expMonths >= 18,
      isAtCeiling,
    },
    {
      id: 'offer_lead',
      role: isUpskilled ? 'Director of Product & Engineering' : getCareerRole(expMonths + 36, leadSalary),
      company: 'NextGen Cloud Systems',
      type: 'Strategic Leadership',
      badge: isAtCeiling
        ? 'Max Corporate Band'
        : isUpskilled
        ? `+${leadHikeFinalPct}% Exec Step`
        : `+${leadHikeFinalPct}% Senior Step`,
      salary: leadSalary,
      hikePercent: leadHikeFinalPct,
      hikeAmount: leadActualHike,
      description: isAtCeiling
        ? `Top of the market band for Tier ${cityTier}. To exceed this income, build passive investment streams or equity ownership.`
        : isUpskilled
        ? 'Executive mandate scouted based on your upskilled credentials with departmental P&L oversight.'
        : 'Senior leadership opportunity managing multi-functional technical teams.',
      stability: 'High',
      requiredExp: leadMinExp,
      canApply: !isAtCeiling && leadActualHike > 0 && (expMonths >= leadMinExp || isUpskilled),
      isAtCeiling,
    },
  ];
}
