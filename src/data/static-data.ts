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
  fee: number;
  slotsRequired: number; // e.g. 30 slot-days
  description: string;
}

export const COURSES: CourseDef[] = [
  { id: 'financial-modeling', name: 'Financial Modeling & Valuation', fee: 15000, slotsRequired: 20, description: 'Unlocks Senior Analyst & Investment roles.' },
  { id: 'fullstack-dev', name: 'Full-Stack Software Engineering', fee: 35000, slotsRequired: 35, description: 'Unlocks Tech Lead positions & high side hustle yield.' },
  { id: 'executive-mba', name: 'Executive MBA', fee: 120000, slotsRequired: 60, description: 'Required for Executive Director & VP jobs.' }
];

export interface JobListing {
  id: string;
  title: string;
  salaryPerCycle: number;
  payCycleDays: number;
  stressPerDay: number;
  timeSlotsCost: number;
  requiredCourse?: string;
  requiredMinDays?: number;
  requiredMinNetWorth?: number;
}

export const ALL_JOBS: JobListing[] = [
  { id: 'junior-analyst', title: 'Junior Analyst', salaryPerCycle: 2800, payCycleDays: 15, stressPerDay: 0.8, timeSlotsCost: 2 },
  { id: 'content-writer', title: 'Content Specialist', salaryPerCycle: 2400, payCycleDays: 15, stressPerDay: 0.5, timeSlotsCost: 2 },
  { id: 'senior-analyst', title: 'Senior Financial Analyst', salaryPerCycle: 6500, payCycleDays: 15, stressPerDay: 1.6, timeSlotsCost: 2, requiredCourse: 'financial-modeling' },
  { id: 'software-engineer', title: 'Software Engineer', salaryPerCycle: 8000, payCycleDays: 15, stressPerDay: 1.8, timeSlotsCost: 2, requiredCourse: 'fullstack-dev' },
  { id: 'director-ops', title: 'Director of Operations', salaryPerCycle: 19000, payCycleDays: 15, stressPerDay: 2.8, timeSlotsCost: 3, requiredCourse: 'executive-mba', requiredMinNetWorth: 500000 }
];
