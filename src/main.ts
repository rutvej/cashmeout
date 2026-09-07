import './styles/global.css';
import { GameState } from './types/game';
import { loadGame, saveGame } from './save/save-manager';
import { GameLoop } from './engine/game-loop';
import { calculateElapsedGameDays, getOfflineCatchUpPlan, applyAggregateOfflineSimulation } from './engine/time-system';
import { formatCurrency } from './ui/components/format';
import { ASSET_CATALOG, ALL_JOBS, COURSES } from './data/static-data';
import { HealthConsequenceResult } from './engine/health-engine';

// Screens
import { renderEventFeedScreen } from './ui/screens/event-feed';
import { renderStatusPanelScreen } from './ui/screens/status-panel';
import { renderAccountScreen } from './ui/screens/account';

// Components & Events
import { renderHealthRing } from './ui/components/health-ring';
import { EventScheduler } from './events/event-scheduler';
import { ActiveEventCard } from './events/event-types';
import { UnlockManager } from './progression/unlock-manager';
import { showUnlockToast } from './ui/components/unlock-toast';
import { createUnlockMilestoneCard } from './progression/unlock-events';

// Modals
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
  private autoPlaySpeedMs = 600; // default 1x fast speed
  private autoPlayTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.appEl = document.getElementById('app')!;
    this.state = loadGame();
    this.eventScheduler = new EventScheduler();
    this.unlockManager = new UnlockManager();
    this.activeCards = this.eventScheduler.generateCardsForDay(this.state);

    // Initial check for any unlocks
    this.checkAndTriggerUnlocks();

    // Init game loop
    this.gameLoop = new GameLoop(
      this.state,
      (day, healthEmergency) => this.onDayTick(day, healthEmergency),
      () => this.onRender()
    );

    this.renderAppShell();
    this.renderActiveTab();
    this.gameLoop.start();

    // Run catchup asynchronously so UI is already rendered
    setTimeout(() => {
      this.handleOfflineCatchup();
    }, 200);
  }

  // ─── AUTO-PLAY ENGINE (CONTINUES ALWAYS, PAUSES ONLY FOR CHOICES) ───
  public toggleAutoPlay(): void {
    this.autoPlayActive = !this.autoPlayActive;
    this.autoPlayWaitingForChoice = false;

    if (this.autoPlayActive) {
      this.scheduleNextAutoPlayStep(100);
      this.showToast('⚡', 'Auto-Run activated! Days flowing...', 'var(--neon-lime)');
    } else {
      if (this.autoPlayTimerId !== null) {
        clearTimeout(this.autoPlayTimerId);
        this.autoPlayTimerId = null;
      }
      this.showToast('⏸️', 'Auto-Run paused.', 'var(--text-muted)');
    }

    this.updateHeader();
    this.renderActiveTab();
  }

  public setAutoPlaySpeed(speedMs: number): void {
    this.autoPlaySpeedMs = speedMs;
    if (this.autoPlayActive && !this.autoPlayWaitingForChoice) {
      this.scheduleNextAutoPlayStep(100);
    }
    this.updateHeader();
    this.renderActiveTab();
  }

  private scheduleNextAutoPlayStep(delayMs: number = this.autoPlaySpeedMs): void {
    if (!this.autoPlayActive) return;
    if (this.autoPlayTimerId !== null) {
      clearTimeout(this.autoPlayTimerId);
      this.autoPlayTimerId = null;
    }

    this.autoPlayTimerId = setTimeout(() => {
      this.executeAutoPlayStep();
    }, delayMs);
  }

  private executeAutoPlayStep(): void {
    if (!this.autoPlayActive) return;

    // 1. Auto-resolve single choice cards (e.g. milestones, acknowledgments)
    this.autoResolveSingleChoiceCards();

    // 2. Check if any card has 2+ choices and is unresolved (genuine player decision)
    const pendingDecisions = this.activeCards.filter(
      c => !c.resolved && c.choices.length >= 2
    );

    if (pendingDecisions.length > 0) {
      // Pause tick, wait for player to pick
      this.autoPlayWaitingForChoice = true;
      this.updateHeader();
      this.renderActiveTab();
      return;
    }

    // 3. All clear! No decision required -> Advance day seamlessly!
    this.autoPlayWaitingForChoice = false;
    this.gameLoop.simulateSingleDay();

    // 4. If on story tab, update active view smoothly
    if (this.currentTab === 'story') {
      this.renderActiveTab();
    }

    // 5. Keep auto-playing continuously!
    this.scheduleNextAutoPlayStep();
  }

  /** Auto-resolves cards that only have ONE choice (no real player dilemma) */
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

  // ─── OFFLINE CATCHUP ──────────────────────────────────────
  private handleOfflineCatchup(): void {
    const elapsedDays = calculateElapsedGameDays(this.state.player.lastActiveTimestamp);
    if (elapsedDays > 0) {
      const plan = getOfflineCatchUpPlan(elapsedDays);
      if (plan.mode === 'fast-sim') {
        for (let d = 0; d < plan.days; d++) {
          this.gameLoop?.simulateSingleDay();
        }
        this.showToast('🗓️', `Welcome back! Fast-simulated ${plan.days} days while away.`, 'var(--neon-cyan)');
      } else if (plan.mode === 'aggregate') {
        const notes = applyAggregateOfflineSimulation(this.state, plan.days);
        this.showToast('🗓️', `Offline report: ${notes[0] || 'Progress synced!'}`, 'var(--neon-gold)');
      }
      saveGame(this.state);
    }
  }

  // ─── APP SHELL (GEN Z / GEN ALPHA ARCADE HUD) ──────────────
  private renderAppShell(): void {
    const p = this.state.player;
    this.appEl.innerHTML = `
      <header class="top-nav">
        <div class="top-hud-main-row">
          <div class="top-hud-left">
            <div class="hud-streak-badge">
              <span class="flame-icon">🔥</span>
              <span id="top-day">DAY ${p.currentDay}</span>
            </div>
            <div class="hud-cash-box">
              <span class="hud-cash-label">THE BAG 💰</span>
              <div class="cash-display" id="top-cash">₹${p.money.toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div id="top-health-ring-container">
            ${renderHealthRing(p)}
          </div>
        </div>

        <!-- Persistent Turbo Auto-Play HUD -->
        <div class="turbo-hud-bar ${this.autoPlayActive ? 'active' : ''} ${this.autoPlayWaitingForChoice ? 'waiting' : ''}" id="turbo-hud-bar">
          <div class="turbo-info-col">
            <span class="turbo-status-pill ${this.autoPlayWaitingForChoice ? 'pill-turbo-wait' : (this.autoPlayActive ? 'pill-turbo-on' : 'pill-turbo-off')}">
              ${this.autoPlayWaitingForChoice ? '🚨 DECISION' : (this.autoPlayActive ? '⚡ SPEEDRUN' : '⏸️ MANUAL')}
            </span>
            <span class="turbo-status-msg" id="turbo-msg">
              ${this.autoPlayWaitingForChoice 
                ? 'Action needed! Pick an option below.' 
                : (this.autoPlayActive ? 'Auto-playing... Days flowing!' : 'Auto-Run paused. Tap Run to grind.')
              }
            </span>
          </div>

          <div class="turbo-controls-row">
            <div class="speed-pills-group">
              <button class="btn-speed-pill ${this.autoPlaySpeedMs === 900 ? 'active' : ''}" data-speed="900" title="1x Normal Speed">1x</button>
              <button class="btn-speed-pill ${this.autoPlaySpeedMs === 550 ? 'active' : ''}" data-speed="550" title="2x Turbo Speed">2x</button>
              <button class="btn-speed-pill ${this.autoPlaySpeedMs === 250 ? 'active' : ''}" data-speed="250" title="5x Warp Speed">5x 🚀</button>
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
          <span class="icon">📖</span><span>Daily Lore</span>
        </button>
        <button class="nav-tab" data-tab="account">
          <span class="icon">🏦</span><span>The Vault</span>
        </button>
        <button class="nav-tab" data-tab="status">
          <span class="icon">🎮</span><span>Profile</span>
        </button>
      </nav>
      <div id="modal-container"></div>
    `;

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
      case 'account':
        container.appendChild(renderAccountScreen(this.state));
        break;
      case 'status':
        container.appendChild(renderStatusPanelScreen(this.state, onAction, this.unlockManager));
        break;
    }
  }

  // ─── GAME EVENTS & CARD SELECTION ─────────────────────────
  private handleCardChoice(card: ActiveEventCard, choiceId: string): void {
    this.eventScheduler.resolveCardChoice(card, choiceId, this.state);
    this.checkAndTriggerUnlocks();
    saveGame(this.state);
    this.updateHeader();
    this.renderActiveTab();

    // If auto-play is enabled: check if any pending multi-choice decisions remain.
    // If all clear, AUTOMATICALLY CONTINUE auto-play after 350ms!
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
    this.showToast('⏩', `Fast-forwarded ${days} days! Cash Δ: ${incomeStr}`, 'var(--neon-cyan)');
  }

  private onDayTick(_day: number, healthEmergency?: HealthConsequenceResult): void {
    const newCards = this.eventScheduler.generateCardsForDay(this.state, healthEmergency);
    this.activeCards = [...newCards, ...this.activeCards.filter(c => !c.resolved)];
    this.checkAndTriggerUnlocks();

    // Check if any course hit 100% completion
    this.checkCourseCompletions();

    saveGame(this.state);
    this.updateHeader();

    // Auto-play: if new cards with 2+ choices appear, pause the loop for user input
    const hasPendingDecisions = this.activeCards.some(
      c => !c.resolved && c.choices.length >= 2
    );
    if (this.autoPlayActive && hasPendingDecisions) {
      this.autoPlayWaitingForChoice = true;
      this.updateHeader();
    }
  }

  /** Spawn a celebratory job-offer card when a certification hits 100% */
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
      title: `🎓 CERTIFICATION COMPLETE: ${course.name}!`,
      emoji: '📜',
      narrative: `Massive W! You completed ${course.name}. ${
        unlockedJob
          ? `Top recruiters extended an official offer for ${unlockedJob.title} paying ₹${unlockedJob.salaryPerCycle.toLocaleString('en-IN')}/15d!`
          : 'You are now certified and ready for high-tier career moves!'
      }`,
      day: this.state.player.currentDay,
      choices: unlockedJob
        ? [
            {
              id: 'switch-now',
              label: `Accept Offer (₹${unlockedJob.salaryPerCycle.toLocaleString('en-IN')}/15d)`,
              emoji: '💼',
              preview: [
                { text: `Salary: ₹${unlockedJob.salaryPerCycle.toLocaleString('en-IN')}/15d`, type: 'positive' },
                { text: `Promoted to ${unlockedJob.title}`, type: 'positive' }
              ]
            },
            {
              id: 'keep-current',
              label: 'Keep Current Job (Switch anytime in Profile)',
              emoji: '🚶',
              preview: [
                { text: 'Stay in current role', type: 'neutral' },
                { text: 'Role unlocked in Profile tab', type: 'neutral' }
              ]
            }
          ]
        : [
            {
              id: 'claim-cert',
              label: 'Claim Certification 📜',
              emoji: '✨',
              preview: [{ text: 'Level up unlocked!', type: 'positive' }]
            }
          ],
      resolved: false
    };

    this.activeCards.unshift(card);
    this.showToast('🎓', `Level Up! Completed ${course.name}`, 'var(--neon-gold)');
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
    const p = this.state.player;
    const cashEl = document.getElementById('top-cash');
    const dayEl = document.getElementById('top-day');
    if (cashEl) cashEl.innerText = formatCurrency(p.money);
    if (dayEl) dayEl.innerText = `DAY ${p.currentDay}`;

    const healthContainer = document.getElementById('top-health-ring-container');
    if (healthContainer) {
      healthContainer.innerHTML = renderHealthRing(p);
    }

    // Update Turbo bar status
    const turboBar = document.getElementById('turbo-hud-bar');
    const turboMsg = document.getElementById('turbo-msg');
    const toggleBtn = document.getElementById('btn-toggle-turbo');

    if (turboBar && turboMsg && toggleBtn) {
      if (this.autoPlayWaitingForChoice) {
        turboBar.className = 'turbo-hud-bar waiting';
        turboMsg.innerText = '🚨 Decision Required! Pick an option below to resume.';
        toggleBtn.className = 'btn-turbo-toggle btn-pause';
        toggleBtn.innerText = '⏸️ PAUSE';
      } else if (this.autoPlayActive) {
        turboBar.className = 'turbo-hud-bar active';
        turboMsg.innerText = '⚡ Speedrunning Life... Days flowing!';
        toggleBtn.className = 'btn-turbo-toggle btn-pause';
        toggleBtn.innerText = '⏸️ PAUSE';
      } else {
        turboBar.className = 'turbo-hud-bar';
        turboMsg.innerText = 'Auto-Run paused. Tap Run to grind!';
        toggleBtn.className = 'btn-turbo-toggle';
        toggleBtn.innerText = '⚡ RUN';
      }

      // Update speed pill active states
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

  // ─── TOAST NOTIFICATION SYSTEM ────────────────────────────
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
    toast.innerHTML = `
      <div class="toast-glow-bar" style="background:${color};"></div>
      <div class="toast-content-row">
        <span class="toast-feature-icon">${icon}</span>
        <div class="toast-text-col">
          <div class="toast-desc">${message}</div>
        </div>
      </div>
    `;
    tc.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 260);
    }, 3200);
  }

  // ─── GAME ACTIONS DISPATCHER ──────────────────────────────
  private handleAction(action: string, payload?: any): void {
    const modalContainer = document.getElementById('modal-container')!;

    switch (action) {
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
                this.showToast('📈', `SIP created! ₹1,000 auto-invested in ${ticker.name} every 15 days.`, 'var(--neon-lime)');
              }
              saveGame(this.state);
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
              this.renderActiveTab();
            } else {
              this.showToast('❌', 'Insufficient cash for gold purchase.', 'var(--neon-coral)');
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
            this.renderActiveTab();
          }
        }
        break;

      case 'buy-property': {
        const prop = this.state.market.properties.find(p => p.id === payload.propertyId);
        if (prop && this.state.player.money >= prop.price) {
          if (confirm(`Acquire ${prop.name} for ${formatCurrency(prop.price)}?`)) {
            this.state.player.money -= prop.price;
            prop.owner = 'player';
            this.state.player.properties.push({
              id: prop.id,
              purchasePrice: prop.price,
              riskStatus: prop.riskProfile.legalStatus,
              mortgage: null
            });
            this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Acquired property: ${prop.name}`, type: 'investment' });
            saveGame(this.state);
            this.renderActiveTab();
          }
        } else {
          this.showToast('❌', 'Insufficient funds to buy property!', 'var(--neon-coral)');
        }
        break;
      }

      case 'buy-lifestyle-asset': {
        const item = ASSET_CATALOG.find(a => a.id === payload.assetId);
        if (item && this.state.player.money >= item.price) {
          if (confirm(`Purchase ${item.name} for ${formatCurrency(item.price)}?`)) {
            this.state.player.money -= item.price;
            this.state.player.lifestyleAssets.push({
              id: item.id,
              purchasePrice: item.price,
              currentValue: item.price,
              purchasedOnDay: this.state.player.currentDay,
              monthlyMaintenance: item.monthlyUpkeep
            });
            if (item.id === 'scooter') this.state.player.lifestyle.transportMode = 'scooter';
            if (item.id === 'car') this.state.player.lifestyle.transportMode = 'car';
            if (item.id === 'bicycle') this.state.player.lifestyle.transportMode = 'bicycle';
            this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Acquired asset: ${item.name}`, type: 'investment' });
            saveGame(this.state);
            this.renderActiveTab();
          }
        } else {
          this.showToast('❌', 'Insufficient cash for this asset.', 'var(--neon-coral)');
        }
        break;
      }

      case 'claim-business-slot': {
        const sec = this.state.market.businessSectors.find(s => s.id === payload.sectorId);
        if (sec && this.state.player.money >= sec.startupCost) {
          const slot = sec.slots.find(s => s.owner === null);
          if (slot && confirm(`Launch venture in ${sec.name} for ${formatCurrency(sec.startupCost)}?`)) {
            this.state.player.money -= sec.startupCost;
            slot.owner = 'player';
            this.state.player.businesses.push({
              sectorId: sec.id,
              slotId: slot.id,
              startedDay: this.state.player.currentDay,
              cashInvested: sec.startupCost
            });
            this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Started business in ${sec.name}!`, type: 'investment' });
            saveGame(this.state);
            this.renderActiveTab();
          }
        } else {
          this.showToast('❌', 'Insufficient capital for this venture.', 'var(--neon-coral)');
        }
        break;
      }

      case 'deposit-savings': {
        const dep = prompt(`Amount to deposit to savings (Cash: ${formatCurrency(this.state.player.money)}):`, '1000');
        const dAmt = parseInt(dep || '0', 10);
        if (dAmt > 0 && this.state.player.money >= dAmt) {
          this.state.player.money -= dAmt;
          this.state.player.savingsBalance += dAmt;
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Deposited ${formatCurrency(dAmt)} to savings`, type: 'investment' });
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;
      }

      case 'withdraw-savings': {
        const wit = prompt(`Amount to withdraw (Balance: ${formatCurrency(this.state.player.savingsBalance)}):`, '1000');
        const wAmt = parseInt(wit || '0', 10);
        if (wAmt > 0 && this.state.player.savingsBalance >= wAmt) {
          this.state.player.savingsBalance -= wAmt;
          this.state.player.money += wAmt;
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Withdrew ${formatCurrency(wAmt)} from savings`, type: 'expense' });
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;
      }

      case 'open-loan-modal': {
        const loanAmtStr = prompt('Enter requested loan amount (Max ₹1,00,000 at 12% APR):', '25000');
        const lAmt = parseInt(loanAmtStr || '0', 10);
        if (lAmt > 0 && lAmt <= 100000) {
          const emi = Math.round((lAmt / 12) + (lAmt * 0.01));
          this.state.player.money += lAmt;
          this.state.player.loans.push({
            id: `loan-${Date.now()}`,
            name: `Personal Credit ₹${lAmt.toLocaleString('en-IN')}`,
            type: 'personal',
            principalRemaining: lAmt,
            interestRate: 0.12,
            emiAmount: emi,
            cycleDays: 30,
            lastPaidDay: this.state.player.currentDay,
            missedPayments: 0
          });
          this.showToast('💳', `Approved! +${formatCurrency(lAmt)} added. EMI: ${formatCurrency(emi)}/30d`, 'var(--neon-gold)');
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;
      }

      case 'select-insurance-tier': {
        const tier = payload.tier;
        if (tier === 'none') {
          this.state.player.insurance.health = { tier: 'none', premiumPerMonth: 0, coveragePct: 0 };
        } else if (tier === 'basic') {
          this.state.player.insurance.health = { tier: 'basic', premiumPerMonth: 500, coveragePct: 0.5 };
        } else if (tier === 'standard') {
          this.state.player.insurance.health = { tier: 'standard', premiumPerMonth: 1200, coveragePct: 0.8 };
        } else if (tier === 'premium') {
          this.state.player.insurance.health = { tier: 'premium', premiumPerMonth: 2500, coveragePct: 0.95 };
        }
        saveGame(this.state);
        this.renderActiveTab();
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
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Started new job: ${targetJob.title}`, type: 'income' });
          this.showToast('💼', `Promoted! New role: ${targetJob.title}`, 'var(--neon-lime)');
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;
      }

      // ─── Real-Time Course Study Enrollment ───
      case 'enroll-course': {
        const course = COURSES.find(c => c.id === payload.courseId);
        if (!course) break;

        if (this.state.player.money < course.fee) {
          this.showToast('❌', `Need ₹${course.fee.toLocaleString('en-IN')} cash for enrollment!`, 'var(--neon-coral)');
          break;
        }

        // Deduct fee and start active study
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

        this.showToast('📚', `Enrolled in ${course.name}! Grinding begins (~${course.slotsRequired} days).`, 'var(--neon-cyan)');
        saveGame(this.state);
        this.updateHeader();
        this.renderActiveTab();
        break;
      }

      case 'pause-course': {
        this.state.player.activeCourseId = null;
        this.showToast('⏸️', 'Course study paused. Resume anytime from Profile!', 'var(--text-muted)');
        saveGame(this.state);
        this.updateHeader();
        this.renderActiveTab();
        break;
      }

      case 'set-transport': {
        this.state.player.lifestyle.transportMode = payload.mode;
        this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Transport mode changed to ${payload.mode}`, type: 'event' });
        saveGame(this.state);
        this.renderActiveTab();
        break;
      }

      case 'set-housing': {
        this.state.player.housing.amountPerCycle = payload.amount;
        this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Housing budget set to ${formatCurrency(payload.amount)}/mo`, type: 'expense' });
        saveGame(this.state);
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
      appEl.innerHTML = `<div style="color:#ff3366;padding:24px;font-family:sans-serif;">
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
