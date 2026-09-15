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

export const getEligibleEvents = (state, eventDeck) => {
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

  return eventDeck.filter(ev => ev.eligibilityCheck(state));
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
    
    stateChanges.poolDelta = poolAfterReturns - pool;
    stateChanges.monthlySurplus = monthlySurplus;
    stateChanges.totalIncome = netIncome;
    stateChanges.totalDeductions = netDeductions;

    // Accumulate annual income for precise tax computation
    stateChanges.annualIncomeAcc = (state.annualIncomeAcc || 0) + netIncome;

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

  // --- Annual Tax Assessment (Day 350 of each year) ---
  if (nextDay % 365 === 350) {
    const annualEarned = state.annualIncomeAcc || (incomes.reduce((s, i) => s + i.amount, 0) * 12);
    const taxBill = Math.round(annualEarned * 0.08);

    scheduledEvent = {
      id: 'annual_tax',
      name: 'Annual Income Tax Assessment',
      type: 'bad',
      icon: '🏛️',
      description: `Tax filing season: Computed at 8% effective tax on your ₹${annualEarned.toLocaleString('en-IN')} total annual earnings.`,
      financialImpact: {
        type: 'loss',
        amount: taxBill,
        annualIncome: annualEarned,
      },
      options: [
        {
          label: `File Returns & Pay Tax (₹${taxBill.toLocaleString('en-IN')})`,
          description: `Paid strictly from liquid savings buffer. Total annual income was ₹${annualEarned.toLocaleString('en-IN')}.`
        }
      ]
    };

    stateChanges.annualIncomeAcc = 0;
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

    // 3. Yearly Performance Appraisal / Salary Raise!
    const activeJobs = incomes.filter(i => i.type === 'job');
    let totalHike = 0;
    if (activeJobs.length > 0) {
      const hikeRate = state.courseCompleted ? 0.12 : 0.08; // 12% if upskilled!
      stateChanges.incomesUpdate = incomes.map(i => {
        if (i.type === 'job') {
          const hike = Math.round(i.amount * hikeRate);
          totalHike += hike;
          return { ...i, amount: i.amount + hike };
        }
        return i;
      });
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
  if (projectedPool <= 0 && state.loans.length > 6 && incomes.length === 0) {
    stateChanges.gameOverReason = 'broke';
  }

  if (nextDay >= TOTAL_DAYS) {
    stateChanges.gameOverReason = 'time_up';
  }

  return { stateChanges, eventTriggered: scheduledEvent, milestoneTriggered };
};
