import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { calculateNetWorth, processDayEconomy } from '../src/engine/economy-engine';
import { processHealthAndConsequences } from '../src/engine/health-engine';
import { SeededRNG } from '../src/engine/prng';
import { tickMarket } from '../src/engine/market-engine';
import { tickNpcs } from '../src/engine/npc-engine';

describe('Cashflow Life-Economy Engine', () => {
  it('calculates initial net worth accurately', () => {
    const state = createInitialState();
    const netWorth = calculateNetWorth(state);
    expect(netWorth).toBeGreaterThan(0);
    expect(state.player.money).toBe(15000);
    expect(state.player.savingsBalance).toBe(5000);
  });

  it('deducts daily living expenses and handles salary pay cycles', () => {
    const state = createInitialState();
    const initialMoney = state.player.money;

    // Simulate 1 day
    processDayEconomy(state, 2);
    expect(state.player.money).toBeLessThan(initialMoney);

    // Payday on cycle day 15
    const beforePay = state.player.money;
    processDayEconomy(state, 15);
    expect(state.player.money).toBeGreaterThan(beforePay);
  });

  it('triggers health consequences from prolonged street food consumption', () => {
    const state = createInitialState();
    state.player.lifestyle.foodTier = 'street';

    let triggeredEvent = false;
    for (let day = 1; day <= 22; day++) {
      const res = processHealthAndConsequences(state, day);
      if (res.triggered && res.name?.includes('Gastroenteritis')) {
        triggeredEvent = true;
        break;
      }
    }
    expect(triggeredEvent).toBe(true);
  });

  it('maintains deterministic PRNG sequences across sessions', () => {
    const rng1 = new SeededRNG(999);
    const rng2 = new SeededRNG(999);

    const rolls1 = [rng1.next(), rng1.next(), rng1.range(10, 50)];
    const rolls2 = [rng2.next(), rng2.next(), rng2.range(10, 50)];

    expect(rolls1).toEqual(rolls2);
  });

  it('runs market tickers and NPC autonomous agents without errors', () => {
    const state = createInitialState();
    const rng = new SeededRNG(42);

    for (let d = 1; d <= 10; d++) {
      tickMarket(state, d, rng);
      tickNpcs(state, d, rng);
    }

    expect(state.market.tickers[0].history.length).toBeGreaterThan(3);
  });
});
