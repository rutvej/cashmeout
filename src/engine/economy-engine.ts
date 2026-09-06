import { GameState } from '../types/game';
import { FOOD_TIERS, TRANSPORT_MODES } from '../data/static-data';

export function calculateNetWorth(state: GameState): number {
  const p = state.player;
  let total = p.money + p.savingsBalance;

  // Stocks
  for (const [tickerId, entry] of Object.entries(p.portfolio)) {
    const t = state.market.tickers.find(x => x.id === tickerId);
    if (t) {
      total += entry.shares * t.price;
    }
  }

  // Gold
  total += p.goldHoldings.grams * state.market.goldPricePerGram;

  // Properties
  for (const prop of p.properties) {
    const def = state.market.properties.find(x => x.id === prop.id);
    if (def) total += def.price;
  }

  // Lifestyle assets
  for (const asset of p.lifestyleAssets) {
    total += asset.currentValue;
  }

  // Deduct remaining loan principals
  for (const loan of p.loans) {
    total -= loan.principalRemaining;
  }

  return Math.round(total);
}

export function processDailyLivingExpenses(state: GameState): number {
  const p = state.player;
  const food = FOOD_TIERS[p.lifestyle.foodTier];
  const transport = TRANSPORT_MODES[p.lifestyle.transportMode];

  const utilities = 60; // phone, internet, electricity
  const misc = 30;

  const baseCost = (food.costPerDay + transport.dailyCost + utilities + misc);
  const costWithInflation = Math.round(baseCost * state.inflationMultiplier);

  p.money -= costWithInflation;
  return costWithInflation;
}

export function processDayEconomy(state: GameState, day: number): void {
  const p = state.player;

  // 1. Daily Living Cost
  processDailyLivingExpenses(state);

  // 2. Job Salary Check
  if (day % p.job.payCycleDays === 0) {
    // Stress impact on salary: performance drop if stressed out
    const stressPenaltyFactor = p.stats.stress > 80 ? 0.85 : (p.stats.stress > 60 ? 0.95 : 1.0);
    const earned = Math.round(p.job.salaryPerCycle * stressPenaltyFactor);

    p.money += earned;
    p.taxes.incomeThisCycle += earned;
    p.eventLog.unshift({
      day,
      text: `Payday: Received ₹${earned.toLocaleString('en-IN')} ${stressPenaltyFactor < 1 ? '(reduced by stress)' : ''}`,
      type: 'income'
    });
  }

  // 3. Spouse Income
  if (p.family.married && day % p.job.payCycleDays === 0) {
    p.money += p.family.spouseIncome;
    p.taxes.incomeThisCycle += p.family.spouseIncome;
  }

  // 4. Housing Rent Check
  if (p.housing.type === 'rent') {
    if (day - p.housing.lastPaidDay >= p.housing.cycleDays) {
      const rentDue = Math.round(p.housing.amountPerCycle * state.inflationMultiplier);
      p.money -= rentDue;
      p.housing.lastPaidDay = day;
      p.eventLog.unshift({
        day,
        text: `Rent deduction: Paid ₹${rentDue.toLocaleString('en-IN')}`,
        type: 'expense'
      });
    }
  }

  // 5. Active Loans / EMIs
  for (const loan of p.loans) {
    if (day - loan.lastPaidDay >= loan.cycleDays) {
      if (p.money >= loan.emiAmount) {
        p.money -= loan.emiAmount;
        const interestChunk = (loan.principalRemaining * (loan.interestRate / 12));
        const principalChunk = Math.max(0, loan.emiAmount - interestChunk);
        loan.principalRemaining = Math.max(0, loan.principalRemaining - principalChunk);
        loan.lastPaidDay = day;
      } else {
        // Missed EMI -> Compounding penalty
        loan.missedPayments++;
        loan.principalRemaining = Math.round(loan.principalRemaining * (1 + (loan.interestRate + 0.04) / 12));
        p.stats.stress = Math.min(100, p.stats.stress + 12);
        p.health.mental = Math.max(0, p.health.mental - 8);
        p.eventLog.unshift({
          day,
          text: `⚠️ Missed EMI on ${loan.name}! Penal interest compounded to ₹${loan.principalRemaining.toLocaleString('en-IN')}`,
          type: 'expense'
        });
      }
    }
  }
  p.loans = p.loans.filter(l => l.principalRemaining > 0);

  // 6. Taxes (Annual Cycle)
  if (day - p.taxes.lastPaidDay >= p.taxes.cycleDays) {
    const totalTaxable = p.taxes.incomeThisCycle + p.taxes.capitalGainsThisCycle + p.taxes.dividendIncomeThisCycle;
    const taxOwed = calculateIncomeTax(totalTaxable);
    p.money -= taxOwed;
    p.taxes.lastPaidDay = day;
    p.taxes.incomeThisCycle = 0;
    p.taxes.capitalGainsThisCycle = 0;
    p.taxes.dividendIncomeThisCycle = 0;

    if (taxOwed > 0) {
      p.eventLog.unshift({
        day,
        text: `Annual Tax Assessment: Deducted ₹${taxOwed.toLocaleString('en-IN')}`,
        type: 'expense'
      });
    }
  }

  // 7. Savings account interest (3.5% APY credited daily)
  const dailyInterest = p.savingsBalance * (0.035 / 360);
  p.savingsBalance += dailyInterest;

  // 8. Insurance monthly premiums
  if (day % 30 === 0) {
    const ins = p.insurance;
    const totalPremium = ins.health.premiumPerMonth + ins.vehicle.premiumPerMonth + ins.property.premiumPerMonth + ins.life.premiumPerMonth;
    if (totalPremium > 0) {
      p.money -= totalPremium;
      p.eventLog.unshift({
        day,
        text: `Insurance policy premiums paid: ₹${totalPremium.toLocaleString('en-IN')}`,
        type: 'expense'
      });
    }
  }

  // 9. Inflation creep every 30 days
  if (day % 30 === 0) {
    state.inflationMultiplier *= (1 + state.inflationRate / 12);
  }
}

export function calculateIncomeTax(income: number): number {
  if (income <= 250000) return 0;
  if (income <= 500000) return Math.round((income - 250000) * 0.05);
  if (income <= 1000000) return Math.round(12500 + (income - 500000) * 0.20);
  return Math.round(112500 + (income - 1000000) * 0.30);
}
