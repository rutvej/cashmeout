import { calculateMonthlyReturns } from './instruments.js';
import { checkMilestone, inflateGoalTarget } from './goals.js';
import { randInt } from '../utils/random.js';
import { TOTAL_DAYS } from './constants.js';

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
    const last = [...history].reverse().find(e => e.eventName === name);
    return last ? day - last.day : Infinity;
  };

  // If player has no job income, prioritize job recovery/freelance cards
  const isUnemployed = !state.incomes.some(i => i.type === 'job');
  if (isUnemployed) {
    const recoveryEvents = eventDeck.filter(ev => 
      (ev.id === 'freelance_gig' || ev.id === 'senior_job_offer' || ev.id === 'course_upskill') &&
      ev.eligibilityCheck(state)
    );
    if (recoveryEvents.length > 0 && Math.random() < 0.75) {
      return recoveryEvents;
    }
  }

  return eventDeck.filter(ev => {
    if (!ev.eligibilityCheck(state)) return false;
    switch (ev.id) {
      case 'inheritance_gift':
        return daysSince('Family Windfall Gift') > 1000;
      case 'work_bonus':
        return daysSince('Annual Corporate Bonus') > 330;
      case 'salary_hike':
        return daysSince('Merit Promotion & Raise') > 270;
      case 'job_switch':
        return daysSince('Senior Role Recruiter Offer') > 180 && state.experienceMonths >= 18;
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
    const poolAfterCashflow = pool + monthlySurplus;

    // Apply returns
    const poolAfterReturns = calculateMonthlyReturns(instruments, poolAfterCashflow);
    const monthlyInvestmentReturns = Math.max(0, poolAfterReturns - poolAfterCashflow);
    
    stateChanges.poolDelta = poolAfterReturns - pool;
    stateChanges.monthlySurplus = monthlySurplus;
    stateChanges.totalIncome = netIncome;
    stateChanges.totalDeductions = netDeductions;

    // Accumulate annual income for precise tax computation across ALL income streams (Salary, Business, Rental, Capital Gains)
    stateChanges.annualIncomeAcc = (state.annualIncomeAcc || 0) + netIncome + monthlyInvestmentReturns;

    const monthNumberInYear = Math.min(12, Math.floor(((nextDay - 1) % 365) / 30) + 1);
    const currentYear = Math.floor((nextDay - 1) / 365) + 1;
    const salaryEarned = incomes.filter(i => i.type === 'job' || i.type === 'family_business').reduce((sum, inc) => sum + inc.amount, 0);
    const businessEarned = state.businessIncome || 0;
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

    // 3. Yearly Performance Appraisal / Salary Raise (diminishing returns)!
    const activeJobs = incomes.filter(i => i.type === 'job');
    let totalHike = 0;
    if (activeJobs.length > 0) {
      stateChanges.incomesUpdate = incomes.map(i => {
        if (i.type === 'job') {
          const sal = i.amount;
          // Diminishing returns by salary band
          let baseRate =
            sal < 40000  ? 0.10 :
            sal < 70000  ? 0.07 :
            sal < 100000 ? 0.05 :
            sal < 150000 ? 0.04 :
                           0.03;
          // Course boost: one-time 12% bonus, not recurring
          const courseBonus = (state.courseCompleted && !state.courseRaiseUsed) ? 0.12 : 0;
          const hike = Math.round(sal * (baseRate + courseBonus));
          totalHike += hike;
          return { ...i, amount: sal + hike };
        }
        return i;
      });
      // Mark course raise as used after first application
      if (state.courseCompleted && !state.courseRaiseUsed) {
        stateChanges.courseRaiseUsed = true;
      }
    }

    const livingIncrease = Math.round(
      (fixedDeductions.find(d => d.type === 'living')?.amount || 0) * 0.055
    );

    scheduledEvent = {
      id: 'annual_inflation',
      name: 'Annual Year-End Review',
      type: totalHike >= livingIncrease ? 'good' : 'neutral',
      icon: '📅',
      description: activeJobs.length > 0
        ? `Year-end corporate review: You received an annual merit raise of +₹${totalHike.toLocaleString('en-IN')}/mo! Meanwhile, living expenses adjusted by +₹${livingIncrease.toLocaleString('en-IN')}/mo to match inflation.`
        : `Annual inflation review: Living expenses adjusted by +₹${livingIncrease.toLocaleString('en-IN')}/mo to match CPI index.`,
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
    // Strictly calculate tax by adding up the actual earnings from each monthly statement of the year
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
        const allocatedAmount = currentPool * (goal.bucketPercent / 100);
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
