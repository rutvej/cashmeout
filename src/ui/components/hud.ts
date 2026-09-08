import { GameState } from '../../types/game';
import { formatCurrency } from './format';
import { calculateNetWorth } from '../../engine/economy-engine';
import { getGoalDef, WEALTH_GOALS, HEALTH_GOALS, LIFESTYLE_GOALS } from '../../data/life-goals';

export function calculateTimeline(currentDay: number, startingAge = 22) {
  const zeroIndexedDay = Math.max(0, currentDay - 1);
  const year = Math.floor(zeroIndexedDay / 360) + 1;
  const month = (Math.floor(zeroIndexedDay / 30) % 12) + 1;
  const dayOfMonth = (zeroIndexedDay % 30) + 1;
  const age = startingAge + Math.floor(zeroIndexedDay / 360);

  return {
    year,
    month,
    dayOfMonth,
    age,
    displayString: `Age ${age} · Mo ${month}, Day ${dayOfMonth}`
  };
}

export function renderTopHud(state: GameState): string {
  const p = state.player;
  const timeline = calculateTimeline(p.currentDay, p.startingAge || 22);
  const netWorth = calculateNetWorth(state);

  const phys = Math.round(Math.max(0, Math.min(100, p.health.physical)));
  const ment = Math.round(Math.max(0, Math.min(100, p.health.mental)));
  const ener = Math.round(Math.max(0, Math.min(100, p.health.energy)));

  // Life goals progress
  const wealthDef = getGoalDef('wealth', p.lifeGoals?.wealth || 'six-figure-net-worth') || WEALTH_GOALS[1];
  const healthDef = getGoalDef('health', p.lifeGoals?.health || 'olympic-resilience') || HEALTH_GOALS[0];
  const lifestyleDef = getGoalDef('lifestyle', p.lifeGoals?.lifestyle || 'homeowner-pride') || LIFESTYLE_GOALS[0];

  const wProg = wealthDef.getProgress(state);
  const hProg = healthDef.getProgress(state);
  const lProg = lifestyleDef.getProgress(state);

  return `
    <div class="hud-container">
      <!-- Main Stat Row: Age/Month, Net Worth, Liquid Cash -->
      <div class="hud-main-bar">
        <div class="hud-timeline-badge" title="Year ${timeline.year} of 10">
          <span class="hud-badge-dot"></span>
          <span class="hud-timeline-text">${timeline.displayString}</span>
        </div>

        <div class="hud-money-group">
          <div class="hud-money-stat">
            <span class="hud-stat-lbl">NET WORTH</span>
            <span class="hud-stat-val val-sky">${formatCurrency(netWorth)}</span>
          </div>
          <div class="hud-money-stat">
            <span class="hud-stat-lbl">CASH</span>
            <span class="hud-stat-val val-emerald">${formatCurrency(p.money)}</span>
          </div>
        </div>
      </div>

      <!-- Health Bars Row: Physical, Mental, Energy -->
      <div class="hud-health-row">
        <div class="health-bar-item" title="Physical Health: ${phys}%">
          <div class="health-bar-meta">
            <span class="health-bar-name">💪 Physical</span>
            <span class="health-bar-val ${phys < 40 ? 'val-warn' : ''}">${phys}%</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill fill-physical" style="width: ${phys}%;"></div>
          </div>
        </div>

        <div class="health-bar-item" title="Mental Resilience: ${ment}%">
          <div class="health-bar-meta">
            <span class="health-bar-name">🧠 Mental</span>
            <span class="health-bar-val ${ment < 40 ? 'val-warn' : ''}">${ment}%</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill fill-mental" style="width: ${ment}%;"></div>
          </div>
        </div>

        <div class="health-bar-item" title="Daily Energy: ${ener}%">
          <div class="health-bar-meta">
            <span class="health-bar-name">⚡ Energy</span>
            <span class="health-bar-val ${ener < 40 ? 'val-warn' : ''}">${ener}%</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill fill-energy" style="width: ${ener}%;"></div>
          </div>
        </div>
      </div>

      <!-- Life Goals Progress HUD Row (Clickable) -->
      <div class="hud-goals-row" id="hud-goals-btn" title="Click to view full Life Goals progress">
        <div class="goals-pill-badge">🎯 GOALS</div>
        <div class="goals-mini-track-group">
          <div class="goal-mini-item">
            <span class="goal-mini-label">💰 ${wealthDef.title}</span>
            <div class="goal-mini-meter">
              <div class="goal-mini-fill" style="width: ${Math.max(4, wProg.pct)}%;"></div>
            </div>
            <span class="goal-mini-pct">${wProg.pct}%</span>
          </div>

          <div class="goal-mini-item">
            <span class="goal-mini-label">🏥 ${healthDef.title}</span>
            <div class="goal-mini-meter">
              <div class="goal-mini-fill" style="width: ${Math.max(4, hProg.pct)}%;"></div>
            </div>
            <span class="goal-mini-pct">${hProg.pct}%</span>
          </div>

          <div class="goal-mini-item">
            <span class="goal-mini-label">🌟 ${lifestyleDef.title}</span>
            <div class="goal-mini-meter">
              <div class="goal-mini-fill" style="width: ${Math.max(4, lProg.pct)}%;"></div>
            </div>
            <span class="goal-mini-pct">${lProg.pct}%</span>
          </div>
        </div>
        <button class="btn-goal-inspect" id="btn-inspect-goals" aria-label="Inspect Life Goals">🔍</button>
      </div>
    </div>
  `;
}

export function showLifeGoalsModal(state: GameState, onClose: () => void): HTMLElement {
  const p = state.player;
  const wealthDef = getGoalDef('wealth', p.lifeGoals?.wealth || 'six-figure-net-worth') || WEALTH_GOALS[1];
  const healthDef = getGoalDef('health', p.lifeGoals?.health || 'olympic-resilience') || HEALTH_GOALS[0];
  const lifestyleDef = getGoalDef('lifestyle', p.lifeGoals?.lifestyle || 'homeowner-pride') || LIFESTYLE_GOALS[0];

  const wProg = wealthDef.getProgress(state);
  const hProg = healthDef.getProgress(state);
  const lProg = lifestyleDef.getProgress(state);

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <span class="modal-pre-title">10-YEAR HORIZON</span>
          <h3 class="modal-title">🎯 Life Goals Tracker</h3>
        </div>
        <button class="modal-close-btn" id="btn-close-modal">&times;</button>
      </div>

      <div class="modal-body">
        <p class="modal-desc">
          Evaluated at Age 32 (Day 3,650) in your comprehensive 10-Year Life Report.
        </p>

        <div class="goal-card-detail">
          <div class="goal-detail-header">
            <div class="goal-icon-title">
              <span class="goal-emoji">${wealthDef.emoji}</span>
              <div>
                <div class="goal-detail-title">${wealthDef.title}</div>
                <div class="goal-detail-sub">${wealthDef.targetDescription}</div>
              </div>
            </div>
            <span class="badge ${wProg.isMet ? 'badge-green' : 'badge-sky'}">${wProg.pct}%</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill fill-emerald" style="width: ${Math.max(2, wProg.pct)}%;"></div>
          </div>
          <div class="goal-detail-footer">
            <span>Current: <strong>${wProg.currentLabel}</strong></span>
            <span>Target: <strong>${wProg.targetLabel}</strong></span>
          </div>
        </div>

        <div class="goal-card-detail">
          <div class="goal-detail-header">
            <div class="goal-icon-title">
              <span class="goal-emoji">${healthDef.emoji}</span>
              <div>
                <div class="goal-detail-title">${healthDef.title}</div>
                <div class="goal-detail-sub">${healthDef.targetDescription}</div>
              </div>
            </div>
            <span class="badge ${hProg.isMet ? 'badge-green' : 'badge-sky'}">${hProg.pct}%</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill fill-physical" style="width: ${Math.max(2, hProg.pct)}%;"></div>
          </div>
          <div class="goal-detail-footer">
            <span>Current: <strong>${hProg.currentLabel}</strong></span>
            <span>Target: <strong>${hProg.targetLabel}</strong></span>
          </div>
        </div>

        <div class="goal-card-detail">
          <div class="goal-detail-header">
            <div class="goal-icon-title">
              <span class="goal-emoji">${lifestyleDef.emoji}</span>
              <div>
                <div class="goal-detail-title">${lifestyleDef.title}</div>
                <div class="goal-detail-sub">${lifestyleDef.targetDescription}</div>
              </div>
            </div>
            <span class="badge ${lProg.isMet ? 'badge-green' : 'badge-sky'}">${lProg.pct}%</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill fill-mental" style="width: ${Math.max(2, lProg.pct)}%;"></div>
          </div>
          <div class="goal-detail-footer">
            <span>Current: <strong>${lProg.currentLabel}</strong></span>
            <span>Target: <strong>${lProg.targetLabel}</strong></span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary btn-block" id="btn-done-goals">Got It</button>
      </div>
    </div>
  `;

  modal.querySelector('#btn-close-modal')?.addEventListener('click', onClose);
  modal.querySelector('#btn-done-goals')?.addEventListener('click', onClose);
  return modal;
}
