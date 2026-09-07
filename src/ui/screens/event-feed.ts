import { GameState } from '../../types/game';
import { ActiveEventCard } from '../../events/event-types';
import { renderEventCard } from '../components/event-card';
import { formatCurrency } from '../components/format';
import { calculateNetWorth } from '../../engine/economy-engine';

export function renderEventFeedScreen(
  state: GameState,
  activeCards: ActiveEventCard[],
  onChoiceSelected: (card: ActiveEventCard, choiceId: string) => void,
  onAdvanceDay: () => void,
  onFastForwardDays?: (days: number) => void,
  isAutoPlaying?: boolean,
  onToggleAutoPlay?: () => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-content event-feed-screen';

  const pendingCards = activeCards.filter(c => !c.resolved);
  const resolvedCards = activeCards.filter(c => c.resolved);
  const netWorth = calculateNetWorth(state);

  // 1. Day Banner
  const banner = document.createElement('div');
  banner.className = 'feed-day-banner';
  banner.innerHTML = `
    <div class="banner-day-col">
      <span class="banner-sub">Current Timeline</span>
      <h2 class="banner-day-title">📅 Day ${state.player.currentDay}</h2>
    </div>
    <div class="banner-stats-col">
      <div class="banner-stat-chip">
        <span class="chip-label">Cash</span>
        <span class="chip-val green">${formatCurrency(state.player.money)}</span>
      </div>
      <div class="banner-stat-chip">
        <span class="chip-label">Net Worth</span>
        <span class="chip-val blue">${formatCurrency(netWorth)}</span>
      </div>
    </div>
  `;
  container.appendChild(banner);

  // 2. Auto-play ribbon (shown when auto-playing)
  if (isAutoPlaying) {
    const ribbon = document.createElement('div');
    ribbon.className = 'autoplay-ribbon';
    ribbon.innerHTML = `
      <div class="autoplay-icon">⚡</div>
      <div class="autoplay-text-col">
        <div class="autoplay-label">⚡ Auto-Play Active — Days Flowing</div>
        <div class="autoplay-day-text">Processing Day ${state.player.currentDay}…</div>
        <div class="autoplay-progress-track">
          <div class="autoplay-progress-fill" style="width:60%;"></div>
        </div>
      </div>
      <button class="autoplay-stop-btn" id="btn-stop-autoplay">⏹ Stop</button>
    `;
    ribbon.querySelector('#btn-stop-autoplay')?.addEventListener('click', () => {
      if (onToggleAutoPlay) onToggleAutoPlay();
    });
    container.appendChild(ribbon);
  }

  // 3. Pending Cards Section or All-Done box
  if (pendingCards.length > 0) {
    const cardsSection = document.createElement('div');
    cardsSection.className = 'event-cards-stack';

    pendingCards.forEach((card, index) => {
      const cardEl = renderEventCard(card, (choiceId) => {
        onChoiceSelected(card, choiceId);
      });
      if (index === 0) cardEl.classList.add('active-focus-card');
      cardsSection.appendChild(cardEl);
    });

    container.appendChild(cardsSection);
  } else {
    // All cards resolved → show advance options
    const allDoneBox = document.createElement('div');
    allDoneBox.className = 'all-events-resolved-card';
    allDoneBox.innerHTML = `
      <div class="resolved-celebrate-icon">${isAutoPlaying ? '⚡' : '✨'}</div>
      <h3 class="all-done-title">${isAutoPlaying ? 'Auto-Playing…' : `All Done for Day ${state.player.currentDay}!`}</h3>
      <p class="all-done-desc">
        ${isAutoPlaying
          ? 'Days are automatically advancing. Stop anytime if a decision needs your attention.'
          : 'All decisions made. Ready to see tomorrow or let time flow automatically?'
        }
      </p>

      <div class="advance-buttons-group">
        ${!isAutoPlaying ? `
          <button class="btn-autoplay pop-press" id="btn-start-autoplay">
            <span>⚡</span>
            <span>Auto-Play Days</span>
          </button>
          <button class="btn-advance-day-large pop-press" id="btn-advance-day">
            <span class="advance-icon">▶️</span>
            <span class="advance-text">Next Day</span>
            <span class="advance-sub">+1 Day →</span>
          </button>
          <div class="fast-forward-row">
            <button class="btn btn-sm btn-fast-forward pop-press" id="btn-skip-week">
              <span>⏩ Skip 7 Days</span>
              <span class="sub-pill">1 Week</span>
            </button>
            <button class="btn btn-sm btn-fast-forward btn-ff-month pop-press" id="btn-skip-month">
              <span>🗓️ Skip 30 Days</span>
              <span class="sub-pill">Monthly Cycle</span>
            </button>
            <button class="btn btn-sm btn-fast-forward pop-press" id="btn-skip-year">
              <span>📅 Skip 1 Year</span>
              <span class="sub-pill">365 Days</span>
            </button>
          </div>
        ` : `
          <button class="autoplay-stop-btn" id="btn-stop-autoplay2" style="font-size:0.85rem; padding:12px 28px; border-radius:12px;">
            ⏹ Stop Auto-Play
          </button>
        `}
      </div>
    `;

    allDoneBox.querySelector('#btn-advance-day')?.addEventListener('click', () => {
      onAdvanceDay();
    });

    allDoneBox.querySelector('#btn-start-autoplay')?.addEventListener('click', () => {
      if (onToggleAutoPlay) onToggleAutoPlay();
    });

    allDoneBox.querySelector('#btn-stop-autoplay2')?.addEventListener('click', () => {
      if (onToggleAutoPlay) onToggleAutoPlay();
    });

    allDoneBox.querySelector('#btn-skip-week')?.addEventListener('click', () => {
      if (onFastForwardDays) onFastForwardDays(7);
    });

    allDoneBox.querySelector('#btn-skip-month')?.addEventListener('click', () => {
      if (onFastForwardDays) onFastForwardDays(30);
    });

    allDoneBox.querySelector('#btn-skip-year')?.addEventListener('click', () => {
      if (onFastForwardDays) onFastForwardDays(365);
    });

    container.appendChild(allDoneBox);
  }

  // 4. Resolved Cards from Today
  if (resolvedCards.length > 0) {
    const resolvedSection = document.createElement('div');
    resolvedSection.className = 'resolved-history-section';
    resolvedSection.innerHTML = `
      <div class="section-title-sub">✅ Decisions Made Today (${resolvedCards.length})</div>
    `;

    resolvedCards.forEach(card => {
      const cardEl = renderEventCard(card, () => {});
      resolvedSection.appendChild(cardEl);
    });

    container.appendChild(resolvedSection);
  }

  // 5. Life Journal Stream (Recent 5 entries)
  const journalBox = document.createElement('div');
  journalBox.className = 'quick-journal-card';
  journalBox.innerHTML = `
    <div class="card-title" style="font-size: 0.82rem;">
      <span>📜 Recent Highlights</span>
      <span style="font-size: 0.6rem; color: var(--text-muted);">Live Feed</span>
    </div>
    <div class="quick-journal-list">
      ${state.player.eventLog.slice(0, 5).map(e => `
        <div class="quick-journal-item type-${e.type}">
          <span class="journal-day">Day ${e.day}</span>
          <span class="journal-text">${e.text}</span>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(journalBox);

  return container;
}
