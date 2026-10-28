// Pure deterministic scoring & endgame evaluation engine

export function evaluateScorecard(state) {
  const { character, goals, simulation } = state;

  const retirementGoal = goals.find((g) => g.id === 'goal_retirement');
  const emergencyGoal = goals.find((g) => g.id === 'goal_emergency');

  const retirementCorpus = retirementGoal?.currentAmount || 0;
  const annualLivingExpenses = (character.totalFixedExpenses || 1) * 12;
  const annualPassiveIncome = Math.round(retirementCorpus * 0.04);
  const monthlyPassiveIncome = Math.round(annualPassiveIncome / 12);
  const fiRatio = annualLivingExpenses > 0 ? annualPassiveIncome / annualLivingExpenses : 1;

  // Pillar 1: Financial Independence (Max 40)
  let fiScore = 0;
  if (fiRatio >= 1.25) {
    fiScore = 40;
  } else if (fiRatio >= 1.0) {
    fiScore = 35;
  } else if (fiRatio >= 0.8) {
    fiScore = 25;
  } else if (fiRatio >= 0.5) {
    fiScore = 15;
  } else {
    fiScore = Math.min(15, Math.round(fiRatio * 20));
  }

  // Pillar 2: Milestone Completion (Max 30)
  const nonRetirementGoals = goals.filter((g) => g.id !== 'goal_retirement');
  const completedGoals = nonRetirementGoals.filter(
    (g) => (g.currentAmount || 0) >= (g.targetAmount || 1)
  );
  const milestoneScore = nonRetirementGoals.length > 0
    ? Math.round(30 * (completedGoals.length / nonRetirementGoals.length))
    : 30;

  // Pillar 3: Debt-Free Status (Max 15)
  const outstandingDebt = (character.loans || []).reduce(
    (sum, l) => sum + (l.principalRemaining || 0),
    0
  );
  let debtScore = 15;
  if (outstandingDebt > 0) {
    debtScore = Math.max(0, 15 - Math.round(outstandingDebt / 50000));
  }

  // Pillar 4: Safety & Liquid Cash (Max 15)
  const liquidCash = character.liquidCash || 0;
  const emergencyCorpus = emergencyGoal?.currentAmount || 0;
  const totalLiquidSafety = liquidCash + emergencyCorpus;
  const monthlyOutflow = character.totalFixedExpenses || 1;
  const monthsCovered = totalLiquidSafety / monthlyOutflow;

  let safetyScore = 0;
  if (monthsCovered >= 12) {
    safetyScore = 15;
  } else if (monthsCovered >= 6) {
    safetyScore = 10;
  } else if (monthsCovered >= 3) {
    safetyScore = 5;
  } else {
    safetyScore = 2;
  }

  const totalScore = Math.min(100, Math.max(0, fiScore + milestoneScore + debtScore + safetyScore));

  // Determine Grade
  let grade = 'F';
  let title = 'Financially Fragile';
  if (totalScore >= 90) {
    grade = 'A+';
    title = 'Generational Wealth';
  } else if (totalScore >= 80) {
    grade = 'A';
    title = 'Comfortable FI/RE';
  } else if (totalScore >= 70) {
    grade = 'B';
    title = 'Solid Foundation';
  } else if (totalScore >= 55) {
    grade = 'C';
    title = 'Tight Retirement';
  } else {
    grade = 'D';
    title = 'Financially Fragile';
  }

  const totalInvestments = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalNetWorth = Math.round(liquidCash + totalInvestments - outstandingDebt);

  let bestDecision = 'Maintained disciplined monthly SIP allocations across market cycles.';
  if (completedGoals.length >= 4) {
    bestDecision = `Achieved ${completedGoals.length} major life goals while funding your retirement.`;
  }

  let criticalLesson = 'Prioritize early compound investing to maximize the 4% safe withdrawal cushion.';
  if (outstandingDebt > 0) {
    criticalLesson = 'Clear all outstanding debts before entering retirement to protect passive cashflow.';
  } else if (fiRatio < 1.0) {
    criticalLesson = 'Increase long-term equity allocation to outpace living expense inflation.';
  }

  return {
    finalAge: character.retirementAge || 60,
    totalNetWorth,
    totalInvestments,
    liquidBankBalance: liquidCash,
    outstandingDebt,
    annualLivingExpenses,
    annualPassiveIncome,
    monthlyPassiveIncome,
    fiRatio,
    isFinanciallyIndependent: fiRatio >= 1.0,
    breakdown: {
      financialIndependenceScore: fiScore,
      milestoneCompletionScore: milestoneScore,
      debtFreeScore: debtScore,
      safetyBufferScore: safetyScore,
      totalScore,
    },
    grade,
    title,
    goalsCompletedCount: completedGoals.length,
    totalGoalsCount: nonRetirementGoals.length,
    bestDecision,
    criticalLesson,
  };
}
