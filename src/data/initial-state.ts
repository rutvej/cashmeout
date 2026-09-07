import { GameState, TickerDef, PropertyDef, BusinessSectorDef, NpcState } from '../types/game';

export const INITIAL_TICKERS: TickerDef[] = [
  { id: 'ORFOOD', name: 'Orion Foods Co.', sector: 'consumer', price: 124, trendBias: 0.002, volatility: 0.04, dividendYieldPct: 0.02, history: [120, 122, 124] },
  { id: 'LUXBEV', name: 'Luxe Beverages', sector: 'consumer', price: 86, trendBias: 0.001, volatility: 0.06, dividendYieldPct: 0.015, history: [88, 85, 86] },
  { id: 'NXTECH', name: 'NexGen Technologies', sector: 'tech', price: 340, trendBias: 0.004, volatility: 0.09, dividendYieldPct: 0, history: [320, 335, 340] },
  { id: 'CLDNET', name: 'CloudNet Solutions', sector: 'tech', price: 210, trendBias: 0.003, volatility: 0.08, dividendYieldPct: 0, history: [200, 205, 210] },
  { id: 'SOLPWR', name: 'SolarPower India', sector: 'energy', price: 175, trendBias: 0.002, volatility: 0.07, dividendYieldPct: 0.025, history: [170, 172, 175] },
  { id: 'GRNFUEL', name: 'GreenFuel Corp.', sector: 'energy', price: 92, trendBias: 0.001, volatility: 0.08, dividendYieldPct: 0.01, history: [90, 91, 92] },
  { id: 'STBANK', name: 'Sterling Bank Ltd.', sector: 'finance', price: 540, trendBias: 0.001, volatility: 0.03, dividendYieldPct: 0.03, history: [530, 538, 540] },
  { id: 'INSFIN', name: 'InsureFirst Finance', sector: 'finance', price: 158, trendBias: 0.002, volatility: 0.05, dividendYieldPct: 0.02, history: [154, 156, 158] },
];

export const INITIAL_PROPERTIES: PropertyDef[] = [
  { id: 'prop-01', name: '1BHK Sector 18', location: 'Sector 18', price: 65000, rentYieldPct: 5.0, appreciationPct: 2.5, owner: null, riskProfile: { legalStatus: 'clear', issueChancePct: 5, issueCost: 10000 } },
  { id: 'prop-02', name: 'Studio Old Town', location: 'Old Town', price: 50000, rentYieldPct: 5.5, appreciationPct: 2.0, owner: null, riskProfile: { legalStatus: 'clear', issueChancePct: 5, issueCost: 8000 } },
  { id: 'prop-03', name: '2BHK Greenfield', location: 'Greenfield', price: 250000, rentYieldPct: 4.2, appreciationPct: 3.0, owner: null, riskProfile: { legalStatus: 'clear', issueChancePct: 5, issueCost: 20000 } },
  { id: 'prop-04', name: 'Plot Old Highway', location: 'Old Highway', price: 35000, rentYieldPct: 6.5, appreciationPct: 4.0, owner: null, riskProfile: { legalStatus: 'minor-dispute', issueChancePct: 25, issueCost: 25000 } },
  { id: 'prop-05', name: '3BHK MG Road', location: 'MG Road', price: 500000, rentYieldPct: 3.5, appreciationPct: 4.0, owner: null, riskProfile: { legalStatus: 'clear', issueChancePct: 5, issueCost: 40000 } },
  { id: 'prop-06', name: 'Penthouse Skyline', location: 'Skyline Towers', price: 1200000, rentYieldPct: 3.0, appreciationPct: 5.0, owner: null, riskProfile: { legalStatus: 'clear', issueChancePct: 5, issueCost: 75000 } },
  { id: 'prop-07', name: 'Villa Palm Estate', location: 'Palm Estate', price: 2000000, rentYieldPct: 2.5, appreciationPct: 6.0, owner: null, riskProfile: { legalStatus: 'clear', issueChancePct: 5, issueCost: 100000 } },
];

export const INITIAL_BUSINESS_SECTORS: BusinessSectorDef[] = [
  {
    id: 'food-cart',
    name: 'Food Cart',
    capacity: 3,
    startupCost: 5000,
    baseRevenuePerCycle: 3000,
    slotUpkeepPerCycle: 500,
    revenueCycleDays: 30,
    slots: [{ id: 'fc-1', owner: 'npc-1' }, { id: 'fc-2', owner: null }, { id: 'fc-3', owner: null }]
  },
  {
    id: 'tutoring',
    name: 'Tutoring Center',
    capacity: 3,
    startupCost: 8000,
    baseRevenuePerCycle: 4500,
    slotUpkeepPerCycle: 800,
    revenueCycleDays: 30,
    slots: [{ id: 'tc-1', owner: null }, { id: 'tc-2', owner: null }, { id: 'tc-3', owner: null }]
  },
  {
    id: 'retail-shop',
    name: 'Retail Shop',
    capacity: 4,
    startupCost: 15000,
    baseRevenuePerCycle: 8000,
    slotUpkeepPerCycle: 1500,
    revenueCycleDays: 30,
    slots: [{ id: 'rs-1', owner: 'npc-4' }, { id: 'rs-2', owner: null }, { id: 'rs-3', owner: null }, { id: 'rs-4', owner: null }]
  },
  {
    id: 'delivery',
    name: 'Delivery Service',
    capacity: 3,
    startupCost: 12000,
    baseRevenuePerCycle: 6000,
    slotUpkeepPerCycle: 1200,
    revenueCycleDays: 30,
    slots: [{ id: 'ds-1', owner: null }, { id: 'ds-2', owner: null }, { id: 'ds-3', owner: null }]
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    capacity: 2,
    startupCost: 50000,
    baseRevenuePerCycle: 25000,
    slotUpkeepPerCycle: 5000,
    revenueCycleDays: 30,
    slots: [{ id: 'ts-1', owner: null }, { id: 'ts-2', owner: null }]
  },
  {
    id: 'banking',
    name: 'Banking & Micro-Lending',
    capacity: 2,
    startupCost: 500000,
    baseRevenuePerCycle: 45000,
    slotUpkeepPerCycle: 12000,
    revenueCycleDays: 30,
    specialMechanic: 'lending',
    slots: [{ id: 'bk-1', owner: null }, { id: 'bk-2', owner: null }]
  }
];

export const INITIAL_NPCS: NpcState[] = [
  { id: 'npc-1', name: 'Aarav Sharma', archetype: 'serial-entrepreneur', money: 18000, portfolio: {}, properties: [], businesses: [{ sectorId: 'food-cart', slotId: 'fc-1' }], loans: [], decisionLog: [] },
  { id: 'npc-2', name: 'Priya Mehta', archetype: 'aggressive-investor', money: 25000, portfolio: { 'NXTECH': { shares: 30, avgCost: 330 } }, properties: [], businesses: [], loans: [], decisionLog: [] },
  { id: 'npc-3', name: 'Vikram Verma', archetype: 'cautious-saver', money: 45000, portfolio: {}, properties: [], businesses: [], loans: [], decisionLog: [] },
  { id: 'npc-4', name: 'Ananya Iyer', archetype: 'serial-entrepreneur', money: 22000, portfolio: {}, properties: [], businesses: [{ sectorId: 'retail-shop', slotId: 'rs-1' }], loans: [], decisionLog: [] },
  { id: 'npc-5', name: 'Rohan Gupta', archetype: 'landlord', money: 75000, portfolio: {}, properties: [], businesses: [], loans: [], decisionLog: [] },
  { id: 'npc-6', name: 'Sneha Patel', archetype: 'aggressive-investor', money: 30000, portfolio: { 'STBANK': { shares: 25, avgCost: 535 } }, properties: [], businesses: [], loans: [], decisionLog: [] },
  { id: 'npc-7', name: 'Kabir Das', archetype: 'cautious-saver', money: 35000, portfolio: {}, properties: [], businesses: [], loans: [], decisionLog: [] },
  { id: 'npc-8', name: 'Neha Joshi', archetype: 'landlord', money: 80000, portfolio: {}, properties: [], businesses: [], loans: [], decisionLog: [] },
];

export function createInitialState(seed = 42): GameState {
  return {
    schemaVersion: 1,
    gameSeed: seed,
    inflationMultiplier: 1.0,
    inflationRate: 0.06,
    player: {
      id: 'player',
      name: 'Player',
      money: 15000,
      savingsBalance: 5000,
      currentDay: 1,
      job: {
        id: 'junior-analyst',
        title: 'Junior Analyst',
        salaryPerCycle: 2800,
        payCycleDays: 15,
        stressPerDay: 0.8,
        timeSlotsCost: 2
      },
      housing: {
        type: 'rent',
        amountPerCycle: 800,
        cycleDays: 30,
        lastPaidDay: 1
      },
      health: {
        physical: 85,
        mental: 80,
        energy: 75
      },
      consequenceMeters: {
        cheapFoodDays: 0,
        noExerciseDays: 0,
        highStressDays: 0,
        lowEnergyDays: 0,
        noRestDays: 0,
        unhealthyDays: 0
      },
      timeAllocation: {
        job: 2,
        commute: 1,
        exercise: 1,
        cooking: 0,
        sideHustle: 0,
        education: 0,
        rest: 1,
        free: 1
      },
      lifestyle: {
        foodTier: 'street',
        transportMode: 'walk'
      },
      loans: [],
      fixedDeposits: [],
      sips: [],
      insurance: {
        health: { tier: 'none', premiumPerMonth: 0, coveragePct: 0 },
        vehicle: { active: false, premiumPerMonth: 0 },
        property: { active: false, premiumPerMonth: 0 },
        life: { active: false, premiumPerMonth: 0 }
      },
      taxes: {
        lastPaidDay: 1,
        cycleDays: 360,
        incomeThisCycle: 0,
        capitalGainsThisCycle: 0,
        dividendIncomeThisCycle: 0
      },
      portfolio: {},
      goldHoldings: { grams: 0, avgCostPerGram: 0 },
      properties: [],
      businesses: [],
      lifestyleAssets: [],
      family: {
        married: false,
        marriedOnDay: null,
        spouseIncome: 0,
        children: 0,
        childBornOnDays: []
      },
      stats: {
        stress: 15,
        happiness: 70
      },
      eventLog: [
        { day: 1, text: 'Welcome to Cashflow! Balance your money, time, and health.', type: 'event' }
      ],
      achievements: [],
      educationProgress: {},
      activeCourseId: null,
      lastActiveTimestamp: Date.now()
    },
    npcs: INITIAL_NPCS,
    market: {
      tickers: INITIAL_TICKERS,
      goldPricePerGram: 6500,
      goldHistory: [6420, 6460, 6500],
      cycleBias: 0,
      properties: INITIAL_PROPERTIES,
      businessSectors: INITIAL_BUSINESS_SECTORS
    }
  };
}
