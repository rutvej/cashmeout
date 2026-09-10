import { GameState } from '../../types/game';
import { computeMonthlyCashflow } from '../../engine/economy';
import { adjustHabitCounter } from '../../engine/behavioral';

export interface DashboardCallbacks {
  onResolveChoice: (cardId: string, choiceId: string) => void;
  onRefresh: () => void;
}

export function renderDashboardScreen(state: GameState, callbacks: DashboardCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-container';

  const cf = computeMonthlyCashflow(state);
  const beh = state.behavioral;

  let emergencyBadgeClass = 'positive';
  let emergencyLabel = '🛡️ Fortress Shield (6+ Months Buffer)';
  if (cf.emergencyTier === 'critical') {
    emergencyBadgeClass = 'danger';
    emergencyLabel = '🚨 Critical Red Zone (< 1 Month Buffer)';
  } else if (cf.emergencyTier === 'vulnerable') {
    emergencyBadgeClass = 'warning';
    emergencyLabel = '⚠️ Vulnerable (1-2 Months Buffer)';
  } else if (cf.emergencyTier === 'stable') {
    emergencyBadgeClass = 'positive';
    emergencyLabel = '✅ Stable Buffer (3-5 Months)';
  }

  container.innerHTML = `
    <div class="dashboard-grid">
      <!-- Left Column: Story Feed & Events -->
      <div class="feed-column">
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <h2 class="card-title">⚡ Daily Life & Story Feed</h2>
            <span class="time-tag">Era: ${state.simulation.macroPhase.replace('_', ' ')}</span>
          </div>

          <div id="active-events-list">
            ${state.simulation.activeEventCards.length === 0 ? `
              <div style="padding: 24px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">
                ✨ No critical life dilemmas pending today. Daily routine is operating normally.
                <div style="margin-top: 10px;">
                  <button id="btn-advance-today" class="btn-action">Advance Day ⏩</button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Quick Wellness Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🧘 Daily Discipline Actions</h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
            <button id="btn-quick-gym" class="btn-ctrl">🏋️ Extra Workout (+2 Phys)</button>
            <button id="btn-quick-sleep" class="btn-ctrl">😴 Power Nap (+5 Energy)</button>
            <button id="btn-quick-cook" class="btn-ctrl">🍳 Prep Home Meal (-Junk)</button>
            <button id="btn-quick-leisure" class="btn-ctrl">🎮 Unwind Rest (+4 Mental)</button>
          </div>
        </div>
      </div>

      <!-- Right Column: Habit Counters & Status -->
      <div class="status-column">
        <!-- Emergency Buffer Card -->
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <h3 class="card-title">🛡️ Safety Buffer</h3>
          </div>
          <div style="font-size: 0.85rem; margin-bottom: 8px;">
            <strong>${cf.emergencyFundMonths} Months</strong> of Fixed Expenses Covered
          </div>
          <div class="metric-pill" style="border-color: var(--accent-${emergencyBadgeClass === 'positive' ? 'green' : (emergencyBadgeClass === 'danger' ? 'rose' : 'amber')});">
            <span style="font-size: 0.82rem; font-weight: 700;">${emergencyLabel}</span>
          </div>
        </div>

        <!-- 7 Behavioral Habit Counters -->
        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <h3 class="card-title">🧠 Behavioral Habits</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Floor: 1.0</span>
          </div>
          <div class="item-list">
            <div class="list-item">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">Impulse Buying</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Triggers spontaneous spend cards</div>
              </div>
              <span class="metric-value ${beh.impulseBuyCounter >= 6 ? 'danger' : (beh.impulseBuyCounter >= 3 ? 'warning' : 'positive')}">${beh.impulseBuyCounter.toFixed(1)}</span>
            </div>

            <div class="list-item">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">Sleep Debt</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Causes energy crashes</div>
              </div>
              <span class="metric-value ${beh.sleepDebtCounter >= 6 ? 'danger' : (beh.sleepDebtCounter >= 3 ? 'warning' : 'positive')}">${beh.sleepDebtCounter.toFixed(1)}</span>
            </div>

            <div class="list-item">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">Gym Avoidance</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Physical inertia penalty</div>
              </div>
              <span class="metric-value ${beh.gymSkipCounter >= 6 ? 'danger' : (beh.gymSkipCounter >= 3 ? 'warning' : 'positive')}">${beh.gymSkipCounter.toFixed(1)}</span>
            </div>

            <div class="list-item">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">Crypto FOMO</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Speculative hype vulnerability</div>
              </div>
              <span class="metric-value ${beh.cryptoFomoCounter >= 6 ? 'danger' : 'positive'}">${beh.cryptoFomoCounter.toFixed(1)}</span>
            </div>

            <div class="list-item">
              <div>
                <div style="font-weight: 600; font-size: 0.85rem;">Lifestyle Creep</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Expense inflation risk</div>
              </div>
              <span class="metric-value ${beh.lifestyleCreepCounter >= 6 ? 'danger' : 'positive'}">${beh.lifestyleCreepCounter.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <!-- Recent Logs Feed -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📜 Life Chronicles</h3>
          </div>
          <div class="log-feed">
            ${state.simulation.recentLogs.map(log => `
              <div class="log-entry ${log.type}">
                <span style="font-weight: 700; opacity: 0.75;">Day ${log.day}:</span> ${log.message}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Render event cards
  const eventsListEl = container.querySelector('#active-events-list')!;
  for (const card of state.simulation.activeEventCards) {
    const cardEl = document.createElement('div');
    cardEl.className = 'event-card';
    cardEl.innerHTML = `
      <span class="event-category-tag">${card.category}</span>
      <h3 class="event-title">${card.title}</h3>
      <p class="event-desc">${card.description}</p>
      <div class="event-choices-grid">
        ${card.choices.map(choice => `
          <button class="choice-btn" data-card-id="${card.id}" data-choice-id="${choice.id}">
            <div class="choice-label">${choice.label}</div>
            <div class="choice-desc">${choice.description}</div>
            <div class="choice-preview">Impact: ${choice.immediateImpactPreview}</div>
          </button>
        `).join('')}
      </div>
    `;

    // Attach choice listeners
    cardEl.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = (btn as HTMLElement).dataset.cardId!;
        const chId = (btn as HTMLElement).dataset.choiceId!;
        callbacks.onResolveChoice(cId, chId);
      });
    });

    eventsListEl.appendChild(cardEl);
  }

  // Quick action listeners
  container.querySelector('#btn-advance-today')?.addEventListener('click', () => {
    // triggers next day
    const event = new CustomEvent('step-day');
    window.dispatchEvent(event);
  });

  container.querySelector('#btn-quick-gym')?.addEventListener('click', () => {
    state.resources.physicalHealth = Math.min(100, state.resources.physicalHealth + 2);
    adjustHabitCounter(state.behavioral, 'gymSkipCounter', -0.5);
    state.simulation.lifetimeGymSessions += 1;
    callbacks.onRefresh();
  });

  container.querySelector('#btn-quick-sleep')?.addEventListener('click', () => {
    state.resources.energy = Math.min(100, state.resources.energy + 5);
    adjustHabitCounter(state.behavioral, 'sleepDebtCounter', -0.5);
    callbacks.onRefresh();
  });

  container.querySelector('#btn-quick-cook')?.addEventListener('click', () => {
    adjustHabitCounter(state.behavioral, 'junkFoodCounter', -0.8);
    state.resources.physicalHealth = Math.min(100, state.resources.physicalHealth + 1);
    callbacks.onRefresh();
  });

  container.querySelector('#btn-quick-leisure')?.addEventListener('click', () => {
    state.resources.mentalHealth = Math.min(100, state.resources.mentalHealth + 4);
    callbacks.onRefresh();
  });

  return container;
}
