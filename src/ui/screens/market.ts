import { GameState } from '../../types/game';
import { formatCurrency, formatPercent } from '../components/format';
import { renderSparkline } from '../components/sparkline';

export function renderMarketScreen(state: GameState, onAction: (action: string, payload?: any) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-content';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '14px';

  // 1. Gold Reserve Card
  const goldCard = document.createElement('div');
  goldCard.className = 'card';
  const playerGoldGrams = state.player.goldHoldings.grams;
  goldCard.innerHTML = `
    <div class="card-title">
      <span>✨ 24K Physical Gold</span>
      <span class="badge badge-gold">Safe Haven Asset</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 1.4rem; font-weight: 800; color: #fbbf24;">${formatCurrency(state.market.goldPricePerGram)} <span style="font-size: 0.75rem; color: var(--text-muted);">/ gram</span></div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Your holdings: <strong>${playerGoldGrams}g</strong> (Value: ${formatCurrency(playerGoldGrams * state.market.goldPricePerGram)})</div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-primary" id="btn-buy-gold" style="font-size: 0.75rem;">Buy</button>
        <button class="btn" id="btn-sell-gold" style="font-size: 0.75rem;" ${playerGoldGrams <= 0 ? 'disabled' : ''}>Sell</button>
      </div>
    </div>
  `;
  container.appendChild(goldCard);

  // 2. Stock Exchange List
  const stocksCard = document.createElement('div');
  stocksCard.className = 'card';
  stocksCard.innerHTML = `
    <div class="card-title">
      <span>Stock Exchange (BSE / NSE Live)</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">Macro cycle: ${state.market.cycleBias >= 0 ? '🟢 Bullish' : '🔴 Bearish'}</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Equities pay quarterly dividends. Tap ticker to trade or setup SIP:</div>
    <div id="ticker-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;"></div>
  `;
  container.appendChild(stocksCard);

  const listContainer = stocksCard.querySelector('#ticker-list-container')!;

  state.market.tickers.forEach(ticker => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.justifyContent = 'space-between';
    item.style.background = '#0b0f19';
    item.style.padding = '10px 12px';
    item.style.borderRadius = '8px';
    item.style.border = '1px solid #1a2336';
    item.style.cursor = 'pointer';

    const playerHolding = state.player.portfolio[ticker.id];
    const sharesHeld = playerHolding ? playerHolding.shares : 0;

    const firstPrice = ticker.history[0] || ticker.price;
    const diffPct = (ticker.price - firstPrice) / firstPrice;
    const isUp = diffPct >= 0;

    item.innerHTML = `
      <div style="flex: 1.2;">
        <div style="font-weight: 700; font-size: 0.85rem;">${ticker.name}</div>
        <div style="font-size: 0.65rem; color: var(--text-muted);">${ticker.sector.toUpperCase()} • Div: ${(ticker.dividendYieldPct * 100).toFixed(1)}%</div>
        ${sharesHeld > 0 ? `<div style="font-size: 0.65rem; color: var(--accent-blue); margin-top: 2px;">Holding: ${sharesHeld} shares</div>` : ''}
      </div>
      <div style="flex: 1; display: flex; justify-content: center;">
        <canvas id="sparkline-${ticker.id}" width="90" height="32"></canvas>
      </div>
      <div style="flex: 1; text-align: right;">
        <div style="font-weight: 800; font-size: 0.9rem;">${formatCurrency(ticker.price)}</div>
        <div style="font-size: 0.7rem; font-weight: 700; color: ${isUp ? 'var(--accent-green)' : 'var(--accent-red)'};">${formatPercent(diffPct)}</div>
      </div>
    `;

    item.addEventListener('click', () => {
      onAction('trade-stock', { tickerId: ticker.id });
    });

    listContainer.appendChild(item);

    // Draw sparkline
    setTimeout(() => {
      const cv = item.querySelector(`#sparkline-${ticker.id}`) as HTMLCanvasElement;
      if (cv) renderSparkline(cv, ticker.history, isUp);
    }, 0);
  });

  // Wire Gold buttons
  goldCard.querySelector('#btn-buy-gold')?.addEventListener('click', () => onAction('trade-gold', { action: 'buy' }));
  goldCard.querySelector('#btn-sell-gold')?.addEventListener('click', () => onAction('trade-gold', { action: 'sell' }));

  return container;
}
