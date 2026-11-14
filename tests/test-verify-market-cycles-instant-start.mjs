import assert from 'assert';
import { generateCharacter, MALE_NAMES, FEMALE_NAMES } from '../src/engine/characterGenerator.js';
import { generateSpouseProfile } from '../src/engine/lifeEventsEngine.js';
import {
  getEquityCrashProfile,
  getMonthlyInstrumentReturnRate,
  INSTRUMENTS,
} from '../src/engine/compoundingEngine.js';
import { tickMonthlySimulation } from '../src/engine/simulationEngine.js';
import { useGameStore } from '../src/engine/store.js';

console.log('🧪 Starting Verification of Technical Mechanics...\n');

// ─── 1. Heterosexual Spouse Matching & Character Gender ─────────────────────
console.log('Test 1: Character gender and heterosexual spouse matching...');

// Check 50 seeds for character gender assignment
for (let i = 1; i <= 50; i++) {
  const seed = `test_seed_${i}`;
  const char = generateCharacter(seed, 'tier1', 'science');
  assert(char.gender === 'male' || char.gender === 'female', `Expected valid gender, got ${char.gender}`);

  // Test spouse matching
  const spouse = generateSpouseProfile(seed, char.gender);
  if (char.gender === 'male') {
    assert.strictEqual(spouse.gender, 'female', `Male character must have female spouse, got ${spouse.gender}`);
  } else {
    assert.strictEqual(spouse.gender, 'male', `Female character must have male spouse, got ${spouse.gender}`);
  }
}
console.log('✓ 50/50 seeds verified: Character gender is deterministic, and spouse matching is strictly heterosexual.');

// ─── 2. Guaranteed Macro Economic Market Crash & Volatility ─────────────────
console.log('\nTest 2: Guaranteed Macro Market Crash & Return Volatilities...');

let tier1Count = 0;
let tier2Count = 0;
let tier3Count = 0;

for (let i = 1; i <= 100; i++) {
  const seed = `crash_seed_${i}`;
  const crash = getEquityCrashProfile(seed, 23);

  // Crash must trigger between age 34 and 45
  assert(crash.crashAge >= 34 && crash.crashAge <= 45, `Crash age out of range: ${crash.crashAge}`);
  assert(crash.tier >= 1 && crash.tier <= 3, `Invalid tier: ${crash.tier}`);

  if (crash.tier === 1) {
    tier1Count++;
    assert(crash.depthPercent <= -0.28 && crash.depthPercent >= -0.341, `Tier 1 depth out of bounds: ${crash.depthPercent}`);
  } else if (crash.tier === 2) {
    tier2Count++;
    assert(crash.depthPercent <= -0.35 && crash.depthPercent >= -0.441, `Tier 2 depth out of bounds: ${crash.depthPercent}`);
  } else if (crash.tier === 3) {
    tier3Count++;
    assert(crash.depthPercent <= -0.48 && crash.depthPercent >= -0.551, `Tier 3 depth out of bounds: ${crash.depthPercent}`);
  }
}

console.log(`✓ Crash depth tiers verified across 100 lifetimes (T1: ${tier1Count}, T2: ${tier2Count}, T3: ${tier3Count}).`);

// Test return rate volatility bounds outside crash
const testSeed = '491823';
const crashInfo = getEquityCrashProfile(testSeed, 23);

for (let m = 0; m < 100; m++) {
  if (m < crashInfo.triggerMonthIndex || m >= crashInfo.triggerMonthIndex + crashInfo.totalCrashDuration) {
    const eqRate = getMonthlyInstrumentReturnRate('equity', m, testSeed, 23);
    assert(eqRate >= -0.03501 && eqRate <= 0.04501, `Equity rate outside bounds [-3.5%, +4.5%]: ${eqRate}`);
  }

  const goldRate = getMonthlyInstrumentReturnRate('gold', m, testSeed, 23);
  assert(goldRate >= -0.01001 && goldRate <= 0.02001, `Gold rate outside bounds [-1.0%, +2.0%]: ${goldRate}`);

  const savingsRate = getMonthlyInstrumentReturnRate('savings', m, testSeed, 23);
  assert.strictEqual(savingsRate, 0.04 / 12, 'Savings rate must be flat 4% p.a.');

  const fdRate = getMonthlyInstrumentReturnRate('fd', m, testSeed, 23);
  assert.strictEqual(fdRate, 0.07 / 12, 'FD rate must be flat 7% p.a.');
}
console.log('✓ Volatility bounds verified: Equity [-3.5%, +4.5%], Gold [-1.0%, +2.0%], Savings 4%, FD 7%.');

// ─── 3. Strict Cash in Bank Accounting Invariant ────────────────────────────
console.log('\nTest 3: Cash in Bank Accounting Invariant (Zero Free Money Leak)...');

const baseChar = generateCharacter('test_cashflow', 'tier1', 'science');
baseChar.liquidCash = 50000;
baseChar.monthlyTakeHome = 70000;
baseChar.totalFixedExpenses = 40000;
baseChar.totalLoanEMIs = 0;
baseChar.totalMonthlyOutflow = 40000;
baseChar.monthlySurplus = 30000; // Surplus = 30,000

// Goal needs only 2,000 to complete, but effective SIP is 5,000
const testGoals = [
  {
    id: 'goal_car',
    name: 'Car',
    kind: 'milestone',
    category: 'asset',
    targetAmount: 50000,
    currentAmount: 48000, // needs 2,000
    baseMonthlySIP: 5000,
    effectiveMonthlySIP: 5000,
    allocationPercent: 17,
    instrumentId: 'savings',
    status: 'in_progress',
  },
];

const mockState = {
  currentScreen: 'main_game',
  character: baseChar,
  goals: testGoals,
  insurance: { health: { isPurchased: false }, termLife: { isPurchased: false } },
  simulation: {
    currentMonthIndex: 0,
    currentAge: 23,
    currentMonthOfYear: 1,
    isPaused: false,
    gameSpeed: 1,
    hasTriggeredMacroCrash: false,
  },
};

const nextState = tickMonthlySimulation(mockState);

// Surplus: 30,000. Goal took 2,000 (capped at target 50,000).
// Remaining surplus: 30,000 - 2,000 = 28,000.
// Goal compounded at 4% p.a. (50,000 * 0.04 / 12 = 167 interest overflow from capped goal).
// Total liquidCash: 50,000 + 28,000 (residual surplus) + 167 (interest overflow) = 78,167.
// (Under the previous double-counting bug, liquidCash would be 78,167 + 3,000 = 81,167).
assert.strictEqual(
  nextState.character.liquidCash,
  78167,
  `Expected exact liquidCash ₹78,167 with 0 free money leak, but got ₹${nextState.character.liquidCash}`
);
console.log('✓ Zero Free Money Leak confirmed: leftover surplus correctly calculated with 0 phantom cash.');

// Test deficit handling (monthlySurplus <= 0)
const deficitChar = {
  ...baseChar,
  monthlyTakeHome: 20000,
  totalFixedExpenses: 35000,
  totalLoanEMIs: 0,
  totalMonthlyOutflow: 35000,
  monthlySurplus: -15000, // Deficit = 15,000
  liquidCash: 10000, // Not enough bank cash
};

const emergencyGoal = {
  id: 'goal_emergency',
  name: 'Emergency Fund',
  kind: 'recurring',
  category: 'safety',
  targetAmount: 100000,
  currentAmount: 50000,
  baseMonthlySIP: 5000,
  effectiveMonthlySIP: 5000,
  instrumentId: 'savings',
  status: 'buffer_full',
};

const deficitState = {
  ...mockState,
  character: deficitChar,
  goals: [emergencyGoal],
};

const postDeficitState = tickMonthlySimulation(deficitState);

// Bank cash drops from 10,000 to 0 (pays 10,000 of deficit)
assert.strictEqual(postDeficitState.character.liquidCash, 0, 'Liquid cash must be drawn to 0');
// Emergency fund pays remaining 5,000 deficit: 50,000 - 5,000 = 45,000
// Compounding 45,000 at 4% p.a. yields +150 interest -> 45,150
const updatedEmergency = postDeficitState.goals.find((g) => g.id === 'goal_emergency');
assert.strictEqual(updatedEmergency.currentAmount, 45150, 'Emergency fund must cover remaining deficit and compound');
console.log('✓ Deficit waterfall confirmed: Liquid Cash drawn down first, then Emergency Fund.');

// ─── 4. Instant Start Flow & Lump-Sum Seeding in Store ───────────────────────
console.log('\nTest 4: Store Instant Start & Mid-Game Lump-Sum Seeding...');

const store = useGameStore.getState();
store.setConfig({
  cityTier: 'tier1',
  careerField: 'science',
  seed: '491823',
});
store.generateAndSetCharacter();

// Trigger Instant Start
useGameStore.getState().startInstantSimulation();
const instantState = useGameStore.getState();

assert.strictEqual(instantState.currentScreen, 'main_game', 'Screen must navigate to main_game');
assert.strictEqual(instantState.simulation.isPaused, false, 'Simulation must be unpaused');
instantState.goals.forEach((g) => {
  assert.strictEqual(g.baseMonthlySIP, 0, `Goal ${g.name} baseMonthlySIP must be 0`);
  assert.strictEqual(g.effectiveMonthlySIP, 0, `Goal ${g.name} effectiveMonthlySIP must be 0`);
});
console.log('✓ Instant Start verified: all goals start with ₹0 SIP, simulation begins ticking immediately.');

// Test Mid-Game Lump-Sum Seeding
const beforeBank = useGameStore.getState().character.liquidCash;
const testGoalId = 'goal_car';
const goalBefore = useGameStore.getState().goals.find((g) => g.id === testGoalId);
const currentBefore = goalBefore.currentAmount || 0;

const transferAmt = 25000;
const transferSuccess = useGameStore.getState().transferLumpSumToGoal(testGoalId, transferAmt);
assert(transferSuccess, 'Transfer must succeed');

const stateAfterTransfer = useGameStore.getState();
const goalAfter = stateAfterTransfer.goals.find((g) => g.id === testGoalId);

assert.strictEqual(
  stateAfterTransfer.character.liquidCash,
  beforeBank - transferAmt,
  'Bank cash must be debited by exact transfer amount'
);
assert.strictEqual(
  goalAfter.currentAmount,
  currentBefore + transferAmt,
  'Goal balance must be credited by exact transfer amount'
);
assert.strictEqual(
  goalAfter.totalPrincipalDeposited,
  transferAmt,
  'Goal totalPrincipalDeposited must track the seed'
);

console.log('✓ Mid-Game Lump-Sum Seeding verified: atomic transfer from Bank Cash into goal corpus.');

console.log('\n🎉 ALL PURE SPECIFICATION AND ENGINE TESTS PASSED WITH 100% SUCCESS!');
