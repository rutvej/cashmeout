import { INSTRUMENTS } from './constants.js';
import { randFloat } from '../utils/random.js';

export const calculateMonthlyReturns = (instrumentAllocations, totalPool) => {
  if (totalPool <= 0) return totalPool;
  
  let newTotal = 0;
  Object.keys(instrumentAllocations).forEach(instKey => {
    const allocPct = instrumentAllocations[instKey] / 100;
    const amount = totalPool * allocPct;
    if (amount <= 0) return;

    const inst = INSTRUMENTS[instKey];
    let monthlyReturnRate = inst.avgReturn / 12;

    // Apply volatility if it's a volatile instrument
    if (inst.minSwing !== undefined && inst.maxSwing !== undefined) {
      // Small random walk around the average
      const variance = randFloat(-0.02, 0.02); // normal monthly variance
      monthlyReturnRate += variance;
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
