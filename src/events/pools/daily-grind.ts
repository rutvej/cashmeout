import { EventCardDef } from '../event-types';

export const DAILY_GRIND_EVENTS: EventCardDef[] = [
  {
    id: 'daily-commute-rush',
    category: 'daily',
    title: 'Morning Commute Rush',
    emoji: '🚌',
    narrative: 'The metro station is packed to the brim. A rickshaw is waiting outside offering a direct ride to your office.',
    priority: 10,
    cooldownDays: 12,
    condition: (state) => state.player.lifestyle.transportMode === 'walk',
    choices: [
      {
        id: 'take-rickshaw',
        label: 'Hail Auto-Rickshaw',
        emoji: '🛺',
        preview: [
          { text: '-₹60', type: 'negative' },
          { text: '+10 Energy', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 60,
        disabledReason: 'Need ₹60 cash',
        onSelect: (state) => {
          state.player.money -= 60;
          state.player.health.energy = Math.min(100, state.player.health.energy + 10);
          return {
            outcomeText: 'You breezed past the morning crowd and arrived at your desk relaxed and energetic!',
            moneyDelta: -60,
            energyDelta: 10
          };
        }
      },
      {
        id: 'squeeze-metro',
        label: 'Squeeze into Transit',
        emoji: '🚇',
        preview: [
          { text: 'Free', type: 'neutral' },
          { text: '-8 Energy', type: 'negative' },
          { text: '+5 Stress', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.energy = Math.max(0, state.player.health.energy - 8);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 5);
          return {
            outcomeText: 'You survived the crush of the crowd, saving your hard-earned rupees at the cost of your morning sanity.',
            energyDelta: -8,
            stressDelta: 5
          };
        }
      }
    ]
  },
  {
    id: 'daily-lunch-choice',
    category: 'daily',
    title: 'Lunch Hour Hunger',
    emoji: '🍱',
    narrative: 'It is 1:30 PM and your stomach is growling. The spicy aroma of the street food stall wafts in through the window.',
    priority: 8,
    cooldownDays: 10,
    choices: [
      {
        id: 'street-chole-bhature',
        label: 'Spicy Street Chole',
        emoji: '🍛',
        preview: [
          { text: '-₹50', type: 'neutral' },
          { text: '+10 Mental', type: 'positive' },
          { text: 'Gut Risk +1', type: 'negative' }
        ],
        disabled: (state) => state.player.money < 50,
        disabledReason: 'Need ₹50 cash',
        onSelect: (state) => {
          state.player.money -= 50;
          state.player.health.mental = Math.min(100, state.player.health.mental + 10);
          state.player.consequenceMeters.cheapFoodDays += 1;
          return {
            outcomeText: 'Delicious, greasy street food hits the spot! But your digestive tract silently files a grievance.',
            moneyDelta: -50,
            mentalDelta: 10
          };
        }
      },
      {
        id: 'healthy-salad-bowl',
        label: 'Clean Salad / Thali',
        emoji: '🥗',
        preview: [
          { text: '-₹160', type: 'negative' },
          { text: '+5 Physical', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 160,
        disabledReason: 'Need ₹160 cash',
        onSelect: (state) => {
          state.player.money -= 160;
          state.player.health.physical = Math.min(100, state.player.health.physical + 5);
          state.player.consequenceMeters.cheapFoodDays = Math.max(0, state.player.consequenceMeters.cheapFoodDays - 1);
          return {
            outcomeText: 'You treated your body to fresh greens and wholesome protein. You feel clean and sharp.',
            moneyDelta: -160,
            physicalDelta: 5
          };
        }
      },
      {
        id: 'tap-water-skip',
        label: 'Drink Water & Fast',
        emoji: '💧',
        preview: [
          { text: '₹0 spent', type: 'positive' },
          { text: '-12 Energy', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.energy = Math.max(0, state.player.health.energy - 12);
          return {
            outcomeText: 'You tightened your belt and drank three glasses of water. Pure savings, but your head is spinning slightly.',
            energyDelta: -12
          };
        }
      }
    ]
  },
  {
    id: 'daily-chai-tapri-break',
    category: 'daily',
    title: '4:00 PM Chai Tapri Break',
    emoji: '☕',
    narrative: 'Your office team heads downstairs to the corner tea stall for ginger cutting chai and hot samosas.',
    priority: 9,
    cooldownDays: 8,
    choices: [
      {
        id: 'hot-cutting-chai',
        label: 'Cutting Chai & Bun Maska (-₹30)',
        emoji: '🫖',
        preview: [
          { text: '-₹30', type: 'neutral' },
          { text: '+12 Mental', type: 'positive' },
          { text: '-8 Stress', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 30,
        disabledReason: 'Need ₹30 cash',
        onSelect: (state) => {
          state.player.money -= 30;
          state.player.health.mental = Math.min(100, state.player.health.mental + 12);
          state.player.stats.stress = Math.max(0, state.player.stats.stress - 8);
          return {
            outcomeText: 'Steaming spicy ginger tea and banter with colleagues washed away the afternoon office fatigue.',
            moneyDelta: -30,
            mentalDelta: 12,
            stressDelta: -8
          };
        }
      },
      {
        id: 'drink-desk-water',
        label: 'Stay at Desk & Grind',
        emoji: '💻',
        preview: [
          { text: 'Save ₹30', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You kept staring at spreadsheets while the office was quiet.'
          };
        }
      }
    ]
  },
  {
    id: 'daily-podcast-learning',
    category: 'daily',
    title: 'Commute Wealth Audio',
    emoji: '🎧',
    narrative: 'You have a 35-minute commute ahead. Do you plug into a masterclass on value investing or mindlessly shuffle pop music?',
    priority: 11,
    cooldownDays: 14,
    choices: [
      {
        id: 'listen-finance-pod',
        label: 'Listen to Compound Interest Deep Dive',
        emoji: '🎙️',
        preview: [
          { text: '+10 Financial Insight', type: 'positive' },
          { text: '+5 Mental', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.min(100, state.player.health.mental + 5);
          return {
            outcomeText: 'You absorbed crucial insights on asset allocation and avoiding lifestyle inflation. Commute well-spent!',
            mentalDelta: 5
          };
        }
      },
      {
        id: 'listen-music-chill',
        label: 'Listen to Lo-Fi Chill Tracks',
        emoji: '🎵',
        preview: [
          { text: '-6 Stress', type: 'positive' },
          { text: '+5 Energy', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.stats.stress = Math.max(0, state.player.stats.stress - 6);
          state.player.health.energy = Math.min(100, state.player.health.energy + 5);
          return {
            outcomeText: 'Mellow beats relaxed your mind on the journey home.',
            stressDelta: -6,
            energyDelta: 5
          };
        }
      }
    ]
  },
  {
    id: 'daily-morning-sunlight',
    category: 'daily',
    title: 'Balcony Morning Sunshine',
    emoji: '🌅',
    narrative: 'Early morning sunlight floods through the balcony. The city is calm before the rush hour mayhem begins.',
    priority: 8,
    cooldownDays: 10,
    choices: [
      {
        id: 'soak-morning-sun',
        label: '15 Mins Sun & Deep Breaths',
        emoji: '🧘',
        preview: [
          { text: '+8 Physical (Vitamin D)', type: 'positive' },
          { text: '+10 Energy Boost', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.physical = Math.min(100, state.player.health.physical + 8);
          state.player.health.energy = Math.min(100, state.player.health.energy + 10);
          return {
            outcomeText: 'Warm sunlight reset your circadian rhythm and elevated your morning vitality. Pure zero-cost health!',
            physicalDelta: 8,
            energyDelta: 10
          };
        }
      }
    ]
  },
  {
    id: 'daily-boss-overtime',
    category: 'daily',
    title: 'Urgent Client Escalation',
    emoji: '💼',
    narrative: 'Your manager drops by your desk at 5:45 PM: "We need someone to finish this client deck tonight. 1.5x overtime bonus if you stay."',
    priority: 15,
    cooldownDays: 16,
    choices: [
      {
        id: 'accept-overtime',
        label: 'Grind Overtime (+Cash)',
        emoji: '🔥',
        preview: [
          { text: '+₹1,200', type: 'positive' },
          { text: '-18 Energy', type: 'negative' },
          { text: '+10 Stress', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money += 1200;
          state.player.taxes.incomeThisCycle += 1200;
          state.player.health.energy = Math.max(0, state.player.health.energy - 18);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 10);
          return {
            outcomeText: 'You worked till midnight and sent the final deck. Your bank account is heavier, but your eyes burn.',
            moneyDelta: 1200,
            energyDelta: -18,
            stressDelta: 10
          };
        }
      },
      {
        id: 'decline-overtime',
        label: 'Pack Up & Go Home',
        emoji: '🏃',
        preview: [
          { text: '+15 Mental', type: 'positive' },
          { text: 'Boss annoyed', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.min(100, state.player.health.mental + 15);
          return {
            outcomeText: 'You logged off right on time. Your boss gave a cold nod, but your evening freedom was glorious.',
            mentalDelta: 15
          };
        }
      }
    ]
  },
  {
    id: 'daily-evening-workout',
    category: 'daily',
    title: 'Evening Fatigue vs Cardio',
    emoji: '🏋️',
    narrative: 'You are back home. The bed looks inviting, but your workout shoes are sitting right by the door.',
    priority: 9,
    cooldownDays: 12,
    choices: [
      {
        id: 'do-pushups-run',
        label: '20-Min Cardio & Pushups',
        emoji: '💪',
        preview: [
          { text: '+6 Physical', type: 'positive' },
          { text: '+5 Mental', type: 'positive' },
          { text: '-10 Energy', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.physical = Math.min(100, state.player.health.physical + 6);
          state.player.health.mental = Math.min(100, state.player.health.mental + 5);
          state.player.health.energy = Math.max(0, state.player.health.energy - 10);
          state.player.consequenceMeters.noExerciseDays = Math.max(0, state.player.consequenceMeters.noExerciseDays - 2);
          return {
            outcomeText: 'Endorphins flood your veins! Your posture immediately improves and stress melts away.',
            physicalDelta: 6,
            mentalDelta: 5,
            energyDelta: -10
          };
        }
      },
      {
        id: 'flop-on-couch',
        label: 'Collapse on Couch',
        emoji: '🛋️',
        preview: [
          { text: '+12 Energy', type: 'positive' },
          { text: 'Sedentary +1', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.energy = Math.min(100, state.player.health.energy + 12);
          state.player.consequenceMeters.noExerciseDays += 1;
          return {
            outcomeText: 'You sank into the cushions and watched random comedy sketches. Restful, but the body stiffens.',
            energyDelta: 12
          };
        }
      }
    ]
  }
];
