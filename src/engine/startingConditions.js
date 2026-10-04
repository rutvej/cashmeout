import { rand, randInt, randFloat, randChoice, weightedRandom } from '../utils/random.js';
import { CITY_TIERS, RENT_RANGES, CITY_NAMES } from './constants.js';
import { getSuggestedSeedGoals } from './goals.js';

export const generateStartingConditions = (selectedTier = null, selectedField = null) => {
  const cityTier = selectedTier || randChoice([1, 2, 3]);
  const cityName = CITY_NAMES[cityTier] ? randChoice(CITY_NAMES[cityTier]) : 'Metro City';
  const characterAge = randInt(20, 25);
  const incomeSource = weightedRandom([
    { value: 'job', weight: 60 },
    { value: 'family_business', weight: 15 },
    { value: 'passive_income', weight: 5 },
    { value: 'fresh_start', weight: 20 },
  ]);
  
  const tierInfo = CITY_TIERS[cityTier] || CITY_TIERS[2];
  const startingSalary = randInt(tierInfo.salary[0], tierInfo.salary[1]);
  
  // Weighted towards lower savings
  let startingSavings = 0;
  const savingsRand = rand();
  if (savingsRand > 0.8) startingSavings = randInt(100000, 350000);
  else if (savingsRand > 0.4) startingSavings = randInt(25000, 100000);
  else startingSavings = randInt(5000, 25000);
  
  let existingLoan = null;
  if (rand() < 0.35) { // 35% chance of loan
    const type = randChoice(['education', 'personal']);
    const principal = randInt(50000, Math.min(350000, startingSalary * 6));
    const rate = randInt(9, 13) / 100;
    const remainingMonths = randInt(12, 48);
    const monthlyRate = rate / 12;
    let emi = Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / (Math.pow(1 + monthlyRate, remainingMonths) - 1));
    // Underwriting cap: ensure initial DTI doesn't exceed 20%
    if (emi > startingSalary * 0.20) {
      emi = Math.round(startingSalary * 0.18);
    }
    existingLoan = { id: `loan_start`, type, principal, emi, remainingMonths, rate };
  }
  
  let existingDebt = null;
  if (rand() < 0.15 && !existingLoan) { // 15% chance of informal debt
    existingDebt = {
      amount: randInt(15000, Math.min(80000, startingSalary * 2)),
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
    // Player is renting — scaled to salary (e.g. flatshare for lower salaries, independent 1BHK for higher)
    const rentBand = RENT_RANGES[cityTier];
    const rawRent = Math.round(startingSalary * randFloat(0.24, 0.32));
    rentCost = Math.max(rentBand.budgetMin || rentBand.min, Math.min(rentBand.max, rawRent));
  }

  const carOwned = rand() < 0.22;
  const carMaintenanceCost = carOwned ? randInt(2000, 4500) : 0;

  // Living cost scaled to salary & city tier (24% - 32% of starting salary)
  const rawLiving = Math.round(startingSalary * randFloat(0.24, 0.32));
  const livingCost = Math.max(tierInfo.livingCost[0], Math.min(tierInfo.livingCost[1], rawLiving));

  // Calculate difficulty rating (1 easy - 5 hard)
  let difficultyScore = 3;
  if (startingSalary < CITY_TIERS[cityTier].salary[0] * 1.2) difficultyScore += 1;
  if (startingSalary > CITY_TIERS[cityTier].salary[1] * 0.8) difficultyScore -= 1;
  if (startingSavings < 20000) difficultyScore += 1;
  if (startingSavings > 150000) difficultyScore -= 1;
  if (existingLoan || existingDebt) difficultyScore += 1;
  if (homeOwned) difficultyScore -= 1;
  
  const difficultyRating = Math.max(1, Math.min(5, difficultyScore));

  const names = ['Rahul Sharma', 'Priya Patel', 'Vikram Malhotra', 'Sneha Kulkarni', 'Aditya Verma', 'Ananya Iyer'];
  const characterName = randChoice(names);
  const seedGoals = getSuggestedSeedGoals(cityTier);

  return {
    characterName,
    characterAge,
    cityTier,
    cityName,
    selectedField: selectedField || 'science',
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
    seedGoals,
  };
};

export const generateNarrative = (player, field, cityName) => {
  // Generate 2-3 sentence backstory based on player attributes
  const fieldDesc = {
    science: 'a software developer', arts: 'a creative professional', commerce: 'a finance analyst'
  }[field] || 'a professional';
  
  const situationParts = [];
  if (player.existingLoan) situationParts.push(`carrying a ${player.existingLoan.type} loan`);
  if (player.isRenting) situationParts.push(`renting in ${cityName}`);
  if (player.homeOwned) situationParts.push(`living in an inherited home`);
  if (player.carOwned) situationParts.push(`owns a car`);
  
  const dreamParts = [];
  dreamParts.push('buying their own home someday');
  if (!player.carOwned) dreamParts.push('getting a car');
  dreamParts.push('having a dream wedding');
  dreamParts.push('retiring comfortably');
  
  const situation = situationParts.length > 0 ? `, currently ${situationParts.join(' and ')}` : '';
  const dreams = dreamParts.slice(0, 2).join(' and ');
  
  return `Meet ${player.characterName}, a ${player.characterAge}-year-old ${fieldDesc} working in ${cityName}${situation}. They dream of ${dreams}, but have no idea how to make it happen financially. That's where you come in — as their financial advisor, every decision you make shapes their future.`;
};

export const generateCityName = (tier, rng) => {
  const cities = CITY_NAMES[tier];
  return cities[Math.floor(rng() * cities.length)];
};
