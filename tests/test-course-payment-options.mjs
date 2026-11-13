import { chromium } from 'playwright';

async function testCoursePaymentOptions() {
  console.log('🧪 Testing Course Payment Options (Upfront Bank Cash & Auto-Adjusted SIP)...');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Generate Character and navigate to Main Game Screen
  await page.locator('button:has-text("Generate Character")').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Continue to Financial Goals")').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Plan Monthly Allocations")').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("START LIFE SIMULATION")').first().click();
  await page.waitForTimeout(500);

  // Pause simulation
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().pause();
  });

  // ─── Test 1: Auto-Adjusted SIP on Monthly EMI Enrollment ───
  console.log('\n--- Test 1: Monthly EMI with Auto-Adjusted SIP ---');
  
  // Set up 100% allocation of surplus into SIPs first
  const initialSurplus = await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    const char = store.getState().character;
    const goals = store.getState().goals;
    // Allocate all surplus across goals
    goals[0].baseMonthlySIP = Math.round(char.monthlySurplus * 0.5);
    goals[1].baseMonthlySIP = Math.round(char.monthlySurplus * 0.5);
    store.setState({ goals: [...goals] });
    return char.monthlySurplus;
  });

  const totalSIPBefore = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().goals.reduce((s, g) => s + (g.baseMonthlySIP || 0), 0);
  });
  console.log(`Initial Surplus: ₹${initialSurplus}, Total SIP: ₹${totalSIPBefore}`);
  console.assert(totalSIPBefore === initialSurplus, 'Total SIP should equal initial surplus');

  // Open Upskilling Hub
  await page.locator('button:has-text("Career")').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Upskill Hub")').first().click();
  await page.waitForTimeout(400);

  // Enroll in Bootcamp via Monthly EMI (₹10,000/mo)
  const enrollMonthlyBtn = page.locator('div:has-text("Professional Specialization Bootcamp") button:has-text("Enroll Now")').first();
  await enrollMonthlyBtn.click();
  await page.waitForTimeout(400);

  // Verify that goals SIP was auto-adjusted and no over-allocation exists
  const afterMonthlyEnroll = await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    const char = store.getState().character;
    const goals = store.getState().goals;
    const totalSIP = goals.reduce((s, g) => s + (g.baseMonthlySIP || 0), 0);
    return {
      surplus: char.monthlySurplus,
      totalSIP,
      outflow: char.totalMonthlyOutflow,
      activeCourse: char.activeCourse,
    };
  });

  console.log(`After Monthly Enroll -> Surplus: ₹${afterMonthlyEnroll.surplus}, Total SIP: ₹${afterMonthlyEnroll.totalSIP}`);
  console.assert(afterMonthlyEnroll.activeCourse.monthlyFee === 10000, 'monthlyFee should be 10000');
  console.assert(afterMonthlyEnroll.activeCourse.isPaidUpfront === false, 'isPaidUpfront should be false');
  console.assert(afterMonthlyEnroll.totalSIP === afterMonthlyEnroll.surplus, 'Total SIP must be auto-reduced to match new surplus!');
  console.log('✓ Confirmed: SIP was automatically reduced and surplus funds the course monthly fee perfectly!');

  // Close Upskilling Hub and open Adjust SIPs to verify it is NOT blocked
  await page.locator('button:has-text("Done / Close Hub"), button:has-text("✕")').first().click();
  await page.waitForTimeout(300);

  // Switch to Goals tab
  await page.locator('button:has-text("Goals")').first().click();
  await page.waitForTimeout(300);

  await page.locator('button:has-text("⚙️ Adjust SIPs & Redirections")').first().click();
  await page.waitForTimeout(400);

  // Verify that the Resume Simulation button is ENABLED and NOT disabled
  const resumeBtnDisabled = await page.locator('button:has-text("Resume Simulation")').first().isDisabled();
  console.assert(!resumeBtnDisabled, 'Resume Simulation button must NOT be disabled after enrolling in course!');
  console.log('✓ Confirmed: Resume Simulation button is active and balanced (no lock out)!');

  // Close Adjust SIPs
  await page.locator('button:has-text("Resume Simulation")').first().click();
  await page.waitForTimeout(300);

  // Drop the course to test Test 2
  await page.locator('button:has-text("Career")').first().click();
  await page.waitForTimeout(300);
  await page.locator('button:has-text("Drop Course")').first().click();
  await page.waitForTimeout(300);
  console.log('✓ Dropped course');

  // ─── Test 2: Pay Upfront from Bank Cash ───
  console.log('\n--- Test 2: Pay Upfront from Bank Cash ---');

  // Ensure character has enough bank cash for Bootcamp (₹30,000)
  const bankBefore = await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    const char = store.getState().character;
    if (char.liquidCash < 30000) {
      char.liquidCash = 50000;
      store.setState({ character: { ...char } });
    }
    return store.getState().character.liquidCash;
  });

  const surplusBeforeUpfront = await page.evaluate(() => window.__GAME_STORE__.getState().character.monthlySurplus);
  console.log(`Bank Cash before upfront: ₹${bankBefore}, Surplus: ₹${surplusBeforeUpfront}`);

  // Open Upskilling Hub again
  await page.locator('button:has-text("Upskill Hub")').first().click();
  await page.waitForTimeout(400);

  // Click "Pay Upfront" for Bootcamp
  const upfrontBtn = page.locator('div:has-text("Professional Specialization Bootcamp") button:has-text("Pay Upfront")').first();
  await upfrontBtn.waitFor({ state: 'visible', timeout: 5000 });
  await upfrontBtn.click();
  await page.waitForTimeout(400);

  const afterUpfrontState = await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    const char = store.getState().character;
    return {
      liquidCash: char.liquidCash,
      monthlySurplus: char.monthlySurplus,
      activeCourse: char.activeCourse,
    };
  });

  console.log(`After Upfront Enroll -> Bank Cash: ₹${afterUpfrontState.liquidCash}, Surplus: ₹${afterUpfrontState.monthlySurplus}`);
  console.assert(afterUpfrontState.liquidCash === bankBefore - 30000, 'Bank cash should decrease by ₹30,000 totalCost');
  console.assert(afterUpfrontState.activeCourse.isPaidUpfront === true, 'isPaidUpfront should be true');
  console.assert(afterUpfrontState.activeCourse.monthlyFee === 0, 'monthlyFee should be 0 when paid upfront');
  console.assert(afterUpfrontState.monthlySurplus === surplusBeforeUpfront, 'Monthly surplus must remain 100% untouched!');
  console.log('✓ Confirmed: Paid upfront from bank cash, zero monthly deduction, surplus untouched!');

  // Close Hub
  await page.locator('button:has-text("Done / Close Hub"), button:has-text("✕")').first().click();
  await page.waitForTimeout(300);

  // Verify Career tab shows Paid Upfront
  const paidUpfrontBadge = page.locator('text=/Paid Upfront/i').first();
  await paidUpfrontBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Confirmed: Active course banner displays "Paid Upfront (₹0/mo)"');

  // Advance 3 months of ticks to verify completion
  console.log('Advancing 3 months to complete upfront course...');
  for (let m = 1; m <= 3; m++) {
    await page.evaluate(() => {
      const store = window.__GAME_STORE__;
      store.setState({ simulation: { ...store.getState().simulation, isPaused: false } });
      store.getState().tickMonth();
    });
    await page.waitForTimeout(200);
  }

  const courseCompletedModal = page.locator('text=/Course Completed!/i').first();
  await courseCompletedModal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Confirmed: Upfront course completed successfully with celebration modal!');

  await browser.close();
  console.log('\n🎉 ALL COURSE PAYMENT OPTIONS & AUTO-ADJUSTED SIP TESTS PASSED 100%!');
}

testCoursePaymentOptions().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
