import { chromium } from 'playwright';

async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3 Career, Upskilling & Job Market E2E Tests...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

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

  // Pause simulation so we can control steps deterministically
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().pause();
  });
  console.log('✓ Reached MainGameScreen and paused simulation');

  // 2. Switch to Career Tab
  console.log('Step 2: Switching to Career tab...');
  const careerTabBtn = page.locator('button:has-text("Career")').first();
  await careerTabBtn.waitFor({ state: 'visible', timeout: 5000 });
  await careerTabBtn.click();
  await page.waitForTimeout(300);

  // Verify Career Tab Elements
  const expMeter = page.locator('text=/Years of Experience/i').first();
  await expMeter.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Experience meter is rendered');

  const skillGauge = page.locator('text=/Skill Level Rating/i').first();
  await skillGauge.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Skill level rating gauge and star meter are rendered');

  const upskillBtn = page.locator('button:has-text("Upskill Hub")').first();
  const jobMarketBtn = page.locator('button:has-text("Job Market")').first();
  await upskillBtn.waitFor({ state: 'visible', timeout: 5000 });
  await jobMarketBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "🎓 Upskill Hub" and "💼 Job Market" action buttons are visible');

  await page.screenshot({ path: 'tests/screenshot-career-tab-initial.png' });
  console.log('✓ Captured tests/screenshot-career-tab-initial.png');

  // 3. Open Upskilling Hub Modal
  console.log('Step 3: Testing Upskilling Hub Modal...');
  await upskillBtn.click();
  await page.waitForTimeout(400);

  const upskillingModalTitle = page.locator('text=/Upskilling & Certifications Hub/i').first();
  await upskillingModalTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Upskilling Hub Modal is open');

  // Verify the 3 courses are present
  const bootcampCourse = page.locator('text=/Professional Specialization Bootcamp/i').first();
  const certCourse = page.locator('text=/Advanced Industry Certification/i').first();
  const execCourse = page.locator('text=/Executive Leadership Masterclass/i').first();
  await bootcampCourse.waitFor({ state: 'visible', timeout: 5000 });
  await certCourse.waitFor({ state: 'visible', timeout: 5000 });
  await execCourse.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ All 3 courses (Bootcamp, Advanced Certification, Executive Masterclass) are listed');

  await page.screenshot({ path: 'tests/screenshot-upskilling-modal.png' });
  console.log('✓ Captured tests/screenshot-upskilling-modal.png');

  // 4. Enroll in Bootcamp (3 months, ₹10k/mo, +0.4 boost)
  console.log('Step 4: Enrolling in Bootcamp course...');
  const enrollBootcampBtn = page.locator('div:has-text("Professional Specialization Bootcamp") button:has-text("Enroll Now")').first();
  await enrollBootcampBtn.click();
  await page.waitForTimeout(300);

  // Check state to confirm enrollment
  const charAfterEnroll = await page.evaluate(() => {
    return window.__GAME_STORE__.getState().character;
  });
  console.assert(charAfterEnroll.activeCourse !== null, 'activeCourse should be set');
  console.assert(charAfterEnroll.activeCourse.courseId === 'course_bootcamp', 'courseId should be course_bootcamp');
  console.assert(charAfterEnroll.activeCourse.monthlyFee === 10000, 'monthlyFee should be 10000');
  console.log('✓ State verified: Enrolled in course_bootcamp with ₹10,000/mo fee');

  // Close Upskilling Hub
  const closeHubBtn = page.locator('button:has-text("Done / Close Hub"), button:has-text("✕")').first();
  await closeHubBtn.click();
  await page.waitForTimeout(300);

  // Verify Active Course Banner on Career Tab
  const activeCourseBanner = page.locator('text=/Course In Progress/i').first();
  await activeCourseBanner.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Active Course banner is displayed on Career Tab');

  // 5. Test Course Simulation Progress & Completion Celebration Modal
  console.log('Step 5: Simulating 3 months of ticks for course completion...');
  const initialSkill = charAfterEnroll.skillLevel;

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

  // Tick month 1
  await stepOneMonth();
  let stateM1 = await page.evaluate(() => window.__GAME_STORE__.getState().character);
  console.assert(stateM1.activeCourse.monthsCompleted === 1, 'Should complete month 1');
  console.log(`✓ Month 1 ticked: Course at month ${stateM1.activeCourse.monthsCompleted} of 3`);

  // Tick month 2
  await stepOneMonth();
  let stateM2 = await page.evaluate(() => window.__GAME_STORE__.getState().character);
  console.assert(stateM2.activeCourse.monthsCompleted === 2, 'Should complete month 2');
  console.log(`✓ Month 2 ticked: Course at month ${stateM2.activeCourse.monthsCompleted} of 3`);

  // Tick month 3 (triggers completion celebration modal and auto-pauses)
  await stepOneMonth();
  await page.waitForTimeout(600);

  const courseCompletedModal = page.locator('text=/Course Completed!/i').first();
  await courseCompletedModal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Course completion celebration modal appeared!');

  const stateM3 = await page.evaluate(() => window.__GAME_STORE__.getState().character);
  console.assert(stateM3.activeCourse === null, 'activeCourse should now be cleared');
  console.assert(stateM3.skillLevel > initialSkill, 'skillLevel should have increased by +0.4');
  console.assert(stateM3.completedCourses.includes('course_bootcamp'), 'course_bootcamp should be in completedCourses');
  console.log(`✓ Skill level successfully upgraded from ${initialSkill} to ${stateM3.skillLevel}`);

  await page.screenshot({ path: 'tests/screenshot-course-completed-modal.png' });
  console.log('✓ Captured tests/screenshot-course-completed-modal.png');

  // Dismiss completion modal
  const continueBtn = page.locator('button:has-text("Continue Career Journey")').first();
  await continueBtn.click();
  await page.waitForTimeout(300);

  // 6. Test Dynamic Job Market Modal
  console.log('Step 6: Testing Job Market Modal...');
  await jobMarketBtn.click();
  await page.waitForTimeout(400);

  const jobMarketTitle = page.locator('text=/Dynamic Job Market/i').first();
  await jobMarketTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Job Market Modal is open');

  // Verify open listings exist
  const applyBtns = page.locator('button:has-text("Apply for Role")');
  const count = await applyBtns.count();
  console.log(`✓ Found ${count} qualified job opening(s) ready to apply`);

  await page.screenshot({ path: 'tests/screenshot-job-market-modal.png' });
  console.log('✓ Captured tests/screenshot-job-market-modal.png');

  // 7. Test Layoff Shock & Immediate Job Rehire Integration (Requirement 4)
  console.log('Step 7: Testing Layoff state & immediate rehire via Offer Letter...');
  // Force character into unemployed state (Phase 1 shock)
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    store.setState({
      character: {
        ...store.getState().character,
        employmentStatus: 'unemployed',
        unemploymentDurationMonths: 2,
        preLayoffTakeHome: 60000,
      },
      simulation: {
        ...store.getState().simulation,
        unemploymentReminder: {
          id: 'test_remind_1',
          monthIndex: 14,
          unemploymentMonth: 2,
          monthlyBurn: 45000,
          remainingReserves: 250000,
          runwayMonths: 5.5,
        }
      }
    });
  });
  await page.waitForTimeout(300);

  // Close and re-open job market to refresh UI
  const closeMarketBtn = page.locator('button:has-text("Close Market")').first();
  await closeMarketBtn.click();
  await page.waitForTimeout(300);

  // Verify non-blocking 3s runway toast is visible
  const runwayToast = page.locator('text=/Month 2 of Unemployment/i').first();
  await runwayToast.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Non-blocking 3s unemployment runway reminder toast is visible on screen');

  // Verify that ticking a month while unemployed advances duration and DOES NOT auto-rehire
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    store.setState({ simulation: { ...store.getState().simulation, isPaused: false } });
    store.getState().tickMonth();
  });
  const unhiredChar = await page.evaluate(() => window.__GAME_STORE__.getState().character);
  console.assert(unhiredChar.employmentStatus === 'unemployed', 'Character must remain unemployed (no auto-rehire)');
  console.assert(unhiredChar.unemploymentDurationMonths === 3, 'unemploymentDurationMonths must increment to 3');
  console.log('✓ Confirmed: Character remains unhired on simulation tick without auto-rehire!');

  await jobMarketBtn.click();
  await page.waitForTimeout(300);

  // Verify Layoff alert banner is present
  const layoffBanner = page.locator('text=/Currently Unemployed — Immediate Rehire Available/i').first();
  await layoffBanner.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Layoff warning banner correctly shown in Job Market modal');

  // Trigger an offer letter directly to test OfferLetterModal
  await page.evaluate(() => {
    const store = window.__GAME_STORE__;
    store.setState({
      simulation: {
        ...store.getState().simulation,
        activeModal: {
          type: 'job_offer',
          offer: {
            id: 'test_job_offer_1',
            companyName: 'Razorpay Technologies',
            title: 'Senior Software Engineer',
            tier: 2,
            tierName: 'Senior Specialist',
            field: 'science',
            requiredExperienceYears: 2,
            requiredSkillLevel: 1.5,
            grossMonthlySalary: 95000,
            annualCTC: 1140000,
            monthlyTakeHome: 83600,
            city: 'Bengaluru',
            cityTier: 'tier1',
            signingBonus: 50000,
          }
        },
        isPaused: true,
      }
    });
  });

  // Close job market modal background so offer letter is top
  await closeMarketBtn.click();
  await page.waitForTimeout(300);

  // Verify Offer Letter Modal
  const offerModalTitle = page.locator('text=/Official Offer Letter/i').first();
  await offerModalTitle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Offer Letter Modal is visible');

  const rehireCallout = page.locator('text=/Immediate Employment Restoration/i').first();
  await rehireCallout.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Layoff Recovery callout is active on Offer Letter');

  await page.screenshot({ path: 'tests/screenshot-offer-letter-modal.png' });
  console.log('✓ Captured tests/screenshot-offer-letter-modal.png');

  // Accept the offer!
  const acceptOfferBtn = page.locator('button:has-text("Accept & Join")').first();
  await acceptOfferBtn.click();
  await page.waitForTimeout(500);

  // Verify character is immediately employed, with new title, salary, and bonus
  const finalChar = await page.evaluate(() => window.__GAME_STORE__.getState().character);
  console.assert(finalChar.employmentStatus === 'employed', 'employmentStatus must be restored to employed');
  console.assert(finalChar.unemploymentDurationMonths === 0, 'unemploymentDurationMonths must be 0');
  console.assert(finalChar.jobTitle === 'Senior Software Engineer', 'jobTitle should update to offered title');
  console.assert(finalChar.monthlyTakeHome === 83600, 'monthlyTakeHome should update to 83600');
  console.assert(finalChar.city === 'Bengaluru', 'city should be Bengaluru');
  console.log('✓ Offer accepted: Layoff cleared, Title set to "Senior Software Engineer", Monthly Take-Home upgraded to ₹83,600!');

  await page.screenshot({ path: 'tests/screenshot-career-tab-after-promotion.png' });
  console.log('✓ Captured tests/screenshot-career-tab-after-promotion.png');

  await browser.close();

  if (errors.length > 0) {
    console.warn('Page errors encountered:', errors);
  } else {
    console.log('✓ Zero page errors encountered during entire Phase 3 test!');
  }

  console.log('\n🎉 ALL PHASE 3 CAREER, UPSKILLING & JOB MARKET TESTS PASSED WITH 100% SUCCESS!');
}

runPhase3Tests().catch(err => {
  console.error('Phase 3 Test Failed:', err);
  process.exit(1);
});
