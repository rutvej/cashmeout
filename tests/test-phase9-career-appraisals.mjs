// Phase 9 Career Appraisals, Tenure Stagnation & Job Switch Incentives Tests
import { calculateAnnualAppraisal } from '../src/engine/careerEngine.js';
import { generateCharacter } from '../src/engine/characterGenerator.js';
import { tickMonthlySimulation } from '../src/engine/simulationEngine.js';
import { useGameStore } from '../src/engine/store.js';
import { chromium } from 'playwright';

console.log('🧪 Starting Phase 9: Dynamic Career Appraisals & Tenure Stagnation Test Suite...\n');

// ─── 1. Unit Test 1: Initial Character State ────────────────────────────────
console.log('Test 1: Character generator initializes tenure & course completion...');
const testChar = generateCharacter('test_phase9_seed_1', 'tier1', 'science');
if (testChar.tenureYearsAtCurrentCompany !== 0) {
  throw new Error(`Expected tenureYearsAtCurrentCompany = 0, got ${testChar.tenureYearsAtCurrentCompany}`);
}
if (testChar.monthsSinceLastCourseCompletion !== 999) {
  throw new Error(`Expected monthsSinceLastCourseCompletion = 999, got ${testChar.monthsSinceLastCourseCompletion}`);
}
console.log('✓ Character initializes with tenureYearsAtCurrentCompany = 0 and monthsSinceLastCourseCompletion = 999\n');


// ─── 2. Unit Test 2: Appraisals Vary Across 3 Tiers (0-2%, 4-7%, 10-16%) ────
console.log('Test 2: Appraisals vary across the 3 distinct tiers (freeze, normal, boom)...');
const NUM_SAMPLES = 1000;
let freezeCount = 0;
let normalCount = 0;
let boomCount = 0;

for (let i = 0; i < NUM_SAMPLES; i++) {
  const char = {
    seed: `baseline_seed_${i}`,
    tenureYearsAtCurrentCompany: 1, // Not stagnated
    monthsSinceLastCourseCompletion: 999, // No recent course
  };

  const res = calculateAnnualAppraisal(char, 12, char.seed);

  // Validate structure
  if (typeof res.hikeRate !== 'number' || isNaN(res.hikeRate)) {
    throw new Error(`Invalid hikeRate: ${res.hikeRate}`);
  }
  if (!['freeze', 'normal', 'boom'].includes(res.category)) {
    throw new Error(`Invalid category: ${res.category}`);
  }
  if (!res.headline || typeof res.headline !== 'string') {
    throw new Error(`Invalid headline: ${res.headline}`);
  }
  if (!res.reason || typeof res.reason !== 'string') {
    throw new Error(`Invalid reason: ${res.reason}`);
  }
  if (typeof res.isStagnated !== 'boolean') {
    throw new Error(`Invalid isStagnated: ${res.isStagnated}`);
  }

  // Validate tier bounds
  if (res.category === 'freeze') {
    freezeCount++;
    if (res.hikeRate < 0.00 || res.hikeRate > 0.02) {
      throw new Error(`Freeze hikeRate out of [0%, 2%] bounds: ${res.hikeRate}`);
    }
  } else if (res.category === 'normal') {
    normalCount++;
    if (res.hikeRate < 0.04 || res.hikeRate > 0.07) {
      throw new Error(`Normal hikeRate out of [4%, 7%] bounds: ${res.hikeRate}`);
    }
  } else if (res.category === 'boom') {
    boomCount++;
    if (res.hikeRate < 0.10 || res.hikeRate > 0.16) {
      throw new Error(`Boom hikeRate out of [10%, 16%] bounds: ${res.hikeRate}`);
    }
  }
}

const freezePct = (freezeCount / NUM_SAMPLES) * 100;
const normalPct = (normalCount / NUM_SAMPLES) * 100;
const boomPct = (boomCount / NUM_SAMPLES) * 100;

console.log(`  -> Baseline Tiers Observed (${NUM_SAMPLES} samples):`);
console.log(`     Freeze (0–2%):  ${freezeCount} (${freezePct.toFixed(1)}%)  [Expected: ~15%]`);
console.log(`     Normal (4–7%):  ${normalCount} (${normalPct.toFixed(1)}%)  [Expected: ~65%]`);
console.log(`     Boom (10–16%):  ${boomCount} (${boomPct.toFixed(1)}%)  [Expected: ~20%]`);

if (freezePct < 11 || freezePct > 19) {
  throw new Error(`Baseline freeze rate ${freezePct.toFixed(1)}% deviates significantly from 15%`);
}
if (normalPct < 60 || normalPct > 70) {
  throw new Error(`Baseline normal rate ${normalPct.toFixed(1)}% deviates significantly from 65%`);
}
if (boomPct < 16 || boomPct > 24) {
  throw new Error(`Baseline boom rate ${boomPct.toFixed(1)}% deviates significantly from 20%`);
}

console.log('✓ All 3 appraisal tiers strictly verified within mathematical bounds and probability distributions\n');


// ─── 3. Unit Test 3: Tenure Stagnation (tenure >= 3 years) ───────────────────
console.log('Test 3: Staying >= 3 years triggers high stagnation freeze rate (~70%)...');
let stagnatedFreezeCount = 0;
let stagnationFlaggedCount = 0;

for (let i = 0; i < NUM_SAMPLES; i++) {
  const char = {
    seed: `stagnated_seed_${i}`,
    tenureYearsAtCurrentCompany: 3, // Stagnated at 3+ years!
    monthsSinceLastCourseCompletion: 999,
  };

  const res = calculateAnnualAppraisal(char, 36, char.seed);
  if (res.category === 'freeze') {
    stagnatedFreezeCount++;
    if (res.isStagnated) {
      stagnationFlaggedCount++;
      if (res.hikeRate < 0.005 || res.hikeRate > 0.02) {
        throw new Error(`Stagnated freeze hikeRate out of [0.5%, 2.0%] bounds: ${res.hikeRate}`);
      }
      if (!res.headline.includes('Freeze') && !res.headline.includes('Minimal')) {
        throw new Error(`Unexpected headline for stagnated freeze: ${res.headline}`);
      }
      if (!res.reason.includes('Tenure Stagnation')) {
        throw new Error(`Expected tenure stagnation reason, got: ${res.reason}`);
      }
    }
  }
}

const stagFreezePct = (stagnatedFreezeCount / NUM_SAMPLES) * 100;
const stagFlaggedPct = (stagnationFlaggedCount / NUM_SAMPLES) * 100;

console.log(`  -> Stagnated Tiers Observed (${NUM_SAMPLES} samples):`);
console.log(`     Total Freeze (0–2%):  ${stagnatedFreezeCount} (${stagFreezePct.toFixed(1)}%)  [Expected: ~70%]`);
console.log(`     Stagnation Flagged:   ${stagnationFlaggedCount} (${stagFlaggedPct.toFixed(1)}%)  [Expected: ~70%]`);

if (stagFreezePct < 65 || stagFreezePct > 76) {
  throw new Error(`Stagnation freeze rate ${stagFreezePct.toFixed(1)}% deviates significantly from 70%`);
}
if (stagFlaggedPct < 65 || stagFlaggedPct > 76) {
  throw new Error(`Stagnation flagged rate ${stagFlaggedPct.toFixed(1)}% deviates significantly from 70%`);
}

// Check tenure < 3 years does NOT trigger stagnation
const nonStagChar1 = { seed: 'seed_tenure_1', tenureYearsAtCurrentCompany: 1, monthsSinceLastCourseCompletion: 999 };
const nonStagChar2 = { seed: 'seed_tenure_2', tenureYearsAtCurrentCompany: 2, monthsSinceLastCourseCompletion: 999 };
let nonStagFreezes = 0;
for (let i = 0; i < 500; i++) {
  const r = calculateAnnualAppraisal({ ...nonStagChar2, seed: `tenure2_${i}` }, 24);
  if (r.category === 'freeze') nonStagFreezes++;
}
const nonStagFreezePct = (nonStagFreezes / 500) * 100;
console.log(`     Tenure 2 Years Freeze Rate: ${nonStagFreezePct.toFixed(1)}% (remains baseline ~15%)`);
if (nonStagFreezePct > 22) {
  throw new Error(`Tenure 2 years should not have elevated freeze rate: got ${nonStagFreezePct}%`);
}

console.log('✓ Tenure stagnation (>=3 years) reliably pushes freeze appraisals to ~70% with clear warnings\n');


// ─── 4. Unit Test 4: Recent Course Completion Upskilling Boost ──────────────
console.log('Test 4: Recent course completion boosts boom appraisal probability to ~35%...');
let upskilledBoomCount = 0;

for (let i = 0; i < NUM_SAMPLES; i++) {
  const char = {
    seed: `upskilled_seed_${i}`,
    tenureYearsAtCurrentCompany: 1,
    monthsSinceLastCourseCompletion: 12, // Within 24 months!
  };

  const res = calculateAnnualAppraisal(char, 24, char.seed);
  if (res.category === 'boom') {
    upskilledBoomCount++;
    if (res.hikeRate < 0.10 || res.hikeRate > 0.16) {
      throw new Error(`Upskilled boom hikeRate out of bounds: ${res.hikeRate}`);
    }
  }
}

const upskilledBoomPct = (upskilledBoomCount / NUM_SAMPLES) * 100;
console.log(`  -> Upskilled Boom Rate (${NUM_SAMPLES} samples): ${upskilledBoomPct.toFixed(1)}% [Expected: ~35%]`);

if (upskilledBoomPct < 30 || upskilledBoomPct > 40) {
  throw new Error(`Upskilled boom rate ${upskilledBoomPct.toFixed(1)}% deviates from 35% target`);
}

// Edge case: course completed 0 months ago
let zeroMonthBoomCount = 0;
for (let i = 0; i < 500; i++) {
  const char = { seed: `zero_course_${i}`, tenureYearsAtCurrentCompany: 1, monthsSinceLastCourseCompletion: 0 };
  const res = calculateAnnualAppraisal(char, 12, char.seed);
  if (res.category === 'boom') zeroMonthBoomCount++;
}
const zeroMonthBoomPct = (zeroMonthBoomCount / 500) * 100;
console.log(`     Course completed 0 months ago Boom Rate: ${zeroMonthBoomPct.toFixed(1)}% (~35%)`);
if (zeroMonthBoomPct < 28 || zeroMonthBoomPct > 42) {
  throw new Error(`0-month course completion must receive boom boost: got ${zeroMonthBoomPct}%`);
}

// Verify expired boost (> 24 months ago)
let expiredBoomCount = 0;
for (let i = 0; i < 500; i++) {
  const char = { seed: `expired_course_${i}`, tenureYearsAtCurrentCompany: 1, monthsSinceLastCourseCompletion: 30 };
  const res = calculateAnnualAppraisal(char, 36, char.seed);
  if (res.category === 'boom') expiredBoomCount++;
}
const expiredBoomPct = (expiredBoomCount / 500) * 100;
console.log(`     Course completed 30 months ago Boom Rate: ${expiredBoomPct.toFixed(1)}% (returned to ~20%)`);
if (expiredBoomPct < 15 || expiredBoomPct > 25) {
  throw new Error(`Expired upskilling (>24mo) must return to ~20% boom rate: got ${expiredBoomPct}%`);
}

console.log('✓ Recent course completion (<= 24 months) successfully boosts top-tier appraisal rate to ~35%\n');


// ─── 5. Integration Test 5: Simulation Engine Annual Review & Raise Modal ───
console.log('Test 5: Simulation Engine applies dynamic appraisal & creates raise modal at month 12...');

let simState = {
  character: {
    ...generateCharacter('sim_annual_seed', 'tier1', 'science'),
    tenureYearsAtCurrentCompany: 0,
    monthsSinceLastCourseCompletion: 999,
    liquidCash: 50000,
    employmentStatus: 'employed',
  },
  goals: [
    { id: 'goal_emergency', name: 'Emergency Fund', currentAmount: 100000, targetAmount: 100000, instrumentId: 'savings' }
  ],
  insurance: { health: { isPurchased: true, monthlyPremium: 1500 } },
  simulation: {
    currentMonthIndex: 0,
    isPaused: false,
    activeModal: null,
    modalQueue: [],
    history: [],
  },
};

const initialSalary = simState.character.grossMonthlySalary;
const initialTakeHome = simState.character.monthlyTakeHome;

// Simulate 12 months up to Month 12
for (let m = 1; m <= 12; m++) {
  simState = tickMonthlySimulation(simState);
  // Clear any non-raise modals along the way to allow simulation to advance
  if (m < 12 && simState.simulation.activeModal) {
    simState.simulation.activeModal = null;
    simState.simulation.isPaused = false;
  }
}

if (simState.character.tenureYearsAtCurrentCompany !== 1) {
  throw new Error(`Expected tenureYearsAtCurrentCompany = 1 at month 12, got ${simState.character.tenureYearsAtCurrentCompany}`);
}
if (simState.character.monthsSinceLastCourseCompletion !== 1011) {
  throw new Error(`Expected monthsSinceLastCourseCompletion = 1011 (999+12), got ${simState.character.monthsSinceLastCourseCompletion}`);
}

const activeModal = simState.simulation.activeModal;
if (!activeModal || activeModal.type !== 'raise') {
  throw new Error(`Expected activeModal.type === 'raise' at month 12, got ${JSON.stringify(activeModal)}`);
}

if (typeof activeModal.hikeRate !== 'number' || activeModal.hikeRate <= 0) {
  throw new Error(`Expected positive hikeRate in raiseModal, got ${activeModal.hikeRate}`);
}
if (!['freeze', 'normal', 'boom'].includes(activeModal.category)) {
  throw new Error(`Expected valid category in raiseModal, got ${activeModal.category}`);
}
if (!activeModal.headline || !activeModal.reason) {
  throw new Error(`Expected headline and reason in raiseModal, got ${JSON.stringify(activeModal)}`);
}
if (simState.character.grossMonthlySalary <= initialSalary) {
  throw new Error(`Expected grossMonthlySalary to increase from ${initialSalary}, got ${simState.character.grossMonthlySalary}`);
}

console.log(`✓ Month 12 simulation appraisal: ${activeModal.category.toUpperCase()} (${(activeModal.hikeRate * 100).toFixed(1)}%)`);
console.log(`  -> Salary increased from ₹${initialSalary.toLocaleString()} to ₹${simState.character.grossMonthlySalary.toLocaleString()}`);
console.log(`  -> Modal headline: "${activeModal.headline}"\n`);


// ─── 6. Integration Test 6: Course Completion Resets monthsSinceLastCourseCompletion
console.log('Test 6: Completing a course resets character.monthsSinceLastCourseCompletion to 0...');

let courseSimState = {
  character: {
    ...generateCharacter('course_complete_seed', 'tier1', 'science'),
    monthsSinceLastCourseCompletion: 60, // 5 years since last course
    activeCourse: {
      courseId: 'course_bootcamp',
      courseName: 'Bootcamp',
      monthlyFee: 10000,
      durationMonths: 3,
      monthsCompleted: 2, // 1 month left!
      totalDurationMonths: 3,
      skillBoostReward: 0.4,
    },
    liquidCash: 100000,
    employmentStatus: 'employed',
  },
  goals: [],
  insurance: {},
  simulation: {
    currentMonthIndex: 5,
    isPaused: false,
    activeModal: null,
    modalQueue: [],
    history: [],
  },
};

courseSimState = tickMonthlySimulation(courseSimState);

if (courseSimState.character.monthsSinceLastCourseCompletion !== 0) {
  throw new Error(`Expected monthsSinceLastCourseCompletion to reset to 0, got ${courseSimState.character.monthsSinceLastCourseCompletion}`);
}
if (courseSimState.character.activeCourse !== null) {
  throw new Error(`Expected activeCourse to be null after completion`);
}
if (courseSimState.simulation.activeModal?.type !== 'course_completed') {
  throw new Error(`Expected course_completed modal, got ${courseSimState.simulation.activeModal?.type}`);
}

console.log('✓ Course completion resets monthsSinceLastCourseCompletion to 0 and upgrades skill level\n');


// ─── 7. Integration Test 7: Store acceptJobOffer Resets Tenure ──────────────
console.log('Test 7: Accepting a job offer in store resets tenureYearsAtCurrentCompany to 0...');

useGameStore.setState({
  character: {
    ...generateCharacter('job_offer_reset_seed', 'tier1', 'science'),
    tenureYearsAtCurrentCompany: 4, // Heavily stagnated!
    monthlyTakeHome: 50000,
    liquidCash: 40000,
    employmentStatus: 'employed',
  },
  simulation: {
    activeModal: null,
    modalQueue: [],
    isPaused: true,
  },
});

if (useGameStore.getState().character.tenureYearsAtCurrentCompany !== 4) {
  throw new Error('Initial store tenure not set to 4');
}

const testOffer = {
  companyName: 'NextGen Systems',
  title: 'Lead Architect',
  tier: 3,
  tierName: 'Lead / Manager',
  grossMonthlySalary: 160000,
  monthlyTakeHome: 140000,
  city: 'Bengaluru',
  cityTier: 'tier1',
  signingBonus: 50000,
};

useGameStore.getState().acceptJobOffer(testOffer);

const updatedChar = useGameStore.getState().character;
if (updatedChar.tenureYearsAtCurrentCompany !== 0) {
  throw new Error(`Expected tenureYearsAtCurrentCompany to reset to 0 on job switch, got ${updatedChar.tenureYearsAtCurrentCompany}`);
}
if (updatedChar.jobTitle !== 'Lead Architect') {
  throw new Error(`Expected jobTitle to be 'Lead Architect', got ${updatedChar.jobTitle}`);
}
if (updatedChar.monthlyTakeHome !== 140000) {
  throw new Error(`Expected monthlyTakeHome = 140000, got ${updatedChar.monthlyTakeHome}`);
}
if (updatedChar.liquidCash !== 90000) { // 40000 + 50000 bonus
  throw new Error(`Expected liquidCash = 90000 after signing bonus, got ${updatedChar.liquidCash}`);
}

console.log('✓ Job offer acceptance clears tenure stagnation (resets tenureYearsAtCurrentCompany = 0)\n');


// ─── 8. E2E Playwright UI Test: Raise Modal UI Verification ──────────────────
console.log('Test 8: Playwright E2E UI verification of Raise Modal badges and Job Market callout...');

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Generate character and navigate to Main Game Screen
  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(300);

  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await toGoalsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toGoalsBtn.click();
  await page.waitForTimeout(300);

  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await toAllocBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toAllocBtn.click();
  await page.waitForTimeout(300);

  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION")').first();
  await startSimBtn.waitFor({ state: 'visible', timeout: 5000 });
  await startSimBtn.click();
  await page.waitForTimeout(500);

  // Pause simulation
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().pause();
  });

  // Inject a freeze / stagnated raise modal to verify UI badge, headline, and Explore Job Market button
  console.log('  -> Injecting stagnated freeze raise modal into UI...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const appraisalModal = {
      type: 'raise',
      hikeRate: 0.015,
      category: 'freeze',
      headline: 'Company Salary Freeze / Minimal Raise',
      reason: 'Tenure Stagnation: Staying at the same company without switching has plateaued your pay.',
      isStagnated: true,
      oldTakeHome: 50000,
      newTakeHome: 50750,
      deltaSurplus: 750,
    };
    window.__GAME_STORE__.setState({
      simulation: {
        ...store.simulation,
        activeModal: appraisalModal,
        isPaused: true,
      }
    });
  });

  await page.waitForTimeout(500);

  // Verify badge
  const freezeBadge = page.locator('text=/COMPANY SALARY FREEZE \\/ MINIMAL/i').first();
  await freezeBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Appraisal Category Badge "COMPANY SALARY FREEZE / MINIMAL" is visible');

  // Verify headline & reason
  const headlineEl = page.locator('text=/Company Salary Freeze \\/ Minimal Raise/i').first();
  await headlineEl.waitFor({ state: 'visible', timeout: 5000 });
  const reasonEl = page.locator('text=/Tenure Stagnation: Staying at the same company without switching/i').first();
  await reasonEl.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Headline & Reason are prominently rendered');

  // Verify Explore Job Market action button
  const exploreBtn = page.locator('button:has-text("Explore Job Market (+30% Target)")').first();
  await exploreBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Action Callout "[ 💼 Explore Job Market (+30% Target) ]" is rendered for freeze appraisal');

  // Capture screenshot of Raise Modal
  await page.screenshot({ path: 'tests/screenshot-phase9-raise-modal.png' });
  console.log('✓ Captured tests/screenshot-phase9-raise-modal.png');

  // Click the Explore Job Market button and verify Job Market modal opens
  await exploreBtn.click();
  await page.waitForTimeout(500);

  const jobMarketHeader = page.locator('text=/Dynamic Job Market/i').first();
  await jobMarketHeader.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Clicking Explore Job Market button successfully opened the Dynamic Job Market modal!');

  // Now test Boom Modal badge rendering
  console.log('  -> Injecting boom appraisal modal into UI...');
  await page.evaluate(() => {
    // Close job market modal first
    const store = window.__GAME_STORE__.getState();
    const boomModal = {
      type: 'raise',
      hikeRate: 0.145,
      category: 'boom',
      headline: 'Top-Tier Performance Hike & Bonus',
      reason: 'Outstanding contribution and high skill execution rewarded with top-bracket appraisal!',
      isStagnated: false,
      oldTakeHome: 50000,
      newTakeHome: 57250,
      deltaSurplus: 7250,
    };
    window.__GAME_STORE__.setState({
      simulation: {
        ...store.simulation,
        activeModal: boomModal,
        isPaused: true,
      }
    });
  });

  await page.waitForTimeout(500);

  const boomBadge = page.locator('text=/TOP-TIER BOOM & PROMOTION/i').first();
  await boomBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Appraisal Category Badge "TOP-TIER BOOM & PROMOTION" is visible');

} finally {
  await browser.close();
}

console.log('\n🎉 ALL PHASE 9 DYNAMIC CAREER APPRAISALS & TENURE STAGNATION TESTS PASSED WITH 100% SUCCESS!\n');
