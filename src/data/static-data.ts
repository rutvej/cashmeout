import { FoodTierId, TransportModeId } from '../types/game';

export interface FoodTierDef {
  id: FoodTierId;
  name: string;
  costPerDay: number;
  physicalDelta: number;
  mentalDelta: number;
  requiresCookingSlot: boolean;
  requiresCookingEquipment: boolean;
  description: string;
}

export const FOOD_TIERS: Record<FoodTierId, FoodTierDef> = {
  'street': {
    id: 'street',
    name: 'Street Food',
    costPerDay: 50,
    physicalDelta: -1.2,
    mentalDelta: -0.2,
    requiresCookingSlot: false,
    requiresCookingEquipment: false,
    description: 'Cheap & fast (₹50/day), but hurts health over time.'
  },
  'basic': {
    id: 'basic',
    name: 'Basic Home Cooking',
    costPerDay: 90,
    physicalDelta: 0.2,
    mentalDelta: 0.1,
    requiresCookingSlot: true,
    requiresCookingEquipment: false,
    description: 'Balanced & economical (₹90/day). Needs 1 cooking slot.'
  },
  'home-cooked': {
    id: 'home-cooked',
    name: 'Nutritious Meal Prep',
    costPerDay: 140,
    physicalDelta: 1.2,
    mentalDelta: 0.6,
    requiresCookingSlot: true,
    requiresCookingEquipment: true,
    description: 'High nutrition (₹140/day). Needs cooking slot + equipment.'
  },
  'restaurant': {
    id: 'restaurant',
    name: 'Healthy Meal Delivery',
    costPerDay: 280,
    physicalDelta: 0.8,
    mentalDelta: 0.8,
    requiresCookingSlot: false,
    requiresCookingEquipment: false,
    description: 'Premium dining (₹280/day). Saves time, good health.'
  }
};

export interface TransportDef {
  id: TransportModeId;
  name: string;
  dailyCost: number;
  commuteSlotsNeeded: number;
  stressPerDay: number;
  description: string;
}

export const TRANSPORT_MODES: Record<TransportModeId, TransportDef> = {
  'walk': {
    id: 'walk',
    name: 'Walk / Public Transit',
    dailyCost: 20,
    commuteSlotsNeeded: 1,
    stressPerDay: 1.5,
    description: 'Takes 1 time slot, high daily commute fatigue.'
  },
  'bicycle': {
    id: 'bicycle',
    name: 'Bicycle',
    dailyCost: 0,
    commuteSlotsNeeded: 1,
    stressPerDay: 0.4,
    description: 'Zero fuel, good cardio, low stress commute.'
  },
  'scooter': {
    id: 'scooter',
    name: 'Motor Scooter',
    dailyCost: 40,
    commuteSlotsNeeded: 0,
    stressPerDay: 0.5,
    description: 'Eliminates commute slot entirely! Saves 1 slot daily.'
  },
  'car': {
    id: 'car',
    name: 'Personal Car',
    dailyCost: 150,
    commuteSlotsNeeded: 0,
    stressPerDay: -0.5,
    description: 'Eliminates commute slot, high comfort & happiness boost.'
  }
};

export interface LifestyleAssetCatalogItem {
  id: string;
  name: string;
  price: number;
  depreciationPerYear: number;
  monthlyUpkeep: number;
  description: string;
  unlocksFeature?: string;
}

export const ASSET_CATALOG: LifestyleAssetCatalogItem[] = [
  { id: 'bicycle', name: 'Commuter Bicycle', price: 5000, depreciationPerYear: 0.05, monthlyUpkeep: 0, description: 'Enables Bicycle transport mode.' },
  { id: 'scooter', name: 'City Scooter (125cc)', price: 75000, depreciationPerYear: 0.12, monthlyUpkeep: 600, description: 'Enables Scooter transport mode (frees commute slot).' },
  { id: 'car', name: 'Sedan Car', price: 550000, depreciationPerYear: 0.15, monthlyUpkeep: 3500, description: 'Enables Car transport mode (+comfort, status, time saving).' },
  { id: 'laptop', name: 'Workstation Laptop', price: 60000, depreciationPerYear: 0.25, monthlyUpkeep: 0, description: 'Enables high-paying freelance tech side hustles (2x income).' },
  { id: 'cooking-equipment', name: 'Gourmet Kitchen Set', price: 12000, depreciationPerYear: 0.05, monthlyUpkeep: 0, description: 'Unlocks Nutritious Meal Prep food tier.' },
  { id: 'gym-membership', name: 'Annual Gym Pass', price: 18000, depreciationPerYear: 1.0, monthlyUpkeep: 0, description: 'Doubles physical health gains from exercise time slots.' }
];

export interface CourseDef {
  id: string;
  name: string;
  track: 'finance' | 'tech' | 'executive';
  tier: number;
  fee: number;
  slotsRequired: number;
  description: string;
  unlocksJobTitle: string;
  unlocksJobSalary: number;
  unlocksJobId: string;
}

export const COURSES: CourseDef[] = [
  // ─── Track 1: Finance & Investment Banking ───
  {
    id: 'fin-accounting',
    name: 'Financial Accounting & Advanced Excel',
    track: 'finance',
    tier: 1,
    fee: 4000,
    slotsRequired: 10,
    description: 'Master balance sheets, double-entry bookkeeping, and pivot tables.',
    unlocksJobTitle: 'Corporate Accounting Associate',
    unlocksJobSalary: 4800,
    unlocksJobId: 'fin-associate'
  },
  {
    id: 'financial-modeling',
    name: 'Financial Modeling & Equity Valuation',
    track: 'finance',
    tier: 2,
    fee: 15000,
    slotsRequired: 20,
    description: 'Discounted cash flows, DCF valuation, and merger analysis.',
    unlocksJobTitle: 'Senior Investment Analyst',
    unlocksJobSalary: 9500,
    unlocksJobId: 'senior-analyst'
  },
  {
    id: 'fin-cfa',
    name: 'Chartered Portfolio Management (CFA Prep)',
    track: 'finance',
    tier: 3,
    fee: 45000,
    slotsRequired: 35,
    description: 'Quantitative portfolio construction, derivatives, and risk hedging.',
    unlocksJobTitle: 'Hedge Fund Portfolio Manager',
    unlocksJobSalary: 24000,
    unlocksJobId: 'portfolio-manager'
  },
  {
    id: 'fin-cio',
    name: 'Global Asset Allocation & Algorithmic Trading',
    track: 'finance',
    tier: 4,
    fee: 120000,
    slotsRequired: 50,
    description: 'Macro hedge fund strategies and multi-crore asset management.',
    unlocksJobTitle: 'Chief Investment Officer (CIO)',
    unlocksJobSalary: 60000,
    unlocksJobId: 'chief-investment-officer'
  },

  // ─── Track 2: Tech, Cloud & Artificial Intelligence ───
  {
    id: 'fullstack-dev',
    name: 'Full-Stack Software Engineering',
    track: 'tech',
    tier: 1,
    fee: 12000,
    slotsRequired: 25,
    description: 'Full-stack TypeScript, React, RESTful APIs, and database architecture.',
    unlocksJobTitle: 'Full-Stack Software Engineer',
    unlocksJobSalary: 9500,
    unlocksJobId: 'software-engineer'
  },
  {
    id: 'tech-cloud',
    name: 'Cloud Architecture & DevOps Systems',
    track: 'tech',
    tier: 2,
    fee: 28000,
    slotsRequired: 30,
    description: 'Distributed Kubernetes, microservices, and multi-region resilience.',
    unlocksJobTitle: 'Senior Cloud Architect',
    unlocksJobSalary: 21000,
    unlocksJobId: 'cloud-architect'
  },
  {
    id: 'tech-ai',
    name: 'Deep Learning & Generative AI Systems',
    track: 'tech',
    tier: 3,
    fee: 65000,
    slotsRequired: 40,
    description: 'LLM fine-tuning, neural networks, and scalable vector databases.',
    unlocksJobTitle: 'Principal AI Systems Engineer',
    unlocksJobSalary: 42000,
    unlocksJobId: 'principal-ai-engineer'
  },
  {
    id: 'tech-cto',
    name: 'Executive Tech Leadership & Enterprise Scale',
    track: 'tech',
    tier: 4,
    fee: 160000,
    slotsRequired: 55,
    description: 'Architecting 10M+ user infrastructure and leading 200+ engineers.',
    unlocksJobTitle: 'Chief Technology Officer (CTO)',
    unlocksJobSalary: 85000,
    unlocksJobId: 'chief-technology-officer'
  },

  // ─── Track 3: Product, Operations & Executive Leadership ───
  {
    id: 'prod-mgmt',
    name: 'Product Strategy & User Growth Metrics',
    track: 'executive',
    tier: 1,
    fee: 10000,
    slotsRequired: 20,
    description: 'Product-market fit, conversion funnels, and feature roadmaps.',
    unlocksJobTitle: 'Lead Product Manager',
    unlocksJobSalary: 13500,
    unlocksJobId: 'product-lead'
  },
  {
    id: 'ops-strategy',
    name: 'Strategic Operations & Supply Chain',
    track: 'executive',
    tier: 2,
    fee: 25000,
    slotsRequired: 30,
    description: 'P&L management, business process scaling, and operational efficiency.',
    unlocksJobTitle: 'Director of Operations',
    unlocksJobSalary: 25000,
    unlocksJobId: 'director-ops'
  },
  {
    id: 'executive-mba',
    name: 'Executive MBA (Top Global Business School)',
    track: 'executive',
    tier: 3,
    fee: 130000,
    slotsRequired: 60,
    description: 'Corporate finance, global negotiations, and enterprise strategy.',
    unlocksJobTitle: 'Vice President of Enterprise',
    unlocksJobSalary: 62000,
    unlocksJobId: 'vice-president'
  },
  {
    id: 'board-leadership',
    name: 'Board Governance & Corporate Stewardship',
    track: 'executive',
    tier: 4,
    fee: 250000,
    slotsRequired: 70,
    description: 'Mergers & acquisitions, public market IPOs, and shareholder leadership.',
    unlocksJobTitle: 'Chief Executive Officer (CEO)',
    unlocksJobSalary: 140000,
    unlocksJobId: 'chief-executive-officer'
  }
];

export interface JobListing {
  id: string;
  title: string;
  track: 'starter' | 'finance' | 'tech' | 'executive';
  salaryPerCycle: number;
  payCycleDays: number;
  stressPerDay: number;
  timeSlotsCost: number;
  requiredCourse?: string;
  requiredMinDays?: number;
  requiredMinNetWorth?: number;
}

export const ALL_JOBS: JobListing[] = [
  // ─── Starter Jobs (No Courses Required) ───
  { id: 'junior-analyst', title: 'Junior Analyst', track: 'starter', salaryPerCycle: 2800, payCycleDays: 15, stressPerDay: 0.8, timeSlotsCost: 2 },
  { id: 'content-writer', title: 'Content & Copy Specialist', track: 'starter', salaryPerCycle: 2400, payCycleDays: 15, stressPerDay: 0.5, timeSlotsCost: 2 },
  { id: 'support-rep', title: 'Customer Support Specialist', track: 'starter', salaryPerCycle: 2200, payCycleDays: 15, stressPerDay: 0.6, timeSlotsCost: 2 },

  // ─── Finance Track (High Cash Flow) ───
  { id: 'fin-associate', title: 'Corporate Accounting Associate', track: 'finance', salaryPerCycle: 4800, payCycleDays: 15, stressPerDay: 1.1, timeSlotsCost: 2, requiredCourse: 'fin-accounting' },
  { id: 'senior-analyst', title: 'Senior Investment Analyst', track: 'finance', salaryPerCycle: 9500, payCycleDays: 15, stressPerDay: 1.6, timeSlotsCost: 2, requiredCourse: 'financial-modeling' },
  { id: 'portfolio-manager', title: 'Hedge Fund Portfolio Manager', track: 'finance', salaryPerCycle: 24000, payCycleDays: 15, stressPerDay: 2.2, timeSlotsCost: 3, requiredCourse: 'fin-cfa', requiredMinNetWorth: 75000 },
  { id: 'chief-investment-officer', title: 'Chief Investment Officer (CIO)', track: 'finance', salaryPerCycle: 60000, payCycleDays: 15, stressPerDay: 2.8, timeSlotsCost: 3, requiredCourse: 'fin-cio', requiredMinNetWorth: 200000 },

  // ─── Tech Track (High Income + Low Overhead) ───
  { id: 'software-engineer', title: 'Full-Stack Software Engineer', track: 'tech', salaryPerCycle: 9500, payCycleDays: 15, stressPerDay: 1.5, timeSlotsCost: 2, requiredCourse: 'fullstack-dev' },
  { id: 'cloud-architect', title: 'Senior Cloud Architect', track: 'tech', salaryPerCycle: 21000, payCycleDays: 15, stressPerDay: 2.0, timeSlotsCost: 2, requiredCourse: 'tech-cloud' },
  { id: 'principal-ai-engineer', title: 'Principal AI Systems Engineer', track: 'tech', salaryPerCycle: 42000, payCycleDays: 15, stressPerDay: 2.4, timeSlotsCost: 3, requiredCourse: 'tech-ai', requiredMinNetWorth: 100000 },
  { id: 'chief-technology-officer', title: 'Chief Technology Officer (CTO)', track: 'tech', salaryPerCycle: 85000, payCycleDays: 15, stressPerDay: 3.0, timeSlotsCost: 3, requiredCourse: 'tech-cto', requiredMinNetWorth: 250000 },

  // ─── Executive Track (Peak High-Paying Positions) ───
  { id: 'product-lead', title: 'Lead Product Manager', track: 'executive', salaryPerCycle: 13500, payCycleDays: 15, stressPerDay: 1.8, timeSlotsCost: 2, requiredCourse: 'prod-mgmt' },
  { id: 'director-ops', title: 'Director of Operations', track: 'executive', salaryPerCycle: 25000, payCycleDays: 15, stressPerDay: 2.5, timeSlotsCost: 3, requiredCourse: 'ops-strategy', requiredMinNetWorth: 100000 },
  { id: 'vice-president', title: 'Vice President of Enterprise', track: 'executive', salaryPerCycle: 62000, payCycleDays: 15, stressPerDay: 3.0, timeSlotsCost: 3, requiredCourse: 'executive-mba', requiredMinNetWorth: 250000 },
  { id: 'chief-executive-officer', title: 'Chief Executive Officer (CEO)', track: 'executive', salaryPerCycle: 140000, payCycleDays: 15, stressPerDay: 3.5, timeSlotsCost: 3, requiredCourse: 'board-leadership', requiredMinNetWorth: 500000 }
];
