import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { calculateNetWorth } from '../../engine/economy-engine';
import { FOOD_TIERS, TRANSPORT_MODES } from '../../data/static-data';

export function renderAccountScreen(state: GameState): HTMLElement {
  const p = state.player;
  const netWorth = calculateNetWorth(state);

  const salaryEarned = Math.round(p.job.salaryPerCycle * (30 / p.job.payCycleDays));
  const sideHustleIncome = p.timeAllocation.sideHustle * (p.lifestyleAssets.some(a => a.id === 'laptop') ? 500 : 250) * 30;
  const totalEstimatedMonthlyIncome = salaryEarned + sideHustleIncome;
  const totalLoans = p.loans.reduce((s, l) => s + l.principalRemaining, 0);

  const container = document.createElement('div');
  container.className = 'screen-content account-screen';

  // 1. VAULT HERO — NET WORTH FLEX
  const hero = document.createElement('div');
  hero.className = 'vault-hero-card';
  hero.innerHTML = `
    <div class="vault-hero-label">💎 TOTAL WEALTH FLEX • NET WORTH</div>
    <div class="vault-hero-amount">${formatCurrency(netWorth)}</div>
    <div class="vault-grid">
      <div class="vault-stat-box">
        <span class="vault-stat-label">💵 Liquid Cash</span>
        <span class="vault-stat-val income-color">${formatCurrency(p.money)}</span>
      </div>
      <div class="vault-stat-box">
        <span class="vault-stat-label">🏦 High-Yield Savings</span>
        <span class="vault-stat-val savings-color">${formatCurrency(p.savingsBalance)}</span>
      </div>
      <div class="vault-stat-box">
        <span class="vault-stat-label">📈 Monthly Inflow</span>
        <span class="vault-stat-val income-color">${formatCurrency(totalEstimatedMonthlyIncome)}</span>
      </div>
      <div class="vault-stat-box">
        <span class="vault-stat-label">💳 Active Loan Debt</span>
        <span class="vault-stat-val ${totalLoans > 0 ? 'loans-color' : 'income-color'}">
          ${totalLoans > 0 ? formatCurrency(totalLoans) : '✅ ZERO DEBT'}
        </span>
      </div>
    </div>
  `;
  container.appendChild(hero);

  // 2. MONTHLY CASHFLOW RADAR (INFLOW VS BURN RATE)
  const food = FOOD_TIERS[p.lifestyle.foodTier];
  const transport = TRANSPORT_MODES[p.lifestyle.transportMode];
  const insurancePremium = p.insurance.health.premiumPerMonth + p.insurance.vehicle.premiumPerMonth + p.insurance.property.premiumPerMonth + p.insurance.life.premiumPerMonth;
  const loanEmi = p.loans.reduce((s, l) => s + Math.round(l.emiAmount * 30 / l.cycleDays), 0);
  const assetUpkeep = p.lifestyleAssets.reduce((s, a) => s + a.monthlyMaintenance, 0);
  const totalMonthlyExpense = (food.costPerDay * 30) + (transport.dailyCost * 30) + p.housing.amountPerCycle + insurancePremium + loanEmi + assetUpkeep + (60 * 30) + (30 * 30);
  const netCashFlow = totalEstimatedMonthlyIncome - totalMonthlyExpense;

  const cashFlowCard = document.createElement('div');
  cashFlowCard.className = 'card';
  cashFlowCard.innerHTML = `
    <div class="card-title">
      <span>📊 Monthly Cashflow Radar</span>
      <span class="badge ${netCashFlow >= 0 ? 'badge-green' : 'badge-red'}">
        ${netCashFlow >= 0 ? '+' : ''}${formatCurrency(netCashFlow)}/mo
      </span>
    </div>

    <!-- Visual Cashflow Balance Bar -->
    <div style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(255,255,255,0.08); border-radius:14px; padding:12px 14px;">
      <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:900; margin-bottom:6px;">
        <span style="color:var(--neon-lime);">💰 INFLOW: ${formatCurrency(totalEstimatedMonthlyIncome)}</span>
        <span style="color:var(--neon-coral);">🔥 BURN: ${formatCurrency(totalMonthlyExpense)}</span>
      </div>
      <div class="study-xp-track" style="height:10px;">
        <div style="height:100%; width:${Math.min(100, Math.max(5, (totalEstimatedMonthlyIncome / (totalEstimatedMonthlyIncome + totalMonthlyExpense || 1)) * 100))}%; background:linear-gradient(90deg, #00ff88, #00f0ff); border-radius:9999px;"></div>
      </div>
      <div style="font-size:0.64rem; color:var(--text-muted); font-weight:700; margin-top:5px; text-align:right;">
        ${netCashFlow >= 0 ? '🔥 You are saving cash every 30 days!' : '⚠️ Deficit! Living expenses exceed monthly income.'}
      </div>
    </div>

    <!-- Outgoings List -->
    <div class="monthly-expense-section">
      <div style="font-size:0.68rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px;">Monthly Outgoings Breakdown</div>
      ${renderExpenseRow('🍽️ Food & Diet', food.costPerDay * 30)}
      ${renderExpenseRow('🚗 Transport Mode', transport.dailyCost * 30)}
      ${renderExpenseRow('🏠 Rent / Housing Box', p.housing.amountPerCycle)}
      ${renderExpenseRow('💡 Power, Utilities & Phone', 60 * 30)}
      ${renderExpenseRow('🛒 Daily Misc Expenses', 30 * 30)}
      ${insurancePremium > 0 ? renderExpenseRow('🛡️ Protection & Insurance', insurancePremium) : ''}
      ${loanEmi > 0 ? renderExpenseRow('💳 Loan EMIs', loanEmi) : ''}
      ${assetUpkeep > 0 ? renderExpenseRow('🔧 Asset Maintenance Upkeep', assetUpkeep) : ''}
    </div>
  `;
  container.appendChild(cashFlowCard);

  // 3. INVESTMENT PORTFOLIO & ASSETS
  const goldValue = p.goldHoldings.grams * state.market.goldPricePerGram;
  const stocksValue = Object.entries(p.portfolio).reduce((s, [id, entry]) => {
    const t = state.market.tickers.find(x => x.id === id);
    return s + (t ? entry.shares * t.price : 0);
  }, 0);
  const propValue = p.properties.reduce((s, prop) => {
    const def = state.market.properties.find(x => x.id === prop.id);
    return s + (def ? def.price : 0);
  }, 0);

  if (goldValue > 0 || stocksValue > 0 || propValue > 0 || p.savingsBalance > 0 || p.businesses.length > 0) {
    const investCard = document.createElement('div');
    investCard.className = 'card';
    investCard.innerHTML = `
      <div class="card-title">
        <span>📈 Asset Stack & Investments</span>
        <span class="badge badge-blue">${formatCurrency(goldValue + stocksValue + propValue + p.savingsBalance)}</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${p.savingsBalance > 0 ? renderInvestRow('🏦 High-Yield Savings (3.5% APY)', p.savingsBalance) : ''}
        ${goldValue > 0 ? renderInvestRow(`🥇 24K Physical Gold (${p.goldHoldings.grams}g @ ${formatCurrency(state.market.goldPricePerGram)}/g)`, goldValue) : ''}
        ${stocksValue > 0 ? renderInvestRow(`📊 Stock Portfolio Equities`, stocksValue) : ''}
        ${propValue > 0 ? renderInvestRow(`🏠 Real Estate (${p.properties.length} Properties)`, propValue) : ''}
        ${p.businesses.length > 0 ? renderInvestRow(`🏪 Business Ventures (${p.businesses.length})`, 0, '💹 Active Revenue') : ''}
      </div>
    `;
    container.appendChild(investCard);
  }

  // 4. ACTIVE LOANS (IF ANY)
  if (p.loans.length > 0) {
    const loansCard = document.createElement('div');
    loansCard.className = 'card';
    loansCard.innerHTML = `
      <div class="card-title">
        <span>💳 Active Debt & EMIs</span>
        <span class="badge badge-red">${p.loans.length} Active</span>
      </div>
      ${p.loans.map(l => `
        <div style="background:rgba(255,51,102,0.08); border:1.5px solid rgba(255,51,102,0.25); border-radius:14px; padding:12px 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight:900; font-size:0.86rem; color:#ffffff;">${l.name}</div>
            <span class="badge ${l.missedPayments > 0 ? 'badge-red' : 'badge-green'}">${l.missedPayments > 0 ? `⚠️ ${l.missedPayments} Missed` : '✅ Good Standing'}</span>
          </div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">
            Principal: <strong style="color:var(--neon-coral);">${formatCurrency(l.principalRemaining)}</strong> 
            &nbsp;•&nbsp; EMI: <strong style="color:var(--neon-orange);">${formatCurrency(l.emiAmount)}</strong>/30d 
            &nbsp;•&nbsp; ${(l.interestRate * 100).toFixed(0)}% APR
          </div>
        </div>
      `).join('')}
    `;
    container.appendChild(loansCard);
  }

  // 5. TRANSACTION LEDGER
  const ledgerCard = document.createElement('div');
  ledgerCard.className = 'statement-card';
  const entries = p.eventLog.slice(0, 30);
  ledgerCard.innerHTML = `
    <div class="statement-header">
      <div class="statement-title">📜 Verified Ledger Log</div>
      <div class="badge badge-purple" style="font-size:0.6rem;">Last ${entries.length} Drops</div>
    </div>
    <div class="statement-list">
      ${entries.length === 0
        ? `<div style="padding:20px; text-align:center; font-size:0.8rem; color:var(--text-muted);">No activity recorded yet. Time to grind!</div>`
        : entries.map(e => `
          <div class="statement-entry">
            <div class="entry-type-dot ${e.type}"></div>
            <div class="entry-info">
              <div class="entry-text">${e.text}</div>
              <div class="entry-day">DAY ${e.day} • ${e.type.toUpperCase()}</div>
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
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:rgba(255,255,255,0.03); border:1.5px solid rgba(255,255,255,0.07); border-radius:12px;">
      <span style="font-size:0.82rem; font-weight:700; color:var(--text-main);">${name}</span>
      <span style="font-size:0.86rem; font-weight:900; color:var(--neon-cyan);">${note || formatCurrency(value)}</span>
    </div>
  `;
}
