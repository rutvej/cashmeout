// Phase 6: Real Estate Financing, Down Payment Scaling & Mortgage Engine

export const MORTGAGE_ANNUAL_RATE = 0.085; // 8.5% p.a.
export const DEFAULT_MORTGAGE_TENURE_MONTHS = 240; // 20 years (240 months)
export const HOME_APPRECIATION_RATE_ANNUAL = 0.065; // +6.5% p.a. property value appreciation
export const HOME_APPRECIATION_RATE_MONTHLY = 0.065 / 12;

export const EVICTION_SHOCK_RELOCATION_FEE = 60000; // ₹60,000 moving & brokerage fee
export const EVICTION_SHOCK_RENT_HIKE = 3000; // +₹3,000/mo rent hike

export const PROPERTY_TIERS = {
  tier1: {
    id: 'tier1',
    tier: 'tier1',
    propertyCost: 7500000,
    targetDownPayment: 1500000, // 20%
    minDownPaymentPct: 20,
    label: 'Tier-1 Metro 3BHK Apartment',
    cityDescription: 'Premium residential flat in Bengaluru / Mumbai / Delhi NCR',
  },
  tier2: {
    id: 'tier2',
    tier: 'tier2',
    propertyCost: 5500000,
    targetDownPayment: 1100000, // 20%
    minDownPaymentPct: 20,
    label: 'Tier-2 City 3BHK Apartment',
    cityDescription: 'Spacious family apartment in Pune / Ahmedabad / Chandigarh',
  },
  tier3: {
    id: 'tier3',
    tier: 'tier3',
    propertyCost: 4000000,
    targetDownPayment: 800000, // 20%
    minDownPaymentPct: 20,
    label: 'Tier-3 City Independent House',
    cityDescription: 'Independent standalone house in Indore / Jaipur / Coimbatore',
  },
};

export const DOWNSIZED_TIERS = {
  tier1: {
    id: 'tier1_downsized',
    tier: 'tier1',
    propertyCost: 5000000,
    targetDownPayment: 1000000, // 20%
    label: 'Suburban 2BHK Starter Apartment',
    cityDescription: 'Compact starter home with manageable loan principal',
  },
  tier2: {
    id: 'tier2_downsized',
    tier: 'tier2',
    propertyCost: 3500000,
    targetDownPayment: 700000, // 20%
    label: 'Compact 2BHK Apartment',
    cityDescription: 'Well-connected starter apartment in expanding corridor',
  },
  tier3: {
    id: 'tier3_downsized',
    tier: 'tier3',
    propertyCost: 2500000,
    targetDownPayment: 500000, // 20%
    label: 'Modest Starter Townhouse',
    cityDescription: 'Budget-friendly townhouse with zero over-leverage',
  },
};

/**
 * Returns property tier information for character's city tier.
 */
export function getPropertyTierData(cityTier = 'tier1') {
  return PROPERTY_TIERS[cityTier] || PROPERTY_TIERS.tier1;
}

/**
 * Returns downsized property data for character's city tier.
 */
export function getDownsizedTierData(cityTier = 'tier1') {
  return DOWNSIZED_TIERS[cityTier] || DOWNSIZED_TIERS.tier1;
}

/**
 * Computes standard monthly reducing balance EMI.
 * EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMortgageEMI(principal, annualRate = MORTGAGE_ANNUAL_RATE, tenureMonths = DEFAULT_MORTGAGE_TENURE_MONTHS) {
  const p = Number(principal) || 0;
  if (p <= 0) return 0;

  const n = Math.max(1, Number(tenureMonths) || DEFAULT_MORTGAGE_TENURE_MONTHS);
  const r = (Number(annualRate) || MORTGAGE_ANNUAL_RATE) / 12;

  if (r <= 0) {
    return Math.round(p / n);
  }

  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Calculates complete mortgage capital structure, EMIs, and interest savings
 * compared to baseline 20% down payment.
 */
export function calculateMortgageDetails({
  propertyCost = 7500000,
  downPayment = 1500000,
  annualRate = MORTGAGE_ANNUAL_RATE,
  tenureMonths = DEFAULT_MORTGAGE_TENURE_MONTHS,
}) {
  const cost = Math.max(1, Number(propertyCost) || 7500000);
  const clampedDP = Math.max(0, Math.min(cost, Number(downPayment) || 0));
  const downPaymentPct = Math.round((clampedDP / cost) * 100);
  const loanPrincipal = Math.max(0, cost - clampedDP);

  const emi = calculateMortgageEMI(loanPrincipal, annualRate, tenureMonths);
  const totalPayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - loanPrincipal);

  // Baseline 20% Down Payment figures
  const baselineDownPayment = Math.round(cost * 0.20);
  const baselineLoan = Math.max(0, cost - baselineDownPayment);
  const baselineEMI = calculateMortgageEMI(baselineLoan, annualRate, tenureMonths);
  const baselineTotalPayment = baselineEMI * tenureMonths;
  const baselineTotalInterest = Math.max(0, baselineTotalPayment - baselineLoan);

  const totalInterestSaved = Math.max(0, baselineTotalInterest - totalInterest);
  const monthlyEMISaved = Math.max(0, baselineEMI - emi);

  return {
    propertyCost: cost,
    downPayment: clampedDP,
    downPaymentPct,
    loanPrincipal,
    tenureMonths,
    annualRate,
    emi,
    totalPayment,
    totalInterest,
    baselineDownPayment,
    baselineLoan,
    baselineEMI,
    baselineTotalPayment,
    baselineTotalInterest,
    totalInterestSaved,
    monthlyEMISaved,
  };
}
