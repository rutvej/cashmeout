// Pure deterministic venture catalog & calculation engine
import { createPRNG } from './prng.js';

export const VENTURE_CATALOG = [
  {
    id: 'venture_digital_agency',
    ventureType: 'side_hustle',
    name: 'Digital Agency / SaaS / Creator',
    icon: '💻',
    category: 'venture',
    kind: 'venture',
    targetAmount: 250000, // ₹2,50,000 Seed Capital
    monthlyRevenueBase: 18500, // Nominal midpoint for ₹12,000 - ₹25,000 range
    monthlyOperationalCost: 0,
    projectedNetMonthly: '₹12,000 – ₹25,000 / mo',
    volatilityNote: '±15% dynamic market demand variance',
    riskProfile: 'Low Risk · High Upside · Sweat Equity',
    description: 'Build a niche digital agency, creator business, or micro-SaaS. Low capital overhead with strong net margins once recurring client retainers kick in.',
    instrumentId: 'equity', // Accumulates in Equity Mutual Funds (12% p.a.)
    minPriority: 3,
    priority: 3,
    scaleUpCost: 75000,
  },
  {
    id: 'venture_franchise',
    name: 'Boutique Franchise / Cafe',
    ventureType: 'franchise',
    icon: '☕',
    category: 'venture',
    kind: 'venture',
    targetAmount: 600000, // ₹6,00,000 Capital Requirement
    monthlyRevenueBase: 45000, // Gross monthly profit: ₹45,000
    monthlyOperationalCost: 15000, // Monthly operational manager expense: -₹15,000
    projectedNetMonthly: '+₹30,000 / mo net passive',
    volatilityNote: '₹45k gross - ₹15k manager = ₹30k/mo net',
    riskProfile: 'Moderate Risk · Steady Passive Cash Flow',
    description: 'Semi-passive physical storefront or franchise. An experienced general manager oversees daily inventory and staff while you collect net passive dividends.',
    instrumentId: 'fd', // Accumulates in Fixed Deposit (7% p.a.)
    minPriority: 3,
    priority: 3,
    scaleUpCost: 150000,
  },
  {
    id: 'venture_rental_property',
    name: 'Rental Property (2nd Asset)',
    ventureType: 'rental_property',
    icon: '🏢',
    category: 'venture',
    kind: 'venture',
    targetAmount: 1000000, // ₹10,00,000 Down Payment (20% of ₹50,00,000 unit)
    monthlyRevenueBase: 28000, // Rental Inflow: +₹28,000/mo
    monthlyOperationalCost: 0,
    projectedNetMonthly: '+₹28,000 / mo rent inflow',
    volatilityNote: '+₹28k/mo rent inflow · 6.5% p.a. property compounding',
    mortgageAmount: 4000000, // ₹40,00,000 loan
    mortgageInterestRate: 0.085, // 8.5% p.a.
    mortgageTenureMonths: 180, // 15 years
    mortgageEMI: 39388, // ~₹39,400/mo EMI
    propertyInitialValue: 5000000, // ₹50 Lakh starting property value
    propertyAppreciationRate: 0.065, // 6.5% p.a.
    riskProfile: 'Capital Heavy · Prime Real Estate Equity',
    description: 'Acquire an appreciating 2BHK rental property with ₹10 Lakh down payment and a 15-year 8.5% mortgage. Tenant rent covers the bulk of the EMI while property equity compounds.',
    instrumentId: 'gold', // Accumulates in Gold / SGB (8.5% p.a.)
    minPriority: 2,
    priority: 2,
    scaleUpCost: 200000,
  },
];

/**
 * Creates a new venture goal instance from a catalog template.
 */
export function createVentureGoal(template, currentAge = 25) {
  return {
    id: `goal_venture_${template.ventureType}_${Date.now()}`,
    ventureCatalogId: template.id,
    name: template.name,
    ventureType: template.ventureType,
    category: 'venture',
    kind: 'venture',
    icon: template.icon,
    description: template.description,
    riskProfile: template.riskProfile,
    volatilityNote: template.volatilityNote,
    projectedNetMonthly: template.projectedNetMonthly,

    // Funding stage
    targetAmount: template.targetAmount,
    currentAmount: 0,
    allocationMode: 'fixed',
    allocationPercent: 0,
    baseMonthlySIP: 0,
    effectiveMonthlySIP: 0,
    instrumentId: template.instrumentId || 'equity',
    redirectGoalId: 'goal_retirement',
    isMandatory: false,
    priority: template.priority || 3,
    minPriority: template.minPriority || 3,
    targetAge: currentAge + 5,
    targetMonthsRemaining: 60,
    status: 'in_progress',

    // Operational stage
    isLaunched: false,
    launchModalTriggered: false,
    launchedAtMonthIndex: null,
    monthlyRevenueBase: template.monthlyRevenueBase,
    monthlyOperationalCost: template.monthlyOperationalCost,
    currentMonthlyRevenue: 0,
    currentMonthlyCost: 0,
    netMonthlyCashFlow: 0,
    lastMonthNetCashFlow: 0,
    lifetimeEarnings: 0,

    // Rental property details
    mortgageAmount: template.mortgageAmount || 0,
    mortgageInterestRate: template.mortgageInterestRate || 0,
    mortgageTenureMonths: template.mortgageTenureMonths || 0,
    mortgageEMI: template.mortgageEMI || 0,
    propertyInitialValue: template.propertyInitialValue || 0,
    propertyAssetValue: template.propertyInitialValue || 0,
    propertyAppreciationRate: template.propertyAppreciationRate || 0,

    // Scaling
    isScaledUp: false,
    scaleUpCost: template.scaleUpCost || 100000,
  };
}

/**
 * Calculates deterministic monthly cash flow for a launched venture.
 * 
 * @param {Object} goal - Venture goal item
 * @param {string} seed - PRNG seed
 * @param {number} monthIndex - Current simulation month index
 * @returns {Object} { grossRevenue, operationalCost, netCashFlow }
 */
export function calculateVentureMonthlyCashFlow(goal, seed, monthIndex) {
  if (!goal.isLaunched) {
    return { grossRevenue: 0, operationalCost: 0, netCashFlow: 0 };
  }

  let gross = goal.monthlyRevenueBase || 0;
  let cost = goal.monthlyOperationalCost || 0;

  if (goal.ventureType === 'side_hustle') {
    // Dynamic Volatility: Monthly revenue fluctuates by +/- 15% reflecting market demand
    const rng = createPRNG(`${seed}_venture_${goal.id}_${monthIndex}`);
    const variance = 1 + (rng() * 0.30 - 0.15); // [0.85, 1.15]
    gross = Math.round(goal.monthlyRevenueBase * variance);

    // If scaled up, allow higher range; otherwise clamp to ₹12,000 - ₹25,000
    const minRev = goal.isScaledUp ? 15000 : 12000;
    const maxRev = goal.isScaledUp ? 35000 : 25000;
    gross = Math.max(minRev, Math.min(maxRev, gross));
    cost = 0;
  } else if (goal.ventureType === 'franchise') {
    gross = goal.isScaledUp ? Math.round(45000 * 1.3) : 45000;
    cost = 15000;
  } else if (goal.ventureType === 'rental_property') {
    gross = goal.isScaledUp ? Math.round(28000 * 1.3) : 28000;
    cost = 0;
  }

  const netCashFlow = Math.max(0, gross - cost);
  return { grossRevenue: gross, operationalCost: cost, netCashFlow };
}
