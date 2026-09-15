export const calculateFinancialLiteracyScore = (history) => {
  let score = 50; // base score
  
  // Example simple logic (to be expanded based on full history parsing)
  if (history.emergencyFundMaintained) score += 25;
  if (history.insuranceHeld) score += 20;
  if (history.diversified) score += 20;
  if (history.healthyEmiRatio) score += 20;
  if (history.goodLoanUsage) score += 15;

  return Math.min(100, Math.max(0, score));
};

export const calculateResults = (state) => {
  const achieved = state.goals.filter(g => g.achieved);
  const sacrificed = state.goals.filter(g => g.sacrificed);
  const bonus = achieved.filter(g => g.bonus);
  
  const resultScore = achieved.length - sacrificed.length + bonus.length;
  
  return {
    goalsAchieved: achieved,
    goalsSacrificed: sacrificed,
    bonusGoals: bonus,
    resultScore,
    finalNetWorth: state.pool, // Can add asset values here
    literacyScore: calculateFinancialLiteracyScore(state.gameHistory || {}),
    biggestMistake: findBiggestMistake(state.gameHistory || []),
  };
};

export const findBiggestMistake = (history) => {
  return "Not keeping enough emergency funds before a market crash."; // Mock
};

export const generateInsights = (state) => {
  const insights = [];
  if (!state.hasHealthInsurance) insights.push("You lived dangerously without health insurance.");
  if (state.instruments.savings > 80) insights.push("You kept too much in savings, losing out to inflation.");
  if (state.loans.length > 3) insights.push("You relied heavily on debt.");
  return insights.length ? insights : ["You played it safe and steady."];
};
