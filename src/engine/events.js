export const EVENT_DECK = [
  {
    id: 'medical_emergency',
    name: 'Medical Emergency',
    type: 'bad',
    icon: '🏥',
    weight: 13,
    description: 'A sudden medical complication requires hospitalization and tests.',
    eligibilityCheck: (state) => true,
  },
  {
    id: 'job_loss',
    name: 'Job Layoff / Restructuring',
    type: 'bad',
    icon: '📉',
    weight: 9,
    description: 'Macro headwinds led to departmental downsizing. Your salaried position was eliminated.',
    eligibilityCheck: (state) => state.incomes.some(i => i.type === 'job'),
  },
  {
    id: 'freelance_gig',
    name: 'Freelance / Consulting Gig',
    type: 'good',
    icon: '💻',
    weight: 8,
    description: 'An industry contact offered you a flexible contract project while you job hunt.',
    eligibilityCheck: (state) => !state.incomes.some(i => i.type === 'job'),
  },
  {
    id: 'new_job_offer',
    name: 'Corporate Re-hire Recruiter Offer',
    type: 'choice',
    icon: '🤝',
    weight: 12,
    description: 'A headhunter approached you with an attractive full-time corporate role matching your professional experience.',
    eligibilityCheck: (state) => !state.incomes.some(i => i.type === 'job'),
  },
  {
    id: 'senior_job_offer',
    name: 'Executive Leadership Offer',
    type: 'good',
    icon: '🏆',
    weight: 7,
    description: 'A high-growth firm scouted your upskilled credentials and offered a senior leadership role!',
    eligibilityCheck: (state) => state.courseCompleted,
  },
  {
    id: 'market_crash',
    name: 'Stock Market Correction',
    type: 'bad',
    icon: '📉',
    weight: 10,
    description: 'Global geopolitical tensions triggered a sharp equity selloff in your stock portfolio.',
    eligibilityCheck: (state) => (state.instruments.stocks || 0) >= 5 && Math.round(((state.instruments.stocks || 0) / 100) * state.pool) >= 10000,
  },
  {
    id: 'market_boom',
    name: 'Stock Bull Market Rally',
    type: 'good',
    icon: '📈',
    weight: 10,
    description: 'Strong domestic earnings drove shares in your stock portfolio to all-time highs.',
    eligibilityCheck: (state) => (state.instruments.stocks || 0) >= 5 && Math.round(((state.instruments.stocks || 0) / 100) * state.pool) >= 10000,
  },
  {
    id: 'mf_correction',
    name: 'Mutual Fund Sector Dip',
    type: 'bad',
    icon: '📉',
    weight: 9,
    description: 'Mid and small-cap mutual funds in your portfolio experienced a temporary correction.',
    eligibilityCheck: (state) => (state.instruments.mf || 0) >= 5 && Math.round(((state.instruments.mf || 0) / 100) * state.pool) >= 10000,
  },
  {
    id: 'salary_hike',
    name: 'Merit Promotion & Raise',
    type: 'good',
    icon: '💰',
    weight: 8,
    description: 'Outstanding project deliverables earned you an off-cycle promotion and compensation boost!',
    eligibilityCheck: (state) => state.incomes.some(i => i.type === 'job'),
  },
  {
    id: 'job_switch',
    name: 'Senior Role Recruiter Offer',
    type: 'choice',
    icon: '🤝',
    weight: 7,
    description: 'A competitor approached you with a higher pay package and greater responsibilities.',
    eligibilityCheck: (state) => state.incomes.some(i => i.type === 'job') && state.experienceMonths >= 12,
  },
  {
    id: 'course_upskill',
    name: 'Executive Certification Program',
    type: 'choice',
    icon: '🎓',
    weight: 6,
    description: 'An elite certification course is open for admission. Completing it drastically raises your promotion probability and unlocks senior recruiter offers.',
    eligibilityCheck: (state) => !state.courseCompleted,
  },
  {
    id: 'vehicle_accident',
    name: 'Vehicle Collision',
    type: 'bad',
    icon: '🚗',
    weight: 10,
    description: 'A city traffic mishap caused body damage requiring garage repairs.',
    eligibilityCheck: (state) => state.carsOwned && state.carsOwned.length > 0,
  },
  {
    id: 'uninsured_illness',
    name: 'Out-of-Pocket Medical Bill',
    type: 'bad',
    icon: '🤧',
    weight: 11,
    description: 'Unexpected treatment requiring diagnostic scans and specialist consultations.',
    eligibilityCheck: (state) => !state.hasHealthInsurance,
  },
  {
    id: 'family_wedding',
    name: 'Family Wedding Contribution',
    type: 'choice',
    icon: '🎉',
    weight: 8,
    description: 'A close sibling/cousin is marrying. You are invited to contribute to ceremonies.',
    eligibilityCheck: (state) => {
      if (state.familyWeddingFired || state.married || state.marriageEventFired) return false;
      const pastWeddings = (state.eventHistory || []).filter(e => 
        e.eventName?.includes('Wedding') || e.eventName?.includes('Marriage')
      );
      if (pastWeddings.length > 0) return false;
      const pastDecisions = (state.decisionHistory || []).filter(d =>
        d.eventId === 'family_wedding' || d.eventId === 'marriage_event'
      );
      return pastDecisions.length === 0;
    },
  },
  {
    id: 'scam_fraud',
    name: 'UPI / Phishing Attempt',
    type: 'bad',
    icon: '⚠️',
    weight: 8,
    description: 'A fraudulent call tricked you into an unauthorized digital transaction.',
    eligibilityCheck: (state) => (state.instruments.savings || 0) > 10 && state.pool > 15000,
  },
  {
    id: 'inheritance_gift',
    name: 'Family Windfall Gift',
    type: 'good',
    icon: '🎁',
    weight: 3,
    description: 'Ancestral property sale distribution resulted in a direct family bequest to you.',
    eligibilityCheck: (state) => true,
  },
  {
    id: 'business_opportunity',
    name: 'Side Venture Opportunity',
    type: 'choice',
    icon: '🏢',
    weight: 7,
    description: 'A colleague invites you as partner in an e-commerce / B2B service venture.',
    eligibilityCheck: (state) => state.pool >= 50000 && !state.hasActiveBusiness,
  },
  {
    id: 'business_boom',
    name: 'Business Expansion & Client Inflow',
    type: 'good',
    icon: '🚀',
    weight: 8,
    description: 'Your side business landed major recurring retainers! Monthly cashflow surged.',
    eligibilityCheck: (state) => state.hasActiveBusiness && (state.businessIncome || 0) > 0,
  },
  {
    id: 'business_downturn',
    name: 'Business Client Churn',
    type: 'bad',
    icon: '📉',
    weight: 9,
    description: 'Key clients delayed renewals. Monthly business income compressed.',
    eligibilityCheck: (state) => state.hasActiveBusiness && (state.businessIncome || 0) > 0,
  },
  {
    id: 'business_failure',
    name: 'Business Solvency Crisis',
    type: 'choice',
    icon: '💥',
    weight: 7,
    description: 'Operating cash is depleted and unit economics turned negative. Revenues dropped to ₹0.',
    eligibilityCheck: (state) => state.hasActiveBusiness,
  },
  {
    id: 'gold_surge',
    name: 'Precious Metals Rally',
    type: 'good',
    icon: '✨',
    weight: 8,
    description: 'Central bank gold buying pushed your gold holdings higher.',
    eligibilityCheck: (state) => (state.instruments.gold || 0) >= 5 && Math.round(((state.instruments.gold || 0) / 100) * state.pool) >= 10000,
  },
  {
    id: 'theft',
    name: 'Household / Travel Theft',
    type: 'bad',
    icon: '🦹',
    weight: 7,
    description: 'Physical valuables and cash were misplaced or stolen during travel.',
    eligibilityCheck: (state) => {
      const lastTheft = state.eventHistory?.filter(e => e.eventName?.includes('Theft'))?.pop();
      return (!lastTheft || (state.currentDay - lastTheft.day) > 450) && (state.instruments.savings || 0) > 15;
    },
  },
  {
    id: 'work_bonus',
    name: 'Annual Corporate Bonus',
    type: 'good',
    icon: '🏆',
    weight: 6,
    description: 'Company surpassed quarterly profitability targets. Employees received cash bonuses.',
    eligibilityCheck: (state) => state.incomes.some(i => i.type === 'job'),
  },
  {
    id: 'home_renovation',
    name: 'Home Renovation Overrun',
    type: 'choice',
    icon: '🔨',
    weight: 12,
    description: 'Aging pipes burst and the walls need plastering. Contractor quoted an urgent renovation bill.',
    eligibilityCheck: (state) => {
      const last = state.eventHistory?.filter(e => e.eventName?.includes('Renovation')).pop();
      return (state.homesOwned?.length > 0) && (!last || (state.currentDay - last.day) > 300);
    },
  },
  {
    id: 'utility_hike',
    name: 'Electricity & Water Bill Surge',
    type: 'bad',
    icon: '⚡',
    weight: 10,
    description: 'State board hiked power tariffs. Your monthly utility expense has permanently increased.',
    eligibilityCheck: (state) => {
      const last = state.eventHistory?.filter(e => e.eventName?.includes('Utility')).pop();
      return !last || (state.currentDay - last.day) > 240;
    },
  },
  {
    id: 'property_tax',
    name: 'Municipal Property Tax Notice',
    type: 'bad',
    icon: '🏛️',
    weight: 11,
    description: 'Annual property tax notice from municipal corporation based on guidance value of your home.',
    eligibilityCheck: (state) => {
      const last = state.eventHistory?.filter(e => e.eventName?.includes('Property Tax')).pop();
      return (state.homesOwned?.length > 0) && (!last || (state.currentDay - last.day) > 330);
    },
  },
];

