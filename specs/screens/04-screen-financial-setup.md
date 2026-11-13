# Screen 4: Financial Setup & Surplus Allocation (`specs/screens/04-screen-financial-setup.md`)

## 1. Overview & Minimal UX Principles
This screen is the **Financial Command Center** where the player allocates monthly surplus cash across active goals, selects investment vehicles, and configures insurance.

### Core Redesign Principles (Clean & Minimal):
1. **No Long Paragraphs or Intrusive Warnings**: All lengthy educational copy, policy explanations, and loud alarmist warning banners are removed.
2. **Slidable Goal Cards**: Goals are presented as sleek, slidable cards (horizontal sliding track / swipeable carousel) with instant smooth transitions.
3. **Auto-Removal of Achieved One-Time Goals**: Once a one-time milestone goal is completed (`status === 'completed'` or `isCompleted`), it is **automatically removed** from the surplus distribution screen so it never clutters the interface.
4. **Zero-Scroll Viewport**: Essential controls (allocation input, presets, instrument pills, status pill, and next/action CTA) fit comfortably on standard laptop and mobile viewports without forcing the user to scroll vertically to proceed.

---

## 2. Layout & Wireframe (Minimal Single-Screen Design)

```
+-------------------------------------------------------------------------+
|  SURPLUS: ₹35,000/mo      ALLOCATED: ₹28,000      REMAINING: ₹7,000     |
|  [████████████████████████████████████████░░░░░░░░] 80% Allocated       |
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
|                                                                         |
|  Monthly Allocation:                                                    |
|  [ − ]   ₹ 5,000 / month   [ + ]                                        |
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
|  [◄ PREV GOAL]            [NEXT GOAL ►]     [ START SIMULATION 🚀 ]     |
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

### State Mutations
- `setGoalAllocation(goalId, { baseMonthlySIP, instrumentId, redirectGoalId })`
- `toggleInsurance(policyKey)`
- `updateGoal(goalId, partialGoal)`
- `navigateTo('main_game')`

---

## 4. Component Architecture & UI Elements

1. **Top Persistent Surplus Header (Compact)**:
   - Displays 3 numbers in clean monospace: **Monthly Surplus**, **Total Allocated**, and **Remaining Surplus**.
   - Single slim progress bar (Emerald if $\le 100\%$, Rose if over-allocated).
   - Slidable Chip Strip: Horizontal track of goal pills allowing 1-tap jump to any goal.

2. **Slidable Goal Card**:
   - Smooth horizontal slide animation (Framer Motion `x: 0, opacity: 1` transition).
   - Minimal header: Icon, Goal Name, Target Amount, and Target Age/Months.
   - Clean Rupee Input with `+ / −` stepper buttons and fast preset chips (`+₹1k`, `+₹2k`, `+₹5k`, `Fill Remaining`).
   - Compact 4-pill instrument selector:
     - **Liquid Savings (4% p.a.)** — Instant & Safe.
     - **Fixed Deposit (7% p.a.)** — Guaranteed return (1.5% penalty if broken early).
     - **Gold / SGB (8.5% p.a.)** — Inflation hedge.
     - **Equity Mutual Funds (12% p.a.)** — High growth long-term.
   - 1-line Status Pill: 🟢 On Track / 🟡 Borderline / 🔴 Needs +₹X/mo.
   - **Collapsible Projection Chart**: Closed by default to keep the card compact; opens a clean Recharts AreaChart on tap without disrupting the layout.

3. **Bottom Navigation Bar**:
   - `◄ Prev Goal` and `Next Goal ►` buttons.
   - Primary high-contrast CTA button (`Start Life Simulation` or `Save & Resume`).
   - Always visible without scrolling.
