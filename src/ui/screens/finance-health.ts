import { GameState } from '../../types/game';
import { HEALTH_INSURANCE_TIERS } from '../../data/insurance';
import { calculateIncomeTax } from '../../engine/economy';
import { getCreditTierInfo } from '../../engine/credit';
import { formatCurrency } from '../components/format';

export interface FinanceHealthCallbacks {
  onRefresh: () => void;
}

export function renderFinanceHealthScreen(state: GameState, callbacks: FinanceHealthCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-container';

  const creditInfo = getCreditTierInfo(state.resources.creditScore);
  const taxEst = calculateIncomeTax(state.resources.currentYearTaxableIncome);

  container.innerHTML = `
    <!-- Credit Score & Liabilities -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">💳 Credit Score & Liabilities (Spec 07)</h2>
        <span class="metric-value ${state.resources.creditScore >= 700 ? 'positive' : (state.resources.creditScore >= 600 ? 'warning' : 'danger')}">
          Score: ${state.resources.creditScore} (${creditInfo.label})
        </span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">
        Unsecured Personal Loan APR: <strong>${(creditInfo.personalLoanAPR * 100).toFixed(1)}%</strong> • 25-Year Fixed Mortgage APR: <strong>${(creditInfo.mortgageAPR * 100).toFixed(1)}%</strong>
      </div>

      ${state.liabilities.loans.length > 0 ? `
        <div class="item-list">
          ${state.liabilities.loans.map(loan => `
            <div class="list-item">
              <div>
                <div style="font-weight: 700;">${loan.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  Balance: ${formatCurrency(loan.balance)} • APR: ${(loan.annualInterestRate * 100).toFixed(1)}% • EMI: ${formatCurrency(loan.monthlyEMI)}/mo (${loan.remainingMonths} mos left)
                </div>
              </div>
              <button class="btn-action success" data-payoff-loan="${loan.id}">
                Pay Full Balance (${formatCurrency(loan.balance)})
              </button>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="font-size: 0.85rem; color: var(--accent-green);">🎉 Debt-Free! You currently hold zero outstanding consumer loans.</div>
      `}
    </div>

    <!-- Health Insurance Tiers -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🛡️ Health Insurance Coverage</h3>
        <span class="time-tag">Active: ${HEALTH_INSURANCE_TIERS.find(t => t.tier === state.insurance.healthInsuranceTier)?.name}</span>
      </div>
      <div class="item-list">
        ${HEALTH_INSURANCE_TIERS.map(plan => {
          const isCurrent = state.insurance.healthInsuranceTier === plan.tier;

          return `
            <div class="list-item">
              <div style="max-width: 500px;">
                <div style="font-weight: 700; font-size: 0.95rem;">${plan.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${plan.description}</div>
                <div style="font-size: 0.78rem; color: var(--accent-cyan); margin-top: 2px;">
                  Coverage: ${(plan.coveragePct * 100).toFixed(0)}% • Deductible: ${formatCurrency(plan.deductible)} • Max Out-of-Pocket: ${formatCurrency(plan.maxOutOfPocket)}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="metric-value">${formatCurrency(plan.monthlyPremium)}/mo</span>
                <button class="btn-ctrl ${isCurrent ? 'active' : ''}" data-select-insurance="${plan.tier}">
                  ${isCurrent ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Annual Progressive Income Tax Audit -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🏛️ Annual Progressive Tax Forecast</h3>
        <span class="metric-value danger">Est Tax: ${formatCurrency(taxEst)}</span>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 10px;">
        Year-to-date taxable income: <strong>${formatCurrency(state.resources.currentYearTaxableIncome)}</strong>. Tax is audited and deducted automatically on Month 12, Day 30 per Spec 07 brackets.
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; font-size: 0.75rem;">
        <div class="metric-pill"><span>$0 – $15,000</span><strong>0% Marginal</strong></div>
        <div class="metric-pill"><span>$15,001 – $35,000</span><strong>10% Marginal</strong></div>
        <div class="metric-pill"><span>$35,001 – $65,000</span><strong>20% Marginal</strong></div>
        <div class="metric-pill"><span>$65,001+</span><strong>30% Marginal</strong></div>
      </div>
    </div>

    <!-- Wellness & Mental Recovery -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🌿 Health & Wellness Retreats</h3>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        <div class="metric-pill">
          <div style="font-weight: 700;">Doctor Comprehensive Checkup</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Restore physical vitality</div>
          <button id="btn-doctor-checkup" class="btn-action">Consult Doctor ($150)</button>
        </div>

        <div class="metric-pill">
          <div style="font-weight: 700;">Mental Therapy & Coaching</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Clear stress and brain fog</div>
          <button id="btn-therapy-session" class="btn-action">Therapy Session ($120)</button>
        </div>

        <div class="metric-pill">
          <div style="font-weight: 700;">Weeklong Island Vacation</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 6px;">Deep recharge for mental & energy</div>
          <button id="btn-vacation-trip" class="btn-action success">Take Vacation ($1,200)</button>
        </div>
      </div>
    </div>
  `;

  // Pay off loan listener
  container.querySelectorAll('button[data-payoff-loan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lId = (btn as HTMLElement).dataset.payoffLoan!;
      const loan = state.liabilities.loans.find(l => l.id === lId);
      if (!loan || state.resources.cashOnHand < loan.balance) return;

      state.resources.cashOnHand -= loan.balance;
      state.resources.creditScore = Math.min(850, state.resources.creditScore + 25);
      state.liabilities.loans = state.liabilities.loans.filter(l => l.id !== lId);
      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `🎉 Debt Cleared: Paid off ${loan.name} in full! Credit score jumped +25 pts.`,
        type: 'positive'
      });
      callbacks.onRefresh();
    });
  });

  // Select insurance listener
  container.querySelectorAll('button[data-select-insurance]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = (btn as HTMLElement).dataset.selectInsurance! as any;
      state.insurance.healthInsuranceTier = tier;
      callbacks.onRefresh();
    });
  });

  // Wellness listeners
  container.querySelector('#btn-doctor-checkup')?.addEventListener('click', () => {
    if (state.resources.cashOnHand >= 150) {
      state.resources.cashOnHand -= 150;
      state.resources.physicalHealth = Math.min(100, state.resources.physicalHealth + 12);
      callbacks.onRefresh();
    }
  });

  container.querySelector('#btn-therapy-session')?.addEventListener('click', () => {
    if (state.resources.cashOnHand >= 120) {
      state.resources.cashOnHand -= 120;
      state.resources.mentalHealth = Math.min(100, state.resources.mentalHealth + 15);
      callbacks.onRefresh();
    }
  });

  container.querySelector('#btn-vacation-trip')?.addEventListener('click', () => {
    if (state.resources.cashOnHand >= 1200) {
      state.resources.cashOnHand -= 1200;
      state.resources.mentalHealth = Math.min(100, state.resources.mentalHealth + 35);
      state.resources.energy = Math.min(100, state.resources.energy + 20);
      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: '✈️ Unwound on a weeklong tropical retreat. Mental health and energy fully restored!',
        type: 'positive'
      });
      callbacks.onRefresh();
    }
  });

  return container;
}
