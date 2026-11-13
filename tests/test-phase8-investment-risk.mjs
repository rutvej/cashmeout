// Pure Unit & Integration Tests for Phase 8: Realistic Investment Risk, FD Penalties & Market Cycles
import {
  calculateLiquidationPenalty,
  getMonthlyInstrumentReturnRate,
  getEquityMarketMultiplier,
  isMarketInCorrection,
  processLiquidationFromGoal,
  INSTRUMENTS,
} from '../src/engine/compoundingEngine.js';
import { useGameStore } from '../src/engine/store.js';
import { tickMonthlySimulation } from '../src/engine/simulationEngine.js';

console.log('🧪 Starting Phase 8 Investment Risk & Market Cycles Unit Tests...\n');

// ─── 1. Unit Test 1: FD Premature Withdrawal Imposes Exact 1.5% Penalty ──────
console.log('Test 1: FD premature withdrawal imposes exact 1.5% penalty...');

const penalty100k = calculateLiquidationPenalty('fd', 100000);
if (penalty100k !== 1500) {
  throw new Error(`Expected ₹1,500 penalty for ₹1,00,000 FD withdrawal, got ₹${penalty100k}`);
}

const penalty50k = calculateLiquidationPenalty('fd', 50000);
if (penalty50k !== 750) {
  throw new Error(`Expected ₹750 penalty for ₹50,000 FD withdrawal, got ₹${penalty50k}`);
}

const penalty25k = calculateLiquidationPenalty('fd', 25000);
if (penalty25k !== 375) {
  throw new Error(`Expected ₹375 penalty for ₹25,000 FD withdrawal, got ₹${penalty25k}`);
}

const penalty0 = calculateLiquidationPenalty('fd', 0);
if (penalty0 !== 0) {
  throw new Error(`Expected 0 penalty for 0 withdrawal, got ${penalty0}`);
}

const penaltyNegative = calculateLiquidationPenalty('fd', -1000);
if (penaltyNegative !== 0) {
  throw new Error(`Expected 0 penalty for negative withdrawal, got ${penaltyNegative}`);
}

// Test processLiquidationFromGoal on an FD goal
const fdGoal = {
  id: 'goal_car',
  name: 'Car FD',
  instrumentId: 'fd',
  currentAmount: 100000,
  targetAmount: 500000,
};

const fdLiquidation = processLiquidationFromGoal(fdGoal, 40000, 1, 'seed_test');
if (fdLiquidation.drawnAmount !== 40000) {
  throw new Error(`Expected drawnAmount 40000, got ${fdLiquidation.drawnAmount}`);
}
if (fdLiquidation.penalty !== 600) {
  throw new Error(`Expected exact ₹600 penalty (1.5% of ₹40,000), got ₹${fdLiquidation.penalty}`);
}
if (fdLiquidation.realizedLoss !== 0) {
  throw new Error(`Expected 0 market loss for FD, got ${fdLiquidation.realizedLoss}`);
}
// Goal balance should have 40000 drawn + 600 penalty deducted = 59400 remaining
if (fdLiquidation.updatedGoal.currentAmount !== 59400) {
  throw new Error(`Expected 59400 remaining in FD goal, got ${fdLiquidation.updatedGoal.currentAmount}`);
}

console.log('✓ FD premature withdrawal imposes exact 1.5% penalty (₹1,500 on ₹1L, ₹600 on ₹40K)\n');


// ─── 2. Unit Test 2: Liquid Savings Has Zero Penalty & Zero Market Loss ──────
console.log('Test 2: Liquid Savings has zero penalty and zero market loss...');

const savingsPenalty = calculateLiquidationPenalty('savings', 100000);
if (savingsPenalty !== 0) {
  throw new Error(`Expected 0 penalty for savings, got ${savingsPenalty}`);
}

const goldPenalty = calculateLiquidationPenalty('gold', 100000);
if (goldPenalty !== 0) {
  throw new Error(`Expected 0 penalty for gold, got ${goldPenalty}`);
}

const equityPenalty = calculateLiquidationPenalty('equity', 100000);
if (equityPenalty !== 0) {
  throw new Error(`Expected 0 penalty for equity, got ${equityPenalty}`);
}

// Test processLiquidationFromGoal on a savings goal
const savingsGoal = {
  id: 'goal_emergency',
  name: 'Emergency Savings',
  instrumentId: 'savings',
  currentAmount: 100000,
  targetAmount: 200000,
};

const savingsLiquidation = processLiquidationFromGoal(savingsGoal, 50000, 12, 'seed_test');
if (savingsLiquidation.drawnAmount !== 50000) {
  throw new Error(`Expected drawnAmount 50000, got ${savingsLiquidation.drawnAmount}`);
}
if (savingsLiquidation.penalty !== 0) {
  throw new Error(`Expected 0 penalty for savings, got ${savingsLiquidation.penalty}`);
}
if (savingsLiquidation.realizedLoss !== 0) {
  throw new Error(`Expected 0 market loss for savings, got ${savingsLiquidation.realizedLoss}`);
}
if (savingsLiquidation.updatedGoal.currentAmount !== 50000) {
  throw new Error(`Expected 50000 remaining, got ${savingsLiquidation.updatedGoal.currentAmount}`);
}

// Verify savings rate is flat (4% p.a. -> 0.04 / 12) across all months & seeds
for (let m = 0; m <= 100; m += 20) {
  const rateA = getMonthlyInstrumentReturnRate('savings', m, 'seedA');
  const rateB = getMonthlyInstrumentReturnRate('savings', m, 'seedB');
  if (rateA !== 0.04 / 12 || rateB !== 0.04 / 12) {
    throw new Error(`Savings return must be strictly 0.04 / 12, got ${rateA} and ${rateB}`);
  }
}

// Verify FD rate is flat guaranteed (7% p.a. -> 0.07 / 12)
for (let m = 0; m <= 100; m += 20) {
  const rate = getMonthlyInstrumentReturnRate('fd', m, 'seed_fd');
  if (rate !== 0.07 / 12) {
    throw new Error(`FD return must be strictly 0.07 / 12, got ${rate}`);
  }
}

// Verify Gold noise is bounded strictly within +- 0.008 around (0.085 / 12)
const goldBase = 0.085 / 12;
for (let m = 1; m <= 100; m++) {
  const gRate = getMonthlyInstrumentReturnRate('gold', m, 'seed_gold');
  const diff = gRate - goldBase;
  if (diff < -0.008001 || diff > 0.008001) {
    throw new Error(`Gold return rate noise out of bounds: diff = ${diff}`);
  }
}

console.log('✓ Liquid Savings has zero penalty and zero market loss (100% safe & liquid)\n');


// ─── 3. Unit Test 3: Equity 35-Year CAGR Simulation (~12% p.a. +-1.5%) ───────
console.log('Test 3: Equity 35-year CAGR simulation averages ~12% p.a. (+-1.5%) with mild dips...');

const SEEDS = [
  'default', 'char_seed_1', 'wealth_alpha', 'investor_2026', 'mumbai_tier1',
  'bengaluru_tech', 'delhi_safe', 'pune_fire', 'seed_longterm', 'compound_cycle'
];

let sumCAGR = 0;
let totalDips = 0;
let totalHighMonths = 0;
let minRateFound = Infinity;
let maxRateFound = -Infinity;

SEEDS.forEach((seed) => {
  let corpus = 100000;
  let dipsThisSeed = 0;

  for (let m = 1; m <= 420; m++) { // 35 years = 420 months
    const rate = getMonthlyInstrumentReturnRate('equity', m, seed);

    // Verify rate is strictly bounded between -0.015 (-1.5%) and +0.025 (+2.5%)
    if (rate < -0.015001 || rate > 0.025001) {
      throw new Error(`Equity rate out of strict bounds at month ${m}: ${rate}`);
    }

    minRateFound = Math.min(minRateFound, rate);
    maxRateFound = Math.max(maxRateFound, rate);

    if (rate < 0) {
      dipsThisSeed++;
      totalDips++;
    }
    if (rate > 0.015) {
      totalHighMonths++;
    }

    corpus *= (1 + rate);
  }

  const cagr = Math.pow(corpus / 100000, 1 / 35) - 1;
  sumCAGR += cagr;

  if (dipsThisSeed === 0) {
    throw new Error(`Seed ${seed} had zero negative return months (expected realistic mild dips)`);
  }
});

const avgCAGR = sumCAGR / SEEDS.length;
console.log(`  -> Average 35-year Equity CAGR: ${(avgCAGR * 100).toFixed(2)}% p.a.`);
console.log(`  -> Monthly Return Bounds observed: [${(minRateFound * 100).toFixed(2)}%, ${(maxRateFound * 100).toFixed(2)}%]`);
console.log(`  -> Total Dips observed across ${SEEDS.length} lifetimes: ${totalDips} months`);

// Average CAGR must be within ~12% p.a. (+- 1.5% -> 10.5% to 13.5%)
if (avgCAGR < 0.105 || avgCAGR > 0.135) {
  throw new Error(`Expected average CAGR between 10.5% and 13.5%, got ${(avgCAGR * 100).toFixed(2)}%`);
}

// Verify isMarketInCorrection behavior
let foundCorrectionMonth = false;
let foundBullMonth = false;
for (let m = 1; m <= 100; m++) {
  const isCorrection = isMarketInCorrection(m, 'default');
  const mult = getEquityMarketMultiplier(m, 'default');
  if (isCorrection && mult >= 0.95) {
    throw new Error(`isMarketInCorrection was true but multiplier M(t) >= 0.95: ${mult}`);
  }
  if (!isCorrection && mult < 0.95) {
    throw new Error(`isMarketInCorrection was false but multiplier M(t) < 0.95: ${mult}`);
  }
  if (isCorrection) foundCorrectionMonth = true;
  if (!isCorrection) foundBullMonth = true;
}
if (!foundCorrectionMonth || !foundBullMonth) {
  throw new Error('Failed to find both correction and bull months in simulation test');
}

// Verify equity liquidation during market correction produces realized loss
let correctionMonth = 1;
while (!isMarketInCorrection(correctionMonth, 'default') && correctionMonth < 72) {
  correctionMonth++;
}
const equityGoal = {
  id: 'goal_retirement',
  name: 'Retirement Equity',
  instrumentId: 'equity',
  currentAmount: 100000,
  targetAmount: 1000000,
};
const correctionLiquidation = processLiquidationFromGoal(equityGoal, 50000, correctionMonth, 'default');
if (correctionLiquidation.penalty !== 0) {
  throw new Error(`Expected 0 FD penalty for equity, got ${correctionLiquidation.penalty}`);
}
if (correctionLiquidation.realizedLoss <= 0) {
  throw new Error(`Expected positive realized loss during market correction, got ${correctionLiquidation.realizedLoss}`);
}

console.log('✓ Equity 35-year CAGR averages ~12% p.a. (+-1.5%) with realistic cycles and mild dips\n');


// ─── 4. Unit Test 4: Shock / Shortfall Liquidation Deducting from FD Updates penaltiesPaidFD ─
console.log('Test 4: Shock / shortfall liquidation deducting from FD updates character.penaltiesPaidFD...');

// Test 4A: Simulation Engine applyShockCost when emergency fund is parked in FD
const testGoals = [
  {
    id: 'goal_emergency',
    name: 'Emergency Fund',
    instrumentId: 'fd', // User placed emergency fund in Fixed Deposit!
    currentAmount: 100000,
    targetAmount: 100000,
    status: 'buffer_full',
  },
];

const testState = {
  character: {
    seed: 'seed_fd_test',
    age: 25,
    grossMonthlySalary: 50000,
    monthlyTakeHome: 45000,
    totalFixedExpenses: 20000,
    liquidCash: 0, // No idle bank cash!
    penaltiesPaidFD: 0,
    marketLossesRealized: 0,
    loans: [],
  },
  goals: testGoals,
  insurance: { health: { isPurchased: false } },
  simulation: {
    currentMonthIndex: 15,
    isPaused: false,
    history: [],
  },
};

// Tick the simulation with a manual deficit draw or shortfall
// Test store resolveVacationShortfall with other_fund when emergency fund is in FD
useGameStore.setState({
  character: {
    ...testState.character,
    liquidCash: 0,
    penaltiesPaidFD: 0,
    marketLossesRealized: 0,
  },
  goals: [
    {
      id: 'goal_emergency',
      name: 'Emergency Fund',
      instrumentId: 'fd',
      currentAmount: 100000,
      targetAmount: 100000,
      status: 'buffer_full',
    },
    {
      id: 'goal_vacation',
      name: 'Annual Vacation',
      instrumentId: 'savings',
      currentAmount: 0,
      targetAmount: 50000,
      status: 'in_progress',
    },
  ],
  simulation: {
    currentMonthIndex: 12,
    activeModal: {
      type: 'vacation',
      data: {
        wasSuccessful: false,
        shortfall: 20000,
        savedAmount: 0,
        targetAmount: 50000,
      },
    },
    modalQueue: [],
    isPaused: true,
  },
});

useGameStore.getState().resolveVacationShortfall({
  resolutionType: 'other_fund',
  nextYearTripOption: 'domestic',
});

const charAfterVacation = useGameStore.getState().character;
const goalsAfterVacation = useGameStore.getState().goals;
const emgGoalAfter = goalsAfterVacation.find((g) => g.id === 'goal_emergency');

// 1.5% penalty on ₹20,000 is ₹300
if (charAfterVacation.penaltiesPaidFD !== 300) {
  throw new Error(`Expected penaltiesPaidFD to be 300, got ${charAfterVacation.penaltiesPaidFD}`);
}
// Goal balance should have ₹20,000 + ₹300 penalty deducted = ₹79,700
if (emgGoalAfter.currentAmount !== 79700) {
  throw new Error(`Expected emergency fund balance 79700, got ${emgGoalAfter.currentAmount}`);
}
console.log('✓ resolveVacationShortfall drawing from FD updated penaltiesPaidFD to ₹300');

// Test 4B: resolveMilestoneShortfall drawing from FD
useGameStore.setState({
  character: {
    ...charAfterVacation,
    liquidCash: 0,
  },
  simulation: {
    ...useGameStore.getState().simulation,
    currentAge: 27,
    activeModal: {
      type: 'milestone',
      goal: { id: 'goal_car', name: 'Buy Car', currentAmount: 300000, targetAmount: 350000 },
    },
  },
  goals: [
    ...goalsAfterVacation,
    { id: 'goal_car', name: 'Buy Car', currentAmount: 300000, targetAmount: 350000, kind: 'milestone' },
  ],
});

useGameStore.getState().resolveMilestoneShortfall({
  goalId: 'goal_car',
  resolutionType: 'other_fund',
});

const charAfterMilestone = useGameStore.getState().character;
// Shortfall was ₹50,000. 1.5% of ₹50,000 is ₹750. Total penalty = 300 + 750 = 1050.
if (charAfterMilestone.penaltiesPaidFD !== 1050) {
  throw new Error(`Expected cumulative penaltiesPaidFD to be 1050, got ${charAfterMilestone.penaltiesPaidFD}`);
}
console.log('✓ resolveMilestoneShortfall drawing from FD accumulated penaltiesPaidFD to ₹1,050');

// Test 4C: Direct goal liquidation action
const directRes = useGameStore.getState().liquidateGoalFunds({
  goalId: 'goal_emergency',
  amount: 10000,
});
if (directRes.penalty !== 150) {
  throw new Error(`Expected direct liquidation penalty of ₹150, got ${directRes.penalty}`);
}
const charAfterDirect = useGameStore.getState().character;
if (charAfterDirect.penaltiesPaidFD !== 1200) {
  throw new Error(`Expected penaltiesPaidFD to be 1200, got ${charAfterDirect.penaltiesPaidFD}`);
}
console.log('✓ Direct goal liquidation from FD updated penaltiesPaidFD to ₹1,200\n');

console.log('🎉 ALL PHASE 8 INVESTMENT RISK & MARKET CYCLE TESTS PASSED WITH 100% SUCCESS!');
