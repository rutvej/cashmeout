import { EventCardDef } from '../event-types';

export const OPPORTUNITY_EVENTS: EventCardDef[] = [
  {
    id: 'opp-freelance-rush',
    category: 'opportunity',
    title: 'Weekend Freelance Gig',
    emoji: '💻',
    narrative: 'An ex-colleague messages you on LinkedIn: "Hey, we have an urgent data cleaning & presentation project for a client. Can you deliver by Monday? Budget ₹3,500."',
    priority: 30,
    cooldownDays: 10,
    choices: [
      {
        id: 'accept-freelance',
        label: 'Take the Contract (+₹3,500)',
        emoji: '🚀',
        preview: [
          { text: '+₹3,500', type: 'positive' },
          { text: '-20 Energy', type: 'negative' },
          { text: '+10 Stress', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money += 3500;
          state.player.taxes.incomeThisCycle += 3500;
          state.player.health.energy = Math.max(0, state.player.health.energy - 20);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 10);
          return {
            outcomeText: 'You burnt the midnight oil and shipped clean deliverables. Client wired ₹3,500 instantly with 5-star praise!',
            moneyDelta: 3500,
            energyDelta: -20,
            stressDelta: 10
          };
        }
      },
      {
        id: 'pass-freelance',
        label: 'Pass (Protect Weekend)',
        emoji: '🧘',
        preview: [
          { text: 'Keep free time', type: 'positive' },
          { text: '+10 Mental', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.min(100, state.player.health.mental + 10);
          return {
            outcomeText: 'You politely declined and spent the weekend relaxing and recharging your batteries.',
            mentalDelta: 10
          };
        }
      }
    ]
  },
  {
    id: 'opp-neighbor-bicycle',
    category: 'opportunity',
    title: 'Moving Neighbor: Bicycle Deal',
    emoji: '🚲',
    narrative: 'Your apartment neighbor is relocating to Bangalore and selling their lightly-used 21-speed commuter bicycle for just ₹3,000 (Store price is ₹5,000).',
    priority: 35,
    cooldownDays: 30,
    condition: (state) => !state.player.lifestyleAssets.some(a => a.id === 'bicycle') && state.player.lifestyle.transportMode === 'walk',
    choices: [
      {
        id: 'buy-deal-bicycle',
        label: 'Buy Bicycle for ₹3,000',
        emoji: '🚲',
        preview: [
          { text: '-₹3,000 (Save ₹2k)', type: 'positive' },
          { text: 'Unlocks Bicycle Commute', type: 'positive' },
          { text: '+Fitness Daily', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 3000,
        disabledReason: 'Need ₹3,000 cash',
        onSelect: (state) => {
          state.player.money -= 3000;
          state.player.lifestyleAssets.push({
            id: 'bicycle',
            purchasePrice: 3000,
            currentValue: 4000,
            purchasedOnDay: state.player.currentDay,
            monthlyMaintenance: 0
          });
          state.player.lifestyle.transportMode = 'bicycle';
          return {
            outcomeText: 'Deal sealed! You now pedal to work through the morning breeze — zero bus fare and great daily cardio.',
            moneyDelta: -3000
          };
        }
      },
      {
        id: 'skip-bicycle-deal',
        label: 'Pass (Keep Walking)',
        emoji: '🚶',
        preview: [
          { text: 'Keep ₹3,000 cash', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You wished your neighbor safe travels and decided to keep your liquid cash intact.'
          };
        }
      }
    ]
  },
  {
    id: 'opp-used-laptop',
    category: 'opportunity',
    title: 'Company Refurbished Laptop Deal',
    emoji: '💻',
    narrative: 'Your IT department is liquidating high-performance ThinkPad laptops after a company-wide upgrade: ₹35,000 for a machine that retailed at ₹60,000!',
    priority: 35,
    cooldownDays: 45,
    condition: (state) => !state.player.lifestyleAssets.some(a => a.id === 'laptop'),
    choices: [
      {
        id: 'buy-refurb-laptop',
        label: 'Grab Laptop (₹35,000)',
        emoji: '⚡',
        preview: [
          { text: '-₹35,000', type: 'negative' },
          { text: '2x Side Hustle Earnings', type: 'positive' },
          { text: 'Unlock Tech Gigs', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 35000,
        disabledReason: 'Need ₹35,000 cash',
        onSelect: (state) => {
          state.player.money -= 35000;
          state.player.lifestyleAssets.push({
            id: 'laptop',
            purchasePrice: 35000,
            currentValue: 45000,
            purchasedOnDay: state.player.currentDay,
            monthlyMaintenance: 0
          });
          return {
            outcomeText: 'Unboxed a powerhouse workstation! Your rendering and code compilation speeds are 4x faster.',
            moneyDelta: -35000
          };
        }
      },
      {
        id: 'skip-laptop',
        label: 'Too Expensive Right Now',
        emoji: '🚫',
        preview: [
          { text: 'Save capital', type: 'neutral' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You passed on the deal to keep your emergency fund safe.'
          };
        }
      }
    ]
  },
  {
    id: 'opp-skill-workshop',
    category: 'opportunity',
    title: 'Weekend Financial Analytics Workshop',
    emoji: '📊',
    narrative: 'A renowned portfolio manager is hosting a 2-day intensive financial modeling bootcamp downtown.',
    priority: 28,
    cooldownDays: 20,
    choices: [
      {
        id: 'attend-workshop',
        label: 'Enroll in Bootcamp (₹2,500)',
        emoji: '🎓',
        preview: [
          { text: '-₹2,500', type: 'negative' },
          { text: '+30% Course Credit', type: 'positive' },
          { text: '+15 Mental', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 2500,
        disabledReason: 'Need ₹2,500 cash',
        onSelect: (state) => {
          state.player.money -= 2500;
          const currentProg = state.player.educationProgress['financial-modeling'] || 0;
          state.player.educationProgress['financial-modeling'] = Math.min(100, currentProg + 35);
          state.player.health.mental = Math.min(100, state.player.health.mental + 15);
          return {
            outcomeText: 'Mind blown! You mastered discounted cash flows and LBO models. Your resume is getting stronger.',
            moneyDelta: -2500,
            mentalDelta: 15
          };
        }
      },
      {
        id: 'watch-free-youtube',
        label: 'Watch Free YouTube Tutorials',
        emoji: '📺',
        preview: [
          { text: '₹0 spent', type: 'positive' },
          { text: '+10% Course Credit', type: 'positive' }
        ],
        onSelect: (state) => {
          const currentProg = state.player.educationProgress['financial-modeling'] || 0;
          state.player.educationProgress['financial-modeling'] = Math.min(100, currentProg + 10);
          return {
            outcomeText: 'You watched free tutorials between ads. Useful basics, though you got distracted by cat videos.'
          };
        }
      }
    ]
  }
];
