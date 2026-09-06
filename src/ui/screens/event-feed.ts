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
  onFastForwardDays?: (days: number) => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-content event-feed-screen';

  const pendingCards = activeCards.filter(c => !c.resolved);
  const resolvedCards = activeCards.filter(c => c.resolved);
  const netWorth = calculateNetWorth(state);

  // 1. Day Banner & Status Ribbon
  const banner = document.createElement('div');
  banner.className = 'feed-day-banner';
  banner.innerHTML = `
    <div class="banner-day-col">
      <span class="banner-sub">Current Timeline</span>
      <h2 class="banner-day-title">Day ${state.player.currentDay}</h2>
    </div>
    <div class="banner-stats-col">
      <div class="banner-stat-chip">
        <span class="chip-label">Liquid</span>
        <span class="chip-val green">${formatCurrency(state.player.money)}</span>
      </div>
      <div class="banner-stat-chip">
        <span class="chip-label">Net Worth</span>
        <span class="chip-val blue">${formatCurrency(netWorth)}</span>
      </div>
    </div>
  `;
  container.appendChild(banner);

  // 2. Pending Cards Section
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
    // All cards resolved for today!
    const allDoneBox = document.createElement('div');
    allDoneBox.className = 'all-events-resolved-card';
    allDoneBox.innerHTML = `
      <div class="resolved-celebrate-icon">✨</div>
      <h3 class="all-done-title">All Decisions Made for Day ${state.player.currentDay}!</h3>
      <p class="all-done-desc">
        Your routine is running smoothly. Ready to see tomorrow or fast-forward through the calendar?
      </p>
      
      <div class="advance-buttons-group">
        <button class="btn-advance-day-large pop-press" id="btn-advance-day">
          <span class="advance-icon">⚡</span>
          <span class="advance-text">Next Day</span>
          <span class="advance-sub">+1 Day ➔</span>
        </button>
        
        <div class="fast-forward-row">
          <button class="btn btn-sm btn-fast-forward pop-press" id="btn-skip-week">
            <span>⏩ Skip 7 Days</span>
            <span class="sub-pill">1 Week</span>
          </button>
          <button class="btn btn-sm btn-fast-forward btn-ff-month pop-press" id="btn-skip-month">
            <span>🗓️ Skip 30 Days</span>
            <span class="sub-pill">Monthly Pay & Rent</span>
          </button>
        </div>
      </div>
    `;

    allDoneBox.querySelector('#btn-advance-day')?.addEventListener('click', () => {
      onAdvanceDay();
    });

    allDoneBox.querySelector('#btn-skip-week')?.addEventListener('click', () => {
      if (onFastForwardDays) onFastForwardDays(7);
    });

    allDoneBox.querySelector('#btn-skip-month')?.addEventListener('click', () => {
      if (onFastForwardDays) onFastForwardDays(30);
    });

    container.appendChild(allDoneBox);
  }

  // 3. Resolved Cards from Today
  if (resolvedCards.length > 0) {
    const resolvedSection = document.createElement('div');
    resolvedSection.className = 'resolved-history-section';
    resolvedSection.innerHTML = `
      <div class="section-title-sub">Decisions Made Today (${resolvedCards.length})</div>
    `;

    resolvedCards.forEach(card => {
      const cardEl = renderEventCard(card, () => {});
      resolvedSection.appendChild(cardEl);
    });

    container.appendChild(resolvedSection);
  }

  // 4. Life Journal Stream (Recent 4 entries)
  const journalBox = document.createElement('div');
  journalBox.className = 'quick-journal-card';
  journalBox.innerHTML = `
    <div class="card-title" style="font-size: 0.85rem;">
      <span>Recent Life Highlights</span>
      <span style="font-size: 0.65rem; color: var(--text-muted);">Live Stream</span>
    </div>
    <div class="quick-journal-list">
      ${state.player.eventLog.slice(0, 4).map(e => `
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
