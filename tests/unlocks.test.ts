import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { UnlockManager } from '../src/progression/unlock-manager';
import { FEATURE_UNLOCKS } from '../src/progression/unlock-catalog';

describe('Progressive Unlock System', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('contains definitions for all core game financial capabilities', () => {
    expect(FEATURE_UNLOCKS.length).toBe(7);
  });

  it('keeps high-tier features locked initially', () => {
    const manager = new UnlockManager();

    expect(manager.isUnlocked('real-estate')).toBe(false);
    expect(manager.isUnlocked('business')).toBe(false);
    expect(manager.isUnlocked('gold')).toBe(false);
  });

  it('progressively detects new unlocks as Net Worth and Days grow', () => {
    const state = createInitialState();
    const manager = new UnlockManager();

    // Day 1
    let newlyUnlocked = manager.checkNewUnlocks(state);
    // Real-estate should definitely NOT be unlocked yet
    expect(manager.isUnlocked('real-estate')).toBe(false);

    // Fast-forward to Day 15 with ₹30,000 Net Worth
    state.player.currentDay = 15;
    state.player.money = 25000;
    state.player.savingsBalance = 5000;

    newlyUnlocked = manager.checkNewUnlocks(state);
    expect(newlyUnlocked.some(u => u.id === 'banking' || u.id === 'stocks')).toBe(true);
    expect(manager.isUnlocked('banking')).toBe(true);
    expect(manager.isUnlocked('stocks')).toBe(true);
  });

  it('unlocks Lakhpati Commercial Franchises at ₹1,00,000 Net Worth', () => {
    const state = createInitialState();
    const manager = new UnlockManager();

    state.player.money = 120000;
    const newlyUnlocked = manager.checkNewUnlocks(state);

    expect(newlyUnlocked.some(u => u.id === 'business')).toBe(true);
    expect(manager.isUnlocked('business')).toBe(true);
  });
});
