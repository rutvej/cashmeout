import { EventCardDef } from '../event-types';

export const LIFE_DILEMMA_EVENTS: EventCardDef[] = [
  {
    id: 'dilemma-friend-birthday',
    category: 'dilemma',
    title: 'Rooftop Birthday Party',
    emoji: '🎉',
    narrative: 'Your close college friend is celebrating their birthday at a trendy rooftop lounge. Everyone will be there splitting the bill.',
    priority: 20,
    cooldownDays: 35,
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
    once: true, // Only happens ONCE in lifetime!
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
    cooldownDays: 60,
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
    cooldownDays: 45,
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
    once: true, // Only happens ONCE in lifetime!
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
  },
  {
    id: 'dilemma-wedding-invite',
    category: 'dilemma',
    title: 'Colleague Wedding Invitation',
    emoji: '💌',
    narrative: 'A popular teammate is getting married at a lavish banquet hall. The office is organizing a collective cash envelope.',
    priority: 19,
    cooldownDays: 40,
    condition: (state) => state.player.currentDay >= 25,
    choices: [
      {
        id: 'contribute-wedding-shagun',
        label: 'Put ₹1,500 in Shagun Envelope',
        emoji: '🧧',
        preview: [
          { text: '-₹1,500', type: 'negative' },
          { text: '+20 Social Goodwill', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 1500,
        disabledReason: 'Need ₹1,500 cash',
        onSelect: (state) => {
          state.player.money -= 1500;
          state.player.health.mental = Math.min(100, state.player.health.mental + 15);
          return {
            outcomeText: 'You enjoyed the royal dinner buffet, danced in the baraat, and earned great office bonding!',
            moneyDelta: -1500,
            mentalDelta: 15
          };
        }
      },
      {
        id: 'send-greeting-card',
        label: 'Send Sweet Card & Regrets',
        emoji: '✉️',
        preview: [
          { text: 'Save ₹1,500', type: 'positive' },
          { text: 'Minor office chatter', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You congratulated them warmly on Slack. You missed the buffet, but saved ₹1,500.'
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-ac-electric-spike',
    category: 'dilemma',
    title: 'Scorching Summer Heatwave',
    emoji: '☀️',
    narrative: 'The temperature outdoors hits 42°C (107°F). The room fan is blowing hot air like a hair dryer. Do you run the AC on blast all night?',
    priority: 21,
    cooldownDays: 30,
    condition: (state) => state.player.currentDay >= 35,
    choices: [
      {
        id: 'run-ac-high',
        label: 'Crank AC to 22°C (High Bill)',
        emoji: '❄️',
        preview: [
          { text: '-₹1,200 Electricity', type: 'negative' },
          { text: '+20 Deep Sleep & Energy', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 1200,
        disabledReason: 'Need ₹1,200 cash',
        onSelect: (state) => {
          state.player.money -= 1200;
          state.player.health.energy = Math.min(100, state.player.health.energy + 20);
          return {
            outcomeText: 'Crisp, chilly mountain air filled your bedroom. You slept like a baby despite the scorching heatwave.',
            moneyDelta: -1200,
            energyDelta: 20
          };
        }
      },
      {
        id: 'sweat-it-out',
        label: 'Cold Water & Ceiling Fan',
        emoji: '🪣',
        preview: [
          { text: 'Save ₹1,200', type: 'positive' },
          { text: '-15 Energy', type: 'negative' },
          { text: '+8 Stress', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.energy = Math.max(0, state.player.health.energy - 15);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 8);
          return {
            outcomeText: 'You tossed and turned in sweat-drenched sheets. Survived, but wake up groggy and tired.',
            energyDelta: -15,
            stressDelta: 8
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-dental-filling',
    category: 'dilemma',
    title: 'Molar Sensitivity & Cavity',
    emoji: '🦷',
    narrative: 'Drinking iced water sends a sharp nerve zap through your upper molar. A dark spot indicates a developing cavity.',
    priority: 23,
    cooldownDays: 50,
    condition: (state) => state.player.currentDay >= 20,
    choices: [
      {
        id: 'composite-filling',
        label: 'Dental Visit & UV Filling',
        emoji: '👨‍⚕️',
        preview: [
          { text: '-₹1,800', type: 'negative' },
          { text: 'Permanent relief', type: 'positive' },
          { text: '+10 Physical', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 1800,
        disabledReason: 'Need ₹1,800 cash',
        onSelect: (state) => {
          state.player.money -= 1800;
          state.player.health.physical = Math.min(100, state.player.health.physical + 10);
          return {
            outcomeText: 'The dentist drilled out the decay and cured composite resin. Zero pain chewing now!',
            moneyDelta: -1800,
            physicalDelta: 10
          };
        }
      },
      {
        id: 'clove-oil-delay',
        label: 'Dab Clove Oil & Delay',
        emoji: '🌿',
        preview: [
          { text: '-₹60 Clove Oil', type: 'neutral' },
          { text: 'Risk Root Canal later', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money -= 60;
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 6);
          return {
            outcomeText: 'Clove oil numbed the gum for a few hours. The cavity is still there, ticking away.',
            moneyDelta: -60,
            stressDelta: 6
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-jacket-cash-found',
    category: 'dilemma',
    title: 'Winter Jacket Treasure!',
    emoji: '🧥',
    narrative: 'You reach into the inner zipped pocket of your jacket and your fingers brush against a crisp, folded ₹500 currency note you forgot about last winter!',
    priority: 17,
    cooldownDays: 60,
    choices: [
      {
        id: 'pocket-found-cash',
        label: 'Put in Liquid Wallet (+₹500)',
        emoji: '💵',
        preview: [
          { text: '+₹500 Free Cash', type: 'positive' },
          { text: '+10 Mental Joy', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.money += 500;
          state.player.health.mental = Math.min(100, state.player.health.mental + 10);
          return {
            outcomeText: 'Finding your own forgotten money is pure unadulterated happiness! Day instantly made.',
            moneyDelta: 500,
            mentalDelta: 10
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-monsoon-cloudburst',
    category: 'dilemma',
    title: 'Monsoon Cloudburst',
    emoji: '🌧️',
    narrative: 'As you step out of the metro, the skies open up into a violent downpour. Street hawkers are selling umbrellas for ₹250.',
    priority: 18,
    cooldownDays: 25,
    choices: [
      {
        id: 'buy-street-umbrella',
        label: 'Buy Sturdy Umbrella (-₹250)',
        emoji: '☂️',
        preview: [
          { text: '-₹250', type: 'neutral' },
          { text: 'Stay dry & professional', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 250,
        disabledReason: 'Need ₹250 cash',
        onSelect: (state) => {
          state.player.money -= 250;
          return {
            outcomeText: 'You popped the umbrella open and walked comfortably through the storm.',
            moneyDelta: -250
          };
        }
      },
      {
        id: 'sprint-through-rain',
        label: 'Sprint 10 Mins in Rain',
        emoji: '🏃',
        preview: [
          { text: '₹0 spent', type: 'positive' },
          { text: '-10 Physical (Catch cold)', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.physical = Math.max(0, state.player.health.physical - 10);
          return {
            outcomeText: 'You reached home soaked to the bone like a drowned cat, sneezing repeatedly.',
            physicalDelta: -10
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-traffic-fine',
    category: 'dilemma',
    title: 'Traffic Police Checkpoint',
    emoji: '👮',
    narrative: 'Traffic police have set up barricades checking vehicle documents, pollution certificates, and lane violations.',
    priority: 20,
    cooldownDays: 45,
    condition: (state) => state.player.lifestyle.transportMode !== 'walk',
    choices: [
      {
        id: 'pay-challan-official',
        label: 'Pay Official e-Challan (-₹500)',
        emoji: '🧾',
        preview: [
          { text: '-₹500 Fine', type: 'negative' },
          { text: 'Clean record', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 500,
        disabledReason: 'Need ₹500 cash',
        onSelect: (state) => {
          state.player.money -= 500;
          return {
            outcomeText: 'Official challan receipt received on phone. An annoying expense, but legal and clear.',
            moneyDelta: -500
          };
        }
      }
    ]
  },
  {
    id: 'dilemma-luxury-watch-status',
    category: 'dilemma',
    title: 'Corporate Status Peer Pressure',
    emoji: '⌚',
    narrative: 'At a team offsite dinner, senior managers are discussing luxury watches and designer perfumes. A peer remarks: "You really should upgrade your wristwear!"',
    priority: 16,
    cooldownDays: 60,
    condition: (state) => state.player.currentDay >= 60 && state.player.money >= 15000,
    choices: [
      {
        id: 'buy-luxury-watch',
        label: 'Buy Swiss Chronograph (-₹14,000)',
        emoji: '✨',
        preview: [
          { text: '-₹14,000', type: 'negative' },
          { text: '+25 Status & Mental', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.money -= 14000;
          state.player.health.mental = Math.min(100, state.player.health.mental + 25);
          return {
            outcomeText: 'Sapphire crystal and brushed steel glints on your wrist. Colleagues nod with newfound respect.',
            moneyDelta: -14000,
            mentalDelta: 25
          };
        }
      },
      {
        id: 'proud-frugal-time',
        label: 'Check Time on Phone ("My Money is Compounding")',
        emoji: '📱',
        preview: [
          { text: 'Keep ₹14,000 invested', type: 'positive' },
          { text: '+15 Wealth Mindset', type: 'positive' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You smiled calmly. The truly wealthy build assets, not vanity collections.'
          };
        }
      }
    ]
  }
];
