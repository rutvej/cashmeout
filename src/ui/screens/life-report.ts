import { GameState } from '../../types/game';
import { LIFE_GOALS, calculateTotalNetWorth } from '../../data/life-goals';
import { formatCurrency } from '../components/format';

export interface LifeReportCallbacks {
  onRestart: () => void;
}

export function renderLifeReportModal(state: GameState, callbacks: LifeReportCallbacks): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const nw = calculateTotalNetWorth(state);
  const wealthGoal = LIFE_GOALS.find(g => g.id === state.player.lifeGoals.wealthGoalId);
  const healthGoal = LIFE_GOALS.find(g => g.id === state.player.lifeGoals.healthGoalId);
  const lifestyleGoal = LIFE_GOALS.find(g => g.id === state.player.lifeGoals.lifestyleGoalId);

  const wealthPassed = wealthGoal ? wealthGoal.checkCompletion(state) : false;
  const healthPassed = healthGoal ? healthGoal.checkCompletion(state) : false;
  const lifestylePassed = lifestyleGoal ? lifestyleGoal.checkCompletion(state) : false;

  const passedCount = (wealthPassed ? 1 : 0) + (healthPassed ? 1 : 0) + (lifestylePassed ? 1 : 0);

  let grade = 'C';
  let gradeColor = 'var(--accent-amber)';
  let reflectionText = 'A decade of hard lessons and compromises.';

  if (state.resources.cashOnHand < 0 || state.simulation.hospitalizationCount >= 5) {
    grade = 'F';
    gradeColor = 'var(--accent-rose)';
    reflectionText = 'Insolvency and severe health collapse overwhelmed your balance sheet.';
  } else if (passedCount === 3 && nw > 50000 && state.resources.physicalHealth >= 70) {
    grade = 'A';
    gradeColor = 'var(--accent-green)';
    reflectionText = 'Masterful balance! You achieved your ambitions while preserving your vitality.';
  } else if (passedCount >= 2 && nw > 0) {
    grade = 'B+';
    gradeColor = 'var(--accent-cyan)';
    reflectionText = 'Strong financial discipline and equity growth, with manageable career stress.';
  } else if (passedCount === 1) {
    grade = 'C';
    gradeColor = 'var(--accent-amber)';
    reflectionText = 'You survived the decade, but sacrificed either wealth or health along the way.';
  } else {
    grade = 'D';
    gradeColor = 'var(--accent-rose)';
    reflectionText = 'Struggled against compounding negative habits and financial volatility.';
  }

  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 720px; border-color: ${gradeColor};">
      <div style="text-align: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 14px;">
        <h1 style="font-size: 1.5rem; font-weight: 800; color: #fff;">🎓 10-Year Life Retrospective: ${state.player.name}</h1>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">Age 32 • Day 3,650 Complete • 120 Simulated Months</div>
      </div>

      <!-- Life Grade Banner -->
      <div style="text-align: center; padding: 18px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md);">
        <div class="metric-label">Overall Life Architect Grade</div>
        <div style="font-size: 3rem; font-weight: 900; color: ${gradeColor}; line-height: 1.1; margin: 4px 0;">${grade}</div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); max-width: 500px; margin: 0 auto;">
          "${reflectionText}"
        </p>
      </div>

      <!-- 3 Life Goals Audit -->
      <div>
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 8px;">🎯 Targeted Life Ambitions (Spec 10)</h3>
        <div class="item-list">
          <div class="list-item">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">💰 Wealth: ${wealthGoal?.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${wealthGoal?.targetDescription}</div>
            </div>
            <span class="time-tag" style="background: ${wealthPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${wealthPassed ? 'var(--accent-green)' : 'var(--accent-rose)'};">
              ${wealthPassed ? 'PASSED ✅' : 'FAILED ❌'}
            </span>
          </div>

          <div class="list-item">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">🏥 Vitality: ${healthGoal?.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${healthGoal?.targetDescription}</div>
            </div>
            <span class="time-tag" style="background: ${healthPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${healthPassed ? 'var(--accent-green)' : 'var(--accent-rose)'};">
              ${healthPassed ? 'PASSED ✅' : 'FAILED ❌'}
            </span>
          </div>

          <div class="list-item">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">🏖️ Lifestyle: ${lifestyleGoal?.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${lifestyleGoal?.targetDescription}</div>
            </div>
            <span class="time-tag" style="background: ${lifestylePassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${lifestylePassed ? 'var(--accent-green)' : 'var(--accent-rose)'};">
              ${lifestylePassed ? 'PASSED ✅' : 'FAILED ❌'}
            </span>
          </div>
        </div>
      </div>

      <!-- Financial Audit Summary -->
      <div>
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 8px;">📊 Financial Balance Sheet</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div class="metric-pill">
            <span class="metric-label">Final Net Worth</span>
            <span class="metric-value positive">${formatCurrency(nw)}</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Liquid Checking</span>
            <span class="metric-value">${formatCurrency(state.resources.cashOnHand)}</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Emergency Buffer</span>
            <span class="metric-value">${formatCurrency(state.resources.emergencyFund)}</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Credit Score</span>
            <span class="metric-value">${state.resources.creditScore}</span>
          </div>
        </div>
      </div>

      <!-- Vitality Biometrics -->
      <div>
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 8px;">🏥 Vitality & Health Scorecard</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
          <div class="metric-pill">
            <span class="metric-label">Physical Health</span>
            <span class="metric-value">${Math.round(state.resources.physicalHealth)}%</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Mental Resilience</span>
            <span class="metric-value">${Math.round(state.resources.mentalHealth)}%</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Burnout Collapses</span>
            <span class="metric-value ${state.simulation.burnoutEpisodeCount > 0 ? 'danger' : 'positive'}">${state.simulation.burnoutEpisodeCount}</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Lifetime Gyms</span>
            <span class="metric-value positive">${state.simulation.lifetimeGymSessions}</span>
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; text-align: center;">
        <button id="btn-restart-simulation" class="btn-action success" style="padding: 12px 30px; font-size: 1rem; font-weight: 800;">
          Start New 10-Year Life Cycle 🔄
        </button>
      </div>
    </div>
  `;

  overlay.querySelector('#btn-restart-simulation')?.addEventListener('click', () => {
    overlay.remove();
    callbacks.onRestart();
  });

  return overlay;
}
