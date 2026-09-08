import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';

export function renderInvestmentsScreen(
  state: GameState,
  onAction?: (action: string, payload?: any) => void
): HTMLElement {
  const p = state.player;
  const container = document.createElement('div');
  container.className = 'screen-content investments-screen';

  // Calculate Equities Value
  let totalEquitiesValue = 0;
  for (const [tickerId, entry] of Object.entries(p.portfolio)) {
    const t = state.market.tickers.find(x => x.id === tickerId);
    if (t) totalEquitiesValue += entry.shares * t.price;
  }

  const goldValue = p.goldHoldings.grams * state.market.goldPricePerGram;
  const totalLiquidSavings = p.savingsBalance;
  const totalInvestedWealth = totalEquitiesValue + goldValue + totalLiquidSavings;

  // Investment Portfolio Hero
  const heroCard = document.createElement('div');
  heroCard.className = 'card hero-invest-card';
  heroCard.innerHTML = `
    <div class="invest-hero-label">TOTAL INVESTED ASSETS</div>
    <div class="invest-hero-val val-sky">${formatCurrency(totalInvestedWealth)}</div>
    <div class="invest-breakdown-row">
      <div class="invest-pill">
        <span class="pill-lbl">📈 Stocks & Equities</span>
        <span class="pill-val val-emerald">${formatCurrency(totalEquitiesValue)}</span>
      </div>
      <div class="invest-pill">
        <span class="pill-lbl">🏦 High-Yield Savings (3.5%)</span>
        <span class="pill-val val-sky">${formatCurrency(totalLiquidSavings)}</span>
      </div>
      <div class="invest-pill">
        <span class="pill-lbl">🪙 Physical Gold</span>
        <span class="pill-val val-amber">${formatCurrency(goldValue)}</span>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // High-Yield Savings Account Card
  const savingsCard = document.createElement('div');
  savingsCard.className = 'card';
  savingsCard.innerHTML = `
    <div class="card-title">
      <span>🏦 High-Yield Emergency Savings</span>
      <span class="badge badge-green">3.5% APY Daily</span>
    </div>
    <div class="savings-actions-row">
      <div>
        <div class="savings-balance">${formatCurrency(p.savingsBalance)}</div>
        <div class="savings-sub">Liquid buffer protecting you against sudden crises</div>
      </div>
      <div class="btn-group-sm">
        <button class="btn btn-sm btn-primary" id="btn-deposit-savings">Deposit</button>
        <button class="btn btn-sm btn-secondary" id="btn-withdraw-savings">Withdraw</button>
      </div>
    </div>
  `;
  savingsCard.querySelector('#btn-deposit-savings')?.addEventListener('click', () => {
    if (onAction) onAction('deposit-savings');
  });
  savingsCard.querySelector('#btn-withdraw-savings')?.addEventListener('click', () => {
    if (onAction) onAction('withdraw-savings');
  });
  container.appendChild(savingsCard);

  // Stock Market Tickers Card
  const stockCard = document.createElement('div');
  stockCard.className = 'card';
  stockCard.innerHTML = `
    <div class="card-title">
      <span>📈 Stock Market & Index Equities</span>
      <span class="badge badge-sky">${state.market.tickers.length} Listed</span>
    </div>
    <div class="tickers-list" id="tickers-list"></div>
  `;

  const tickersListEl = stockCard.querySelector('#tickers-list')!;
  state.market.tickers.forEach(ticker => {
    const holding = p.portfolio[ticker.id];
    const shares = holding ? holding.shares : 0;
    const holdingValue = shares * ticker.price;

    const tEl = document.createElement('div');
    tEl.className = 'ticker-row-item';
    tEl.innerHTML = `
      <div class="ticker-info-col">
        <div class="ticker-sym-row">
          <span class="ticker-sym">${ticker.id}</span>
          <span class="ticker-name">${ticker.name}</span>
        </div>
        <div class="ticker-meta">
          <span>Sector: <strong>${ticker.sector}</strong></span>
          ${ticker.dividendYieldPct ? `<span>· Div: <strong>${(ticker.dividendYieldPct * 100).toFixed(1)}%</strong></span>` : ''}
        </div>
      </div>

      <div class="ticker-price-col">
        <div class="ticker-price">${formatCurrency(ticker.price)}</div>
        ${shares > 0 ? `<div class="ticker-holding">Holding: ${shares} shares (${formatCurrency(holdingValue)})</div>` : ''}
      </div>

      <button class="btn btn-sm btn-primary" data-trade-ticker="${ticker.id}">Trade</button>
    `;

    tEl.querySelector(`[data-trade-ticker="${ticker.id}"]`)?.addEventListener('click', () => {
      if (onAction) onAction('trade-stock', { tickerId: ticker.id });
    });

    tickersListEl.appendChild(tEl);
  });
  container.appendChild(stockCard);

  // Gold Holdings Card
  const goldCard = document.createElement('div');
  goldCard.className = 'card';
  goldCard.innerHTML = `
    <div class="card-title">
      <span>🪙 24K Physical Gold Bullion</span>
      <span class="badge badge-gold">${formatCurrency(state.market.goldPricePerGram)} / gram</span>
    </div>
    <div class="gold-actions-row">
      <div>
        <div class="gold-qty">${p.goldHoldings.grams} Grams Held</div>
        <div class="gold-val">Current Value: <strong>${formatCurrency(goldValue)}</strong></div>
      </div>
      <div class="btn-group-sm">
        <button class="btn btn-sm btn-primary" id="btn-buy-gold">Buy Gold</button>
        <button class="btn btn-sm btn-secondary" id="btn-sell-gold" ${p.goldHoldings.grams === 0 ? 'disabled' : ''}>Sell</button>
      </div>
    </div>
  `;
  goldCard.querySelector('#btn-buy-gold')?.addEventListener('click', () => {
    if (onAction) onAction('trade-gold', { action: 'buy' });
  });
  goldCard.querySelector('#btn-sell-gold')?.addEventListener('click', () => {
    if (onAction) onAction('trade-gold', { action: 'sell' });
  });
  container.appendChild(goldCard);

  return container;
}
