# Mechanism Spec: Simulation Loop, Strict Cashflow Accounting & Calendar Engine (`specs/mechanics/05-simulation-loop-and-calendar.md`)

## 1. Overview & Objective
This mechanism is the chronological heartbeat of the simulation. It advances time month-by-month, executes financial transactions in a strict mathematical sequence, checks loan maturities, compounds investments, enforces strict cash-in-bank accounting invariants, and triggers calendar events/milestones with automatic pausing.

---

## 2. Global State Schema (`SimulationState`)

```typescript
export type GameSpeed = 1 | 2 | 5;

export interface SimulationState {
  currentMonthIndex: number;      // 0 = Start, advances +1 each tick
  startingAge: number;            // e.g. 23
  currentAge: number;             // startingAge + Math.floor(currentMonthIndex / 12)
  currentMonthOfYear: number;     // 1 to 12
  retirementAge: number;          // 60
  totalRetirementMonths: number;  // (60 - startingAge) * 12
  
  // Controls
  isPaused: boolean;              // true stops ticking
  gameSpeed: GameSpeed;           // 1x (1500ms), 2x (800ms), 5x (350ms)
  
  // Macro Market Crash Tracking
  hasTriggeredMacroCrash: boolean;
  macroCrashTriggerMonth: number;
  macroCrashTier: 1 | 2 | 3;
  macroCrashDepthPercent: number;
  
  // Ledger History (for charts & scorecard)
  history: Array<{
    month: number;
    age: number;
    netWorth: number;
    liquidCash: number;
    totalInvestments: number;
    totalDebt: number;
  }>;
}
```

---

## 3. The Strict Order of Operations per Monthly Tick

Every monthly tick executes these 11 sequential steps:

```
[ 1. Check Pause / Game Over ]
              │ (If not paused)
              ▼
[ 2. Inflow ] ─── Take-Home Salary + Passive Interest + Venture Distributions
              │
              ▼
[ 3. Outflow ] ── Fixed Expenses + Car Upkeep + Home Maint + Spouse Costs + EMIs + Premiums
              │
              ▼
[ 4. Monthly Surplus ] ── (Inflows - Outflows)
              │
              ▼
[ 5. Distribute Waterfall SIPs & Strict Bank Cash ]
              │ ├── IF Surplus > 0: Total SIP <= Surplus. Residual deposited to Bank Cash.
              │ └── IF Surplus <= 0: All SIPs = 0. Zero phantom cash. Deficit drawn from Bank, then Emergency.
              ▼
[ 6. Compound Investments ] ── Apply (1 + r_effective) to each Goal Bucket (with crash curve)
              │
              ▼
[ 7. Servicing Loans ] ── Decrement loan tenure. If 0 months left, loan marked PAID!
              │
              ▼
[ 8. Check Macro Market Crash ] ── If month === crashTriggerMonth: PAUSE & Show Non-Directive Alert!
              │
              ▼
[ 9. Check Annual Cycle (Month % 12 === 0) ]
              │ ├── Vacation Milestone: Execute trip, reset corpus, prompt next package!
              │ └── Annual Appraisal: +5% to +8% salary hike, pause for surplus allocation!
              ▼
[ 10. Check Milestone Targets & Random Events ]
              │ Did character reach target age for Car(27), Wedding(29), Home(34), etc.?
              │ └── If YES: PAUSE and open Milestone Decision Modal.
              ▼
[ 11. Advance Clock & Net Worth Snapshot ]
              │ monthIndex++  •  Recalculate Age  •  Check Retirement (Age 60)
```

---

## 4. Strict Cashflow Invariants & Zero Free Money Leak

### A. The Core Invariant
$$\text{Total Monthly Outflow} = \text{totalFixedExpenses} + \text{assetMaintenance} + \text{spouseLivingCosts} + \text{loanEMIs} + \text{insurancePremiums}$$
$$\text{monthlySurplus} = \text{monthlyTakeHome} - \text{Total Monthly Outflow}$$
$$\text{Total SIP Contributed} \le \max(0, \text{monthlySurplus})$$

### B. Positive Surplus Cashflow ($\text{monthlySurplus} > 0$)
When surplus is strictly positive:
1. **Goal SIP Allocation:**
   For each allocatable goal $g$:
   $$\text{needed}_g = \max(0, \text{goal.targetAmount} - \text{goal.currentAmount})$$
   (for `goal_retirement`, $\text{needed}_g = \infty$).
   $$\text{actualContribution}_g = \min(\text{effectiveMonthlySIP}_g, \text{needed}_g)$$
2. **Eliminating the Double-Counting Bug:**
   - **Previous Bug:** The engine calculated $\text{excess} = \text{sip} - \text{actualContribution}$ and credited `liquidCash += excess`, and THEN also credited `liquidCash += leftoverSurplus`. This credited unspent SIP funds twice.
   - **Strict Mathematical Invariant:**
     $$\text{Total SIP Contributed} = \sum_{g} \text{actualContribution}_g$$
     $$\text{leftoverSurplus} = \max(0, \text{monthlySurplus} - \text{Total SIP Contributed})$$
     $$\text{character.liquidCash} \leftarrow \text{character.liquidCash} + \text{leftoverSurplus}$$
     - Under NO circumstances is any separate `excess` credited to `liquidCash`.
     - Exactly and only $\text{leftoverSurplus}$ is deposited into Bank Cash.

### C. Zero or Deficit Cashflow ($\text{monthlySurplus} \le 0$)
During periods of unemployment, career sabbatical, or when total monthly outflows exceed income:
1. **Strict Zero SIP Rule:**
   $$\text{actualContribution}_g = 0 \quad \forall g \in \text{Goals}$$
   - No investments are made.
2. **Zero Phantom Cash Deposit:**
   $$\text{leftoverSurplus} = 0$$
   - Zero free money is deposited into `character.liquidCash`.
3. **Strict Waterfall Deficit Funding:**
   Let $\text{Deficit} = |\text{monthlySurplus}|$:
   - **Step 1: Draw from Liquid Bank Cash:**
     $$\text{drawnFromBank} = \min(\text{character.liquidCash}, \text{Deficit})$$
     $$\text{character.liquidCash} \leftarrow \text{character.liquidCash} - \text{drawnFromBank}$$
     $$\text{remainingDeficit} = \text{Deficit} - \text{drawnFromBank}$$
   - **Step 2: Draw from Emergency Fund:**
     $$\text{drawnFromEmergency} = \min(\text{goal\_emergency.currentAmount}, \text{remainingDeficit})$$
     $$\text{goal\_emergency.currentAmount} \leftarrow \text{goal\_emergency.currentAmount} - \text{drawnFromEmergency}$$
     $$\text{remainingDeficit} \leftarrow \text{remainingDeficit} - \text{drawnFromEmergency}$$
   - **Step 3: Unfunded Deficit & Debt:**
     If $\text{remainingDeficit} > 0$, the character is insolvent for the month and incurs emergency high-interest credit lines (18% p.a.).

---

## 5. Guaranteed Macro Economic Market Crash News Alert

When the simulation hits the deterministic crash trigger month ($M_{\text{crash}}$ between ages 34 and 45):
1. **Auto-Pause:** The simulation clock pauses immediately (`simulation.isPaused = true`).
2. **Non-Directive News Alert Modal:**
   A high-impact NeoPOP financial bulletin modal appears on screen.

### A. Non-Directive Principle (Player Agency Preserved)
> [!IMPORTANT]
> **Strict Actuarial & UX Rule:** The Market Crash alert must **NEVER** give prescriptive financial advice or tell the player what to do. It must NOT suggest panic-selling, stopping SIPs, rebalancing to gold, or moving to cash. It functions strictly as an objective financial news report, leaving the player with complete agency to either intervene or let their disciplined SIPs run uninterrupted.

### B. Wireframe: Macro Market Crash Alert Modal

```
+-------------------------------------------------------------+
|  🔴 FINANCIAL TIMES BREAKING NEWS                           |
|  [ ECONOMIC CRISIS BULLETIN • AGE 38, MO 7 ]                |
+-------------------------------------------------------------+
|                                                             |
|  HEADLINE:                                                  |
|  "SENSEX PLUNGES 38% AMID GLOBAL LIQUIDITY SQUEEZE"         |
|                                                             |
|  MARKET CONTEXT:                                            |
|  • Asset Class Impact: Equity Mutual Funds face severe      |
|    drawdown across the next 3 to 5 months.                  |
|  • Bank Fixed Deposits & Liquid Savings: Unaffected (0%).   |
|  • Gold / SGB: Holding steady as safe-haven asset.          |
|                                                             |
|  HISTORICAL PERSPECTIVE:                                    |
|  Macroeconomic panics occur every 7 to 10 years in emerging |
|  markets. Historically, equity recoveries take 18–30 months |
|  to reclaim all-time highs.                                 |
|                                                             |
|  +-------------------------------------------------------+  |
|  |             [ UNDERSTOOD / CONTINUE ▶ ]               |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

### C. Modal Schema & Props
```typescript
export interface MarketCrashAlertProps {
  crashAge: number;
  tier: 1 | 2 | 3;
  depthPercent: number; // e.g. -0.38
  headline: string;
  contextText: string;
  onDismiss: () => void; // Unpauses and continues simulation
}
```

---

## 6. Pure Simulation Tick Interface

```javascript
import { getMonthlyInstrumentReturnRate } from './compoundingEngine.js';

/**
 * Advances the simulation by 1 month, returning the updated state.
 * 
 * @param {GameState} state
 * @returns {GameState}
 */
export function tickMonthlySimulation(state) {
  if (state.simulation.isPaused) return state;

  const month = state.simulation.currentMonthIndex;
  const currentAge = state.character.age + Math.floor(month / 12);
  const character = { ...state.character };
  let liquidCash = character.liquidCash || 0;

  // 1. Calculate Inflows & Outflows
  const monthlyTakeHome = character.monthlyTakeHome || 0;
  const totalOutflow = character.totalMonthlyOutflow || 0;
  const monthlySurplus = monthlyTakeHome - totalOutflow;

  // 2. Strict Cashflow Invariants & SIP Distribution
  let updatedGoals = [...state.goals];
  let totalSIPContributed = 0;

  if (monthlySurplus > 0) {
    updatedGoals = updatedGoals.map((g) => {
      if (g.isLaunched) return g;
      const isRetirement = g.id === 'goal_retirement';
      const target = g.targetAmount || 1;
      const current = g.currentAmount || 0;
      const sip = g.effectiveMonthlySIP || 0;

      if (current >= target && !isRetirement) {
        return { ...g, effectiveMonthlySIP: 0 };
      }

      const needed = isRetirement ? sip : Math.max(0, target - current);
      const actualContribution = Math.min(sip, needed);
      totalSIPContributed += actualContribution;

      return {
        ...g,
        currentAmount: current + actualContribution,
        totalPrincipalDeposited: (g.totalPrincipalDeposited || current) + actualContribution,
      };
    });

    // Zero Free Money Leak Invariant: Only residual unallocated surplus deposits into Bank Cash
    const leftoverSurplus = Math.max(0, monthlySurplus - totalSIPContributed);
    liquidCash += leftoverSurplus;
  } else {
    // Deficit Handling: Zero SIPs, Zero Phantom Cash, Fund Deficit from Bank -> Emergency
    const deficit = Math.abs(monthlySurplus);
    const drawBank = Math.min(liquidCash, deficit);
    liquidCash -= drawBank;
    let remainingDeficit = deficit - drawBank;

    updatedGoals = updatedGoals.map((g) => {
      if (g.id === 'goal_emergency' && remainingDeficit > 0) {
        const emergencyCurrent = g.currentAmount || 0;
        const drawEmergency = Math.min(emergencyCurrent, remainingDeficit);
        remainingDeficit -= drawEmergency;
        return {
          ...g,
          currentAmount: emergencyCurrent - drawEmergency,
        };
      }
      return g;
    });
  }

  // 3. Compounding Investments with Return Rates & History Tracking
  updatedGoals = updatedGoals.map((g) => {
    if (g.isLaunched) return g;
    const rate = getMonthlyInstrumentReturnRate(
      g.instrumentId || 'savings',
      month,
      character.seed,
      character.age
    );
    const compoundedAmount = Math.round((g.currentAmount || 0) * (1 + rate));
    
    // Per-Goal Ledger Snapshot
    const historyEntry = {
      month,
      age: currentAge,
      investedPrincipal: Math.round(g.totalPrincipalDeposited || compoundedAmount),
      actualBalance: compoundedAmount,
      monthlyReturnRate: Number(rate.toFixed(6)),
    };

    return {
      ...g,
      currentAmount: compoundedAmount,
      history: [...(g.history || []), historyEntry],
    };
  });

  // 4. Update Character State & Advance Simulation Clock
  character.liquidCash = liquidCash;

  return {
    ...state,
    character,
    goals: updatedGoals,
    simulation: {
      ...state.simulation,
      currentMonthIndex: month + 1,
      currentAge,
      currentMonthOfYear: (month % 12) + 1,
    },
  };
}
```
