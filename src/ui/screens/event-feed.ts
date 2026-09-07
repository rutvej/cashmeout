import { GameState } from '../../types/game';
import { ActiveEventCard } from '../../events/event-types';
import { renderEventCard } from '../components/event-card';
import { formatCurrency } from '../components/format';
import { calculateNetWorth } from '../../engine/economy-engine';
import { COURSES } from '../../data/static-data';

export function renderEventFeedScreen(
  state: GameState,
  activeCards: ActiveEventCard[],
  onChoiceSelected: (card: ActiveEventCard, choiceId: string) => void,
  onAdvanceDay: () => void,
  onFastForwardDays?: (days: number) => void,
  isAutoPlaying?: boolean,
  onToggleAutoPlay?: () => void
): HTMLElement {
  const p = state.player;
  const container = document.createElement('div');
  container.className = 'screen-content event-feed-screen';

  const pendingCards = activeCards.filter(c => !c.resolved);
  const resolvedCards = activeCards.filter(c => c.resolved);
  const netWorth = calculateNetWorth(state);

  // 1. ARCADE HUD DAY BANNER
  const banner = document.createElement('div');
  banner.className = 'feed-day-banner';
  banner.innerHTML = `
    <div class="banner-day-col">
      <span class="banner-sub">TIMELINE • THE GRIND</span>
      <h2 class="banner-day-title">⚡ DAY ${p.currentDay}</h2>
    </div>
    <div class="banner-stats-col">
      <div class="banner-stat-chip">
        <span class="chip-label">Liquid Bag</span>
        <span class="chip-val green">${formatCurrency(p.money)}</span>
      </div>
      <div class="banner-stat-chip">
        <span class="chip-label">Net Worth</span>
        <span class="chip-val blue">${formatCurrency(netWorth)}</span>
      </div>
    </div>
  `;
  container.appendChild(banner);

  // 2. ACTIVE STUDY ARC (If grinding a course)
  if (p.activeCourseId) {
    const course = COURSES.find(c => c.id === p.activeCourseId);
    if (course) {
      const progress = p.educationProgress[course.id] ?? 0;
      const studyRate = 1.0 + ((p.timeAllocation.education || 0) * 0.5);
      const daysLeft = Math.max(1, Math.ceil(((100 - progress) / 100) * (course.slotsRequired / studyRate)));

      const studyWidget = document.createElement('div');
      studyWidget.className = 'active-study-hud-card';
      studyWidget.innerHTML = `
        <div class="study-header-row">
          <span class="study-tag">📚 GRINDING CERTIFICATION • ${Math.round(progress)}%</span>
          <span class="badge badge-purple" style="font-size:0.6rem;">${studyRate > 1 ? `${studyRate}x BOOST ⚡` : '1x SPEED'}</span>
        </div>
        <div class="study-course-title">${course.name}</div>
        <div class="study-xp-track">
          <div class="study-xp-fill" style="width: ${Math.max(4, progress)}%;"></div>
        </div>
        <div class="study-footer-row">
          <span>⏳ ~${daysLeft} days to qualify</span>
          <span style="color:var(--neon-cyan); font-weight:800;">💼 Unlocks ${course.unlocksJobTitle} (₹${course.unlocksJobSalary.toLocaleString('en-IN')}/15d)</span>
        </div>
      `;
      container.appendChild(studyWidget);
    }
  }

  // 3. PENDING QUEST CARDS OR SPEEDRUN STATUS
  const pendingDecisions = pendingCards.filter(c => c.choices.length >= 2);

  if (pendingDecisions.length > 0) {
    // If waiting for decision, show alert badge
    const alertBox = document.createElement('div');
    alertBox.style.cssText = `
      background: linear-gradient(90deg, rgba(255,51,102,0.18), rgba(255,0,127,0.12));
      border: 1.5px solid var(--neon-coral);
      border-radius: 14px;
      padding: 9px 13px;
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 0.78rem;
      font-weight: 900;
      color: #ffffff;
      box-shadow: 0 0 16px rgba(255,51,102,0.25);
    `;
    alertBox.innerHTML = `
      <span style="font-size:1.1rem; animation: flamePulse 1.2s infinite ease-in-out;">🚨</span>
      <span>DECISION TIME! Select an option below — speedrun will auto-resume!</span>
    `;
    container.appendChild(alertBox);
  }

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
    // All cards resolved / clean day
    const allDoneBox = document.createElement('div');
    allDoneBox.className = 'all-events-resolved-card';

    allDoneBox.innerHTML = `
      <div class="resolved-celebrate-icon">${isAutoPlaying ? '🚀' : '✨'}</div>
      <h3 class="all-done-title">${isAutoPlaying ? 'SPEEDRUNNING IN PROGRESS...' : `Day ${p.currentDay} Cleared!`}</h3>
      <p class="all-done-desc">
        ${isAutoPlaying
          ? 'Days are cruising automatically. Salary, interest, and course progress are ticking up! Tap Pause to stop.'
          : 'Zero pending choices. Ready to blast into tomorrow or let Auto-Play grind for you?'
        }
      </p>

      <div class="advance-buttons-group">
        ${isAutoPlaying ? `
          <button class="btn-3d btn-3d-coral" id="btn-stop-autoplay">
            <span>⏸️</span>
            <span>PAUSE SPEEDRUN</span>
          </button>
        ` : `
          <button class="btn-3d btn-3d-lime" id="btn-start-autoplay">
            <span>⚡</span>
            <span>AUTO-PLAY DAYS (SPEEDRUN)</span>
          </button>
          <button class="btn-3d btn-3d-cyan" id="btn-advance-day">
            <span>▶️</span>
            <span>NEXT DAY (+1D)</span>
          </button>
          <div class="fast-forward-row">
            <button class="btn-fast-forward" id="btn-skip-week">
              <span>⏩ Skip 7D</span>
              <span class="sub-pill">1 Week</span>
            </button>
            <button class="btn-fast-forward" id="btn-skip-month">
              <span>🗓️ Skip 30D</span>
              <span class="sub-pill">Monthly</span>
            </button>
            <button class="btn-fast-forward" id="btn-skip-year">
              <span>📅 Skip 1Y</span>
              <span class="sub-pill">365 Days</span>
            </button>
          </div>
        `}
      </div>
    `;

    allDoneBox.querySelector('#btn-start-autoplay')?.addEventListener('click', () => {
      if (onToggleAutoPlay) onToggleAutoPlay();
    });

    allDoneBox.querySelector('#btn-stop-autoplay')?.addEventListener('click', () => {
      if (onToggleAutoPlay) onToggleAutoPlay();
    });

    allDoneBox.querySelector('#btn-advance-day')?.addEventListener('click', () => {
      onAdvanceDay();
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

  // 4. RESOLVED DECISIONS TODAY
  if (resolvedCards.length > 0) {
    const resolvedSection = document.createElement('div');
    resolvedSection.style.display = 'flex';
    resolvedSection.style.flexDirection = 'column';
    resolvedSection.style.gap = '8px';
    resolvedSection.style.opacity = '0.88';
    resolvedSection.innerHTML = `
      <div style="font-size:0.68rem; font-weight:900; color:var(--neon-lime); text-transform:uppercase; letter-spacing:0.8px;">
        ✅ Moves Made Today (${resolvedCards.length})
      </div>
    `;

    resolvedCards.forEach(card => {
      const cardEl = renderEventCard(card, () => {});
      resolvedSection.appendChild(cardEl);
    });

    container.appendChild(resolvedSection);
  }

  // 5. LIVE ACTIVITY FEED (TIKTOK / DISCORD STREAM STYLE)
  const journalBox = document.createElement('div');
  journalBox.className = 'card';
  journalBox.innerHTML = `
    <div class="card-title" style="font-size: 0.85rem;">
      <span>📜 Live Activity Stream</span>
      <span class="badge badge-purple" style="font-size:0.58rem;">Real-Time</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      ${p.eventLog.slice(0, 5).map(e => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:7px 10px; display:flex; gap:9px; align-items:center;">
          <span style="font-size:0.62rem; font-weight:900; color:var(--neon-cyan); min-width:44px;">Day ${e.day}</span>
          <span style="font-size:0.76rem; font-weight:600; color:#e2e8f0;">${e.text}</span>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(journalBox);

  return container;
}
