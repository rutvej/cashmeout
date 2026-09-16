export const computeNetWorth = (state) => {
  const pool = state.pool || 0;
  const homeValues = (state.homesOwned || []).reduce((sum, home) => sum + (home.value || 0), 0);
  const businessValue = state.hasActiveBusiness ? (state.businessIncome || 0) * 22 : 0;
  const loanDebt = (state.loans || []).reduce((sum, loan) => sum + (loan.principal || 0), 0);
  
  return pool + homeValues + businessValue - loanDebt;
};

export const calculateFinancialLiteracyScore = (state) => {
  let score = 0;

  const expenses = (state.fixedDeductions || []).reduce((s, fd) => s + (fd.amount || 0), 0) +
                   (state.loans || []).reduce((s, l) => s + (l.emi || 0), 0) +
                   (state.healthInsuranceCost || 0) + 
                   (state.vehicleInsuranceCost || 0) +
                   (state.homeMaintenanceCost || 0) +
                   (state.carMaintenanceCost || 0);
  
  const snapshots = state.monthlySnapshots || [];
  if (snapshots.length > 0) {
    let healthyMonths = 0;
    snapshots.forEach(s => {
      if (s.pool > 6 * expenses) healthyMonths++;
    });
    if (healthyMonths / snapshots.length > 0.5) score += 20;
  }

  if (state.hasHealthInsurance) score += 15;

  let divCount = 0;
  if (state.instruments) {
    Object.values(state.instruments).forEach(val => {
      if (val > 5) divCount++;
    });
  }
  if (divCount >= 3) score += 15;
  else if (divCount === 2) score += 8;

  const totalEmi = (state.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalIncome = (state.incomes || []).reduce((sum, inc) => sum + (inc.amount || 0), 0) + (state.businessIncome || 0) +
                      (state.homesOwned || []).reduce((sum, h) => sum + (h.isRentedOut ? (h.rentalIncome || 0) : 0), 0);
  
  if (totalIncome > 0) {
    const emiRatio = totalEmi / totalIncome;
    if (emiRatio < 0.4) score += 15;
    else if (emiRatio < 0.6) score += 8;
  } else if (totalEmi === 0) {
    score += 15; 
  }

  const totalGoals = state.goals ? state.goals.length : 0;
  const achievedGoals = state.goals ? state.goals.filter(g => g.achieved).length : 0;
  if (totalGoals > 0) {
    score += Math.round((achievedGoals / totalGoals) * 20);
  }

  const numLoans = state.loans ? state.loans.length : 0;
  if (numLoans <= 2) score += 10;
  else if (numLoans <= 4) score += 5;

  const hasRental = (state.homesOwned || []).some(h => h.isRentedOut);
  if (hasRental || state.hasActiveBusiness) score += 5;

  return Math.min(100, Math.max(0, score));
};

export const findBiggestMistake = (state) => {
  const events = state.eventHistory || [];
  let worstEvent = null;
  let minDelta = 0;

  events.forEach(ev => {
    if (ev.poolDelta < minDelta) {
      minDelta = ev.poolDelta;
      worstEvent = ev;
    }
  });

  if (worstEvent) {
    return `Lost ₹${Math.abs(minDelta)} from: ${worstEvent.eventName}${worstEvent.outcome ? ` (${worstEvent.outcome})` : ''}`;
  }
  return "No major financial mistakes recorded.";
};

export const findBiggestWin = (state) => {
  const events = state.eventHistory || [];
  let bestEvent = null;
  let maxDelta = 0;

  events.forEach(ev => {
    if (ev.poolDelta > maxDelta) {
      maxDelta = ev.poolDelta;
      bestEvent = ev;
    }
  });

  if (bestEvent) {
    return `Gained ₹${maxDelta} from: ${bestEvent.eventName}${bestEvent.outcome ? ` (${bestEvent.outcome})` : ''}`;
  }
  return "No major financial windfalls recorded.";
};

export const findTurningPoint = (state) => {
  const snapshots = state.monthlySnapshots || [];
  if (snapshots.length < 3) return "Not enough history to determine a turning point.";

  let maxDiff = 0;
  let turningMonth = null;

  for (let i = 2; i < snapshots.length; i++) {
    const prevDelta = snapshots[i - 1].netWorth - snapshots[i - 2].netWorth;
    const currDelta = snapshots[i].netWorth - snapshots[i - 1].netWorth;
    const change = Math.abs(currDelta - prevDelta);
    if (change > maxDiff) {
      maxDiff = change;
      turningMonth = snapshots[i].day;
    }
  }

  return turningMonth ? `Day ${turningMonth}` : "Trajectory remained relatively stable.";
};

export const generateInsights = (state) => {
  const insights = [];

  if (!state.hasHealthInsurance) insights.push("You lived dangerously without health insurance.");
  
  if (state.instruments && state.instruments.savings > 70) insights.push("You kept too much in savings, losing out to inflation.");
  
  if (state.loans && state.loans.length > 3) insights.push("You relied heavily on debt.");
  
  if (state.goals && state.goals.some(g => g.sacrificed)) insights.push("You had to sacrifice some of your life goals.");
  
  if (state.pool < 0) insights.push("You faced insolvency at some point (negative liquid cash).");
  
  if (state.homesOwned && state.homesOwned.some(h => h.isRentedOut)) insights.push("Good job building an income-generating real estate asset.");
  
  if (state.hasActiveBusiness && state.businessIncome > 0) insights.push("Your active business added a solid income stream.");
  
  if (state.married) insights.push("Being married impacted your finances with dual living dynamics.");
  
  let divCount = 0;
  if (state.instruments) {
    Object.values(state.instruments).forEach(val => {
      if (val > 5) divCount++;
    });
  }
  if (divCount >= 3) insights.push("Excellent portfolio diversification!");

  const totalEmi = (state.loans || []).reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalIncome = (state.incomes || []).reduce((sum, inc) => sum + (inc.amount || 0), 0) + (state.businessIncome || 0) +
                      (state.homesOwned || []).reduce((sum, h) => sum + (h.isRentedOut ? h.rentalIncome || 0 : 0), 0);
  if (totalIncome > 0 && (totalEmi / totalIncome) < 0.4) {
    insights.push("You maintained a very healthy debt-to-income (EMI) ratio.");
  }

  return insights.length ? insights : ["You played it safe and steady."];
};

export const calculateResults = (state) => {
  const achieved = (state.goals || []).filter(g => g.achieved);
  const sacrificed = (state.goals || []).filter(g => g.sacrificed);
  const bonus = achieved.filter(g => g.bonus);
  
  const resultScore = achieved.length - sacrificed.length + bonus.length;
  
  return {
    goalsAchieved: achieved,
    goalsSacrificed: sacrificed,
    bonusGoals: bonus,
    resultScore,
    finalNetWorth: computeNetWorth(state),
    literacyScore: calculateFinancialLiteracyScore(state),
    biggestMistake: findBiggestMistake(state),
    biggestWin: findBiggestWin(state),
    turningPoint: findTurningPoint(state)
  };
};
