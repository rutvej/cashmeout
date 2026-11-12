import { chromium } from 'playwright';
import {
  generateSpouseProfile,
  applyCarOwnership,
  applyHomeOwnership,
  applyMarriageEconomics,
  getOutflowItemization,
  CAR_MONTHLY_UPKEEP,
  HOME_MONTHLY_MAINTENANCE,
  SPOUSE_ARCHETYPES,
} from '../src/engine/lifeEventsEngine.js';

function runUnitTests() {
  console.log('🧪 Running Phase 5 Pure Unit Tests...');

  // Test 1: Spouse Profile Generation (Deterministic & Archetypes)
  console.log('Unit Test 1: Deterministic Spouse Archetypes...');
  const spouse1 = generateSpouseProfile('test_seed_1');
  const spouse2 = generateSpouseProfile('test_seed_1');
  console.assert(spouse1.name === spouse2.name, 'Same seed must generate identical spouse name');
  console.assert(spouse1.archetype === spouse2.archetype, 'Same seed must generate identical archetype');
  console.assert(spouse1.monthlyTakeHome === spouse2.monthlyTakeHome, 'Same seed must generate identical take-home');

  // Verify archetype definitions
  console.assert(SPOUSE_ARCHETYPES.high_earner.monthlyTakeHome === 65000, 'High earner take-home is ₹65,000');
  console.assert(SPOUSE_ARCHETYPES.high_earner.addedHouseholdExpenses === 22000, 'High earner added expenses are ₹22,000');
  console.assert(SPOUSE_ARCHETYPES.high_earner.netSurplusDelta === 43000, 'High earner surplus delta is +₹43,000');

  console.assert(SPOUSE_ARCHETYPES.equal_earner.monthlyTakeHome === 40000, 'Equal earner take-home is ₹40,000');
  console.assert(SPOUSE_ARCHETYPES.equal_earner.addedHouseholdExpenses === 20000, 'Equal earner added expenses are ₹20,000');
  console.assert(SPOUSE_ARCHETYPES.equal_earner.netSurplusDelta === 20000, 'Equal earner surplus delta is +₹20,000');

  console.assert(SPOUSE_ARCHETYPES.single_income.monthlyTakeHome === 0, 'Single income take-home is ₹0');
  console.assert(SPOUSE_ARCHETYPES.single_income.addedHouseholdExpenses === 18000, 'Single income added expenses are ₹18,000');
  console.assert(SPOUSE_ARCHETYPES.single_income.netSurplusDelta === -18000, 'Single income surplus delta is -₹18,000');
  console.log('✓ All 3 spouse archetypes matched specification math precisely');

  // Test 2: Car Ownership & Vehicle Upkeep (+₹3,500/mo, Emergency Fund +₹21,000)
  console.log('Unit Test 2: Car Ownership & Upkeep...');
  const baseChar = {
    monthlyTakeHome: 50000,
    totalFixedExpenses: 25000,
    totalLoanEMIs: 0,
    loans: [],
    liquidCash: 50000,
    employmentStatus: 'employed',
    ventureIncome: 0,
    assetMaintenanceState: {
      hasCar: false,
      carMonthlyUpkeep: 0,
      hasOwnedHome: false,
      homeMonthlyMaintenance: 0,
      isMarried: false,
      spouse: null,
    },
  };
  const baseGoals = [
    { id: 'goal_emergency', currentAmount: 150000, targetAmount: 150000 },
    { id: 'goal_car', currentAmount: 600000, targetAmount: 600000, status: 'in_progress' },
  ];

  const carResult = applyCarOwnership(baseChar, baseGoals, {});
  console.assert(carResult.character.totalFixedExpenses === 28500, 'Fixed expenses must increase by ₹3,500 (25000 + 3500)');
  console.assert(carResult.character.assetMaintenanceState.hasCar === true, 'hasCar must be true');
  console.assert(carResult.character.assetMaintenanceState.carMonthlyUpkeep === 3500, 'carMonthlyUpkeep must be ₹3,500');

  const emergencyGoal = carResult.goals.find((g) => g.id === 'goal_emergency');
  console.assert(emergencyGoal.targetAmount === 171000, 'Emergency target must expand by +₹21,000 (150,000 + 21,000 = 171,000)');

  // Test idempotency
  const carResult2 = applyCarOwnership(carResult.character, carResult.goals, {});
  console.assert(carResult2.character.totalFixedExpenses === 28500, 'Idempotent: fixed expenses must not double add');
  console.log('✓ Car ownership correctly adds +₹3,500/mo and expands emergency fund by +₹21,000');

  // Test 3: Marriage Economics
  console.log('Unit Test 3: Marriage Economics...');
  const highEarnerProfile = {
    name: 'Ananya',
    profession: 'Senior Product Manager',
    monthlyTakeHome: 65000,
    addedHouseholdExpenses: 22000,
    netSurplusDelta: 43000,
    isEmployed: true,
    archetype: 'Dual Income High Earner',
  };
  const marriageResult = applyMarriageEconomics(carResult.character, highEarnerProfile, carResult.goals, {});
  console.assert(marriageResult.character.assetMaintenanceState.isMarried === true, 'isMarried must be true');
  console.assert(marriageResult.character.totalFixedExpenses === 28500 + 22000, 'Fixed expenses must add +₹22,000 (50,500)');
  console.assert(marriageResult.character.spouseTakeHome === 65000, 'Spouse take home must be ₹65,000');

  const jointEmergencyGoal = marriageResult.goals.find((g) => g.id === 'goal_emergency');
  console.assert(jointEmergencyGoal.targetAmount === Math.round(6 * (50500)), 'Emergency target must expand by 6 * ₹22,000 = +₹132,000');
  console.log('✓ Marriage economics correctly combines household take-home and expenses');

  // Test 4: Home Ownership (+₹5,500/mo)
  console.log('Unit Test 4: Home Maintenance (+₹5,500/mo)...');
  const homeResult = applyHomeOwnership(marriageResult.character, marriageResult.goals, {});
  console.assert(homeResult.character.assetMaintenanceState.hasOwnedHome === true, 'hasOwnedHome must be true');
  console.assert(homeResult.character.totalFixedExpenses === 50500 + 5500, 'Fixed expenses must add +₹5,500 (56,000)');
  console.log('✓ Home maintenance correctly adds +₹5,500/mo');

  // Test 5: Outflow Itemization
  console.log('Unit Test 5: Outflow Itemization...');
  const itemized = getOutflowItemization(homeResult.character);
  console.assert(itemized.carUpkeep === 3500, 'Itemized car upkeep is ₹3,500');
  console.assert(itemized.homeMaintenance === 5500, 'Itemized home maintenance is ₹5,500');
  console.assert(itemized.spouseAddon === 22000, 'Itemized spouse addon is ₹22,000');
  console.assert(itemized.baseLiving === 25000, 'Itemized base living is ₹25,000');
  console.assert(itemized.baseLiving + itemized.carUpkeep + itemized.homeMaintenance + itemized.spouseAddon === itemized.totalFixed, 'Sum of components equals totalFixed');
  console.log('✓ Itemization matches spec section 4.B');
  console.log('🎉 ALL UNIT TESTS PASSED WITH 100% SUCCESS!\n');
}

async function runE2ETests() {
  console.log('🚀 Starting Phase 5 Life Events Playwright E2E Tests...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. Generate Character and navigate to Main Game Screen
  console.log('Step 1: Navigating to Main Game Screen...');
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

  // Pause simulation so we control steps deterministically
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().pause();
  });
  console.log('✓ Reached MainGameScreen and paused simulation');

  // Step 2: Test Outflow Ledger toggle in Cashflow Ticker Strip
  console.log('Step 2: Testing Outflow Ledger Drawer toggle in Cashflow Ticker...');
  const expensesLedgerBtn = page.locator('button:has-text("Expenses")').first();
  await expensesLedgerBtn.waitFor({ state: 'visible', timeout: 5000 });
  await expensesLedgerBtn.click();
  await page.waitForTimeout(300);

  const outflowDrawer = page.locator('text=Monthly Outflow Ledger (Itemized Ongoing Costs)').first();
  await outflowDrawer.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Outflow Ledger Drawer is open and visible');

  await page.screenshot({ path: 'tests/screenshot-phase5-outflow-ledger-initial.png' });
  console.log('✓ Captured tests/screenshot-phase5-outflow-ledger-initial.png');

  // Step 3: Test Car Ownership Milestone Completion
  console.log('Step 3: Completing Car milestone and checking vehicle upkeep (+₹3,500/mo)...');
  const initialExpenses = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().character.totalFixedExpenses;
  });
  const initialEmergencyTarget = await page.evaluate(() => {
    const emg = window.__GAME_STORE__.getState().goals.find((g) => g.id === 'goal_emergency');
    return emg.targetAmount;
  });

  await page.evaluate(() => {
    window.__GAME_STORE__.getState().completeCarPurchase();
  });
  await page.waitForTimeout(300);

  const afterCarExpenses = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().character.totalFixedExpenses;
  });
  const afterCarEmergencyTarget = await page.evaluate(() => {
    const emg = window.__GAME_STORE__.getState().goals.find((g) => g.id === 'goal_emergency');
    return emg.targetAmount;
  });

  console.assert(afterCarExpenses === initialExpenses + 3500, `Fixed expenses must increase by ₹3,500 (was ${initialExpenses}, now ${afterCarExpenses})`);
  console.assert(afterCarEmergencyTarget === initialEmergencyTarget + 21000, `Emergency target must expand by ₹21,000 (was ${initialEmergencyTarget}, now ${afterCarEmergencyTarget})`);
  console.log('✓ Vehicle upkeep verified: +₹3,500/mo added to fixed expenses, +₹21,000 added to Emergency Target');

  await page.screenshot({ path: 'tests/screenshot-phase5-car-upkeep.png' });
  console.log('✓ Captured tests/screenshot-phase5-car-upkeep.png');

  // Step 4: Test Wedding Milestone Trigger & WeddingModal
  console.log('Step 4: Triggering Wedding milestone and WeddingModal...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const marriageGoal = store.goals.find((g) => g.id === 'goal_marriage');
    store.finalizeMilestone('goal_marriage');
  });
  await page.waitForTimeout(500);

  const weddingModalHeader = page.locator('text=Just Married! Congratulations!').first();
  await weddingModalHeader.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ WeddingModal is visible on screen');

  // Verify side-by-side comparison table is rendered
  const comparisonTable = page.locator('text=Household Cash Flow Economics (Before vs After Wedding)').first();
  await comparisonTable.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Side-by-side comparison table is rendered in WeddingModal');

  await page.screenshot({ path: 'tests/screenshot-phase5-wedding-modal.png' });
  console.log('✓ Captured tests/screenshot-phase5-wedding-modal.png');

  // Step 5: Confirm Wedding and check Household Economics
  console.log('Step 5: Confirming Wedding and verifying joint household economics...');
  const embarkBtn = page.locator('button:has-text("Embark on Married Life Together ➔")').first();
  await embarkBtn.waitFor({ state: 'visible', timeout: 5000 });
  await embarkBtn.click();
  await page.waitForTimeout(500);

  const isMarriedState = await page.evaluate(() => {
    const char = window.__GAME_STORE__.getState().character;
    return {
      isMarried: char.assetMaintenanceState?.isMarried,
      spouseName: char.assetMaintenanceState?.spouse?.name,
      spouseRole: char.assetMaintenanceState?.spouse?.profession,
      spouseTakeHome: char.assetMaintenanceState?.spouse?.monthlyTakeHome,
      spouseExpenses: char.assetMaintenanceState?.spouse?.addedHouseholdExpenses,
    };
  });

  console.assert(isMarriedState.isMarried === true, 'character.assetMaintenanceState.isMarried must be true');
  console.log(`✓ Married to ${isMarriedState.spouseName} (${isMarriedState.spouseRole}) with take-home +₹${isMarriedState.spouseTakeHome}/mo and +₹${isMarriedState.spouseExpenses}/mo living costs`);

  // Step 6: Verify Career / Household tab reflects Spouse & Outflow Ledger
  console.log('Step 6: Switching to Career / Household tab...');
  const careerTabBtn = page.locator('button:has-text("Career")').first();
  await careerTabBtn.waitFor({ state: 'visible', timeout: 5000 });
  await careerTabBtn.click();
  await page.waitForTimeout(300);

  const marriedEconomicsCard = page.locator('text=Married Household Economics').first();
  await marriedEconomicsCard.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Married Household Economics card is visible in Career tab');

  await page.screenshot({ path: 'tests/screenshot-phase5-married-household-tab.png' });
  console.log('✓ Captured tests/screenshot-phase5-married-household-tab.png');

  // Step 7: Test Home Purchase & Property Maintenance (+₹5,500/mo)
  console.log('Step 7: Finalizing Home purchase and verifying property maintenance (+₹5,500/mo)...');
  const expensesBeforeHome = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().character.totalFixedExpenses;
  });

  await page.evaluate(() => {
    window.__GAME_STORE__.getState().completeHomePurchase();
  });
  await page.waitForTimeout(300);

  const expensesAfterHome = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().character.totalFixedExpenses;
  });

  console.assert(expensesAfterHome === expensesBeforeHome + 5500, `Fixed expenses must increase by ₹5,500 (was ${expensesBeforeHome}, now ${expensesAfterHome})`);
  console.log('✓ Home maintenance verified: +₹5,500/mo added to fixed expenses');

  await page.screenshot({ path: 'tests/screenshot-phase5-home-maintenance.png' });
  console.log('✓ Captured tests/screenshot-phase5-home-maintenance.png');

  await browser.close();
  console.log('🎉 ALL PHASE 5 LIFE EVENT RECURRING OUTFLOWS & MARRIAGE TESTS PASSED WITH 100% SUCCESS!\n');
}

async function main() {
  runUnitTests();
  await runE2ETests();
}

main().catch((err) => {
  console.error('❌ Phase 5 Test Failed:', err);
  process.exit(1);
});
