import { rand, randInt, randChoice, weightedRandom } from '../utils/random.js';
import { CITY_TIERS, RENT_RANGES } from './constants.js';

export const generateStartingConditions = () => {
  const cityTier = randChoice([1, 2, 3]);
  const incomeSource = weightedRandom([
    { value: 'job', weight: 60 },
    { value: 'family_business', weight: 15 },
    { value: 'passive_income', weight: 5 },
    { value: 'fresh_start', weight: 20 },
  ]);
  
  const startingSalary = randInt(CITY_TIERS[cityTier].salary[0], CITY_TIERS[cityTier].salary[1]);
  
  // Weighted towards lower savings
  let startingSavings = 0;
  const savingsRand = rand();
  if (savingsRand > 0.8) startingSavings = randInt(100000, 350000);
  else if (savingsRand > 0.4) startingSavings = randInt(25000, 100000);
  else startingSavings = randInt(5000, 25000);
  
  let existingLoan = null;
  if (rand() < 0.35) { // 35% chance of loan
    const type = randChoice(['education', 'personal']);
    const principal = randInt(50000, 350000);
    const rate = randInt(9, 13) / 100;
    const remainingMonths = randInt(12, 48);
    const monthlyRate = rate / 12;
    const emi = Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / (Math.pow(1 + monthlyRate, remainingMonths) - 1));
    existingLoan = { id: `loan_start`, type, principal, emi, remainingMonths, rate };
  }
  
  let existingDebt = null;
  if (rand() < 0.15 && !existingLoan) { // 15% chance of informal debt
    existingDebt = {
      amount: randInt(15000, 100000),
      description: 'Borrowed from relatives/friends',
    };
  }

  const homeOwned = rand() < 0.28;
  let homeMaintenanceCost = 0;
  let rentCost = 0;
  let homeCondition = null;

  if (homeOwned) {
    if (cityTier === 1) homeMaintenanceCost = randInt(4000, 8000);
    else if (cityTier === 2) homeMaintenanceCost = randInt(2500, 5000);
    else homeMaintenanceCost = randInt(1500, 3500);

    homeCondition = randChoice([
      'Older inherited property: aging plumbing and recurring maintenance required.',
      'Modest suburban home: periodic society maintenance and property tax liability.',
    ]);
  } else {
    // Player is renting
    const rentBand = RENT_RANGES[cityTier];
    rentCost = randInt(rentBand.min, rentBand.max);
  }

  const carOwned = rand() < 0.22;
  const carMaintenanceCost = carOwned ? randInt(2000, 4500) : 0;

  const livingCost = randInt(CITY_TIERS[cityTier].livingCost[0], CITY_TIERS[cityTier].livingCost[1]);

  // Calculate difficulty rating (1 easy - 5 hard)
  let difficultyScore = 3;
  if (startingSalary < CITY_TIERS[cityTier].salary[0] * 1.2) difficultyScore += 1;
  if (startingSalary > CITY_TIERS[cityTier].salary[1] * 0.8) difficultyScore -= 1;
  if (startingSavings < 20000) difficultyScore += 1;
  if (startingSavings > 150000) difficultyScore -= 1;
  if (existingLoan || existingDebt) difficultyScore += 1;
  if (homeOwned) difficultyScore -= 1;
  
  const difficultyRating = Math.max(1, Math.min(5, difficultyScore));

  return {
    cityTier,
    incomeSource,
    startingSalary,
    startingSavings,
    existingLoan,
    existingDebt,
    homeOwned,
    homeMaintenanceCost,
    homeCondition,
    isRenting: !homeOwned,
    rentCost,
    carOwned,
    carMaintenanceCost,
    livingCost,
    difficultyRating,
    marriageAge: randInt(26, 33),
    married: false,
  };
};
