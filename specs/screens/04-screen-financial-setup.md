# Screen 4: Financial Setup & Allocation Module (`specs/screens/04-screen-financial-setup.md`)

## 1. Purpose & Reusability Objective
This screen is the **Financial Command Center** where the player allocates their monthly surplus cash across their goals, assigns investment instruments, configures insurance protection, and sets up automated **Waterfall Redirections**.

Directly adapted from the canonical carousel UX in `backup-old-mess:src/components/screens/FinancialSetup.jsx`, upgraded with clean modern state management and light CRED NeoPOP design aesthetics.

### Reusable Across the Entire Simulation:
1. **Onboarding Mode (Screen 4):** Initial setup before launching life simulation.
2. **Promotion / Salary Raise Mode:** Allocating new surplus delta (+Δ ₹/mo).
3. **Emergency Fund Refill Mode:** Triggered automatically if unexpected shocks drain the safety buffer.
4. **Mid-Game Strategic Rebalance:** Accessible anytime via "Adjust SIPs & Redirections" on the main game dashboard.

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-----------------------------------------------------------------------+
|  [ PERSISTENT TOP BAR - FIXED ]                                       |
|  [← Back to Dashboard] (if mid-game)            Day 142 / Age 24      |
|                                                                       |
|  MONTHLY SURPLUS                           ALLOCATED                  |
|  ₹32,500 / mo                              ₹28,000 / ₹32,500          |
|  [████████████████████████████████████████░░░░░] 86% Allocated        |
|                                                                       |
|  Goal Stepper: [ •  •  ▬  •  •  • ]              [+ New Life Goal]    |
+-----------------------------------------------------------------------+
|                                                                       |
|  [ MAIN GOAL FOCUS CARD ]                                             |
|  +-----------------------------------------------------------------+  |
|  | 🛡️ Emergency Safety Buffer       Target: ₹1,80,000 (6 Mo Buffer) |  |
|  | [CORE SHIELD]                     Evaluated against living costs|  |
|  |                                                                 |  |
|  | (If 100% full: "✓ 100% Buffered! Set ₹0 to redirect surplus")    |  |
|  |                                                                 |  |
|  | Monthly Allocation:                                             |  |
|  | [ ₹ 6,000 / mo                                                ] |  |
|  | Quick Presets: [+₹500] [+₹1k] [+₹2k] [+₹5k] [Fill Remaining]    |  |
|  |                                                                 |  |
|  | Investment Instrument:                                          |  |
|  | [Liquid Savings 4%] [Fixed Deposit 7%] [Gold 8.5%] [Equity 12%]|  |
|  |                                                                 |  |
|  | [ LIVE RECHARTS PROJECTION AREA CHART ]                         |  |
|  |   ₹1.8L --------------------- Target Line (Dashed)              |  |
|  |   ₹1.2L        .-~*~-.                                          |  |
|  |   ₹0.6L    _.-~        (Compound Growth Curve)                  |  |
|  |   ₹0L   .-~                                                     |  |
|  |         M0     M6     M12    M18    M24                         |  |
|  |   Status: 🟢 On Track (Projected ₹1,95,000)                      |  |
|  |                                                                 |  |
|  | ↪️ When Complete, Redirect SIP to: [🚗 First Car ▼]             |  |
|  |                                                                 |  |
|  | [← Prev]                   [Skip Goal]                 [Next →] |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
+-----------------------------------------------------------------------+
|  [ FIXED BOTTOM ACTION BAR ]                                          |
|  6 Planned · 1 Skipped                    + ₹4,500 / mo Cash Buffer   |
|  [ START LIFE SIMULATION 🚀 ]                                         |
+-----------------------------------------------------------------------+
```

---

## 3. Data Contract & Engine Bindings

### A. Inputs (Read from Store)
- `character: CharacterState` (reads `character.monthlySurplus`, `character.totalFixedExpenses`, `character.loans`)
- `goals: GoalItem[]` (reads list of active recurring and milestone goals)
- `insurance: Record<string, InsurancePolicy>` (reads health and term life policies)
- `simulation: SimulationState` (reads `currentMonthIndex`, `isPaused`, `activeModal`)

### B. Outputs (Mutations on State)
- `setGoalAllocation(goalId, { baseMonthlySIP, instrumentId, redirectGoalId })`
- `toggleInsurance(policyKey)`
- `updateGoal(goalId, partialGoal)`
- Custom goal creation via `goals.push(...)`
- `navigateTo('main_game')`

---

## 4. UI Controls & Interactive Features

1. **Top Persistent Header:**
   - Real-time surplus tracker displaying exact monthly surplus vs committed SIPs.
   - Dynamic progress bar transitioning from Emerald to Rose if over-allocated.
   - Stepper dot row: Active goal shown as elongated pill (`w-6`), allocated goals in Emerald, skipped in gray.
   - **+ New Life Goal Button:** Opens a quick modal to create custom milestones (e.g., *Wealth Multiplier Fund*, *Early Retirement*, *Luxury Travel*).

2. **Goal Full & Redirect Banner:**
   - When a goal reaches 100% of its target (`currentAmount >= targetAmount`), a prominent banner alerts the player.
   - Includes a one-click action: `Set ₹0 (Redirect)` to instantly free up the surplus or route it downstream.

3. **Dynamic Emergency Fund Evaluation:**
   - 6-month safety buffer dynamically benchmarked against active living expenses:
     $$\text{Target} = (\text{totalFixedExpenses} + \text{totalLoanEMIs}) \times 6$$
   - Displays real-time refill deficit if emergency expenses drain the fund.

4. **Monthly SIP Input & Preset Steppers:**
   - Prominent currency input with large `₹` prefix.
   - Quick one-click increments: `+₹500`, `+₹1,000`, `+₹2,000`, `+₹5,000`.
   - `Fill Remaining (+₹X)` button to allocate all remaining unallocated surplus to the active goal with 1 click.

5. **Investment Instrument Selector:**
   - Horizontal scrollable instrument cards:
     - **Equity Mutual Funds** (~12-15% p.a., High Growth)
     - **Gold / SGB** (~8.5% p.a., Inflation Hedge)
     - **Fixed Deposit** (~7% p.a., Guaranteed Return)
     - **Liquid Savings** (~4% p.a., Safe & Instant)
   - Visual selection highlight with interest rate badges.

6. **Interactive Recharts AreaChart Projection:**
   - Renders future compounding annuity projection:
     $$FV(t) = \text{PV} \times (1 + r)^t + \text{PMT} \times \left[ \frac{(1 + r)^t - 1}{r} \right]$$
   - Target reference line (dashed).
   - Feasibility status indicator:
     - 🟢 **On Track** ($FV \ge \text{Target}$)
     - 🟡 **Borderline** ($FV \ge 80\% \text{ of Target}$)
     - 🔴 **Behind / Underfunded** ($FV < 80\% \text{ of Target}$)

7. **The Cascading Waterfall Selector:**
   - Dropdown specifying `redirectGoalId` when target is satisfied.
   - Engine ensures SIP flows forward automatically upon completion.

8. **Fixed Bottom Action Bar:**
   - Summarizes planned vs skipped goals.
   - Highlights liquid cash buffer.
   - High-contrast tactile CTA button to start or resume simulation.
