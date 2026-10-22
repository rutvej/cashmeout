# Mechanism Spec: Investment Instruments & Compounding Engine (`specs/mechanics/04-investment-and-compounding-engine.md`)

## 1. Overview & Objective
This mechanism governs how surplus money grows over time. It models 4 real-world asset classes in India (Liquid Savings, Fixed Deposits, Gold, and Equity Mutual Funds). It handles:
1. **The Monthly Compounding Loop:** Adding monthly SIPs and crediting interest/returns to each active goal bucket.
2. **Deterministic vs. Volatile Assets:** Guaranteed returns for debt/cash vs realistic market cycles for equity and gold.
3. **Future Value (FV) Projections:** Computing mathematical feasibility (Red/Yellow/Green) for any combination of monthly SIP, instrument, and deadline.

---

## 2. Global Type Schema (`Instrument` & `AllocationItem`)

```typescript
export type InstrumentId = 'savings' | 'fd' | 'gold' | 'equity';

export interface InstrumentDefinition {
  id: InstrumentId;
  name: string;                   // e.g. "Equity Mutual Funds"
  annualReturnRate: number;       // e.g. 0.12 (12% p.a.)
  monthlyReturnRate: number;      // nominal r / 12
  volatilityMonthlyStdDev: number;// 0 for fixed, 0.025 for equity
  minTenureRecommendedMonths: number;
  riskRating: 'low' | 'moderate' | 'high';
  tag: string;
}

export interface GoalAllocation {
  goalId: string;                 // References GoalItem.id
  monthlySIP: number;             // Allocated ₹ per month
  instrumentId: InstrumentId;     // Chosen asset class
}
```

---

## 3. Mathematical Models & Formulas

### A. Asset Class Parameters
1. **Liquid Savings Account (`savings`):**
   - Annual Return: $4.0\%$ p.a. ($r_m = 0.04 / 12 = 0.00333$)
   - Volatility: $0\%$ (Guaranteed capital)
   - Liquidity: Immediate (0 exit load)
   - Best for: Emergency Fund, Vacation

2. **Fixed Deposit (`fd`):**
   - Annual Return: $7.0\%$ p.a. ($r_m = 0.07 / 12 = 0.00583$)
   - Volatility: $0\%$ (Guaranteed)
   - Liquidity: Redeemable anytime without market loss
   - Best for: Short/medium goals (Car, Wedding)

3. **Gold / Sovereign Gold Bonds (`gold`):**
   - Annual Return: $8.5\%$ p.a. ($r_m = 0.085 / 12 = 0.00708$)
   - Monthly Volatility: $\sigma_m = \pm 0.8\%$
   - Best for: Long-term hedge, Marriage, Home Down Payment

4. **Equity / Index Mutual Funds (`equity`):**
   - Annual Return: $12.0\%$ p.a. ($r_m = 0.12 / 12 = 0.010$)
   - Monthly Volatility: $\sigma_m = \pm 2.5\%$
   - Best for: Long-term wealth creation (Child College, Retirement)

### B. Monthly Compounding Tick
When month advances by 1:
$$\text{newBalance} = \text{currentBalance} \times (1 + r_{\text{effective}}) + \text{monthlySIP}$$

Where:
- For `savings` and `fd`: $r_{\text{effective}} = r_m$
- For `gold` and `equity`: $r_{\text{effective}} = r_m + \text{noise}(t)$ (bounded within realistic guardrails)

### C. Future Value (FV) Projection Formula
To predict if an allocation is enough to hit a goal:
$$FV = \text{CurrentBalance} \times (1 + r)^n + \text{SIP} \times \left[ \frac{(1 + r)^n - 1}{r} \right]$$
*(If $r = 0$, $FV = \text{CurrentBalance} + \text{SIP} \times n$).*

- $n = \text{targetMonthsRemaining}$
- $r = r_{\text{nominal\_monthly}}$

**Feasibility Status:**
- $\mathbf{FV \ge \text{Target}:}$ `on_track` (🟢 Green)
- $\mathbf{0.80 \times \text{Target} \le FV < \text{Target}:}$ `borderline` (🟡 Yellow, slight shortfall)
- $\mathbf{FV < 0.80 \times \text{Target}:}$ `underfunded` (🔴 Red, severe shortfall)

---

## 4. Pure Function Interfaces

```javascript
/**
 * Calculates projected future value of a SIP.
 */
export function calculateProjectedFV(currentBalance, monthlySIP, annualRate, months) {
  // Pure math formula
}

/**
 * Checks feasibility signal for a goal.
 */
export function evaluateGoalFeasibility(goal, monthlySIP, instrumentId) {
  // Returns { projectedAmount, status: 'on_track'|'borderline'|'underfunded', shortfall }
}
```

---

## 5. Global Invariants
1. **Surplus Conservation:** $\sum \text{monthlySIP}_i \le \text{monthlySurplus}$. Total allocated SIPs can never exceed monthly surplus.
2. **Emergency Shield Priority:** Emergency fund must have a non-zero monthly allocation until fully funded.
