export interface HealthInsurancePlan {
  tier: 'none' | 'basic' | 'standard' | 'premium';
  name: string;
  monthlyPremium: number;
  coveragePct: number;
  deductible: number;
  maxOutOfPocket: number;
  description: string;
}

export const HEALTH_INSURANCE_TIERS: HealthInsurancePlan[] = [
  {
    tier: 'none',
    name: 'Uninsured (Cash Pay)',
    monthlyPremium: 0,
    coveragePct: 0.0,
    deductible: 0,
    maxOutOfPocket: 999999,
    description: '0% coverage. 100% of medical and hospital bills paid out of pocket.'
  },
  {
    tier: 'basic',
    name: 'Basic Bronze Plan',
    monthlyPremium: 50,
    coveragePct: 0.50,
    deductible: 500,
    maxOutOfPocket: 5000,
    description: '50% hospital coverage after $500 deductible. $5,000 max out-of-pocket.'
  },
  {
    tier: 'standard',
    name: 'Standard Silver Plan',
    monthlyPremium: 120,
    coveragePct: 0.80,
    deductible: 250,
    maxOutOfPocket: 2500,
    description: '80% hospital coverage after $250 deductible. $2,500 max out-of-pocket.'
  },
  {
    tier: 'premium',
    name: 'Premium Gold Plan',
    monthlyPremium: 250,
    coveragePct: 0.95,
    deductible: 0,
    maxOutOfPocket: 1000,
    description: '95% full coverage with $0 deductible. $1,000 max annual out-of-pocket.'
  }
];

export const OTHER_INSURANCE = {
  vehicle: { name: 'Comprehensive Auto Insurance', monthlyPremium: 60 },
  termLife: { name: '20-Year Term Life ($250k Coverage)', monthlyPremium: 45 },
  property: { name: 'Homeowners & Structural Hazard', monthlyPremium: 65 }
};
