import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/data/initial-state';
import { GameLoop } from '../src/engine/game-loop';
import { tickDailyHealth } from '../src/engine/health';
import { updateMarketPricesMonthly } from '../src/engine/market';

describe('Game Simulation Engine & Loop', () => {
  it('advances days and updates timeline info', () => {
    const state = createInitialState();
    let renders = 0;
    const loop = new GameLoop(state, {
      onRender: () => { renders++; },
      onSalaryDay: () => {},
      onYearEndTax: () => {},
      onGameOver: () => {}
    });

    expect(state.player.currentDay).toBe(1);
    loop.stepDay();
    expect(state.player.currentDay).toBe(2);
    expect(renders).toBe(1);
  });

  it('triggers cascading health burnout when mental drops <= 20', () => {
    const state = createInitialState();
    state.resources.mentalHealth = 18;
    const res = tickDailyHealth(state);
    expect(res.triggeredBurnout).toBe(true);
    expect(state.simulation.burnoutEpisodeCount).toBe(1);
    expect(state.resources.mentalHealth).toBe(45); // stabilized recovery
  });

  it('triggers emergency hospitalization when physical drops <= 15', () => {
    const state = createInitialState();
    state.resources.physicalHealth = 12;
    const res = tickDailyHealth(state);
    expect(res.triggeredMedicalEmergency).toBe(true);
    expect(state.simulation.hospitalizationCount).toBe(1);
    expect(state.resources.physicalHealth).toBe(40); // emergency stabilization
  });

  it('updates market asset prices on monthly transition', () => {
    const state = createInitialState();
    expect(state.simulation.macroPhase).toBe('BULL_RUN');
    updateMarketPricesMonthly(state);
    expect(state.simulation.macroPhase).toBe('BULL_RUN');
  });

  it('advances an entire month smoothly with advanceMonth', () => {
    const state = createInitialState();
    state.player.currentDay = 2; // start on day 2 so advanceMonth steps to day 1 of next month
    let salaryTriggered = false;
    const loop = new GameLoop(state, {
      onRender: () => {},
      onSalaryDay: () => { salaryTriggered = true; },
      onYearEndTax: () => {},
      onGameOver: () => {}
    });

    loop.advanceMonth();
    expect(state.player.currentMonth).toBe(2);
    expect(salaryTriggered).toBe(true);
  });
});
