import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { calculateNetWorth } from '../../engine/economy-engine';
import { FOOD_TIERS, TRANSPORT_MODES } from '../../data/static-data';

export function renderAccountScreen(state: GameState): HTMLElement {
  const p = state.player;
  const netWorth = calculateNetWorth(state);

  // Calculate summary stats
  const salaryEarned = Math.round(p.job.salaryPerCycle * (30 / p.job.payCycleDays));
  const totalLoans = p.loans.reduce((s, l) => s + l.principalRemaining, 0);

  const container = document.createElement('div');
  container.className = 'screen-content account-screen';

  // 1. Hero Summary
  const hero = document.createElement('div');
  hero.className = 'account-summary-hero';
  hero.innerHTML = `
    <div class="account-hero-label">💳 Net Worth Snapshot</div>
    <div class="account-hero-amount">${formatCurrency(netWorth)}</div>
    <div class="account-summary-grid">
      <div class="account-stat-box">
        <span class="account-stat-label">💵 Cash in Hand</span>
        <span class="account-stat-val income-color">${formatCurrency(p.money)}</span>
      </div>
      <div class="account-stat-box">
        <span class="account-stat-label">🏦 Savings</span>
        <span class="account-stat-val savings-color">${formatCurrency(p.savingsBalance)}</span>
      </div>
      <div class="account-stat-box">
        <span class="account-stat-label">📈 Est. Monthly Salary</span>
        <span class="account-stat-val income-color">${formatCurrency(salaryEarned)}</span>
      </div>
      <div class="account-stat-box">
        <span class="account-stat-label">💳 Total Loan Debt</span>
        <span class="account-stat-val ${totalLoans > 0 ? 'loans-color' : 'income-color'}">${totalLoans > 0 ? formatCurrency(totalLoans) : '✅ Debt Free'}</span>
      </div>
    </div>
  `;
  container.appendChild(hero);

  // 2. Monthly Cash Flow Breakdown
  const food = FOOD_TIERS[p.lifestyle.foodTier];
  const transport = TRANSPORT_MODES[p.lifestyle.transportMode];
  const insurancePremium = p.insurance.health.premiumPerMonth + p.insurance.vehicle.premiumPerMonth + p.insurance.property.premiumPerMonth + p.insurance.life.premiumPerMonth;
  const loanEmi = p.loans.reduce((s, l) => s + Math.round(l.emiAmount * 30 / l.cycleDays), 0);
  const assetUpkeep = p.lifestyleAssets.reduce((s, a) => s + a.monthlyMaintenance, 0);
  const totalMonthlyExpense = (food.costPerDay * 30) + (transport.dailyCost * 30) + p.housing.amountPerCycle + insurancePremium + loanEmi + assetUpkeep + (60 * 30) + (30 * 30);
  const netCashFlow = salaryEarned - totalMonthlyExpense;

  const cashFlowCard = document.createElement('div');
  cashFlowCard.className = 'card';
  cashFlowCard.innerHTML = `
    <div class="card-title">
      <span>📊 Monthly Cash Flow</span>
      <span class="badge ${netCashFlow >= 0 ? 'badge-green' : 'badge-red'}">${netCashFlow >= 0 ? '+' : ''}${formatCurrency(netCashFlow)}/mo</span>
    </div>
    <div style="display:flex; justify-content:space-between; padding:8px 10px; background:rgba(0,230,118,0.06); border:1px solid rgba(0,230,118,0.14); border-radius:10px;">
      <span style="font-size:0.82rem; font-weight:700;">💰 Estimated Monthly Income</span>
      <span style="font-size:0.88rem; font-weight:800; color:var(--accent-green);">${formatCurrency(salaryEarned)}</span>
    </div>
    <div class="monthly-expense-section">
      <div style="font-size:0.67rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; padding-bottom:2px;">Monthly Outgoings</div>
      ${renderExpenseRow('🍽️ Food', food.costPerDay * 30)}
      ${renderExpenseRow('🚗 Transport', transport.dailyCost * 30)}
      ${renderExpenseRow('🏠 Rent / Housing', p.housing.amountPerCycle)}
      ${renderExpenseRow('💡 Utilities & Phone', 60 * 30)}
      ${renderExpenseRow('🛒 Daily Miscellaneous', 30 * 30)}
      ${insurancePremium > 0 ? renderExpenseRow('🛡️ Insurance Premiums', insurancePremium) : ''}
      ${loanEmi > 0 ? renderExpenseRow('💳 Loan EMIs', loanEmi) : ''}
      ${assetUpkeep > 0 ? renderExpenseRow('🔧 Asset Maintenance', assetUpkeep) : ''}
    </div>
    <div style="display:flex; justify-content:space-between; padding:8px 10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; border-top:2px solid rgba(255,255,255,0.1);">
      <span style="font-size:0.82rem; font-weight:700;">📉 Total Monthly Expenses</span>
      <span style="font-size:0.88rem; font-weight:800; color:var(--accent-red);">${formatCurrency(totalMonthlyExpense)}</span>
    </div>
  `;
  container.appendChild(cashFlowCard);

  // 3. Active Loans
  if (p.loans.length > 0) {
    const loansCard = document.createElement('div');
    loansCard.className = 'card';
    loansCard.innerHTML = `
      <div class="card-title">
        <span>💳 Active Loans & EMIs</span>
        <span class="badge badge-red">${p.loans.length} Active</span>
      </div>
      ${p.loans.map(l => `
        <div style="background:rgba(255,71,87,0.06); border:1px solid rgba(255,71,87,0.14); border-radius:10px; padding:10px 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:700; font-size:0.82rem;">${l.name}</div>
            <span class="badge ${l.missedPayments > 0 ? 'badge-red' : 'badge-green'}">${l.missedPayments > 0 ? `⚠️ ${l.missedPayments} Missed` : '✅ Current'}</span>
          </div>
          <div style="font-size:0.68rem; color:var(--text-muted); margin-top:4px;">
            Outstanding: <strong style="color:var(--accent-red);">${formatCurrency(l.principalRemaining)}</strong> 
            &nbsp;|&nbsp; EMI: <strong style="color:var(--accent-orange);">${formatCurrency(l.emiAmount)}</strong>/30d 
            &nbsp;|&nbsp; Rate: ${(l.interestRate * 100).toFixed(0)}% p.a.
          </div>
        </div>
      `).join('')}
    `;
    container.appendChild(loansCard);
  }

  // 4. Investments snapshot
  const goldValue = p.goldHoldings.grams * state.market.goldPricePerGram;
  const stocksValue = Object.entries(p.portfolio).reduce((s, [id, entry]) => {
    const t = state.market.tickers.find(x => x.id === id);
    return s + (t ? entry.shares * t.price : 0);
  }, 0);
  const propValue = p.properties.reduce((s, prop) => {
    const def = state.market.properties.find(x => x.id === prop.id);
    return s + (def ? def.price : 0);
  }, 0);

  if (goldValue > 0 || stocksValue > 0 || propValue > 0 || p.savingsBalance > 0) {
    const investCard = document.createElement('div');
    investCard.className = 'card';
    investCard.innerHTML = `
      <div class="card-title">
        <span>📈 Investment Portfolio</span>
        <span class="badge badge-blue">${formatCurrency(goldValue + stocksValue + propValue + p.savingsBalance)}</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${p.savingsBalance > 0 ? renderInvestRow('🏦 Savings Account (3.5% APY)', p.savingsBalance) : ''}
        ${goldValue > 0 ? renderInvestRow(`🥇 Gold (${p.goldHoldings.grams}g @ ${formatCurrency(state.market.goldPricePerGram)}/g)`, goldValue) : ''}
        ${stocksValue > 0 ? renderInvestRow(`📊 Stock Portfolio`, stocksValue) : ''}
        ${propValue > 0 ? renderInvestRow(`🏠 Real Estate (${p.properties.length} properties)`, propValue) : ''}
        ${p.businesses.length > 0 ? renderInvestRow(`🏪 Businesses (${p.businesses.length} ventures)`, 0, '💹 Generating revenue') : ''}
      </div>
    `;
    container.appendChild(investCard);
  }

  // 5. Transaction Ledger
  const ledgerCard = document.createElement('div');
  ledgerCard.className = 'statement-card';
  const entries = p.eventLog.slice(0, 30);
  ledgerCard.innerHTML = `
    <div class="statement-header">
      <div class="statement-title">📜 Transaction Ledger</div>
      <div style="font-size:0.62rem; color:var(--text-muted);">Last ${entries.length} entries</div>
    </div>
    <div class="statement-list">
      ${entries.length === 0
        ? `<div style="padding:16px; text-align:center; font-size:0.78rem; color:var(--text-muted);">No transactions yet. Start playing!</div>`
        : entries.map(e => `
          <div class="statement-entry">
            <div class="entry-type-dot ${e.type}"></div>
            <div class="entry-info">
              <div class="entry-text">${e.text}</div>
              <div class="entry-day">Day ${e.day}</div>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
  container.appendChild(ledgerCard);

  return container;
}

function renderExpenseRow(name: string, amount: number): string {
  return `
    <div class="monthly-expense-row">
      <span class="expense-name">${name}</span>
      <span class="expense-amount">${formatCurrency(amount)}/mo</span>
    </div>
  `;
}

function renderInvestRow(name: string, value: number, note?: string): string {
  return `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.05); border-radius:8px;">
      <span style="font-size:0.78rem; font-weight:600; color:var(--text-main);">${name}</span>
      <span style="font-size:0.82rem; font-weight:800; color:var(--accent-blue);">${note || formatCurrency(value)}</span>
    </div>
  `;
}
