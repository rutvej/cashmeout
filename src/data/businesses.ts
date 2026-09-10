import { BusinessType } from '../types/game';

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'freelancing',
    name: 'Consulting & Freelancing',
    startupCost: 500,
    monthlyOpsCost: 200,
    minRevenue: 1500,
    maxRevenue: 8000,
    timeSlots: 3,
    riskLevel: 'Low'
  },
  {
    id: 'food-cart',
    name: 'Artisan Food Cart / Tiffin',
    startupCost: 3000,
    monthlyOpsCost: 800,
    minRevenue: 2000,
    maxRevenue: 5000,
    timeSlots: 4,
    riskLevel: 'Medium'
  },
  {
    id: 'ecommerce',
    name: 'Direct-to-Consumer E-Commerce',
    startupCost: 8000,
    monthlyOpsCost: 1500,
    minRevenue: 3000,
    maxRevenue: 15000,
    timeSlots: 3,
    riskLevel: 'Medium',
    prerequisiteCourseId: 'course-digital-marketing'
  },
  {
    id: 'tutoring',
    name: 'Specialized Tutoring Academy',
    startupCost: 4000,
    monthlyOpsCost: 1000,
    minRevenue: 2500,
    maxRevenue: 7000,
    timeSlots: 3,
    riskLevel: 'Low'
  },
  {
    id: 'retail-shop',
    name: 'Boutique Urban Retail Store',
    startupCost: 15000,
    monthlyOpsCost: 3000,
    minRevenue: 5000,
    maxRevenue: 12000,
    timeSlots: 5,
    riskLevel: 'High'
  },
  {
    id: 'micro-saas',
    name: 'Cloud Micro-SaaS Product',
    startupCost: 6000,
    monthlyOpsCost: 800,
    minRevenue: 2000,
    maxRevenue: 18000,
    timeSlots: 3,
    riskLevel: 'Medium',
    prerequisiteCourseId: 'course-fullstack'
  }
];
