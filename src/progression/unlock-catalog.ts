import { FeatureUnlockDef } from './unlock-types';
import { calculateNetWorth } from '../engine/economy-engine';

export const FEATURE_UNLOCKS: FeatureUnlockDef[] = [
  {
    id: 'banking',
    name: 'High-Yield Bank Savings',
    icon: '🏦',
    tagline: 'Earn 3.5% daily compounding APY on your emergency fund.',
    requirementText: 'Survive to Day 5 or build ₹22,000 Net Worth',
    unlockDayMin: 5,
    unlockNetWorthMin: 22000,
    condition: (state) => state.player.currentDay >= 5 || calculateNetWorth(state) >= 22000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      const dayPct = Math.min(100, Math.round((state.player.currentDay / 5) * 100));
      const nwPct = Math.min(100, Math.round((nw / 22000) * 100));
      const maxPct = Math.max(dayPct, nwPct);
      return { current: state.player.currentDay, target: 5, pct: maxPct };
    }
  },
  {
    id: 'loans',
    name: 'Credit & Loan Facility',
    icon: '💳',
    tagline: 'Access personal credit lines up to ₹1,00,000 to manage liquidity.',
    requirementText: 'Survive to Day 10 or reach ₹25,000 Net Worth',
    unlockDayMin: 10,
    unlockNetWorthMin: 25000,
    condition: (state) => state.player.currentDay >= 10 || calculateNetWorth(state) >= 25000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      const dayPct = Math.min(100, Math.round((state.player.currentDay / 10) * 100));
      const nwPct = Math.min(100, Math.round((nw / 25000) * 100));
      return { current: state.player.currentDay, target: 10, pct: Math.max(dayPct, nwPct) };
    }
  },
  {
    id: 'insurance',
    name: 'Health Insurance Desk',
    icon: '🛡️',
    tagline: 'Shield your savings from sudden lifestyle medical crises.',
    requirementText: 'Survive to Day 12 or reach ₹24,000 Net Worth',
    unlockDayMin: 12,
    unlockNetWorthMin: 24000,
    condition: (state) => state.player.currentDay >= 12 || calculateNetWorth(state) >= 24000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      const dayPct = Math.min(100, Math.round((state.player.currentDay / 12) * 100));
      const nwPct = Math.min(100, Math.round((nw / 24000) * 100));
      return { current: state.player.currentDay, target: 12, pct: Math.max(dayPct, nwPct) };
    }
  },
  {
    id: 'stocks',
    name: 'Stock Exchange (BSE / NSE)',
    icon: '📈',
    tagline: 'Trade equities, collect quarterly dividends, and set up auto SIPs.',
    requirementText: 'Reach ₹25,000 Net Worth or Day 15',
    unlockDayMin: 15,
    unlockNetWorthMin: 25000,
    condition: (state) => state.player.currentDay >= 15 || calculateNetWorth(state) >= 25000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      const nwPct = Math.min(100, Math.round((nw / 25000) * 100));
      const dayPct = Math.min(100, Math.round((state.player.currentDay / 15) * 100));
      return { current: nw, target: 25000, pct: Math.max(dayPct, nwPct) };
    }
  },
  {
    id: 'gold',
    name: '24K Physical Gold Vault',
    icon: '✨',
    tagline: 'Inflation safe-haven bullion asset that protects long-term purchasing power.',
    requirementText: 'Reach ₹35,000 Net Worth',
    unlockNetWorthMin: 35000,
    condition: (state) => calculateNetWorth(state) >= 35000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      return { current: nw, target: 35000, pct: Math.min(100, Math.round((nw / 35000) * 100)) };
    }
  },
  {
    id: 'real-estate',
    name: 'Real Estate Marketplace',
    icon: '🏢',
    tagline: 'Acquire rental flats and land for passive monthly rent and capital appreciation.',
    requirementText: 'Reach ₹65,000 Net Worth',
    unlockNetWorthMin: 65000,
    condition: (state) => calculateNetWorth(state) >= 65000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      return { current: nw, target: 65000, pct: Math.min(100, Math.round((nw / 65000) * 100)) };
    }
  },
  {
    id: 'business',
    name: 'Commercial Enterprise & Franchises',
    icon: '💼',
    tagline: 'Compete with city NPCs for scarce operator licenses in profitable commerce sectors.',
    requirementText: 'Reach ₹1,00,000 Net Worth (Lakhpati Status)',
    unlockNetWorthMin: 100000,
    condition: (state) => calculateNetWorth(state) >= 100000,
    progress: (state) => {
      const nw = calculateNetWorth(state);
      return { current: nw, target: 100000, pct: Math.min(100, Math.round((nw / 100000) * 100)) };
    }
  }
];
