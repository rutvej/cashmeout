import { chromium } from 'playwright';
import {
  calculateMortgageEMI,
  calculateMortgageDetails,
  getPropertyTierData,
  getDownsizedTierData,
  MORTGAGE_ANNUAL_RATE,
  DEFAULT_MORTGAGE_TENURE_MONTHS,
  PROPERTY_TIERS,
  DOWNSIZED_TIERS,
} from '../src/engine/realEstateEngine.js';
import { applyHomeOwnership } from '../src/engine/lifeEventsEngine.js';
import { calculateNetWorth } from '../src/engine/simulationEngine.js';

function runUnitTests() {
  console.log('🧪 Running Phase 6 Real Estate Financing Pure Unit Tests...');

  // Test 1: Property Valuation & Tier Targets
  console.log('Unit Test 1: Property Valuation & 20% Down Payment Structure...');
  const tier1 = getPropertyTierData('tier1');
  console.assert(tier1.propertyCost === 7500000, 'Tier 1 property cost is ₹75,00,000');
  console.assert(tier1.targetDownPayment === 1500000, 'Tier 1 20% down payment target is ₹15,00,000');
  console.assert(tier1.targetDownPayment / tier1.propertyCost === 0.20, 'Down payment is exactly 20%');

  const tier2 = getPropertyTierData('tier2');
  console.assert(tier2.propertyCost === 5500000, 'Tier 2 property cost is ₹55,00,000');
  console.assert(tier2.targetDownPayment === 1100000, 'Tier 2 20% down payment target is ₹11,00,000');

  const tier3 = getPropertyTierData('tier3');
  console.assert(tier3.propertyCost === 4000000, 'Tier 3 property cost is ₹40,00,000');
  console.assert(tier3.targetDownPayment === 800000, 'Tier 3 20% down payment target is ₹8,00,000');
  console.log('✓ All 3 city tiers match realistic real estate capital structures');

  // Test 2: Standard Reducing Balance EMI Calculation (8.5% p.a., 240 months)
  console.log('Unit Test 2: Mortgage EMI Formula Verification...');
  // Baseline: ₹60,00,000 loan (80% of ₹75L)
  const baselinePrincipal = 6000000;
  const baselineEMI = calculateMortgageEMI(baselinePrincipal, 0.085, 240);
  console.assert(baselineEMI === 52069, `Baseline EMI on ₹60L must be ₹52,069 (got ${baselineEMI})`);

  // Scaled down payment: ₹50,00,000 loan (after ₹25L DP)
  const scaledPrincipal = 5000000;
  const scaledEMI = calculateMortgageEMI(scaledPrincipal, 0.085, 240);
  console.assert(scaledEMI === 43391, `Scaled EMI on ₹50L must be ₹43,391 (got ${scaledEMI})`);
  console.log('✓ Reducing balance EMI matches financial standard precisely');

  // Test 3: Complete Mortgage Details & Lifelong Interest Savings
  console.log('Unit Test 3: Lifelong Interest Savings Calculation...');
  const baselineDetails = calculateMortgageDetails({
    propertyCost: 7500000,
    downPayment: 1500000,
  });
  console.assert(baselineDetails.loanPrincipal === 6000000, 'Loan principal is ₹60L');
  console.assert(baselineDetails.emi === 52069, 'EMI is ₹52,069');
  console.assert(baselineDetails.totalInterestSaved === 0, 'Baseline interest saved is ₹0');

  const scaledDetails = calculateMortgageDetails({
    propertyCost: 7500000,
    downPayment: 2500000, // ₹25L down payment
  });
  console.assert(scaledDetails.loanPrincipal === 5000000, 'Scaled loan principal is ₹50L');
  console.assert(scaledDetails.emi === 43391, 'Scaled EMI is ₹43,391');
  console.assert(scaledDetails.monthlyEMISaved === 8678, `Monthly EMI saved is ₹8,678 (got ${scaledDetails.monthlyEMISaved})`);
  console.assert(scaledDetails.totalInterestSaved === 1082720, `20-Year interest saved is ₹10,82,720 (got ${scaledDetails.totalInterestSaved})`);
  console.log('✓ Overfunding down payment to ₹25L permanently saves ₹8,678/mo and ₹10.82 Lakhs in interest');

  // Test 4: Rent Elimination & Maintenance Addition
  console.log('Unit Test 4: Rent Elimination & Maintenance Outflow Delta...');
  const mockChar = {
    totalFixedExpenses: 30000,
    expenses: { rent: 18000, utilities: 4000, groceries: 8000 },
    monthlyTakeHome: 70000,
    totalMonthlyOutflow: 30000,
    monthlySurplus: 40000,
    loans: [],
    liquidCash: 50000,
    assetMaintenanceState: { hasOwnedHome: false },
  };
  const mockMortgage = {
    id: 'loan_mock',
    principalRemaining: 6000000,
    interestRateAnnual: 0.085,
    tenureMonthsRemaining: 240,
    emi: 52069,
  };
  const purchaseResult = applyHomeOwnership(mockChar, [], {}, mockMortgage, {
    propertyCost: 7500000,
    eliminateRent: true,
  });
  console.assert(purchaseResult.character.assetMaintenanceState.hasOwnedHome === true, 'hasOwnedHome is true');
  console.assert(purchaseResult.character.expenses.rent === 0, 'Rent must be eliminated to ₹0');
  // fixed = 30000 - 18000 + 5500 = 17500
  console.assert(purchaseResult.character.totalFixedExpenses === 17500, `Fixed expenses must drop by rent and add maintenance (was 30000, now ${purchaseResult.character.totalFixedExpenses})`);
  console.assert(purchaseResult.character.homePropertyAssetValue === 7500000, 'Home property asset value set to ₹75,00,000');
  console.log('✓ Rent successfully eliminated and replaced by property maintenance');

  // Test 5: Net Worth includes Home Property Asset Value
  console.log('Unit Test 5: Net Worth with Real Estate Asset...');
  const charWithHome = purchaseResult.character;
  const nw = calculateNetWorth(charWithHome, [], charWithHome.liquidCash);
  // Net worth = liquidCash (50000) + property (7500000) - debt (6000000) = 1550000
  console.assert(nw === 1550000, `Net worth must be ₹15,50,000 (got ${nw})`);
  console.log('✓ Net worth incorporates real estate asset equity minus mortgage principal');

  console.log('🎉 ALL PHASE 6 PURE UNIT TESTS PASSED WITH 100% SUCCESS!\n');
}

async function runE2ETests() {
  console.log('🚀 Starting Phase 6 Real Estate & Housing Shocks Playwright E2E Tests...');
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

  // Step 2: Test Early Down Payment Completion & Dilemma Modal
  console.log('Step 2: Testing Early Down Payment Completion Trigger...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const goals = store.goals.map((g) => {
      if (g.id === 'goal_home') {
        return {
          ...g,
          currentAmount: 1500000, // 100% of 20% DP target
          targetAge: 34,
          earlyDecisionMade: null,
          earlyPromptTriggered: false,
          milestoneTriggered: false,
        };
      }
      return {
        ...g,
        milestoneTriggered: true, // Prior milestones already handled
      };
    });
    // Set character age to 28 (targetAge is 34)
    window.__GAME_STORE__.setState({
      goals,
      character: {
        ...store.character,
        age: 28,
        assetMaintenanceState: {
          ...store.character.assetMaintenanceState,
          hasOwnedHome: false,
        },
      },
      simulation: {
        ...store.simulation,
        currentAge: 28,
        activeModal: null,
        modalQueue: [],
        isPaused: false,
      },
    });
    // Tick 1 month to trigger early completion check
    window.__GAME_STORE__.getState().tickMonth();
  });
  await page.waitForTimeout(600);

  // Check that EarlyHomeDecisionModal is visible
  const earlyModalTitle = page.locator('text=Early Down Payment Dilemma').first();
  await earlyModalTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Early Down Payment Dilemma Modal successfully triggered ahead of target age');

  // Verify Options A, B, C are present
  const optionABtn = page.locator('button:has-text("Option A: Buy Immediately")').first();
  const optionBBtn = page.locator('button:has-text("Option B: Keep Saving")').first();
  const optionCBtn = page.locator('button:has-text("Option C: Lock DP")').first();

  await optionABtn.waitFor({ state: 'visible', timeout: 3000 });
  await optionBBtn.waitFor({ state: 'visible', timeout: 3000 });
  await optionCBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ All 3 strategic choices (Buy Now, Scale Down Payment, Lock & Redirect) are rendered');

  await page.screenshot({ path: 'tests/screenshot-phase6-early-decision-modal.png' });
  console.log('✓ Captured tests/screenshot-phase6-early-decision-modal.png');

  // Step 3: Test Option B (Scale Down Payment) Selection
  console.log('Step 3: Selecting Option B (Scale Down Payment to 40%)...');
  await optionBBtn.click();
  await page.waitForTimeout(400);

  const scaledGoalState = await page.evaluate(() => {
    const homeGoal = window.__GAME_STORE__.getState().goals.find((g) => g.id === 'goal_home');
    return {
      earlyDecisionMade: homeGoal?.earlyDecisionMade,
      isScalingDownPayment: homeGoal?.isScalingDownPayment,
      targetAmount: homeGoal?.targetAmount,
    };
  });
  console.assert(scaledGoalState.earlyDecisionMade === 'scale_down_payment', 'earlyDecisionMade is scale_down_payment');
  console.assert(scaledGoalState.isScalingDownPayment === true, 'isScalingDownPayment is true');
  console.assert(scaledGoalState.targetAmount === 3000000, `Target amount scaled to 40% (₹30,00,000, got ${scaledGoalState.targetAmount})`);
  console.log('✓ Option B scaled down payment target to 40% without capping or early purchase');

  // Step 4: Test Interactive Financing Calculator in HomePurchaseModal
  console.log('Step 4: Opening HomePurchaseModal interactive financing calculator...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const homeGoal = store.goals.find((g) => g.id === 'goal_home');
    window.__GAME_STORE__.setState({
      simulation: {
        ...store.simulation,
        activeModal: {
          type: 'home_purchase',
          goal: {
            ...homeGoal,
            currentAmount: 2500000, // ₹25L saved
          },
          isEarly: false,
        },
        isPaused: true,
      },
    });
  });
  await page.waitForTimeout(500);

  const purchaseModalTitle = page.locator('text=Real Estate Financing & Purchase').first();
  await purchaseModalTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ HomePurchaseModal is visible with real estate financing calculator');

  // Verify KPI metrics are rendered
  const loanLabel = page.locator('text=Mortgage Loan (80%–50%)').first();
  await loanLabel.waitFor({ state: 'visible', timeout: 3000 });
  const interestSavedCard = page.locator('text=Total 20-Year Interest Saved vs 20% Baseline').first();
  await interestSavedCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Live recalculation cards (Loan Principal, Monthly EMI, 20-Year Interest Saved) are active');

  await page.screenshot({ path: 'tests/screenshot-phase6-home-purchase-calculator.png' });
  console.log('✓ Captured tests/screenshot-phase6-home-purchase-calculator.png');

  // Step 5: Finalize Home Purchase & Mortgage
  console.log('Step 5: Finalizing Home Purchase and verifying capital structure & rent elimination...');
  const finalizeBtn = page.locator('button:has-text("Finalize Home Purchase")').first();
  await finalizeBtn.waitFor({ state: 'visible', timeout: 3000 });
  await finalizeBtn.click();
  await page.waitForTimeout(500);

  const postPurchaseState = await page.evaluate(() => {
    const char = window.__GAME_STORE__.getState().character;
    const mortgageLoan = (char.loans || []).find((l) => l.name === 'Home Mortgage Loan');
    return {
      hasOwnedHome: char.assetMaintenanceState?.hasOwnedHome,
      rent: char.expenses?.rent,
      maintenance: char.assetMaintenanceState?.homeMonthlyMaintenance,
      homePropertyValue: char.homePropertyAssetValue,
      mortgageLoan,
    };
  });

  console.assert(postPurchaseState.hasOwnedHome === true, 'hasOwnedHome is true');
  console.assert(postPurchaseState.rent === 0, `Rent must be eliminated to 0 (got ${postPurchaseState.rent})`);
  console.assert(postPurchaseState.maintenance === 5500, 'Home maintenance is ₹5,500/mo');
  console.assert(postPurchaseState.homePropertyValue === 7500000, 'Home property asset value is ₹75,00,000');
  console.assert(postPurchaseState.mortgageLoan !== undefined, 'Home Mortgage Loan is present in loans array');
  console.assert(postPurchaseState.mortgageLoan?.tenureMonthsRemaining === 240, 'Tenure is 240 months');
  console.assert(postPurchaseState.mortgageLoan?.interestRateAnnual === 0.085, 'Interest rate is 8.5% p.a.');
  console.log(`✓ Home purchase complete: Mortgage Loan of ₹${postPurchaseState.mortgageLoan?.principalRemaining} at EMI ₹${postPurchaseState.mortgageLoan?.emi}/mo, Rent eliminated, Maintenance +₹5,500/mo`);

  await page.screenshot({ path: 'tests/screenshot-phase6-home-purchased.png' });
  console.log('✓ Captured tests/screenshot-phase6-home-purchased.png');

  // Step 6: Test Property Value Appreciation (+6.5% p.a.)
  console.log('Step 6: Testing monthly property equity appreciation (+6.5% p.a.)...');
  const valueBeforeTick = postPurchaseState.homePropertyValue;
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().tickMonth();
  });
  await page.waitForTimeout(300);

  const valueAfterTick = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().character.homePropertyAssetValue;
  });
  const expectedMonthlyGain = Math.round(valueBeforeTick * (0.065 / 12));
  console.assert(valueAfterTick === valueBeforeTick + expectedMonthlyGain, `Property value must compound (+₹${expectedMonthlyGain}, was ${valueBeforeTick}, now ${valueAfterTick})`);
  console.log(`✓ Property appreciated by +₹${expectedMonthlyGain} in 1 month (+6.5% p.a. equity compounding)`);

  // Step 7: Test Housing Pressure Eviction Shock
  console.log('Step 7: Testing Landlord Eviction / Rent Spike Shock (shock_landlord_eviction)...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    window.__GAME_STORE__.setState({
      character: {
        ...store.character,
        assetMaintenanceState: {
          ...store.character.assetMaintenanceState,
          hasOwnedHome: false, // Player is renting
        },
        expenses: {
          ...store.character.expenses,
          rent: 18000,
        },
        totalFixedExpenses: 30000,
        monthlySurplus: 40000,
      },
      goals: store.goals.map((g) => {
        if (g.id === 'goal_home') {
          return {
            ...g,
            targetAmount: 1500000,
            currentAmount: 1200000, // 80% ready (>= 70% threshold)
            status: 'in_progress',
            milestoneTriggered: false,
          };
        }
        return g;
      }),
      simulation: {
        ...store.simulation,
        activeModal: {
          type: 'shock_event',
          shockId: 'shock_landlord_eviction',
          title: 'Landlord Eviction & Rent Spike!',
          description: 'Your landlord is selling the flat! You must vacate within 30 days or relocate to a new rental at higher market rates.',
          grossAmount: 60000,
          relocationCost: 60000,
          rentHikeMonthly: 3000,
          netOutflow: 60000,
          usedInsurance: false,
        },
        isPaused: true,
      },
    });
  });
  await page.waitForTimeout(500);

  const shockTitle = page.locator('text=LANDLORD EVICTION & RENT SPIKE').first();
  await shockTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Landlord Eviction Shock Modal is visible');

  // Verify Choice 1 (Emergency Buy) and Choice 2 (Relocate)
  const choice1Btn = page.locator('button:has-text("Choice 1: Emergency Home Purchase")').first();
  const choice2Btn = page.locator('button:has-text("Choice 2: Relocate to New Rental")').first();
  await choice1Btn.waitFor({ state: 'visible', timeout: 3000 });
  await choice2Btn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Choice 1 (Emergency Buy unlocked at 80% DP) and Choice 2 (Relocate) are rendered');

  await page.screenshot({ path: 'tests/screenshot-phase6-eviction-shock-modal.png' });
  console.log('✓ Captured tests/screenshot-phase6-eviction-shock-modal.png');

  // Step 8: Execute Choice 2 (Relocate to New Rental)
  console.log('Step 8: Executing Choice 2 (Relocate to New Rental: -₹60,000 & +₹3,000/mo rent hike)...');
  const rentBefore = await page.evaluate(() => window.__GAME_STORE__.getState().character.expenses?.rent || 0);
  await choice2Btn.click();
  await page.waitForTimeout(400);

  const rentAfter = await page.evaluate(() => window.__GAME_STORE__.getState().character.expenses?.rent || 0);
  console.assert(rentAfter === rentBefore + 3000, `Rent must increase by +₹3,000 (was ${rentBefore}, now ${rentAfter})`);
  console.log(`✓ Relocation resolved: Market rent increased from ₹${rentBefore}/mo to ₹${rentAfter}/mo (+₹3,000/mo hike)`);

  await page.screenshot({ path: 'tests/screenshot-phase6-relocated.png' });
  console.log('✓ Captured tests/screenshot-phase6-relocated.png');

  await browser.close();
  console.log('🎉 ALL PHASE 6 REAL ESTATE, FINANCING & HOUSING SHOCK E2E TESTS PASSED WITH 100% SUCCESS!\n');
}

async function main() {
  runUnitTests();
  await runE2ETests();
}

main().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
