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
          updatedGoals[emgIndex].currentAmount - remainingDeficit
        );
        updatedGoals[emgIndex].status = 'refill_needed';
      }
    }
    monthlySurplus = 0;
  }

  // 4. Distribute Waterfall SIPs (prevent overflowing full goals)
  const effectiveSIPs = calculateEffectiveSIPs(updatedGoals);
  let totalSIPDeductions = 0;

  updatedGoals = updatedGoals.map((g) => {
    const sip = effectiveSIPs[g.id] || 0;
    const current = g.currentAmount || 0;
    const target = g.targetAmount || 1;

    // If goal is already full and has no active inflow, do not take or add SIP
    if (current >= target && sip === 0) {
      return {
        ...g,
        effectiveMonthlySIP: 0,
      };
    }

    // Cap addition so goal does not overflow target if it's a fixed-target milestone
    const needed = Math.max(0, target - current);
    const actualContribution = Math.min(sip, needed > 0 ? needed : sip);
    totalSIPDeductions += actualContribution;

    // If there is excess from this SIP because target was hit this month, return difference
    const excess = sip - actualContribution;
    if (excess > 0) {
      liquidCash += excess; // spill excess cash directly back into bank cash!
    }

    return {
      ...g,
      effectiveMonthlySIP: actualContribution,
      currentAmount: current + actualContribution,
    };
  });

  // Leftover surplus after SIPs deposits into liquid bank balance
  const leftoverSurplus = Math.max(0, monthlySurplus - totalSIPDeductions);
  liquidCash += leftoverSurplus;

  // 5. Compound Investments with Monthly Rates
  updatedGoals = updatedGoals.map((g) => {
    const inst = INSTRUMENTS[g.instrumentId] || INSTRUMENTS.savings;
    const monthlyRate = inst.monthlyRate;
    const balance = g.currentAmount || 0;
    const growth = Math.round(balance * monthlyRate);
    const newBalance = balance + growth;

    // Check if goal reached target
    let status = g.status;
    if (g.id === 'goal_emergency') {
      status = newBalance >= g.targetAmount ? 'buffer_full' : 'in_progress';
    } else if (newBalance >= g.targetAmount && status !== 'completed') {
      status = 'completed';
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
    activeModal = {
      type: 'milestone',
      goal: pendingMilestone,
    };
    updatedGoals = updatedGoals.map((g) =>
      g.id === pendingMilestone.id ? { ...g, milestoneTriggered: true } : g
    );
  }

  // 8. Check Annual Vacation Cycle (Every 12 Months)
  // Preserves savedAmount for user decision options (loan / other fund / acquired only)
  if (isAnnualAnniversary && !activeModal) {
    const vacIndex = updatedGoals.findIndex((g) => g.id === 'goal_vacation');
    if (vacIndex >= 0) {
      const vac = updatedGoals[vacIndex];
      const isSuccess = (vac.currentAmount || 0) >= (vac.targetAmount || 1);
      const shortfall = isSuccess ? 0 : Math.max(0, vac.targetAmount - (vac.currentAmount || 0));

      isPaused = true;
      activeModal = {
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
    }
  }

  // 9. Check Annual Salary Appraisal (+5% to +7%)
  let updatedTakeHome = takeHome;
  let updatedGross = character.grossMonthlySalary;
  if (isAnnualAnniversary && !activeModal) {
    const hikeRate = 0.06; // 6% average annual hike
    updatedGross = Math.round((character.grossMonthlySalary * (1 + hikeRate)) / 500) * 500;
    const taxRate = updatedGross * 12 > 700000 ? 0.12 : 0.06;
    const taxAndPF = Math.round(updatedGross * taxRate);
    updatedTakeHome = updatedGross - taxAndPF;
    const deltaSurplus = updatedTakeHome - takeHome;

    isPaused = true;
    activeModal = {
      type: 'raise',
      hikeRate,
      oldTakeHome: takeHome,
      newTakeHome: updatedTakeHome,
      deltaSurplus,
    };
  }

  // 10. Check Retirement (Age 60)
  const isRetirementReached = currentAge >= (character.retirementAge || 60);

  // If retirement reached, dismiss intermediate modals and trigger scorecard
  if (isRetirementReached) {
    isPaused = true;
    activeModal = null;
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
      history: [...(simulation.history || []), newHistoryEntry],
    },
  };
}
