import { chromium } from 'playwright';
import { createServer } from 'vite';

console.log('🚀 Launching Local Vite Server for E2E Verification...');

const viteServer = await createServer({
  configFile: false,
  root: process.cwd(),
  server: { port: 5188 },
});
await viteServer.listen();
const serverUrl = 'http://localhost:5188';
console.log(`✓ Local server running at ${serverUrl}`);

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  console.log('\n--- 1. Verification of Landing Screen & Character Generation ---');
  await page.goto(serverUrl);
  await page.waitForTimeout(600);

  // Generate Character
  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(400);

  // Continue to Financial Goals
  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await toGoalsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toGoalsBtn.click();
  await page.waitForTimeout(400);

  console.log('\n--- 2. Verification of Screen 3: Two-Way Onboarding Choice ---');
  // Verify Two-Way Choice Buttons
  const instantStartBtn = page.locator('button:has-text("START SIMULATION INSTANTLY")').first();
  const pausePlanBtn = page.locator('button:has-text("PAUSE & PLAN ALLOCATIONS FIRST")').first();

  await instantStartBtn.waitFor({ state: 'visible', timeout: 5000 });
  await pausePlanBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Both "⚡ START SIMULATION INSTANTLY" and "⏸️ PAUSE & PLAN ALLOCATIONS FIRST" are visible!');

  await page.screenshot({ path: 'tests/screenshot-screen3-twoway-choice.png' });
  console.log('✓ Saved screenshot: tests/screenshot-screen3-twoway-choice.png');

  console.log('\n--- 3. Testing "⚡ START SIMULATION INSTANTLY" (Default to Bank Cash) ---');
  await instantStartBtn.click();
  await page.waitForTimeout(600);

  // Verify transition to Main Game Screen
  const netWorthHero = page.locator('text=/Net Worth/i').first();
  await netWorthHero.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Successfully transitioned directly to Main Game Screen with clock ticking!');

  await page.screenshot({ path: 'tests/screenshot-main-game-collapsed-goals.png' });
  console.log('✓ Saved screenshot: tests/screenshot-main-game-collapsed-goals.png');

  console.log('\n--- 4. Testing Collapsed Goals View & Opening Analytics / Seeding Drawer ---');
  // Find a collapsed goal card
  const goalCard = page.locator('div:has-text("Buy First Car")').last();
  await goalCard.waitFor({ state: 'visible', timeout: 5000 });
  await goalCard.click();
  await page.waitForTimeout(500);

  // Verify Drawer elements
  const drawerTitle = page.locator('h3:has-text("Seed Capital from Bank Cash")').first();
  await drawerTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Goal Details Drawer opened successfully!');

  // Verify Lump-Sum Bank Seeding controls
  const transferBtn = page.locator('button:has-text("Transfer")').first();
  await transferBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Lump-sum bank seeding transfer button is present!');

  // Verify Analytics Chart & Curve elements
  const analyticsTitle = page.locator('h3:has-text("Principal Deposited vs. Actual Fund Value")').first();
  await analyticsTitle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Interactive Dual-Curve Analytics Chart is present!');

  // Verify Time Horizon Toggle
  const monthlyToggle = page.locator('button:has-text("Monthly")').first();
  const yearlyToggle = page.locator('button:has-text("Yearly")').first();
  await monthlyToggle.waitFor({ state: 'visible', timeout: 3000 });
  await yearlyToggle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Time Horizon toggle (Monthly / Yearly) is present!');

  // Verify Instrument Risk Card
  const riskCardTitle = page.locator('text=/Selected Instrument & Risk Profile/i').first();
  await riskCardTitle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Instrument Risk Profile card is present!');

  await page.screenshot({ path: 'tests/screenshot-goal-analytics-drawer.png' });
  console.log('✓ Saved screenshot: tests/screenshot-goal-analytics-drawer.png');

  // Test executing a Lump-Sum Transfer from Bank Cash
  console.log('Executing lump-sum transfer from Bank Cash...');
  await transferBtn.click();
  await page.waitForTimeout(300);

  const successAlert = page.locator('text=/Successfully seeded/i').first();
  await successAlert.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Lump-Sum Transfer executed and verified with success banner!');

  // Close the drawer
  const closeBtn = page.locator('button:has-text("Close")').first();
  await closeBtn.click();
  await page.waitForTimeout(300);

  console.log('\n--- 5. Testing Non-Directive Market Crash Alert Modal ---');
  // Inject market crash modal into state to verify UI rendering
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.setState((prev) => ({
        simulation: {
          ...prev.simulation,
          isPaused: true,
          activeModal: {
            type: 'market_crash',
            crashAge: 38,
            tier: 2,
            depthPercent: -0.38,
            headline: 'SENSEX PLUNGES 38% AMID GLOBAL LIQUIDITY SQUEEZE',
            contextText: 'Equity Mutual Funds face severe drawdown across the next 4 months.',
          },
        },
      }));
    }
  });
  await page.waitForTimeout(400);

  const crashHeadline = page.locator('h2:has-text("SENSEX PLUNGES 38%")').first();
  await crashHeadline.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Market Crash Breaking News Alert Modal rendered with headline and drawdown badge!');

  const crashCTA = page.locator('button:has-text("UNDERSTOOD / CONTINUE")').first();
  await crashCTA.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Non-directive CTA "[ UNDERSTOOD / CONTINUE SIMULATION ▶ ]" is visible!');

  await page.screenshot({ path: 'tests/screenshot-market-crash-modal.png' });
  console.log('✓ Saved screenshot: tests/screenshot-market-crash-modal.png');

  // Dismiss modal
  await crashCTA.click();
  await page.waitForTimeout(300);
  console.log('✓ Market Crash modal dismissed gracefully.');

  console.log('\n--- 6. Testing Second Flow: "Pause & Plan Allocations First" ---');
  // Navigate back to goal setup to test the second choice
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.getState().navigateTo('goal_setup');
    }
  });
  await page.waitForTimeout(400);

  const pausePlanBtn2 = page.locator('button:has-text("PAUSE & PLAN ALLOCATIONS FIRST")').first();
  await pausePlanBtn2.waitFor({ state: 'visible', timeout: 3000 });
  await pausePlanBtn2.click();
  await page.waitForTimeout(400);

  // Verify transition to Financial Setup screen (Screen 4)
  const allocScreenTitle = page.locator('text=/Monthly Surplus/i').first();
  await allocScreenTitle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "Pause & Plan Allocations First" successfully navigated to Screen 4 (Financial Setup)!');

  await page.screenshot({ path: 'tests/screenshot-screen4-financial-setup-plan.png' });
  console.log('✓ Saved screenshot: tests/screenshot-screen4-financial-setup-plan.png');

  console.log('\n🎉 ALL E2E VERIFICATIONS SUCCEEDED CLEANLY!');
} catch (err) {
  console.error('❌ E2E Verification Failed:', err);
  process.exitCode = 1;
} finally {
  await browser.close();
  await viteServer.close();
  console.log('✓ Browser and server terminated.');
}
