# Screen 4: Financial Setup & Surplus Allocation (`specs/screens/04-screen-financial-setup.md`)

## 1. Overview & Minimal UX Principles
This screen is the **Financial Command Center** where the player allocates monthly surplus cash across active goals, selects investment vehicles, and configures insurance.

### Entry Conditions
Players enter Screen 4 under two scenarios:
1. **From Onboarding (Screen 3):** When the player clicks **"⏸️ Pause & Plan Allocations First"** on `03-screen-goal-setup.md` to configure allocations prior to starting the game loop. The simulation is initialized in a paused state (`simulation.isPaused = true`).
2. **From Mid-Game Inspection (Screen 5):** When the player opens the "Goals & SIPs" inspection tab during an auto-pause (e.g. salary appraisal, milestone event, market crash) or manual user pause to calibrate their financial roadmap.

### Core Redesign Principles (Clean & Minimal):
1. **No Long Paragraphs or Intrusive Warnings**: All lengthy educational copy, policy explanations, and loud alarmist warning banners are removed.
2. **Slidable Goal Cards**: Goals are presented as sleek, slidable cards (horizontal sliding track / swipeable carousel) with instant smooth transitions.
3. **Dual Allocation Modes (₹ Amount vs. % Percentage)**: Supports both exact rupee SIPs and proportional surplus percentages with automatic bi-directional synchronization.
4. **Default Bank Cash Accumulation (Unallocated Surplus)**: Any surplus not assigned to goals automatically deposits into the player's liquid bank account (`character.liquidCash`). If zero goals are assigned SIPs, 100% of surplus deposits into Bank Cash.
5. **Auto-Removal of Achieved One-Time Goals**: Once a one-time milestone goal is completed (`status === 'completed'` or `isCompleted`), it is **automatically removed** from the surplus distribution screen so it never clutters the interface.
6. **Zero-Scroll Viewport**: Essential controls (allocation input, presets, instrument pills, status pill, and next/action CTA) fit comfortably on standard laptop and mobile viewports without forcing the user to scroll vertically to proceed.

---

## 2. Layout & Wireframe (Minimal Single-Screen Design)

```
+-------------------------------------------------------------------------+
|  [⏸️ SIMULATION PAUSED]                                                |
|  SURPLUS: ₹35,000/mo    ALLOCATED: ₹28,000    BANK CASH FLOW: +₹7,000   |
|  [████████████████████████████████████████░░░░░░░░] 80% Allocated       |
|  💡 20% (₹7,000/mo) accumulates directly into your Bank Account         |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ SLIDABLE GOAL CHIPS TRACK ]                                          |
|  [ 🛡️ Emergency ₹5k ] [ 🚗 Car ₹5k ] [ 🏠 Home ₹10k ] [ 🏖️ Vacation ₹0 ] |
|                                                                         |
|  ---------------------------------------------------------------------  |
|                                                                         |
|  [ SLIDABLE ACTIVE GOAL CARD ]  (Swipe / ◄ ► Controls)                  |
|                                                                         |
|  🚗 FIRST CAR                             Target: ₹6,00,000 (Age 27)    |
|  Mode Toggle: [ ₹ Fixed Amount ]  [ % Surplus Share ]                   |
|                                                                         |
|  Monthly Allocation:                                                    |
|  [ − ]   ₹ 5,000 / month (14.3%)   [ + ]                                |
|  Quick Presets: [+₹1,000]  [+₹2,000]  [+₹5,000]  [Fill Leftover ₹7k]    |
|                                                                         |
|  Investment Instrument:                                                 |
|  [ Liquid 4% ]  [ FD 7% ]  [ Gold 8.5% ]  [★ Mutual Fund 12% ]          |
|                                                                         |
|  Status: 🟢 On Track (Projected ₹6,15,000 by Age 27)                   |
|                                                                         |
|  [ 📈 View Growth Chart ▾ ] (Collapsible toggle)                        |
|                                                                         |
+-------------------------------------------------------------------------+
|  [◄ PREV GOAL]       [NEXT GOAL ►]     [ UNPAUSE & START SIMULATION 🚀 ]|
+-------------------------------------------------------------------------+
```

---

## 3. Data Contract & Filtering Rules

### Active Goal Filtering (Auto-Remove Completed Goals)
```typescript
// Only incomplete goals or recurring active goals are presented for allocation
export function getActiveAllocatableGoals(goals: GoalItem[]): GoalItem[] {
  return goals.filter((g) => {
    // Active cash-flow ventures generate income; they don't take monthly SIPs
    if (g.isLaunched) return false;

    // One-time milestone goals (e.g. Car, Home Down Payment, Wedding):
    // Once achieved or finalized, REMOVE from the allocation list completely!
    if (g.kind === 'milestone' && (g.status === 'completed' || (g.currentAmount || 0) >= (g.targetAmount || 1))) {
      return false;
    }

    // Recurring goals (e.g. Emergency Refill, Annual Vacation) remain if active
    return true;
  });
}
```

### Unallocated Surplus Invariant
$$\text{Total Allocated SIP} = \sum_{g \in \text{AllocatableGoals}} \text{baseMonthlySIP}_g$$
$$\text{Leftover Surplus} = \max(0, \text{character.monthlySurplus} - \text{Total Allocated SIP})$$
- On each monthly tick, $\text{Leftover Surplus}$ is deposited directly into `character.liquidCash`.
- If the player leaves all allocations at ₹0, $\text{Total Allocated SIP} = 0$, and 100% of surplus deposits into Bank Cash.

### State Mutations
- `setGoalAllocation(goalId, { baseMonthlySIP, allocationPercent, instrumentId, redirectGoalId })`
- `toggleInsurance(policyKey)`
- `updateGoal(goalId, partialGoal)`
- `unpauseAndResume():`
  - Sets `simulation.isPaused = false`
  - Sets `currentScreen = 'main_game'`

---

## 4. Component Architecture & UI Elements

1. **Top Persistent Surplus Header (Compact)**:
   - Displays 3 metrics in clean monospace:
     - **Monthly Surplus:** Total in-hand cash remaining after fixed expenses, rent, and loan EMIs.
     - **Total Allocated:** Sum of current active SIP commitments.
     - **Bank Cash Flow:** Remaining surplus flowing directly to Bank Cash (`character.liquidCash`).
   - Single slim progress bar (Emerald if $\le 100\%$, Rose if over-allocated).
   - Slidable Chip Strip: Horizontal track of goal pills allowing 1-tap jump to any goal.

2. **Slidable Goal Card**:
   - Smooth horizontal slide animation (Framer Motion `x: 0, opacity: 1` transition).
   - Mode Toggle: `[ ₹ Fixed Amount ]` vs `[ % Surplus Share ]`.
   - Minimal header: Icon, Goal Name, Target Amount, and Target Age/Months.
   - Clean Rupee Input with `+ / −` stepper buttons and fast preset chips (`+₹1k`, `+₹2k`, `+₹5k`, `Fill Remaining`).
   - Compact 4-pill instrument selector:
     - **Liquid Savings (4% p.a.)** — Instant & Safe liquidity.
     - **Fixed Deposit (7% p.a.)** — Guaranteed return (1.5% penalty if broken early).
     - **Gold / SGB (8.5% p.a.)** — Inflation hedge with cyclical fluctuation.
     - **Equity Mutual Funds (12% p.a.)** — High growth long-term; cyclical market volatility.
   - 1-line Status Pill: 🟢 On Track / 🟡 Borderline / 🔴 Needs +₹X/mo.
   - **Collapsible Projection Chart**: Closed by default to keep the card compact; opens a clean Recharts AreaChart on tap without disrupting the layout.

3. **Bottom Navigation Bar**:
   - `◄ Prev Goal` and `Next Goal ►` navigation buttons.
   - **Primary Action CTA (`[ UNPAUSE & START SIMULATION 🚀 ]` or `[ SAVE & RESUME ▶ ]`)**:
     - High-contrast NeoPOP button (Emerald background, solid 2px black border, 3px hard drop-shadow).
     - Sets `simulation.isPaused = false` and navigates to `main_game`.
     - Always visible without scrolling.
