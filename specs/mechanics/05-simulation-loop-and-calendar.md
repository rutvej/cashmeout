# Mechanism Spec: Simulation Loop & Calendar Engine (`specs/mechanics/05-simulation-loop-and-calendar.md`)

## 1. Overview & Objective
This mechanism is the chronological heartbeat of the simulation. It advances time month-by-month, executes financial transactions in a strict mathematical sequence, checks loan maturities, compounds investments, and triggers calendar events/milestones with automatic pausing.

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
[ 2. Inflow ] ─── Take-Home Salary + Passive Interest
              │
              ▼
[ 3. Outflow ] ── Fixed Expenses + Loan EMIs + Insurance Premiums
              │
              ▼
[ 4. Monthly Surplus ] ── (Inflows - Outflows)
              │ (If deficit: auto-draw from Liquid Cash/Emergency buffer)
              ▼
[ 5. Distribute Waterfall SIPs ] ── Deduct effective SIPs, credit to Goal Buckets
              │ (Leftover surplus credits to Liquid Bank Cash)
              ▼
[ 6. Compound Investments ] ── Apply (1 + r_effective) to each Goal Bucket
              │
              ▼
[ 7. Servicing Loans ] ── Decrement loan tenure. If 0 months left, loan marked PAID!
              │
              ▼
[ 8. Check Annual Cycle (Month % 12 === 0) ]
              │ ├── Vacation Milestone: Execute trip, reset corpus, prompt next package!
              │ └── Annual Appraisal: +5% to +8% salary hike, pause for surplus allocation!
              ▼
[ 9. Check Milestone Targets ]
              │ Did character reach target age for Car(27), Wedding(29), Home(34), etc.?
              │ └── If YES: PAUSE and open Milestone Decision Modal.
              ▼
[ 10. Check Random Events ]
              │ Roll deterministic event. If triggered: PAUSE and open Event Modal.
              ▼
[ 11. Advance Clock & Net Worth Snapshot ]
              │ monthIndex++  •  Recalculate Age  •  Check Retirement (Age 60)
```

---

## 4. Special Event Rules

### A. Annual Vacation Cycle (Every 12 Months)
- At months 12, 24, 36, 48...
- Checks `goal_vacation.currentAmount >= goal_vacation.targetAmount`.
- **Success:** Spends the corpus, resets to ₹0, awards happiness badge, and pauses the simulation to let the player select their upcoming year's package (Domestic vs International).
- **Shortfall:** Allows player to either take a budget local weekend trip or skip and keep saving.

### B. Annual Career Appraisal (Every 12 Months)
- Salary receives a standard inflation/performance hike: **$+5.0\%$ to $+8.0\%$**.
- `monthlyTakeHome` increases.
- The new surplus delta ($+\Delta \text{₹/mo}$) triggers an **Auto-Pause**, opening the Reallocation Sheet to assign the new cash.

### C. Loan Payoff Milestone
- When an Education or Home Loan's `tenureMonthsRemaining === 0`:
  - Principal is marked ₹0.
  - The monthly EMI is permanently removed from outflows!
  - Monthly surplus jumps by the exact EMI amount, auto-routed into the investment waterfall!

### D. Retirement Milestone (Age 60)
- Simulation terminates gracefully.
- Transitions to Screen 6 (`scorecard`).

---

## 5. Pure Simulation Tick Interface

```javascript
/**
 * Advances the simulation by 1 month, returning the updated state.
 * 
 * @param {GameState} state
 * @returns {GameState}
 */
export function tickMonthlySimulation(state) {
  // Pure function updating gameState immutably
}
```
