import { GameState } from '../types/game';
import { SeededRNG } from './prng';

export function tickMarket(state: GameState, day: number, rng: SeededRNG): void {
  const m = state.market;

  // 1. Macro market cycle (sine wave oscillation every ~180 days)
  m.cycleBias = 0.005 * Math.sin((2 * Math.PI * day) / 180);

  // 2. Stock Tickers Update
  for (const ticker of m.tickers) {
    const noise = rng.range(-ticker.volatility, ticker.volatility);
    const deltaRate = ticker.trendBias + m.cycleBias + noise;
    const newPrice = Math.max(2, Math.round(ticker.price * (1 + deltaRate) * 100) / 100);

    ticker.price = newPrice;
    ticker.history.push(newPrice);
    if (ticker.history.length > 60) {
      ticker.history.shift();
    }

    // Dividends paid quarterly (every 90 days)
    if (day % 90 === 0 && ticker.dividendYieldPct > 0) {
      const perShare = Math.round((ticker.price * ticker.dividendYieldPct / 4) * 100) / 100;
      ticker.dividendPerShare = perShare;

      // Credit player if holding shares
      const holding = state.player.portfolio[ticker.id];
      if (holding && holding.shares > 0) {
        const totalDiv = Math.round(holding.shares * perShare);
        state.player.money += totalDiv;
        state.player.taxes.dividendIncomeThisCycle += totalDiv;
        state.player.eventLog.unshift({
          day,
          text: `Dividend Payout: Received ₹${totalDiv.toLocaleString('en-IN')} from ${holding.shares} shares of ${ticker.name}`,
          type: 'income'
        });
      }
    }
  }

  // 3. Gold price update (Gold is safe haven: tends to rise when stocks dip)
  const goldNoise = rng.range(-0.015, 0.015);
  const inverseMarketEffect = -m.cycleBias * 0.8;
  const newGoldPrice = Math.max(1000, Math.round(m.goldPricePerGram * (1 + 0.0005 + inverseMarketEffect + goldNoise)));
  m.goldPricePerGram = newGoldPrice;
  m.goldHistory.push(newGoldPrice);
  if (m.goldHistory.length > 60) {
    m.goldHistory.shift();
  }

  // 4. SIP Auto-Execution
  for (const sip of state.player.sips) {
    if (!sip.active) continue;
    if (day - sip.lastInvestedDay >= sip.cycleDays) {
      const targetTicker = m.tickers.find(t => t.id === sip.tickerId);
      if (targetTicker && state.player.money >= sip.amountPerCycle) {
        const sharesToBuy = Math.floor(sip.amountPerCycle / targetTicker.price);
        if (sharesToBuy > 0) {
          const actualCost = sharesToBuy * targetTicker.price;
          state.player.money -= actualCost;

          const current = state.player.portfolio[targetTicker.id] || { shares: 0, avgCost: 0 };
          const totalShares = current.shares + sharesToBuy;
          const totalCost = (current.shares * current.avgCost) + actualCost;
          current.shares = totalShares;
          current.avgCost = Math.round((totalCost / totalShares) * 100) / 100;
          state.player.portfolio[targetTicker.id] = current;

          sip.lastInvestedDay = day;
          state.player.eventLog.unshift({
            day,
            text: `SIP Auto-Invest: Bought ${sharesToBuy} shs of ${targetTicker.name} for ₹${Math.round(actualCost).toLocaleString('en-IN')}`,
            type: 'investment'
          });
        }
      }
    }
  }

  // 5. Property Rent Yields & Appreciation
  for (const prop of m.properties) {
    // Slight daily appreciation
    const dailyApprRate = (prop.appreciationPct / 100) / 360;
    prop.price = Math.round(prop.price * (1 + dailyApprRate));

    // Rent distribution every 30 days
    if (day % 30 === 0 && prop.owner) {
      const monthlyRent = Math.round(prop.price * ((prop.rentYieldPct / 100) / 12));
      if (prop.owner === 'player') {
        state.player.money += monthlyRent;
        state.player.taxes.incomeThisCycle += monthlyRent;
        state.player.eventLog.unshift({
          day,
          text: `Rental Income: Collected ₹${monthlyRent.toLocaleString('en-IN')} from ${prop.name}`,
          type: 'income'
        });
      } else {
        const npc = state.npcs.find(n => n.id === prop.owner);
        if (npc) npc.money += monthlyRent;
      }
    }
  }

  // 6. Business Revenue Split & Competition
  for (const sector of m.businessSectors) {
    if (day % sector.revenueCycleDays === 0) {
      const occupied = sector.slots.filter(s => s.owner !== null);
      if (occupied.length > 0) {
        // More competition = lower margin per competitor
        const shareOfMarket = sector.baseRevenuePerCycle / Math.pow(occupied.length, 0.7);
        const netProfit = Math.round(shareOfMarket - sector.slotUpkeepPerCycle);

        for (const slot of occupied) {
          if (slot.owner === 'player') {
            state.player.money += netProfit;
            if (netProfit > 0) state.player.taxes.incomeThisCycle += netProfit;
            state.player.eventLog.unshift({
              day,
              text: `Business Yield (${sector.name}): ${netProfit >= 0 ? '+' : ''}₹${netProfit.toLocaleString('en-IN')} net profit`,
              type: netProfit >= 0 ? 'income' : 'expense'
            });
          } else {
            const npc = state.npcs.find(n => n.id === slot.owner);
            if (npc) npc.money += netProfit;
          }
        }
      }
    }
  }
}
