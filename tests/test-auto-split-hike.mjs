// Verification test for Auto-Split on Hike:
// Increases existing investments proportionally based on what the player already decided,
// without recalculating from 0 across all goals.

import { useGameStore } from '../src/engine/store.js';

console.log('🧪 Starting Auto-Split on Hike Test Suite...\n');

// ─── Test 1: Multiple Decided Investments & Preserved Cash Buffer ───────────
console.log('Test 1: Proportional increase of decided investments while preserving 0-SIP goals & cash buffer...');

useGameStore.setState({
  character: {
    monthlySurplus: 34000, // 30,000 old + 4,000 hike
  },
  simulation: {
    activeModal: {
      type: 'raise',
      deltaSurplus: 4000,
      oldTakeHome: 80000,
      newTakeHome: 84000,
    },
    modalQueue: [],
    isPaused: true,
  },
  goals: [
    { id: 'goal_emergency', name: 'Emergency Fund', baseMonthlySIP: 5000, targetAmount: 100000, currentAmount: 20000, allocationPercent: 17 },
    { id: 'goal_vacation', name: 'Vacation', baseMonthlySIP: 0, targetAmount: 50000, currentAmount: 0, allocationPercent: 0 },
    { id: 'goal_car', name: 'Car', baseMonthlySIP: 0, targetAmount: 600000, currentAmount: 0, allocationPercent: 0 },
    { id: 'goal_house', name: 'Home Downpayment', baseMonthlySIP: 10000, targetAmount: 2000000, currentAmount: 100000, allocationPercent: 33 },
    { id: 'goal_retirement', name: 'Retirement', baseMonthlySIP: 5000, targetAmount: 50000000, currentAmount: 100000, allocationPercent: 17 },
  ],
});

useGameStore.getState().applyRaiseStrategy('proportional_split');

const updatedGoals1 = useGameStore.getState().goals;
const emg1 = updatedGoals1.find((g) => g.id === 'goal_emergency');
const vac1 = updatedGoals1.find((g) => g.id === 'goal_vacation');
const car1 = updatedGoals1.find((g) => g.id === 'goal_car');
const house1 = updatedGoals1.find((g) => g.id === 'goal_house');
const ret1 = updatedGoals1.find((g) => g.id === 'goal_retirement');

console.log(`  -> Emergency Fund SIP: ₹5,000 ➔ ₹${emg1.baseMonthlySIP} (Expected: ₹6,000)`);
console.log(`  -> Home Downpayment SIP: ₹10,000 ➔ ₹${house1.baseMonthlySIP} (Expected: ₹12,000)`);
console.log(`  -> Retirement SIP: ₹5,000 ➔ ₹${ret1.baseMonthlySIP} (Expected: ₹6,000)`);
console.log(`  -> Vacation SIP: ₹0 ➔ ₹${vac1.baseMonthlySIP} (Expected: ₹0)`);
console.log(`  -> Car SIP: ₹0 ➔ ₹${car1.baseMonthlySIP} (Expected: ₹0)`);

if (emg1.baseMonthlySIP !== 6000) {
  throw new Error(`Expected Emergency Fund SIP = 6000, got ${emg1.baseMonthlySIP}`);
}
if (house1.baseMonthlySIP !== 12000) {
  throw new Error(`Expected Home Downpayment SIP = 12000, got ${house1.baseMonthlySIP}`);
}
if (ret1.baseMonthlySIP !== 6000) {
  throw new Error(`Expected Retirement SIP = 6000, got ${ret1.baseMonthlySIP}`);
}
if (vac1.baseMonthlySIP !== 0 || car1.baseMonthlySIP !== 0) {
  throw new Error(`Non-invested goals should remain 0! Got vacation=${vac1.baseMonthlySIP}, car=${car1.baseMonthlySIP}`);
}

const totalSIP1 = updatedGoals1.reduce((sum, g) => sum + g.baseMonthlySIP, 0);
console.log(`  -> Total SIPs: ₹20,000 ➔ ₹${totalSIP1} (Delta: +₹${totalSIP1 - 20000}, Expected delta: +₹4,000)`);
if (totalSIP1 !== 24000) {
  throw new Error(`Expected total SIP = 24000, got ${totalSIP1}`);
}
const cashBuffer1 = 34000 - totalSIP1;
console.log(`  -> Cash buffer preserved at ₹${cashBuffer1} (Expected: ₹10,000)`);
if (cashBuffer1 !== 10000) {
  throw new Error(`Expected cash buffer preserved at 10000, got ${cashBuffer1}`);
}
console.log('✓ Test 1 passed: investments increased strictly as decided, 0-SIP goals untouched, cash buffer preserved!\n');


// ─── Test 2: Single Decided Investment ──────────────────────────────────────
console.log('Test 2: Single decided investment receives entire hike increase...');

useGameStore.setState({
  character: {
    monthlySurplus: 25000,
  },
  simulation: {
    activeModal: {
      type: 'raise',
      deltaSurplus: 3000,
    },
    modalQueue: [],
    isPaused: true,
  },
  goals: [
    { id: 'goal_emergency', name: 'Emergency Fund', baseMonthlySIP: 0, targetAmount: 100000, currentAmount: 0 },
    { id: 'goal_retirement', name: 'Retirement', baseMonthlySIP: 10000, targetAmount: 50000000, currentAmount: 50000 },
  ],
});

useGameStore.getState().applyRaiseStrategy('proportional_split');

const updatedGoals2 = useGameStore.getState().goals;
const emg2 = updatedGoals2.find((g) => g.id === 'goal_emergency');
const ret2 = updatedGoals2.find((g) => g.id === 'goal_retirement');

if (emg2.baseMonthlySIP !== 0) {
  throw new Error(`Expected Emergency Fund to stay 0, got ${emg2.baseMonthlySIP}`);
}
if (ret2.baseMonthlySIP !== 13000) {
  throw new Error(`Expected Retirement SIP = 13000 (10000 + 3000), got ${ret2.baseMonthlySIP}`);
}
console.log(`  -> Retirement SIP: ₹10,000 ➔ ₹${ret2.baseMonthlySIP}`);
console.log('✓ Test 2 passed: single investment increased correctly!\n');


// ─── Test 3: Completed Goal is Skipped from Hike Split ──────────────────────
console.log('Test 3: Completed goal does not receive hike increase...');

useGameStore.setState({
  character: {
    monthlySurplus: 30000,
  },
  simulation: {
    activeModal: {
      type: 'raise',
      deltaSurplus: 3000,
    },
    modalQueue: [],
    isPaused: true,
  },
  goals: [
    // Completed emergency fund
    { id: 'goal_emergency', name: 'Emergency Fund', baseMonthlySIP: 5000, targetAmount: 100000, currentAmount: 100000, status: 'completed' },
    { id: 'goal_house', name: 'House', baseMonthlySIP: 10000, targetAmount: 1000000, currentAmount: 200000 },
    { id: 'goal_retirement', name: 'Retirement', baseMonthlySIP: 5000, targetAmount: 50000000, currentAmount: 50000 },
  ],
});

useGameStore.getState().applyRaiseStrategy('proportional_split');

const updatedGoals3 = useGameStore.getState().goals;
const emg3 = updatedGoals3.find((g) => g.id === 'goal_emergency');
const house3 = updatedGoals3.find((g) => g.id === 'goal_house');
const ret3 = updatedGoals3.find((g) => g.id === 'goal_retirement');

if (emg3.baseMonthlySIP !== 5000) {
  throw new Error(`Completed goal SIP should remain unchanged! Got ${emg3.baseMonthlySIP}`);
}
// 10,000 and 5,000 split 3,000 in 2:1 ratio (2000 to house, 1000 to retirement)
if (house3.baseMonthlySIP !== 12000) {
  throw new Error(`Expected House SIP = 12000, got ${house3.baseMonthlySIP}`);
}
if (ret3.baseMonthlySIP !== 6000) {
  throw new Error(`Expected Retirement SIP = 6000, got ${ret3.baseMonthlySIP}`);
}
console.log(`  -> Completed Emergency Fund SIP remained ₹5,000`);
console.log(`  -> House SIP: ₹10,000 ➔ ₹${house3.baseMonthlySIP}`);
console.log(`  -> Retirement SIP: ₹5,000 ➔ ₹${ret3.baseMonthlySIP}`);
console.log('✓ Test 3 passed: completed goals are safely excluded from hike distribution!\n');


// ─── Test 4: All Goals at ₹0 (Instant Start) ────────────────────────────────
console.log('Test 4: Instant Start (all SIPs 0) maintains 0 SIPs without crashing or phantom allocations...');

useGameStore.setState({
  character: {
    monthlySurplus: 25000,
  },
  simulation: {
    activeModal: {
      type: 'raise',
      deltaSurplus: 5000,
    },
    modalQueue: [],
    isPaused: true,
  },
  goals: [
    { id: 'goal_emergency', name: 'Emergency Fund', baseMonthlySIP: 0, targetAmount: 100000, currentAmount: 0 },
    { id: 'goal_retirement', name: 'Retirement', baseMonthlySIP: 0, targetAmount: 50000000, currentAmount: 0 },
  ],
});

useGameStore.getState().applyRaiseStrategy('proportional_split');

const updatedGoals4 = useGameStore.getState().goals;
for (const g of updatedGoals4) {
  if (g.baseMonthlySIP !== 0) {
    throw new Error(`Expected goal ${g.id} SIP to remain 0, got ${g.baseMonthlySIP}`);
  }
}
console.log('✓ Test 4 passed: Instant start with 0 investments cleanly preserves 0 SIPs!\n');

console.log('🎉 ALL AUTO-SPLIT ON HIKE UNIT TESTS PASSED WITH 100% SUCCESS!');
