import './styles/global.css';
import { GameState } from './types/game';
import { loadGame, saveGame } from './save/save-manager';
import { GameLoop } from './engine/game-loop';
import { calculateElapsedGameDays, getOfflineCatchUpPlan, applyAggregateOfflineSimulation } from './engine/time-system';
import { formatCurrency } from './ui/components/format';
import { ALL_JOBS, COURSES } from './data/static-data';
import { HealthConsequenceResult } from './engine/health-engine';

// Screens
import { renderEventFeedScreen } from './ui/screens/event-feed';
import { renderProfileResumeScreen } from './ui/screens/profile-resume';
import { renderJobBoardScreen } from './ui/screens/job-board';
import { renderInvestmentsScreen } from './ui/screens/investments';
import { renderPropertyScreen } from './ui/screens/property';
import { renderOnboardingWizard } from './ui/screens/onboarding';
import { renderSalaryDayCard } from './ui/screens/salary-day';

// HUD & Modals
import { renderTopHud, showLifeGoalsModal } from './ui/components/hud';
import { EventScheduler } from './events/event-scheduler';
import { ActiveEventCard } from './events/event-types';
import { UnlockManager } from './progression/unlock-manager';
import { showUnlockToast } from './ui/components/unlock-toast';
import { createUnlockMilestoneCard } from './progression/unlock-events';

import { showTimeAllocationModal, showDietModal, showStockTradeModal } from './ui/modals/all-modals';

class App {
  private state: GameState;
  private currentTab = 'story';
  private gameLoop: GameLoop;
  private appEl: HTMLElement;
  private eventScheduler: EventScheduler;
  private unlockManager: UnlockManager;
  private activeCards: ActiveEventCard[] = [];

  // ─── Auto-Play Turbo Engine ───
  private autoPlayActive = false;
  private autoPlayWaitingForChoice = false;
  private autoPlaySpeedMs = 600;
  private autoPlayTimerId: ReturnType<typeof setTimeout> | null = null;
  private isModalActive = false;

  constructor() {
    this.appEl = document.getElementById('app')!;
    this.state = loadGame();
    this.eventScheduler = new EventScheduler();
    this.unlockManager = new UnlockManager();
    this.activeCards = this.eventScheduler.generateCardsForDay(this.state);

    this.checkAndTriggerUnlocks();

    this.gameLoop = new GameLoop(
      this.state,
      (day, healthEmergency) => this.onDayTick(day, healthEmergency),
      () => this.onRender()
    );

    this.renderAppShell();
    this.renderActiveTab();

    // Check Onboarding or Salary Day
    this.checkOnboardingFlow();

    this.gameLoop.start();

    // Run catchup asynchronously
    setTimeout(() => {
      this.handleOfflineCatchup();
    }, 250);
  }

  // ─── ONBOARDING & SALARY DAY CHECKS ─────────────────────────
  private checkOnboardingFlow(): void {
    if (!this.state.player.onboardingComplete) {
      this.pauseAutoPlay();
      this.isModalActive = true;
      const modalCont = document.getElementById('modal-container')!;
      modalCont.innerHTML = '';
      modalCont.appendChild(
        renderOnboardingWizard(this.state, () => {
          this.isModalActive = false;
          modalCont.innerHTML = '';
          this.updateHeader();
          this.renderActiveTab();
          // After onboarding, Day 1 Salary Day triggers!
          this.checkSalaryDay();
        })
      );
    } else {
      this.checkSalaryDay();
    }
  }

  private checkSalaryDay(): void {
    const p = this.state.player;
    const currentMonth = Math.floor((p.currentDay - 1) / 30) + 1;
    const lastEval = p.salaryDayPreferences?.lastEvaluatedMonth || 0;
    const isDay1 = (p.currentDay - 1) % 30 === 0;

    if (isDay1 && lastEval < currentMonth && !this.isModalActive) {
      this.pauseAutoPlay();
      this.isModalActive = true;
      const modalCont = document.getElementById('modal-container')!;
      modalCont.innerHTML = '';
      modalCont.appendChild(
        renderSalaryDayCard(this.state, () => {
          this.isModalActive = false;
          modalCont.innerHTML = '';
          this.updateHeader();
          this.renderActiveTab();
        })
      );
    }
  }

  // ─── AUTO-PLAY TURBO ENGINE ─────────────────────────────────
  public toggleAutoPlay(): void {
    if (this.isModalActive) return;
    this.autoPlayActive = !this.autoPlayActive;
    this.autoPlayWaitingForChoice = false;

    if (this.autoPlayActive) {
      this.scheduleNextAutoPlayStep(100);
      this.showToast('⚡', 'Auto-Play activated! Days advancing...', 'var(--emerald)');
    } else {
      if (this.autoPlayTimerId !== null) {
        clearTimeout(this.autoPlayTimerId);
        this.autoPlayTimerId = null;
      }
      this.showToast('⏸️', 'Auto-Play paused.', 'var(--text-muted)');
    }

    this.updateHeader();
    this.renderActiveTab();
  }

  public pauseAutoPlay(): void {
    if (this.autoPlayActive) {
      this.autoPlayActive = false;
      this.autoPlayWaitingForChoice = false;
      if (this.autoPlayTimerId !== null) {
        clearTimeout(this.autoPlayTimerId);
        this.autoPlayTimerId = null;
      }
      this.updateHeader();
    }
  }

  public setAutoPlaySpeed(speedMs: number): void {
    this.autoPlaySpeedMs = speedMs;
    if (this.autoPlayActive && !this.autoPlayWaitingForChoice) {
      this.scheduleNextAutoPlayStep(100);
    }
    this.updateHeader();
  }

  private scheduleNextAutoPlayStep(delayMs: number = this.autoPlaySpeedMs): void {
    if (!this.autoPlayActive || this.isModalActive) return;
    if (this.autoPlayTimerId !== null) {
      clearTimeout(this.autoPlayTimerId);
      this.autoPlayTimerId = null;
    }

    this.autoPlayTimerId = setTimeout(() => {
      this.executeAutoPlayStep();
    }, delayMs);
  }

  private executeAutoPlayStep(): void {
    if (!this.autoPlayActive || this.isModalActive) return;

    this.autoResolveSingleChoiceCards();

    const pendingDecisions = this.activeCards.filter(
      c => !c.resolved && c.choices.length >= 2
    );

    if (pendingDecisions.length > 0) {
      this.autoPlayWaitingForChoice = true;
      this.updateHeader();
      this.renderActiveTab();
      return;
    }

    this.autoPlayWaitingForChoice = false;
    this.gameLoop.simulateSingleDay();

    if (this.currentTab === 'story') {
      this.renderActiveTab();
    }

    this.scheduleNextAutoPlayStep();
  }

  private autoResolveSingleChoiceCards(): void {
    const singleChoiceCards = this.activeCards.filter(
      c => !c.resolved && c.choices.length === 1
    );
    for (const card of singleChoiceCards) {
      this.eventScheduler.resolveCardChoice(card, card.choices[0].id, this.state);
    }
    if (singleChoiceCards.length > 0) {
      this.checkAndTriggerUnlocks();
      saveGame(this.state);
      this.updateHeader();
    }
  }

  // ─── OFFLINE CATCHUP ───────────────────────────────────────
  private handleOfflineCatchup(): void {
    if (!this.state.player.onboardingComplete) return;
    const elapsedDays = calculateElapsedGameDays(this.state.player.lastActiveTimestamp);
    if (elapsedDays > 0) {
      const plan = getOfflineCatchUpPlan(elapsedDays);
      if (plan.mode === 'fast-sim') {
        for (let d = 0; d < plan.days; d++) {
          this.gameLoop?.simulateSingleDay();
        }
        this.showToast('🗓️', `Fast-simulated ${plan.days} days while away.`, 'var(--sky)');
      } else if (plan.mode === 'aggregate') {
        const notes = applyAggregateOfflineSimulation(this.state, plan.days);
        this.showToast('🗓️', `Offline sync: ${notes[0] || 'Progress updated!'}`, 'var(--amber)');
      }
      saveGame(this.state);
    }
  }

  // ─── APP SHELL & NAVIGATION ────────────────────────────────
  private renderAppShell(): void {
    this.appEl.innerHTML = `
      <header class="top-nav" id="top-nav-header">
        ${renderTopHud(this.state)}

        <!-- Turbo Auto-Play HUD -->
        <div class="turbo-hud-bar ${this.autoPlayActive ? 'active' : ''} ${this.autoPlayWaitingForChoice ? 'waiting' : ''}" id="turbo-hud-bar">
          <div class="turbo-info-col">
            <span class="turbo-status-pill ${this.autoPlayWaitingForChoice ? 'pill-turbo-wait' : (this.autoPlayActive ? 'pill-turbo-on' : 'pill-turbo-off')}">
              ${this.autoPlayWaitingForChoice ? '🚨 DECISION' : (this.autoPlayActive ? '⚡ SPEEDRUN' : '⏸️ MANUAL')}
            </span>
            <span class="turbo-status-msg" id="turbo-msg">
              ${this.autoPlayWaitingForChoice 
                ? 'Action needed! Select an option below.' 
                : (this.autoPlayActive ? 'Auto-playing... Days flowing!' : 'Auto-Run paused. Tap Run to simulate.')
              }
            </span>
          </div>

          <div class="turbo-controls-row">
            <div class="speed-pills-group">
              <button class="btn-speed-pill ${this.autoPlaySpeedMs === 900 ? 'active' : ''}" data-speed="900">1x</button>
              <button class="btn-speed-pill ${this.autoPlaySpeedMs === 550 ? 'active' : ''}" data-speed="550">2x</button>
              <button class="btn-speed-pill ${this.autoPlaySpeedMs === 250 ? 'active' : ''}" data-speed="250">5x 🚀</button>
            </div>
            <button class="btn-turbo-toggle ${this.autoPlayActive ? 'btn-pause' : ''}" id="btn-toggle-turbo">
              ${this.autoPlayActive ? '⏸️ PAUSE' : '⚡ RUN'}
            </button>
          </div>
        </div>
      </header>

      <main class="screen-container" id="screen-container"></main>

      <nav class="bottom-nav">
        <button class="nav-tab active" data-tab="story">
          <span class="icon">📖</span><span>Timeline</span>
        </button>
        <button class="nav-tab" data-tab="profile">
          <span class="icon">👤</span><span>Profile</span>
        </button>
        <button class="nav-tab" data-tab="job">
          <span class="icon">💼</span><span>Job Board</span>
        </button>
        <button class="nav-tab" data-tab="investments">
          <span class="icon">📈</span><span>Invest</span>
        </button>
        <button class="nav-tab" data-tab="property">
          <span class="icon">🏠</span><span>Property</span>
        </button>
      </nav>

      <div id="modal-container"></div>
    `;

    // Top HUD life goal click handler
    this.attachHudListeners();

    // Speed pills
    this.appEl.querySelectorAll('.btn-speed-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseInt((e.currentTarget as HTMLElement).getAttribute('data-speed') || '600', 10);
        this.setAutoPlaySpeed(speed);
      });
    });

    // Toggle button in header HUD
    this.appEl.querySelector('#btn-toggle-turbo')?.addEventListener('click', () => {
      this.toggleAutoPlay();
    });

    // Tab buttons
    this.appEl.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-tab')!;
        this.setTab(target);
      });
    });
  }

  private attachHudListeners(): void {
    this.appEl.querySelector('#hud-goals-btn')?.addEventListener('click', () => {
      this.openGoalsModal();
    });
    this.appEl.querySelector('#btn-inspect-goals')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openGoalsModal();
    });
  }

  public openGoalsModal(): void {
    const modalCont = document.getElementById('modal-container')!;
    modalCont.innerHTML = '';
    modalCont.appendChild(
      showLifeGoalsModal(this.state, () => {
        modalCont.innerHTML = '';
      })
    );
  }

  private setTab(tab: string): void {
    this.currentTab = tab;
    this.appEl.querySelectorAll('.nav-tab').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderActiveTab();
  }

  private renderActiveTab(): void {
    const container = document.getElementById('screen-container');
    if (!container) return;
    container.innerHTML = '';

    const onAction = (action: string, payload?: any) => this.handleAction(action, payload);

    switch (this.currentTab) {
      case 'story':
        container.appendChild(renderEventFeedScreen(
          this.state,
          this.activeCards,
          (card, choiceId) => this.handleCardChoice(card, choiceId),
          () => this.handleAdvanceDay(),
          (days) => this.handleFastForwardDays(days),
          this.autoPlayActive,
          () => this.toggleAutoPlay()
        ));
        break;
      case 'profile':
        container.appendChild(renderProfileResumeScreen(this.state, onAction));
        break;
      case 'job':
        container.appendChild(renderJobBoardScreen(this.state, onAction));
        break;
      case 'investments':
        container.appendChild(renderInvestmentsScreen(this.state, onAction));
        break;
      case 'property':
        container.appendChild(renderPropertyScreen(this.state, onAction));
        break;
    }
  }

  // ─── GAME EVENTS & CARD SELECTION ──────────────────────────
  private handleCardChoice(card: ActiveEventCard, choiceId: string): void {
    this.eventScheduler.resolveCardChoice(card, choiceId, this.state);
    this.checkAndTriggerUnlocks();
    saveGame(this.state);
    this.updateHeader();
    this.renderActiveTab();

    if (this.autoPlayActive) {
      const stillPendingDecisions = this.activeCards.filter(
        c => !c.resolved && c.choices.length >= 2
      );
      if (stillPendingDecisions.length === 0) {
        this.autoPlayWaitingForChoice = false;
        this.updateHeader();
        this.scheduleNextAutoPlayStep(400);
      }
    }
  }

  private handleAdvanceDay(): void {
    this.gameLoop.simulateSingleDay();
    this.renderActiveTab();
  }

  private handleFastForwardDays(days: number): void {
    const report = this.gameLoop.simulateMultipleDays(days);
    this.checkAndTriggerUnlocks();
    saveGame(this.state);
    this.updateHeader();
    this.renderActiveTab();

    const incomeStr = report.moneyDelta >= 0 ? `+${formatCurrency(report.moneyDelta)}` : formatCurrency(report.moneyDelta);
    this.showToast('⏩', `Advanced ${days} days! Cash Δ: ${incomeStr}`, 'var(--sky)');
  }

  private onDayTick(_day: number, healthEmergency?: HealthConsequenceResult): void {
    const newCards = this.eventScheduler.generateCardsForDay(this.state, healthEmergency);
    this.activeCards = [...newCards, ...this.activeCards.filter(c => !c.resolved)];
    this.checkAndTriggerUnlocks();

    this.checkCourseCompletions();

    // Check Salary Day trigger on Day 1 of each month
    this.checkSalaryDay();

    saveGame(this.state);
    this.updateHeader();

    const hasPendingDecisions = this.activeCards.some(
      c => !c.resolved && c.choices.length >= 2
    );
    if (this.autoPlayActive && hasPendingDecisions) {
      this.autoPlayWaitingForChoice = true;
      this.updateHeader();
    }
  }

  private checkCourseCompletions(): void {
    const p = this.state.player;
    for (const [courseId, progress] of Object.entries(p.educationProgress)) {
      if (progress >= 100) {
        const alreadyHasCard = this.activeCards.some(c => c.defId === `cert-${courseId}`);
        const alreadyInLog = p.eventLog.some(
          e => e.text.includes(`cert-offer-spawned-${courseId}`)
        );
        if (!alreadyHasCard && !alreadyInLog) {
          this.spawnCertCard(courseId);
          p.eventLog.push({ day: p.currentDay, text: `cert-offer-spawned-${courseId}`, type: 'achievement' });
        }
      }
    }
  }

  private spawnCertCard(courseId: string): void {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return;

    const unlockedJob = ALL_JOBS.find(j => j.id === course.unlocksJobId);
    const card: ActiveEventCard = {
      instanceId: `card-cert-${course.id}-${Date.now()}`,
      defId: `cert-${course.id}`,
      category: 'milestone',
      title: `🎓 Certification Complete: ${course.name}!`,
      emoji: '📜',
      narrative: `You completed ${course.name}. ${
        unlockedJob
          ? `You are fully qualified for ${unlockedJob.title} paying ${formatCurrency(unlockedJob.salaryPerCycle * 2)}/mo!`
          : 'Your resume score increased and you unlocked higher career rungs.'
      }`,
      day: this.state.player.currentDay,
      choices: unlockedJob
        ? [
            {
              id: 'switch-now',
              label: `Accept Offer (${formatCurrency(unlockedJob.salaryPerCycle * 2)}/mo)`,
              emoji: '💼',
              preview: [
                { text: `Salary: ${formatCurrency(unlockedJob.salaryPerCycle * 2)}/mo`, type: 'positive' },
                { text: `Promoted to ${unlockedJob.title}`, type: 'positive' }
              ]
            },
            {
              id: 'keep-current',
              label: 'Keep Current Role (Switch anytime in Job Board)',
              emoji: '🚶',
              preview: [
                { text: 'Stay in current role', type: 'neutral' },
                { text: 'Job unlocked in Job Board', type: 'neutral' }
              ]
            }
          ]
        : [
            {
              id: 'claim-cert',
              label: 'Claim Certification 📜',
              emoji: '✨',
              preview: [{ text: '+6 Resume Points!', type: 'positive' }]
            }
          ],
      resolved: false
    };

    this.activeCards.unshift(card);
    this.showToast('🎓', `Level Up! Completed ${course.name}`, 'var(--amber)');
  }

  private checkAndTriggerUnlocks(): void {
    const newUnlocks = this.unlockManager.checkNewUnlocks(this.state);
    newUnlocks.forEach(feature => {
      showUnlockToast(feature);
      const card = createUnlockMilestoneCard(feature, this.state.player.currentDay);
      this.activeCards.unshift(card);
      this.state.player.eventLog.unshift({
        day: this.state.player.currentDay,
        text: `🔓 Feature Unlocked: ${feature.name} (${feature.tagline})`,
        type: 'achievement'
      });
    });
  }

  private onRender(): void {
    this.updateHeader();
  }

  private updateHeader(): void {
    const headerEl = document.getElementById('top-nav-header');
    if (!headerEl) return;

    // Preserve turbo bar state
    const turboBar = document.getElementById('turbo-hud-bar');
    const turboMsg = document.getElementById('turbo-msg');
    const toggleBtn = document.getElementById('btn-toggle-turbo');

    // Re-render Top HUD portion
    const existingHud = headerEl.querySelector('.hud-container');
    if (existingHud) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = renderTopHud(this.state);
      const newHud = tempDiv.firstElementChild!;
      headerEl.replaceChild(newHud, existingHud);
      this.attachHudListeners();
    }

    if (turboBar && turboMsg && toggleBtn) {
      if (this.autoPlayWaitingForChoice) {
        turboBar.className = 'turbo-hud-bar waiting';
        turboMsg.innerText = '🚨 Decision Required! Select an option below.';
        toggleBtn.className = 'btn-turbo-toggle btn-pause';
        toggleBtn.innerText = '⏸️ PAUSE';
      } else if (this.autoPlayActive) {
        turboBar.className = 'turbo-hud-bar active';
        turboMsg.innerText = '⚡ Speedrunning Life... Days flowing!';
        toggleBtn.className = 'btn-turbo-toggle btn-pause';
        toggleBtn.innerText = '⏸️ PAUSE';
      } else {
        turboBar.className = 'turbo-hud-bar';
        turboMsg.innerText = 'Auto-Run paused. Tap Run to simulate.';
        toggleBtn.className = 'btn-turbo-toggle';
        toggleBtn.innerText = '⚡ RUN';
      }

      this.appEl.querySelectorAll('.btn-speed-pill').forEach(btn => {
        const speed = parseInt((btn as HTMLElement).getAttribute('data-speed') || '600', 10);
        if (speed === this.autoPlaySpeedMs) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  // ─── TOAST NOTIFICATION ────────────────────────────────────
  private showToast(icon: string, message: string, color: string): void {
    const toastContainerId = 'unlock-toast-container';
    let tc = document.getElementById(toastContainerId);
    if (!tc) {
      tc = document.createElement('div');
      tc.id = toastContainerId;
      tc.className = 'unlock-toast-container';
      document.body.appendChild(tc);
    }

    const toast = document.createElement('div');
    toast.className = 'unlock-toast-item';
    toast.style.borderLeft = `3px solid ${color}`;
    toast.innerHTML = `
      <span class="toast-feature-icon">${icon}</span>
      <div class="toast-desc">${message}</div>
    `;
    tc.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  // ─── ACTIONS DISPATCHER ────────────────────────────────────
  private handleAction(action: string, payload?: any): void {
    const modalContainer = document.getElementById('modal-container')!;

    switch (action) {
      case 'refresh-property':
        this.updateHeader();
        this.renderActiveTab();
        break;

      case 'open-time-modal':
        modalContainer.appendChild(
          showTimeAllocationModal(
            this.state,
            () => { modalContainer.innerHTML = ''; },
            (newAlloc) => {
              this.state.player.timeAllocation = newAlloc;
              saveGame(this.state);
              this.renderActiveTab();
            }
          )
        );
        break;

      case 'open-diet-modal':
        modalContainer.appendChild(
          showDietModal(
            this.state,
            () => { modalContainer.innerHTML = ''; },
            (dietId) => {
              this.state.player.lifestyle.foodTier = dietId;
              saveGame(this.state);
              this.renderActiveTab();
            }
          )
        );
        break;

      case 'trade-stock':
        modalContainer.appendChild(
          showStockTradeModal(
            this.state,
            payload.tickerId,
            () => { modalContainer.innerHTML = ''; },
            (act, shares) => {
              const ticker = this.state.market.tickers.find(t => t.id === payload.tickerId)!;
              if (act === 'buy') {
                const cost = shares * ticker.price;
                this.state.player.money -= cost;
                const cur = this.state.player.portfolio[ticker.id] || { shares: 0, avgCost: ticker.price };
                const totalShares = cur.shares + shares;
                cur.avgCost = Math.round(((cur.shares * cur.avgCost) + cost) / totalShares * 100) / 100;
                cur.shares = totalShares;
                this.state.player.portfolio[ticker.id] = cur;
                this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Bought ${shares} shares of ${ticker.name}`, type: 'investment' });
              } else if (act === 'sell') {
                const earned = shares * ticker.price;
                this.state.player.money += earned;
                const cur = this.state.player.portfolio[ticker.id];
                if (cur) {
                  cur.shares -= shares;
                  if (cur.shares <= 0) delete this.state.player.portfolio[ticker.id];
                }
                this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Sold ${shares} shares of ${ticker.name} for ${formatCurrency(earned)}`, type: 'investment' });
              } else if (act === 'sip') {
                this.state.player.sips.push({
                  id: `sip-${Date.now()}`,
                  tickerId: ticker.id,
                  amountPerCycle: 1000,
                  cycleDays: 15,
                  lastInvestedDay: this.state.player.currentDay,
                  active: true
                });
                this.showToast('📈', `SIP active: ${formatCurrency(1000)} auto-invested every 15 days in ${ticker.name}.`, 'var(--emerald)');
              }
              saveGame(this.state);
              this.updateHeader();
              this.renderActiveTab();
            }
          )
        );
        break;

      case 'trade-gold':
        if (payload.action === 'buy') {
          const grams = prompt('How many grams of 24K gold to purchase?', '1');
          const g = parseInt(grams || '0', 10);
          if (g > 0) {
            const cost = g * this.state.market.goldPricePerGram;
            if (this.state.player.money >= cost) {
              this.state.player.money -= cost;
              this.state.player.goldHoldings.grams += g;
              this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Bought ${g}g of gold for ${formatCurrency(cost)}`, type: 'investment' });
              saveGame(this.state);
              this.updateHeader();
              this.renderActiveTab();
            } else {
              this.showToast('❌', 'Insufficient cash for gold purchase.', 'var(--rose)');
            }
          }
        } else {
          const grams = prompt(`How many grams to sell? (You hold ${this.state.player.goldHoldings.grams}g)`, '1');
          const g = parseInt(grams || '0', 10);
          if (g > 0 && g <= this.state.player.goldHoldings.grams) {
            const earned = g * this.state.market.goldPricePerGram;
            this.state.player.money += earned;
            this.state.player.goldHoldings.grams -= g;
            this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Sold ${g}g of gold for ${formatCurrency(earned)}`, type: 'investment' });
            saveGame(this.state);
            this.updateHeader();
            this.renderActiveTab();
          }
        }
        break;

      case 'deposit-savings': {
        const dep = prompt(`Amount to deposit to savings (Cash: ${formatCurrency(this.state.player.money)}):`, '500');
        const dAmt = parseInt(dep || '0', 10);
        if (dAmt > 0 && this.state.player.money >= dAmt) {
          this.state.player.money -= dAmt;
          this.state.player.savingsBalance += dAmt;
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Deposited ${formatCurrency(dAmt)} to savings`, type: 'investment' });
          saveGame(this.state);
          this.updateHeader();
          this.renderActiveTab();
        }
        break;
      }

      case 'withdraw-savings': {
        const wit = prompt(`Amount to withdraw (Balance: ${formatCurrency(this.state.player.savingsBalance)}):`, '500');
        const wAmt = parseInt(wit || '0', 10);
        if (wAmt > 0 && this.state.player.savingsBalance >= wAmt) {
          this.state.player.savingsBalance -= wAmt;
          this.state.player.money += wAmt;
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Withdrew ${formatCurrency(wAmt)} from savings`, type: 'expense' });
          saveGame(this.state);
          this.updateHeader();
          this.renderActiveTab();
        }
        break;
      }

      case 'switch-job': {
        const targetJob = ALL_JOBS.find(j => j.id === payload.jobId);
        if (targetJob) {
          this.state.player.job = {
            id: targetJob.id,
            title: targetJob.title,
            salaryPerCycle: targetJob.salaryPerCycle,
            payCycleDays: targetJob.payCycleDays,
            stressPerDay: targetJob.stressPerDay,
            timeSlotsCost: targetJob.timeSlotsCost
          };
          if (!this.state.player.careerHistory) this.state.player.careerHistory = [];
          this.state.player.careerHistory.push({
            jobId: targetJob.id,
            title: targetJob.title,
            startDay: this.state.player.currentDay,
            endDay: null,
            salary: targetJob.salaryPerCycle
          });
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Promoted/Switched to ${targetJob.title} (${formatCurrency(targetJob.salaryPerCycle * 2)}/mo)`, type: 'income' });
          this.showToast('💼', `Role updated: ${targetJob.title}!`, 'var(--emerald)');
          saveGame(this.state);
          this.updateHeader();
          this.renderActiveTab();
        }
        break;
      }

      case 'enroll-course': {
        const course = COURSES.find(c => c.id === payload.courseId);
        if (!course) break;

        if (this.state.player.money < course.fee) {
          this.showToast('❌', `Need ${formatCurrency(course.fee)} cash for enrollment!`, 'var(--rose)');
          break;
        }

        this.state.player.money -= course.fee;
        this.state.player.activeCourseId = course.id;
        if (this.state.player.educationProgress[course.id] === undefined) {
          this.state.player.educationProgress[course.id] = 0;
        }

        this.state.player.eventLog.unshift({
          day: this.state.player.currentDay,
          text: `📚 Enrolled in ${course.name}! Study progress will advance each day.`,
          type: 'achievement'
        });

        this.showToast('📚', `Enrolled in ${course.name}!`, 'var(--sky)');
        saveGame(this.state);
        this.updateHeader();
        this.renderActiveTab();
        break;
      }

      case 'pause-course': {
        this.state.player.activeCourseId = null;
        this.showToast('⏸️', 'Course study paused.', 'var(--text-muted)');
        saveGame(this.state);
        this.updateHeader();
        this.renderActiveTab();
        break;
      }
    }
  }
}

function initApp() {
  try {
    new App();
  } catch (err) {
    console.error('App initialization error:', err);
    const appEl = document.getElementById('app');
    if (appEl) {
      appEl.innerHTML = `<div style="color:#f43f5e;padding:24px;font-family:sans-serif;">
        <h3>Error starting game:</h3>
        <pre>${String(err instanceof Error ? err.stack || err.message : err)}</pre>
        <button onclick="localStorage.clear();location.reload();" style="padding:8px 16px;background:#1e293b;color:white;border:1px solid #334155;border-radius:6px;cursor:pointer;margin-top:12px;">Reset Save Data & Reload</button>
      </div>`;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
