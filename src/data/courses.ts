import { Course } from '../types/game';

export const COURSES: Course[] = [
  {
    id: 'course-fin-accounting',
    title: 'Financial Accounting & Reporting',
    category: 'finance',
    cost: 1200,
    durationMonths: 2,
    description: 'Master GAAP principles, double-entry ledgers, and financial balance sheets.',
    unlocksRungs: [2]
  },
  {
    id: 'course-fullstack',
    title: 'Modern Full-Stack Engineering',
    category: 'tech',
    cost: 2500,
    durationMonths: 3,
    description: 'Comprehensive software development: modern web stacks, APIs, and databases.',
    unlocksRungs: [2, 3]
  },
  {
    id: 'course-digital-marketing',
    title: 'Growth & Digital Marketing',
    category: 'marketing',
    cost: 1000,
    durationMonths: 2,
    description: 'SEO, performance ad optimization, funnels, and data analytics.',
    unlocksRungs: [2, 3]
  },
  {
    id: 'course-fin-modeling',
    title: 'Advanced Financial Modeling & DCF',
    category: 'finance',
    cost: 3500,
    durationMonths: 3,
    description: 'Discounted Cash Flow, multi-tier corporate valuations, and LBO models.',
    unlocksRungs: [3]
  },
  {
    id: 'course-cloud-arch',
    title: 'Cloud Infrastructure & Distributed Systems',
    category: 'tech',
    cost: 3800,
    durationMonths: 4,
    description: 'Scalable microservices, Kubernetes, cloud resilience, and DevOps.',
    unlocksRungs: [3, 4]
  },
  {
    id: 'course-pmp',
    title: 'Project Management Professional (PMP)',
    category: 'management',
    cost: 3000,
    durationMonths: 3,
    description: 'Agile sprints, stakeholder alignment, cross-functional delivery.',
    unlocksRungs: [3, 4]
  },
  {
    id: 'course-ai-ml',
    title: 'Machine Learning & Applied AI Systems',
    category: 'tech',
    cost: 5000,
    durationMonths: 4,
    description: 'Neural networks, transformer architectures, and production ML pipelines.',
    unlocksRungs: [4, 5]
  },
  {
    id: 'course-cfa',
    title: 'Chartered Financial Analyst (CFA Prep)',
    category: 'finance',
    cost: 6500,
    durationMonths: 6,
    description: 'Portfolio management, quantitative methods, fixed income, and derivatives.',
    unlocksRungs: [4, 5]
  },
  {
    id: 'course-mba',
    title: 'Executive MBA & Strategic Leadership',
    category: 'management',
    cost: 15000,
    durationMonths: 6,
    description: 'Corporate strategy, organizational design, venture capital, and board governance.',
    unlocksRungs: [4, 5]
  }
];
