// Pure deterministic scoring & endgame evaluation engine

/**
 * Evaluates whether postponing a milestone was a good financial decision.
 *
 * @param {object} goal - Milestone goal object
 * @param {object} character - Character state
 * @param {object} state - Full simulation state (optional)
 * @param {number} shortfall - Shortfall amount at trigger age (optional)
 * @returns {{ wasGoodDecision: boolean, rating: 'excellent' | 'acceptable' | 'poor', reason: string }}
 */
export function evaluatePostponeDecision(goal, character = {}, state = {}, shortfall = 0) {
  const isLuxuryOrDiscretionary =
    goal.id === 'goal_car' ||
    goal.id === 'goal_vacation' ||
    goal.kind === 'custom' ||
    goal.category === 'lifestyle';

  const liquidCash = character.liquidCash ?? state?.character?.liquidCash ?? 0;
  const currentShortfall = shortfall > 0
    ? shortfall
    : Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));

  const hasIdleBankCash = liquidCash >= currentShortfall * 1.2;
  const isEssentialHousing = goal.id === 'goal_home';
  const age = character.age ?? state?.simulation?.currentAge ?? 25;

  // Case 2 in spec: Postponing despite having ample idle liquid cash
  if (hasIdleBankCash && currentShortfall > 0) {
    return {
      wasGoodDecision: false,
      rating: 'poor',
      reason: 'Unnecessary delay: You had sufficient idle bank cash to fund this milestone debt-free without delaying life progression.',
    };
  }

  // Case 1 in spec: Postponing discretionary milestones when young without debt
  if (isLuxuryOrDiscretionary && age < 30) {
    return {
      wasGoodDecision: true,
      rating: 'excellent',
      reason: 'Smart move! Delaying a discretionary milestone avoided high-interest debt and let your early surplus compound unimpeded.',
    };
  }

  // Case 3 in spec: Postponing home purchase during property inflation
  if (isEssentialHousing) {
    return {
      wasGoodDecision: true,
      rating: 'acceptable',
      reason: 'Prudent defense: Prevented an overleveraged mortgage crisis, though property inflation increased future acquisition costs.',
    };
  }

  return {
    wasGoodDecision: true,
    rating: 'acceptable',
    reason: 'Delayed milestone to accumulate sufficient capital naturally without debt stress.',
  };
}

/**
 * Audits whether an instrument was appropriately matched to the goal horizon.
 *
 * @param {object} goal - Goal object
 * @returns {{ isOptimal: boolean, verdict: 'optimal' | 'suboptimal' | 'dangerous', critique: string }}
 */
export function evaluateInstrumentSuitability(goal) {
  const instrument = goal.instrumentId || 'savings';

  if (goal.id === 'goal_emergency') {
    if (instrument === 'savings') {
      return {
        isOptimal: true,
        verdict: 'optimal',
        critique: 'Optimal! Instant access with zero market risk and zero premature penalties.',
      };
    }
    if (instrument === 'fd') {
      return {
        isOptimal: false,
        verdict: 'suboptimal',
        critique: 'FD lock-ins and premature penalties hinder emergency liquidity.',
      };
    }
    return {
      isOptimal: false,
      verdict: 'dangerous',
      critique: 'High volatility: exposed emergency fund to market crash drawdowns.',
    };
  }

  // Long-term goals (retirement or 10+ year milestones)
  const isLongTerm =
    goal.id === 'goal_retirement' ||
    goal.id === 'goal_child' ||
    goal.id === 'goal_child_edu' ||
    (goal.targetMonthsRemaining && goal.targetMonthsRemaining >= 120);

  if (isLongTerm) {
    if (instrument === 'mutual_funds' || instrument === 'equity' || instrument === 'index') {
      return {
        isOptimal: true,
        verdict: 'optimal',
        critique: 'Optimal! Long horizon absorbed market volatility and compounded successfully.',
      };
    }
    if (instrument === 'savings') {
      return {
        isOptimal: false,
        verdict: 'suboptimal',
        critique: 'Inflation eroded purchasing power; missed ~12% compounding upside.',
      };
    }
    return {
      isOptimal: false,
      verdict: 'suboptimal',
      critique: 'FD lock-in and moderate returns failed to maximize multi-decade compounding.',
    };
  }

  // Short-term milestones (< 3 years / 36 months)
  if (goal.targetMonthsRemaining && goal.targetMonthsRemaining <= 36) {
    if (instrument === 'mutual_funds' || instrument === 'equity' || instrument === 'index') {
      return {
        isOptimal: false,
        verdict: 'dangerous',
        critique: 'High short-term market volatility created severe drawdown risk near deadline.',
      };
    }
    return {
      isOptimal: true,
      verdict: 'optimal',
      critique: 'Safe, capital-preserving instrument aligned with near-term deadline.',
    };
  }

  return {
    isOptimal: true,
    verdict: 'optimal',
    critique: 'Balanced instrument choice matched to target horizon.',
  };
}

/**
 * Master Endgame Evaluation Engine
 * Produces the complete ScorecardResult according to specs/mechanics/06-scoring-and-endgame.md.
 *
 * @param {object} state - Game store state
 * @returns {object} ScorecardResult
 */
export function evaluateScorecard(state = {}) {
  const character = state.character || {};
  const goals = state.goals || [];
  const simulation = state.simulation || {};
  const decisionJournal = simulation.decisionJournal || [];

  const retirementGoal = goals.find((g) => g.id === 'goal_retirement');
  const emergencyGoal = goals.find((g) => g.id === 'goal_emergency');

  const retirementCorpus = retirementGoal?.currentAmount || 0;
  const otherInvestments = goals
    .filter((g) => g.id !== 'goal_retirement' && g.id !== 'goal_emergency' && !g.isLaunched)
    .reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalInvestableCorpus = retirementCorpus + otherInvestments;

  const annualLivingExpenses = (character.totalFixedExpenses || 1) * 12;
  const annualVentureCashFlow = (character.ventureIncome || 0) * 12;
  const annualPassiveIncome = Math.round(totalInvestableCorpus * 0.04) + annualVentureCashFlow;
  const monthlyPassiveIncome = Math.round(annualPassiveIncome / 12);
  const fiRatio = annualLivingExpenses > 0 ? annualPassiveIncome / annualLivingExpenses : 1;

  // ─── Quantitative Pillar 1: Financial Independence (Max 35 pts) ──────────
  let fiScore = 0;
  if (fiRatio >= 1.25) {
    fiScore = 35;
  } else if (fiRatio >= 1.0) {
    fiScore = 30;
  } else if (fiRatio >= 0.8) {
    fiScore = 22;
  } else if (fiRatio >= 0.5) {
    fiScore = 14;
  } else {
    fiScore = Math.min(14, Math.round(fiRatio * 18));
  }

  // ─── Quantitative Pillar 2: Milestone Completion (Max 25 pts) ────────────
  const nonRetirementGoals = goals.filter(
    (g) =>
      g.id !== 'goal_retirement' &&
      g.id !== 'goal_emergency' &&
      g.id !== 'goal_vacation' &&
      g.kind !== 'recurring'
  );
  const completedGoals = nonRetirementGoals.filter(
    (g) =>
      (g.currentAmount || 0) >= (g.targetAmount || 1) ||
      g.isLaunched ||
      g.status === 'completed' ||
      (g.filledEarlyMonths && g.filledEarlyMonths > 0)
  );

  const milestoneScore = nonRetirementGoals.length > 0
    ? Math.round(25 * (completedGoals.length / nonRetirementGoals.length))
    : 25;

  // ─── Quantitative Pillar 5: Debt Free Status (Max 10 pts) ────────────────
  const outstandingDebt = (character.loans || []).reduce(
    (sum, l) => sum + (l.principalRemaining || 0),
    0
  );
  let debtScore = 10;
  if (outstandingDebt > 0) {
    debtScore = Math.max(0, 10 - Math.round(outstandingDebt / 50000));
  }

  // ─── Detailed Audit: Milestone Audits ─────────────────────────────────────
  const milestoneAudits = nonRetirementGoals.map((g) => {
    const journalEntries = decisionJournal.filter(
      (d) => d.type === 'milestone' && d.goalId === g.id
    );
    const earlyEntry = decisionJournal.find(
      (d) => d.type === 'milestone_early' && d.goalId === g.id
    );

    const isEarly = (g.filledEarlyMonths && g.filledEarlyMonths > 0) || !!earlyEntry;
    const current = g.currentAmount || 0;
    const target = g.targetAmount || 1;
    const shortfallEntry = journalEntries.find((d) => d.shortfall > 0);
    const isCompleted = current >= target || g.isLaunched || g.status === 'completed';

    let status = 'shortfall';
    let monthsDifference = 0;
    let shortfallAmount = 0;
    let resolutionTaken = 'none';
    let postponeEvaluation = undefined;

    if (isEarly) {
      status = 'filled_early';
      monthsDifference = g.filledEarlyMonths || earlyEntry?.monthsEarly || 12;
      shortfallAmount = 0;
      resolutionTaken = 'none';
    } else if (shortfallEntry) {
      status = 'shortfall';
      shortfallAmount = shortfallEntry.shortfall;
      resolutionTaken = shortfallEntry.resolution;
      if (shortfallEntry.resolution === 'postpone') {
        const postponeYrs = shortfallEntry.postponeYears || 2;
        monthsDifference = -(postponeYrs * 12);
        const decisionChar = {
          ...character,
          age: shortfallEntry.age !== undefined ? shortfallEntry.age : character.age,
          liquidCash: shortfallEntry.liquidCashAvailable !== undefined ? shortfallEntry.liquidCashAvailable : character.liquidCash,
        };
        postponeEvaluation = evaluatePostponeDecision(g, decisionChar, state, shortfallEntry.shortfall);
      }
    } else if (isCompleted) {
      status = 'filled_on_time';
      monthsDifference = 0;
      shortfallAmount = 0;
      resolutionTaken = 'none';
    } else {
      status = 'shortfall';
      monthsDifference = 0;
      shortfallAmount = Math.max(0, target - current);
      resolutionTaken = 'none';
    }

    const suitability = evaluateInstrumentSuitability(g);

    return {
      goalId: g.id,
      name: g.name,
      icon: g.icon,
      targetAmount: target,
      finalAccumulated: current,
      status,
      monthsDifference,
      shortfallAmount,
      resolutionTaken,
      postponeEvaluation,
      instrumentUsed: g.instrumentId || 'savings',
      instrumentSuitability: suitability,
    };
  });

  // ─── Quantitative Pillar 3: Decision Quality (Max 20 pts) ────────────────
  let decisionQualityScore = 15;
  const earlyCount = milestoneAudits.filter((m) => m.status === 'filled_early').length;
  decisionQualityScore += Math.min(4, earlyCount * 2);

  milestoneAudits.forEach((m) => {
    if (m.postponeEvaluation) {
      if (m.postponeEvaluation.rating === 'excellent') decisionQualityScore += 1;
      else if (m.postponeEvaluation.rating === 'poor') decisionQualityScore -= 3;
    }
    if (m.resolutionTaken === 'loan' && m.goalId !== 'goal_home') {
      decisionQualityScore -= 2;
    }
  });

  // Check for costly uninsured shocks
  const costlyUninsuredShock = decisionJournal.some(
    (d) => d.type === 'shock' && !d.usedInsurance && (d.netLoss || 0) > 100000
  );
  if (costlyUninsuredShock) {
    decisionQualityScore -= 2;
  }
  decisionQualityScore = Math.min(20, Math.max(0, decisionQualityScore));

  // ─── Detailed Audit: Asset Allocation Audit ──────────────────────────────
  const emergencyFundInstrument = emergencyGoal?.instrumentId || 'savings';
  let emergencyFundCritique;
  if (emergencyFundInstrument === 'savings') {
    emergencyFundCritique = {
      status: 'optimal',
      message: 'Optimal! Instant access with zero market risk and zero premature penalties.',
    };
  } else if (emergencyFundInstrument === 'fd') {
    emergencyFundCritique = {
      status: 'suboptimal',
      message: 'FD lock-ins and premature penalties hinder emergency liquidity.',
    };
  } else {
    emergencyFundCritique = {
      status: 'dangerous',
      message: 'High volatility: exposed emergency fund to market crash drawdowns.',
    };
  }

  const longTermGoals = goals.filter(
    (g) =>
      g.id === 'goal_retirement' ||
      g.id === 'goal_child' ||
      g.id === 'goal_child_edu' ||
      (g.targetMonthsRemaining && g.targetMonthsRemaining >= 60)
  );
  const longTermEquityGoals = longTermGoals.filter(
    (g) => g.instrumentId === 'mutual_funds' || g.instrumentId === 'equity' || g.instrumentId === 'index'
  );
  const longTermEquityRatio = longTermGoals.length > 0
    ? Math.round((longTermEquityGoals.length / longTermGoals.length) * 100)
    : (retirementGoal?.instrumentId === 'mutual_funds' ? 100 : 0);

  const penaltiesPaidFD = character.penaltiesPaidFD || 0;
  const marketLossesRealized = character.marketLossesRealized || 0;

  const assetAudit = {
    emergencyFundInstrument,
    emergencyFundCritique,
    longTermEquityRatio,
    penaltiesPaidFD,
    marketLossesRealized,
  };

  // ─── Quantitative Pillar 4: Asset Suitability (Max 10 pts) ───────────────
  let assetSuitabilityScore = 0;
  if (emergencyFundCritique.status === 'optimal') assetSuitabilityScore += 4;
  else if (emergencyFundCritique.status === 'suboptimal') assetSuitabilityScore += 2;

  if (longTermEquityRatio >= 50) assetSuitabilityScore += 4;
  else if (longTermEquityRatio >= 25) assetSuitabilityScore += 2;

  if (penaltiesPaidFD === 0 && marketLossesRealized === 0) {
    assetSuitabilityScore += 2;
  } else if (penaltiesPaidFD <= 5000 && marketLossesRealized <= 5000) {
    assetSuitabilityScore += 1;
  }
  assetSuitabilityScore = Math.min(10, Math.max(0, assetSuitabilityScore));

  // Sum total score
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      fiScore + milestoneScore + decisionQualityScore + assetSuitabilityScore + debtScore
    )
  );

  // Grade Brackets
  let grade = 'F';
  let title = 'Vulnerable Retirement';
  if (totalScore >= 90) {
    grade = 'A+';
    title = 'Generational Wealth';
  } else if (totalScore >= 80) {
    grade = 'A';
    title = 'Comfortable Financial Independence';
  } else if (totalScore >= 70) {
    grade = 'B';
    title = 'Solid Financial Foundation';
  } else if (totalScore >= 55) {
    grade = 'C';
    title = 'Moderate Retirement';
  } else if (totalScore >= 40) {
    grade = 'D';
    title = 'Financially Fragile';
  }

  // ─── Detailed Audit: Career Opportunity Audit ────────────────────────────
  const history = simulation.history || [];
  let yearsInTier1 = 0;
  if (character.yearsInTier1 !== undefined) {
    yearsInTier1 = character.yearsInTier1;
  } else if (history.length >= 12) {
    const tier1Months = history.filter((h) => h.jobTier === 1).length;
    yearsInTier1 = Math.round(tier1Months / 12);
  } else {
    yearsInTier1 = character.jobTier === 1 ? Math.max(0, (character.age || 60) - 23) : 2;
  }

  const completedCoursesCount =
    (character.completedCourses || []).length ||
    decisionJournal.filter((d) => d.type === 'course_completed').length;
  const totalJobSwitches = decisionJournal.filter((d) => d.type === 'job_switch').length;

  let yearsInJuniorTiers = 0;
  if (history.length >= 12) {
    const juniorMonths = history.filter((h) => (h.jobTier || 1) <= 2).length;
    yearsInJuniorTiers = Math.round(juniorMonths / 12);
  } else {
    yearsInJuniorTiers = (character.jobTier || 1) <= 2 ? Math.max(0, (character.age || 60) - 23) : 2;
  }

  const careerStagnationDetected =
    (yearsInTier1 >= 6 || (yearsInJuniorTiers >= 10 && (character.jobTier || 1) <= 2)) &&
    completedCoursesCount === 0;

  let estimatedMissedEarnings = 0;
  if (careerStagnationDetected) {
    const stagnantMonths = Math.max(1, (yearsInTier1 >= 6 ? yearsInTier1 - 3 : yearsInJuniorTiers - 4)) * 12;
    estimatedMissedEarnings = stagnantMonths * 35000;
  }

  const careerAdvice = careerStagnationDetected
    ? 'You spent over 6 years in entry/junior roles without upskilling or exploring the job market. Taking bootcamps or certifications early would have accelerated promotions and compounded higher salaries.'
    : 'Strong career trajectory! Regular skill development and strategic job transitions maximized lifetime earnings and protected your family from wage inflation.';

  const careerAudit = {
    yearsInTier1,
    totalUpskillingCoursesCompleted: completedCoursesCount,
    totalJobSwitches,
    careerStagnationDetected,
    estimatedMissedEarnings,
    advice: careerAdvice,
  };

  // ─── Top Counterfactual Insights (2-3 high-impact cards) ─────────────────
  const topCounterfactuals = [];

  // Card 1: Career Jump Opportunity
  if (careerStagnationDetected) {
    topCounterfactuals.push({
      title: 'Career Leap Opportunity',
      impactType: 'opportunity',
      potentialNetWorthDelta: estimatedMissedEarnings,
      description: `You remained in entry roles for ${yearsInTier1} years. Enrolling in a 3-month Bootcamp at Age 26 and applying for promotions would have unlocked an estimated +₹${estimatedMissedEarnings.toLocaleString('en-IN')} in lifetime income!`,
    });
  } else if (completedCoursesCount > 0) {
    topCounterfactuals.push({
      title: 'Upskilling Growth Multiplier',
      impactType: 'positive',
      potentialNetWorthDelta: 2400000,
      description: 'Proactively investing in industry certifications and bootcamps unlocked top-tier salary appraisal bonuses and accelerated your path to leadership.',
    });
  } else {
    topCounterfactuals.push({
      title: 'Accelerated Promotions',
      impactType: 'opportunity',
      potentialNetWorthDelta: 1500000,
      description: 'Acquiring high-demand credentials can boost lifetime income by 25% to 40% through faster job ladder progressions.',
    });
  }

  // Card 2: Debt Avoidance / Interest Drag
  const lifestyleLoans = (character.loans || []).filter(
    (l) => !l.name?.toLowerCase().includes('mortgage') && !l.name?.toLowerCase().includes('home')
  );
  const totalInterestPaidApprox = lifestyleLoans.reduce((sum, l) => sum + (l.emi * 12 * 0.12), 0);

  if (lifestyleLoans.length > 0) {
    topCounterfactuals.push({
      title: 'Debt Interest Drag',
      impactType: 'negative',
      potentialNetWorthDelta: -Math.round(totalInterestPaidApprox || 45000),
      description: 'Financing discretionary lifestyle purchases with personal or auto loans drained monthly surplus into bank interest payments.',
    });
  } else {
    topCounterfactuals.push({
      title: 'Debt Avoidance Discipline',
      impactType: 'positive',
      potentialNetWorthDelta: 142000,
      description: 'By choosing disciplined monthly savings and postponing purchases rather than taking personal or auto loans, you saved over ₹1.4 Lakhs in interest!',
    });
  }

  // Card 3: Emergency Fund & Asset Preservation
  const totalExitLosses = penaltiesPaidFD + marketLossesRealized;
  if (totalExitLosses > 0) {
    topCounterfactuals.push({
      title: 'Emergency Buffer Drag',
      impactType: 'negative',
      potentialNetWorthDelta: -totalExitLosses,
      description: `Parking emergency reserves in lock-in FDs or volatile equities caused ₹${totalExitLosses.toLocaleString('en-IN')} in premature penalties and realized crash losses during emergencies.`,
    });
  } else if (emergencyFundInstrument === 'savings') {
    topCounterfactuals.push({
      title: 'Liquid Buffer Resilience',
      impactType: 'positive',
      potentialNetWorthDelta: 85000,
      description: 'Keeping emergency funds in high-liquidity zero-penalty savings fully insulated your core investment portfolio during life shocks.',
    });
  } else {
    topCounterfactuals.push({
      title: 'Emergency Placement Optimization',
      impactType: 'opportunity',
      potentialNetWorthDelta: 60000,
      description: 'Maintaining a 6-month liquid buffer completely avoids selling equity investments during market pullbacks.',
    });
  }

  const liquidCash = character.liquidCash || 0;
  const totalInvestments = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const hasHome = !!character?.assetMaintenanceState?.hasOwnedHome || (character.homePropertyAssetValue > 0);
  const homePropertyAssetValue = hasHome ? (character.homePropertyAssetValue || 0) : 0;
  const totalNetWorth = Math.round(liquidCash + totalInvestments + homePropertyAssetValue - outstandingDebt);

  return {
    finalAge: character.retirementAge || 60,
    totalNetWorth,
    totalInvestments,
    homePropertyAssetValue,
    liquidBankBalance: liquidCash,
    outstandingDebt,

    // FI/RE Metrics (The 4% Safe Withdrawal Rule)
    annualLivingExpenses,
    annualPassiveIncome,
    monthlyPassiveIncome,
    fiRatio,
    isFinanciallyIndependent: fiRatio >= 1.0,

    // Quantitative Pillars
    breakdown: {
      financialIndependenceScore: fiScore,
      milestoneCompletionScore: milestoneScore,
      decisionQualityScore,
      assetSuitabilityScore,
      debtFreeScore: debtScore,
      totalScore,
    },
    grade,
    title,

    // Detailed Audits
    milestoneAudits,
    assetAudit,
    careerAudit,
    topCounterfactuals,

    // Backward-compatible helpers
    goalsCompletedCount: completedGoals.length,
    totalGoalsCount: nonRetirementGoals.length,
    bestDecision: completedGoals.length >= 4
      ? `Achieved ${completedGoals.length} major life goals while funding your retirement.`
      : 'Maintained disciplined monthly SIP allocations across market cycles.',
    criticalLesson: outstandingDebt > 0
      ? 'Clear all outstanding debts before entering retirement to protect passive cashflow.'
      : (fiRatio < 1.0
        ? 'Increase long-term equity allocation to outpace living expense inflation.'
        : 'Maintain a balanced safe-withdrawal corpus throughout retirement.'),
  };
}
