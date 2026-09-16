import { randInt, randFloat } from '../utils/random.js';
import { CITY_TIERS } from './constants.js';

/**
 * Returns a realistic corporate/tech job title based on accumulated experience and current salary.
 */
export function getCareerRole(experienceMonths = 0, currentSalary = 30000, courseCompleted = false) {
  const years = experienceMonths / 12;

  if (courseCompleted || currentSalary >= 180000 || years >= 12) {
    return 'Director / VP of Strategy & Engineering';
  }
  if (currentSalary >= 125000 || years >= 8) {
    return 'Principal Lead / Associate Director';
  }
  if (currentSalary >= 85000 || years >= 5) {
    return 'Staff Specialist / Senior Product Lead';
  }
  if (currentSalary >= 55000 || years >= 3) {
    return 'Senior Specialist / Software Engineer II';
  }
  if (currentSalary >= 35000 || years >= 1.5) {
    return 'Associate Specialist / Software Engineer';
  }
  return 'Junior Associate / Analyst';
}

/**
 * Generates realistic job market openings with realistic hikes on top of current salary.
 */
export function generateJobMarketOffers(state) {
  const currentJob = state.incomes?.find(i => i.type === 'job');
  const currentSalary = currentJob ? currentJob.amount : 0;
  const expMonths = state.experienceMonths || 0;
  const expYears = Number((expMonths / 12).toFixed(1));
  const cityTier = state.player?.cityTier || 2;
  const isUpskilled = state.courseCompleted;

  const cityMult = cityTier === 1 ? 1.25 : cityTier === 2 ? 1.0 : 0.8;
  const baseBaseline = Math.round(
    Math.max(
      28000 * cityMult,
      (currentSalary > 0 ? currentSalary : (state.player?.startingSalary || 35000) * (1 + expMonths / 72))
    )
  );

  // When unemployed: provide realistic re-entry full-time salaried offers
  if (!currentJob) {
    const reEntrySalary1 = Math.round(baseBaseline * 0.95);
    const reEntrySalary2 = Math.round(baseBaseline * 1.15);

    return [
      {
        id: 'reentry_enterprise',
        role: getCareerRole(expMonths, reEntrySalary1),
        company: 'Apex Global Enterprises',
        type: 'Established MNC',
        badge: 'Immediate Re-Entry',
        salary: reEntrySalary1,
        hikePercent: 0,
        hikeAmount: reEntrySalary1,
        description: 'Stable corporate position with comprehensive medical coverage, standard working hours, and reliable monthly salary.',
        stability: 'High',
        requiredExp: 0,
        canApply: true,
      },
      {
        id: 'reentry_scaleup',
        role: getCareerRole(expMonths + 6, reEntrySalary2),
        company: 'HyperScale Mobility',
        type: 'Series-B Growth Venture',
        badge: 'Market Baseline +15%',
        salary: reEntrySalary2,
        hikePercent: 15,
        hikeAmount: reEntrySalary2,
        description: 'Dynamic tech-enabled logistics venture hiring aggressively for experienced talent to lead operations.',
        stability: 'Medium',
        requiredExp: 6,
        canApply: expMonths >= 6,
      },
    ];
  }

  // When employed: realistic market hikes ON TOP OF current job
  // Offer 1: High-Growth Tech Venture (Realistic 35% - 45% Hike)
  const techHikePct = isUpskilled ? 0.45 : 0.36;
  const techSalary = Math.round(currentSalary * (1 + techHikePct));

  // Offer 2: Tier-1 Global MNC (Realistic 24% - 30% Hike with high stability & annual bonus)
  const mncHikePct = 0.26;
  const mncSalary = Math.round(currentSalary * (1 + mncHikePct));

  // Offer 3: Executive Leadership Step (Realistic 40% - 55% Hike, requires experience or upskilling)
  const leadHikePct = isUpskilled ? 0.52 : 0.42;
  const leadSalary = Math.round(Math.max(currentSalary * (1 + leadHikePct), 75000));
  const leadMinExp = isUpskilled ? 12 : 36;

  return [
    {
      id: 'offer_tech',
      role: getCareerRole(expMonths + 18, techSalary),
      company: 'Zenith FinTech Unicorn',
      type: 'High-Growth Tech',
      badge: `+${Math.round(techHikePct * 100)}% Hike`,
      salary: techSalary,
      hikePercent: Math.round(techHikePct * 100),
      hikeAmount: techSalary - currentSalary,
      description: 'High-visibility role in rapid expansion phase. Attractive performance equity & fast promotion velocity.',
      stability: 'Medium',
      requiredExp: 12,
      canApply: expMonths >= 12,
    },
    {
      id: 'offer_mnc',
      role: getCareerRole(expMonths + 12, mncSalary),
      company: 'Morgan & Stanley Global Solutions',
      type: 'Premier Enterprise MNC',
      badge: `+${Math.round(mncHikePct * 100)}% Hike`,
      salary: mncSalary,
      hikePercent: Math.round(mncHikePct * 100),
      hikeAmount: mncSalary - currentSalary,
      description: 'Prestigious institutional employer with stellar work-life balance, structured annual appraisal, and medical coverage.',
      stability: 'High',
      requiredExp: 18,
      canApply: expMonths >= 18,
    },
    {
      id: 'offer_lead',
      role: isUpskilled ? 'Director of Product & Engineering' : getCareerRole(expMonths + 36, leadSalary),
      company: 'NextGen Cloud Systems',
      type: 'Strategic Leadership',
      badge: isUpskilled ? `+${Math.round(leadHikePct * 100)}% Exec Jump` : `+${Math.round(leadHikePct * 100)}% Senior Step`,
      salary: leadSalary,
      hikePercent: Math.round(leadHikePct * 100),
      hikeAmount: leadSalary - currentSalary,
      description: isUpskilled
        ? 'Executive mandate scouted based on your upskilled credentials with departmental P&L oversight.'
        : 'Senior leadership opportunity managing multi-functional technical teams.',
      stability: 'High',
      requiredExp: leadMinExp,
      canApply: expMonths >= leadMinExp || isUpskilled,
    },
  ];
}
