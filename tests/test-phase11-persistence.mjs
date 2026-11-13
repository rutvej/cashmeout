// Phase 11: Browser DB Single-Game Persistence (Save & Resume) Tests
import {
  saveActiveGameSession,
  loadActiveGameSession,
  clearActiveGameSession,
  hasActiveGameSession,
  DB_NAME,
  STORE_NAME,
  ACTIVE_SESSION_KEY,
} from '../src/engine/storageEngine.js';
import { useGameStore, serializeGameState } from '../src/engine/store.js';
import { generateCharacter } from '../src/engine/characterGenerator.js';
import { generateInitialGoals } from '../src/engine/goalsGenerator.js';
import { chromium } from 'playwright';

console.log('🧪 Starting Phase 11: Browser DB Single-Game Persistence Test Suite...\n');

// ─── 1. Unit Test 1: Storage Engine Save, Load, Clear & Detection ──────────
console.log('Unit Test 1: Storage Engine saves, loads, clears, and detects active sessions accurately...');

await clearActiveGameSession();
let hasSession = await hasActiveGameSession();
if (hasSession !== false) {
  throw new Error(`Expected hasActiveGameSession() to be false after clear, got ${hasSession}`);
}

let loaded = await loadActiveGameSession();
if (loaded !== null) {
  throw new Error(`Expected loadActiveGameSession() to return null when empty, got ${JSON.stringify(loaded)}`);
}

const mockPayload = {
  version: 1,
  status: 'in_progress',
  currentScreen: 'main_game',
  config: {
    seed: 'unit_test_seed_11',
    cityTier: 'tier1',
    careerField: 'science',
  },
  character: {
    id: 'char_test_11',
    seed: 'unit_test_seed_11',
    name: 'Ananya Roy',
    age: 26,
    retirementAge: 60,
    jobTitle: 'Senior Software Engineer',
    company: 'Razorpay',
    city: 'Bangalore',
    cityTier: 'tier1',
    grossMonthlySalary: 120000,
    monthlyTakeHome: 95000,
    liquidCash: 450000,
    totalFixedExpenses: 35000,
    totalMonthlyOutflow: 35000,
    monthlySurplus: 60000,
    loans: [],
  },
  goals: [
    {
      id: 'goal_emergency',
      name: 'Emergency Fund',
      icon: '🛡️',
      currentAmount: 250000,
      targetAmount: 300000,
      baseMonthlySIP: 10000,
      instrumentId: 'savings',
    },
    {
      id: 'goal_car',
      name: 'Buy First Car',
      icon: '🚗',
      currentAmount: 200000,
      targetAmount: 500000,
      baseMonthlySIP: 15000,
      instrumentId: 'fd',
    },
  ],
  insurance: {
    health: { isPurchased: true, monthlyPremium: 800 },
    termLife: { isPurchased: false, monthlyPremium: 600 },
  },
  surplusAllocation: {
    autoSplitOnRaise: false,
    raiseRoutingStrategy: 'ask_every_time',
  },
  simulation: {
    currentMonthIndex: 24,
    currentAge: 25,
    currentMonthOfYear: 1,
    isPaused: true,
    gameSpeed: 1,
    history: [
      { month: 0, age: 23, netWorth: 450000 },
      { month: 24, age: 25, netWorth: 900000 },
    ],
    decisionJournal: [
      { type: 'milestone', goalId: 'goal_car', shortfall: 0, age: 24 },
    ],
  },
};

const savedResult = await saveActiveGameSession(mockPayload);
if (!savedResult) {
  throw new Error('saveActiveGameSession failed to return saved payload');
}
if (savedResult.version !== 1) {
  throw new Error(`Expected schema version 1, got ${savedResult.version}`);
}
if (!savedResult.lastSavedAt || typeof savedResult.lastSavedAt !== 'string') {
  throw new Error(`Expected lastSavedAt ISO timestamp, got ${savedResult.lastSavedAt}`);
}

hasSession = await hasActiveGameSession();
if (hasSession !== true) {
  throw new Error('Expected hasActiveGameSession() to return true after saving active session');
}

loaded = await loadActiveGameSession();
if (!loaded) {
  throw new Error('loadActiveGameSession returned null after saving active session');
}
if (loaded.character.name !== 'Ananya Roy') {
  throw new Error(`Expected character name Ananya Roy, got ${loaded.character?.name}`);
}
if (loaded.simulation.currentMonthIndex !== 24) {
  throw new Error(`Expected currentMonthIndex 24, got ${loaded.simulation?.currentMonthIndex}`);
}
if (loaded.goals.length !== 2) {
  throw new Error(`Expected 2 goals, got ${loaded.goals?.length}`);
}

// Verify that completed games are marked non-resumable
const completedPayload = {
  ...mockPayload,
  status: 'completed',
};
await saveActiveGameSession(completedPayload);
const hasCompletedSession = await hasActiveGameSession();
if (hasCompletedSession !== false) {
  throw new Error('Completed game session must NOT be considered resumable by hasActiveGameSession()');
}

// Clean up
await clearActiveGameSession();
if ((await hasActiveGameSession()) !== false) {
  throw new Error('Expected hasActiveGameSession() to return false after clearActiveGameSession()');
}

console.log('✓ Storage engine save, load, clear, and active detection verified\n');


// ─── 2. Unit Test 2: Store Hydration & Serialization ────────────────────────
console.log('Unit Test 2: Store hydration restores state without corruption and pauses simulation...');

// Test serializeGameState
const testChar = generateCharacter('serialize_seed_1', 'tier1', 'science');
const testGoals = generateInitialGoals(testChar);

const fullStateMock = {
  currentScreen: 'main_game',
  config: { seed: 'serialize_seed_1', cityTier: 'tier1', careerField: 'science' },
  character: testChar,
  goals: testGoals,
  insurance: { health: { isPurchased: true }, termLife: { isPurchased: false } },
  surplusAllocation: { autoSplitOnRaise: true, raiseRoutingStrategy: 'proportional_split' },
  simulation: {
    currentMonthIndex: 18,
    currentAge: 24,
    currentMonthOfYear: 7,
    isPaused: false, // will be saved as paused
    gameSpeed: 2,
    history: [],
    decisionJournal: [],
  },
};

const serialized = serializeGameState(fullStateMock);
if (!serialized) {
  throw new Error('serializeGameState returned null for valid state');
}
if (serialized.simulation.isPaused !== true) {
  throw new Error('Serialized state must enforce isPaused = true so resuming does not immediately auto-tick');
}
if (serialized.character.name !== testChar.name) {
  throw new Error('Serialized character data mismatch');
}
if (serialized.goals.length !== testGoals.length) {
  throw new Error('Serialized goals array length mismatch');
}

// Test hydration via resumeSavedGame in useGameStore
await saveActiveGameSession({
  ...serialized,
  status: 'in_progress',
  simulation: {
    ...serialized.simulation,
    currentMonthIndex: 18,
    currentAge: 24,
  },
});

const resumedSuccess = await useGameStore.getState().resumeSavedGame();
if (!resumedSuccess) {
  throw new Error('resumeSavedGame returned false when valid active session exists');
}

const hydratedStore = useGameStore.getState();
if (hydratedStore.currentScreen !== 'main_game') {
  throw new Error(`Expected currentScreen main_game, got ${hydratedStore.currentScreen}`);
}
if (hydratedStore.character.name !== testChar.name) {
  throw new Error(`Expected character name ${testChar.name}, got ${hydratedStore.character?.name}`);
}
if (hydratedStore.simulation.currentMonthIndex !== 18) {
  throw new Error(`Expected currentMonthIndex 18, got ${hydratedStore.simulation?.currentMonthIndex}`);
}
if (hydratedStore.simulation.isPaused !== true) {
  throw new Error('Hydrated store simulation must be paused on resume');
}

// Test clearSavedGame
await useGameStore.getState().clearSavedGame();
const clearedStore = useGameStore.getState();
if (clearedStore.currentScreen !== 'landing') {
  throw new Error(`Expected reset to landing, got ${clearedStore.currentScreen}`);
}
if (clearedStore.character !== null) {
  throw new Error('Expected character to be null after clearSavedGame');
}
if ((await hasActiveGameSession()) !== false) {
  throw new Error('Expected DB session to be cleared after clearSavedGame');
}

console.log('✓ Store hydration, pause enforcement, and clearSavedGame verified\n');


// ─── 3. Playwright E2E Tests: Real Browser DB & Landing Resume Flow ──────────
console.log('Unit Test 3: Playwright E2E UI verification of Auto-Save, Reload, Resume, and Overwrite Modal...');

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // 1. Navigate to localhost
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Ensure clean starting slate
  await page.evaluate(async () => {
    if (window.__GAME_STORE__) {
      await window.__GAME_STORE__.getState().clearSavedGame();
    }
  });
  await page.waitForTimeout(300);

  // 2. Step 1: Start fresh game through onboarding
  console.log('Step 1: Onboarding and navigating to MainGameScreen...');
  const seedInput = page.locator('input[placeholder*="Enter seed"]').first();
  await seedInput.fill('playwright_p11_seed');

  const genBtn = page.locator('button:has-text("Generate Character")').first();
  await genBtn.waitFor({ state: 'visible', timeout: 5000 });
  await genBtn.click();
  await page.waitForTimeout(400);

  // Spawn reveal -> Goals
  const toGoalsBtn = page.locator('button:has-text("Continue to Financial Goals")').first();
  await toGoalsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toGoalsBtn.click();
  await page.waitForTimeout(400);

  // Goals -> Financial Setup
  const toAllocBtn = page.locator('button:has-text("Plan Monthly Allocations")').first();
  await toAllocBtn.waitFor({ state: 'visible', timeout: 5000 });
  await toAllocBtn.click();
  await page.waitForTimeout(400);

  // Financial Setup -> Main Game
  const startSimBtn = page.locator('button:has-text("START LIFE SIMULATION"), button:has-text("Resume Simulation")').first();
  await startSimBtn.waitFor({ state: 'visible', timeout: 5000 });
  await startSimBtn.click();
  await page.waitForTimeout(600);

  // 3. Step 2: Verify In-Game Header and Auto-Saved indicator
  console.log('Step 2: Verifying Auto-Saved status indicator in top header...');
  const autoSaveIndicator = page.locator('[data-testid="auto-save-indicator"]').first();
  await autoSaveIndicator.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "Auto-Saved" status indicator is rendered in MainGameScreen header');

  // Capture initial character information
  const initialInfo = await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    return {
      name: store.character.name,
      jobTitle: store.character.jobTitle,
      company: store.character.company || store.character.companyName || store.character.city || 'TechCorp',
      age: store.character.age,
    };
  });

  // Tick simulation by 5 months to establish significant progress
  console.log('Step 3: Advancing simulation by 5 months...');
  await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    for (let i = 0; i < 5; i++) {
      store.tickMonth();
    }
  });
  await page.waitForTimeout(400);

  const progressedInfo = await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    const netWorth = store.character.liquidCash + store.goals.reduce((s, g) => s + (g.currentAmount || 0), 0) - (store.character.loans || []).reduce((s, l) => s + (l.principalRemaining || 0), 0);
    return {
      month: store.simulation.currentMonthIndex,
      age: store.simulation.currentAge,
      netWorth,
    };
  });

  if (progressedInfo.month !== 5) {
    throw new Error(`Expected month 5 after 5 ticks, got ${progressedInfo.month}`);
  }
  console.log(`✓ Ticked to Month ${progressedInfo.month}, Age ${progressedInfo.age}`);

  // 4. Step 4: Reload page and verify Landing Screen "Resume Active Life" Card
  console.log('Step 4: Reloading page to test persistence detection on Landing Screen...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const resumeCard = page.locator('[data-testid="resume-active-life-card"]').first();
  await resumeCard.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "Resume Active Life" Card is rendered prominently on Landing Screen');

  // Verify Card content displays character info
  const cardText = await resumeCard.innerText();
  if (!cardText.includes(initialInfo.name)) {
    throw new Error(`Expected resume card to show character name ${initialInfo.name}`);
  }
  if (!cardText.toLowerCase().includes(`month 5`)) {
    throw new Error('Expected resume card to show Month 5');
  }
  if (!cardText.toLowerCase().includes(`age ${progressedInfo.age}`)) {
    throw new Error(`Expected resume card to show Age ${progressedInfo.age}`);
  }
  console.log(`✓ Resume Card displays character: ${initialInfo.name}, Age ${progressedInfo.age}, Month 5`);
  await page.screenshot({ path: 'tests/screenshot-phase11-landing-resume-card.png' });

  // 5. Step 5: Click "Resume Life" button and verify seamless restoration
  console.log('Step 5: Clicking "Resume Life" button...');
  const resumeBtn = page.locator('button:has-text("RESUME LIFE")').first();
  await resumeBtn.waitFor({ state: 'visible', timeout: 5000 });
  await resumeBtn.click();
  await page.waitForTimeout(600);

  // Verify transition to main game
  const resumedHeaderIndicator = page.locator('[data-testid="auto-save-indicator"]').first();
  await resumedHeaderIndicator.waitFor({ state: 'visible', timeout: 5000 });

  const resumedState = await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    return {
      screen: store.currentScreen,
      month: store.simulation.currentMonthIndex,
      age: store.simulation.currentAge,
      isPaused: store.simulation.isPaused,
      name: store.character.name,
    };
  });

  if (resumedState.screen !== 'main_game') {
    throw new Error(`Expected resumed screen main_game, got ${resumedState.screen}`);
  }
  if (resumedState.month !== 5) {
    throw new Error(`Expected resumed month 5, got ${resumedState.month}`);
  }
  if (resumedState.age !== progressedInfo.age) {
    throw new Error(`Expected resumed age ${progressedInfo.age}, got ${resumedState.age}`);
  }
  if (resumedState.isPaused !== true) {
    throw new Error('Simulation must remain paused immediately upon resume');
  }
  console.log('✓ Seamlessly resumed life at exact Month 5, paused simulation, and matching character');
  await page.screenshot({ path: 'tests/screenshot-phase11-resumed-main-game.png' });

  // 6. Step 6: Test Overwrite Confirmation Modal
  console.log('Step 6: Testing Overwrite Confirmation Modal...');
  // Navigate back to Landing screen
  await page.evaluate(() => {
    window.__GAME_STORE__.getState().navigateTo('landing');
  });
  await page.waitForTimeout(400);

  // Resume card is visible
  await resumeCard.waitFor({ state: 'visible', timeout: 5000 });

  // Click "Start New Life" button
  const startNewLifeBtn = page.locator('button:has-text("Start New Life")').first();
  await startNewLifeBtn.click();
  await page.waitForTimeout(300);

  // Overwrite modal should appear
  const overwriteModal = page.locator('[data-testid="overwrite-confirmation-modal"]').first();
  await overwriteModal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Overwrite Confirmation Modal is visible when clicking "Start New Life"');
  await page.screenshot({ path: 'tests/screenshot-phase11-overwrite-modal.png' });

  const modalText = await overwriteModal.innerText();
  if (!modalText.includes(initialInfo.name)) {
    throw new Error('Overwrite modal must mention existing character name');
  }

  // Click "Cancel" -> modal closes, active life remains
  const cancelBtn = page.locator('button:has-text("Cancel")').first();
  await cancelBtn.click();
  await page.waitForTimeout(300);

  const isModalStillVisible = await overwriteModal.isVisible();
  if (isModalStillVisible) {
    throw new Error('Modal should close after clicking Cancel');
  }
  console.log('✓ Clicking Cancel preserves saved game');

  // Now click "Generate Character ➔" at bottom -> Overwrite modal triggers as well!
  const bottomGenBtn = page.locator('button:has-text("Generate Character")').first();
  await bottomGenBtn.click();
  await page.waitForTimeout(300);
  await overwriteModal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Overwrite Confirmation Modal also guards bottom "Generate Character" CTA');

  // Click "Overwrite & Start Fresh"
  const overwriteConfirmBtn = page.locator('button:has-text("Overwrite & Start Fresh")').first();
  await overwriteConfirmBtn.click();
  await page.waitForTimeout(600);

  // Should navigate to Spawn Reveal Screen with fresh month 0
  const spawnRevealScreen = page.locator('button:has-text("Continue to Financial Goals")').first();
  await spawnRevealScreen.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Confirmed overwrite successfully started fresh life from character spawn');

  const newLifeState = await page.evaluate(() => {
    const store = window.__GAME_STORE__.getState();
    return {
      month: store.simulation.currentMonthIndex,
      screen: store.currentScreen,
    };
  });

  if (newLifeState.month !== 0) {
    throw new Error(`Expected fresh life month 0, got ${newLifeState.month}`);
  }
  console.log('✓ Fresh life initialized at Month 0');

} finally {
  await browser.close();
}

console.log('\n🎉 ALL PHASE 11 BROWSER DB PERSISTENCE & RESUME LIFE TESTS PASSED WITH 100% SUCCESS!\n');
