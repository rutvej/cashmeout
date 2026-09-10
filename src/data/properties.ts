import { RentalTier } from '../types/game';

export const RENTAL_TIERS: RentalTier[] = [
  {
    id: 'shared',
    name: 'Shared Flat (Budget Room)',
    monthlyCostYear1: 250,
    commuteHoursDaily: 2.0,
    mentalHealthImpact: -5
  },
  {
    id: 'studio',
    name: 'Compact Studio Apartment',
    monthlyCostYear1: 380,
    commuteHoursDaily: 1.0,
    mentalHealthImpact: 0
  },
  {
    id: '1bhk',
    name: 'Prime 1BHK Apartment',
    monthlyCostYear1: 540,
    commuteHoursDaily: 1.0,
    mentalHealthImpact: 2
  },
  {
    id: '2bhk',
    name: 'Spacious 2BHK Suburban Flat',
    monthlyCostYear1: 700,
    commuteHoursDaily: 2.0,
    mentalHealthImpact: 4
  }
];

export interface BuyablePropertyOption {
  id: string;
  name: string;
  type: 'home' | 'rental';
  purchasePrice: number;
  downPaymentPct: number; // e.g. 0.20
  commuteHoursDaily: number;
  expectedMonthlyRent: number; // for rental
  description: string;
}

export const BUYABLE_PROPERTIES: BuyablePropertyOption[] = [
  // Personal Homes
  {
    id: 'home-midtown-1bhk',
    name: 'Midtown 1BHK Modern Condo',
    type: 'home',
    purchasePrice: 140000,
    downPaymentPct: 0.20,
    commuteHoursDaily: 0.5,
    expectedMonthlyRent: 0,
    description: 'Walk-to-work condo in heart of city. Drastically cuts commute.'
  },
  {
    id: 'home-suburban-2bhk',
    name: 'Suburban 2BHK Family Townhouse',
    type: 'home',
    purchasePrice: 220000,
    downPaymentPct: 0.20,
    commuteHoursDaily: 1.0,
    expectedMonthlyRent: 0,
    description: 'Quiet neighborhood with garden, space for family and home gym.'
  },
  {
    id: 'home-penthouse',
    name: 'Luxury Downtown Skyline Penthouse',
    type: 'home',
    purchasePrice: 450000,
    downPaymentPct: 0.20,
    commuteHoursDaily: 0.0,
    expectedMonthlyRent: 0,
    description: 'Ultra-prime real estate with panoramic skyline view and private concierge.'
  },

  // Investment Properties
  {
    id: 'invest-studio',
    name: 'High-Yield Metro Studio Unit',
    type: 'rental',
    purchasePrice: 95000,
    downPaymentPct: 0.20,
    commuteHoursDaily: 0,
    expectedMonthlyRent: 850,
    description: 'Popular with students and young professionals. Steady cash flow.'
  },
  {
    id: 'invest-2bhk',
    name: 'Suburban 2BHK Rental Villa',
    type: 'rental',
    purchasePrice: 180000,
    downPaymentPct: 0.20,
    commuteHoursDaily: 0,
    expectedMonthlyRent: 1500,
    description: 'Long-term corporate family tenant with solid rent yield.'
  },
  {
    id: 'invest-commercial',
    name: 'Commercial Tech Hub Office Bay',
    type: 'rental',
    purchasePrice: 280000,
    downPaymentPct: 0.20,
    commuteHoursDaily: 0,
    expectedMonthlyRent: 2400,
    description: 'Triple-net commercial lease leased to growing digital agency.'
  }
];
