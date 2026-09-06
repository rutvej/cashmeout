import { EventCardDef } from '../event-types';

export const MILESTONE_EVENTS: EventCardDef[] = [
  {
    id: 'milestone-day-1-welcome',
    category: 'milestone',
    title: 'Welcome to the City!',
    emoji: '🏙️',
    narrative: 'You have just stepped off the train with your suitcase and ₹15,000 in your pocket. Rent is ₹800/month, and you have started as a Junior Analyst earning ₹2,800 every 15 days. Your journey to financial independence begins today!',
    priority: 100,
    once: true,
    condition: (state) => state.player.currentDay === 1,
    choices: [
      {
        id: 'start-journey',
        label: 'Let\'s Build Wealth! 🚀',
        emoji: '💼',
        preview: [
          { text: 'Start Day 1', type: 'positive' }
        ],
        onSelect: () => {
          return {
            outcomeText: 'You set your bags down, take a deep breath, and get ready to conquer the city!'
          };
        }
      }
    ]
  },
  {
    id: 'milestone-first-paycheck',
    category: 'milestone',
    title: '🎉 First Paycheck Deposited!',
    emoji: '💰',
    narrative: 'Your phone buzzes: "Salary of ₹2,800 credited to your account." You survived your first 15 days in the corporate grind! What is your financial plan with this income?',
    priority: 90,
    once: true,
    condition: (state) => state.player.currentDay >= 15,
    choices: [
      {
        id: 'save-half-paycheck',
        label: 'Save ₹1,000 into Bank Account',
        emoji: '🏦',
        preview: [
          { text: 'Deposit ₹1,000', type: 'positive' },
          { text: '+15 Financial Discipline', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 1000,
        disabledReason: 'Need ₹1,000 in wallet',
        onSelect: (state) => {
          state.player.money -= 1000;
          state.player.savingsBalance += 1000;
          state.player.health.mental = Math.min(100, state.player.health.mental + 10);
          return {
            outcomeText: 'You paid yourself first! ₹1,000 safely tucked away earning compound interest.',
            moneyDelta: -1000,
            mentalDelta: 10
          };
        }
      },
      {
        id: 'celebrate-paycheck',
        label: 'Celebrate with Pizza & Treat (+25 Mental)',
        emoji: '🍕',
        preview: [
          { text: '-₹500', type: 'neutral' },
          { text: '+25 Mental Health', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 500,
        disabledReason: 'Need ₹500 cash',
        onSelect: (state) => {
          state.player.money -= 500;
          state.player.health.mental = Math.min(100, state.player.health.mental + 25);
          return {
            outcomeText: 'A celebratory feast! You worked hard for this money, and the celebration was well-deserved.',
            moneyDelta: -500,
            mentalDelta: 25
          };
        }
      }
    ]
  },
  {
    id: 'milestone-day-30-veteran',
    category: 'milestone',
    title: '🏆 30 Days in the City: 1 Month Milestone!',
    emoji: '📅',
    narrative: 'One full month of independence! You navigated rent, food choices, job stress, and commute traffic. You are no longer a newcomer — you are a city survivor!',
    priority: 88,
    once: true,
    condition: (state) => state.player.currentDay >= 30,
    choices: [
      {
        id: 'review-month-1',
        label: 'Celebrate One Month Milestone! 🌟',
        emoji: '🎉',
        preview: [
          { text: '+20 Mental Health', type: 'positive' },
          { text: '-10 Stress', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.min(100, state.player.health.mental + 20);
          state.player.stats.stress = Math.max(0, state.player.stats.stress - 10);
          return {
            outcomeText: 'You toasted to your first 30 days. The foundation of your financial empire is set!'
          };
        }
      }
    ]
  },
  {
    id: 'milestone-day-60-momentum',
    category: 'milestone',
    title: '⚡ 60 Days: The Power of Compounding!',
    emoji: '📈',
    narrative: 'Two months in! Your routine is honed. Daily interest from savings and market dividends are starting to cover recurring bills. The rat race is getting easier.',
    priority: 89,
    once: true,
    condition: (state) => state.player.currentDay >= 60,
    choices: [
      {
        id: 'compound-surge',
        label: 'Keep Eyes on the Prize! 🎯',
        emoji: '🔥',
        preview: [
          { text: '+25 Mental Confidence', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = Math.min(100, state.player.health.mental + 25);
          return {
            outcomeText: 'Discipline is freedom. Your assets work 24/7 so you do not have to!'
          };
        }
      }
    ]
  },
  {
    id: 'milestone-day-100-centurion',
    category: 'milestone',
    title: '👑 100 DAYS CENTURION: City Legend!',
    emoji: '🏛️',
    narrative: 'A monumental milestone: 100 in-game days! You have withstood market cycles, unexpected repairs, job deadlines, and bodily fatigue. You are in complete control of your financial destiny.',
    priority: 95,
    once: true,
    condition: (state) => state.player.currentDay >= 100,
    choices: [
      {
        id: 'centurion-glory',
        label: 'Claim Centurion Status 🌟',
        emoji: '💎',
        preview: [
          { text: '+30 Mental Health', type: 'positive' },
          { text: 'Complete Inner Peace', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = 100;
          state.player.stats.stress = 0;
          return {
            outcomeText: '100 days of financial wisdom! You stand tall among the city\'s elite wealth builders.'
          };
        }
      }
    ]
  },
  {
    id: 'milestone-lakhpati',
    category: 'milestone',
    title: '🏆 LAKHPATI: ₹1,00,000 Liquid Wealth!',
    emoji: '👑',
    narrative: 'Incredible milestone! Your liquid net assets have officially crossed ₹1,00,000! You are now in the top tier of financial discipline and wealth accumulation.',
    priority: 96,
    once: true,
    condition: (state) => state.player.money + state.player.savingsBalance >= 100000,
    choices: [
      {
        id: 'lakhpati-glory',
        label: 'Aim for Half a Million! 🌟',
        emoji: '🚀',
        preview: [
          { text: '+30 Mental Health', type: 'positive' },
          { text: 'Confidence Surge', type: 'positive' }
        ],
        onSelect: (state) => {
          state.player.health.mental = 100;
          state.player.stats.stress = Math.max(0, state.player.stats.stress - 30);
          return {
            outcomeText: 'Your financial freedom index is through the roof! The rat race is beginning to lose its grip on you.',
            mentalDelta: 30,
            stressDelta: -30
          };
        }
      }
    ]
  }
];
