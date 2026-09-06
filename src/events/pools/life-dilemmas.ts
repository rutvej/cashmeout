import { EventCardDef } from '../event-types';

export const LIFE_DILEMMA_EVENTS: EventCardDef[] = [
  {
    id: 'dilemma-friend-birthday',
    category: 'dilemma',
    title: 'Rooftop Birthday Party',
    emoji: '🎉',
    narrative: 'Your close college friend is celebrating their birthday at a trendy rooftop lounge. Everyone will be there splitting the bill.',
    priority: 20,
    cooldownDays: 8,
    choices: [
      {
        id: 'attend-party',
        label: 'Attend & Split Bill',
        emoji: '🥂',
        preview: [
          { text: '-₹1,200', type: 'negative' },
          { text: '+25 Mental', type: 'positive' },
          { text: '-15 Stress', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 1200,
        disabledReason: 'Need ₹1,200 cash',
        onSelect: (state) => {
          state.player.money -= 1200;
          state.player.health.mental = Math.min(100, state.player.health.mental + 25);
          state.player.stats.stress = Math.max(0, state.player.stats.stress - 15);
          return {
            outcomeText: 'You laughed until your ribs hurt, made great memories, and bonded with friends!',
            moneyDelta: -1200,
            mentalDelta: 25,
            stressDelta: -15
          };
        }
      },
      {
        id: 'polite-decline',
        label: 'Make Excuse & Stay Home',
        emoji: '🛋️',
        preview: [
          { text: 'Save ₹1,200', type: 'positive' },
          { text: '-10 Mental', type: 'negative' },
          { text: 'FOMO creeps in', type: 'neutral' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.max(0, state.player.health.mental - 10);
          return {
            outcomeText: 'Your wallet breathes a sigh of relief, but viewing their Instagram stories gives you severe FOMO.',
            mentalDelta: -10
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-cracked-screen',
    category: 'dilemma',
    title: 'Shattered Phone Screen',
    emoji: '📱',
    narrative: 'Your phone slips out of your pocket onto the concrete pavement. The glass is spider-webbed with cracks across the screen.',
    priority: 25,
    cooldownDays: 14,
    choices: [
      {
        id: 'fix-screen-official',
        label: 'Repair at Service Center',
        emoji: '🛠️',
        preview: [
          { text: '-₹2,400', type: 'negative' },
          { text: 'Peace of mind', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 2400,
        disabledReason: 'Need ₹2,400 cash',
        onSelect: (state) => {
          state.player.money -= 2400;
          state.player.health.mental = Math.min(100, state.player.health.mental + 10);
          return {
            outcomeText: 'Good as new! Crystal clear display with zero touch issues.',
            moneyDelta: -2400,
            mentalDelta: 10
          };
        }
      },
      {
        id: 'ignore-crack',
        label: 'Slap Tape on It & Endure',
        emoji: '🩹',
        preview: [
          { text: '₹0 spent', type: 'positive' },
          { text: '+8 Stress', type: 'negative' },
          { text: '-5 Mental', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 8);
          state.player.health.mental = Math.max(0, state.player.health.mental - 5);
          return {
            outcomeText: 'You put a screen guard over the cracks. Your fingers occasionally catch a glass shard.',
            stressDelta: 8,
            mentalDelta: -5
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-cousin-borrow',
    category: 'dilemma',
    title: 'Family Loan Request',
    emoji: '🤝',
    narrative: 'Your cousin calls: "Bhai, my bike broke down and rent is due. Can you wire me ₹3,000 until next month?" You know their repayment history is dubious.',
    priority: 22,
    cooldownDays: 15,
    condition: (state) => state.player.money >= 3000,
    choices: [
      {
        id: 'lend-cousin-money',
        label: 'Lend ₹3,000 (Family first)',
        emoji: '💸',
        preview: [
          { text: '-₹3,000', type: 'negative' },
          { text: '+15 Family Karma', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.money -= 3000;
          return {
            outcomeText: 'You wired the money. Your cousin sends heartfelt voice notes. Will you ever see this money again? Unlikely.',
            moneyDelta: -3000
          };
        }
      },
      {
        id: 'say-funds-locked',
        label: '"Sorry, Money in Fixed Deposit"',
        emoji: '🙅',
        preview: [
          { text: 'Keep ₹3,000', type: 'positive' },
          { text: 'Awkward silence', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You claimed your cash is locked in an investment scheme. Your cousin hangs up a bit cold, but your wallet is safe.'
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-flash-sale',
    category: 'dilemma',
    title: 'Midnight Flash Sale',
    emoji: '🏷️',
    narrative: 'A push notification pops up: Premium Noise-Canceling Headphones 50% OFF for the next 2 hours! You have been eyeing them for weeks.',
    priority: 18,
    cooldownDays: 10,
    choices: [
      {
        id: 'buy-headphones',
        label: 'Click "Buy Now" (Impulse Buy)',
        emoji: '🎧',
        preview: [
          { text: '-₹3,500', type: 'negative' },
          { text: '+20 Mental', type: 'positive' },
          { text: '+5 Energy (Focus)', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 3500,
        disabledReason: 'Need ₹3,500 cash',
        onSelect: (state) => {
          state.player.money -= 3500;
          state.player.health.mental = Math.min(100, state.player.health.mental + 20);
          state.player.health.energy = Math.min(100, state.player.health.energy + 5);
          return {
            outcomeText: 'Instant dopamine hit! The sound quality is sublime, drowning out the noisy city.',
            moneyDelta: -3500,
            mentalDelta: 20,
            energyDelta: 5
          };
        }
      },
      {
        id: 'close-browser-tab',
        label: 'Resist & Close App',
        emoji: '🛡️',
        preview: [
          { text: 'Save ₹3,500', type: 'positive' },
          { text: '+10 Financial Discipline', type: 'positive' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You practiced stoic willpower and closed the browser tab. Financial freedom is built on small victories.'
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-leaking-pipe',
    category: 'dilemma',
    title: 'Apartment Bathroom Leak',
    emoji: '🚿',
    narrative: 'Water is dripping from the bathroom valve, slowly flooding the floor. The landlord insists maintenance inside the flat is your responsibility.',
    priority: 24,
    cooldownDays: 12,
    choices: [
      {
        id: 'hire-plumber',
        label: 'Call Licensed Plumber',
        emoji: '👨‍🔧',
        preview: [
          { text: '-₹750', type: 'negative' },
          { text: 'Clean permanent fix', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 750,
        disabledReason: 'Need ₹750 cash',
        onSelect: (state) => {
          state.player.money -= 750;
          return {
            outcomeText: 'The plumber replaced the brass seal in 20 minutes. Dry floors and zero worries.',
            moneyDelta: -750
          };
        }
      },
      {
        id: 'diy-wrench-fix',
        label: 'DIY Wrench & Teflon Tape',
        emoji: '🔧',
        preview: [
          { text: '-₹80 Tape', type: 'neutral' },
          { text: '-10 Energy', type: 'negative' },
          { text: '50% chance of success', type: 'neutral' }
        ],
        onSelect: (state) => {
          state.player.money -= 80;
          state.player.health.energy = Math.max(0, state.player.health.energy - 10);
          const success = Math.random() > 0.4;
          if (success) {
            state.player.health.mental = Math.min(100, state.player.health.mental + 10);
            return {
              outcomeText: 'You twisted the valve with brute strength and sealed it with Teflon tape. You handy person, you!',
              moneyDelta: -80,
              energyDelta: -10,
              mentalDelta: 10
            };
          } else {
            state.player.stats.stress = Math.min(100, state.player.stats.stress + 15);
            return {
              outcomeText: 'The valve stripped! A jet of rusty water soaked your shirt. You had to call an emergency plumber anyway.',
              moneyDelta: -80,
              energyDelta: -10,
              stressDelta: 15
            };
          }
        }
      }
    ]
  }
];
