import { GameState } from '../types/game';
import { loadGame, saveGame, resetGame } from '../save/save-manager';
import { GameLoop } from '../engine/game-loop';
import { renderHud } from './components/hud';
import { renderDashboardScreen } from './screens/dashboard';
import { renderCareerScreen } from './screens/career';
import { renderInvestmentsScreen } from './screens/investments';
import { renderBusinessScreen } from './screens/business';
import { renderPropertyScreen } from './screens/property';
import { renderFinanceHealthScreen } from './screens/finance-health';
import { renderSalaryDayModal } from './screens/salary-day';
import { renderOnboardingWizard } from './screens/onboarding';
import { renderLifeReportModal } from './screens/life-report';

export class App {
  private state: GameState;
  private gameLoop: GameLoop;
  private currentTab = 'dashboard';
  private appEl: HTMLElement;
  private modalContainer: HTMLElement;

  constructor() {
    this.appEl = document.getElementById('app')!;
    this.state = loadGame();

    // Setup modal container
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'modal-container';
    document.body.appendChild(this.modalContainer);

    this.gameLoop = new GameLoop(this.state, {
      onRender: () => this.render(),
      onSalaryDay: () => this.triggerSalaryDay(),
      onYearEndTax: (tax) => console.log('Tax settled:', tax),
      onGameOver: () => this.triggerLifeReport()
    });

    // Handle initial onboarding if needed
    if (!this.state.player.onboardingComplete) {
      this.triggerOnboarding();
    } else {
      this.render();
      // If starts on Day 1, trigger Salary Day
      if (this.state.player.currentDay === 1) {
        this.triggerSalaryDay();
      }
    }

    // Global step day custom event from dashboard
    window.addEventListener('step-day', () => {
      this.gameLoop.stepDay();
    });
  }

  private render(): void {
    this.appEl.innerHTML = '';

    // 1. Top HUD
    const hud = renderHud(this.state, {
      onTogglePause: () => {
        if (this.state.simulation.isPaused) this.gameLoop.start();
        else this.gameLoop.pause();
        this.render();
      },
      onSetSpeed: (speed) => {
        this.gameLoop.setSpeed(speed);
        this.render();
      },
      onStepDay: () => {
        this.gameLoop.stepDay();
      },
      onStepMonth: () => {
        this.gameLoop.advanceMonth();
      },
      onOpenGoalsModal: () => {}
    });
    this.appEl.appendChild(hud);

    // 2. Navigation Tabs
    const nav = document.createElement('nav');
    nav.className = 'nav-tabs';
    const tabs = [
      { id: 'dashboard', label: '⚡ Life & Feed' },
      { id: 'career', label: '💼 Career & Resume' },
      { id: 'invest', label: '📈 Investments & SIP' },
      { id: 'business', label: '🏪 Business Ventures' },
      { id: 'property', label: '🏠 Real Estate' },
      { id: 'finance', label: '🛡️ Finance & Health' }
    ];

    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${this.currentTab === tab.id ? 'active' : ''}`;
      btn.textContent = tab.label;
      btn.addEventListener('click', () => {
        this.currentTab = tab.id;
        this.render();
      });
      nav.appendChild(btn);
    }
    this.appEl.appendChild(nav);

    // 3. Active Screen Content
    let screenEl: HTMLElement;
    switch (this.currentTab) {
      case 'career':
        screenEl = renderCareerScreen(this.state, { onRefresh: () => this.render() });
        break;
      case 'invest':
        screenEl = renderInvestmentsScreen(this.state, { onRefresh: () => this.render() });
        break;
      case 'business':
        screenEl = renderBusinessScreen(this.state, { onRefresh: () => this.render() });
        break;
      case 'property':
        screenEl = renderPropertyScreen(this.state, { onRefresh: () => this.render() });
        break;
      case 'finance':
        screenEl = renderFinanceHealthScreen(this.state, { onRefresh: () => this.render() });
        break;
      case 'dashboard':
      default:
        screenEl = renderDashboardScreen(this.state, {
          onResolveChoice: (cardId, choiceId) => {
            const card = this.state.simulation.activeEventCards.find(c => c.id === cardId);
            if (card) {
              const choice = card.choices.find(ch => ch.id === choiceId);
              if (choice) {
                const res = choice.apply(this.state);
                this.state.simulation.recentLogs.unshift({
                  day: this.state.player.currentDay,
                  message: `${card.title}: ${res.outcomeText}`,
                  type: res.notificationType
                });
                this.state.simulation.activeEventCards = this.state.simulation.activeEventCards.filter(c => c.id !== cardId);
                saveGame(this.state);
                this.render();
              }
            }
          },
          onRefresh: () => this.render()
        });
        break;
    }

    this.appEl.appendChild(screenEl);
  }

  private triggerSalaryDay(): void {
    this.modalContainer.innerHTML = '';
    const modal = renderSalaryDayModal(this.state, {
      onConfirmed: () => {
        this.modalContainer.innerHTML = '';
        saveGame(this.state);
        this.render();
      }
    });
    this.modalContainer.appendChild(modal);
  }

  private triggerOnboarding(): void {
    this.modalContainer.innerHTML = '';
    const modal = renderOnboardingWizard(this.state, {
      onComplete: () => {
        this.modalContainer.innerHTML = '';
        saveGame(this.state);
        this.render();
        this.triggerSalaryDay();
      }
    });
    this.modalContainer.appendChild(modal);
  }

  private triggerLifeReport(): void {
    this.modalContainer.innerHTML = '';
    const modal = renderLifeReportModal(this.state, {
      onRestart: () => {
        this.modalContainer.innerHTML = '';
        this.state = resetGame();
        this.currentTab = 'dashboard';
        this.triggerOnboarding();
      }
    });
    this.modalContainer.appendChild(modal);
  }
}
