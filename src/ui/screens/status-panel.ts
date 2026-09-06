import { GameState } from '../../types/game';
import { calculateNetWorth } from '../../engine/economy-engine';
import { formatCurrency } from '../components/format';
import { exportSaveFile, resetGame } from '../../save/save-manager';
import { ALL_JOBS, FOOD_TIERS } from '../../data/static-data';
import { HEALTH_INSURANCE_TIERS } from '../../data/insurance-plans';

export function renderStatusPanelScreen(
  state: GameState,
  onAction: (action: string, payload?: any) => void
): HTMLElement {
  const p = state.player;
  const netWorth = calculateNetWorth(state);

  const container = document.createElement('div');
  container.className = 'screen-content status-panel-screen';

  // 1. Hero Net Worth Card
  const heroCard = document.createElement('div');
  heroCard.className = 'card status-hero-card';
  heroCard.innerHTML = `
    <div class="hero-label">Total Estimated Net Worth</div>
    <div class="hero-val">${formatCurrency(netWorth)}</div>
    <div class="hero-grid">
      <div class="hero-sub-box">
        <span class="sub-label">Liquid Cash</span>
        <span class="sub-val green">${formatCurrency(p.money)}</span>
      </div>
      <div class="hero-sub-box">
        <span class="sub-label">Bank Savings (3.5%)</span>
        <span class="sub-val blue">${formatCurrency(p.savingsBalance)}</span>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 2. Banking & Credit Desk Card
  const bankCard = document.createElement('div');
  bankCard.className = 'card';
  bankCard.innerHTML = `
    <div class="card-title">
      <span>🏦 Banking, Credit & Insurance</span>
    </div>
    <div class="bank-action-row">
      <div>
        <div style="font-size:0.75rem; color:var(--text-muted);">High-Yield Savings (3.5% Daily APY)</div>
        <div style="font-weight:700; font-size:1.1rem; color:#38bdf8;">${formatCurrency(p.savingsBalance)}</div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-primary btn-sm" id="btn-status-deposit">Deposit</button>
        <button class="btn btn-sm" id="btn-status-withdraw" ${p.savingsBalance <= 0 ? 'disabled' : ''}>Withdraw</button>
      </div>
    </div>

    <!-- Active Loans -->
    <div style="margin-top:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.8rem; font-weight:700;">Active Loans</span>
        <button class="btn btn-sm" id="btn-status-apply-loan">Apply Loan</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
        ${p.loans.length === 0
          ? `<div style="font-size:0.75rem; color:var(--text-muted); padding:6px; background:#0b0f19; border-radius:6px;">No debts. Excellent credit score!</div>`
          : p.loans.map(l => `
            <div style="background:#0b0f19; padding:6px 10px; border-radius:6px; border:1px solid #1a2336; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:0.8rem;">${l.name}</div>
                <div style="font-size:0.65rem; color:var(--text-muted);">Due: ${formatCurrency(l.principalRemaining)} • EMI: ${formatCurrency(l.emiAmount)}/30d</div>
              </div>
              <span class="badge ${l.missedPayments > 0 ? 'badge-red' : 'badge-green'}">${l.missedPayments > 0 ? `${l.missedPayments} Missed` : 'On Time'}</span>
            </div>
          `).join('')
        }
      </div>
    </div>

    <!-- Health Insurance Policy -->
    <div style="margin-top:12px; border-top:1px solid #1a2336; padding-top:10px;">
      <div style="font-size:0.8rem; font-weight:700; margin-bottom:4px;">Active Health Insurance</div>
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
        ${HEALTH_INSURANCE_TIERS.map(tier => `
          <button class="btn btn-sm ${p.insurance.health.tier === tier.tier ? 'btn-success' : ''} btn-ins-tier" data-tier="${tier.tier}" style="text-align:left; padding:6px 8px;">
            <div style="font-weight:700; font-size:0.75rem;">${tier.name}</div>
            <div style="font-size:0.65rem; color:var(--text-muted);">${tier.premium > 0 ? `${formatCurrency(tier.premium)}/mo` : 'Free'}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(bankCard);

  // 3. Career, Occupation & Schedule Card
  const careerCard = document.createElement('div');
  careerCard.className = 'card';
  const foodTier = FOOD_TIERS[p.lifestyle.foodTier];
  careerCard.innerHTML = `
    <div class="card-title">
      <span>💼 Career, Diet & Schedule</span>
      <button class="btn btn-primary btn-sm" id="btn-status-time-alloc">Reallocate Time</button>
    </div>
    
    <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:700; font-size:0.85rem;">${p.job.title}</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">Salary: ${formatCurrency(p.job.salaryPerCycle)} / 15d • Takes ${p.job.timeSlotsCost} slots</div>
      </div>
      <span class="badge badge-green">Active Job</span>
    </div>

    <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
      <div>
        <div style="font-weight:700; font-size:0.85rem;">Diet: ${foodTier.name}</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">${formatCurrency(foodTier.costPerDay)}/day • ${foodTier.physicalDelta >= 0 ? '+' : ''}${foodTier.physicalDelta} health/day</div>
      </div>
      <button class="btn btn-sm" id="btn-status-change-diet">Change Diet</button>
    </div>

    <!-- Career Opportunities -->
    <div style="margin-top:10px;">
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Available Positions:</div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        ${ALL_JOBS.slice(0, 3).map(j => `
          <div style="background:#0b0f19; padding:6px 8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
            <span>${j.title} (${formatCurrency(j.salaryPerCycle)}/15d)</span>
            ${p.job.id === j.id ? '<span class="badge badge-green">Current</span>' : `<button class="btn btn-sm btn-switch-job-status" data-id="${j.id}" style="padding:2px 6px;">Switch</button>`}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(careerCard);

  // 4. Investments & Portfolio Card
  const investCard = document.createElement('div');
  investCard.className = 'card';
  const goldGrams = p.goldHoldings.grams;
  investCard.innerHTML = `
    <div class="card-title">
      <span>📈 Investments & Assets</span>
    </div>

    <!-- 24K Gold -->
    <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:700; font-size:0.85rem; color:#fbbf24;">✨ 24K Gold: ${goldGrams}g</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">Rate: ${formatCurrency(state.market.goldPricePerGram)}/g (Value: ${formatCurrency(goldGrams * state.market.goldPricePerGram)})</div>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="btn btn-primary btn-sm" id="btn-status-buy-gold">Buy</button>
        <button class="btn btn-sm" id="btn-status-sell-gold" ${goldGrams <= 0 ? 'disabled' : ''}>Sell</button>
      </div>
    </div>

    <!-- Stock Holdings -->
    <div style="margin-top:10px;">
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Stock Portfolio:</div>
      ${Object.keys(p.portfolio).length === 0
        ? `<div style="font-size:0.75rem; color:var(--text-muted); padding:6px; background:#0b0f19; border-radius:6px;">No stocks owned yet. Tap market events or trade on market screen!</div>`
        : Object.entries(p.portfolio).map(([id, item]) => {
          const t = state.market.tickers.find(x => x.id === id);
          return `
            <div style="background:#0b0f19; padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <div>
                <div style="font-weight:700; font-size:0.8rem;">${t?.name || id} (${item.shares} shares)</div>
                <div style="font-size:0.65rem; color:var(--text-muted);">Price: ${formatCurrency(t?.price || 0)} • Avg: ${formatCurrency(item.avgCost)}</div>
              </div>
              <button class="btn btn-sm btn-trade-ticker-status" data-ticker="${id}">Trade</button>
            </div>
          `;
        }).join('')
      }
    </div>

    <!-- Properties & Lifestyle Assets -->
    <div style="margin-top:10px;">
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Properties & Vehicles:</div>
      <div style="font-size:0.75rem; color:#94a3b8; background:#0b0f19; padding:6px; border-radius:6px;">
        Properties: <strong>${p.properties.length}</strong> | Assets: <strong>${p.lifestyleAssets.length}</strong> (Transport: <strong>${p.lifestyle.transportMode.toUpperCase()}</strong>)
      </div>
    </div>
  `;
  container.appendChild(investCard);

  // 5. Save & Reset Card
  const saveCard = document.createElement('div');
  saveCard.className = 'card';
  saveCard.innerHTML = `
    <div class="card-title">
      <span>⚙️ Save & Simulation Settings</span>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-primary btn-sm" id="btn-status-export-save" style="flex:1;">Export JSON Save</button>
      <button class="btn btn-danger btn-sm" id="btn-status-reset" style="flex:1;">Hard Reset Game</button>
    </div>
  `;
  container.appendChild(saveCard);

  // Event Handlers
  bankCard.querySelector('#btn-status-deposit')?.addEventListener('click', () => onAction('deposit-savings'));
  bankCard.querySelector('#btn-status-withdraw')?.addEventListener('click', () => onAction('withdraw-savings'));
  bankCard.querySelector('#btn-status-apply-loan')?.addEventListener('click', () => onAction('open-loan-modal'));

  bankCard.querySelectorAll('.btn-ins-tier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = (e.currentTarget as HTMLElement).getAttribute('data-tier');
      onAction('select-insurance-tier', { tier });
    });
  });

  careerCard.querySelector('#btn-status-time-alloc')?.addEventListener('click', () => onAction('open-time-modal'));
  careerCard.querySelector('#btn-status-change-diet')?.addEventListener('click', () => onAction('open-diet-modal'));

  careerCard.querySelectorAll('.btn-switch-job-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('switch-job', { jobId: id });
    });
  });

  investCard.querySelector('#btn-status-buy-gold')?.addEventListener('click', () => onAction('trade-gold', { action: 'buy' }));
  investCard.querySelector('#btn-status-sell-gold')?.addEventListener('click', () => onAction('trade-gold', { action: 'sell' }));

  investCard.querySelectorAll('.btn-trade-ticker-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-ticker');
      onAction('trade-stock', { tickerId: id });
    });
  });

  saveCard.querySelector('#btn-status-export-save')?.addEventListener('click', () => exportSaveFile(state));
  saveCard.querySelector('#btn-status-reset')?.addEventListener('click', () => {
    if (confirm('Reset your entire life simulation progress?')) {
      resetGame();
      location.reload();
    }
  });

  return container;
}
