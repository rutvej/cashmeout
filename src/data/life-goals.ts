import { GameState, LifeGoalDefinition } from '../types/game';

export const LIFE_GOALS: LifeGoalDefinition[] = [
  // Category A: Wealth Ambitions (Spec 10)
  {
    id: 'safety-fortress',
    category: 'wealth',
    title: 'The Safety Fortress',
    targetDescription: 'Accumulate at least $50,000 in liquid, debt-free cash/emergency savings.',
    checkCompletion: (s: GameState) => {
      const liquid = s.resources.cashOnHand + s.resources.emergencyFund;
      const totalDebt = s.liabilities.loans.reduce((sum, l) => sum + l.balance, 0);
      return liquid >= 50000 && totalDebt === 0;
    },
    getProgressPct: (s: GameState) => {
      const liquid = s.resources.cashOnHand + s.resources.emergencyFund;
      return Math.min(100, Math.round((liquid / 50000) * 100));
    }
  },
  {
    id: 'six-figure-net-worth',
    category: 'wealth',
    title: 'The Six-Figure Net Worth',
    targetDescription: 'Achieve a total verifiable Net Worth of $100,000+.',
    checkCompletion: (s: GameState) => calculateTotalNetWorth(s) >= 100000,
    getProgressPct: (s: GameState) => {
      const nw = calculateTotalNetWorth(s);
      return Math.max(0, Math.min(100, Math.round((nw / 100000) * 100)));
    }
  },
  {
    id: 'quarter-million-tycoon',
    category: 'wealth',
    title: 'The Quarter-Million Tycoon',
    targetDescription: 'Attain a net worth exceeding $250,000 through business equity, stocks, or real estate.',
    checkCompletion: (s: GameState) => calculateTotalNetWorth(s) >= 250000,
    getProgressPct: (s: GameState) => {
      const nw = calculateTotalNetWorth(s);
      return Math.max(0, Math.min(100, Math.round((nw / 250000) * 100)));
    }
  },
  {
    id: 'debt-elimination',
    category: 'wealth',
    title: 'Complete Debt Elimination',
    targetDescription: 'Own all assets with $0 in total outstanding debt/loans.',
    checkCompletion: (s: GameState) => {
      const loanDebt = s.liabilities.loans.reduce((sum, l) => sum + l.balance, 0);
      const mortgageDebt = s.property.ownedProperties.reduce((sum, p) => sum + p.mortgageBalance, 0);
      return (loanDebt + mortgageDebt) === 0;
    },
    getProgressPct: (s: GameState) => {
      const totalDebt = s.liabilities.loans.reduce((sum, l) => sum + l.balance, 0) +
        s.property.ownedProperties.reduce((sum, p) => sum + p.mortgageBalance, 0);
      return totalDebt === 0 ? 100 : Math.max(0, Math.round(100 - (totalDebt / 500)));
    }
  },
  {
    id: 'passive-freedom',
    category: 'wealth',
    title: 'Passive Freedom',
    targetDescription: 'Generate $1,500+/month in non-labor passive income (dividends + rental profit).',
    checkCompletion: (s: GameState) => calculateMonthlyPassiveIncome(s) >= 1500,
    getProgressPct: (s: GameState) => {
      const pass = calculateMonthlyPassiveIncome(s);
      return Math.min(100, Math.round((pass / 1500) * 100));
    }
  },

  // Category B: Health Ambitions (Spec 10)
  {
    id: 'olympic-resilience',
    category: 'health',
    title: 'Olympic Resilience',
    targetDescription: 'Maintain Physical Health above 85% with zero hospitalizations.',
    checkCompletion: (s: GameState) => s.resources.physicalHealth >= 85 && s.simulation.hospitalizationCount === 0,
    getProgressPct: (s: GameState) => Math.min(100, Math.round((s.resources.physicalHealth / 85) * 100))
  },
  {
    id: 'burnout-inoculation',
    category: 'health',
    title: 'Burnout Inoculation',
    targetDescription: 'Never trigger a single clinical burnout, mental collapse, or forced stress leave.',
    checkCompletion: (s: GameState) => s.simulation.burnoutEpisodeCount === 0 && s.resources.mentalHealth >= 50,
    getProgressPct: (s: GameState) => s.simulation.burnoutEpisodeCount > 0 ? 0 : Math.min(100, Math.round(s.resources.mentalHealth))
  },
  {
    id: 'iron-consistency',
    category: 'health',
    title: 'Iron Consistency',
    targetDescription: 'Maintain average gym attendance of at least 3.5 sessions per week (1,820 total).',
    checkCompletion: (s: GameState) => s.simulation.lifetimeGymSessions >= 1800,
    getProgressPct: (s: GameState) => Math.min(100, Math.round((s.simulation.lifetimeGymSessions / 1800) * 100))
  },
  {
    id: 'youthful-vitality',
    category: 'health',
    title: 'Youthful Vitality',
    targetDescription: 'Conclude Year 10 with Energy levels above 80% and Mental Health above 75%.',
    checkCompletion: (s: GameState) => s.resources.energy >= 80 && s.resources.mentalHealth >= 75,
    getProgressPct: (s: GameState) => Math.min(100, Math.round(((s.resources.energy + s.resources.mentalHealth) / 155) * 100))
  },

  // Category C: Lifestyle Ambitions (Spec 10)
  {
    id: 'homeowner-pride',
    category: 'lifestyle',
    title: 'Homeowner Pride',
    targetDescription: 'Own a primary residential home with positive equity.',
    checkCompletion: (s: GameState) => s.property.ownedProperties.some(p => p.type === 'home' && (p.currentValue - p.mortgageBalance) > 0),
    getProgressPct: (s: GameState) => {
      const home = s.property.ownedProperties.find(p => p.type === 'home');
      if (!home) return 0;
      const equity = home.currentValue - home.mortgageBalance;
      return equity > 0 ? 100 : 50;
    }
  },
  {
    id: 'thriving-entrepreneur',
    category: 'lifestyle',
    title: 'Thriving Entrepreneur',
    targetDescription: 'Build and operate a venture producing $4,000+/month in net profits.',
    checkCompletion: (s: GameState) => s.business.activeBusinesses.some(b => (b.currentMonthlyRevenue - b.currentMonthlyOpsCost) >= 4000),
    getProgressPct: (s: GameState) => {
      const topProfit = Math.max(0, ...s.business.activeBusinesses.map(b => b.currentMonthlyRevenue - b.currentMonthlyOpsCost));
      return Math.min(100, Math.round((topProfit / 4000) * 100));
    }
  },
  {
    id: 'executive-leader',
    category: 'lifestyle',
    title: 'Executive Leader',
    targetDescription: 'Reach Director or VP rank (Rung 5) in corporate hierarchy.',
    checkCompletion: (s: GameState) => s.career.currentJob ? s.career.currentJob.salaryMonthly >= 11000 : false,
    getProgressPct: (s: GameState) => {
      if (!s.career.currentJob) return 0;
      return Math.min(100, Math.round((s.career.currentJob.salaryMonthly / 12000) * 100));
    }
  },
  {
    id: 'balanced-life',
    category: 'lifestyle',
    title: 'The Balanced Life',
    targetDescription: 'Maintain average Mental Health and Energy above 75% with low debt.',
    checkCompletion: (s: GameState) => s.resources.mentalHealth >= 75 && s.resources.energy >= 70,
    getProgressPct: (s: GameState) => Math.min(100, Math.round(((s.resources.mentalHealth + s.resources.energy) / 145) * 100))
  }
];

export function calculateTotalNetWorth(state: GameState): number {
  const cash = state.resources.cashOnHand + state.resources.emergencyFund;
  
  // Stocks equity
  let stocksValue = 0;
  // Fallback prices if market engine not imported yet
  for (const [_, holding] of Object.entries(state.investments.stocksOwned)) {
    stocksValue += holding.shares * holding.averageCost;
  }

  // Crypto equity
  let cryptoValue = 0;
  for (const [_, holding] of Object.entries(state.investments.cryptoOwned)) {
    cryptoValue += holding.units * holding.averageCost;
  }

  // Mutual funds
  let mfValue = 0;
  for (const [_, holding] of Object.entries(state.investments.mutualFundUnits)) {
    mfValue += holding.investedAmount;
  }

  // Fixed deposits
  const fdValue = state.investments.fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);

  // Property equity
  let propertyEquity = 0;
  for (const prop of state.property.ownedProperties) {
    propertyEquity += (prop.currentValue - prop.mortgageBalance);
  }

  // Business valuation (e.g. 12x monthly profit or base assets)
  let businessValue = 0;
  for (const biz of state.business.activeBusinesses) {
    const monthlyNet = Math.max(0, biz.currentMonthlyRevenue - biz.currentMonthlyOpsCost);
    businessValue += monthlyNet * 12 + (biz.scaleLevel * 5000);
  }

  // Liabilities
  const totalLoanDebt = state.liabilities.loans.reduce((sum, loan) => sum + loan.balance, 0);

  return cash + stocksValue + cryptoValue + mfValue + fdValue + propertyEquity + businessValue - totalLoanDebt;
}

export function calculateMonthlyPassiveIncome(state: GameState): number {
  let rentalIncome = 0;
  for (const prop of state.property.ownedProperties) {
    if (prop.type === 'rental' && !prop.isVacant) {
      rentalIncome += Math.max(0, prop.tenantMonthlyRent - prop.monthlyEMI);
    }
  }

  // Estimated dividend / FD interest yield (~2.5% to 3.5% / 12)
  let dividendYield = 0;
  for (const [_, holding] of Object.entries(state.investments.stocksOwned)) {
    dividendYield += (holding.shares * holding.averageCost * 0.025) / 12;
  }

  return Math.round(rentalIncome + dividendYield);
}
