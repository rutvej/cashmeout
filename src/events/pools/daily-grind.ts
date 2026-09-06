import { EventCardDef } from '../event-types';

export const DAILY_GRIND_EVENTS: EventCardDef[] = [
  {
    id: 'daily-commute-rush',
    category: 'daily',
    title: 'Morning Commute Rush',
    emoji: '🚌',
    narrative: 'The metro station is packed to the brim. A rickshaw is waiting outside offering a direct ride to your office.',
    priority: 10,
    cooldownDays: 3,
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
    cooldownDays: 4,
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
    id: 'daily-boss-overtime',
    category: 'daily',
    title: 'Urgent Client Escalation',
    emoji: '💼',
    narrative: 'Your manager drops by your desk at 5:45 PM: "We need someone to finish this client deck tonight. 1.5x overtime bonus if you stay."',
    priority: 15,
    cooldownDays: 5,
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
    cooldownDays: 3,
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
  },
  {
    id: 'daily-night-doomscroll',
    category: 'daily',
    title: 'Late Night Screen Glow',
    emoji: '📱',
    narrative: 'It is 11:30 PM. You are in bed scrolling short-form videos. Just one more reel turns into an hour.',
    priority: 8,
    cooldownDays: 4,
    choices: [
      {
        id: 'turn-off-sleep',
        label: 'Put Phone Away (8 Hrs Sleep)',
        emoji: '😴',
        preview: [
          { text: '+20 Energy', type: 'positive' },
          { text: '+5 Mental', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.energy = Math.min(100, state.player.health.energy + 20);
          state.player.health.mental = Math.min(100, state.player.health.mental + 5);
          return {
            outcomeText: 'You enjoyed deep REM sleep and woke up feeling like a million bucks.',
            energyDelta: 20,
            mentalDelta: 5
          };
        }
      },
      {
        id: 'doomscroll-till-2am',
        label: 'Scroll Until 2:00 AM',
        emoji: '👀',
        preview: [
          { text: '-15 Energy', type: 'negative' },
          { text: '+10 Stress', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.health.energy = Math.max(0, state.player.health.energy - 15);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 10);
          return {
            outcomeText: 'You watched viral debates and luxury lifestyle reels. You wake up with gritty eyes and brain fog.',
            energyDelta: -15,
            stressDelta: 10
          };
        }
      }
    ]
  }
];
