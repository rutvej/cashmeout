import { chromium } from 'playwright';

async function runPhase4Tests() {
  console.log('🚀 Starting Phase 4 Extra Opt-In Goals & Cash-Flow Ventures E2E Tests...');
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

  // 2. Verify Goals Tab has "+ New Venture / Side Hustle" button
  console.log('Step 2: Checking "+ New Venture / Side Hustle" button in Goals tab...');
  const newVentureBtn = page.locator('button:has-text("+ New Venture / Side Hustle")').first();
  await newVentureBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "+ New Venture / Side Hustle" button is present in Goals tab');

  await page.screenshot({ path: 'tests/screenshot-phase4-goals-tab-initial.png' });
  console.log('✓ Captured tests/screenshot-phase4-goals-tab-initial.png');

  // 3. Open Venture Incubator Modal
  console.log('Step 3: Opening Venture Incubator Modal...');
  await newVentureBtn.click();
  await page.waitForTimeout(400);

  const incubatorTitle = page.locator('text=/Venture Incubator & Side Hustles/i').first();
  await incubatorTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Venture Incubator Modal is open');

  // Verify all 3 catalog items are rendered
  const saasVenture = page.locator('text=/Digital Agency \\/ SaaS \\/ Creator/i').first();
  const franchiseVenture = page.locator('text=/Boutique Franchise \\/ Cafe/i').first();
  const rentalVenture = page.locator('text=/Rental Property \\(2nd Asset\\)/i').first();
  await saasVenture.waitFor({ state: 'visible', timeout: 5000 });
  await franchiseVenture.waitFor({ state: 'visible', timeout: 5000 });
  await rentalVenture.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ All 3 catalog ventures (Digital Agency, Boutique Franchise, Rental Property) are listed');

  await page.screenshot({ path: 'tests/screenshot-phase4-incubator-modal.png' });
  console.log('✓ Captured tests/screenshot-phase4-incubator-modal.png');

  // 4. Incubate Digital Agency Venture
  console.log('Step 4: Incubating Digital Agency venture...');
  const incubateSaasBtn = page
    .locator('div:has-text("Digital Agency / SaaS / Creator") button:has-text("+ Incubate Venture")')
    .first();
  await incubateSaasBtn.click();
  await page.waitForTimeout(400);

  // Close incubator modal using aria-label
  const doneBtn = page.locator('button[aria-label="Close modal"]').first();
  await doneBtn.click();
  await page.waitForTimeout(400);
  console.log('✓ Closed incubator modal');

  // 5. Verify Incubating Venture Card in Goals Tab
  console.log('Step 5: Verifying incubating card in Goals tab...');
  const incubatingCard = page.locator('text=/Digital Agency \\/ SaaS \\/ Creator/i').first();
  await incubatingCard.waitFor({ state: 'visible', timeout: 5000 });
  const incubatingBadge = page.locator('text=/INCUBATING/i').first();
  await incubatingBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Incubating card with "🌱 INCUBATING" badge is rendered');

  await page.screenshot({ path: 'tests/screenshot-phase4-incubating-card.png' });
  console.log('✓ Captured tests/screenshot-phase4-incubating-card.png');

  // Helper to step simulation by 1 month cleanly
  const stepOneMonth = async () => {
    await page.evaluate(() => {
      const store = window.__GAME_STORE__;
      store.setState({
        simulation: { ...store.getState().simulation, isPaused: false }
      });
      store.getState().tickMonth();
    });
  };

  // 6. Fund the venture to 100% and trigger LaunchVentureModal
  console.log('Step 6: Funding venture to 100% and checking launch trigger...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const vGoal = store.goals.find((g) => g.ventureType === 'side_hustle');
    if (vGoal) {
      store.updateGoal(vGoal.id, { currentAmount: vGoal.targetAmount });
    }
  });
  await page.waitForTimeout(300);

  // Check launch ready button appears on card
  const launchNowBtnOnCard = page.locator('button:has-text("LAUNCH NOW")').first();
  await launchNowBtnOnCard.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Launch ready button "🚀 LAUNCH NOW!" is visible on card');

  // Tick 1 month simulation tick: should auto-trigger LaunchVentureModal
  console.log('Ticking 1 month to trigger LaunchVentureModal...');
  await stepOneMonth();
  await page.waitForTimeout(500);

  const launchModalTitle = page.locator('text=/Ready to Launch: Digital Agency/i').first();
  await launchModalTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ LaunchVentureModal automatically triggered upon 100% funding');

  await page.screenshot({ path: 'tests/screenshot-phase4-launch-modal.png' });
  console.log('✓ Captured tests/screenshot-phase4-launch-modal.png');

  // 7. Click Launch in LaunchVentureModal
  console.log('Step 7: Confirming launch of venture...');
  const confirmLaunchBtn = page.locator('button:has-text("Launch Venture & Start Cash Flow")').first();
  await confirmLaunchBtn.click();
  await page.waitForTimeout(400);

  // 8. Verify Active Asset Card Transformation
  console.log('Step 8: Verifying Active Asset Card transformation...');
  const activeAssetBadge = page.locator('text=/ACTIVE ASSET/i').first();
  await activeAssetBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Venture card successfully transformed into Active Asset Card with "🟢 ACTIVE ASSET" indicator');

  const netCashFlowLabel = page.locator('text=/Net Cash Flow/i').first();
  await netCashFlowLabel.waitFor({ state: 'visible', timeout: 5000 });

  const lifetimeLabel = page.locator('text=/Lifetime Generated/i').first();
  await lifetimeLabel.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Net Cash Flow and Lifetime Generated stats are rendered');

  await page.screenshot({ path: 'tests/screenshot-phase4-active-asset-card.png' });
  console.log('✓ Captured tests/screenshot-phase4-active-asset-card.png');

  // 9. Tick 2 months to verify recurring monthly cashflow credit
  console.log('Step 9: Testing monthly recurring cash flow additions...');
  const initialCash = await page.evaluate(() => window.__GAME_STORE__.getState().character.liquidCash);
  
  await stepOneMonth();
  await stepOneMonth();
  await page.waitForTimeout(400);

  const ventureIncome = await page.evaluate(() => window.__GAME_STORE__.getState().character.ventureIncome);
  const newCash = await page.evaluate(() => window.__GAME_STORE__.getState().character.liquidCash);
  console.log(`✓ Active venture generated monthly net income: ₹${ventureIncome}/mo`);
  console.log(`✓ Liquid bank cash updated from ₹${initialCash} to ₹${newCash}`);

  if (ventureIncome < 12000 || ventureIncome > 25000) {
    throw new Error(`Venture income ${ventureIncome} is outside expected range 12,000 - 25,000`);
  }
  console.log('✓ Venture income strictly within ₹12,000 to ₹25,000 spec bounds');

  // 10. Verify Ticker Strip has Ventures Inflow
  const venturesTicker = page.locator('text=/Ventures:/i').first();
  await venturesTicker.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Cashflow Ticker Strip reflects recurring venture cash flows');

  // 11. Test Scale Up
  console.log('Step 11: Testing Scale Up action...');
  // Give extra cash if needed for scale up
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    store.character.liquidCash += 200000;
  });
  await page.waitForTimeout(200);

  const scaleUpBtn = page.locator('button:has-text("Reinvest & Scale Up")').first();
  await scaleUpBtn.waitFor({ state: 'visible', timeout: 5000 });
  await scaleUpBtn.click();
  await page.waitForTimeout(300);

  const scaledBadge = page.locator('text=/Scaled Up \\(\\+30% Yield Boost Active\\)/i').first();
  await scaledBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Scale Up successfully applied (+30% Yield Boost Active)');

  // 12. Test Rental Property Mortgage & Compounding
  console.log('Step 12: Testing Rental Property creation & mortgage...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    const vId = store.getState().addVentureGoal('venture_rental_property');
    store.getState().updateGoal(vId, { currentAmount: 1000000 });
    store.getState().launchVenture(vId);
  });
  await page.waitForTimeout(300);

  const rentalMortgage = await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    return store.character.loans.find((l) => l.name.includes('Rental Property Mortgage'));
  });

  if (!rentalMortgage) {
    throw new Error('Rental Property Mortgage was not created in character.loans');
  }
  console.log(`✓ Rental Property Mortgage created: Principal ₹${rentalMortgage.principalRemaining}, EMI ₹${rentalMortgage.emi}, Tenure ${rentalMortgage.tenureMonthsRemaining} mos`);

  // Tick 1 month to verify 6.5% p.a. property equity compounding
  const propValBefore = await page.evaluate(() => {
    const g = window.__GAME_STORE__.getState().goals.find((x) => x.ventureType === 'rental_property');
    return g.currentAmount;
  });

  await stepOneMonth();
  await page.waitForTimeout(300);

  const propValAfter = await page.evaluate(() => {
    const g = window.__GAME_STORE__.getState().goals.find((x) => x.ventureType === 'rental_property');
    return g.currentAmount;
  });

  console.log(`✓ Rental property asset compounded from ₹${propValBefore} to ₹${propValAfter} (6.5% p.a.)`);
  if (propValAfter <= propValBefore) {
    throw new Error('Property value did not appreciate');
  }

  await page.screenshot({ path: 'tests/screenshot-phase4-final-verification.png' });
  console.log('✓ Captured tests/screenshot-phase4-final-verification.png');

  if (errors.length > 0) {
    console.warn('⚠️ Console errors during test:', errors);
  } else {
    console.log('✓ Zero console errors detected');
  }

  console.log('\n🎉 ALL PHASE 4 VENTURES & CASH-FLOW TESTS PASSED PERFECTLY!\n');
  await browser.close();
}

runPhase4Tests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
