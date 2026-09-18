import { INSTRUMENTS } from './constants.js';
import { randFloat } from '../utils/random.js';

export const calculateMonthlyReturns = (instrumentAllocations, totalPool, economicCycle = 'normal') => {
  if (totalPool <= 0) return totalPool;
  
  let newTotal = 0;
  Object.keys(instrumentAllocations).forEach(instKey => {
    const allocPct = (instrumentAllocations[instKey] || 0) / 100;
    const amount = totalPool * allocPct;
    if (amount <= 0) return;

    const inst = INSTRUMENTS[instKey];
    let monthlyReturnRate = (inst.avgReturn || 0) / 12;

    // Apply volatility if it's a volatile instrument
    if (inst.minSwing !== undefined && inst.maxSwing !== undefined) {
      const variance = randFloat(-0.015, 0.015);
      monthlyReturnRate += variance;

      // Economic cycle macroeconomic modifiers
      if (economicCycle === 'recession') {
        if (instKey === 'stocks' || instKey === 'mf') {
          // Downturn drag on equities (-1.2% to -2.2% monthly drag)
          monthlyReturnRate -= randFloat(0.012, 0.022);
        } else if (instKey === 'gold') {
          // Gold safe-haven flight demand
          monthlyReturnRate += randFloat(0.006, 0.014);
        }
      } else if (economicCycle === 'bull') {
        if (instKey === 'stocks' || instKey === 'mf') {
          // Bull market expansion (+0.8% to +1.8% monthly boost)
          monthlyReturnRate += randFloat(0.008, 0.018);
        }
      }
    }

    newTotal += amount * (1 + monthlyReturnRate);
  });
  
  return newTotal;
};

export const applyEventToInstruments = (eventType, instrumentAllocations, totalPool) => {
  let newTotal = totalPool;
  
  const applyShock = (instKey, minShock, maxShock) => {
    const allocPct = (instrumentAllocations[instKey] || 0) / 100;
    const amount = totalPool * allocPct;
    const shock = randFloat(minShock, maxShock);
    const delta = amount * shock;
    newTotal += delta;
    return shock;
  };

  const shocks = {};

  switch (eventType) {
    case 'market_crash':
      shocks.stocks = applyShock('stocks', -0.35, -0.20);
      shocks.mf = applyShock('mf', -0.20, -0.10);
      break;
    case 'market_boom':
      shocks.stocks = applyShock('stocks', 0.20, 0.40);
      shocks.mf = applyShock('mf', 0.10, 0.25);
      break;
    case 'mf_correction':
      shocks.mf = applyShock('mf', -0.15, -0.08);
      break;
    case 'gold_surge':
      shocks.gold = applyShock('gold', 0.15, 0.25);
      break;
    default:
      break;
  }
  
  return { newTotal, shocks };
};

export const getBlendedReturn = (instrumentAllocations) => {
  let blended = 0;
  Object.keys(instrumentAllocations).forEach(instKey => {
    const allocPct = (instrumentAllocations[instKey] || 0) / 100;
    const inst = INSTRUMENTS[instKey];
    blended += allocPct * inst.avgReturn;
  });
  return blended;
};
