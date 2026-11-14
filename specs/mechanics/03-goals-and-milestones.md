# Mechanism Spec: Goals, Protection, Waterfall & Analytics Engine (`specs/mechanics/03-goals-and-milestones.md`)

## 1. Overview & Core Philosophy
This mechanism governs four core financial pillars:
1. **Protection over Speculation (Insurance vs. Investment):** Medical emergencies are protected via **Health & Term Insurance** (recurring premium expenses with claim coverage), NOT through volatile investment compounding.
2. **The Cascading Waterfall SIP Engine:** When any goal is achieved (e.g. Emergency Fund hits 100% or Car is purchased), its monthly SIP automatically redirects to a designated fallback goal. If an emergency drains the safety shield, the SIP is automatically recalled to refill the buffer first.
3. **Mid-Game Lump-Sum Bank Seeding:** Players who start with 100% bank cash accumulation (or hold surplus in bank cash) can transfer lump-sum deposits from their accumulated Bank Cash (`character.liquidCash`) directly into any goal bucket at any time, instantly jumping the goal's progress.
4. **Per-Goal Interactive Analytics:** Every goal maintains a continuous ledger tracking **Invested Principal** vs. **Actual Fund Value**, exposing real-world instrument risk behaviors across Monthly and Yearly horizons.
5. **The Annual Vacation Reset Cycle:** Executes every 12 months, resets the corpus, and prompts the player to choose their next destination package (Domestic vs. International).

---

## 2. Insurance & Protection Schema

```typescript
export interface InsurancePolicy {
  id: 'health_insurance' | 'term_life_insurance';
  name: string;
  isPurchased: boolean;
  monthlyPremium: number;         // e.g. ₹800/mo for Health, ₹600/mo for Term Life
  sumInsured: number;             // e.g. ₹10,00,000 cover for hospitalization
  deductible: number;             // Co-pay in ₹ (e.g. ₹5,000)
}
```

* **Health Insurance Rule:** 
  * If an unexpected medical event hits (e.g., ₹1,50,000 hospital bill):
    * **With Insurance:** The policy pays 100% of costs above deductible. Character only pays deductible (₹5,000).
    * **Without Insurance:** The full ₹1,50,000 is drained from the Emergency Fund and liquid bank cash.

---

## 3. The Cascading Waterfall & Auto-Recall Rules

```
                      [ Monthly Surplus: ₹16,000 ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ 🛡️ Emergency Fund: ₹5,000/mo ]          [ 🌴 Retirement: ₹7,000/mo ]
   Is Buffer 100% Full?
        │
        ├── NO  ──► Continue filling Emergency Buffer
        │
        └── YES ──► [ CASCADING REDIRECTION ]
                    SIP automatically shifts to configured:
                    `redirectGoalId` (e.g. Car or Retirement)
```

### A. The Forward Waterfall (Goal Complete)
1. Every goal has an optional `redirectGoalId: string | null`.
2. When a goal's $\text{currentAmount} \ge \text{targetAmount}$:
   - The goal transitions to `completed` (or `buffer_full` for Emergency Fund).
   - In Fixed-₹ Mode: Its `monthlySIP` is automatically added to `redirectGoalId`'s SIP. If that goal is also full, it cascades down the chain until reaching `goal_retirement` (the ultimate wealth sink).
   - In Percentage Mode: The freed allocation percentage is redistributed proportionally across all remaining active incomplete goals.

### B. The Emergency Auto-Recall (Safety Shield Priority)
1. If any life shock event (medical bill, job layoff, repair) drains the Emergency Fund so that $\text{currentAmount} < \text{targetAmount}$:
   - The Emergency Fund immediately switches to `refill_mode`.
   - **The system instantly recalls its original SIP** from the redirected goal.
   - The redirected goal's SIP drops back to its base allocation.
   - Once the Emergency Fund reaches 100% again, the SIP automatically cascades forward once more!

### C. The Annual Vacation Re-selection Cycle
1. Every 12 months (Months 12, 24, 36, etc.):
   - If $\text{currentAmount} \ge \text{targetAmount}$, the vacation executes successfully (erases career stress/burnout).
   - The vacation corpus is disbursed (resets to ₹0).
   - An annual vacation modal appears, prompting the player to choose their package for the upcoming year:
     - **Domestic:** ₹40,000 – ₹60,000
     - **International:** ₹1,50,000 – ₹2,50,000
   - Monthly SIP can be adjusted or kept on auto-pilot.

---

## 4. Mid-Game Lump-Sum Bank Seeding Engine

When players start the game with the instant 100% bank accumulation flow (or accumulate surplus liquid cash mid-game), goals initially have `baseMonthlySIP = 0` and `currentAmount = 0`. At any point during gameplay, the player can open any goal to **seed it with a lump sum from accumulated bank cash** and activate an ongoing monthly SIP.

### A. Mathematical Formulation & Invariant
$$\text{Transfer Amount} \le \text{character.liquidCash}$$
$$\text{character.liquidCash} \leftarrow \text{character.liquidCash} - \text{Transfer Amount}$$
$$\text{goal.currentAmount} \leftarrow \text{goal.currentAmount} + \text{Transfer Amount}$$
$$\text{goal.initialLumpSumSeed} \leftarrow \text{goal.initialLumpSumSeed} + \text{Transfer Amount}$$
$$\text{goal.totalPrincipalDeposited} \leftarrow \text{goal.totalPrincipalDeposited} + \text{Transfer Amount}$$

### B. Transaction Rules
1. **Atomicity:** The lump-sum transfer is an atomic debit-credit transaction: exactly ₹X is deducted from `character.liquidCash` and credited to `goal.currentAmount`. No phantom funds can be created or lost.
2. **Capping:** $\text{Transfer Amount}$ is strictly bounded by $[0, \min(\text{character.liquidCash}, \text{goal.targetAmount} - \text{goal.currentAmount})]$ for milestone goals. For `goal_retirement`, it is bounded only by $\text{character.liquidCash}$.
3. **Simultaneous Monthly SIP Activation:** When seeding a goal with a lump sum, the player can simultaneously configure the goal's recurring monthly SIP from available monthly surplus:
   $$\text{baseMonthlySIP}_{\text{new}} \le \text{Available Surplus}$$

---

## 5. Per-Goal Interactive Multi-Curve Growth Chart & Risk Profiles

Inside the surplus distribution screen (`FinancialSetupScreen.jsx`), players can inspect an interactive multi-curve analytics chart for each goal:

### A. Dual Curves Formulation
1. **Curve 1: Invested Principal ($P(t)$)**:
   The cumulative total of capital out-of-pocket deposits committed by the player up to month $t$:
   $$P(t) = \text{initialLumpSumSeed} + \sum_{m=1}^{t} \text{actualSIPContribution}(m)$$
   This curve represents the zero-interest cost basis. It is monotonically non-decreasing.
2. **Curve 2: Actual Fund Value ($V(t)$)**:
   The real compounded portfolio valuation of the goal at month $t$:
   $$V(0) = \text{initialLumpSumSeed}$$
   $$V(t) = \left(V(t-1) + \text{actualSIPContribution}(t)\right) \times \left(1 + r_{\text{instrument}}(t)\right)$$
   Reflects exact monthly compounding, interest, market volatility, and macro crashes.
3. **Net Wealth Delta ($\Delta(t)$)**:
   $$\text{Wealth Created} = V(t) - P(t)$$
   - When $V(t) > P(t)$: Goal is in profit (green fill between curves).
   - When $V(t) < P(t)$: Goal is experiencing a market drawdown (red fill between curves, applicable to Equity Mutual Funds during bear markets/crashes).

### B. Time Horizon Toggle
A segmented pill toggle lets players toggle the chart's granularity:
- **"Monthly" View:** Plots every single month index ($t \in [0, \text{currentMonth}]$). Essential for inspecting monthly dips, peak-to-trough crash drops, and month-by-month compounding noise.
- **"Yearly" View:** Plots annualized milestone points ($t \in \{0, 12, 24, 36, \dots\}$). Smooths short-term monthly market noise to showcase the long-term exponential compounding trendline over multi-decade horizons.

### C. Instrument Risk Profiles
Each goal displays a dynamic **Instrument Risk Card** reflecting its selected asset class:

| Instrument | Compounding Nature | Volatility Behavior | Capital Protection |
| :--- | :--- | :--- | :--- |
| **Liquid Savings (4% p.a.)** | Steady linear climb | Zero volatility ($\sigma_m = 0\%$) | **100% Capital Safe**: $V(t) \ge P(t)$ always. Instant liquidity with zero exit penalties. Ideal for Emergency Shield and Vacation. |
| **Fixed Deposit (FD) (7% p.a.)** | Guaranteed compounded growth | Zero volatility ($\sigma_m = 0\%$) | **Guaranteed Yield**: Unaffected by market cycles. Subject to a **1.5% premature liquidation penalty** if drawn before target maturity. |
| **Gold / SGB (8.5% p.a.)** | Cyclical capital appreciation | Moderate volatility ($\pm 1.0\%$ to $+2.0\%$/mo) | **Inflation Hedge**: Resilient safe haven. Experiences mild cyclical pullbacks, but maintains purchasing power over multi-year horizons. |
| **Equity Mutual Funds (12% p.a.)** | High multi-decade multiplier | High monthly volatility ($-3.5\%$ to $+4.5\%$/mo) | **Boom/Bust Cycles**: Undergoes periodic bear corrections and a **guaranteed macro crash (-28% to -55%)**. Highest terminal wealth, but dangerous for short-term goals. |

---

## 6. Goal Data Schema with Analytics & Seeding Extensions

```typescript
export interface GoalLedgerEntry {
  month: number;
  age: number;
  investedPrincipal: number;       // Cumulative principal deposited (seeds + SIPs)
  actualBalance: number;           // Compounded market value V(t)
  monthlyReturnRate: number;       // Effective return applied in this month
}

export interface GoalItem {
  id: string;
  name: string;
  kind: 'milestone' | 'recurring';
  category: 'safety' | 'lifestyle' | 'asset' | 'long_term';
  description: string;
  
  targetAmount: number;
  currentAmount: number;
  
  targetAge: number | null;
  targetMonthsRemaining: number;
  recurrenceIntervalMonths?: number;
  
  // Waterfall Cascading Logic
  baseMonthlySIP: number;          // Original allocated SIP (starts at ₹0 in instant start)
  effectiveMonthlySIP: number;     // Active SIP including incoming waterfall overflows
  redirectGoalId: string | null;   // Next goal in line when this one is full
  isRefillPriority?: boolean;      // true for Emergency Fund
  
  // Dual Allocation Modes
  allocationMode: 'percentage' | 'fixed';
  allocationPercent: number;        // Slice of monthly surplus (0 to 100%)
  
  // Mid-Game Lump-Sum Seeding
  initialLumpSumSeed: number;       // Cumulative lump-sum transfers from bank cash
  totalPrincipalDeposited: number;  // initialLumpSumSeed + cumulative monthly SIPs
  
  // Investment Vehicle
  instrumentId: 'savings' | 'fd' | 'gold' | 'equity';
  
  // Per-Goal Historical Ledger for Dual-Curve Analytics
  history: GoalLedgerEntry[];
  
  selectedTierOption?: string;
  isMandatory: boolean;
  priority: number;
  status: 'in_progress' | 'completed' | 'buffer_full' | 'refill_needed';
  icon: string;
}
```

---

## 7. Pure Function Interfaces

```javascript
/**
 * Executes an atomic lump-sum transfer from character bank cash into a goal.
 * 
 * @param {CharacterState} character 
 * @param {GoalItem} goal 
 * @param {number} transferAmount 
 * @returns {{ character: CharacterState, goal: GoalItem }}
 */
export function transferLumpSumToGoal(character, goal, transferAmount) {
  const availableCash = Math.max(0, character.liquidCash || 0);
  const maxAllowed = goal.id === 'goal_retirement' 
    ? availableCash 
    : Math.min(availableCash, Math.max(0, goal.targetAmount - goal.currentAmount));
  
  const sanitizedAmount = Math.max(0, Math.min(Math.round(transferAmount), maxAllowed));
  if (sanitizedAmount <= 0) return { character, goal };

  const updatedCharacter = {
    ...character,
    liquidCash: availableCash - sanitizedAmount,
  };

  const updatedGoal = {
    ...goal,
    currentAmount: (goal.currentAmount || 0) + sanitizedAmount,
    initialLumpSumSeed: (goal.initialLumpSumSeed || 0) + sanitizedAmount,
    totalPrincipalDeposited: (goal.totalPrincipalDeposited || 0) + sanitizedAmount,
  };

  return { character: updatedCharacter, goal: updatedGoal };
}

/**
 * Appends a monthly ledger entry to the goal's analytics history.
 */
export function recordGoalSnapshot(goal, monthIndex, currentAge, monthlyRate) {
  const currentHistory = goal.history || [];
  const newEntry = {
    month: monthIndex,
    age: currentAge,
    investedPrincipal: Math.round(goal.totalPrincipalDeposited || goal.currentAmount || 0),
    actualBalance: Math.round(goal.currentAmount || 0),
    monthlyReturnRate: Number(monthlyRate.toFixed(6)),
  };

  return {
    ...goal,
    history: [...currentHistory, newEntry],
  };
}
```
