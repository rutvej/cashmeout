import { GameState } from '../../types/game';
import { getTimelineInfo } from '../../engine/time';
import { calculateTotalNetWorth } from '../../data/life-goals';
import { formatCurrency } from './format';

export interface HudCallbacks {
  onTogglePause: () => void;
  onSetSpeed: (speed: 1 | 2 | 4) => void;
  onStepDay: () => void;
  onStepMonth: () => void;
  onOpenGoalsModal: () => void;
}

export function renderHud(state: GameState, callbacks: HudCallbacks): HTMLElement {
  const container = document.createElement('header');
  container.className = 'hud-header';

  const t = getTimelineInfo(state.player.currentDay, state.player.startingAge);
  const netWorth = calculateTotalNetWorth(state);

  container.innerHTML = `
    <div class="hud-top-row">
      <div class="player-badge">
        <span class="player-name">${state.player.name}</span>
        <span class="time-tag">Age ${t.age} • Year ${t.year}, Mo ${t.monthInYear} (Day ${t.dayInMonth})</span>
      </div>

      <div class="time-controls">
        <button id="btn-toggle-pause" class="btn-ctrl ${state.simulation.isPaused ? '' : 'active'}">
          ${state.simulation.isPaused ? '▶ Play' : '⏸ Pause'}
        </button>
        <button id="btn-speed-1" class="btn-ctrl ${state.simulation.simulationSpeed === 1 ? 'active' : ''}">1x</button>
        <button id="btn-speed-2" class="btn-ctrl ${state.simulation.simulationSpeed === 2 ? 'active' : ''}">2x</button>
        <button id="btn-speed-4" class="btn-ctrl ${state.simulation.simulationSpeed === 4 ? 'active' : ''}">4x</button>
        <button id="btn-step-day" class="btn-ctrl">Step Day</button>
        <button id="btn-step-month" class="btn-ctrl">Advance Month ⏭</button>
      </div>
    </div>

    <div class="hud-metrics-row">
      <div class="metric-pill">
        <span class="metric-label">Net Worth</span>
        <span class="metric-value ${netWorth >= 0 ? 'positive' : 'danger'}">${formatCurrency(netWorth)}</span>
      </div>

      <div class="metric-pill">
        <span class="metric-label">Checking Cash</span>
        <span class="metric-value">${formatCurrency(state.resources.cashOnHand)}</span>
      </div>

      <div class="metric-pill">
        <span class="metric-label">Emergency Buffer</span>
        <span class="metric-value positive">${formatCurrency(state.resources.emergencyFund)}</span>
      </div>

      <div class="metric-pill">
        <span class="metric-label">Physical Health</span>
        <span class="metric-value">${Math.round(state.resources.physicalHealth)}%</span>
        <div class="bar-mini-cont">
          <div class="bar-mini-fill" style="width: ${state.resources.physicalHealth}%; background: var(--accent-green);"></div>
        </div>
      </div>

      <div class="metric-pill">
        <span class="metric-label">Mental Resilience</span>
        <span class="metric-value">${Math.round(state.resources.mentalHealth)}%</span>
        <div class="bar-mini-cont">
          <div class="bar-mini-fill" style="width: ${state.resources.mentalHealth}%; background: var(--accent-purple);"></div>
        </div>
      </div>

      <div class="metric-pill">
        <span class="metric-label">Daily Energy</span>
        <span class="metric-value">${Math.round(state.resources.energy)}%</span>
        <div class="bar-mini-cont">
          <div class="bar-mini-fill" style="width: ${state.resources.energy}%; background: var(--accent-cyan);"></div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  container.querySelector('#btn-toggle-pause')?.addEventListener('click', callbacks.onTogglePause);
  container.querySelector('#btn-speed-1')?.addEventListener('click', () => callbacks.onSetSpeed(1));
  container.querySelector('#btn-speed-2')?.addEventListener('click', () => callbacks.onSetSpeed(2));
  container.querySelector('#btn-speed-4')?.addEventListener('click', () => callbacks.onSetSpeed(4));
  container.querySelector('#btn-step-day')?.addEventListener('click', callbacks.onStepDay);
  container.querySelector('#btn-step-month')?.addEventListener('click', callbacks.onStepMonth);

  return container;
}
