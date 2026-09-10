import { CompanyProfile, JobDefinition } from '../types/game';

export const COMPANIES: CompanyProfile[] = [
  {
    id: 'gov-office',
    name: 'Metropolitan Public Works',
    industry: 'Public Sector',
    cultureStars: 5,
    overtimeFrequency: 0.05,
    growthOpportunity: 0.10,
    layoffRisk: 0.01,
    vacationDays: 25
  },
  {
    id: 'mid-corp',
    name: 'Acuity Global Logistics',
    industry: 'Enterprise Services',
    cultureStars: 4,
    overtimeFrequency: 0.20,
    growthOpportunity: 0.30,
    layoffRisk: 0.05,
    vacationDays: 20
  },
  {
    id: 'big-tech',
    name: 'Apex HyperCloud',
    industry: 'Technology',
    cultureStars: 4,
    overtimeFrequency: 0.30,
    growthOpportunity: 0.50,
    layoffRisk: 0.08,
    vacationDays: 22
  },
  {
    id: 'consulting',
    name: 'Sterling & Vance Partners',
    industry: 'Management Consulting',
    cultureStars: 2,
    overtimeFrequency: 0.70,
    growthOpportunity: 0.45,
    layoffRisk: 0.10,
    vacationDays: 14
  },
  {
    id: 'early-startup',
    name: 'NovaScale AI Labs',
    industry: 'Startup Tech',
    cultureStars: 2,
    overtimeFrequency: 0.60,
    growthOpportunity: 0.60,
    layoffRisk: 0.25,
    vacationDays: 12
  },
  {
    id: 'invest-bank',
    name: 'Vanguard Capital Markets',
    industry: 'Investment Banking',
    cultureStars: 2,
    overtimeFrequency: 0.75,
    growthOpportunity: 0.55,
    layoffRisk: 0.12,
    vacationDays: 15
  }
];

export const JOB_DEFINITIONS: JobDefinition[] = [
  // Rung 1: Entry Level
  {
    id: 'junior-analyst',
    title: 'Junior Analyst',
    rung: 1,
    salaryMonthly: 1800,
    stressMonthly: 12,
    cultureStars: 3,
    requiredExpYears: 0,
    requiredCourseIds: []
  },
  {
    id: 'junior-dev',
    title: 'Junior Developer',
    rung: 1,
    salaryMonthly: 2200,
    stressMonthly: 15,
    cultureStars: 4,
    requiredExpYears: 0,
    requiredCourseIds: []
  },
  {
    id: 'sales-assoc',
    title: 'Sales Associate',
    rung: 1,
    salaryMonthly: 1600,
    stressMonthly: 18,
    cultureStars: 3,
    requiredExpYears: 0,
    requiredCourseIds: []
  },
  {
    id: 'customer-support',
    title: 'Customer Support Rep',
    rung: 1,
    salaryMonthly: 1400,
    stressMonthly: 14,
    cultureStars: 4,
    requiredExpYears: 0,
    requiredCourseIds: []
  },
  {
    id: 'admin-assistant',
    title: 'Admin Assistant',
    rung: 1,
    salaryMonthly: 1300,
    stressMonthly: 10,
    cultureStars: 5,
    requiredExpYears: 0,
    requiredCourseIds: []
  },

  // Rung 2: Mid Level
  {
    id: 'financial-associate',
    title: 'Financial Associate',
    rung: 2,
    salaryMonthly: 3200,
    stressMonthly: 22,
    cultureStars: 3,
    requiredExpYears: 1,
    requiredCourseIds: ['course-fin-accounting']
  },
  {
    id: 'software-dev',
    title: 'Software Developer',
    rung: 2,
    salaryMonthly: 3500,
    stressMonthly: 20,
    cultureStars: 4,
    requiredExpYears: 1,
    requiredCourseIds: ['course-fullstack']
  },
  {
    id: 'marketing-exec',
    title: 'Marketing Executive',
    rung: 2,
    salaryMonthly: 2600,
    stressMonthly: 18,
    cultureStars: 3,
    requiredExpYears: 1,
    requiredCourseIds: ['course-digital-marketing']
  },
  {
    id: 'analyst',
    title: 'Market Analyst',
    rung: 2,
    salaryMonthly: 2800,
    stressMonthly: 20,
    cultureStars: 3,
    requiredExpYears: 1,
    requiredCourseIds: ['course-fin-accounting']
  },

  // Rung 3: Senior Level
  {
    id: 'senior-analyst',
    title: 'Senior Financial Analyst',
    rung: 3,
    salaryMonthly: 5000,
    stressMonthly: 30,
    cultureStars: 3,
    requiredExpYears: 3,
    requiredCourseIds: ['course-fin-modeling']
  },
  {
    id: 'senior-dev',
    title: 'Senior Developer',
    rung: 3,
    salaryMonthly: 5500,
    stressMonthly: 26,
    cultureStars: 4,
    requiredExpYears: 3,
    requiredCourseIds: ['course-cloud-arch']
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    rung: 3,
    salaryMonthly: 5200,
    stressMonthly: 34,
    cultureStars: 3,
    requiredExpYears: 3,
    requiredCourseIds: ['course-pmp']
  },
  {
    id: 'marketing-manager',
    title: 'Marketing Manager',
    rung: 3,
    salaryMonthly: 4200,
    stressMonthly: 25,
    cultureStars: 3,
    requiredExpYears: 3,
    requiredCourseIds: ['course-digital-marketing']
  },

  // Rung 4: Manager Level
  {
    id: 'finance-manager',
    title: 'Finance Manager',
    rung: 4,
    salaryMonthly: 7500,
    stressMonthly: 42,
    cultureStars: 2,
    requiredExpYears: 5,
    requiredCourseIds: ['course-cfa']
  },
  {
    id: 'eng-manager',
    title: 'Engineering Manager',
    rung: 4,
    salaryMonthly: 8500,
    stressMonthly: 40,
    cultureStars: 3,
    requiredExpYears: 5,
    requiredCourseIds: ['course-ai-ml', 'course-cloud-arch']
  },
  {
    id: 'product-director',
    title: 'Product Director',
    rung: 4,
    salaryMonthly: 8000,
    stressMonthly: 44,
    cultureStars: 2,
    requiredExpYears: 5,
    requiredCourseIds: ['course-pmp', 'course-mba']
  },

  // Rung 5: Director / VP
  {
    id: 'vp-finance',
    title: 'VP of Finance',
    rung: 5,
    salaryMonthly: 12000,
    stressMonthly: 55,
    cultureStars: 2,
    requiredExpYears: 7,
    requiredCourseIds: ['course-cfa', 'course-mba']
  },
  {
    id: 'cto',
    title: 'Chief Technology Officer (CTO)',
    rung: 5,
    salaryMonthly: 16000,
    stressMonthly: 58,
    cultureStars: 3,
    requiredExpYears: 7,
    requiredCourseIds: ['course-ai-ml', 'course-cloud-arch', 'course-mba']
  },
  {
    id: 'cio',
    title: 'Chief Investment Officer',
    rung: 5,
    salaryMonthly: 18000,
    stressMonthly: 62,
    cultureStars: 2,
    requiredExpYears: 8,
    requiredCourseIds: ['course-cfa', 'course-fin-modeling', 'course-mba']
  }
];
