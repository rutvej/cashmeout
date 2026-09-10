import { GameState, MacroEconomyPhase } from '../types/game';
import { STOCK_TICKERS, CRYPTO_TOKENS } from '../data/markets';

export function getMacroEconomicEra(month: number): MacroEconomyPhase {
  if (month <= 36) return 'BULL_RUN';
  if (month <= 48) return 'PEAK';
  if (month <= 72) return 'RECESSION';
  if (month <= 96) return 'RECOVERY';
  return 'SUPER_BULL';
}

export function updateMarketPricesMonthly(state: GameState): void {
  const currentEra = getMacroEconomicEra(state.player.currentMonth);
  state.simulation.macroPhase = currentEra;

  // Era trend multipliers
  let trend = 0.008; // default modest drift
  if (currentEra === 'BULL_RUN') trend = 0.015;
  else if (currentEra === 'PEAK') trend = 0.004;
  else if (currentEra === 'RECESSION') trend = -0.025;
  else if (currentEra === 'RECOVERY') trend = 0.018;
  else if (currentEra === 'SUPER_BULL') trend = 0.022;

  // Update stock prices
  for (const stock of STOCK_TICKERS) {
    const randomNoise = (Math.random() - 0.48) * stock.volatility;
    const pctChange = trend + randomNoise;
    stock.currentPrice = Math.max(10, Math.round(stock.currentPrice * (1 + pctChange) * 10) / 10);
    stock.priceHistory.push(stock.currentPrice);
    if (stock.priceHistory.length > 24) stock.priceHistory.shift();

    // Dividend distribution check (quarterly: month % 3 === 0)
    if (state.player.currentMonth % 3 === 0 && stock.dividendYield > 0) {
      const owned = state.investments.stocksOwned[stock.symbol];
      if (owned && owned.shares > 0) {
        const quarterlyDivPerShare = (stock.currentPrice * stock.dividendYield) / 4;
        const totalDividend = Math.round(quarterlyDivPerShare * owned.shares);
        if (totalDividend > 0) {
          state.resources.cashOnHand += totalDividend;
          state.simulation.recentLogs.unshift({
            day: state.player.currentDay,
            message: `💰 Dividend Credited: ${stock.symbol} paid $${totalDividend} into cash.`,
            type: 'positive'
          });
        }
      }
    }
  }

  // Update crypto prices
  for (const crypto of CRYPTO_TOKENS) {
    const cryptoNoise = (Math.random() - 0.47) * crypto.volatility * 2;
    const cryptoChange = (trend * 2) + cryptoNoise;
    crypto.currentPrice = Math.max(0.01, Math.round(crypto.currentPrice * (1 + cryptoChange) * 100) / 100);
    crypto.priceHistory.push(crypto.currentPrice);
    if (crypto.priceHistory.length > 24) crypto.priceHistory.shift();
  }
}
