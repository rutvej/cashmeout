import { GameState } from '../types/game';
import { HEALTH_INSURANCE_TIERS, OTHER_INSURANCE } from '../data/insurance';

export interface MonthlyCashflowBreakdown {
  inflows: {
    salary: number;
    businessProfit: number;
    rentalIncome: number;
    totalInflow: number;
  };
  outflows: {
    housingCost: number; // rent or mortgage
    loanEMIs: number;
    insuranceCost: number;
    foodBudget: number;
    utilitiesCost: number;
    totalFixedOutflow: number;
  };
  netFreeCashflow: number;
  emergencyFundMonths: number;
  emergencyTier: 'critical' | 'vulnerable' | 'stable' | 'fortress';
}

export function calculateIncomeTax(annualIncome: number): number {
  if (annualIncome <= 15000) return 0;

  let tax = 0;
  // 15,001 to 35,000 taxed at 10%
  const bracket1 = Math.min(annualIncome, 35000) - 15000;
  if (bracket1 > 0) {
    tax += bracket1 * 0.10;
  }

  // 35,001 to 65,000 taxed at 20%
  if (annualIncome > 35000) {
    const bracket2 = Math.min(annualIncome, 65000) - 35000;
    tax += bracket2 * 0.20;
  }

  // Above 65,000 taxed at 30%
  if (annualIncome > 65000) {
    const bracket3 = annualIncome - 65000;
    tax += bracket3 * 0.30;
  }

  return Math.round(tax);
}

export function computeMonthlyCashflow(state: GameState): MonthlyCashflowBreakdown {
  // Inflows
  const salary = state.career.currentJob ? state.career.currentJob.salaryMonthly : 0;
  
  let businessProfit = 0;
  for (const biz of state.business.activeBusinesses) {
    businessProfit += Math.max(0, biz.currentMonthlyRevenue - biz.currentMonthlyOpsCost);
  }

  let rentalIncome = 0;
  for (const prop of state.property.ownedProperties) {
    if (prop.type === 'rental' && !prop.isVacant) {
      rentalIncome += prop.tenantMonthlyRent;
    }
  }

  const totalInflow = salary + businessProfit + rentalIncome;

  // Outflows
  let housingCost = 0;
  if (state.property.isRenting) {
    housingCost = state.property.currentMonthlyRent;
  } else {
    // Primary home mortgage
    const home = state.property.ownedProperties.find(p => p.type === 'home');
    if (home) housingCost = home.monthlyEMI;
  }

  // Loan EMIs + investment property mortgages
  let loanEMIs = state.liabilities.loans.reduce((sum, l) => sum + l.monthlyEMI, 0);
  for (const prop of state.property.ownedProperties) {
    if (prop.type === 'rental') {
      loanEMIs += prop.monthlyEMI;
    }
  }

  // Insurance
  const healthPlan = HEALTH_INSURANCE_TIERS.find(t => t.tier === state.insurance.healthInsuranceTier);
  let insuranceCost = healthPlan ? healthPlan.monthlyPremium : 0;
  if (state.insurance.hasVehicleInsurance) insuranceCost += OTHER_INSURANCE.vehicle.monthlyPremium;
  if (state.insurance.hasTermLifeInsurance) insuranceCost += OTHER_INSURANCE.termLife.monthlyPremium;
  if (state.insurance.hasPropertyInsurance) insuranceCost += OTHER_INSURANCE.property.monthlyPremium;

  const foodBudget = state.resources.dailySchedule.mealDisciplineHours >= 1 ? 380 : 280;
  const utilitiesCost = 140;

  const totalFixedOutflow = housingCost + loanEMIs + insuranceCost + foodBudget + utilitiesCost;
  const netFreeCashflow = totalInflow - totalFixedOutflow;

  const emergencyFundMonths = totalFixedOutflow > 0
    ? Number((state.resources.emergencyFund / totalFixedOutflow).toFixed(1))
    : 10;

  let emergencyTier: 'critical' | 'vulnerable' | 'stable' | 'fortress' = 'stable';
  if (emergencyFundMonths < 0.8) emergencyTier = 'critical';
  else if (emergencyFundMonths < 2.5) emergencyTier = 'vulnerable';
  else if (emergencyFundMonths < 5.5) emergencyTier = 'stable';
  else emergencyTier = 'fortress';

  return {
    inflows: {
      salary,
      businessProfit,
      rentalIncome,
      totalInflow
    },
    outflows: {
      housingCost,
      loanEMIs,
      insuranceCost,
      foodBudget,
      utilitiesCost,
      totalFixedOutflow
    },
    netFreeCashflow,
    emergencyFundMonths,
    emergencyTier
  };
}

export function executeSalaryDaySettlement(
  state: GameState,
  allocations: {
    emergencyTopUp: number;
    sipEquities: number;
    extraDebtPaydown: number;
    funMoney: number;
  }
): void {
  const cf = computeMonthlyCashflow(state);

  // Credit HYSA interest on Emergency Fund (3.5% annual / 12 per Spec 14 Section 4)
  const hysaMonthlyYield = Math.round((state.resources.emergencyFund * 0.035) / 12);
  state.resources.emergencyFund += hysaMonthlyYield;

  // Process loans: reduce balance, pay EMIs
  for (const loan of state.liabilities.loans) {
    const interest = Math.round((loan.balance * loan.annualInterestRate) / 12);
    const principalPaid = Math.max(0, loan.monthlyEMI - interest);
    loan.balance = Math.max(0, loan.balance - principalPaid);
    loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);
  }

  // Extra debt paydown (Debt avalanche: target highest interest loan)
  if (allocations.extraDebtPaydown > 0 && state.liabilities.loans.length > 0) {
    const highestInterestLoan = [...state.liabilities.loans].sort((a, b) => b.annualInterestRate - a.annualInterestRate)[0];
    if (highestInterestLoan) {
      highestInterestLoan.balance = Math.max(0, highestInterestLoan.balance - allocations.extraDebtPaydown);
    }
  }

  // Filter out paid off loans
  state.liabilities.loans = state.liabilities.loans.filter(l => l.balance > 0);

  // Process property mortgages
  for (const prop of state.property.ownedProperties) {
    if (prop.mortgageBalance > 0) {
      const principalPaid = Math.max(0, Math.round(prop.monthlyEMI * 0.65));
      prop.mortgageBalance = Math.max(0, prop.mortgageBalance - principalPaid);
    }
  }

  // Allocations to Emergency & Investments
  state.resources.emergencyFund += allocations.emergencyTopUp;
  state.resources.cashOnHand += (cf.netFreeCashflow - allocations.emergencyTopUp - allocations.sipEquities - allocations.extraDebtPaydown);

  // Auto-SIP funding
  if (allocations.sipEquities > 0) {
    const fund = state.investments.mutualFundUnits['fund-broad'];
    if (fund) {
      fund.investedAmount += allocations.sipEquities;
      fund.units += allocations.sipEquities / 100;
    } else {
      state.investments.mutualFundUnits['fund-broad'] = {
        units: allocations.sipEquities / 100,
        investedAmount: allocations.sipEquities
      };
    }
  }

  // Accumulate taxable income for year
  state.resources.currentYearTaxableIncome += cf.inflows.totalInflow;
}
