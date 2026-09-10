import { GameState } from '../types/game';
import { COMPANIES } from './jobs';

export function createInitialState(): GameState {
  return {
    player: {
      name: 'Alex Morgan',
      startingAge: 22,
      currentAge: 22,
      currentDay: 1,
      currentMonth: 1,
      currentYear: 1,
      onboardingComplete: false,
      gameOver: false,
      lifeGoals: {
        wealthGoalId: 'six-figure-net-worth',
        healthGoalId: 'olympic-resilience',
        lifestyleGoalId: 'homeowner-pride'
      }
    },

    resources: {
      physicalHealth: 85,
      mentalHealth: 85,
      energy: 85,

      cashOnHand: 2200,
      emergencyFund: 1800,
      creditScore: 715,
      annualTaxPaid: 0,
      currentYearTaxableIncome: 0,
      taxEscrowAccount: 0,

      dailySchedule: {
        sleepHours: 7.5,
        workHours: 8.0,
        commuteHours: 1.0,
        gymHours: 1.0,
        mealDisciplineHours: 1.0,
        studySideHustleHours: 1.5,
        leisureHours: 4.0
      }
    },

    career: {
      currentJob: {
        id: 'junior-analyst',
        title: 'Junior Financial Analyst',
        company: COMPANIES[1], // Acuity Global Logistics
        salaryMonthly: 1800,
        stressMonthly: 12,
        monthsInRole: 0,
        performanceRating: 4,
        consecutiveLowReviews: 0
      },
      completedCourseIds: [],
      activeCourse: null,
      yearsOfExperience: 0.1,
      unemploymentMonths: 0,
      consecutiveEmploymentMonths: 1,
      activeJobApplications: []
    },

    investments: {
      stocksOwned: {
        'ORFOOD': { shares: 5, averageCost: 120 }
      },
      cryptoOwned: {},
      sipMonthlyAllocations: {
        'fund-broad': 150
      },
      mutualFundUnits: {
        'fund-broad': { units: 1.5, investedAmount: 150 }
      },
      fixedDeposits: [],
      realizedShortTermGains: 0,
      realizedLongTermGains: 0
    },

    business: {
      activeBusinesses: [],
      totalVentureEarnings: 0
    },

    property: {
      isRenting: true,
      rentalTier: 'studio',
      currentMonthlyRent: 380,
      ownedProperties: []
    },

    liabilities: {
      loans: [
        {
          id: 'student-loan',
          name: 'Federal Student Education Loan',
          principal: 6000,
          balance: 4800,
          annualInterestRate: 0.05,
          monthlyEMI: 120,
          remainingMonths: 44
        }
      ]
    },

    insurance: {
      healthInsuranceTier: 'basic',
      hasVehicleInsurance: false,
      hasTermLifeInsurance: false,
      hasPropertyInsurance: false
    },

    behavioral: {
      impulseBuyCounter: 1.5,
      junkFoodCounter: 1.5,
      gymSkipCounter: 1.0,
      sleepDebtCounter: 1.0,
      cryptoFomoCounter: 1.0,
      lifestyleCreepCounter: 1.0,
      lateNightWorkCounter: 1.0
    },

    simulation: {
      isPaused: true,
      simulationSpeed: 1,
      macroPhase: 'BULL_RUN',
      autoRunMonthlyBlueprint: false,
      activeEventCards: [],
      recentLogs: [
        {
          day: 1,
          message: 'Welcome to your adult decade! Starting Age 22. Your choices will compound over the next 10 years.',
          type: 'info'
        }
      ],
      milestonesAchieved: [],
      emergencyFundSpiralActive: false,
      burnoutEpisodeCount: 0,
      lifetimeGymSessions: 12,
      hospitalizationCount: 0
    }
  };
}
