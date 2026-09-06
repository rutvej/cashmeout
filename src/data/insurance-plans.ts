export interface HealthInsurancePlan {
  tier: 'none' | 'basic' | 'standard' | 'premium';
  name: string;
  premium: number;
  coveragePct: number;
}

export const HEALTH_INSURANCE_TIERS: HealthInsurancePlan[] = [
  { tier: 'none', name: 'No Coverage', premium: 0, coveragePct: 0 },
  { tier: 'basic', name: 'Basic Silver', premium: 500, coveragePct: 0.5 },
  { tier: 'standard', name: 'Standard Gold', premium: 1200, coveragePct: 0.8 },
  { tier: 'premium', name: 'Premium Platinum', premium: 2500, coveragePct: 0.95 }
];
