export type FoodTierId = 'street' | 'basic' | 'home-cooked' | 'restaurant';
export type TransportModeId = 'walk' | 'bicycle' | 'scooter' | 'car';

export interface Job {
  id: string;
  title: string;
  salaryPerCycle: number;
  payCycleDays: number;
  stressPerDay: number;
  timeSlotsCost: number;
  requirements?: {
    course?: string;
    minDays?: number;
    minNetWorth?: number;
  };
}

export interface Loan {
  id: string;
  name: string;
  type: 'personal' | 'vehicle' | 'mortgage' | 'business';
  principalRemaining: number;
  interestRate: number; // annual (e.g. 0.12)
  emiAmount: number;
  cycleDays: number;
  lastPaidDay: number;
  missedPayments: number;
}

export interface FixedDeposit {
  id: string;
  amount: number;
  interestRate: number; // annual
  startDay: number;
  maturityDay: number;
}

export interface SIP {
  id: string;
  tickerId: string;
  amountPerCycle: number;
  cycleDays: number;
  lastInvestedDay: number;
  active: boolean;
}

export interface InsurancePolicies {
  health: { tier: 'none' | 'basic' | 'standard' | 'premium'; premiumPerMonth: number; coveragePct: number };
  vehicle: { active: boolean; premiumPerMonth: number };
  property: { active: boolean; premiumPerMonth: number };
  life: { active: boolean; premiumPerMonth: number };
}

export interface OwnedAsset {
  id: string;
  purchasePrice: number;
  currentValue: number;
  purchasedOnDay: number;
  monthlyMaintenance: number;
}

export interface PortfolioEntry {
  shares: number;
  avgCost: number;
}

export interface OwnedProperty {
  id: string;
  purchasePrice: number;
  riskStatus: 'clear' | 'minor-dispute' | 'major-dispute';
  mortgage: Loan | null;
}

export interface OwnedBusiness {
  sectorId: string;
  slotId: string;
  startedDay: number;
  cashInvested: number;
}

export interface EventLogEntry {
  day: number;
  text: string;
  type: 'income' | 'expense' | 'investment' | 'event' | 'achievement';
}

export interface PlayerState {
  id: 'player';
  name: string;
  money: number;
  savingsBalance: number;
  currentDay: number;

  job: Job;
  housing: {
    type: 'rent' | 'own';
    amountPerCycle: number;
    cycleDays: number;
    lastPaidDay: number;
  };

  health: {
    physical: number; // 0-100
    mental: number;   // 0-100
    energy: number;   // 0-100
  };

  consequenceMeters: {
    cheapFoodDays: number;
    noExerciseDays: number;
    highStressDays: number;
    lowEnergyDays: number;
    noRestDays: number;
    unhealthyDays: number;
  };

  timeAllocation: {
    job: number;
    commute: number;
    exercise: number;
    cooking: number;
    sideHustle: number;
    education: number;
    rest: number;
    free: number;
  };

  lifestyle: {
    foodTier: FoodTierId;
    transportMode: TransportModeId;
  };

  loans: Loan[];
  fixedDeposits: FixedDeposit[];
  sips: SIP[];
  insurance: InsurancePolicies;

  taxes: {
    lastPaidDay: number;
    cycleDays: number;
    incomeThisCycle: number;
    capitalGainsThisCycle: number;
    dividendIncomeThisCycle: number;
  };

  portfolio: Record<string, PortfolioEntry>;
  goldHoldings: { grams: number; avgCostPerGram: number };

  properties: OwnedProperty[];
  businesses: OwnedBusiness[];
  lifestyleAssets: OwnedAsset[];

  family: {
    married: boolean;
    marriedOnDay: number | null;
    spouseIncome: number;
    children: number;
    childBornOnDays: number[];
  };

  stats: {
    stress: number;    // 0-100
    happiness: number; // 0-100
  };

  eventLog: EventLogEntry[];
  achievements: string[];
  educationProgress: Record<string, number>;
  activeCourseId: string | null;        // currently studying course
  lastActiveTimestamp: number;
}

export interface TickerDef {
  id: string;
  name: string;
  sector: 'consumer' | 'tech' | 'energy' | 'finance';
  price: number;
  trendBias: number;
  volatility: number;
  dividendYieldPct: number;
  dividendPerShare?: number;
  history: number[];
}

export interface PropertyDef {
  id: string;
  name: string;
  location: string;
  price: number;
  rentYieldPct: number;
  appreciationPct: number;
  owner: string | null; // 'player' | npcId | null
  riskProfile: {
    legalStatus: 'clear' | 'minor-dispute' | 'major-dispute';
    issueChancePct: number;
    issueCost: number;
  };
}

export interface BusinessSectorDef {
  id: string;
  name: string;
  capacity: number;
  startupCost: number;
  baseRevenuePerCycle: number;
  slotUpkeepPerCycle: number;
  revenueCycleDays: number;
  slots: { id: string; owner: string | null }[];
  specialMechanic?: 'lending';
}

export interface NpcState {
  id: string;
  name: string;
  archetype: 'aggressive-investor' | 'cautious-saver' | 'serial-entrepreneur' | 'landlord';
  money: number;
  portfolio: Record<string, PortfolioEntry>;
  properties: string[]; // property IDs
  businesses: { sectorId: string; slotId: string }[];
  loans: Loan[];
  decisionLog: { day: number; action: string; detail: string }[];
}

export interface MarketState {
  tickers: TickerDef[];
  goldPricePerGram: number;
  goldHistory: number[];
  cycleBias: number;
  properties: PropertyDef[];
  businessSectors: BusinessSectorDef[];
}

export interface GameState {
  schemaVersion: number;
  gameSeed: number;
  inflationMultiplier: number;
  inflationRate: number; // annual, e.g. 0.06
  player: PlayerState;
  npcs: NpcState[];
  market: MarketState;
}
