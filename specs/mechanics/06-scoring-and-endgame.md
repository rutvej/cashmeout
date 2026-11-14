# Mechanism Spec: Scoring, Decision Debrief & Financial Retrospective (`specs/mechanics/06-scoring-and-endgame.md`)

## 1. Overview & Objective
This mechanism evaluates the player's lifetime simulation at retirement (Age 60). Rather than merely reporting an abstract score, it delivers a comprehensive **Financial Life Retrospective & Strategic Debrief**:
1. **Milestone Timing & Shortfall Audit**: Were goals filled early, on time, or short of target (and by how much)?
2. **Shortfall Decision Evaluation**: When a shortfall occurred, did the player take a loan, drain buffers, or postpone? Was postponing a good decision for the character?
3. **Asset Allocation & Suitability Audit**: Did the player match goals to appropriate instruments (e.g., Emergency Fund in Liquid Savings vs. dangerous Mutual Funds or penalized FDs)?
4. **Career & Upskilling Opportunity Cost**: Did the player stagnate in low-tier jobs or upskill early to multiply earnings? What could have been done differently?
5. **FI/RE & Wealth Summary**: Safe withdrawal rate (4% rule), debt freedom, and overall financial grade.

---

## 2. Global Type Schema (`ScorecardResult`)

```typescript
export type GradeLetter = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface MilestoneAuditItem {
  goalId: string;
  name: string;
  icon: string;
  targetAmount: number;
  finalAccumulated: number;
  status: 'filled_early' | 'filled_on_time' | 'shortfall' | 'dropped';
  monthsDifference: number; // Positive = completed N months early, Negative = delayed
  shortfallAmount: number;  // 0 if filled, >0 if short
  resolutionTaken?: 'loan' | 'other_fund' | 'postpone' | 'none';
  postponeEvaluation?: {
    wasGoodDecision: boolean;
    rating: 'excellent' | 'acceptable' | 'poor';
    reason: string;
  };
  instrumentUsed: string;
  instrumentSuitability: {
    isOptimal: boolean;
    verdict: 'optimal' | 'suboptimal' | 'dangerous';
    critique: string;
  };
}

export interface AssetAllocationAudit {
  emergencyFundInstrument: string;
  emergencyFundCritique: {
    status: 'optimal' | 'suboptimal' | 'dangerous';
    message: string;
  };
  longTermEquityRatio: number; // % of long-term goals placed in Equity
  penaltiesPaidFD: number;     // Total early FD exit penalties incurred
  marketLossesRealized: number;// Losses from selling equities during drawdowns
}

export interface CareerOpportunityAudit {
  yearsInTier1: number;
  totalUpskillingCoursesCompleted: number;
  totalJobSwitches: number;
  careerStagnationDetected: boolean;
  estimatedMissedEarnings: number; // Potential ₹ gain if upskilled & switched early
  advice: string;
}

export interface CounterfactualInsight {
  title: string;
  impactType: 'positive' | 'negative' | 'opportunity';
  potentialNetWorthDelta: number;
  description: string;
}

export interface ScorecardResult {
  finalAge: number;                   // 60
  totalNetWorth: number;              // Final Net Worth in ₹ (Includes Liquid + Investments + Real Estate - Debt)
  totalInvestments: number;           // Total portfolio corpus in ₹
  homePropertyAssetValue?: number;    // Appreciated real estate asset valuation in ₹
  liquidBankBalance: number;          // Cash in bank in ₹
  outstandingDebt: number;            // Unpaid loans at age 60 in ₹

  // FI/RE Metrics (The 4% Safe Withdrawal Rule)
  annualLivingExpenses: number;
  annualPassiveIncome: number;
  monthlyPassiveIncome: number;
  fiRatio: number;
  isFinanciallyIndependent: boolean;

  // Quantitative Pillars
  breakdown: {
    financialIndependenceScore: number; // Max 35 pts
    milestoneCompletionScore: number;   // Max 25 pts
    decisionQualityScore: number;       // Max 20 pts (audits loan/buffer/postpone choices)
    assetSuitabilityScore: number;      // Max 10 pts (portfolio suitability & liquidity)
    debtFreeScore: number;              // Max 10 pts
    totalScore: number;                 // Sum (0 to 100)
  };
  grade: GradeLetter;
  title: string;

  // Detailed Audits
  milestoneAudits: MilestoneAuditItem[];
  assetAudit: AssetAllocationAudit;
  careerAudit: CareerOpportunityAudit;
  topCounterfactuals: CounterfactualInsight[];
}
```

---

## 3. Decision Evaluation Logic

### A. Milestone Timing & Shortfall Resolution
1. **Filled Early**: Goal reached 100% capacity before target age/month. Commended with a bonus to Decision Quality.
2. **Filled On-Time**: Reached 100% at the target milestone age.
3. **Shortfall**: Reached target date with `currentAmount < targetAmount`. Evaluated based on resolution:
   - **Loan Taken**:
     - Auto/Car loan at 9.5% or Personal loan at 12%: Assessed against debt service capacity. Penalized if resulting EMIs exceeded 25% of monthly surplus.
   - **Drawn from Bank Cash / Emergency Buffer**:
     - Acceptable if remaining emergency reserve covers $\ge 6\text{ months}$ of expenses.
     - Dangerous if it depleted emergency buffer below 3 months, leaving character exposed to life shocks.
   - **Postpone**: Evaluated by the **Postpone Decision Quality Algorithm**.

### B. "Was Postponing a Smart Decision?" Algorithm
```typescript
export function evaluatePostponeDecision(goal, character, state, shortfall): PostponeEvaluation {
  const isLuxuryOrDiscretionary = goal.id === 'goal_car' || goal.id === 'goal_vacation' || goal.kind === 'custom';
  const hasIdleBankCash = (character.liquidCash || 0) >= shortfall * 1.2;
  const isEssentialHousing = goal.id === 'goal_home';

  // Case 1: Postponing discretionary milestones when young without debt
  if (isLuxuryOrDiscretionary && character.age < 30) {
    return {
      wasGoodDecision: true,
      rating: 'excellent',
      reason: 'Smart move! Delaying a discretionary milestone avoided high-interest debt and allowed early surplus to compound unimpeded.',
    };
  }

  // Case 2: Postponing despite having ample idle liquid cash
  if (hasIdleBankCash) {
    return {
      wasGoodDecision: false,
      rating: 'poor',
      reason: 'Unnecessary delay: You had sufficient idle bank cash to fund this milestone debt-free without delaying life progression.',
    };
  }

  // Case 3: Postponing home purchase during property inflation
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
```

---

## 4. Asset Allocation & Suitability Evaluation

### A. Emergency Fund Placement Rules
- **In Liquid Savings**: **Optimal (10/10)** — Instant liquidity, zero market risk, 0 penalty.
- **In Fixed Deposit (FD)**: **Sub-Optimal (5/10)** — FDs have lock-in terms; premature withdrawal incurs a 1.5% interest penalty.
- **In Equity Mutual Funds**: **Dangerous (1/10)** — High risk of capital loss during market corrections. When an emergency shock strikes during a market dip, selling equities locks in losses.

### B. Long-Term Goals (Retirement & 10+ Year Goals)
- **In Equity Mutual Funds**: **Optimal** — Outpaces inflation, compounding at ~12% p.a.
- **In Liquid Savings or FD**: **Sub-Optimal** — Purchasing power eroded by inflation; missed ~12% compounding upside.

---

## 5. Career Stagnation & Counterfactual Engine ("What You Could Have Done")

The engine compares the player's actual trajectory against counterfactual models:
1. **Upskilling & Job Switching**:
   - If player remained in Tier 1 or Tier 2 for $\ge 6$ years without taking an upskilling course:
     $$\text{Estimated Missed Earnings} = \sum (\text{Tier } (N+1) \text{ Net Salary} - \text{Actual Net Salary}) \times \text{Stagnant Months}$$
   - Generates counterfactual card: *"Career Leap: Completing a 3-month Bootcamp at Age 26 and applying for Senior Specialist would have increased lifetime take-home by +₹28,50,000."*
2. **Debt vs. Discipline**:
   - If player took personal/auto loans instead of postponing or saving:
     - Calculates total interest paid: *"Interest Savings: Saving up for the car rather than taking a 48-month loan would have saved ₹1,42,000 in interest."*
3. **Emergency Fund Discipline**:
   - If emergency fund was parked in FD or Equities during a shock:
     - Highlights exact penalties or realized market losses incurred.

---

## 6. Endgame Net Worth, Milestone Realization & Safe Withdrawal Formulas

### A. Total Net Worth Model (Real Estate + Investments + Bank Liquid Cash - Debt)
$$\text{totalNetWorth} = \text{liquidCash} + \text{totalInvestments} + \text{homePropertyAssetValue} - \text{outstandingDebt}$$
- **Real Estate Valuation:** Home ownership is credited as an equity asset (`homePropertyAssetValue`) appreciating at 6.5% p.a. while any outstanding mortgage principal is subtracted as debt.
- **Milestone Corpus Realization:** When milestone events like Home Down Payment (`goal_home`) or Wedding (`goal_marriage`) occur:
  - Down payment funds convert directly into home equity:
    $$\text{downPaymentPaid} = \text{actualDP}, \quad \text{currentAmount} = 0$$
  - Wedding corpus is consumed for celebration expenses:
    $$\text{spentCorpus} = \text{actualSpent}, \quad \text{currentAmount} = 0$$
  - This prevents double-counting milestone expenses in net worth while preserving 100% completion status and timing credit in the retrospective debrief.

### B. Safe Withdrawal Rate (The 4% Rule) & FI/RE Ratio
At retirement (Age 60), sustainable passive income is calculated from the unencumbered investment corpus and active cash-flow ventures:
$$\text{totalInvestableCorpus} = \text{retirementCorpus} + \text{otherInvestments}$$
$$\text{annualPassiveIncome} = \text{round}(\text{totalInvestableCorpus} \times 0.04) + \text{annualVentureCashFlow}$$
$$\text{monthlyPassiveIncome} = \text{round}\left(\frac{\text{annualPassiveIncome}}{12}\right)$$
$$\text{fiRatio} = \frac{\text{annualPassiveIncome}}{\text{annualLivingExpenses}}$$

- $\text{fiRatio} \ge 1.25$: Early financial independence / wealth surplus (Score: 35/35).
- $\text{fiRatio} \ge 1.0$: Fully financially independent (Score: 30/35).
- $\text{fiRatio} \ge 0.8$: Near financial independence (Score: 22/35).
- $\text{fiRatio} \ge 0.5$: Partial retirement security (Score: 14/35).
- $\text{fiRatio} < 0.5$: Shortfall risk (Score: Pro-rated up to 14 pts).
