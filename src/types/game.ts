export type ResourceBar = number; // 0 to 100

export type JobRung = 1 | 2 | 3 | 4 | 5;

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  cultureStars: number; // 1 to 5
  overtimeFrequency: number; // 0.0 to 1.0 probability
  growthOpportunity: number; // 0.0 to 1.0 chance at appraisal
  layoffRisk: number; // 0.0 to 1.0
  vacationDays: number; // 5 to 30
}

export interface JobDefinition {
  id: string;
  title: string;
  rung: JobRung;
  salaryMonthly: number;
  stressMonthly: number;
  cultureStars: number;
  requiredExpYears: number;
  requiredCourseIds: string[];
}

export interface ActiveJob {
  id: string;
  title: string;
  company: CompanyProfile;
  salaryMonthly: number;
  stressMonthly: number;
  monthsInRole: number;
  performanceRating: number; // 1 to 5
  consecutiveLowReviews: number;
}

export interface Course {
  id: string;
  title: string;
  category: 'finance' | 'tech' | 'marketing' | 'management';
  cost: number;
  durationMonths: number;
  description: string;
  unlocksRungs: JobRung[];
}

export interface StockTicker {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  currentPrice: number;
  volatility: number;
  dividendYield: number; // e.g. 0.025 for 2.5%
  priceHistory: number[];
}

export interface CryptoToken {
  symbol: string;
  name: string;
  currentPrice: number;
  volatility: number;
  priceHistory: number[];
}

export interface MutualFund {
  id: string;
  name: string;
  category: 'broad' | 'growth' | 'balanced';
  expenseRatio: number;
  expectedAnnualReturn: number;
  riskTier: 'low' | 'medium' | 'high';
  currentNAV: number;
}

export interface FixedDeposit {
  id: string;
  principal: number;
  interestRate: number; // annual
  startMonth: number;
  durationMonths: number; // 6, 12, or 36
}

export interface BusinessType {
  id: string;
  name: string;
  startupCost: number;
  monthlyOpsCost: number;
  minRevenue: number;
  maxRevenue: number;
  timeSlots: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  prerequisiteCourseId?: string;
}

export interface ActiveBusiness {
  id: string;
  typeId: string;
  name: string;
  stage: 'PLANNING' | 'SIDE_HUSTLE' | 'FULL_TIME';
  currentMonthlyRevenue: number;
  currentMonthlyOpsCost: number;
  timeSlots: number;
  scaleLevel: number; // 1 to 5
  totalProfitGenerated: number;
  employeesCount: number;
}

export type RentalTierId = 'shared' | 'studio' | '1bhk' | '2bhk';

export interface RentalTier {
  id: RentalTierId;
  name: string;
  monthlyCostYear1: number;
  commuteHoursDaily: number;
  mentalHealthImpact: number; // e.g. -5 for shared
}

export interface Property {
  id: string;
  name: string;
  type: 'home' | 'rental';
  purchasePrice: number;
  currentValue: number;
  mortgageBalance: number;
  monthlyEMI: number;
  downPayment: number;
  isInsured: boolean;
  tenantMonthlyRent: number; // 0 if personal home
  isVacant: boolean;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  balance: number;
  annualInterestRate: number;
  monthlyEMI: number;
  remainingMonths: number;
}

export interface DailySchedule {
  sleepHours: number;      // 5 to 9 (default: 7.5)
  workHours: number;       // usually 8
  commuteHours: number;    // 0 to 2.5
  gymHours: number;        // 0 to 2 (default: 1)
  mealDisciplineHours: number; // 0 to 1.5
  studySideHustleHours: number; // 0 to 4
  leisureHours: number;    // remainder to make exactly 24
}

export interface HabitCounters {
  impulseBuyCounter: number;    // scale 1.0 to 10.0
  junkFoodCounter: number;      // scale 1.0 to 10.0
  gymSkipCounter: number;       // scale 1.0 to 10.0
  sleepDebtCounter: number;      // scale 1.0 to 10.0
  cryptoFomoCounter: number;    // scale 1.0 to 10.0
  lifestyleCreepCounter: number;// scale 1.0 to 10.0
  lateNightWorkCounter: number; // scale 1.0 to 10.0
}

export interface LifeGoals {
  wealthGoalId: string;
  healthGoalId: string;
  lifestyleGoalId: string;
}

export interface LifeGoalDefinition {
  id: string;
  category: 'wealth' | 'health' | 'lifestyle';
  title: string;
  targetDescription: string;
  checkCompletion: (state: GameState) => boolean;
  getProgressPct: (state: GameState) => number;
}

export type MacroEconomyPhase = 'BULL_RUN' | 'PEAK' | 'RECESSION' | 'RECOVERY' | 'SUPER_BULL';

export interface GameState {
  player: {
    name: string;
    startingAge: number;
    currentAge: number;
    currentDay: number; // 1 to 3650 (365 days / 12 months = 30 days/month)
    currentMonth: number; // 1 to 120
    currentYear: number; // 1 to 10
    onboardingComplete: boolean;
    gameOver: boolean;
    lifeGoals: LifeGoals;
  };

  resources: {
    // Health (0 - 100)
    physicalHealth: ResourceBar;
    mentalHealth: ResourceBar;
    energy: ResourceBar;

    // Money
    cashOnHand: number;
    emergencyFund: number; // High Yield Savings Account (3.5% APY)
    creditScore: number;   // 350 to 850
    annualTaxPaid: number;
    currentYearTaxableIncome: number;
    taxEscrowAccount: number;

    // Daily Time Budget (sum must equal 24)
    dailySchedule: DailySchedule;
  };

  career: {
    currentJob: ActiveJob | null;
    completedCourseIds: string[];
    activeCourse: { courseId: string; monthsRemaining: number } | null;
    yearsOfExperience: number;
    unemploymentMonths: number;
    consecutiveEmploymentMonths: number;
    activeJobApplications: { jobId: string; daysRemaining: number }[];
  };

  investments: {
    stocksOwned: Record<string, { shares: number; averageCost: number }>;
    cryptoOwned: Record<string, { units: number; averageCost: number }>;
    sipMonthlyAllocations: Record<string, number>; // fundId -> monthly $
    mutualFundUnits: Record<string, { units: number; investedAmount: number }>;
    fixedDeposits: FixedDeposit[];
    realizedShortTermGains: number;
    realizedLongTermGains: number;
  };

  business: {
    activeBusinesses: ActiveBusiness[];
    totalVentureEarnings: number;
  };

  property: {
    isRenting: boolean;
    rentalTier: RentalTierId;
    currentMonthlyRent: number;
    ownedProperties: Property[];
  };

  liabilities: {
    loans: Loan[];
  };

  insurance: {
    healthInsuranceTier: 'none' | 'basic' | 'standard' | 'premium';
    hasVehicleInsurance: boolean;
    hasTermLifeInsurance: boolean;
    hasPropertyInsurance: boolean;
  };

  behavioral: HabitCounters;

  simulation: {
    isPaused: boolean;
    simulationSpeed: 1 | 2 | 4; // 1x, 2x, 4x
    macroPhase: MacroEconomyPhase;
    autoRunMonthlyBlueprint: boolean;
    activeEventCards: ScenarioCard[];
    recentLogs: { day: number; message: string; type: 'info' | 'positive' | 'warning' | 'negative' }[];
    milestonesAchieved: string[];
    emergencyFundSpiralActive: boolean;
    burnoutEpisodeCount: number;
    lifetimeGymSessions: number;
    hospitalizationCount: number;
  };
}

export interface ScenarioChoice {
  id: string;
  label: string;
  description: string;
  immediateImpactPreview: string;
  apply: (state: GameState) => { outcomeText: string; notificationType: 'info' | 'positive' | 'warning' | 'negative' };
}

export interface ScenarioCard {
  id: string;
  category: 'career' | 'financial' | 'health' | 'market' | 'life' | 'business' | 'property' | 'behavioral' | 'emergency';
  title: string;
  description: string;
  condition?: (state: GameState) => boolean;
  choices: ScenarioChoice[];
}
