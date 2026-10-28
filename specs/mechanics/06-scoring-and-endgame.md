# Mechanism Spec: Scoring & Financial Independence Evaluation (`specs/mechanics/06-scoring-and-endgame.md`)

## 1. Overview & Objective
This mechanism evaluates the player's entire lifetime simulation at retirement (Age 60). It measures real-world financial health: the 4% Safe Withdrawal Rule (FI/RE), goal completion rate, debt freedom, and liquidity reserves. It generates a final numeric score (0 to 100), a letter grade (A+ down to F), and key personalized insights.

---

## 2. Global Type Schema (`ScorecardResult`)

```typescript
export type GradeLetter = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface ScoreBreakdown {
  financialIndependenceScore: number; // Max 40 points
  milestoneCompletionScore: number;   // Max 30 points
  debtFreeScore: number;              // Max 15 points
  safetyBufferScore: number;          // Max 15 points
  totalScore: number;                 // Sum (0 to 100)
}

export interface ScorecardResult {
  finalAge: number;                   // 60
  totalNetWorth: number;              // Final Net Worth in ₹
  totalInvestments: number;           // Total goal corpus in ₹
  liquidBankBalance: number;          // Cash in bank in ₹
  outstandingDebt: number;            // Any unpaid loans at age 60 in ₹
  
  // FI/RE Metrics (The 4% Safe Withdrawal Rule)
  annualLivingExpenses: number;       // totalFixedExpenses * 12
  annualPassiveIncome: number;        // retirementCorpus * 0.04
  monthlyPassiveIncome: number;       // annualPassiveIncome / 12
  fiRatio: number;                    // annualPassiveIncome / annualLivingExpenses
  isFinanciallyIndependent: boolean;  // fiRatio >= 1.0
  
  // Scoring & Grade
  breakdown: ScoreBreakdown;
  grade: GradeLetter;
  title: string;                      // e.g. "Financially Independent"
  
  // Life Highlights
  goalsCompletedCount: number;
  totalGoalsCount: number;
  bestDecision: string;
  criticalLesson: string;
}
```

---

## 3. The 4 Scoring Pillars (100 Points Total)

### Pillar 1: Financial Independence / FI/RE Ratio (40 Points Max)
Based on the Trinity Study (4% safe annual withdrawal rate from the retirement corpus):
$$\text{Annual Passive Income} = \text{RetirementCorpus} \times 0.04$$
$$\text{FI Ratio} = \frac{\text{Annual Passive Income}}{\text{Annual Living Expenses}}$$

* **Calculation:**
  * $\text{FI Ratio} \ge 1.25$: **40 Points** (Abundant passive surplus).
  * $1.0 \le \text{FI Ratio} < 1.25$: **35 Points** (100% self-sustaining).
  * $0.8 \le \text{FI Ratio} < 1.0$: **25 Points** (Slight deficit, minor budget cut needed).
  * $0.5 \le \text{FI Ratio} < 0.8$: **15 Points** (Moderate shortfall).
  * $\text{FI Ratio} < 0.5$: $\text{round}(\text{FI Ratio} \times 20)$ **Points**.

---

### Pillar 2: Life Milestones Completed (30 Points Max)
Evaluates non-retirement goals (Emergency Fund, Vacation, Car, Wedding, Home Down Payment, Child College):
$$\text{Milestone Score} = 30 \times \left( \frac{\text{Goals Funded 100\%}}{\text{Total Non-Retirement Goals}} \right)$$

---

### Pillar 3: Debt-Free Retirement (15 Points Max)
Entering retirement with high-interest or active debt severely compromises safety:
* **Outstanding Debt = ₹0:** **15 Points** (100% Debt-Free).
* **Outstanding Debt > ₹0:** **0 Points** (minus penalty of 1 point per ₹50,000 outstanding debt, min 0).

---

### Pillar 4: Liquid Safety Buffer (15 Points Max)
Measures emergency cash in bank + emergency buffer at age 60:
* $\ge 12 \text{ months}$ of living expenses: **15 Points**.
* $\ge 6 \text{ months}$ of living expenses: **10 Points**.
* $\ge 3 \text{ months}$ of living expenses: **5 Points**.
* $< 3 \text{ months}$: **0 Points**.

---

## 4. Letter Grade Scale

| Score Range | Grade | Title | Description |
| :--- | :--- | :--- | :--- |
| **90 – 100** | 🌟 **A+** | **Generational Wealth** | Complete financial freedom. Passive income covers lifestyle with heavy surplus. |
| **80 – 89** | 🟢 **A** | **Comfortable FI/RE** | 100% self-sufficient retirement, fully debt-free, all major goals achieved. |
| **70 – 79** | 🟡 **B** | **Solid Foundation** | Retirement is secure with minor budget adjustments. Most key milestones met. |
| **55 – 69** | 🟠 **C** | **Tight Retirement** | Underfunded corpus. Player must downscale lifestyle or rely on part-time income. |
| **< 55** | 🔴 **D / F** | **Financially Fragile** | Severe shortfall or unresolved debts at age 60. Dependent on family or state support. |

---

## 5. Pure Function Interface

```javascript
/**
 * Evaluates the final game state and returns the scorecard.
 * 
 * @param {GameState} state
 * @returns {ScorecardResult}
 */
export function evaluateScorecard(state) {
  // Pure evaluation math
}
```
