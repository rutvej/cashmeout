// Pure deterministic simulation loop engine
import { INSTRUMENTS, calculateEffectiveSIPs } from './compoundingEngine.js';
import { createPRNG } from './prng.js';

// ─── Phase 1: Shock resolution helper ───────────────────────────────────────

/**
 * Rolls a deterministic shock event for the current month.
 * Returns a shock payload or null if no shock triggered.
 *
 * Rules:
 *  - No shocks in Year 1 (monthIndex <= 12)
 *  - 18-month minimum cooldown via character.lastShockMonthIndex
 *  - ~3% per-month probability (~35%/year)
 *
 * @param {string} seed - Character seed for PRNG
 * @param {number} monthIndex - Current simulation month
 * @param {Object} character - Full character state
 * @param {Object} insurance - Insurance state
 * @returns {Object|null} Shock payload or null
 */
function rollShockEvent(seed, monthIndex, character, insurance) {
  // No shocks in Year 1
  if (monthIndex <= 12) return null;

  // Enforce 18-month cooldown
  const lastShock = character.lastShockMonthIndex ?? -18;
  if (monthIndex - lastShock < 18) return null;

  // Deterministic PRNG keyed to this specific month tick
  // Use a combined seed so each month is unique
  const rng = createPRNG(`${seed}_shock_${monthIndex}`);

  // ~3% per-month probability
  const triggerRoll = rng();
  if (triggerRoll >= 0.03) return null;

  // Pick shock type
  const typeRoll = rng();
  let shockType;
  if (typeRoll < 0.40) {
    shockType = 'shock_medical';
  } else if (typeRoll < 0.70) {
    shockType = 'shock_job_loss';
  } else {
    shockType = 'shock_home_repair';
  }

  const hasHealth = insurance.health?.isPurchased;
  const healthDeductible = insurance.health?.deductible || 5000;

  if (shockType === 'shock_medical') {
    // Gross bill: ₹1,80,000 to ₹3,50,000
    const grossBill = Math.round((180000 + rng() * 170000) / 1000) * 1000;
    const insuranceCoveredAmount = hasHealth ? Math.max(0, grossBill - healthDeductible) : 0;
    const netOutflow = grossBill - insuranceCoveredAmount;

    return {
      type: 'shock_event',
      shockId: 'shock_medical',
      title: 'Medical Emergency!',
      description: 'A sudden hospitalization requires immediate medical attention.',
      grossAmount: grossBill,
      insuranceCoveredAmount,
      netOutflow,
      usedInsurance: hasHealth,
    };
  }

  if (shockType === 'shock_job_loss') {
    // Job loss: 2 to 4 months at ₹0 salary
    const durationMonths = 2 + Math.floor(rng() * 3); // 2, 3, or 4
    const severancePaid = character.monthlyTakeHome; // 1 month severance

    return {
      type: 'shock_event',
      shockId: 'shock_job_loss',
      title: 'Company Layoff!',
      description: 'You have been laid off due to company restructuring. Monthly salary drops to ₹0 until a new job is found.',
      grossAmount: character.monthlyTakeHome * durationMonths,
      insuranceCoveredAmount: 0,
      netOutflow: 0, // Applied as income loss each month; severance credited upfront
      usedInsurance: false,
      unemploymentDuration: durationMonths,
      severancePaid,
    };
  }

  // shock_home_repair: ₹35,000 to ₹75,000
  const repairCost = Math.round((35000 + rng() * 40000) / 500) * 500;
  return {
    type: 'shock_event',
    shockId: 'shock_home_repair',
    title: 'Home / Vehicle Breakdown!',
    description: 'A critical home repair or vehicle breakdown requires an immediate lump-sum payment.',
    grossAmount: repairCost,
    insuranceCoveredAmount: 0,
    netOutflow: repairCost,
    usedInsurance: false,
  };
}

/**
 * Applies a shock's financial impact to liquidCash and emergency fund.
 * Returns { liquidCash, updatedGoals, drawnFromCash, drawnFromEmergency, unfundedDeficit }.
 */
function applyShockCost(netOutflow, liquidCash, updatedGoals) {
  let drawnFromCash = 0;
  let drawnFromEmergency = 0;
  let unfundedDeficit = 0;
  let lc = liquidCash;
  let goals = updatedGoals.map(g => ({ ...g }));

  if (netOutflow <= 0) {
    return { liquidCash: lc, updatedGoals: goals, drawnFromCash, drawnFromEmergency, unfundedDeficit };
  }

  // First draw from liquid cash
  if (lc >= netOutflow) {
    drawnFromCash = netOutflow;
    lc -= netOutflow;
  } else {
    drawnFromCash = lc;
    const remaining = netOutflow - lc;
    lc = 0;

    // Draw remainder from emergency fund
    const emgIdx = goals.findIndex(g => g.id === 'goal_emergency');
    if (emgIdx >= 0) {
      const emgBalance = goals[emgIdx].currentAmount || 0;
      if (emgBalance >= remaining) {
        drawnFromEmergency = remaining;
        goals[emgIdx] = {
          ...goals[emgIdx],
          currentAmount: emgBalance - remaining,
          status: 'refill_needed',
        };
      } else {
        drawnFromEmergency = emgBalance;
        unfundedDeficit = remaining - emgBalance;
        goals[emgIdx] = {
          ...goals[emgIdx],
          currentAmount: 0,
          status: 'refill_needed',
        };
      }
    } else {
      unfundedDeficit = remaining;
    }
  }

  return { liquidCash: lc, updatedGoals: goals, drawnFromCash, drawnFromEmergency, unfundedDeficit };
}

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
  const isRetirementReached = currentAge >= (character.retirementAge || 60);

  let updatedGoals = goals.map((g) => ({ ...g }));
  let activeModal = simulation.activeModal;
  let isPaused = simulation.isPaused;
  let modalQueue = [...(simulation.modalQueue || [])];
  let liquidCash = character.liquidCash;

  // ─── 1. Unemployment State Transition ─────────────────────────────────────
  let employmentStatus = character.employmentStatus || 'employed';
  let unemploymentMonthsRemaining = character.unemploymentMonthsRemaining || 0;
  let preLayoffTakeHome = character.preLayoffTakeHome ?? null;
  let lastShockMonthIndex = character.lastShockMonthIndex ?? -18;

  if (employmentStatus === 'unemployed') {
    if (unemploymentMonthsRemaining > 0) {
      unemploymentMonthsRemaining = Math.max(0, unemploymentMonthsRemaining - 1);
    }
    if (unemploymentMonthsRemaining === 0) {
      // Rehire: restore employment
      employmentStatus = 'employed';
    }
  }

  // ─── 2. Annual Boundary: Inflation, Appraisal Hike, Vacation ─────────────
  let fixedExpenses = character.totalFixedExpenses;
  let grossSalary = character.grossMonthlySalary;
  let baseTakeHome = employmentStatus === 'unemployed' ? (preLayoffTakeHome ?? character.monthlyTakeHome) : character.monthlyTakeHome;

  if (isAnnualAnniversary) {
    // A. Annual Inflation (+5% to +7%, deterministic, rounded to nearest 500)
    const inflationRng = createPRNG(`${character.seed}_inflation_${nextMonthIndex}`);
    const inflationRate = 0.05 + inflationRng() * 0.02; // 5–7%
    fixedExpenses = Math.round((character.totalFixedExpenses * (1 + inflationRate)) / 500) * 500;

    // B. Annual Salary Appraisal (+6% average hike)
    const hikeRate = 0.06;
    grossSalary = Math.round((character.grossMonthlySalary * (1 + hikeRate)) / 500) * 500;
    const taxRate = grossSalary * 12 > 700000 ? 0.12 : 0.06;
    const taxAndPF = Math.round(grossSalary * taxRate);
    const newRaisedTakeHome = grossSalary - taxAndPF;
    const deltaSurplus = newRaisedTakeHome - baseTakeHome;

    if (employmentStatus === 'unemployed') {
      preLayoffTakeHome = newRaisedTakeHome;
    } else {
      baseTakeHome = newRaisedTakeHome;
    }

    isPaused = true;
    const raiseModal = {
      type: 'raise',
      hikeRate,
      oldTakeHome: baseTakeHome,
      newTakeHome: newRaisedTakeHome,
      deltaSurplus,
    };
    if (!activeModal) {
      activeModal = raiseModal;
    } else {
      modalQueue.push(raiseModal);
    }

    // C. Annual Vacation Cycle
    const vacIndex = updatedGoals.findIndex((g) => g.id === 'goal_vacation');
    if (vacIndex >= 0) {
      const vac = updatedGoals[vacIndex];
      const isSuccess = (vac.currentAmount || 0) >= (vac.targetAmount || 1);
      const shortfall = isSuccess ? 0 : Math.max(0, vac.targetAmount - (vac.currentAmount || 0));

      if (simulation.autoVacation) {
        // Automated mode: reset vacation corpus without pausing
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

  // ─── 3. Outflows & Dynamic Emergency Fund Recalculation ───────────────────
  const healthPremium = insurance.health?.isPurchased ? insurance.health.monthlyPremium : 0;
  const termPremium = insurance.termLife?.isPurchased ? insurance.termLife.monthlyPremium : 0;
  const totalInsurance = healthPremium + termPremium;
  const totalLoanEMIs = (character.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalMonthlyOutflow = fixedExpenses + totalInsurance + totalLoanEMIs;

  // Dynamic Emergency Fund Target = 6 × totalMonthlyOutflow
  const dynamicEmergencyTarget = Math.round(6 * totalMonthlyOutflow);
  updatedGoals = updatedGoals.map((g) => {
    if (g.id !== 'goal_emergency') return g;
    const current = g.currentAmount || 0;
    const newStatus = current >= dynamicEmergencyTarget ? 'buffer_full' : (current > 0 ? 'refill_needed' : 'in_progress');
    return {
      ...g,
      targetAmount: dynamicEmergencyTarget,
      status: newStatus,
    };
  });

  // ─── 4. Difficulty Shock Event Roll (PRNG) ────────────────────────────────
  if (employmentStatus === 'employed' && !isRetirementReached) {
    const shockPayload = rollShockEvent(character.seed, nextMonthIndex, {
      ...character,
      lastShockMonthIndex,
    }, insurance);

    if (shockPayload) {
      lastShockMonthIndex = nextMonthIndex;
      let modalData = { ...shockPayload };

      if (shockPayload.shockId === 'shock_job_loss') {
        liquidCash += shockPayload.severancePaid || 0;
        employmentStatus = 'unemployed';
        unemploymentMonthsRemaining = shockPayload.unemploymentDuration;
        preLayoffTakeHome = baseTakeHome;

        const emgGoal = updatedGoals.find(g => g.id === 'goal_emergency');
        modalData = {
          ...modalData,
          drawnFromCash: 0,
          drawnFromEmergency: 0,
          unfundedDeficit: 0,
          emergencyFundBefore: emgGoal?.currentAmount || 0,
          emergencyFundTarget: emgGoal?.targetAmount || 0,
        };
      } else {
        const shockResult = applyShockCost(shockPayload.netOutflow, liquidCash, updatedGoals);
        liquidCash = shockResult.liquidCash;
        updatedGoals = shockResult.updatedGoals;
        modalData = {
          ...modalData,
          drawnFromCash: shockResult.drawnFromCash,
          drawnFromEmergency: shockResult.drawnFromEmergency,
          unfundedDeficit: shockResult.unfundedDeficit,
        };
      }

      isPaused = true;
      if (!activeModal) {
        activeModal = modalData;
      } else {
        modalQueue.push(modalData);
      }
    }
  }

  // ─── 5. Milestone Checks by Age ──────────────────────────────────────────
  const reachedMilestones = updatedGoals.filter(
    (g) => g.kind === 'milestone' && g.targetAge === currentAge && monthOfYear === 1 && !g.milestoneTriggered
  );
  if (reachedMilestones.length > 0) {
    const pendingMilestone = reachedMilestones[0];
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

  // ─── 6. Cash Inflows, Monthly Surplus & Deficit Resolution ────────────────
  const actualTakeHome = employmentStatus === 'unemployed' ? 0 : baseTakeHome;
  let monthlySurplus = actualTakeHome - totalMonthlyOutflow;

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

  // ─── 7. Distribute Waterfall SIPs ────────────────────────────────────────
  const effectiveSIPs = calculateEffectiveSIPs(updatedGoals);
  let totalSIPDeductions = 0;

  updatedGoals = updatedGoals.map((g) => {
    const sip = effectiveSIPs[g.id] || 0;
    let current = g.currentAmount || 0;
    const target = g.targetAmount || 1;

    // Strict cap: If goal is already at or above target, ensure currentAmount does not exceed target
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

    const needed = Math.max(0, target - current);
    const actualContribution = Math.min(sip, needed);
    totalSIPDeductions += actualContribution;

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

  const leftoverSurplus = Math.max(0, monthlySurplus - totalSIPDeductions);
  liquidCash += leftoverSurplus;

  // ─── 8. Compound Investments with Monthly Rates ──────────────────────────
  updatedGoals = updatedGoals.map((g) => {
    const inst = INSTRUMENTS[g.instrumentId] || INSTRUMENTS.savings;
    const monthlyRate = inst.monthlyRate;
    const balance = g.currentAmount || 0;
    const target = g.targetAmount || 1;
    const growth = Math.round(balance * monthlyRate);

    let newBalance = balance + growth;
    let excessGrowth = 0;
    let status = g.status;

    const isFixedCap = g.id === 'goal_emergency' || g.id === 'goal_vacation' || (g.kind === 'milestone' && balance >= target);

    if (isFixedCap) {
      if (balance >= target) {
        excessGrowth = growth;
        newBalance = target;
      } else if (newBalance > target) {
        excessGrowth = newBalance - target;
        newBalance = target;
      }
    }

    if (g.id === 'goal_emergency') {
      status = newBalance >= target ? 'buffer_full' : (newBalance > 0 ? 'refill_needed' : 'in_progress');
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

  // ─── 9. Service Loans ────────────────────────────────────────────────────
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

  // ─── 10. Check Retirement ────────────────────────────────────────────────
  if (isRetirementReached) {
    isPaused = true;
    activeModal = null;
    modalQueue = [];
  }

  // ─── 11. Net Worth Snapshot & Character State ────────────────────────────
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
    grossMonthlySalary: grossSalary,
    monthlyTakeHome: baseTakeHome,
    loans: updatedLoans,
    liquidCash,
    totalFixedExpenses: fixedExpenses,
    totalLoanEMIs: nextTotalLoanEMIs,
    totalMonthlyOutflow: fixedExpenses + nextTotalLoanEMIs + totalInsurance,
    monthlySurplus: baseTakeHome - (fixedExpenses + nextTotalLoanEMIs + totalInsurance),
    employmentStatus,
    unemploymentMonthsRemaining,
    preLayoffTakeHome: employmentStatus === 'unemployed' ? preLayoffTakeHome : null,
    lastShockMonthIndex,
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
