// Pure deterministic simulation loop engine
import { INSTRUMENTS, calculateEffectiveSIPs } from './compoundingEngine.js';

/**
 * Calculates current net worth from character assets, goal investments, and debt.
 */
export function calculateNetWorth(character, goals, liquidCash, hasHomeAsset = false) {
  const totalInvestments = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalDebt = (character.loans || []).reduce(
    (sum, l) => sum + (l.principalRemaining || 0),
    0
  );
  const homeValue = hasHomeAsset ? (character.homePropertyAssetValue || 0) : 0;
  return Math.round(liquidCash + totalInvestments + homeValue - totalDebt);
}

/**
 * Advances simulation by 1 month according to specs/mechanics/05-simulation-loop-and-calendar.md.
 * 
 * @param {Object} state - Full game state snapshot
 * @returns {Object} Updated game state snapshot
 */
export function tickMonthlySimulation(state) {
  const { character, goals, insurance, simulation } = state;

  if (simulation.isPaused) {
    return state;
  }

  const nextMonthIndex = simulation.currentMonthIndex + 1;
  const currentAge = character.age + Math.floor(nextMonthIndex / 12);
  const monthOfYear = (nextMonthIndex % 12) === 0 ? 12 : (nextMonthIndex % 12);
  const isAnnualAnniversary = nextMonthIndex > 0 && nextMonthIndex % 12 === 0;

  // 1. Inflows
  const takeHome = character.monthlyTakeHome;

  // 2. Outflows
  const healthPremium = insurance.health?.isPurchased ? insurance.health.monthlyPremium : 0;
  const termPremium = insurance.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0;
  const totalInsurance = healthPremium + termPremium;

  const totalLoanEMIs = (character.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalOutflows = character.totalFixedExpenses + totalInsurance + totalLoanEMIs;

  // 3. Monthly Surplus
  let monthlySurplus = takeHome - totalOutflows;
  let liquidCash = character.liquidCash;
  let updatedGoals = goals.map((g) => ({ ...g }));
  let activeModal = simulation.activeModal;
  let isPaused = simulation.isPaused;
  let modalQueue = [...(simulation.modalQueue || [])];

  // Deficit handling (if outflow > takeHome)
  if (monthlySurplus < 0) {
    const deficit = Math.abs(monthlySurplus);
    if (liquidCash >= deficit) {
      liquidCash -= deficit;
    } else {
      const remainingDeficit = deficit - liquidCash;
      liquidCash = 0;
      // Draw from Emergency Fund
      const emgIndex = updatedGoals.findIndex((g) => g.id === 'goal_emergency');
      if (emgIndex >= 0) {
        updatedGoals[emgIndex].currentAmount = Math.max(
          0,
          (updatedGoals[emgIndex].currentAmount || 0) - remainingDeficit
        );
        updatedGoals[emgIndex].status = 'refill_needed';
      }
    }
    monthlySurplus = 0;
  }

  // 4. Distribute Waterfall SIPs (Strictly Prevent Overflowing Full Goals)
  const effectiveSIPs = calculateEffectiveSIPs(updatedGoals);
  let totalSIPDeductions = 0;

  updatedGoals = updatedGoals.map((g) => {
    const sip = effectiveSIPs[g.id] || 0;
    let current = g.currentAmount || 0;
    const target = g.targetAmount || 1;

    // Strict cap: If goal is already at or above target, ensure currentAmount does not exceed target
    // and sweep any legacy excess into liquid bank cash!
    if (current >= target) {
      const legacyExcess = current - target;
      if (legacyExcess > 0) {
        liquidCash += legacyExcess;
      }
      return {
        ...g,
        currentAmount: target,
        effectiveMonthlySIP: 0,
      };
    }

    // Goal still needs funds: only take what is needed up to targetAmount
    const needed = Math.max(0, target - current);
    const actualContribution = Math.min(sip, needed);
    totalSIPDeductions += actualContribution;

    // If target was reached with a partial amount from this SIP, spill remainder into bank cash
    const excess = sip - actualContribution;
    if (excess > 0) {
      liquidCash += excess;
    }

    return {
      ...g,
      effectiveMonthlySIP: actualContribution,
      currentAmount: Math.min(target, current + actualContribution),
    };
  });

  // Leftover surplus after SIPs deposits into liquid bank balance
  const leftoverSurplus = Math.max(0, monthlySurplus - totalSIPDeductions);
  liquidCash += leftoverSurplus;

  // 5. Compound Investments with Monthly Rates (Strict Cap on Emergency Fund & Fixed Goals)
  updatedGoals = updatedGoals.map((g) => {
    const inst = INSTRUMENTS[g.instrumentId] || INSTRUMENTS.savings;
    const monthlyRate = inst.monthlyRate;
    const balance = g.currentAmount || 0;
    const target = g.targetAmount || 1;
    const growth = Math.round(balance * monthlyRate);

    let newBalance = balance + growth;
    let excessGrowth = 0;
    let status = g.status;

    // Strict non-overflow check for Emergency Fund and capped goals:
    // Once emergency fund or a capped goal is at target, interest yield must NOT inflate the fund!
    // It is swept directly into the player's bank cash as passive income.
    const isFixedCap = g.id === 'goal_emergency' || g.id === 'goal_vacation' || (g.kind === 'milestone' && balance >= target);

    if (isFixedCap) {
      if (balance >= target) {
        // Already full: keep at exact target; all interest goes to bank cash
        excessGrowth = growth;
        newBalance = target;
      } else if (newBalance > target) {
        // Crossed target this month: cap at target; spill excess interest to bank cash
        excessGrowth = newBalance - target;
        newBalance = target;
      }
    }

    if (g.id === 'goal_emergency') {
      status = newBalance >= target ? 'buffer_full' : 'in_progress';
    } else if (newBalance >= target) {
      status = 'completed';
    }

    if (excessGrowth > 0) {
      liquidCash += excessGrowth;
    }

    return {
      ...g,
      currentAmount: newBalance,
      status,
    };
  });

  // 6. Service Loans
  let updatedLoans = (character.loans || []).map((l) => {
    const nextTenure = Math.max(0, l.tenureMonthsRemaining - 1);
    const monthlyInterest = (l.principalRemaining * (l.interestRateAnnual / 12));
    const principalPaid = Math.max(0, l.emi - monthlyInterest);
    const nextPrincipal = nextTenure === 0 ? 0 : Math.max(0, Math.round(l.principalRemaining - principalPaid));

    return {
      ...l,
      tenureMonthsRemaining: nextTenure,
      principalRemaining: nextPrincipal,
    };
  }).filter((l) => l.principalRemaining > 0 && l.tenureMonthsRemaining > 0);

  const nextTotalLoanEMIs = updatedLoans.reduce((sum, l) => sum + l.emi, 0);

  // 7. Check Milestones by Age
  let pendingMilestone = null;
  const reachedMilestones = updatedGoals.filter(
    (g) => g.kind === 'milestone' && g.targetAge === currentAge && monthOfYear === 1 && !g.milestoneTriggered
  );

  if (reachedMilestones.length > 0) {
    pendingMilestone = reachedMilestones[0];
    isPaused = true;
    const milestoneModal = {
      type: 'milestone',
      goal: pendingMilestone,
    };
    if (!activeModal) {
      activeModal = milestoneModal;
    } else {
      modalQueue.push(milestoneModal);
    }
    updatedGoals = updatedGoals.map((g) =>
      g.id === pendingMilestone.id ? { ...g, milestoneTriggered: true } : g
    );
  }

  // 8. Check Annual Vacation Cycle (Every 12 Months)
  // Supports automated mode ("dont show this card again and select default for vacation and continue without stopping")
  if (isAnnualAnniversary) {
    const vacIndex = updatedGoals.findIndex((g) => g.id === 'goal_vacation');
    if (vacIndex >= 0) {
      const vac = updatedGoals[vacIndex];
      const isSuccess = (vac.currentAmount || 0) >= (vac.targetAmount || 1);
      const shortfall = isSuccess ? 0 : Math.max(0, vac.targetAmount - (vac.currentAmount || 0));

      if (simulation.autoVacation) {
        // AUTOMATED MODE: Reset vacation corpus and continue running without pausing!
        updatedGoals[vacIndex].currentAmount = 0;
      } else {
        isPaused = true;
        const vacationModal = {
          type: 'vacation',
          data: {
            wasSuccessful: isSuccess,
            savedAmount: vac.currentAmount || 0,
            targetAmount: vac.targetAmount,
            shortfall,
            currentYear: Math.floor(nextMonthIndex / 12),
            selectedTierOption: vac.selectedTierOption || 'domestic',
          },
        };
        if (!activeModal) {
          activeModal = vacationModal;
        } else {
          modalQueue.push(vacationModal);
        }
      }
    }
  }

  // 9. Check Annual Salary Appraisal (+5% to +7%)
  let updatedTakeHome = takeHome;
  let updatedGross = character.grossMonthlySalary;
  if (isAnnualAnniversary) {
    const hikeRate = 0.06; // 6% average annual hike
    updatedGross = Math.round((character.grossMonthlySalary * (1 + hikeRate)) / 500) * 500;
    const taxRate = updatedGross * 12 > 700000 ? 0.12 : 0.06;
    const taxAndPF = Math.round(updatedGross * taxRate);
    updatedTakeHome = updatedGross - taxAndPF;
    const deltaSurplus = updatedTakeHome - takeHome;

    isPaused = true;
    const raiseModal = {
      type: 'raise',
      hikeRate,
      oldTakeHome: takeHome,
      newTakeHome: updatedTakeHome,
      deltaSurplus,
    };
    if (!activeModal) {
      activeModal = raiseModal;
    } else {
      modalQueue.push(raiseModal);
    }
  }

  // 10. Check Retirement (Age 60)
  const isRetirementReached = currentAge >= (character.retirementAge || 60);

  // If retirement reached, dismiss intermediate modals and trigger scorecard
  if (isRetirementReached) {
    isPaused = true;
    activeModal = null;
    modalQueue = [];
  }

  // 11. Net Worth Snapshot
  const netWorth = calculateNetWorth(
    { ...character, loans: updatedLoans },
    updatedGoals,
    liquidCash
  );

  const newHistoryEntry = {
    month: nextMonthIndex,
    age: currentAge,
    netWorth,
    liquidCash,
    totalInvestments: updatedGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0),
    totalDebt: updatedLoans.reduce((sum, l) => sum + l.principalRemaining, 0),
  };

  const updatedCharacter = {
    ...character,
    grossMonthlySalary: updatedGross,
    monthlyTakeHome: updatedTakeHome,
    loans: updatedLoans,
    liquidCash,
    totalLoanEMIs: nextTotalLoanEMIs,
    totalMonthlyOutflow: character.totalFixedExpenses + nextTotalLoanEMIs + totalInsurance,
    monthlySurplus: updatedTakeHome - (character.totalFixedExpenses + nextTotalLoanEMIs + totalInsurance),
  };

  return {
    ...state,
    currentScreen: isRetirementReached ? 'scorecard' : state.currentScreen,
    character: updatedCharacter,
    goals: updatedGoals,
    simulation: {
      ...simulation,
      currentMonthIndex: nextMonthIndex,
      currentAge,
      currentMonthOfYear: monthOfYear,
      isPaused: isRetirementReached ? true : isPaused,
      activeModal: isRetirementReached ? null : activeModal,
      modalQueue: isRetirementReached ? [] : modalQueue,
      history: [...(simulation.history || []), newHistoryEntry],
    },
  };
}
