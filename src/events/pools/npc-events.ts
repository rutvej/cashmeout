import { EventCardDef } from '../event-types';

export const NPC_EVENTS: EventCardDef[] = [
  {
    id: 'npc-priya-stock-tip',
    category: 'npc',
    title: 'Priya Mehta: "Hot Tech Tip!"',
    emoji: '🚀',
    narrative: 'Priya Mehta (the aggressive investor) pulls up next to you with an excited grin: "NexGen Tech is securing a massive government cloud contract! If you buy 15 shares today, you will double your money."',
    priority: 25,
    cooldownDays: 18,
    choices: [
      {
        id: 'follow-priya-tip',
        label: 'Follow Tip: Buy 15 Shares (NXTECH)',
        emoji: '📈',
        preview: [
          { text: 'Invest ~₹5,100', type: 'negative' },
          { text: '+15 NXTECH Shares', type: 'positive' }
        ],
        disabled: (state) => {
          const nx = state.market.tickers.find(t => t.id === 'NXTECH');
          return !nx || state.player.money < nx.price * 15;
        },
        disabledReason: 'Need ~₹5,100 cash',
        onSelect: (state) => {
          const nx = state.market.tickers.find(t => t.id === 'NXTECH')!;
          const cost = nx.price * 15;
          state.player.money -= cost;
          const cur = state.player.portfolio['NXTECH'] || { shares: 0, avgCost: nx.price };
          const totalShares = cur.shares + 15;
          cur.avgCost = Math.round(((cur.shares * cur.avgCost) + cost) / totalShares * 100) / 100;
          cur.shares = totalShares;
          state.player.portfolio['NXTECH'] = cur;
          return {
            outcomeText: `You took Priya's tip and acquired 15 shares of NexGen Tech at ₹${nx.price}. High risk, high reward!`,
            moneyDelta: -cost
          };
        }
      },
      {
        id: 'smile-and-ignore',
        label: 'Smile & Decline ("I stick to index funds")',
        emoji: '🛡️',
        preview: [
          { text: 'Avoid FOMO risk', type: 'positive' },
          { text: '+5 Financial Wisdom', type: 'positive' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'Priya shrugged: "Your loss!" and sped off. You preserved your capital from speculative FOMO.'
          };
        }
      }
    ]
  },
  {
    id: 'npc-aarav-partnership',
    category: 'npc',
    title: 'Aarav Sharma: Food Cart Expansion',
    emoji: '🍲',
    narrative: 'Aarav Sharma has been running a wildly successful food cart downtown. He needs ₹4,000 for a second griddle and offers you a 25% share of weekly profits.',
    priority: 30,
    cooldownDays: 25,
    condition: (state) => state.player.money >= 4000,
    choices: [
      {
        id: 'invest-in-aarav',
        label: 'Partner Up: Invest ₹4,000',
        emoji: '🤝',
        preview: [
          { text: '-₹4,000 now', type: 'negative' },
          { text: '+₹800 Passive Income / 15d', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.money -= 4000;
          state.player.savingsBalance += 4000; // backed by business asset
          state.player.health.mental = Math.min(100, state.player.health.mental + 15);
          return {
            outcomeText: 'You shook hands with Aarav over chai! His new station is bustling with hungry tech workers.',
            moneyDelta: -4000,
            mentalDelta: 15
          };
        }
      },
      {
        id: 'decline-partnership',
        label: 'Politely Pass on Restaurant Biz',
        emoji: '🙅',
        preview: [
          { text: 'Keep ₹4,000 safe', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You wished Aarav the best. The food industry has razor-thin margins anyway.'
          };
        }
      }
    ]
  },
  {
    id: 'npc-vikram-advice',
    category: 'npc',
    title: 'Vikram Verma: The 6-Month Emergency Fund',
    emoji: '🛡️',
    narrative: 'At the bank ATM, you bump into Vikram Verma (the cautious saver). He inspects his passbook proudly: "No debt, 6 months living costs in cash, and physical gold. How is your emergency buffer looking?"',
    priority: 22,
    cooldownDays: 20,
    choices: [
      {
        id: 'deposit-to-savings-vikram',
        label: 'Transfer ₹2,000 to Savings Account',
        emoji: '🏦',
        preview: [
          { text: '-₹2,000 Cash', type: 'neutral' },
          { text: '+₹2,000 in Bank (3.5%)', type: 'positive' },
          { text: '+10 Mental Peace', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 2000,
        disabledReason: 'Need ₹2,000 cash',
        onSelect: (state) => {
          state.player.money -= 2000;
          state.player.savingsBalance += 2000;
          state.player.health.mental = Math.min(100, state.player.health.mental + 10);
          return {
            outcomeText: 'You transferred ₹2,000 to your bank savings. A solid emergency cushion brings unmatched peace of mind.',
            moneyDelta: -2000,
            mentalDelta: 10
          };
        }
      },
      {
        id: 'proud-of-current-state',
        label: '"I prefer active cash flow, Vikram."',
        emoji: '😎',
        preview: [
          { text: 'No change', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'Vikram adjusted his spectacles: "Just make sure an unexpected medical bill does not catch you off-guard!"'
          };
        }
      }
    ]
  }
];
