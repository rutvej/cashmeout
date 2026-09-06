import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { HEALTH_INSURANCE_TIERS } from '../../data/insurance-plans';

export function renderBankScreen(state: GameState, onAction: (action: string, payload?: any) => void): HTMLElement {
  const p = state.player;

  const container = document.createElement('div');
  container.className = 'screen-content';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '14px';

  // 1. Savings & Term Deposits Card
  const savingsCard = document.createElement('div');
  savingsCard.className = 'card';
  savingsCard.innerHTML = `
    <div class="card-title">
      <span>Savings & Term Deposits</span>
      <span class="badge badge-green">3.5% APY Daily</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 12px; border-radius: 8px;">
      <div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">Current Savings Balance</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: #38bdf8;">${formatCurrency(p.savingsBalance)}</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-primary" id="btn-deposit-savings" style="font-size: 0.75rem;">Deposit</button>
        <button class="btn" id="btn-withdraw-savings" style="font-size: 0.75rem;" ${p.savingsBalance <= 0 ? 'disabled' : ''}>Withdraw</button>
      </div>
    </div>
  `;
  container.appendChild(savingsCard);

  // 2. Active Loans / Lending Desk
  const loansCard = document.createElement('div');
  loansCard.className = 'card';
  loansCard.innerHTML = `
    <div class="card-title">
      <span>Credit & Loan Facilities</span>
      <button class="btn btn-primary" id="btn-apply-loan" style="font-size: 0.75rem; padding: 4px 8px;">Apply Loan</button>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Missing EMI payments triggers compounding penalties and severe mental stress:
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
      ${p.loans.length === 0
        ? `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px; text-align: center; background: #0b0f19; border-radius: 6px;">No outstanding liabilities. Excellent credit rating!</div>`
        : p.loans.map(loan => `
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${loan.name}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">Balance: ${formatCurrency(loan.principalRemaining)} • EMI: ${formatCurrency(loan.emiAmount)} / 30d • ${(loan.interestRate * 100).toFixed(0)}% APR</div>
            </div>
            ${loan.missedPayments > 0 ? `<span class="badge badge-red">${loan.missedPayments} Missed</span>` : `<span class="badge badge-green">On Schedule</span>`}
          </div>
        `).join('')
      }
    </div>
  `;
  container.appendChild(loansCard);

  // 3. Insurance Desk
  const insCard = document.createElement('div');
  insCard.className = 'card';
  const currentInsTier = p.insurance.health.tier;
  insCard.innerHTML = `
    <div class="card-title">
      <span>Insurance Protection Desk</span>
      <span class="badge badge-gold">Emergency Hedge</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Without health insurance, lifestyle illnesses will wipe out your wallet. Choose your policy:
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px;">
      ${HEALTH_INSURANCE_TIERS.map(plan => `
        <div style="background: #0b0f19; border: 1px solid ${currentInsTier === plan.tier ? 'var(--accent-green)' : '#1a2336'}; padding: 8px; border-radius: 6px;">
          <div style="font-weight: 700; font-size: 0.8rem;">${plan.name}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">
            ${plan.coveragePct > 0 ? `Covers ${(plan.coveragePct * 100).toFixed(0)}% of medical bills` : 'Zero coverage'}
          </div>
          <div style="font-weight: 700; font-size: 0.8rem; color: #38bdf8; margin: 4px 0;">
            ${plan.premium > 0 ? `${formatCurrency(plan.premium)}/mo` : 'Free'}
          </div>
          <button class="btn ${currentInsTier === plan.tier ? 'btn-success' : ''} btn-select-ins" data-tier="${plan.tier}" style="font-size: 0.65rem; width: 100%;">
            ${currentInsTier === plan.tier ? 'Active Policy' : 'Select'}
          </button>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(insCard);

  // Wire buttons
  savingsCard.querySelector('#btn-deposit-savings')?.addEventListener('click', () => onAction('deposit-savings'));
  savingsCard.querySelector('#btn-withdraw-savings')?.addEventListener('click', () => onAction('withdraw-savings'));
  loansCard.querySelector('#btn-apply-loan')?.addEventListener('click', () => onAction('open-loan-modal'));

  insCard.querySelectorAll('.btn-select-ins').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = (e.currentTarget as HTMLElement).getAttribute('data-tier');
      onAction('select-insurance-tier', { tier });
    });
  });

  return container;
}
