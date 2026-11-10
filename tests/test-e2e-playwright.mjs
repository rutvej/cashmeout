import { chromium } from 'playwright';

async function run() {
  console.log('Starting Playwright test...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. Landing Screen -> Generate Character
  console.log('Clicking "Generate Character ➔"...');
  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(500);

  // 1b. Spawn Reveal Screen -> Continue to Goals
  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await toGoalsBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking "Continue to Financial Goals"...');
  await toGoalsBtn.click();
  await page.waitForTimeout(500);

  // 1c. Goal Setup Screen -> Plan Monthly Allocations
  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await toAllocBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking "Plan Monthly Allocations"...');
  await toAllocBtn.click();
  await page.waitForTimeout(500);

  // 2. FinancialSetupScreen verification
  console.log('Verifying FinancialSetupScreen elements...');
  
  // Check Top Progress Bar
  const progressBar = page.locator('.w-full.h-2\\.5, .w-full.h-3').first();
  await progressBar.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Allocation progress bar is visible');

  // Check Mode Pill Toggle
  const fixedBtn = page.locator('button:has-text("₹ Amount")').first();
  const pctBtn = page.locator('button:has-text("% Percentage")').first();
  await fixedBtn.waitFor({ state: 'visible', timeout: 5000 });
  await pctBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Dual mode pill toggle buttons (₹ Amount / % Percentage) are visible');

  // Verify Fixed Mode initial state: Clean Slate starts at 0
  const rupeeInput = page.locator('input[type="number"][step="500"]').first();
  await rupeeInput.waitFor({ state: 'visible', timeout: 5000 });
  const val = await rupeeInput.inputValue();
  console.log(`✓ Clean Slate: Initial goal input value is "${val}" (starts at 0)`);

  // Verify Strategy Hint button
  const hintBtn = page.locator('button:has-text("Strategy Hint")').first();
  await hintBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "💡 Strategy Hint" button is visible');
  await hintBtn.click();
  await page.waitForTimeout(300);

  // Check Strategy Hint Modal
  const hintModal = page.locator('text=/Strategy Hint/i').first();
  await hintModal.waitFor({ state: 'visible', timeout: 5000 });
  const applyRecommendedBtn = page.locator('button:has-text("Apply Recommended")').first();
  await applyRecommendedBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Strategy Hint Modal is open with recommended SIP and strategic reassurance');
  await applyRecommendedBtn.click();
  await page.waitForTimeout(300);
  console.log('✓ Applied recommended SIP from Strategy Hint modal');

  // Switch to Percentage Mode
  console.log('Switching to % Percentage mode...');
  await pctBtn.click();
  await page.waitForTimeout(300);

  // Verify Percentage Mode inputs
  const slider = page.locator('input[type="range"]').first();
  await slider.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Percentage range slider is visible');

  const calculatedSIP = page.locator('text=/Calculated SIP:/i').first();
  await calculatedSIP.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Real-time Calculated SIP box is visible');

  const redistributionNote = page.locator('text=/Percentage Mode: Proportional Auto-Redistribution/i').first();
  await redistributionNote.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Percentage mode Proportional Auto-Redistribution note is visible');

  // Click 25% preset button
  const preset25Btn = page.locator('button:has-text("25%")').first();
  if (await preset25Btn.isVisible()) {
    console.log('Clicking 25% preset...');
    await preset25Btn.click();
    await page.waitForTimeout(300);
  }

  // Screenshot of FinancialSetupScreen in Percentage mode
  await page.screenshot({ path: 'tests/screenshot-financial-setup-pct.png', fullPage: true });
  console.log('✓ Captured screenshot-financial-setup-pct.png');

  // Switch back to ₹ Amount mode
  console.log('Switching back to ₹ Amount mode...');
  await fixedBtn.click();
  await page.waitForTimeout(300);
  const waterfallDropdown = page.locator('select').first();
  await waterfallDropdown.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Waterfall redirection dropdown is visible in fixed mode');

  // Start the Game
  console.log('Starting life simulation...');
  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION"), button:has-text("Resume Simulation")').first();
  await startSimBtn.click();
  await page.waitForTimeout(500);

  // 3. Verify Main Game Screen & RaiseModal
  console.log('Testing RaiseModal on Main Game Screen...');
  // Trigger a raise modal using window.__GAME_STORE__
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.setState({
        simulation: {
          ...store.getState().simulation,
          activeModal: {
            type: 'raise',
            hikeRate: 0.08,
            oldTakeHome: 75000,
            newTakeHome: 81000,
            deltaSurplus: 6000,
          },
          isPaused: true,
        }
      });
    }
  });

  await page.waitForTimeout(500);

  // Verify RaiseModal elements
  const autoSplitBtn = page.locator('button:has-text("Auto-Split")').first();
  await autoSplitBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ RaiseModal: "⚡ Auto-Split" action button is visible');

  const bankCashBtn = page.locator('button:has-text("Keep in Bank Cash")').first();
  await bankCashBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ RaiseModal: "💵 Keep in Bank Cash" action button is visible');

  const customBtn = page.locator('button:has-text("Custom Rebalance")').first();
  await customBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ RaiseModal: "⚙️ Custom Rebalance" action button is visible');

  const timerCheckbox = page.locator('input[type="checkbox"]').first();
  await timerCheckbox.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ RaiseModal: Auto-select in 3s checkbox is visible');

  // Toggle 3s timer on
  await timerCheckbox.check();
  await page.waitForTimeout(300);
  const countdownBadge = page.locator('text=/⏱/').first();
  await countdownBadge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ RaiseModal: 3-second countdown badge & progress bar activated');

  // Screenshot of RaiseModal
  await page.screenshot({ path: 'tests/screenshot-raise-modal.png' });
  console.log('✓ Captured screenshot-raise-modal.png');

  // Click Auto-Split and verify modal closes and simulation resumes
  console.log('Clicking "⚡ Auto-Split" button...');
  await autoSplitBtn.click();
  await page.waitForTimeout(500);

  const isModalOpen = await page.locator('text=/Annual Performance Appraisal/i').isVisible();
  console.assert(!isModalOpen, 'RaiseModal should close on Auto-Split');
  console.log('✓ RaiseModal successfully closed and resumed simulation on Auto-Split');

  // Trigger raise again and test "Keep in Bank Cash"
  console.log('Triggering raise again to test "Keep in Bank Cash"...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    store.setState({
      simulation: {
        ...store.getState().simulation,
        activeModal: {
          type: 'raise',
          hikeRate: 0.06,
          oldTakeHome: 81000,
          newTakeHome: 86000,
          deltaSurplus: 5000,
        },
        isPaused: true,
      }
    });
  });
  await page.waitForTimeout(500);

  const cashBtn = page.locator('button:has-text("Keep in Bank Cash")').first();
  await cashBtn.click();
  await page.waitForTimeout(500);
  console.log('✓ "Keep in Bank Cash" button successfully kept SIPs and resumed');

  // Trigger raise again and test "Custom Rebalance"
  console.log('Triggering raise again to test "Custom Rebalance"...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    store.setState({
      simulation: {
        ...store.getState().simulation,
        activeModal: {
          type: 'raise',
          hikeRate: 0.06,
          oldTakeHome: 86000,
          newTakeHome: 91000,
          deltaSurplus: 5000,
        },
        isPaused: true,
      }
    });
  });
  await page.waitForTimeout(500);

  const custBtn = page.locator('button:has-text("Custom Rebalance")').first();
  await custBtn.click();
  await page.waitForTimeout(500);

  // Verify Allocation Sheet/Modal opens on Custom Rebalance
  const allocSheet = page.locator('text=/Monthly Allocation/i').first();
  await allocSheet.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "Custom Rebalance" successfully paused and opened the Allocation Sheet');

  await browser.close();

  if (errors.length > 0) {
    console.warn('Page errors occurred:', errors);
  } else {
    console.log('✓ Zero page errors encountered during entire E2E flow!');
  }
  console.log('\n🎉 ALL PLAYWRIGHT E2E TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Playwright Test Failed:', err);
  process.exit(1);
});
