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
const MASTER_AUDIO = path.join(AUDIO_DIR, 'master_voiceover.mp3');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Scene cumulative target elapsed times (seconds) matching generated voiceover clips:
// scene01_intro: 13.46s
// scene02_goals: 11.28s
// scene03_financial_setup: 13.30s
// scene04_dashboard: 15.05s
// scene05_upskill: 11.78s
// scene06_job_market: 11.18s
// scene07_ventures: 13.56s
// scene08_real_estate: 10.70s
// scene09_shocks: 14.28s
// scene10_compounding: 11.98s
// scene11_scorecard: 16.22s
const SCENE_TARGETS = {
  scene1: 13.46,
  scene2: 13.46 + 11.28,             // 24.74
  scene3: 24.74 + 13.30,             // 38.04
  scene4: 38.04 + 15.05,             // 53.09
  scene5: 53.09 + 11.78,             // 64.87
  scene6: 64.87 + 11.18,             // 76.05
  scene7: 76.05 + 13.56,             // 89.61
  scene8: 89.61 + 10.70,             // 100.31
  scene9: 100.31 + 14.28,            // 114.59
  scene10: 114.59 + 11.98,           // 126.57
  scene11: 126.57 + 16.22,           // 142.79
};

async function recordMobileDemo() {
  console.log('🎥 Launching Playwright with 1:1 Mobile Viewport (430x932 iPhone 15 Pro)...');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Use matching viewport and recording size so 100% of the frame is the actual game screen
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

  // Helper: Subtitle box styled cleanly for native mobile screens
  async function updateSubtitle(text, label = '🎙️ Christopher · Narrator') {
    await page.evaluate(({ t, l }) => {
      let el = document.getElementById('demo-subtitle-box');
      if (!el) {
        el = document.createElement('div');
        el.id = 'demo-subtitle-box';
        el.style.position = 'fixed';
        el.style.bottom = '16px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.zIndex = '999999';
        el.style.width = '90%';
        el.style.maxWidth = '400px';
        el.style.background = 'rgba(15, 23, 42, 0.94)';
        el.style.backdropFilter = 'blur(12px)';
        el.style.border = '2px solid #38bdf8';
        el.style.borderRadius = '14px';
        el.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.3)';
        el.style.padding = '10px 14px';
        el.style.color = '#ffffff';
        el.style.transition = 'all 0.25s ease';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
      }
      el.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
          <span style="font-size: 10px; font-family: monospace; font-weight: 900; letter-spacing: 0.08em; color: #38bdf8; text-transform: uppercase;">${l}</span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
            <span style="font-size: 9px; font-family: monospace; color: #94a3b8; font-weight: bold;">Mobile Demo</span>
          </span>
        </div>
        <div style="font-size: 11.5px; font-weight: 600; line-height: 1.35; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          ${t}
        </div>
      `;
    }, { t: text, l: label });
  }

  // Inject virtual touch circle indicator
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const touch = document.createElement('div');
      touch.id = 'virtual-touch-pointer';
      touch.style.position = 'fixed';
      touch.style.width = '26px';
      touch.style.height = '26px';
      touch.style.borderRadius = '50%';
      touch.style.backgroundColor = 'rgba(56, 189, 248, 0.45)';
      touch.style.border = '2.5px solid #0284c7';
      touch.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.8)';
      touch.style.pointerEvents = 'none';
      touch.style.zIndex = '9999999';
      touch.style.transition = 'transform 0.12s ease-out, background-color 0.15s ease';
      touch.style.transform = 'translate(-50%, -50%) scale(1)';
      touch.style.display = 'none';
      document.body.appendChild(touch);

      document.addEventListener('mousemove', (e) => {
        touch.style.display = 'block';
        touch.style.left = e.clientX + 'px';
        touch.style.top = e.clientY + 'px';
      });

      document.addEventListener('mousedown', () => {
        touch.style.transform = 'translate(-50%, -50%) scale(0.7)';
        touch.style.backgroundColor = 'rgba(245, 158, 11, 0.7)';
        touch.style.borderColor = '#d97706';
      });

      document.addEventListener('mouseup', () => {
        touch.style.transform = 'translate(-50%, -50%) scale(1)';
        touch.style.backgroundColor = 'rgba(56, 189, 248, 0.45)';
        touch.style.borderColor = '#0284c7';
      });
    });
  });

  // Spotlight & Focus helper (pops out card with smooth halo without breaking DOM layout)
  async function focusElement(locator, durationMs = 1500) {
    try {
      const loc = locator.first();
      if (!(await loc.isVisible())) return;
      await loc.scrollIntoViewIfNeeded();
      await loc.evaluate((el) => {
        el.style.transition = 'transform 0.35s ease, box-shadow 0.35s ease';
        el.style.transform = 'scale(1.03)';
        el.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.7), 0 0 0 3px #38bdf8';
        el.style.zIndex = '40';
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

  async function touchTap(locator) {
    try {
      const loc = locator.first();
      const isVis = await loc.isVisible();
      if (!isVis) return;
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

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await sleep(400);

  // Clear previous session
  await page.evaluate(() => {
    try { localStorage.clear(); } catch(e) {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(400);

  const startTime = Date.now();
  async function sleepUntil(targetElapsedSec) {
    const currentElapsed = (Date.now() - startTime) / 1000;
    const remainingMs = Math.max(0, (targetElapsedSec - currentElapsed) * 1000);
    if (remainingMs > 0) {
      await sleep(remainingMs);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCENE 1: Intro & Fresh Start (13.46s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 1: Intro & Spawn Reveal (13.5s)');
  await updateSubtitle(
    "Welcome to CashMeOut, the ultimate mobile financial life simulator. Your journey begins at age twenty-three in a fast-paced Tier-One metro. Let's generate your starting career and financial profile.",
    "🎬 Scene 1 · Fresh Start at Age 23"
  );
  await sleep(1000);

  const tier1Btn = page.locator('button:has-text("Tier 1")').first();
  await focusElement(tier1Btn, 1200);
  await touchTap(tier1Btn);
  await sleep(600);

  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await focusElement(genBtn, 800);
  await touchTap(genBtn);
  await sleep(800);

  // Spawn Reveal screen
  const surplusBox = page.locator('text=/Net Monthly Surplus/i').first();
  if (await surplusBox.isVisible()) {
    await focusElement(surplusBox, 2200);
  }

  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await touchTap(toGoalsBtn);
  await sleepUntil(SCENE_TARGETS.scene1);

  // ─────────────────────────────────────────────────────────────
  // SCENE 2: Goals Roadmap (11.28s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 2: Goals Roadmap (11.3s)');
  await updateSubtitle(
    "Every financial journey needs goals. Plan for your first car, your dream wedding, buying a home, annual vacations, and building an unbreakable emergency shield.",
    "🎯 Scene 2 · Financial Goals Roadmap"
  );
  await sleep(1000);

  const carGoal = page.locator('text=/Buy First Car/i, text=/Car/i').first();
  if (await carGoal.isVisible()) {
    await focusElement(carGoal, 2000);
  }

  // Vacation option
  const intlTripBtn = page.locator('button:has-text("International")').first();
  if (await intlTripBtn.isVisible()) {
    await focusElement(intlTripBtn, 1000);
    await touchTap(intlTripBtn);
    await sleep(800);
  }

  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await touchTap(toAllocBtn);
  await sleepUntil(SCENE_TARGETS.scene2);

  // ─────────────────────────────────────────────────────────────
  // SCENE 3: Financial Engine & Allocations (13.30s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 3: Financial Setup & Compounding Engine (13.3s)');
  await updateSubtitle(
    "Next, configure your financial engine. Turn on essential health and term insurance to shield against emergencies, and use the Strategy Hint to balance your monthly SIPs across equity, fixed deposits, and gold.",
    "⚙️ Scene 3 · Compounding Engine & Allocations"
  );
  await sleep(800);

  // Strategy Hint
  const hintBtn = page.locator('button:has-text("Strategy Hint")').first();
  if (await hintBtn.isVisible()) {
    await focusElement(hintBtn, 800);
    await touchTap(hintBtn);
    await sleep(800);

    const applyRecommendedBtn = page.locator('button:has-text("Apply Recommended")').first();
    if (await applyRecommendedBtn.isVisible()) {
      await focusElement(applyRecommendedBtn, 1000);
      await touchTap(applyRecommendedBtn);
      await sleep(1000);
    }
  }

  // Start Life Simulation
  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION")').first();
  await focusElement(startSimBtn, 1000);
  await touchTap(startSimBtn);
  await sleep(600);

  // Pause simulation so we showcase main dashboard clearly
  await page.evaluate(() => {
    if (window.__GAME_STORE__) window.__GAME_STORE__.getState().pause();
  });
  await sleepUntil(SCENE_TARGETS.scene3);

  // ─────────────────────────────────────────────────────────────
  // SCENE 4: Main Dashboard & Cashflow Pulse (15.05s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 4: Main Dashboard & Cashflow Pulse (15.0s)');
  await updateSubtitle(
    "This is your main dashboard. Track your age and live Net Worth at the top. The Cashflow Pulse monitors your take-home pay, living expenses, and monthly surplus. Tap the Ledger anytime to inspect every rupee.",
    "⚡ Scene 4 · Live Dashboard & Cashflow Pulse"
  );
  await sleep(1000);

  // Focus Age & Net Worth Card
  const netWorthElem = page.locator('text=/Net Worth/i').first();
  if (await netWorthElem.isVisible()) {
    await focusElement(netWorthElem, 2500);
  }

  // Focus Monthly Cashflow Pulse
  const cashflowElem = page.locator('text=/Monthly Cashflow/i, text=/Take-Home/i').first();
  if (await cashflowElem.isVisible()) {
    await focusElement(cashflowElem, 2500);
  }

  // Tap Expenses Ledger
  const ledgerBtn = page.locator('button:has-text("Expenses Ledger")').first();
  if (await ledgerBtn.isVisible()) {
    await touchTap(ledgerBtn);
    await sleep(2200);
    const closeDrawerBtn = page.locator('button:has-text("Close"), button:has-text("✕")').first();
    if (await closeDrawerBtn.isVisible()) {
      await touchTap(closeDrawerBtn);
    } else {
      await touchTap(ledgerBtn);
    }
  }

  await sleepUntil(SCENE_TARGETS.scene4);

  // ─────────────────────────────────────────────────────────────
  // SCENE 5: Career Ladder & Upskill Hub (11.78s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 5: Career Ladder & Upskilling Hub (11.8s)');
  await updateSubtitle(
    "Accelerate your primary wealth engine. Switch to the Career tab and open the Upskill Hub. Enroll in high-value technical certifications to unlock massive appraisal raises.",
    "💼 Scene 5 · Career Growth & Upskilling"
  );
  await sleep(600);

  // Tap Career Tab
  const careerTab = page.locator('button:has-text("Career")').first();
  await touchTap(careerTab);
  await sleep(800);

  // Open Upskill Hub
  const upskillBtn = page.locator('button:has-text("Upskill Hub")').first();
  if (await upskillBtn.isVisible()) {
    await focusElement(upskillBtn, 1000);
    await touchTap(upskillBtn);
    await sleep(1200);

    const enrollBtn = page.locator('button:has-text("Enroll Now")').first();
    if (await enrollBtn.isVisible()) {
      await focusElement(enrollBtn, 1200);
      await touchTap(enrollBtn);
      await sleep(1200);
    }

    const closeUpskill = page.locator('button:has-text("Close"), button:has-text("✕")').first();
    if (await closeUpskill.isVisible()) {
      await touchTap(closeUpskill);
    }
  }

  await sleepUntil(SCENE_TARGETS.scene5);

  // ─────────────────────────────────────────────────────────────
  // SCENE 6: Dynamic Job Market & 40% Salary Hike (11.18s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 6: Job Market & Market Hikes (11.2s)');
  await updateSubtitle(
    "Ready for a bigger jump? Browse the dynamic Job Market. Interview for senior positions and negotiate lucrative offer letters with forty percent salary increases.",
    "🚀 Scene 6 · Job Switching & Market Hikes"
  );
  await sleep(600);

  const jobMarketBtn = page.locator('button:has-text("Job Market")').first();
  if (await jobMarketBtn.isVisible()) {
    await focusElement(jobMarketBtn, 800);
    await touchTap(jobMarketBtn);
    await sleep(1200);

    const applyJobBtn = page.locator('button:has-text("Apply")').first();
    if (await applyJobBtn.isVisible()) {
      await focusElement(applyJobBtn, 1200);
      await touchTap(applyJobBtn);
      await sleep(1500);

      const acceptOfferBtn = page.locator('button:has-text("Accept Offer")').first();
      if (await acceptOfferBtn.isVisible()) {
        await focusElement(acceptOfferBtn, 1200);
        await touchTap(acceptOfferBtn);
        await sleep(1000);
      }
    }
  }

  await sleepUntil(SCENE_TARGETS.scene6);

  // ─────────────────────────────────────────────────────────────
  // SCENE 7: Wealth Engines & Startup Ventures (13.56s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 7: Ventures & Startup Incubation (13.6s)');
  await updateSubtitle(
    "Multiply your earnings beyond a salary. Tap New Venture on the Goals tab to incubate side hustles. Launch a Micro-SaaS or e-commerce store to collect recurring passive dividends every single month.",
    "💡 Scene 7 · Passive Wealth & Startup Ventures"
  );
  await sleep(600);

  // Switch back to Goals Tab
  const goalsTab = page.locator('button:has-text("Goals")').first();
  await touchTap(goalsTab);
  await sleep(500);

  const newVentureBtn = page.locator('button:has-text("New Venture")').first();
  if (await newVentureBtn.isVisible()) {
    await focusElement(newVentureBtn, 1000);
    await touchTap(newVentureBtn);
    await sleep(1200);

    const incubateBtn = page.locator('button:has-text("Incubate"), button:has-text("Select")').first();
    if (await incubateBtn.isVisible()) {
      await focusElement(incubateBtn, 1200);
      await touchTap(incubateBtn);
      await sleep(1200);
    }

    const closeVentureModal = page.locator('button:has-text("Close"), button:has-text("✕")').first();
    if (await closeVentureModal.isVisible()) {
      await touchTap(closeVentureModal);
    }
  }

  await sleepUntil(SCENE_TARGETS.scene7);

  // ─────────────────────────────────────────────────────────────
  // SCENE 8: Real Estate & Home Ownership (10.70s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 8: Real Estate & Rental Yield (10.7s)');
  await updateSubtitle(
    "Build tangible wealth with real estate. Purchase property with realistic mortgages, and decide whether to move in or rent it out to tenants for monthly passive rental income.",
    "🏠 Scene 8 · Real Estate & Rental Yield"
  );
  await sleep(600);

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
              targetAmount: 2000000,
              currentAmount: 2000000,
            },
            isEarly: false,
          },
        },
      }));
    }
  });
  await sleep(1000);

  const rentOutOption = page.locator('button:has-text("Rent Out"), button:has-text("Rental")').first();
  if (await rentOutOption.isVisible()) {
    await focusElement(rentOutOption, 1000);
    await touchTap(rentOutOption);
    await sleep(1000);
  }

  const finalizeHomeBtn = page.locator('button:has-text("Finalize Home Purchase")').first();
  if (await finalizeHomeBtn.isVisible()) {
    await focusElement(finalizeHomeBtn, 1000);
    await touchTap(finalizeHomeBtn);
    await sleep(1000);
  } else {
    const dismissHomeBtn = page.locator('button:has-text("Review Later"), button:has-text("Dismiss")').first();
    if (await dismissHomeBtn.isVisible()) await touchTap(dismissHomeBtn);
  }

  await sleepUntil(SCENE_TARGETS.scene8);

  // ─────────────────────────────────────────────────────────────
  // SCENE 9: Emergency Shield & Life Shocks (14.28s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 9: Emergency Shield & Life Shocks (14.3s)');
  await updateSubtitle(
    "Life happens. Unexpected emergencies like stock market crashes or medical shocks will test your resilience. Your health insurance and liquid emergency buffer absorb the hit, keeping you safe from predatory loans.",
    "🛡️ Scene 9 · Emergency Shield & Shocks"
  );
  await sleep(600);

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
  await sleep(1000);

  const shockBox = page.locator('text=/Emergency/i, text=/Hospitalization/i').first();
  if (await shockBox.isVisible()) {
    await focusElement(shockBox, 2500);
  }

  const ackShockBtn = page.locator('button:has-text("Acknowledge & Mobilize Funds")').first();
  if (await ackShockBtn.isVisible()) {
    await touchTap(ackShockBtn);
    await sleep(1200);
  }

  // Show Shield Tab
  const shieldTab = page.locator('button:has-text("Shield")').first();
  if (await shieldTab.isVisible()) {
    await touchTap(shieldTab);
    await sleep(1500);
  }

  await sleepUntil(SCENE_TARGETS.scene9);

  // ─────────────────────────────────────────────────────────────
  // SCENE 10: Compounding Fast-Forward (11.98s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 10: Compounding Fast-Forward (12.0s)');
  await updateSubtitle(
    "Now let compounding work its magic. Crank up the simulation to five-x speed. Watch your Net Worth surge into tens of lakhs and crores as your goals unlock one by one.",
    "📈 Scene 10 · Fast-Forward Compounding"
  );
  await sleep(600);

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
  for (let y = 0; y < 15; y++) {
    await page.evaluate(() => {
      const store = window.__GAME_STORE__;
      if (store) {
        for (let m = 0; m < 12; m++) {
          store.getState().tickMonth();
        }
      }
    });
    await sleep(350);
  }

  const netWorthSurge = page.locator('text=/Net Worth/i').first();
  if (await netWorthSurge.isVisible()) {
    await focusElement(netWorthSurge, 2500);
  }

  await sleepUntil(SCENE_TARGETS.scene10);

  // ─────────────────────────────────────────────────────────────
  // SCENE 11: Retirement & Endgame Scorecard (16.22s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 11: Retirement & Endgame Scorecard (16.2s)');
  await updateSubtitle(
    "At age sixty, you retire with complete financial freedom. The Endgame Scorecard grades your financial literacy, audits your savings discipline, and debriefs every strategic decision you made. Play CashMeOut and master your financial future today.",
    "🏆 Scene 11 · Financial Freedom & Scorecard"
  );
  await sleep(600);

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
    await focusElement(scoreBadge, 3500);
  }

  // Focus Debrief
  const pillarBars = page.locator('text=/Retrospective/i, text=/Debrief/i').first();
  if (await pillarBars.isVisible()) {
    await focusElement(pillarBars, 3000);
  }

  await sleepUntil(SCENE_TARGETS.scene11);

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

  console.log('Multiplexing video and male voiceover audio track with ffmpeg (100% full-screen mobile)...');

  // 1. Render MP4 (H.264 + AAC) scaled to 2x crispness 860x1864 (Native iPhone Full HD)
  const mp4Cmd = `${ffmpegBin} -y -i "${rawWebmPath}" -i "${MASTER_AUDIO}" -vf "scale=860:1864:flags=lanczos" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${outputMp4}"`;
  execSync(mp4Cmd, { stdio: 'inherit' });
  console.log('✓ Successfully generated MP4 video at:', outputMp4);

  // 2. Render WebM (VP9 + Opus)
  const webmCmd = `${ffmpegBin} -y -i "${rawWebmPath}" -i "${MASTER_AUDIO}" -c:v copy -c:a libopus -b:a 128k -shortest "${outputWebm}"`;
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
