export const EVENT_DECK = [
  {
    id: 'medical_emergency',
    name: 'Medical Emergency',
    type: 'bad',
    icon: '🏥',
    weight: 10,
    description: 'A sudden medical complication requires hospitalization and specialized medical care.',
    eligibilityCheck: (state) => true,
  },
  {
    id: 'job_loss',
    name: 'Company Layoff / Job Loss',
    type: 'bad',
    icon: '📉',
    weight: 8,
    description: 'Macro headwinds led to corporate downsizing. Your salaried position was eliminated.',
    eligibilityCheck: (state) => {
      // Rule: max 5 times in one gameplay, at least 5 years (1825 days) apart, not in year 1
      const jobLossHistory = (state.eventHistory || []).filter(e => 
        e.eventName?.includes('Job Loss') || e.eventName?.includes('Layoff') || e.eventName?.includes('downsizing')
      );
      if (jobLossHistory.length >= 5) return false;
      if (state.currentDay <= 365) return false;
      const lastJobLoss = jobLossHistory[0]; // newest on top
      if (lastJobLoss && (state.currentDay - lastJobLoss.day) < 1825) return false;
      return state.incomes.some(i => i.type === 'job');
    },
  },
  {
    id: 'home_renovation',
    name: 'Home Renovation & Repair',
    type: 'choice',
    icon: '🔨',
    weight: 8,
    description: 'Aging pipes and fixtures require urgent repairs and home renovation.',
    eligibilityCheck: (state) => {
      // Once every 1 to 2 years, only if player owns a home
      if (!state.homesOwned || state.homesOwned.length === 0) return false;
      const last = (state.eventHistory || []).find(e => e.eventName?.includes('Renovation'));
      return !last || (state.currentDay - last.day) >= 365;
    },
  },
  {
    id: 'vehicle_accident',
    name: 'Vehicle Repair & Maintenance',
    type: 'bad',
    icon: '🚗',
    weight: 6,
    description: 'An unexpected collision / mechanical failure requires garage repair.',
    eligibilityCheck: (state) => {
      // Only if player owns a car
      if (!state.carsOwned || state.carsOwned.length === 0) return false;
      const last = (state.eventHistory || []).find(e => e.eventName?.includes('Vehicle'));
      return !last || (state.currentDay - last.day) >= 365;
    },
  },
  {
    id: 'work_bonus',
    name: 'Annual Performance Bonus',
    type: 'good',
    icon: '🏆',
    weight: 12,
    description: 'Company surpassed annual profitability targets. Employees received corporate cash bonuses.',
    eligibilityCheck: (state) => {
      // Once a year if employed
      if (!state.incomes.some(i => i.type === 'job')) return false;
      const last = (state.eventHistory || []).find(e => e.eventName?.includes('Bonus'));
      return !last || (state.currentDay - last.day) >= 330;
    },
  },
  {
    id: 'inheritance_gift',
    name: 'Sold Old Family Property (Windfall)',
    type: 'good',
    icon: '🎁',
    weight: 4,
    description: 'Ancestral family property was sold and your inheritance share was disbursed!',
    eligibilityCheck: (state) => {
      // Once in lifetime
      if (state.windfallFired) return false;
      const hadWindfall = (state.eventHistory || []).some(e => 
        e.eventName?.includes('Windfall') || e.eventName?.includes('Property (Windfall)')
      );
      return !hadWindfall;
    },
  },
];
