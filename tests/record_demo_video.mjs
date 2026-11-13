import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const RECORDINGS_DIR = '/tmp/cashmeout_raw_recordings';
if (fs.existsSync(RECORDINGS_DIR)) {
  fs.rmSync(RECORDINGS_DIR, { recursive: true, force: true });
}
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function recordWalkthrough() {
  console.log('🎥 Launching Playwright to record full gameplay demo video...');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Helper to update on-screen subtitle overlay
  async function updateSubtitle(text, label = '🎙️ NARRATION') {
    await page.evaluate(({ t, l }) => {
      let el = document.getElementById('demo-subtitle-box');
      if (!el) {
        el = document.createElement('div');
        el.id = 'demo-subtitle-box';
        el.style.position = 'fixed';
        el.style.bottom = '18px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.zIndex = '999999';
        el.style.maxWidth = '920px';
        el.style.width = '90%';
        el.style.background = 'rgba(15, 23, 42, 0.94)';
        el.style.backdropFilter = 'blur(10px)';
        el.style.border = '2px solid #38bdf8';
        el.style.borderRadius = '14px';
        el.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.3)';
        el.style.padding = '12px 20px';
        el.style.color = '#ffffff';
        el.style.fontFamily = 'monospace, sans-serif';
        el.style.transition = 'all 0.3s ease';
        el.style.pointerEvents = 'none';
        document.body.appendChild(el);
      }
      el.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.08em; color: #38bdf8; text-transform: uppercase;">${l}</span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block; animation: pulse 1s infinite;"></span>
            <span style="font-size: 10px; color: #94a3b8; font-weight: bold;">CashMeOut Demo</span>
          </span>
        </div>
        <div style="font-size: 14px; font-weight: 600; line-height: 1.4; color: #f8fafc; font-family: sans-serif;">
          ${t}
        </div>
      `;
    }, { t: text, l: label });
  }

  // Inject mouse cursor visualization
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'virtual-cursor';
      cursor.style.position = 'fixed';
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.border = '2px solid white';
      cursor.style.borderRadius = '50%';
      cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
      cursor.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.9)';
      cursor.style.pointerEvents = 'none';
      cursor.style.zIndex = '1000000';
      cursor.style.transform = 'translate(-50%, -50%)';
      cursor.style.transition = 'top 0.15s ease-out, left 0.15s ease-out, transform 0.1s ease';
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      });

      document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
        cursor.style.backgroundColor = 'rgba(234, 179, 8, 0.9)';
      });

      document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
      });
    });
  });

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // ─────────────────────────────────────────────────────────────
  // SCENE 1: Intro & New Life Setup (9.19s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 1: Intro & Setup (9.2s)');
  await updateSubtitle(
    "Welcome to CashMeOut, the financial life simulation game. Let's begin a fresh career journey from age 23 to retirement.",
    "🎬 Scene 1 · Welcome to CashMeOut"
  );
  await sleep(1500);

  // Click Generate Character
  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.hover();
  await sleep(400);
  await genBtn.click();
  await sleep(1500);

  // Spawn reveal screen: Click Continue
  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await toGoalsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toGoalsBtn.hover();
  await sleep(400);
  await toGoalsBtn.click();
  await sleep(1500);

  // Goals Setup screen: Click Plan Monthly Allocations
  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await toAllocBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toAllocBtn.hover();
  await sleep(400);
  await toAllocBtn.click();
  await sleep(1500);

  // Financial Setup screen: Click Start Life Simulation
  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION")').first();
  await startSimBtn.waitFor({ state: 'visible', timeout: 5000 });
  await startSimBtn.hover();
  await sleep(400);
  await startSimBtn.click();
  await sleep(1000);

  // Pause simulation so we showcase controls deliberately
  await page.evaluate(() => window.__GAME_STORE__.getState().pause());
  await sleep(500);

  // ─────────────────────────────────────────────────────────────
  // SCENE 2: The New Decluttered Main Screen & Hero Header (10.66s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 2: Decluttered Main Dashboard & Hero (10.7s)');
  await updateSubtitle(
    "Here is the new, decluttered main screen. At the top, your age, career timeline, and live Net Worth are front and center, giving you instant clarity.",
    "✨ Scene 2 · Decluttered Hero Command Bar"
  );
  await sleep(1500);

  // Hover over Age progress ring
  await page.mouse.move(180, 70);
  await sleep(2500);

  // Hover over Net Worth card
  await page.mouse.move(960, 70);
  await sleep(2800);

  // Hover over Career progress line
  await page.mouse.move(500, 115);
  await sleep(3860);

  // ─────────────────────────────────────────────────────────────
  // SCENE 3: Monthly Cashflow Pulse & Outflow Ledger (15.77s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 3: Cashflow Pulse & Outflow Ledger (15.8s)');
  await updateSubtitle(
    "Rather than overwhelming you with endless numbers, the Monthly Cashflow Pulse cleanly displays your take-home pay, total living expenses, and the monthly surplus that fuels your goals. You can tap the Ledger anytime to inspect every ongoing expense.",
    "⚡ Scene 3 · Monthly Cashflow Pulse"
  );
  await sleep(1500);

  // Hover over Total Monthly Inflow
  await page.mouse.move(300, 210);
  await sleep(2500);

  // Hover over Total Outflows
  await page.mouse.move(600, 210);
  await sleep(2500);

  // Hover over Net Surplus to Goals
  await page.mouse.move(900, 210);
  await sleep(2500);

  // Click Expenses Ledger ℹ️
  const ledgerBtn = page.locator('button:has-text("Expenses Ledger ℹ️")').first();
  await ledgerBtn.hover();
  await sleep(400);
  await ledgerBtn.click();
  await sleep(3500); // inspect itemized costs (base living, car upkeep, home maintenance, EMIs)

  // Collapse Expenses Ledger
  await ledgerBtn.click();
  await sleep(2870);

  // ─────────────────────────────────────────────────────────────
  // SCENE 4: The CRED-Style Hamburger Menu & All Settings (14.62s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 4: Hamburger Drawer & Settings (14.6s)');
  await updateSubtitle(
    "All secondary controls and settings are now neatly tucked inside this Hamburger Menu. Here you can adjust simulation speed, toggle auto-vacation, explore the job market, manage loan prepayments, or launch side hustles.",
    "☰ Scene 4 · Life Hub & Settings Drawer"
  );
  await sleep(1000);

  // Click the Menu button in top right
  const menuBtn = page.locator('button:has-text("Menu")').first();
  await menuBtn.hover();
  await sleep(400);
  await menuBtn.click();
  await sleep(1500);

  // Move down drawer: Hover over Simulation Preferences
  await page.mouse.move(1050, 480);
  await sleep(2000);

  // Hover over Auto-Vacation setting in Drawer and ensure it stays ON
  const vacationToggle = page.locator('div.fixed.inset-y-0 button:has-text("✈️ AUTO:")').first();
  if (await vacationToggle.isVisible()) {
    await vacationToggle.hover();
    await sleep(1200);
  }
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().simulation.autoVacation = true;
  });

  // Hover over Career & Income section
  await page.mouse.move(1050, 250);
  await sleep(2500);

  // Hover over Wealth Engines
  await page.mouse.move(1050, 360);
  await sleep(4220);

  // ─────────────────────────────────────────────────────────────
  // SCENE 5: Upskill Hub & Certifications (9.48s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 5: Upskilling Hub & Enroll Course (9.5s)');
  await updateSubtitle(
    "Let's open the Upskill Hub. Enrolling in professional certifications boosts your skill rating and opens doors to top-tier promotions and raises.",
    "🎓 Scene 5 · Upskilling & Certification Hub"
  );
  await sleep(1000);

  // Click Upskill Hub inside the drawer
  const upskillHubBtn = page.locator('div.fixed.inset-y-0 button:has-text("Upskill Hub")').first();
  await upskillHubBtn.hover();
  await sleep(400);
  await upskillHubBtn.click({ force: true });
  await sleep(2000);

  // Upskilling modal is open: Hover over Bootcamp course and click Enroll Now
  const enrollBtn = page.locator('button:has-text("Enroll Now")').first();
  if (await enrollBtn.isVisible()) {
    await enrollBtn.hover();
    await sleep(400);
    await enrollBtn.click();
    await sleep(1500);
  }

  // Close Upskill modal
  const closeUpskill = page.locator('button:has-text("✕")').first();
  if (await closeUpskill.isVisible()) {
    await closeUpskill.click();
  }
  await sleep(3680);

  // ─────────────────────────────────────────────────────────────
  // SCENE 6: Playing the Simulation & Waterfall Compounding (13.66s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 6: Live Simulation & Compounding (13.7s)');
  await updateSubtitle(
    "Now, let's hit Play in the bottom thumb zone. As months tick by, compound interest accelerates your wealth. Notice how completed goals automatically waterfall extra cash into your next priority.",
    "▶ Scene 6 · Live Simulation & Waterfall Compounding"
  );
  await sleep(1000);

  // Hover over bottom Play button and click it
  const playBtn = page.locator('button:has-text("▶ PLAY")').first();
  await playBtn.hover();
  await sleep(400);
  await playBtn.click();
  await sleep(1000);

  // Switch speed to 5x for brisk gameplay demonstration
  const speed5xBtn = page.locator('button:has-text("5×")').first();
  await speed5xBtn.hover();
  await sleep(300);
  await speed5xBtn.click();

  // Let simulation tick through several months live!
  // During this time, check if celebration modal appears (e.g. course completed)
  let ticks = 0;
  while (ticks < 15) {
    await sleep(500);
    ticks++;
    // If modal appears, click claim/dismiss
    const claimBtn = page.locator('button:has-text("Continue Career Journey"), button:has-text("Claim Skill Boost"), button:has-text("Awesome!"), button:has-text("Got It")').first();
    if (await claimBtn.isVisible()) {
      await claimBtn.hover();
      await sleep(300);
      await claimBtn.click({ force: true });
      await sleep(400);
    }
  }

  // Ensure any modal is dismissed before pausing
  const anyModalBtn = page.locator('button:has-text("Continue Career Journey"), button:has-text("Awesome!"), button:has-text("Got It")').first();
  if (await anyModalBtn.isVisible()) {
    await anyModalBtn.click({ force: true });
    await sleep(400);
  }

  // Pause simulation
  await page.evaluate(() => window.__GAME_STORE__.getState().pause());
  await sleep(3000);

  // ─────────────────────────────────────────────────────────────
  // SCENE 7: Wealth Engines & Side Hustles (8.11s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 7: Ventures & Wealth Engines (8.1s)');
  await updateSubtitle(
    "You can also incubate passive cash flow ventures like rental real estate or digital businesses to generate recurring passive income.",
    "🚀 Scene 7 · Passive Cash Flow Ventures"
  );
  await sleep(1000);

  // Click + New Venture / Side Hustle
  const ventureBtn = page.locator('button:has-text("+ New Venture / Side Hustle")').first();
  if (await ventureBtn.isVisible()) {
    await ventureBtn.hover();
    await sleep(400);
    await ventureBtn.click({ force: true });
    await sleep(2500);

    // Incubator modal is open: Hover over Boutique Franchise or Rental Property
    await page.mouse.move(640, 450);
    await sleep(1500);

    // Close modal
    const closeVenture = page.locator('button:has-text("✕")').first();
    if (await closeVenture.isVisible()) {
      await closeVenture.click({ force: true });
    }
  }
  await sleep(2710);

  // ─────────────────────────────────────────────────────────────
  // SCENE 8: Outro & Summary (10.51s)
  // ─────────────────────────────────────────────────────────────
  console.log('🎬 Recording Scene 8: Outro & Financial Freedom (10.5s)');
  await updateSubtitle(
    "CashMeOut gives you the power to master real-world personal finance with a calm, modern interface. Play smart, compound early, and cash out!",
    "🏆 Scene 8 · Master Your Wealth with CashMeOut"
  );
  await sleep(1500);

  // Smooth scroll showing the whole dashboard
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await sleep(2500);

  await page.mouse.move(640, 200);
  await sleep(2500);

  await page.mouse.move(640, 500);
  await sleep(4010);

  // Close context to flush video to disk
  console.log('Stopping video recording and flushing file to disk...');
  await context.close();
  await browser.close();

  // Find the recorded video file in RECORDINGS_DIR
  const files = fs.readdirSync(RECORDINGS_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('No recorded video file found in ' + RECORDINGS_DIR);
  }
  const rawVideoPath = path.join(RECORDINGS_DIR, files[0]);
  console.log('✓ Raw video recorded at:', rawVideoPath);

  // Merge with audio using ffmpeg
  const ffmpegBin = '/home/rutvej/Desktop/cashflow-game/node_modules/ffmpeg-static/ffmpeg';
  const masterAudio = '/tmp/cashmeout_demo_audio/master_voiceover.mp3';
  const outputMp4 = '/home/rutvej/Desktop/cashflow-game/demo-gameplay.mp4';
  const outputWebm = '/home/rutvej/Desktop/cashflow-game/demo-gameplay.webm';
  const artifactDir = '/home/rutvej/.gemini/antigravity-cli/brain/3f6e934c-e2cd-4550-ae5f-80d7923441bf';

  console.log('Multiplexing video and voiceover audio track with ffmpeg...');
  
  // 1. MP4 (H.264 + AAC) - Fast-start for web streaming and universal GitHub playback
  const mp4Cmd = `${ffmpegBin} -y -i "${rawVideoPath}" -i "${masterAudio}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "${outputMp4}"`;
  execSync(mp4Cmd);
  console.log('✓ Successfully generated MP4 video at:', outputMp4);

  // 2. WebM (VP9/VP8 + Opus)
  const webmCmd = `${ffmpegBin} -y -i "${rawVideoPath}" -i "${masterAudio}" -c:v copy -c:a libopus -b:a 128k -shortest "${outputWebm}"`;
  execSync(webmCmd);
  console.log('✓ Successfully generated WebM video at:', outputWebm);

  // 3. Copy to artifact directory
  fs.copyFileSync(outputMp4, path.join(artifactDir, 'demo-gameplay.mp4'));
  fs.copyFileSync(outputWebm, path.join(artifactDir, 'demo-gameplay.webm'));
  console.log('✓ Copied both video formats to artifact directory!');

  console.log('\n🎉 ALL DONE! Video demo with voiceover successfully created!');
}

recordWalkthrough().catch((err) => {
  console.error('❌ Video recording failed:', err);
  process.exit(1);
});
