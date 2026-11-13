import { chromium } from 'playwright';

async function verifyDeclutteredMainScreen() {
  console.log('🚀 Running visual verification of decluttered MainGameScreen & Voice-Over Demo...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Onboard to MainGameScreen
  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(200);

  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await toGoalsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toGoalsBtn.click();
  await page.waitForTimeout(200);

  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await toAllocBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toAllocBtn.click();
  await page.waitForTimeout(200);

  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION")').first();
  await startSimBtn.waitFor({ state: 'visible', timeout: 5000 });
  await startSimBtn.click();
  await page.waitForTimeout(400);

  // Pause simulation
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().pause();
  });

  // 1. Capture Desktop View of the new decluttered Main Screen
  await page.screenshot({ path: 'tests/screenshot-decluttered-main-desktop.png' });
  console.log('✓ Captured tests/screenshot-decluttered-main-desktop.png');

  // 2. Open Hamburger Menu Drawer
  const menuBtn = page.locator('button:has-text("Menu")').first();
  await menuBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/screenshot-hamburger-drawer.png' });
  console.log('✓ Captured tests/screenshot-hamburger-drawer.png');

  // Close drawer
  const closeBtn = page.locator('button:has-text("✕")').first();
  await closeBtn.click();
  await page.waitForTimeout(300);

  // 3. Open Voice-Over Mobile Demo Tour
  const tourBtn = page.locator('button:has-text("Demo Tour")').first();
  await tourBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screenshot-voiceover-mobile-demo.png' });
  console.log('✓ Captured tests/screenshot-voiceover-mobile-demo.png');

  // 4. Switch to mobile viewport (iPhone 15: 393 x 852) to test real mobile experience
  await page.setViewportSize({ width: 393, height: 852 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screenshot-decluttered-main-mobile-tour.png' });
  console.log('✓ Captured tests/screenshot-decluttered-main-mobile-tour.png');

  await browser.close();
  console.log('🎉 Visual verification completed successfully!');
}

verifyDeclutteredMainScreen().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
