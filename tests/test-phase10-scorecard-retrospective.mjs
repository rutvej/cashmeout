// Phase 10: Endgame Financial Retrospective, Decision Debrief & Strategic Counterfactuals Tests
import { evaluateScorecard, evaluatePostponeDecision, evaluateInstrumentSuitability } from '../src/engine/scoringEngine.js';
import { generateCharacter } from '../src/engine/characterGenerator.js';
import { tickMonthlySimulation } from '../src/engine/simulationEngine.js';
import { useGameStore } from '../src/engine/store.js';
import { chromium } from 'playwright';

console.log('🧪 Starting Phase 10: Endgame Financial Retrospective & Scoring Engine Test Suite...\n');

// ─── 1. Unit Test 1: Milestone Audits Detection (Early, On-Time, Shortfall) ───
console.log('Test 1: Milestone timing & shortfall resolution audit...');

const testCharacter = {
  ...generateCharacter('scorecard_seed_1', 'tier1', 'science'),
  age: 60,
  retirementAge: 60,
  liquidCash: 500000,
  loans: [],
  penaltiesPaidFD: 0,
  marketLossesRealized: 0,
};

const testGoals = [
  {
    id: 'goal_car',
    name: 'Buy First Car',
    icon: '🚗',
    targetAmount: 600000,
    currentAmount: 600000,
    filledEarlyMonths: 14,
    instrumentId: 'fd',
    targetMonthsRemaining: 0,
  },
  {
    id: 'goal_marriage',
    name: 'Marriage & Wedding',
    icon: '💍',
    targetAmount: 800000,
    currentAmount: 800000,
    status: 'completed',
    instrumentId: 'fd',
    targetMonthsRemaining: 0,
  },
  {
    id: 'goal_home',
    name: 'Home Down Payment',
    icon: '🏠',
    targetAmount: 2200000,
    currentAmount: 1800000,
    status: 'in_progress',
    instrumentId: 'savings',
    targetMonthsRemaining: 0,
  },
  {
    id: 'goal_vacation',
    name: 'Annual Vacation',
    icon: '✈️',
    targetAmount: 100000,
    currentAmount: 40000,
    status: 'in_progress',
    instrumentId: 'savings',
    targetMonthsRemaining: 0,
  },
  {
    id: 'goal_emergency',
    name: 'Emergency Fund',
    icon: '🛡️',
    targetAmount: 300000,
    currentAmount: 300000,
    instrumentId: 'savings',
    targetMonthsRemaining: 0,
  },
  {
    id: 'goal_retirement',
    name: 'Retirement Corpus',
    icon: '🌴',
    targetAmount: 20000000,
    currentAmount: 25000000,
    instrumentId: 'mutual_funds',
    targetMonthsRemaining: 0,
  },
];

const testDecisionJournal = [
  {
    type: 'milestone',
    goalId: 'goal_home',
    goalName: 'Home Down Payment',
    icon: '🏠',
    targetAmount: 2200000,
    currentAmount: 1800000,
    shortfall: 400000,
    resolution: 'postpone',
    postponeYears: 2,
    age: 34,
    monthIndex: 132,
    liquidCashAvailable: 50000,
    hadIdleCash: false,
  },
  {
    type: 'milestone',
    goalId: 'goal_vacation',
    goalName: 'Annual Vacation',
    icon: '✈️',
    targetAmount: 100000,
    currentAmount: 40000,
    shortfall: 60000,
    resolution: 'loan',
    postponeYears: 0,
    age: 28,
    monthIndex: 60,
    liquidCashAvailable: 10000,
    hadIdleCash: false,
  },
];

const scorecard1 = evaluateScorecard({
  character: testCharacter,
  goals: testGoals,
  simulation: {
    currentAge: 60,
    currentMonthIndex: 444,
    decisionJournal: testDecisionJournal,
    history: [],
  },
});

const carAudit = scorecard1.milestoneAudits.find((m) => m.goalId === 'goal_car');
if (!carAudit || carAudit.status !== 'filled_early' || carAudit.monthsDifference !== 14) {
  throw new Error(`Expected car audit status to be 'filled_early' with 14 mos, got ${JSON.stringify(carAudit)}`);
}

const marriageAudit = scorecard1.milestoneAudits.find((m) => m.goalId === 'goal_marriage');
if (!marriageAudit || marriageAudit.status !== 'filled_on_time' || marriageAudit.shortfallAmount !== 0) {
  throw new Error(`Expected marriage audit status to be 'filled_on_time', got ${JSON.stringify(marriageAudit)}`);
}

const homeAudit = scorecard1.milestoneAudits.find((m) => m.goalId === 'goal_home');
if (!homeAudit || homeAudit.status !== 'shortfall' || homeAudit.shortfallAmount !== 400000 || homeAudit.resolutionTaken !== 'postpone') {
  throw new Error(`Expected home audit shortfall with postpone resolution, got ${JSON.stringify(homeAudit)}`);
}
if (!homeAudit.postponeEvaluation || typeof homeAudit.postponeEvaluation.wasGoodDecision !== 'boolean') {
  throw new Error(`Expected home audit to have postponeEvaluation, got ${JSON.stringify(homeAudit.postponeEvaluation)}`);
}

console.log('✓ Accurate detection of Early (+14 mos), On-Time, and Shortfall goals verified\n');


// ─── 2. Unit Test 2: Postpone Evaluation Algorithm ──────────────────────────
console.log('Test 2: Postpone evaluation logic for discretionary vs idle cash vs housing...');

// Case 1: Postponing discretionary luxury milestone when young without debt
const eval1 = evaluatePostponeDecision(
  { id: 'goal_car', kind: 'milestone' },
  { age: 26, liquidCash: 30000 },
  {},
  100000
);
if (!eval1.wasGoodDecision || eval1.rating !== 'excellent') {
  throw new Error(`Expected excellent rating for postponing car when young without debt, got ${JSON.stringify(eval1)}`);
}
if (!eval1.reason.includes('Smart move!') || !eval1.reason.includes('compound unimpeded')) {
  throw new Error(`Postpone reason mismatch: ${eval1.reason}`);
}

// Case 2: Postponing despite having >= 120% idle bank cash
const eval2 = evaluatePostponeDecision(
  { id: 'goal_car', kind: 'milestone' },
  { age: 26, liquidCash: 500000 },
  {},
  100000 // 500000 >= 100000 * 1.2
);
if (eval2.wasGoodDecision !== false || eval2.rating !== 'poor') {
  throw new Error(`Expected poor rating for postponing with ample idle bank cash, got ${JSON.stringify(eval2)}`);
}
if (!eval2.reason.includes('Unnecessary delay: You had sufficient idle bank cash')) {
  throw new Error(`Postpone reason mismatch for idle cash: ${eval2.reason}`);
}

// Case 3: Postponing home down payment
const eval3 = evaluatePostponeDecision(
  { id: 'goal_home', kind: 'milestone' },
  { age: 34, liquidCash: 50000 },
  {},
  300000
);
if (!eval3.wasGoodDecision || eval3.rating !== 'acceptable') {
  throw new Error(`Expected acceptable rating for postponing home purchase, got ${JSON.stringify(eval3)}`);
}
if (!eval3.reason.includes('Prudent defense: Prevented an overleveraged mortgage crisis')) {
  throw new Error(`Postpone reason mismatch for home purchase: ${eval3.reason}`);
}

console.log('✓ All 3 postpone evaluation scenarios (discretionary young, idle cash penalty, housing defense) verified\n');


// ─── 3. Unit Test 3: Asset Suitability & Horizon Critique ───────────────────
console.log('Test 3: Asset suitability audit (Emergency Fund placement, FD penalties, equity horizon)...');

// 3a. Emergency Fund in Savings -> Optimal
const suitSavings = evaluateInstrumentSuitability({ id: 'goal_emergency', instrumentId: 'savings' });
if (!suitSavings.isOptimal || suitSavings.verdict !== 'optimal') {
  throw new Error(`Expected optimal verdict for emergency fund in savings, got ${JSON.stringify(suitSavings)}`);
}

// 3b. Emergency Fund in FD -> Suboptimal
const suitFD = evaluateInstrumentSuitability({ id: 'goal_emergency', instrumentId: 'fd' });
if (suitFD.isOptimal !== false || suitFD.verdict !== 'suboptimal' || !suitFD.critique.includes('FD lock-ins')) {
  throw new Error(`Expected suboptimal verdict for emergency fund in FD, got ${JSON.stringify(suitFD)}`);
}

// 3c. Emergency Fund in Mutual Funds -> Dangerous
const suitEquities = evaluateInstrumentSuitability({ id: 'goal_emergency', instrumentId: 'mutual_funds' });
if (suitEquities.isOptimal !== false || suitEquities.verdict !== 'dangerous' || !suitEquities.critique.includes('High volatility')) {
  throw new Error(`Expected dangerous verdict for emergency fund in mutual funds, got ${JSON.stringify(suitEquities)}`);
}

// 3d. Penalties paid in scorecard result
const scorecardWithPenalties = evaluateScorecard({
  character: {
    ...testCharacter,
    penaltiesPaidFD: 3500,
    marketLossesRealized: 15000,
  },
  goals: [
    { id: 'goal_emergency', instrumentId: 'fd', currentAmount: 300000, targetAmount: 300000 },
    { id: 'goal_retirement', instrumentId: 'mutual_funds', currentAmount: 15000000, targetAmount: 15000000 },
  ],
  simulation: { decisionJournal: [] },
});

if (scorecardWithPenalties.assetAudit.penaltiesPaidFD !== 3500) {
  throw new Error(`Expected penaltiesPaidFD = 3500, got ${scorecardWithPenalties.assetAudit.penaltiesPaidFD}`);
}
if (scorecardWithPenalties.assetAudit.marketLossesRealized !== 15000) {
  throw new Error(`Expected marketLossesRealized = 15000, got ${scorecardWithPenalties.assetAudit.marketLossesRealized}`);
}
if (scorecardWithPenalties.assetAudit.emergencyFundCritique.status !== 'suboptimal') {
  throw new Error(`Expected emergencyFundCritique.status to be 'suboptimal', got ${scorecardWithPenalties.assetAudit.emergencyFundCritique.status}`);
}

console.log('✓ Instrument suitability & penalty auditing strictly verified\n');


// ─── 4. Unit Test 4: Career Stagnation & Missed Earnings Calculation ────────
console.log('Test 4: Career stagnation missed earnings counterfactual calculation...');

// Scenario 4a: Stagnated 7 years in Tier 1 without upskilling
const stagnatedScorecard = evaluateScorecard({
  character: {
    ...testCharacter,
    jobTier: 1,
    yearsInTier1: 7,
    completedCourses: [],
  },
  goals: testGoals,
  simulation: {
    decisionJournal: [],
    history: [],
  },
});

if (!stagnatedScorecard.careerAudit.careerStagnationDetected) {
  throw new Error('Expected careerStagnationDetected to be true for 7 years in Tier 1 without courses');
}
if (stagnatedScorecard.careerAudit.estimatedMissedEarnings <= 0) {
  throw new Error(`Expected estimatedMissedEarnings > 0, got ${stagnatedScorecard.careerAudit.estimatedMissedEarnings}`);
}
// Expected: (7 - 3) * 12 * 35000 = 48 * 35000 = ₹16,80,000
const expectedMissed = 4 * 12 * 35000;
if (stagnatedScorecard.careerAudit.estimatedMissedEarnings !== expectedMissed) {
  throw new Error(`Expected estimatedMissedEarnings = ${expectedMissed}, got ${stagnatedScorecard.careerAudit.estimatedMissedEarnings}`);
}

// Scenario 4b: No stagnation (active upskilling and Tier 3)
const upskilledScorecard = evaluateScorecard({
  character: {
    ...testCharacter,
    jobTier: 3,
    yearsInTier1: 2,
    completedCourses: ['course_bootcamp', 'course_cert'],
  },
  goals: testGoals,
  simulation: {
    decisionJournal: [
      { type: 'course_completed', courseId: 'course_bootcamp', fee: 30000, age: 26 },
      { type: 'job_switch', oldSalary: 50000, newSalary: 85000, title: 'Senior Specialist', age: 27 },
    ],
    history: [],
  },
});

if (upskilledScorecard.careerAudit.careerStagnationDetected) {
  throw new Error('Expected careerStagnationDetected to be false for upskilled character');
}
if (upskilledScorecard.careerAudit.estimatedMissedEarnings !== 0) {
  throw new Error(`Expected estimatedMissedEarnings = 0 for upskilled character, got ${upskilledScorecard.careerAudit.estimatedMissedEarnings}`);
}
if (upskilledScorecard.careerAudit.totalUpskillingCoursesCompleted !== 2) {
  throw new Error(`Expected totalUpskillingCoursesCompleted = 2, got ${upskilledScorecard.careerAudit.totalUpskillingCoursesCompleted}`);
}
if (upskilledScorecard.careerAudit.totalJobSwitches !== 1) {
  throw new Error(`Expected totalJobSwitches = 1, got ${upskilledScorecard.careerAudit.totalJobSwitches}`);
}

// Verify Counterfactual Insights array
if (!Array.isArray(upskilledScorecard.topCounterfactuals) || upskilledScorecard.topCounterfactuals.length < 2) {
  throw new Error(`Expected topCounterfactuals to contain at least 2 cards, got ${upskilledScorecard.topCounterfactuals?.length}`);
}

console.log('✓ Career stagnation detection and counterfactual missed earnings verified\n');


// ─── 5. Playwright E2E UI Test: Scorecard Screen Retrospective ──────────────
console.log('Test 5: Playwright E2E UI verification of Scorecard Retrospective Tabs & Cards...');

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Generate character to establish base store state
  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(300);

  // Directly set store state into 'scorecard' screen with rich decision journal
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const character = {
      ...store.character,
      name: 'Aarav Sharma',
      age: 60,
      retirementAge: 60,
      liquidCash: 850000,
      totalFixedExpenses: 45000,
      ventureIncome: 20000,
      loans: [],
      jobTier: 1,
      yearsInTier1: 7,
      completedCourses: [],
      penaltiesPaidFD: 1500,
      marketLossesRealized: 0,
    };

    const goals = [
      {
        id: 'goal_car',
        name: 'Buy First Car',
        icon: '🚗',
        targetAmount: 600000,
        currentAmount: 600000,
        filledEarlyMonths: 14,
        instrumentId: 'fd',
        status: 'completed',
        targetMonthsRemaining: 0,
      },
      {
        id: 'goal_marriage',
        name: 'Marriage & Wedding',
        icon: '💍',
        targetAmount: 800000,
        currentAmount: 800000,
        status: 'completed',
        instrumentId: 'fd',
        targetMonthsRemaining: 0,
      },
      {
        id: 'goal_home',
        name: 'Home Down Payment',
        icon: '🏠',
        targetAmount: 2200000,
        currentAmount: 1800000,
        status: 'in_progress',
        instrumentId: 'savings',
        targetMonthsRemaining: 0,
      },
      {
        id: 'goal_emergency',
        name: 'Emergency Fund',
        icon: '🛡️',
        targetAmount: 300000,
        currentAmount: 300000,
        instrumentId: 'savings',
        targetMonthsRemaining: 0,
      },
      {
        id: 'goal_retirement',
        name: 'Retirement Corpus',
        icon: '🌴',
        targetAmount: 18000000,
        currentAmount: 24200000,
        instrumentId: 'mutual_funds',
        targetMonthsRemaining: 0,
      },
    ];

    const decisionJournal = [
      {
        type: 'milestone',
        goalId: 'goal_home',
        goalName: 'Home Down Payment',
        icon: '🏠',
        targetAmount: 2200000,
        currentAmount: 1800000,
        shortfall: 400000,
        resolution: 'postpone',
        postponeYears: 2,
        age: 34,
        monthIndex: 132,
        liquidCashAvailable: 50000,
        hadIdleCash: false,
      },
    ];

    window.__GAME_STORE__.setState({
      character,
      goals,
      currentScreen: 'scorecard',
      simulation: {
        ...store.simulation,
        currentAge: 60,
        currentMonthIndex: 444,
        isPaused: true,
        decisionJournal,
      },
    });
  });

  await page.waitForTimeout(600);

  // 1. Verify Header & Grade Hero Banner
  const titleEl = page.locator('text=/Aarav Sharma\'s Strategic Debrief/i').first();
  await titleEl.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Header with character name and strategic debrief title is rendered');

  const bannerEl = page.locator('text=/🌟 Grade/i').first();
  await bannerEl.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Grade Hero Banner with letter grade and sustainable passive income rendered');

  // 2. Verify Tab 1: Milestones & Decisions
  const milestonesTabBtn = page.locator('button[data-tab="milestones"]').first();
  await milestonesTabBtn.waitFor({ state: 'visible', timeout: 5000 });

  // Verify Early Badge (+14 mos)
  const earlyBadge = page.locator('text=/Filled Early \\(\\+14 mos\\)/i').first();
  await earlyBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Early completion badge "Filled Early (+14 mos)" is visible');

  // Verify On-Time Badge
  const onTimeBadge = page.locator('text=/Funded 100% On-Time/i').first();
  await onTimeBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ On-time completion badge "Funded 100% On-Time" is visible');

  // Verify Postpone Verdict Callout
  const postponeVerdict = page.locator('text=/Prudent defense: Prevented an overleveraged mortgage crisis/i').first();
  await postponeVerdict.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Plain-language postpone verdict callout is visible');

  // 3. Verify Tab 2: Career & What-Ifs
  const careerTabBtn = page.locator('button[data-tab="career"]').first();
  await careerTabBtn.click();
  await page.waitForTimeout(400);

  // Verify Stagnation Banner
  const stagBanner = page.locator('text=/Career Stagnation Detected/i').first();
  await stagBanner.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Career stagnation warning banner is visible in Career tab');

  // Verify Counterfactual Card
  const counterfactualCard = page.locator('text=/Career Leap Opportunity/i').first();
  await counterfactualCard.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Counterfactual card "Career Leap Opportunity" is visible');

  // 4. Verify Tab 3: Asset Audit
  const assetTabBtn = page.locator('button[data-tab="assets"]').first();
  await assetTabBtn.click();
  await page.waitForTimeout(400);

  // Verify Emergency Reserve Placement
  const emgPlacement = page.locator('text=/Emergency Reserve Placement/i').first();
  await emgPlacement.waitFor({ state: 'visible', timeout: 5000 });
  const emgOptimal = page.locator('text=/Verdict: OPTIMAL/i').first();
  await emgOptimal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Emergency Reserve Placement card with "Verdict: OPTIMAL" is visible');

  // Verify FD Penalties card
  const fdPenalties = page.locator('text=/Fixed Deposit Premature Exit Penalties/i').first();
  await fdPenalties.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ FD Premature Exit Penalties card is rendered');

  // 5. Verify Action Controls: Play Again and Roll New Life
  const playAgainBtn = page.locator('button:has-text("Play Again (Same Seed)")').first();
  await playAgainBtn.waitFor({ state: 'visible', timeout: 5000 });
  const rollNewBtn = page.locator('button:has-text("Roll New Life")').first();
  await rollNewBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Action buttons "Play Again (Same Seed)" and "Roll New Life" are visible');

  // Capture screenshot
  await page.screenshot({ path: 'tests/screenshot-phase10-scorecard.png' });
  console.log('✓ Captured tests/screenshot-phase10-scorecard.png');

} finally {
  await browser.close();
}

console.log('\n🎉 ALL PHASE 10 SCORECARD RETROSPECTIVE & DEBRIEF TESTS PASSED WITH 100% SUCCESS!\n');
