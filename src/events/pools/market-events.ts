import { EventCardDef } from '../event-types';

export const MARKET_EVENTS: EventCardDef[] = [
  {
    id: 'market-buy-the-dip',
    category: 'market',
    title: 'Market Flash Dip: Orion Foods',
    emoji: '📉',
    narrative: 'A sensationalized news headline causes panic selling in Orion Foods Co. (ORFOOD). The stock drops 8% in morning trade, but company fundamentals remain rock solid.',
    priority: 35,
    cooldownDays: 14,
    condition: (state) => state.player.money >= 1500,
    choices: [
      {
        id: 'buy-dip-shares',
        label: 'Buy the Dip (20 Shares)',
        emoji: '🛒',
        preview: [
          { text: 'Invest ~₹2,200', type: 'negative' },
          { text: '+20 ORFOOD Shares', type: 'positive' },
          { text: 'High rebound potential', type: 'positive' }
        ],
        disabled: (state) => {
          const t = state.market.tickers.find(x => x.id === 'ORFOOD');
          return !t || state.player.money < t.price * 20;
        },
        disabledReason: 'Insufficient cash',
        onSelect: (state) => {
          const t = state.market.tickers.find(x => x.id === 'ORFOOD')!;
          const cost = t.price * 20;
          state.player.money -= cost;
          const cur = state.player.portfolio['ORFOOD'] || { shares: 0, avgCost: t.price };
          const totalShares = cur.shares + 20;
          cur.avgCost = Math.round(((cur.shares * cur.avgCost) + cost) / totalShares * 100) / 100;
          cur.shares = totalShares;
          state.player.portfolio['ORFOOD'] = cur;
          return {
            outcomeText: `You bought 20 shares of ${t.name} at ₹${t.price}/share during the dip!`,
            moneyDelta: -cost
          };
        }
      },
      {
        id: 'ignore-dip',
        label: 'Wait & Watch from Sidelines',
        emoji: '👀',
        preview: [
          { text: 'Keep cash liquid', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You chose to preserve cash and see if the market corrects further.'
          };
        }
      }
    ]
  },
  {
    id: 'market-gold-rush',
    category: 'market',
    title: 'Inflation Fear: 24K Gold Spikes',
    emoji: '✨',
    narrative: 'Global macroeconomic tensions have triggered a rush into precious metals. 24K Physical Gold is climbing steadily.',
    priority: 30,
    cooldownDays: 20,
    choices: [
      {
        id: 'buy-gold-sovereign',
        label: 'Accumulate 2 Grams Gold',
        emoji: '🪙',
        preview: [
          { text: 'Buy at spot rate', type: 'neutral' },
          { text: 'Hedge against inflation', type: 'positive' }
        ],
        disabled: (state) => state.player.money < state.market.goldPricePerGram * 2,
        disabledReason: 'Insufficient funds for 2g gold',
        onSelect: (state) => {
          const cost = state.market.goldPricePerGram * 2;
          state.player.money -= cost;
          state.player.goldHoldings.grams += 2;
          return {
            outcomeText: `Added 2 grams of certified 24K gold to your vault at ₹${state.market.goldPricePerGram}/g.`,
            moneyDelta: -cost
          };
        }
      },
      {
        id: 'pass-gold-spike',
        label: 'Pass (Prefer Cash & Stocks)',
        emoji: '🚫',
        preview: [
          { text: 'No transaction', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You decided against buying gold near the recent highs.'
          };
        }
      }
    ]
  },
  {
    id: 'market-dividend-bonanza',
    category: 'market',
    title: 'Quarterly Corporate Dividends',
    emoji: '💵',
    narrative: 'Your equity holdings just distributed quarterly shareholder dividends directly to your account.',
    priority: 40,
    cooldownDays: 30,
    condition: (state) => {
      let totalShares = 0;
      for (const entry of Object.values(state.player.portfolio)) totalShares += entry.shares;
      return totalShares >= 10;
    },
    choices: [
      {
        id: 'collect-dividends',
        label: 'Reinvest Dividends into Savings',
        emoji: '🏦',
        preview: [
          { text: 'Passive income bonus', type: 'positive' },
          { text: 'Compounds at 3.5%', type: 'positive' }
        ],
        onSelect: (state) => {
          let divBonus = 0;
          for (const [tickerId, entry] of Object.entries(state.player.portfolio)) {
            const t = state.market.tickers.find(x => x.id === tickerId);
            if (t) divBonus += Math.round(entry.shares * t.price * 0.015);
          }
          divBonus = Math.max(300, divBonus);
          state.player.savingsBalance += divBonus;
          return {
            outcomeText: `Collected ₹${divBonus.toLocaleString('en-IN')} in dividend yields and swept directly to high-yield savings!`,
            moneyDelta: divBonus
          };
        }
      },
      {
        id: 'treat-yourself-dividend',
        label: 'Cash Out for a Nice Dinner',
        emoji: '🍽️',
        preview: [
          { text: '+Liquid Cash', type: 'positive' },
          { text: '+20 Mental Health', type: 'positive' }
        ],
        onSelect: (state) => {
          let divBonus = 0;
          for (const [tickerId, entry] of Object.entries(state.player.portfolio)) {
            const t = state.market.tickers.find(x => x.id === tickerId);
            if (t) divBonus += Math.round(entry.shares * t.price * 0.015);
          }
          divBonus = Math.max(300, divBonus);
          state.player.money += divBonus;
          state.player.health.mental = Math.min(100, state.player.health.mental + 20);
          return {
            outcomeText: `Cashed out ₹${divBonus.toLocaleString('en-IN')} dividends and celebrated passive cashflow at a fine restaurant!`,
            moneyDelta: divBonus,
            mentalDelta: 20
          };
        }
      }
    ]
  }
];
