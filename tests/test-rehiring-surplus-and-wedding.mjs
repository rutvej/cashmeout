import assert from 'assert';
import { useGameStore } from '../src/engine/store.js';
import { tickMonthlySimulation } from '../src/engine/simulationEngine.js';
import { generateSpouseProfile } from '../src/engine/lifeEventsEngine.js';

console.log('🧪 Starting Verification of Rehiring Surplus & Marriage Date Bugfixes...\n');

// ─── Test 1: Rehiring Surplus Integrity (With Spouse & Outflows) ─────────────
console.log('Test 1: Rehiring with clear surplus (character + spouse household inflow)...');

const initialSpouse = {
  name: 'Ananya Iyer',
  profession: 'Senior Product Designer',
  archetype: 'Corporate Climber',
  monthlyTakeHome: 40000,
  addedHouseholdExpenses: 12000,
  netSurplusDelta: 28000,
};

useGameStore.setState({
  character: {
    seed: 'test_seed_1',
    gender: 'male',
    age: 28,
    jobTitle: 'Junior Developer',
    jobTier: 1,
    grossMonthlySalary: 60000,
    monthlyTakeHome: 0,
    salaryTakeHome: 0,
    ventureIncome: 5000,
    spouseTakeHome: 40000,
    householdTakeHome: 45000,
    liquidCash: 50000,
    totalFixedExpenses: 32000, // 20,000 base + 12,000 spouse
    totalLoanEMIs: 0,
    totalMonthlyOutflow: 32800, // +800 insurance
    monthlySurplus: 0,
    employmentStatus: 'unemployed',
    unemploymentDurationMonths: 2,
    preLayoffTakeHome: 48000,
    assetMaintenanceState: {
      isMarried: true,
      spouse: initialSpouse,
    },
    loans: [],
    insurance: {},
  },
  insurance: {
    health: { isPurchased: true, monthlyPremium: 800 },
    termLife: { isPurchased: false, monthlyPremium: 0 },
  },
  goals: [
    { id: 'goal_emergency', name: 'Emergency Fund', baseMonthlySIP: 0, allocationPercent: 20, targetAmount: 200000, currentAmount: 50000, kind: 'milestone' },
    { id: 'goal_marriage', name: 'Marriage', baseMonthlySIP: 0, allocationPercent: 0, targetAmount: 700000, currentAmount: 700000, status: 'completed', kind: 'milestone' },
    { id: 'goal_retirement', name: 'Retirement', baseMonthlySIP: 0, allocationPercent: 40, targetAmount: 50000000, currentAmount: 100000, kind: 'milestone' },
  ],
  simulation: {
    currentAge: 28,
    currentMonthIndex: 60,
    modalQueue: [],
    activeModal: null,
    isPaused: true,
  },
});

const offer = {
  id: 'job_offer_test',
  companyName: 'TechCorp',
  title: 'Mid Developer',
  tier: 2,
  grossMonthlySalary: 75000,
  monthlyTakeHome: 60000,
  city: 'Bengaluru',
  cityTier: 'tier1',
  signingBonus: 10000,
};

// Accept job offer
useGameStore.getState().acceptJobOffer(offer);

const afterRehireState = useGameStore.getState();
const char = afterRehireState.character;

console.log(`  -> Offer take-home: ₹${offer.monthlyTakeHome}`);
console.log(`  -> Spouse take-home: ₹${char.spouseTakeHome}`);
console.log(`  -> Venture income: ₹${char.ventureIncome}`);
console.log(`  -> Total Household Inflow: ₹${char.householdTakeHome} (Expected: ₹105,000)`);
console.log(`  -> Total Monthly Outflow: ₹${char.totalMonthlyOutflow} (Expected: ₹32,800)`);
console.log(`  -> Calculated Monthly Surplus: ₹${char.monthlySurplus} (Expected: ₹72,200)`);

assert.strictEqual(char.employmentStatus, 'employed', 'Character must be actively employed after accepting offer');
assert.strictEqual(char.householdTakeHome, 105000, 'Household take-home must combine player, spouse, and ventures');
assert.strictEqual(char.monthlySurplus, 72200, 'Surplus must be positive ₹72,200 (not negative or zero!)');
assert(char.monthlySurplus > 0, 'Clear surplus must be clearly visible and positive');

// Verify goal SIP restoration from allocationPercent
const updatedGoals = afterRehireState.goals;
const emgGoal = updatedGoals.find((g) => g.id === 'goal_emergency');
const retGoal = updatedGoals.find((g) => g.id === 'goal_retirement');
console.log(`  -> Emergency Fund restored SIP: ₹${emgGoal.baseMonthlySIP} (20% of ₹72,200 = ₹14,440)`);
console.log(`  -> Retirement restored SIP: ₹${retGoal.baseMonthlySIP} (40% of ₹72,200 = ₹28,880)`);

assert.strictEqual(emgGoal.baseMonthlySIP, 14440, 'Emergency SIP must be restored from allocationPercent');
assert.strictEqual(retGoal.baseMonthlySIP, 28880, 'Retirement SIP must be restored from allocationPercent');

console.log('✓ Test 1 passed: Rehiring correctly computes household surplus and restores investments!\n');

// ─── Test 2: Modal Queue Preservation on Job Application ─────────────────────
console.log('Test 2: Modal queue preservation when applying for a job while another modal is active...');

const mockWeddingModal = {
  type: 'wedding',
  goal: { id: 'goal_marriage', name: 'Marriage', targetAmount: 700000 },
  spouseProfile: initialSpouse,
};

useGameStore.setState({
  simulation: {
    activeModal: mockWeddingModal,
    modalQueue: [],
    isPaused: true,
  },
});

const mockJobToApply = {
  id: 'job_app_test',
  companyName: 'InnoTech',
  tier: 2,
  requiredExperienceYears: 2,
  requiredSkillLevel: 1.0,
  grossMonthlySalary: 70000,
  monthlyTakeHome: 56000,
};

// Character qualifies so job application is accepted
useGameStore.setState({
  character: {
    ...char,
    yearsOfExperience: 5,
    skillLevel: 3.0,
    jobApplicationCooldowns: {},
  },
});

useGameStore.getState().applyForJob(mockJobToApply);

const stateAfterApply = useGameStore.getState();
console.log(`  -> Current activeModal: ${stateAfterApply.simulation.activeModal?.type} (Expected: job_offer)`);
console.log(`  -> Queued modals count: ${stateAfterApply.simulation.modalQueue?.length} (Expected: 1)`);
console.log(`  -> Next queued modal: ${stateAfterApply.simulation.modalQueue[0]?.type} (Expected: wedding)`);

assert.strictEqual(stateAfterApply.simulation.activeModal?.type, 'job_offer');
assert.strictEqual(stateAfterApply.simulation.modalQueue?.length, 1);
assert.strictEqual(stateAfterApply.simulation.modalQueue[0]?.type, 'wedding');
console.log('✓ Test 2 passed: Existing active modal was safely queued rather than destroyed!\n');

// ─── Test 3: Marriage Date Trigger at Target Age in Simulation Loop ──────────
console.log('Test 3: Marriage milestone triggers wedding modal at target age without being skipped...');

const testSimState = {
  currentScreen: 'main_game',
  character: {
    seed: 'sim_seed_wedding',
    gender: 'female',
    age: 23,
    jobTitle: 'Junior Analyst',
    jobTier: 1,
    grossMonthlySalary: 50000,
    monthlyTakeHome: 42000,
    liquidCash: 50000,
    totalFixedExpenses: 20000,
    totalLoanEMIs: 0,
    totalMonthlyOutflow: 20800,
    monthlySurplus: 21200,
    employmentStatus: 'employed',
    yearsOfExperience: 5,
    tenureYearsAtCurrentCompany: 5,
    assetMaintenanceState: { isMarried: false },
    loans: [],
  },
  insurance: {
    health: { isPurchased: true, monthlyPremium: 800 },
    termLife: { isPurchased: false, monthlyPremium: 0 },
  },
  goals: [
    {
      id: 'goal_marriage',
      kind: 'milestone',
      name: 'Marriage',
      targetAge: 29,
      targetAmount: 800000,
      currentAmount: 800000, // 100% funded
      milestoneTriggered: false,
      baseMonthlySIP: 5000,
      instrumentId: 'fd',
      allocationPercent: 20,
    },
  ],
  simulation: {
    currentMonthIndex: 71, // Next tick is month 72 -> Age 23 + 6 = 29!
    currentAge: 28,
    modalQueue: [],
    activeModal: null,
    isPaused: false,
  },
};

const nextSimState = tickMonthlySimulation(testSimState);

console.log(`  -> Simulated next month: ${nextSimState.simulation.currentMonthIndex}`);
console.log(`  -> Simulation currentAge: ${nextSimState.simulation.currentAge}`);
console.log(`  -> Active Modal: ${nextSimState.simulation.activeModal?.type}`);
console.log(`  -> Queued Modals: ${nextSimState.simulation.modalQueue.map((m) => m.type).join(', ')}`);

const marriageGoalAfter = nextSimState.goals.find((g) => g.id === 'goal_marriage');
assert.strictEqual(nextSimState.simulation.currentAge, 29, 'Age must turn 29');
assert.strictEqual(marriageGoalAfter.milestoneTriggered, true, 'Milestone must be triggered');

// Either activeModal or modalQueue must contain the wedding modal
const hasWedding =
  nextSimState.simulation.activeModal?.type === 'wedding' ||
  nextSimState.simulation.modalQueue.some((m) => m.type === 'wedding');

assert(hasWedding, 'Wedding modal MUST be triggered and either active or in modalQueue at age 29!');
console.log('✓ Test 3 passed: Marriage ceremony modal reliably generated at planned marriage age!\n');

console.log('🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
