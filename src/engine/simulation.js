import { calculateMonthlyReturns } from './instruments.js';
import { checkMilestone, inflateGoalTarget } from './goals.js';
import { randInt } from '../utils/random.js';
import { TOTAL_DAYS } from './constants.js';
import { CITY_TIER_SALARY_CAPS } from './careers.js';

export const shouldTriggerEvent = (currentDay, lastEventDay) => {
  const daysSince = currentDay - lastEventDay;
  if (daysSince < 35) return false;
  
  const chance = Math.min(0.85, (daysSince - 35) * 0.025);
  return Math.random() < chance;
};

export function computeIncomeTax(annualIncome) {
  // New Tax Regime FY 2024-25 + Section 87A rebate
  if (annualIncome <= 700000) return 0;

  const slabs = [
    { upto: 300000, rate: 0.00 },
    { upto: 600000, rate: 0.05 },
    { upto: 900000, rate: 0.10 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.20 },
    { upto: Infinity, rate: 0.30 },
  ];

  let tax = 0, prev = 0, remaining = annualIncome;
  for (const slab of slabs) {
    const taxable = Math.min(remaining, slab.upto - prev);
    tax += taxable * slab.rate;
    remaining -= taxable;
    prev = slab.upto;
    if (remaining <= 0) break;
  }
  return Math.round(tax * 1.04); // +4% health & education cess
}

export const getEligibleEvents = (state, eventDeck) => {
  const day = state.currentDay;
  const history = state.eventHistory || [];

  const daysSince = (name) => {
    const last = [...history].reverse().find(e => 
      e.eventName === name || 
      (e.eventName && e.eventName.toLowerCase().includes(name.toLowerCase()))
    );
    return last ? day - last.day : Infinity;
  };

  // If player has no job income, prioritize job recovery/freelance cards
  const isUnemployed = !state.incomes.some(i => i.type === 'job');
  if (isUnemployed) {
    const recoveryEvents = eventDeck.filter(ev => 
      (ev.id === 'freelance_gig' || ev.id === 'senior_job_offer' || ev.id === 'course_upskill' || ev.id === 'new_job_offer') &&
      ev.eligibilityCheck(state)
    );
    if (recoveryEvents.length > 0 && Math.random() < 0.75) {
      return recoveryEvents;
    }
  }

  const isRecession = state.economicCycle === 'recession';
  const isBull = state.economicCycle === 'bull';

  return eventDeck.filter(ev => {
    if (!ev.eligibilityCheck(state)) return false;

    // Suppress discretionary bonuses during recession
    if (isRecession && (ev.id === 'work_bonus' || ev.id === 'salary_hike') && Math.random() < 0.6) {
      return false;
    }

    switch (ev.id) {
      case 'medical_emergency':
        return daysSince('Medical Emergency') > 450; // At least 15 months between major medical hospitalizations
      case 'uninsured_illness':
        return daysSince('Medical Bill') > 300;
      case 'vehicle_accident':
        return daysSince('Vehicle Collision') > 365;
      case 'home_renovation':
        return daysSince('Renovation') > 450;
      case 'inheritance_gift':
        return daysSince('Windfall') > 1000;
      case 'work_bonus':
        return daysSince('Bonus') > 330;
      case 'salary_hike':
        return daysSince('Merit Promotion') > 270;
      case 'job_switch':
        return daysSince('Recruiter Offer') > 180 && state.experienceMonths >= 18;
      case 'job_loss':
        // Cooldown: at least 900 days (~2.5-3 years) since any layoff / restructuring
        // Must not happen in first 365 days of player's career
        return daysSince('Layoff') > 900 && 
               daysSince('Restructuring') > 900 && 
               daysSince('downsizing') > 900 && 
               state.currentDay > 365 &&
               (!isBull || Math.random() < 0.25);
      default:
        return true;
    }
  });
};

export const simulateTick = (state) => {
  const { currentDay, pool, incomes, fixedDeductions, loans, instruments, goals } = state;
  const nextDay = currentDay + 1;
  let milestoneTriggered = null;
  let scheduledEvent = null;
  const stateChanges = { poolDelta: 0, currentDay: nextDay };

  // --- Monthly processing (every 30 days) ---
  if (nextDay % 30 === 0) {
    let netIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    netIncome += state.businessIncome || 0;

    if (state.homesOwned) {
      state.homesOwned.forEach(h => {
        if (h.isRentedOut && h.rentalIncome) netIncome += h.rentalIncome;
      });
    }
    
    let netDeductions = fixedDeductions.reduce((sum, ded) => sum + ded.amount, 0);
    netDeductions += loans.reduce((sum, loan) => sum + loan.emi, 0);
    if (state.hasHealthInsurance) netDeductions += state.healthInsuranceCost;
    if (state.hasVehicleInsurance) netDeductions += state.vehicleInsuranceCost;
    netDeductions += state.homeMaintenanceCost || 0;
    netDeductions += state.carMaintenanceCost || 0;

    const monthlySurplus = netIncome - netDeductions;
    let surplusForPool = monthlySurplus;
    const currentCycle = state.economicCycle || 'normal';

    // Deposit surplus share into active safety funds & compound their returns
    if (state.funds && state.funds.length > 0) {
      const updatedFunds = state.funds.map(fund => {
        let currentAmt = fund.currentAmount || 0;
        if (monthlySurplus > 0 && fund.allocationPercent > 0 && currentAmt < fund.targetAmount) {
          const allocRatio = fund.allocationPercent / 100;
          const deposit = Math.round(monthlySurplus * allocRatio);
          surplusForPool -= deposit;
          currentAmt += deposit;
        }
        if (currentAmt > 0) {
          const fundInst = fund.instruments || { savings: 100 };
          currentAmt = calculateMonthlyReturns(fundInst, currentAmt, currentCycle);
        }
        return { ...fund, currentAmount: Math.round(currentAmt) };
      });
      stateChanges.fundsUpdate = updatedFunds;
    }

    const poolAfterCashflow = Math.max(0, pool + surplusForPool);
    const poolAfterReturns = calculateMonthlyReturns(instruments, poolAfterCashflow, currentCycle);
    const monthlyInvestmentReturns = Math.max(0, poolAfterReturns - poolAfterCashflow);
    
    stateChanges.poolDelta = poolAfterReturns - pool;
    stateChanges.monthlySurplus = monthlySurplus;
    stateChanges.totalIncome = netIncome;
    stateChanges.totalDeductions = netDeductions;

    // Macro Economic Cycle countdown & shifting (12 to 18 months duration)
    const remainingCycleMonths = (state.cycleMonthsRemaining !== undefined ? state.cycleMonthsRemaining : 14) - 1;
    if (remainingCycleMonths <= 0) {
      let nextCycle = 'normal';
      const roll = Math.random();
      if (currentCycle === 'normal') {
        nextCycle = roll < 0.55 ? 'bull' : 'recession';
      } else if (currentCycle === 'bull') {
        nextCycle = roll < 0.70 ? 'normal' : 'recession';
      } else {
        nextCycle = roll < 0.70 ? 'normal' : 'bull';
      }
      stateChanges.economicCycleUpdate = nextCycle;
      stateChanges.cycleMonthsRemainingUpdate = randInt(12, 18);
    } else {
      stateChanges.cycleMonthsRemainingUpdate = remainingCycleMonths;
    }

    // Accumulate annual income for precise tax computation across ALL income streams
    stateChanges.annualIncomeAcc = (state.annualIncomeAcc || 0) + netIncome + monthlyInvestmentReturns;

    const monthNumberInYear = Math.min(12, Math.floor(((nextDay - 1) % 365) / 30) + 1);
    const currentYear = Math.floor((nextDay - 1) / 365) + 1;
    
    // Strict separation: Salary is ONLY type === 'job'
    const salaryEarned = incomes.filter(i => i.type === 'job').reduce((sum, inc) => sum + inc.amount, 0);
    const familyBizEarned = incomes.filter(i => i.type === 'family_business').reduce((sum, inc) => sum + inc.amount, 0);
    const businessEarned = (state.businessIncome || 0) + familyBizEarned;
    let rentEarned = 0;
    if (state.homesOwned) {
      state.homesOwned.forEach(h => {
        if (h.isRentedOut && h.rentalIncome) rentEarned += h.rentalIncome;
      });
    }
    const otherEarned = incomes.filter(i => i.type !== 'job' && i.type !== 'family_business').reduce((sum, inc) => sum + inc.amount, 0);
    const totalEarnedThisMonth = salaryEarned + businessEarned + rentEarned + otherEarned + monthlyInvestmentReturns;

    stateChanges.newMonthlyStatement = {
      id: `stmt_y${currentYear}_m${monthNumberInYear}`,
      day: nextDay,
      year: currentYear,
      month: monthNumberInYear,
      salaryEarned,
      businessEarned,
      rentEarned,
      otherEarned,
      investmentGains: monthlyInvestmentReturns,
      totalEarned: totalEarnedThisMonth,
      totalExpenses: netDeductions,
      surplus: monthlySurplus,
      liquidPoolAfter: poolAfterReturns,
      economicCycle: stateChanges.economicCycleUpdate || currentCycle,
      incomesList: incomes.map(i => ({ ...i })),
      deductionsList: fixedDeductions.map(d => ({ ...d })),
    };

    // Loans countdown
    if (loans.length > 0) {
      stateChanges.loansUpdate = loans.map(l => ({
        ...l,
        remainingMonths: Math.max(0, l.remainingMonths - 1),
      })).filter(l => l.remainingMonths > 0);
    }

    // Experience tracking
    if (incomes.some(i => i.type === 'job' || i.type === 'family_business')) {
      stateChanges.experienceIncrement = 1;
    }
  }

  // --- Annual Processing & Inflation + Salary Raise (Day 365 of each year) ---
  if (nextDay % 365 === 0) {
    const elapsedYears = nextDay / 365;
    const cityTier = state.player?.cityTier || 2;
    const cap = CITY_TIER_SALARY_CAPS[cityTier] || 110000;

    // 1. Inflate goals
    stateChanges.goalsUpdate = goals.map(g => ({
      ...g,
      currentTarget: inflateGoalTarget(g, elapsedYears),
    }));

    // 2. Inflate living expenses & rent by 5.5%
    const updatedDeductions = fixedDeductions.map(d => {
      if (d.type === 'living' || d.type === 'rent') {
        const increase = Math.round(d.amount * 0.055);
        return { ...d, amount: d.amount + increase };
      }
      return d;
    });
    stateChanges.fixedDeductionsUpdate = updatedDeductions;

    // 3. Yearly Performance Appraisal / Salary Raise (diminishing returns, capped at City Tier ceiling)!
    const activeJobs = incomes.filter(i => i.type === 'job');
    let totalHike = 0;
    let hitCeiling = false;

    if (activeJobs.length > 0) {
      stateChanges.incomesUpdate = incomes.map(i => {
        if (i.type === 'job') {
          const sal = i.amount;
          if (sal >= cap) {
            hitCeiling = true;
            return i; // already at or above ceiling
          }
          let baseRate =
            sal < 40000  ? 0.07 :
            sal < 70000  ? 0.05 :
            sal < 100000 ? 0.03 :
                           0.02;
          const courseBonus = (state.courseCompleted && !state.courseRaiseUsed) ? 0.025 : 0;
          const maxAllowedHike = cap - sal;
          const hike = Math.min(maxAllowedHike, Math.round(sal * (baseRate + courseBonus)));
          totalHike += hike;
          if (sal + hike >= cap) hitCeiling = true;
          return { ...i, amount: sal + hike };
        }
        return i;
      });
      if (state.courseCompleted && !state.courseRaiseUsed) {
        stateChanges.courseRaiseUsed = true;
      }
    }

    const livingIncrease = Math.round(
      (fixedDeductions.find(d => d.type === 'living')?.amount || 0) * 0.055
    );

    let reviewDesc = '';
    if (activeJobs.length > 0) {
      if (hitCeiling && totalHike === 0) {
        reviewDesc = `Year-end review: You are at the Tier ${cityTier} corporate base salary ceiling (₹${(cap / 100000).toFixed(1)}L/mo). Further wealth requires equity investments or business ownership. Living expenses adjusted by +₹${livingIncrease.toLocaleString('en-IN')}/mo.`;
      } else {
        reviewDesc = `Year-end corporate review: You received an annual merit raise of +₹${totalHike.toLocaleString('en-IN')}/mo (capped at Tier ${cityTier} limit)! Meanwhile, living expenses adjusted by +₹${livingIncrease.toLocaleString('en-IN')}/mo.`;
      }
    } else {
      reviewDesc = `Annual inflation review: Living expenses adjusted by +₹${livingIncrease.toLocaleString('en-IN')}/mo to match CPI index.`;
    }

    scheduledEvent = {
      id: 'annual_inflation',
      name: 'Annual Year-End Review',
      type: totalHike >= livingIncrease ? 'good' : 'neutral',
      icon: '📅',
      description: reviewDesc,
      financialImpact: {
        type: 'inflation',
        increaseAmount: livingIncrease,
        hikeAmount: totalHike,
      },
      options: [
        {
          label: totalHike > 0 ? `Accept Review (Net: +₹${(totalHike - livingIncrease).toLocaleString('en-IN')}/mo)` : `Adjust Budget (+₹${livingIncrease.toLocaleString('en-IN')}/mo cost)`,
          description: 'Updated automatically in your monthly income and expenses columns.'
        }
      ]
    };
  }

  // --- Annual Tax Assessment (Day 360 of each year, after month 12 earnings) ---
  if (nextDay % 365 === 360) {
    const statements = state.currentYearStatements || [];
    const statementSum = statements.reduce((sum, s) => sum + (s.totalEarned || 0), 0);
    const month12Earned = stateChanges.newMonthlyStatement ? stateChanges.newMonthlyStatement.totalEarned : 0;
    const hasMonth12InHistory = statements.some(s => s.month === 12);
    const actualYearTotal = hasMonth12InHistory ? statementSum : (statementSum + month12Earned);

    const rentalIncome = (state.homesOwned || [])
      .filter(h => h.isRentedOut && h.rentalIncome)
      .reduce((sum, h) => sum + h.rentalIncome, 0);
    const fallbackAllIncome = ((incomes.reduce((s, i) => s + i.amount, 0) + (state.businessIncome || 0) + rentalIncome) * 12);
    const annualEarned = actualYearTotal > 0 ? actualYearTotal : fallbackAllIncome;
    const taxBill = computeIncomeTax(annualEarned);

    const statementCount = statements.length + (hasMonth12InHistory ? 0 : (stateChanges.newMonthlyStatement ? 1 : 0));

    scheduledEvent = {
      id: 'annual_tax',
      name: 'Annual Income Tax Assessment',
      type: taxBill > 0 ? 'bad' : 'neutral',
      icon: '🏛️',
      description: taxBill > 0
        ? `Tax filing season: Assessed based on New Regime slabs on your actual ₹${annualEarned.toLocaleString('en-IN')} total annual earnings added up across your 12 monthly statements (reflecting all salary changes, gaps, business, rent & returns).`
        : `Tax filing season: Actual total earnings ₹${annualEarned.toLocaleString('en-IN')} across your 12 monthly statements are within the rebate limit (Section 87A). ₹0 tax liability!`,
      financialImpact: {
        type: 'loss',
        amount: taxBill,
        annualIncome: annualEarned,
        isAllIncome: true,
        statementCount,
      },
      options: [
        {
          label: taxBill > 0 ? `File Returns & Pay Tax (₹${taxBill.toLocaleString('en-IN')})` : `File Returns (₹0 Tax Payable)`,
          description: taxBill > 0 ? `Assessed on actual statements. Paid strictly from liquid savings buffer.` : `Full rebate applied under New Tax Regime.`
        }
      ]
    };

    stateChanges.resetYearStatements = true;
    stateChanges.annualIncomeAcc = 0;
  }

  // --- Marriage age trigger ---
  if (
    !state.marriageEventFired &&
    !state.married &&
    state.player?.marriageAge &&
    (22 + nextDay / 365) >= state.player.marriageAge &&
    !scheduledEvent
  ) {
    stateChanges.marriageEventFired = true;
    stateChanges.shouldTriggerMarriage = true;
  }

  // --- Milestones check ---
  if (nextDay % 5 === 0) {
    const currentPool = pool + (stateChanges.poolDelta || 0);
    for (const goal of goals) {
      if (!goal.achieved && !goal.sacrificed) {
        const allocatedAmount = (currentPool * (goal.bucketPercent / 100)) + (goal.dedicatedContribution || 0);
        if (checkMilestone(goal, allocatedAmount)) {
          milestoneTriggered = {
            goalId: goal.id,
            goalName: goal.name,
            currentValue: Math.round(allocatedAmount),
            targetValue: Math.round(goal.currentTarget),
          };
          break;
        }
      }
    }
  }

  // Broke check
  const projectedPool = pool + (stateChanges.poolDelta || 0);
  
  const monthlySurplus = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    + (state.businessIncome || 0)
    + (state.homesOwned || []).filter(h => h.isRentedOut && h.rentalIncome).reduce((s, h) => s + h.rentalIncome, 0)
    - fixedDeductions.reduce((sum, ded) => sum + ded.amount, 0)
    - loans.reduce((sum, loan) => sum + loan.emi, 0)
    - (state.hasHealthInsurance ? (state.healthInsuranceCost || 0) : 0)
    - (state.hasVehicleInsurance ? (state.vehicleInsuranceCost || 0) : 0)
    - (state.homeMaintenanceCost || 0)
    - (state.carMaintenanceCost || 0);

  const hasAssetsToSell = (state.carsOwned || []).length > 0
    || (state.homesOwned || []).length > 0
    || state.hasActiveBusiness;

  if (projectedPool <= 0 && monthlySurplus <= 0 && !hasAssetsToSell) {
    stateChanges.gameOverReason = 'broke';
  }

  if (nextDay >= TOTAL_DAYS) {
    stateChanges.gameOverReason = 'time_up';
  }

  return { stateChanges, eventTriggered: scheduledEvent, milestoneTriggered };
};
