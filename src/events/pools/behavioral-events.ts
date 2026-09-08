import { EventCardDef } from '../event-types';
import { GameState, BehavioralCounters } from '../../types/game';

export function adjustBehavioralCounter(
  state: GameState,
  counter: keyof BehavioralCounters,
  delta: number
): number {
  if (!state.player.behavioralCounters) {
    state.player.behavioralCounters = {
      impulseBuyCounter: 1.5,
      junkFoodCounter: 1.5,
      gymSkipCounter: 1.5,
      sleepDebtCounter: 1.5,
      cryptoFomoCounter: 1.0,
      lifestyleCreepCounter: 1.0,
      lateNightWorkCounter: 1.0
    };
  }
  const current = state.player.behavioralCounters[counter];
  // Counters NEVER drop below 1.0, max 10.0
  const newVal = Math.max(1.0, Math.min(10.0, Math.round((current + delta) * 10) / 10));
  state.player.behavioralCounters[counter] = newVal;
  return newVal;
}

export const BEHAVIORAL_EVENTS: EventCardDef[] = [
  // [BEH-001] The Midnight Electronics Flash Sale
  {
    id: 'beh-001-flash-sale',
    category: 'dilemma',
    title: 'Midnight Flash Sale Temptation',
    emoji: '🖥️',
    narrative: 'An e-commerce push notification buzzes: "Flash Deal Ends in 45 Minutes: 4K OLED Gaming Monitor marked down 40% to $620!" You don\'t technically need it, but the discount looks irresistible.',
    priority: 65,
    cooldownDays: 14,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      return (b?.impulseBuyCounter ?? 1.5) >= 3.0 && state.player.money >= 620;
    },
    choices: [
      {
        id: 'buy-monitor',
        label: 'Buy Before Countdown Timer Hits Zero (-$620)',
        emoji: '💳',
        preview: [
          { text: '-$620 Cash', type: 'negative' },
          { text: '+8 Happiness (instant hit)', type: 'positive' },
          { text: '+2.0 Impulse Counter (future deals flood feed)', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money -= 620;
          state.player.stats.happiness = Math.min(100, state.player.stats.happiness + 8);
          adjustBehavioralCounter(state, 'impulseBuyCounter', 2.0);
          return {
            outcomeText: 'You bought the monitor. High dopamine for 3 days, but retail temptation is now compounding.',
            moneyDelta: -620
          };
        }
      },
      {
        id: 'close-browser',
        label: 'Close the Browser and Step Away',
        emoji: '🛡️',
        preview: [
          { text: '$0 spent', type: 'positive' },
          { text: '-1.0 Impulse Counter (Discipline!)', type: 'positive' },
          { text: '+3 Mental Resilience', type: 'positive' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'impulseBuyCounter', -1.0);
          state.player.health.mental = Math.min(100, state.player.health.mental + 3);
          return {
            outcomeText: 'You closed the tab. Discipline strengthened! Impulse counter dropped.'
          };
        }
      }
    ]
  },

  // [BEH-002] The Rainy Evening Food Delivery Impulse
  {
    id: 'beh-002-food-delivery',
    category: 'daily',
    title: 'Rainy Night Delivery Seduction',
    emoji: '🍔',
    narrative: 'It is raining cold outside. You planned to boil pasta and make a fresh salad, but the food app flashes an artisan double-bacon smash burger with loaded fries ($32 delivered).',
    priority: 55,
    cooldownDays: 10,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      return (b?.junkFoodCounter ?? 1.5) >= 2.5 && state.player.money >= 32;
    },
    choices: [
      {
        id: 'order-burger',
        label: 'Order the Decadent Feast (-$32)',
        emoji: '🛵',
        preview: [
          { text: '-$32 Cash', type: 'negative' },
          { text: 'Saves 45 min cooking', type: 'positive' },
          { text: '+1.5 Junk Food Counter', type: 'negative' },
          { text: '-1.0% Physical Health', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money -= 32;
          adjustBehavioralCounter(state, 'junkFoodCounter', 1.5);
          state.player.health.physical = Math.max(0, state.player.health.physical - 1.0);
          return {
            outcomeText: 'Delicious comfort food, but sodium and lethargy set in. Junk food habit reinforced.',
            moneyDelta: -32
          };
        }
      },
      {
        id: 'cook-meal',
        label: 'Stick to Your Home-Cooked Meal',
        emoji: '🥗',
        preview: [
          { text: '$0 extra spent', type: 'positive' },
          { text: '-0.5 Junk Food Counter', type: 'positive' },
          { text: '+0.5% Physical Health', type: 'positive' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'junkFoodCounter', -0.5);
          state.player.health.physical = Math.min(100, state.player.health.physical + 0.5);
          return {
            outcomeText: 'You cooked at home! Clean nutrition, zero food waste, and your discipline holds firm.'
          };
        }
      }
    ]
  },

  // [BEH-003] The "Too Tired to Lift" Gym Barrier
  {
    id: 'beh-003-gym-inertia',
    category: 'health',
    title: 'The Gym Inertia Trap',
    emoji: '🛋️',
    narrative: 'Your workday was mentally draining. Your gym bag is packed, but your couch looks infinitely welcoming. "One missed session won\'t hurt, right?"',
    priority: 60,
    cooldownDays: 8,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      return (b?.gymSkipCounter ?? 1.5) >= 2.5 || state.player.health.energy <= 60;
    },
    choices: [
      {
        id: 'skip-gym',
        label: 'Skip Gym & Sink into the Couch',
        emoji: '🛌',
        preview: [
          { text: 'Immediate comfort', type: 'neutral' },
          { text: '+1.5 Gym Skip Counter (harder next time)', type: 'negative' },
          { text: '-1.0% Physical Health', type: 'negative' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'gymSkipCounter', 1.5);
          state.player.health.physical = Math.max(0, state.player.health.physical - 1.0);
          return {
            outcomeText: 'You skipped workout. The inertia monster grows stronger, making next time twice as hard.'
          };
        }
      },
      {
        id: 'go-light',
        label: 'Show Up Anyway — Light 30m Session',
        emoji: '👟',
        preview: [
          { text: '-1.0 Gym Skip Counter (Chain Broken!)', type: 'positive' },
          { text: '+8% Energy Rebound', type: 'positive' },
          { text: '+5 Mental Resilience', type: 'positive' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'gymSkipCounter', -1.0);
          state.player.health.energy = Math.min(100, state.player.health.energy + 8);
          state.player.health.mental = Math.min(100, state.player.health.mental + 5);
          if (state.player.lifeGoalStats) {
            state.player.lifeGoalStats.totalGymSessions += 1;
          }
          return {
            outcomeText: 'Victory over lethargy! You showed up, got endorphins pumping, and broke the skip cascade.'
          };
        }
      }
    ]
  },

  // [BEH-004] Streaming Binge vs. The 8-Hour Sleep Rule
  {
    id: 'beh-004-sleep-binge',
    category: 'daily',
    title: 'Late Night Streaming Binge Trap',
    emoji: '📺',
    narrative: 'The thrilling cliffhanger of your suspense series just ended. Episode next is autoplaying in 5 seconds. Your alarm is set for 6:45 AM.',
    priority: 58,
    cooldownDays: 9,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      return (b?.sleepDebtCounter ?? 1.5) >= 2.0;
    },
    choices: [
      {
        id: 'watch-more',
        label: 'Watch "Just One More Episode" (Sleep: 5.2h)',
        emoji: '🍿',
        preview: [
          { text: '+2.0 Sleep Debt Counter', type: 'negative' },
          { text: 'Tomorrow Energy capped at 45%', type: 'negative' },
          { text: 'Brain fog & sugar craving risk', type: 'negative' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'sleepDebtCounter', 2.0);
          state.player.health.energy = Math.max(20, state.player.health.energy - 25);
          return {
            outcomeText: 'You went to bed at 1:45 AM. Exhausted morning ahead; work performance vulnerable.'
          };
        }
      },
      {
        id: 'sleep-now',
        label: 'Shut Off Screen Immediately & Sleep (7.5h)',
        emoji: '😴',
        preview: [
          { text: '-0.5 Sleep Debt Counter', type: 'positive' },
          { text: 'Wake up with 90% Energy', type: 'positive' },
          { text: '+3 Mental Clarity', type: 'positive' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'sleepDebtCounter', -0.5);
          state.player.health.energy = Math.min(100, state.player.health.energy + 15);
          state.player.health.mental = Math.min(100, state.player.health.mental + 3);
          return {
            outcomeText: 'Solid 8 hours of restorative sleep! You wake up energized, focused, and alert.'
          };
        }
      }
    ]
  },

  // [BEH-005] Promotion Lifestyle Creep: The Luxury Vehicle Seduction
  {
    id: 'beh-005-lifestyle-creep',
    category: 'opportunity',
    title: 'Lifestyle Creep: Luxury Lease Seduction',
    emoji: '🚘',
    narrative: 'Peers in your professional circle drive premium European cars. A dealer sends you a pre-approved executive car lease: "$550/mo with zero down payment."',
    priority: 62,
    cooldownDays: 60,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      return (b?.lifestyleCreepCounter ?? 1.0) >= 2.5 && state.player.job.salaryPerCycle >= 3000;
    },
    choices: [
      {
        id: 'sign-lease',
        label: 'Sign the Executive Lease ($550/mo commitment)',
        emoji: '✍️',
        preview: [
          { text: '+$550/mo permanent overhead', type: 'negative' },
          { text: '+15 Short-term Status / Happiness', type: 'positive' },
          { text: '+2.0 Lifestyle Creep Counter', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.loans.push({
            id: `lease-car-${Date.now()}`,
            name: 'Luxury Sedan Lease',
            type: 'vehicle',
            principalRemaining: 19800,
            interestRate: 0.08,
            emiAmount: 550,
            cycleDays: 30,
            lastPaidDay: state.player.currentDay,
            missedPayments: 0
          });
          state.player.stats.happiness = Math.min(100, state.player.stats.happiness + 15);
          adjustBehavioralCounter(state, 'lifestyleCreepCounter', 2.0);
          return {
            outcomeText: 'You took the lease. Flashy entrance at work, but your savings rate took a heavy blow.'
          };
        }
      },
      {
        id: 'decline-lease',
        label: 'Pass: Keep Driving Your Paid-Off Commuter',
        emoji: '🛡️',
        preview: [
          { text: 'Preserves $550/mo for investing', type: 'positive' },
          { text: '-1.0 Lifestyle Creep Counter', type: 'positive' },
          { text: 'Accelerates Net Worth compounding', type: 'positive' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'lifestyleCreepCounter', -1.0);
          return {
            outcomeText: 'Wise move. Avoiding lifestyle inflation keeps your savings rate elite and resilient.'
          };
        }
      }
    ]
  },

  // [BEH-006] The Weekend Bar Crawl Peer Pressure
  {
    id: 'beh-006-bar-crawl',
    category: 'daily',
    title: 'Weekend Social Pressure & Bar Crawl',
    emoji: '🍸',
    narrative: 'Your friend circle is heading downtown to a chic rooftop cocktail lounge where artisanal drinks run $22 each. "Come out! Don\'t be a workaholic recluse."',
    priority: 52,
    cooldownDays: 14,
    condition: (state) => state.player.money >= 35,
    choices: [
      {
        id: 'go-all-out',
        label: 'Go All Out: Buy Rounds of Drinks (-$240)',
        emoji: '🥂',
        preview: [
          { text: '-$240 Cash', type: 'negative' },
          { text: '+15 Social Happiness', type: 'positive' },
          { text: '+1.5 Impulse Counter', type: 'negative' },
          { text: '-20% Energy next morning (Hangover)', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money -= 240;
          state.player.stats.happiness = Math.min(100, state.player.stats.happiness + 15);
          adjustBehavioralCounter(state, 'impulseBuyCounter', 1.5);
          state.player.health.energy = Math.max(10, state.player.health.energy - 20);
          return {
            outcomeText: 'Wild night out! High social bonding, but a hefty bar bill and a rough Saturday morning.',
            moneyDelta: -240
          };
        }
      },
      {
        id: 'moderate',
        label: 'Go for 1 Drink then Switch to Club Soda (-$35)',
        emoji: '🍋',
        preview: [
          { text: '-$35 Cash (Moderate)', type: 'neutral' },
          { text: '+10 Social Happiness', type: 'positive' },
          { text: 'Wake up refreshed with clear head', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.money -= 35;
          state.player.stats.happiness = Math.min(100, state.player.stats.happiness + 10);
          return {
            outcomeText: 'Masterclass in social balance: you caught up with friends, had fun, and kept your wallet and sleep intact.',
            moneyDelta: -35
          };
        }
      },
      {
        id: 'stay-home',
        label: 'Politely Decline & Stay Home ($0)',
        emoji: '🏠',
        preview: [
          { text: '$0 spent', type: 'positive' },
          { text: '-5 Social FOMO (Mild loneliness)', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.stats.happiness = Math.max(0, state.player.stats.happiness - 5);
          return {
            outcomeText: 'Quiet night in. Zero cash spent, though a little FOMO lingered while checking group chats.'
          };
        }
      }
    ]
  },

  // [BEH-007] The Revenge Trading Temptation
  {
    id: 'beh-007-revenge-trade',
    category: 'opportunity',
    title: 'Speculative Revenge Trading Urge',
    emoji: '🎰',
    narrative: 'A volatile speculative token dropped 18% in your feed. An anxious voice whispers: "If you double down with leverage right now, you can claw back all your losses by morning."',
    priority: 66,
    cooldownDays: 20,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      return (b?.cryptoFomoCounter ?? 1.0) >= 3.0 && state.player.money >= 1000;
    },
    choices: [
      {
        id: 'take-gamble',
        label: 'Take Leveraged Revenge Bet ($1,000)',
        emoji: '🎲',
        preview: [
          { text: '25% chance to win +$1,500', type: 'positive' },
          { text: '75% chance to lose -$1,000 completely', type: 'negative' },
          { text: 'Crypto FOMO Counter surges to 7.5', type: 'negative' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'cryptoFomoCounter', 2.5);
          const win = Math.random() < 0.25;
          if (win) {
            state.player.money += 1500;
            return {
              outcomeText: 'Pure luck: the token bounced! You won +$1,500, but the dangerous gambling itch grew even deeper.',
              moneyDelta: 1500
            };
          } else {
            state.player.money -= 1000;
            state.player.health.mental = Math.max(0, state.player.health.mental - 15);
            return {
              outcomeText: 'Liquidated! You lost $1,000 on leverage. Emotional tilt and financial sting.',
              moneyDelta: -1000
            };
          }
        }
      },
      {
        id: 'step-away-trade',
        label: 'Close Trading App & Go for a Walk',
        emoji: '🚶',
        preview: [
          { text: 'Zero money lost', type: 'positive' },
          { text: '-1.5 Crypto FOMO Counter', type: 'positive' },
          { text: '+10 Emotional Discipline', type: 'positive' }
        ],
        onSelect: (state) => {
          adjustBehavioralCounter(state, 'cryptoFomoCounter', -1.5);
          state.player.health.mental = Math.min(100, state.player.health.mental + 8);
          return {
            outcomeText: 'You shut down the trading screen and walked outside. You stopped the spiral before it started.'
          };
        }
      }
    ]
  },

  // [BEH-008] The Habit Inoculation Milestone: 30-Day Clean Streak
  {
    id: 'beh-008-discipline-milestone',
    category: 'milestone',
    title: '🧘 Habit Inoculation: Mindful Discipline',
    emoji: '🏆',
    narrative: 'Behavioral Breakthrough: Your consistency and boundary-setting have decoupled you from consumerist panic and toxic cycles. You feel in command of both your calendar and capital.',
    priority: 85,
    once: true,
    condition: (state) => {
      const b = state.player.behavioralCounters;
      if (!b) return false;
      return (
        b.impulseBuyCounter <= 2.2 &&
        b.junkFoodCounter <= 2.2 &&
        b.gymSkipCounter <= 2.2 &&
        b.sleepDebtCounter <= 2.2 &&
        state.player.currentDay >= 30
      );
    },
    choices: [
      {
        id: 'claim-milestone',
        label: 'Embrace the Grounded Baseline',
        emoji: '✨',
        preview: [
          { text: '+15 Mental Resilience', type: 'positive' },
          { text: '+10 General Happiness', type: 'positive' },
          { text: 'Unlocks "Mindful Discipline" badge', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.min(100, state.player.health.mental + 15);
          state.player.stats.happiness = Math.min(100, state.player.stats.happiness + 10);
          if (!state.player.achievements.includes('mindful-discipline')) {
            state.player.achievements.push('mindful-discipline');
          }
          return {
            outcomeText: 'Discipline is freedom. Your habits now act as armor protecting your future wealth.'
          };
        }
      }
    ]
  }
];
