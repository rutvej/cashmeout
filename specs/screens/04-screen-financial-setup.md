# Screen 4: Financial Setup & Allocation Module (`specs/screens/04-screen-financial-setup.md`)

## 1. Purpose & Reusability Objective
This screen is the **Financial Command Center** where the player allocates their monthly surplus cash across their goals, assigns investment instruments, configures insurance protection, and sets up automated **Waterfall Redirections**.

### Reusable Across the Entire Simulation:
1. **Onboarding Mode (Screen 4):** Initial setup before launching simulation.
2. **Promotion / Salary Raise Mode:** Allocating new surplus delta (+Δ ₹/mo).
3. **Goal Completion / Rebalance Mode:** Modifying SIP redirects or instruments when a milestone is completed.
4. **Pause Menu Tab:** Accessible anytime during gameplay to fine-tune strategy.

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-------------------------------------------------------------+
|                     FINANCIAL PLANNING                      |
|       Total Surplus: ₹16,015 / mo  •  Remaining: ₹0 / mo    |
|       Views: [Focus Carousel]  [All Goals Grid]             |
+-------------------------------------------------------------+
|                                                             |
|  [ TOP SURPLUS & PROTECTION BAR ]                           |
|  +-------------------------------------------------------+  |
|  | Surplus: ₹16,015  | Allocated: ₹16,000 | Unallocated: ₹15|
|  | [████████████████████████████████████████████░] 99.9%  |  |
|  | 🛡️ Health Insurance: [✓ Active (₹800/mo)] Covers ₹10L |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [ FOCUSED GOAL STEPPER CAROUSEL (Goal 2 of 7) ]            |
|  [ •  ▬  •  •  •  •  • ]                                    |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🚗 Buy First Car (Target: ₹6,50,000 at Age 27)         |  |
|  |                                                       |  |
|  | [ LIVE RECHARTS PROJECTION AREA CHART ]               |  |
|  |   ₹6.5L --------------------- Target Line (Dashed)    |  |
|  |   ₹4.8L        .-~*~-.                                |  |
|  |   ₹2.0L    _.-~        (Compound Growth Curve)        |  |
|  |   ₹0L   .-~                                           |  |
|  |         M0     M12    M24    M36    M48               |  |
|  |   Status: 🟢 On Track (Projected ₹6,80,000)            |  |
|  |                                                       |  |
|  | Select Instrument:                                    |  |
|  | [Savings 4%] [Fixed Deposit 7%] [Gold 8.5%] [Equity 12%]|
|  |                                                       |  |
|  | Monthly SIP Allocation:                               |  |
|  | [ -500 ] [ ₹4,500 / mo ] [ +500 ]                     |  |
|  | Quick Add: [+₹1k] [+₹2k] [+₹5k] [Fill Remaining (+₹3k)]|  |
|  |                                                       |  |
|  | ↪️ When Full, Redirect SIP to: [🏠 Home Down Pmt ▼]   |  |
|  |                                                       |  |
|  | [← Prev Goal]                             [Next Goal →]|
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | [← Back to Goals]        [ START LIFE SIMULATION 🚀 ] |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

---

## 3. Data Contract

### A. Inputs (Read from Store)
- `character: CharacterState` (reads `character.monthlySurplus`)
- `goals: GoalItem[]` (reads list of active goals)
- `insurance: Record<string, InsurancePolicy>` (health and term insurance policies)
- `allocations: Record<string, GoalAllocation>` (active SIPs and redirect targets)

### B. Outputs (Mutations on State)
- `insurance`: Updated purchase status of policies.
- `goals`: Updated `baseMonthlySIP`, `instrumentId`, and `redirectGoalId` for each goal.
- `currentScreen: 'main_game'` (when in onboarding mode).

---

## 4. UI Controls & User Interactions

1. **Top Surplus & Protection Bar:**
   - Real-time surplus tracker.
   - **Health Insurance Protection Toggle:**
     - Allows toggling Health Insurance (e.g., ₹800/month).
     - Clearly notes: *"Covers hospitalization up to ₹10 Lakh. Protects your Emergency Fund from sudden medical wipes."*
     - If activated, deducts ₹800 from available surplus before investments.

2. **Focused Goal Carousel Stepper:**
   - **Progress dots:** `[ • • ▬ • • ]` indicating active goal and completed funding states.
   - **Navigation buttons:** `← Prev Goal` and `Next Goal →`.

3. **Interactive Recharts AreaChart:**
   - Plots the compounding annuity curve:
     $$FV(t) = \text{PV} \times (1 + r)^t + \text{PMT} \times \left[ \frac{(1 + r)^t - 1}{r} \right]$$
   - Dashed horizontal line indicating the target corpus.
   - Dynamic curve stroke and gradient fill:
     - 🟢 Emerald: $FV \ge \text{Target}$
     - 🟡 Amber: $FV \ge 80\%$ of Target
     - 🔴 Rose: $FV < 80\%$ of Target

4. **One-Tap Quick Presets:**
   - Buttons: `+₹1,000`, `+₹2,000`, `+₹5,000`, and `Fill Remaining (+₹X)` to quickly allocate unallocated surplus.

5. **The Waterfall Redirect Selector (`↪️ When Complete, Redirect SIP to:`):**
   - Dropdown menu listing other active goals.
   - Automatically routes SIP to this chosen goal once target corpus is achieved.
   - On the Emergency Fund card, notes the **Auto-Recall Guarantee**: *"If emergencies deplete the fund, this SIP automatically returns here until restored."*

6. **View Mode Toggle:**
   - Switch between **"Focus Carousel"** (one goal at a time) and **"All Goals Grid"** (overview of all goals).

---

## 5. Exit Criteria & Navigation
- **Next Screen:** Screen 5 (`main_game`).
- **Trigger:** Player clicks `[ START LIFE SIMULATION 🚀 ]`.
