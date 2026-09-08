import { GameState } from '../types/game';
import { calculateNetWorth } from '../engine/economy-engine';
import { formatCurrency } from '../ui/components/format';

export interface LifeGoalDef {
  id: string;
  category: 'wealth' | 'health' | 'lifestyle';
  title: string;
  emoji: string;
  targetDescription: string;
  getProgress: (state: GameState) => {
    current: number;
    target: number;
    pct: number;
    currentLabel: string;
    targetLabel: string;
    isMet: boolean;
  };
}

export const WEALTH_GOALS: LifeGoalDef[] = [
  {
    id: 'safety-fortress',
    category: 'wealth',
    title: 'The Safety Fortress',
    emoji: '🏰',
    targetDescription: 'Accumulate at least $50,000 in liquid cash & savings',
    getProgress: (state) => {
      const current = state.player.money + state.player.savingsBalance;
      const target = 50000;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        current,
        target,
        pct,
        currentLabel: formatCurrency(current),
        targetLabel: formatCurrency(target),
        isMet: current >= target
      };
    }
  },
  {
    id: 'six-figure-net-worth',
    category: 'wealth',
    title: 'Six-Figure Net Worth',
    emoji: '💎',
    targetDescription: 'Achieve a verifiable Net Worth of $100,000+',
    getProgress: (state) => {
      const current = calculateNetWorth(state);
      const target = 100000;
      const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
      return {
        current,
        target,
        pct,
        currentLabel: formatCurrency(current),
        targetLabel: formatCurrency(target),
        isMet: current >= target
      };
    }
  },
  {
    id: 'quarter-million',
    category: 'wealth',
    title: 'Quarter-Million Tycoon',
    emoji: '👑',
    targetDescription: 'Attain a total Net Worth exceeding $250,000',
    getProgress: (state) => {
      const current = calculateNetWorth(state);
      const target = 250000;
      const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
      return {
        current,
        target,
        pct,
        currentLabel: formatCurrency(current),
        targetLabel: formatCurrency(target),
        isMet: current >= target
      };
    }
  },
  {
    id: 'debt-free',
    category: 'wealth',
    title: 'Complete Debt Elimination',
    emoji: '🕊️',
    targetDescription: 'Own all assets with $0 total outstanding debt/loans',
    getProgress: (state) => {
      const totalDebt = state.player.loans.reduce((s, l) => s + l.principalRemaining, 0);
      const pct = totalDebt === 0 ? 100 : Math.max(10, Math.round((1 - Math.min(1, totalDebt / 50000)) * 100));
      return {
        current: totalDebt,
        target: 0,
        pct,
        currentLabel: totalDebt === 0 ? '$0 Debt' : `${formatCurrency(totalDebt)} debt`,
        targetLabel: '$0 Debt',
        isMet: totalDebt === 0
      };
    }
  },
  {
    id: 'passive-freedom',
    category: 'wealth',
    title: 'Passive Freedom',
    emoji: '🏖️',
    targetDescription: 'Generate $1,500+/month in non-labor passive income',
    getProgress: (state) => {
      let rentalIncome = 0;
      for (const prop of state.player.properties) {
        const def = state.market.properties.find(p => p.id === prop.id);
        if (def) {
          rentalIncome += (def.price * (def.rentYieldPct / 100)) / 12;
        }
      }
      let dividendIncome = 0;
      for (const [tickerId, entry] of Object.entries(state.player.portfolio)) {
        const t = state.market.tickers.find(x => x.id === tickerId);
        if (t && t.dividendYieldPct) {
          dividendIncome += (entry.shares * t.price * t.dividendYieldPct) / 12;
        }
      }
      const current = Math.round(rentalIncome + dividendIncome);
      const target = 1500;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        current,
        target,
        pct,
        currentLabel: `${formatCurrency(current)}/mo`,
        targetLabel: `${formatCurrency(target)}/mo`,
        isMet: current >= target
      };
    }
  }
];

export const HEALTH_GOALS: LifeGoalDef[] = [
  {
    id: 'olympic-resilience',
    category: 'health',
    title: 'Olympic Resilience',
    emoji: '💪',
    targetDescription: 'Maintain Physical Health at 85% or higher',
    getProgress: (state) => {
      const current = Math.round(state.player.health.physical);
      const target = 85;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        current,
        target,
        pct,
        currentLabel: `${current}%`,
        targetLabel: `≥ ${target}%`,
        isMet: current >= target
      };
    }
  },
  {
    id: 'burnout-inoculation',
    category: 'health',
    title: 'Burnout Inoculation',
    emoji: '🛡️',
    targetDescription: 'Zero clinical burnout episodes or mental breakdowns',
    getProgress: (state) => {
      const episodes = state.player.lifeGoalStats?.burnoutEpisodes || 0;
      const isMet = episodes === 0;
      return {
        current: episodes,
        target: 0,
        pct: isMet ? 100 : Math.max(0, 100 - episodes * 40),
        currentLabel: episodes === 0 ? '0 Burnouts' : `${episodes} episodes`,
        targetLabel: '0 Burnouts',
        isMet
      };
    }
  },
  {
    id: 'iron-consistency',
    category: 'health',
    title: 'Iron Consistency',
    emoji: '🏋️',
    targetDescription: 'Maintain gym habit consistency (≥ 3.5 sessions/week)',
    getProgress: (state) => {
      const sessions = state.player.lifeGoalStats?.totalGymSessions || 0;
      const days = Math.max(7, state.player.lifeGoalStats?.totalDaysTracked || state.player.currentDay);
      const weeks = days / 7;
      const currentAvg = Math.round((sessions / weeks) * 10) / 10;
      const target = 3.5;
      const pct = Math.min(100, Math.round((currentAvg / target) * 100));
      return {
        current: currentAvg,
        target,
        pct,
        currentLabel: `${currentAvg}/wk`,
        targetLabel: `≥ ${target}/wk`,
        isMet: currentAvg >= target
      };
    }
  },
  {
    id: 'youthful-vitality',
    category: 'health',
    title: 'Youthful Vitality',
    emoji: '⚡',
    targetDescription: 'Sustain daily Energy levels at 80% or higher',
    getProgress: (state) => {
      const current = Math.round(state.player.health.energy);
      const target = 80;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        current,
        target,
        pct,
        currentLabel: `${current}%`,
        targetLabel: `≥ ${target}%`,
        isMet: current >= target
      };
    }
  }
];

export const LIFESTYLE_GOALS: LifeGoalDef[] = [
  {
    id: 'homeowner-pride',
    category: 'lifestyle',
    title: 'Homeowner Pride',
    emoji: '🏡',
    targetDescription: 'Own a primary residential home with positive equity',
    getProgress: (state) => {
      const ownsHome = state.player.housing.type === 'own' || state.player.properties.length > 0;
      const pct = ownsHome ? 100 : 0;
      return {
        current: ownsHome ? 1 : 0,
        target: 1,
        pct,
        currentLabel: ownsHome ? 'Homeowner' : 'Renting',
        targetLabel: 'Own Home',
        isMet: ownsHome
      };
    }
  },
  {
    id: 'thriving-entrepreneur',
    category: 'lifestyle',
    title: 'Thriving Entrepreneur',
    emoji: '🚀',
    targetDescription: 'Build a venture generating $4,000+/month in net profit',
    getProgress: (state) => {
      let bizRev = 0;
      for (const b of state.player.businesses) {
        const sec = state.market.businessSectors.find(s => s.id === b.sectorId);
        if (sec) {
          bizRev += sec.baseRevenuePerCycle - sec.slotUpkeepPerCycle;
        }
      }
      const target = 4000;
      const pct = Math.min(100, Math.round((bizRev / target) * 100));
      return {
        current: bizRev,
        target,
        pct,
        currentLabel: `${formatCurrency(bizRev)}/mo`,
        targetLabel: `${formatCurrency(target)}/mo`,
        isMet: bizRev >= target
      };
    }
  },
  {
    id: 'executive-leader',
    category: 'lifestyle',
    title: 'Executive Leader',
    emoji: '👔',
    targetDescription: 'Reach Director, VP or C-Suite corporate rank',
    getProgress: (state) => {
      const title = state.player.job.title.toLowerCase();
      const isExec = title.includes('director') || title.includes('vp') || title.includes('chief') || title.includes('officer') || title.includes('partner');
      const isSenior = title.includes('senior') || title.includes('lead') || title.includes('manager');
      const pct = isExec ? 100 : (isSenior ? 60 : 25);
      return {
        current: isExec ? 1 : 0,
        target: 1,
        pct,
        currentLabel: state.player.job.title,
        targetLabel: 'Director / VP',
        isMet: isExec
      };
    }
  },
  {
    id: 'balanced-life',
    category: 'lifestyle',
    title: 'The Balanced Life',
    emoji: '🧘',
    targetDescription: 'Maintain Mental Health and Happiness score ≥ 75%',
    getProgress: (state) => {
      const avg = Math.round((state.player.health.mental + state.player.stats.happiness) / 2);
      const target = 75;
      const pct = Math.min(100, Math.round((avg / target) * 100));
      return {
        current: avg,
        target,
        pct,
        currentLabel: `${avg}%`,
        targetLabel: `≥ ${target}%`,
        isMet: avg >= target
      };
    }
  }
];

export function getGoalDef(category: 'wealth' | 'health' | 'lifestyle', id: string): LifeGoalDef | undefined {
  if (category === 'wealth') return WEALTH_GOALS.find(g => g.id === id);
  if (category === 'health') return HEALTH_GOALS.find(g => g.id === id);
  return LIFESTYLE_GOALS.find(g => g.id === id);
}
