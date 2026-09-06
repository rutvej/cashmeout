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
import { renderDashboardScreen } from './ui/screens/dashboard';
import { renderMarketScreen } from './ui/screens/market';
import { renderAssetsScreen } from './ui/screens/assets';
import { renderBusinessScreen } from './ui/screens/business';
import { renderBankScreen } from './ui/screens/bank';
import { renderLifeScreen } from './ui/screens/life';

// Components & Events
import { renderHealthRing } from './ui/components/health-ring';
import { EventScheduler } from './events/event-scheduler';
import { ActiveEventCard } from './events/event-types';

// Modals
import { showTimeAllocationModal, showDietModal, showStockTradeModal } from './ui/modals/all-modals';

class App {
  private state: GameState;
  private currentTab = 'story';
  private gameLoop: GameLoop;
  private appEl: HTMLElement;
  private eventScheduler: EventScheduler;
  private activeCards: ActiveEventCard[] = [];

  constructor() {
    this.appEl = document.getElementById('app')!;
    this.state = loadGame();
    this.eventScheduler = new EventScheduler();
    this.activeCards = this.eventScheduler.generateCardsForDay(this.state);

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

  private handleOfflineCatchup(): void {
    const elapsedDays = calculateElapsedGameDays(this.state.player.lastActiveTimestamp);
    if (elapsedDays > 0) {
      const plan = getOfflineCatchUpPlan(elapsedDays);
      if (plan.mode === 'fast-sim') {
        for (let d = 0; d < plan.days; d++) {
          this.gameLoop?.simulateSingleDay();
        }
        alert(`Welcome back! Fast-simulated ${plan.days} days of your absence.`);
      } else if (plan.mode === 'aggregate') {
        const notes = applyAggregateOfflineSimulation(this.state, plan.days);
        alert(`Offline Progression Report:\n\n${notes.join('\n')}`);
      }
      saveGame(this.state);
    }
  }

  private renderAppShell(): void {
    this.appEl.innerHTML = `
      <header class="top-nav">
        <div class="top-nav-left">
          <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Available Cash</div>
          <div class="top-cash-row">
            <div class="cash-display" id="top-cash">₹0</div>
            <div class="day-badge" id="top-day">Day 1</div>
          </div>
        </div>
        <div id="top-health-ring-container">
          ${renderHealthRing(this.state.player)}
        </div>
      </header>

      <main class="screen-container" id="screen-container"></main>

      <nav class="bottom-nav">
        <button class="nav-tab active" data-tab="story">
          <span class="icon">📖</span><span>Life Story</span>
        </button>
        <button class="nav-tab" data-tab="status">
          <span class="icon">📊</span><span>Life Status</span>
        </button>
      </nav>
      <div id="modal-container"></div>
    `;

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
    const container = document.getElementById('screen-container')!;
    container.innerHTML = '';

    const onAction = (action: string, payload?: any) => this.handleAction(action, payload);

    switch (this.currentTab) {
      case 'story':
        container.appendChild(renderEventFeedScreen(
          this.state,
          this.activeCards,
          (card, choiceId) => this.handleCardChoice(card, choiceId),
          () => this.handleAdvanceDay()
        ));
        break;
      case 'status':
        container.appendChild(renderStatusPanelScreen(this.state, onAction));
        break;
      case 'dashboard':
        container.appendChild(renderDashboardScreen(this.state, onAction));
        break;
      case 'market':
        container.appendChild(renderMarketScreen(this.state, onAction));
        break;
      case 'assets':
        container.appendChild(renderAssetsScreen(this.state, onAction));
        break;
      case 'business':
        container.appendChild(renderBusinessScreen(this.state, onAction));
        break;
      case 'bank':
        container.appendChild(renderBankScreen(this.state, onAction));
        break;
      case 'life':
        container.appendChild(renderLifeScreen(this.state, onAction));
        break;
    }
  }

  private handleCardChoice(card: ActiveEventCard, choiceId: string): void {
    this.eventScheduler.resolveCardChoice(card, choiceId, this.state);
    saveGame(this.state);
    this.updateHeader();
    this.renderActiveTab();
  }

  private handleAdvanceDay(): void {
    this.gameLoop.simulateSingleDay();
  }

  private onDayTick(_day: number, healthEmergency?: HealthConsequenceResult): void {
    const newCards = this.eventScheduler.generateCardsForDay(this.state, healthEmergency);
    this.activeCards = [...newCards, ...this.activeCards.filter(c => !c.resolved)];
    saveGame(this.state);
    this.updateHeader();
    this.renderActiveTab();
  }

  private onRender(): void {
    this.updateHeader();
  }

  private updateHeader(): void {
    const p = this.state.player;
    const cashEl = document.getElementById('top-cash');
    const dayEl = document.getElementById('top-day');
    if (cashEl) cashEl.innerText = formatCurrency(p.money);
    if (dayEl) dayEl.innerText = `Day ${p.currentDay}`;

    const healthContainer = document.getElementById('top-health-ring-container');
    if (healthContainer) {
      healthContainer.innerHTML = renderHealthRing(p);
    }
  }

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
                alert(`SIP created! ₹1,000 will be auto-invested into ${ticker.name} every 15 days.`);
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
              saveGame(this.state);
              this.renderActiveTab();
            } else {
              alert('Insufficient cash for gold purchase.');
            }
          }
        } else {
          const grams = prompt(`How many grams of gold to sell? (You hold ${this.state.player.goldHoldings.grams}g)`, '1');
          const g = parseInt(grams || '0', 10);
          if (g > 0 && g <= this.state.player.goldHoldings.grams) {
            const earned = g * this.state.market.goldPricePerGram;
            this.state.player.money += earned;
            this.state.player.goldHoldings.grams -= g;
            saveGame(this.state);
            this.renderActiveTab();
          }
        }
        break;

      case 'buy-property':
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
          alert('Insufficient funds to buy property outright!');
        }
        break;

      case 'buy-lifestyle-asset':
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
          alert('Insufficient cash for this asset.');
        }
        break;

      case 'claim-business-slot':
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
          alert('Insufficient capital for starting this venture.');
        }
        break;

      case 'deposit-savings':
        const dep = prompt(`Amount to deposit to savings (Cash: ${formatCurrency(this.state.player.money)}):`, '1000');
        const dAmt = parseInt(dep || '0', 10);
        if (dAmt > 0 && this.state.player.money >= dAmt) {
          this.state.player.money -= dAmt;
          this.state.player.savingsBalance += dAmt;
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;

      case 'withdraw-savings':
        const wit = prompt(`Amount to withdraw from savings (Balance: ${formatCurrency(this.state.player.savingsBalance)}):`, '1000');
        const wAmt = parseInt(wit || '0', 10);
        if (wAmt > 0 && this.state.player.savingsBalance >= wAmt) {
          this.state.player.savingsBalance -= wAmt;
          this.state.player.money += wAmt;
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;

      case 'open-loan-modal':
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
          alert(`Approved! Added ${formatCurrency(lAmt)} to wallet. EMI: ${formatCurrency(emi)} / 30 days.`);
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;

      case 'select-insurance-tier':
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

      case 'switch-job':
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
          saveGame(this.state);
          this.renderActiveTab();
        }
        break;

      case 'enroll-course':
        const course = COURSES.find(c => c.id === payload.courseId);
        if (course && this.state.player.money >= course.fee) {
          this.state.player.money -= course.fee;
          this.state.player.educationProgress[course.id] = 100; // instant completed certification
          this.state.player.eventLog.unshift({ day: this.state.player.currentDay, text: `Earned certification in ${course.name}`, type: 'achievement' });
          saveGame(this.state);
          this.renderActiveTab();
        } else {
          alert('Insufficient funds for enrollment fee.');
        }
        break;
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
      appEl.innerHTML = `<div style="color:#ef4444;padding:24px;font-family:sans-serif;">
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
