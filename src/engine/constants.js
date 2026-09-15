export const STARTING_AGE = 22;
export const ENDING_AGE = 42;
export const TOTAL_YEARS = 20;
export const TOTAL_DAYS = 7300;
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = 365;
export const SIMULATION_SPEED_MS = 50;

export const CITY_TIERS = {
  1: { name: 'Tier 1 (Mumbai / Delhi / Bangalore)', salary: [30000, 80000], livingCost: [12000, 18000], minRent: 8000 },
  2: { name: 'Tier 2 (Pune / Ahmedabad / Jaipur)', salary: [20000, 50000], livingCost: [7000, 12000], minRent: 5000 },
  3: { name: 'Tier 3 (Smaller Cities / Towns)', salary: [12000, 35000], livingCost: [4000, 8000], minRent: 3000 },
};

export const RENT_RANGES = {
  1: { min: 12000, max: 22000, budgetMin: 8000 },
  2: { min: 7000, max: 13000, budgetMin: 5000 },
  3: { min: 4000, max: 7500, budgetMin: 3000 },
};

export const GOAL_COSTS = {
  home: {
    1: { min: 6000000, max: 12000000, inflation: [0.06, 0.07] },
    2: { min: 3500000, max: 7000000, inflation: [0.06, 0.07] },
    3: { min: 1500000, max: 4000000, inflation: [0.06, 0.07] },
  },
  car: {
    1: { min: 800000, max: 1500000, inflation: [0.04, 0.05] },
    2: { min: 600000, max: 1200000, inflation: [0.04, 0.05] },
    3: { min: 500000, max: 1000000, inflation: [0.04, 0.05] },
  },
  marriage: {
    1: { min: 1000000, max: 2500000, inflation: [0.07, 0.08] },
    2: { min: 700000, max: 1800000, inflation: [0.07, 0.08] },
    3: { min: 500000, max: 1200000, inflation: [0.07, 0.08] },
  },
  business: {
    1: { min: 500000, max: 2000000, inflation: [0.05, 0.06] },
    2: { min: 300000, max: 1500000, inflation: [0.05, 0.06] },
    3: { min: 200000, max: 1000000, inflation: [0.05, 0.06] },
  },
  custom: { inflation: 0.06 },
};

export const INSTRUMENTS = {
  savings: { name: 'Savings Account', avgReturn: 0.035, volatility: 0, liquidity: 'instant' },
  fd: { name: 'Fixed Deposit', avgReturn: 0.07, volatility: 0, liquidity: 'locked', earlyPenalty: 0.01 },
  gold: { name: 'Gold', avgReturn: 0.08, minSwing: -0.05, maxSwing: 0.20, liquidity: 'high' },
  mf: { name: 'Mutual Funds', avgReturn: 0.115, minSwing: -0.20, maxSwing: 0.30, liquidity: 'high' },
  stocks: { name: 'Stocks', avgReturn: 0.15, minSwing: -0.30, maxSwing: 0.40, liquidity: 'high' },
  homeEquity: { name: 'Home Equity', avgReturn: 0.07, volatility: 'low', liquidity: 'illiquid' },
};

export const INSURANCE_COSTS = {
  health: [600, 1200],
  vehicle: [250, 450],
};
