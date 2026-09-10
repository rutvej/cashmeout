import { GameState } from '../../types/game';
import { STOCK_TICKERS, CRYPTO_TOKENS, MUTUAL_FUNDS, FD_TIERS } from '../../data/markets';
import { formatCurrency } from '../components/format';

export interface InvestmentCallbacks {
  onRefresh: () => void;
}

export function renderInvestmentsScreen(state: GameState, callbacks: InvestmentCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-container';

  container.innerHTML = `
    <!-- High-Yield Cash & Emergency Buffer -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🛡️ High-Yield Emergency Reserves (3.5% APY)</h2>
        <span class="metric-value positive">${formatCurrency(state.resources.emergencyFund)}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px;">
        Risk-free, liquid capital earning 3.5% interest compounded monthly. Protects you against medical emergencies, layoffs, and debt spirals.
      </p>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button id="btn-deposit-buffer-500" class="btn-ctrl">+ Transfer $500 to Buffer</button>
        <button id="btn-deposit-buffer-1000" class="btn-ctrl">+ Transfer $1,000 to Buffer</button>
        <button id="btn-withdraw-buffer-500" class="btn-ctrl">- Withdraw $500 to Checking</button>
      </div>
    </div>

    <!-- Stock Market & Equities -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📈 Equity Market (8 Canonical Tickers)</h3>
        <span class="time-tag">Macro Era: ${state.simulation.macroPhase.replace('_', ' ')}</span>
      </div>
      <div class="item-list">
        ${STOCK_TICKERS.map(stock => {
          const holding = state.investments.stocksOwned[stock.symbol] || { shares: 0, averageCost: 0 };
          const holdingVal = holding.shares * stock.currentPrice;

          return `
            <div class="list-item">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">
                  ${stock.symbol} <span style="font-weight: 400; color: var(--text-muted);">— ${stock.name}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary);">
                  Sector: ${stock.sector} • Div Yield: ${(stock.dividendYield * 100).toFixed(1)}% • Volatility: ${(stock.volatility * 100).toFixed(0)}%
                </div>
                ${holding.shares > 0 ? `
                  <div style="font-size: 0.78rem; color: var(--accent-cyan); margin-top: 2px;">
                    Owned: ${holding.shares} shares (${formatCurrency(holdingVal)}) • Avg: $${holding.averageCost.toFixed(1)}
                  </div>
                ` : ''}
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="metric-value">$${stock.currentPrice}</span>
                <button class="btn-action success" data-buy-stock="${stock.symbol}">Buy 5 ($${stock.currentPrice * 5})</button>
                ${holding.shares > 0 ? `
                  <button class="btn-action danger" data-sell-stock="${stock.symbol}">Sell All</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Mutual Funds & SIP -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📊 Index Funds & Auto-SIP</h3>
      </div>
      <div class="item-list">
        ${MUTUAL_FUNDS.map(fund => {
          const unitsOwned = state.investments.mutualFundUnits[fund.id] || { units: 0, investedAmount: 0 };
          const monthlyAlloc = state.investments.sipMonthlyAllocations[fund.id] || 0;

          return `
            <div class="list-item">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">${fund.name}</div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">
                  Expected Return: ${(fund.expectedAnnualReturn * 100).toFixed(1)}% p.a. • Expense Ratio: ${(fund.expenseRatio * 100).toFixed(2)}%
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-green); margin-top: 2px;">
                  Total Invested: ${formatCurrency(unitsOwned.investedAmount)} • Monthly SIP: ${formatCurrency(monthlyAlloc)}/mo
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn-ctrl" data-sip-plus="${fund.id}">+ $50/mo</button>
                <button class="btn-ctrl" data-sip-minus="${fund.id}">- $50/mo</button>
                <button class="btn-action" data-invest-fund="${fund.id}">Lump Sum $500</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Cryptocurrencies -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🪙 Digital Assets & Crypto</h3>
        <span style="font-size: 0.75rem; color: var(--accent-rose);">High Volatility</span>
      </div>
      <div class="item-list">
        ${CRYPTO_TOKENS.map(token => {
          const owned = state.investments.cryptoOwned[token.symbol] || { units: 0, averageCost: 0 };
          const val = owned.units * token.currentPrice;

          return `
            <div class="list-item">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">
                  ${token.symbol} (${token.name})
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">
                  Price: $${token.currentPrice.toLocaleString()}
                </div>
                ${owned.units > 0 ? `
                  <div style="font-size: 0.78rem; color: var(--accent-cyan);">
                    Holding: ${owned.units.toFixed(token.symbol === 'BTC' ? 3 : 1)} units (${formatCurrency(val)})
                  </div>
                ` : ''}
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn-action" data-buy-crypto="${token.symbol}">Buy $500</button>
                ${owned.units > 0 ? `
                  <button class="btn-action danger" data-sell-crypto="${token.symbol}">Sell All</button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Fixed Deposits -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🔒 Fixed Term Deposits (FD)</h3>
      </div>
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px;">
        ${FD_TIERS.map(tier => `
          <button class="btn-ctrl" data-open-fd="${tier.durationMonths}" data-rate="${tier.annualRate}">
            Lock $2,000 for ${tier.label}
          </button>
        `).join('')}
      </div>

      ${state.investments.fixedDeposits.length > 0 ? `
        <div class="item-list">
          ${state.investments.fixedDeposits.map(fd => `
            <div class="list-item">
              <div>
                <span style="font-weight: 600;">FD #${fd.id.slice(-4)}: ${formatCurrency(fd.principal)}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 8px;">(${(fd.interestRate * 100).toFixed(1)}% APY)</span>
              </div>
              <span class="time-tag">${fd.durationMonths} Mos Term</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="font-size: 0.82rem; color: var(--text-muted);">No active fixed deposits. Open one above for guaranteed yields.</div>
      `}
    </div>
  `;

  // Listeners for buffer actions
  container.querySelector('#btn-deposit-buffer-500')?.addEventListener('click', () => {
    if (state.resources.cashOnHand >= 500) {
      state.resources.cashOnHand -= 500;
      state.resources.emergencyFund += 500;
      callbacks.onRefresh();
    }
  });

  container.querySelector('#btn-deposit-buffer-1000')?.addEventListener('click', () => {
    if (state.resources.cashOnHand >= 1000) {
      state.resources.cashOnHand -= 1000;
      state.resources.emergencyFund += 1000;
      callbacks.onRefresh();
    }
  });

  container.querySelector('#btn-withdraw-buffer-500')?.addEventListener('click', () => {
    if (state.resources.emergencyFund >= 500) {
      state.resources.emergencyFund -= 500;
      state.resources.cashOnHand += 500;
      callbacks.onRefresh();
    }
  });

  // Stock listeners
  container.querySelectorAll('button[data-buy-stock]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = (btn as HTMLElement).dataset.buyStock!;
      const stock = STOCK_TICKERS.find(s => s.symbol === sym);
      if (!stock) return;
      const cost = stock.currentPrice * 5;
      if (state.resources.cashOnHand >= cost) {
        state.resources.cashOnHand -= cost;
        const current = state.investments.stocksOwned[sym] || { shares: 0, averageCost: stock.currentPrice };
        const totalShares = current.shares + 5;
        const avgCost = ((current.shares * current.averageCost) + cost) / totalShares;
        state.investments.stocksOwned[sym] = { shares: totalShares, averageCost: avgCost };
        callbacks.onRefresh();
      }
    });
  });

  container.querySelectorAll('button[data-sell-stock]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = (btn as HTMLElement).dataset.sellStock!;
      const stock = STOCK_TICKERS.find(s => s.symbol === sym);
      const holding = state.investments.stocksOwned[sym];
      if (!stock || !holding || holding.shares <= 0) return;
      const proceeds = holding.shares * stock.currentPrice;
      state.resources.cashOnHand += proceeds;
      delete state.investments.stocksOwned[sym];
      callbacks.onRefresh();
    });
  });

  // SIP listeners
  container.querySelectorAll('button[data-sip-plus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fId = (btn as HTMLElement).dataset.sipPlus!;
      state.investments.sipMonthlyAllocations[fId] = (state.investments.sipMonthlyAllocations[fId] || 0) + 50;
      callbacks.onRefresh();
    });
  });

  container.querySelectorAll('button[data-sip-minus]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fId = (btn as HTMLElement).dataset.sipMinus!;
      const cur = state.investments.sipMonthlyAllocations[fId] || 0;
      state.investments.sipMonthlyAllocations[fId] = Math.max(0, cur - 50);
      callbacks.onRefresh();
    });
  });

  container.querySelectorAll('button[data-invest-fund]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fId = (btn as HTMLElement).dataset.investFund!;
      if (state.resources.cashOnHand >= 500) {
        state.resources.cashOnHand -= 500;
        const fund = state.investments.mutualFundUnits[fId] || { units: 0, investedAmount: 0 };
        fund.investedAmount += 500;
        fund.units += 5;
        state.investments.mutualFundUnits[fId] = fund;
        callbacks.onRefresh();
      }
    });
  });

  // Crypto listeners
  container.querySelectorAll('button[data-buy-crypto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = (btn as HTMLElement).dataset.buyCrypto!;
      const token = CRYPTO_TOKENS.find(t => t.symbol === sym);
      if (!token || state.resources.cashOnHand < 500) return;
      state.resources.cashOnHand -= 500;
      const unitsBought = 500 / token.currentPrice;
      const holding = state.investments.cryptoOwned[sym] || { units: 0, averageCost: token.currentPrice };
      holding.units += unitsBought;
      state.investments.cryptoOwned[sym] = holding;
      callbacks.onRefresh();
    });
  });

  container.querySelectorAll('button[data-sell-crypto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = (btn as HTMLElement).dataset.sellCrypto!;
      const token = CRYPTO_TOKENS.find(t => t.symbol === sym);
      const holding = state.investments.cryptoOwned[sym];
      if (!token || !holding || holding.units <= 0) return;
      const proceeds = holding.units * token.currentPrice;
      state.resources.cashOnHand += Math.round(proceeds);
      delete state.investments.cryptoOwned[sym];
      callbacks.onRefresh();
    });
  });

  // FD listener
  container.querySelectorAll('button[data-open-fd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const months = parseInt((btn as HTMLElement).dataset.openFd!, 10);
      const rate = parseFloat((btn as HTMLElement).dataset.rate!);
      if (state.resources.cashOnHand >= 2000) {
        state.resources.cashOnHand -= 2000;
        state.investments.fixedDeposits.push({
          id: `fd-${Date.now()}`,
          principal: 2000,
          interestRate: rate,
          startMonth: state.player.currentMonth,
          durationMonths: months
        });
        callbacks.onRefresh();
      }
    });
  });

  return container;
}
