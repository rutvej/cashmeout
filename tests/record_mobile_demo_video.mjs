import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RECORDINGS_DIR = '/tmp/cashmeout_mobile_raw_recordings';
if (fs.existsSync(RECORDINGS_DIR)) {
  fs.rmSync(RECORDINGS_DIR, { recursive: true, force: true });
}
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

const AUDIO_DIR = '/tmp/cashmeout_mobile_audio';
const META_FILE = path.join(AUDIO_DIR, 'scenes_meta.json');
if (!fs.existsSync(META_FILE)) {
  throw new Error(`scenes_meta.json not found at ${META_FILE}`);
}
const metaData = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
const SCENES = metaData.scenes;
const MASTER_SOUNDTRACK = path.join(AUDIO_DIR, 'master_soundtrack.mp3');

console.log(`Loaded ${SCENES.length} scenes metadata from scenes_meta.json`);
console.log(`Total narration + soundtrack duration: ${metaData.master_soundtrack_duration.toFixed(2)}s`);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordMobileDemo() {
  console.log('🎥 Launching Playwright with 1:1 Mobile Viewport (430x932 iPhone 15 Pro Max)...');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1:1 mobile viewport without scaling or letterboxing
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 430, height: 932 },
    },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // Inject subtle, minimalist iOS-style touch ripple (No subtitle box, no HUD overlay!)
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const touch = document.createElement('div');
      touch.id = 'clean-touch-pointer';
      touch.style.position = 'fixed';
      touch.style.width = '24px';
      touch.style.height = '24px';
      touch.style.borderRadius = '50%';
      touch.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
      touch.style.border = '2px solid rgba(255, 255, 255, 0.9)';
      touch.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.35)';
      touch.style.pointerEvents = 'none';
      touch.style.zIndex = '9999999';
      touch.style.transition = 'transform 0.12s ease-out, background-color 0.12s ease';
      touch.style.transform = 'translate(-50%, -50%) scale(1)';
      touch.style.display = 'none';
      document.body.appendChild(touch);

      document.addEventListener('mousemove', (e) => {
        touch.style.display = 'block';
        touch.style.left = e.clientX + 'px';
        touch.style.top = e.clientY + 'px';
      });

      document.addEventListener('mousedown', () => {
        touch.style.transform = 'translate(-50%, -50%) scale(0.75)';
        touch.style.backgroundColor = 'rgba(56, 189, 248, 0.65)';
        touch.style.borderColor = '#38bdf8';
      });

      document.addEventListener('mouseup', () => {
        touch.style.transform = 'translate(-50%, -50%) scale(1)';
        touch.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
        touch.style.borderColor = 'rgba(255, 255, 255, 0.9)';
      });
    });
  });

  // Spotlight helper (subtle focus halo without altering layout)
  async function focusElement(locator, durationMs = 1500) {
    try {
      const loc = locator.first();
      if (!(await loc.isVisible())) return;
      await loc.scrollIntoViewIfNeeded();
      await loc.evaluate((el) => {
        el.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        el.style.transform = 'scale(1.025)';
        el.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.6), 0 0 0 2px #38bdf8';
        el.style.zIndex = '30';
      });
      await sleep(durationMs);
      await loc.evaluate((el) => {
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.zIndex = '';
      });
    } catch (err) {
      console.warn('focusElement warning:', err.message);
    }
  }

  // Smooth mobile tap simulation
  async function touchTap(locator) {
    try {
      const loc = locator.first();
      if (!(await loc.isVisible())) return;
      await loc.scrollIntoViewIfNeeded();
      const box = await loc.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y, { steps: 3 });
        await sleep(80);
      }
      await loc.click({ force: true, timeout: 3000 });
    } catch (err) {
      console.warn('touchTap warning:', err.message);
    }
  }

  async function clearAllModals() {
    await page.evaluate(() => {
      const s = window.__GAME_STORE__;
      if (s) {
        if (typeof s.getState().dismissCourseCompletion === 'function') {
          s.getState().dismissCourseCompletion();
        }
        if (typeof s.getState().closeModal === 'function') {
          s.getState().closeModal();
        }
        s.setState((prev) => ({
          simulation: {
            ...prev.simulation,
            activeModal: null,
          },
        }));
      }
    });
    // Check DOM for any modal close buttons and click them
    const domCloses = page.locator('button:has-text("Continue Career Journey"), button[aria-label="Close modal"], button:has-text("CLOSE MARKET")');
    const count = await domCloses.count();
    for (let i = 0; i < count; i++) {
      const btn = domCloses.nth(i);
      if (await btn.isVisible()) {
        await btn.click({ force: true });
        await sleep(200);
      }
    }
    await sleep(300);
  }

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await sleep(400);

  // Clear previous session
  await page.evaluate(() => {
    try { localStorage.clear(); } catch(e) {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(500);

  async function waitSceneDialogue(t0, durationMs) {
    const elapsed = Date.now() - t0;
    const remaining = Math.max(0, durationMs - elapsed);
    if (remaining > 0) {
      await sleep(remaining);
    }
  }

  async function waitSceneFinish(t0, totalMs) {
    const elapsed = Date.now() - t0;
    const remaining = Math.max(0, totalMs - elapsed);
    if (remaining > 0) {
      await sleep(remaining);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENE 1: Intro & Character Reveal
  // ─────────────────────────────────────────────────────────────
  const sc1 = SCENES[0];
  console.log(`🎬 Recording Scene 1: Character Spawn (Dialogue: ${(sc1.duration_ms/1000).toFixed(1)}s, Total: ${(sc1.total_scene_ms/1000).toFixed(1)}s)`);
  const t1 = Date.now();

  await sleep(800);
  const tier1Btn = page.locator('button:has-text("Tier 1")').first();
  await touchTap(tier1Btn);
  await sleep(600);

  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await touchTap(genBtn);
  await sleep(800);

  // Stay on Character Reveal Card while narrator speaks
  const surplusBox = page.locator('text=/Net Monthly Surplus/i').first();
  if (await surplusBox.isVisible()) {
    await focusElement(surplusBox, 2400);
  }

  // Wait until Scene 1 dialogue is fully completed
  await waitSceneDialogue(t1, sc1.duration_ms);

  // Transition to Goals Roadmap
  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await touchTap(toGoalsBtn);
  await waitSceneFinish(t1, sc1.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 2: Goals Roadmap
  // ─────────────────────────────────────────────────────────────
  const sc2 = SCENES[1];
  console.log(`🎬 Recording Scene 2: Goals Roadmap (Dialogue: ${(sc2.duration_ms/1000).toFixed(1)}s, Total: ${(sc2.total_scene_ms/1000).toFixed(1)}s)`);
  const t2 = Date.now();

  await sleep(600);
  const carGoal = page.locator('text=/Buy First Car/i, text=/Car/i').first();
  if (await carGoal.isVisible()) {
    await focusElement(carGoal, 2000);
  }

  // Smooth scroll to showcase wedding and home goals
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await sleep(1200);

  // Toggle Vacation goal option
  const intlTripBtn = page.locator('button:has-text("International")').first();
  if (await intlTripBtn.isVisible()) {
    await touchTap(intlTripBtn);
    await sleep(800);
  }

  // Wait until Scene 2 dialogue finishes completely
  await waitSceneDialogue(t2, sc2.duration_ms);

  // Transition to Allocations
  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await touchTap(toAllocBtn);
  await waitSceneFinish(t2, sc2.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 3: Financial Engine & Allocations
  // ─────────────────────────────────────────────────────────────
  const sc3 = SCENES[2];
  console.log(`🎬 Recording Scene 3: Financial Engine (Dialogue: ${(sc3.duration_ms/1000).toFixed(1)}s, Total: ${(sc3.total_scene_ms/1000).toFixed(1)}s)`);
  const t3 = Date.now();

  await sleep(600);
  // Strategy Hint
  const hintBtn = page.locator('button:has-text("Strategy Hint")').first();
  if (await hintBtn.isVisible()) {
    await focusElement(hintBtn, 800);
    await touchTap(hintBtn);
    await sleep(900);

    const applyRecommendedBtn = page.locator('button:has-text("Apply Recommended")').first();
    if (await applyRecommendedBtn.isVisible()) {
      await touchTap(applyRecommendedBtn);
      await sleep(1000);
    }
  }

  // Scroll down to review Insurance & SIP sliders
  await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
  await sleep(1200);

  // Wait until Scene 3 dialogue completes
  await waitSceneDialogue(t3, sc3.duration_ms);

  // Start Life Simulation
  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION")').first();
  await touchTap(startSimBtn);
  await waitSceneFinish(t3, sc3.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 4: Main Dashboard & Cashflow Pulse
  // ─────────────────────────────────────────────────────────────
  const sc4 = SCENES[3];
  console.log(`🎬 Recording Scene 4: Main Dashboard & Cashflow Pulse (Dialogue: ${(sc4.duration_ms/1000).toFixed(1)}s, Total: ${(sc4.total_scene_ms/1000).toFixed(1)}s)`);
  const t4 = Date.now();

  // Pause simulation so we showcase main dashboard clearly
  await page.evaluate(() => {
    if (window.__GAME_STORE__) window.__GAME_STORE__.getState().pause();
  });
  await sleep(600);

  // Focus Net Worth Card
  const netWorthElem = page.locator('text=/Net Worth/i').first();
  if (await netWorthElem.isVisible()) {
    await focusElement(netWorthElem, 2400);
  }

  // Focus Cashflow Pulse (Take-Home & Expenses)
  const cashflowElem = page.locator('text=/Monthly Cashflow/i, text=/Take-Home/i').first();
  if (await cashflowElem.isVisible()) {
    await focusElement(cashflowElem, 2400);
  }

  // Open Expenses Ledger
  const ledgerBtn = page.locator('button:has-text("Expenses Ledger"), button:has-text("LEDGER")').first();
  if (await ledgerBtn.isVisible()) {
    await touchTap(ledgerBtn);
    await sleep(2500);

    const closeDrawerBtn = page.locator('button:has-text("Close"), button:has-text("✕")').first();
    if (await closeDrawerBtn.isVisible()) {
      await touchTap(closeDrawerBtn);
    } else {
      await touchTap(ledgerBtn);
    }
    await sleep(600);
  }

  await waitSceneDialogue(t4, sc4.duration_ms);
  await waitSceneFinish(t4, sc4.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 5: Career Ladder & Upskilling Hub
  // ─────────────────────────────────────────────────────────────
  const sc5 = SCENES[4];
  console.log(`🎬 Recording Scene 5: Career Ladder & Upskilling Hub (Dialogue: ${(sc5.duration_ms/1000).toFixed(1)}s, Total: ${(sc5.total_scene_ms/1000).toFixed(1)}s)`);
  const t5 = Date.now();

  // Switch to Career tab exactly when Scene 5 begins
  const careerTab = page.locator('button:has-text("Career")').first();
  await touchTap(careerTab);
  await sleep(800);

  // Focus Current Career Profile
  const jobTitleElem = page.locator('text=/Current Career/i, text=/Engineer/i, text=/Specialist/i, text=/Associate/i').first();
  if (await jobTitleElem.isVisible()) {
    await focusElement(jobTitleElem, 1800);
  }

  // Open Upskill Hub
  const upskillBtn = page.locator('button:has-text("Upskill Hub")').first();
  if (await upskillBtn.isVisible()) {
    await touchTap(upskillBtn);
    await sleep(1400);

    const enrollBtn = page.locator('button:has-text("Enroll Now")').first();
    if (await enrollBtn.isVisible()) {
      await touchTap(enrollBtn);
      await sleep(1500);
    }

    const closeUpskill = page.locator('button:has-text("Close"), button:has-text("✕")').first();
    if (await closeUpskill.isVisible()) {
      await touchTap(closeUpskill);
    }
    await sleep(600);
  }

  await waitSceneDialogue(t5, sc5.duration_ms);
  await waitSceneFinish(t5, sc5.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 6: Job Market & Market Hikes
  // ─────────────────────────────────────────────────────────────
  const sc6 = SCENES[5];
  console.log(`🎬 Recording Scene 6: Job Market & Market Hikes (Dialogue: ${(sc6.duration_ms/1000).toFixed(1)}s, Total: ${(sc6.total_scene_ms/1000).toFixed(1)}s)`);
  const t6 = Date.now();

  // Dismiss any unexpected modal before starting Job Market
  await clearAllModals();

  // Ensure on career tab
  if (await careerTab.isVisible()) {
    await touchTap(careerTab);
    await sleep(400);
  }

  // Boost skill level and experience temporarily so job application is 100% accepted
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.setState((s) => ({
        character: {
          ...s.character,
          yearsOfExperience: 3,
          skillLevel: 3.5,
          jobApplicationCooldowns: {},
        },
      }));
    }
  });

  const jobMarketBtn = page.locator('button:has-text("Job Market")').first();
  if (await jobMarketBtn.isVisible()) {
    await touchTap(jobMarketBtn);
    await sleep(1200);

    const applyJobBtn = page.locator('button:has-text("Apply")').first();
    if (await applyJobBtn.isVisible()) {
      await touchTap(applyJobBtn);
      await sleep(1600);

      // Offer Letter modal is now visible
      const acceptOfferBtn = page.locator('button:has-text("Accept Offer")').first();
      if (await acceptOfferBtn.isVisible()) {
        await focusElement(acceptOfferBtn, 1400);
        await touchTap(acceptOfferBtn);
        await sleep(1000);
      }
    }
  }

  // Ensure all modals from Job Market are cleanly dismissed
  await clearAllModals();

  await waitSceneDialogue(t6, sc6.duration_ms);
  await waitSceneFinish(t6, sc6.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 7: Ventures & Startup Incubation
  // ─────────────────────────────────────────────────────────────
  const sc7 = SCENES[6];
  console.log(`🎬 Recording Scene 7: Ventures & Startup Incubation (Dialogue: ${(sc7.duration_ms/1000).toFixed(1)}s, Total: ${(sc7.total_scene_ms/1000).toFixed(1)}s)`);
  const t7 = Date.now();

  // Guarantee clean screen: no leftover modals
  await clearAllModals();

  // Switch back to Goals Tab
  const goalsTab = page.locator('button:has-text("Goals")').first();
  await touchTap(goalsTab);
  await sleep(600);

  // Scroll to top of goals tab
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(400);

  const newVentureBtn = page.locator('button:has-text("New Venture")').first();
  if (await newVentureBtn.isVisible()) {
    await focusElement(newVentureBtn, 800);
    await touchTap(newVentureBtn);
    await sleep(1500);

    // Venture Incubator modal is open! Focus Micro-SaaS
    const incubateBtn = page.locator('button:has-text("Incubate Venture")').first();
    if (await incubateBtn.isVisible()) {
      await focusElement(incubateBtn, 1800);
      await touchTap(incubateBtn);
      await sleep(1800);
    }

    const closeVentureModal = page.locator('button[aria-label="Close modal"], button:has-text("✕")').first();
    if (await closeVentureModal.isVisible()) {
      await touchTap(closeVentureModal);
      await sleep(600);
    }
  }

  await waitSceneDialogue(t7, sc7.duration_ms);
  await waitSceneFinish(t7, sc7.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 8: Real Estate & Rental Yield
  // ─────────────────────────────────────────────────────────────
  const sc8 = SCENES[7];
  console.log(`🎬 Recording Scene 8: Real Estate & Rental Yield (Dialogue: ${(sc8.duration_ms/1000).toFixed(1)}s, Total: ${(sc8.total_scene_ms/1000).toFixed(1)}s)`);
  const t8 = Date.now();

  await clearAllModals();

  // Trigger Home Purchase modal
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.setState((s) => ({
        simulation: {
          ...s.simulation,
          isPaused: true,
          activeModal: {
            type: 'home_purchase',
            goal: {
              id: 'goal_home',
              name: 'Home Down Payment',
              targetAmount: 1500000,
              currentAmount: 1500000,
              propertyCost: 7500000,
            },
            isEarly: false,
          },
        },
      }));
    }
  });
  await sleep(1400);

  const finalizeHomeBtn = page.locator('button:has-text("Finalize Home Purchase")').first();
  if (await finalizeHomeBtn.isVisible()) {
    await focusElement(finalizeHomeBtn, 1400);
    await touchTap(finalizeHomeBtn);
    await sleep(1000);
  } else {
    const dismissHomeBtn = page.locator('button:has-text("Review Later")').first();
    if (await dismissHomeBtn.isVisible()) await touchTap(dismissHomeBtn);
  }

  await clearAllModals();

  await waitSceneDialogue(t8, sc8.duration_ms);
  await waitSceneFinish(t8, sc8.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 9: Emergency Shield & Life Shocks
  // ─────────────────────────────────────────────────────────────
  const sc9 = SCENES[8];
  console.log(`🎬 Recording Scene 9: Emergency Shield & Life Shocks (Dialogue: ${(sc9.duration_ms/1000).toFixed(1)}s, Total: ${(sc9.total_scene_ms/1000).toFixed(1)}s)`);
  const t9 = Date.now();

  await clearAllModals();

  // Trigger Shock Modal
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.setState((s) => ({
        simulation: {
          ...s.simulation,
          isPaused: true,
          activeModal: {
            type: 'shock_event',
            shockId: 'shock_medical',
            title: 'Emergency Medical Hospitalization',
            description: 'Urgent medical surgery and inpatient recovery. Your comprehensive health insurance shields your liquid savings!',
            totalCost: 150000,
            insurancePaid: 120000,
            outOfPocket: 30000,
            drawnFromEmergency: 30000,
            emergencyFundBefore: 150000,
            emergencyFundTarget: 150000,
          },
        },
      }));
    }
  });
  await sleep(1400);

  const shockBox = page.locator('text=/Emergency/i, text=/Hospitalization/i').first();
  if (await shockBox.isVisible()) {
    await focusElement(shockBox, 2400);
  }

  const ackShockBtn = page.locator('button:has-text("Acknowledge & Mobilize Funds"), button:has-text("Acknowledge")').first();
  if (await ackShockBtn.isVisible()) {
    await touchTap(ackShockBtn);
    await sleep(1000);
  }

  // Switch to Shield tab to showcase coverage
  const shieldTab = page.locator('button:has-text("Shield")').first();
  if (await shieldTab.isVisible()) {
    await touchTap(shieldTab);
    await sleep(1200);
  }

  await clearAllModals();

  await waitSceneDialogue(t9, sc9.duration_ms);
  await waitSceneFinish(t9, sc9.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 10: Compounding Fast-Forward
  // ─────────────────────────────────────────────────────────────
  const sc10 = SCENES[9];
  console.log(`🎬 Recording Scene 10: Compounding Fast-Forward (Dialogue: ${(sc10.duration_ms/1000).toFixed(1)}s, Total: ${(sc10.total_scene_ms/1000).toFixed(1)}s)`);
  const t10 = Date.now();

  // Back to Goals Tab
  await touchTap(goalsTab);
  await sleep(400);

  // Speed up and play simulation
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.getState().setSpeed(5);
      store.getState().play();
    }
  });

  // Fast forward simulation months smoothly
  for (let y = 0; y < 14; y++) {
    await page.evaluate(() => {
      const store = window.__GAME_STORE__;
      if (store) {
        store.setState((s) => ({
          simulation: {
            ...s.simulation,
            activeModal: null,
            isPaused: false,
          },
        }));
        for (let m = 0; m < 12; m++) {
          store.getState().tickMonth();
          if (store.getState().simulation.activeModal) {
            store.getState().closeModal();
          }
        }
      }
    });
    await sleep(350);
  }

  await clearAllModals();

  const netWorthSurge = page.locator('text=/Net Worth/i').first();
  if (await netWorthSurge.isVisible()) {
    await focusElement(netWorthSurge, 2200);
  }

  await waitSceneDialogue(t10, sc10.duration_ms);
  await waitSceneFinish(t10, sc10.total_scene_ms);

  // ─────────────────────────────────────────────────────────────
  // SCENE 11: Retirement & Endgame Scorecard
  // ─────────────────────────────────────────────────────────────
  const sc11 = SCENES[10];
  console.log(`🎬 Recording Scene 11: Retirement & Endgame Scorecard (Dialogue: ${(sc11.duration_ms/1000).toFixed(1)}s, Total: ${(sc11.total_scene_ms/1000).toFixed(1)}s)`);
  const t11 = Date.now();

  // Advance to retirement age 60 and navigate to scorecard
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    if (store) {
      store.getState().pause();
      store.setState((s) => ({
        character: {
          ...s.character,
          age: 60,
          liquidCash: 4500000,
        },
        simulation: {
          ...s.simulation,
          currentAge: 60,
          currentMonthIndex: 444,
          isPaused: true,
          activeModal: null,
        },
      }));
      store.getState().navigateTo('scorecard');
    }
  });
  await sleep(1500);

  // Focus Literacy Score
  const scoreBadge = page.locator('h1, h2, .font-display').first();
  if (await scoreBadge.isVisible()) {
    await focusElement(scoreBadge, 3000);
  }

  // Focus Debrief & Pillars
  const pillarBars = page.locator('text=/Retrospective/i, text=/Debrief/i').first();
  if (await pillarBars.isVisible()) {
    await focusElement(pillarBars, 2500);
  }

  // Tap Milestones tab on Scorecard
  const milestonesTab = page.locator('button:has-text("Milestones & Decisions"), button:has-text("Milestones")').first();
  if (await milestonesTab.isVisible()) {
    await touchTap(milestonesTab);
    await sleep(2000);
  }

  await waitSceneDialogue(t11, sc11.duration_ms);
  await waitSceneFinish(t11, sc11.total_scene_ms);

  console.log('Stopping video recording and flushing file to disk...');
  await context.close();
  await browser.close();

  // Find recorded WebM file
  const files = fs.readdirSync(RECORDINGS_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No raw webm file found in ' + RECORDINGS_DIR);
  }
  const rawWebmPath = path.join(RECORDINGS_DIR, files[0]);
  console.log('✓ Raw mobile video recorded at:', rawWebmPath);

  // Multiplex audio and video using ffmpeg
  const outputMp4 = '/home/rutvej/Desktop/cashflow-game/demo-cashmeout-mobile.mp4';
  const outputWebm = '/home/rutvej/Desktop/cashflow-game/demo-cashmeout-mobile.webm';
  const ffmpegBin = '/home/rutvej/Desktop/cashflow-game/node_modules/ffmpeg-static/ffmpeg';

  console.log(`Multiplexing video and mixed soundtrack (${MASTER_SOUNDTRACK}) with ffmpeg...`);

  // 1. Render MP4 (H.264 + AAC) scaled to crisp iPhone Full HD 860x1864
  const mp4Cmd = `${ffmpegBin} -y -i "${rawWebmPath}" -i "${MASTER_SOUNDTRACK}" -vf "scale=860:1864:flags=lanczos" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outputMp4}"`;
  execSync(mp4Cmd, { stdio: 'inherit' });
  console.log('✓ Successfully generated MP4 video at:', outputMp4);

  // 2. Render WebM (VP9 + Opus)
  const webmCmd = `${ffmpegBin} -y -i "${rawWebmPath}" -i "${MASTER_SOUNDTRACK}" -c:v copy -c:a libopus -b:a 128k -shortest "${outputWebm}"`;
  execSync(webmCmd, { stdio: 'inherit' });
  console.log('✓ Successfully generated WebM video at:', outputWebm);

  // Copy to conversation brain artifact directory
  const brainDir = '/home/rutvej/.gemini/antigravity-cli/brain/ae9c9c88-d40b-4105-a9a7-3c8619a9b857';
  execSync(`cp "${outputMp4}" "${brainDir}/demo-cashmeout-mobile.mp4"`);
  execSync(`cp "${outputWebm}" "${brainDir}/demo-cashmeout-mobile.webm"`);
  console.log('✓ Copied videos to brain artifact directory!');
}

recordMobileDemo().catch((err) => {
  console.error('Recording error:', err);
  process.exit(1);
});
