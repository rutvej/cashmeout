# Screen 4: Financial Setup & Allocation Module (`specs/screens/04-screen-financial-setup.md`)

## 1. Purpose & Reusability Objective
This screen is the **Financial Command Center** where the player allocates their monthly surplus cash across their goals and assigns an investment instrument to each.

### Reusable Modes:
1. **Onboarding Mode (Screen 4):** Full-screen wizard after Screen 3 to establish starting investments before the simulation starts.
2. **Raise / Promotion Mode (In-Game):** Triggered when an annual salary raise delivers a "New Surplus Delta" (e.g. +₹8,000/mo) requiring distribution.
3. **Goal Reallocation Mode (In-Game):** Triggered when a goal finishes (e.g. car bought or emergency buffer full) to redirect freed-up cash.
4. **Pause Menu Mode (In-Game):** Accessible anytime from the simulation tab bar to manually rebalance monthly SIPs.

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-------------------------------------------------------------+
|                     FINANCIAL PLANNING                      |
|       Total Surplus: ₹16,015 / mo  •  Remaining: ₹0 / mo    |
+-------------------------------------------------------------+
|                                                             |
|  [ TOP SURPLUS TRACKER ]                                    |
|  +-------------------------------------------------------+  |
|  | Surplus: ₹16,015  | Allocated: ₹16,000 | Unallocated: ₹15|
|  | [██████████████████████████████████████████░] 99.9%   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [ GOAL ALLOCATION CARDS (Per Goal) ]                       |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🛡️ Emergency Fund (Target: ₹3,15,000 in 24 months)     |  |
|  | Instrument: [Liquid Savings (4%)] [FD (7%)]           |  |
|  | Monthly SIP: [ - ₹500 ]  [ ₹5,000 ]  [ + ₹500 ]       |  |
|  | Projected at Target Date: ₹1,25,000                   |  |
|  | Feasibility: 🔴 Underfunded (Short by ₹1,90,000)       |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | ✈️ Annual Vacation (Target: ₹50,000 in 12 months)      |  |
|  | Instrument: [Liquid Savings (4%)] [FD (7%)]           |  |
|  | Monthly SIP: [ ₹4,000 / mo ]                          |  |
|  | Projected at Target Date: ₹49,000                     |  |
|  | Feasibility: 🟢 On Track                              |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🌴 Retirement Corpus (Target: ₹1.58 Cr at Age 60)      |  |
|  | Instrument: [Equity Mutual Funds (12% p.a.)]          |  |
|  | Monthly SIP: [ ₹7,000 / mo ]                          |  |
|  | Projected at Age 60: ₹2.10 Crore                      |  |
|  | Feasibility: 🟢 On Track                              |  |
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
- `allocations: Record<string, GoalAllocation>` (existing or default allocations)

### B. Outputs (Mutations on State)
- `allocations: Record<string, GoalAllocation>`:
  - Maps `goalId` $\rightarrow$ `{ monthlySIP: number, instrumentId: InstrumentId }`
- `currentScreen: 'main_game'` (when in onboarding mode)

---

## 4. UI Controls & User Interactions

1. **Top Surplus Meter:**
   - **Total Surplus:** Static value from character cashflow.
   - **Total Allocated:** $\sum \text{monthlySIP}$.
   - **Remaining Surplus:** $\text{Total Surplus} - \text{Total Allocated}$.
   - **Color coding:**
     - Emerald: Allocated $\le$ Surplus (Valid).
     - Rose: Allocated $>$ Surplus (Invalid, blocks "Start Game" CTA).

2. **Goal Allocation Card Controls:**
   - **Instrument Selector:** Pills for `Savings (4%)`, `FD (7%)`, `Gold (8.5%)`, and `Equity (12%)`.
     - *Smart Guardrail:* Safety/Emergency fund warns if high-risk Equity is selected.
   - **Monthly SIP Input:**
     - Steppers (`- ₹500`, `+ ₹500`, `+ ₹2,000`) and numeric input.
     - Slider bound between ₹0 and `character.monthlySurplus`.
   - **Live Feasibility Indicator:**
     - Recalculates dynamically as SIP or instrument changes.
     - 🟢 **On Track:** Projected $FV \ge \text{Target}$.
     - 🟡 **Borderline:** Projected $FV \ge 80\%$ of Target.
     - 🔴 **Underfunded:** Projected $FV < 80\%$ of Target.

3. **Validation & Action CTA:**
   - Button: **"Start Life Simulation 🚀"** (or **"Save Changes"** in-game).
   - Disabled if:
     - Total Allocated $>$ Monthly Surplus (Over-budget).
     - Emergency Fund has ₹0 allocation while underfunded.

---

## 5. Edge Cases & Boundary Conditions
- **Over-allocation Prevention:** If user tries to type a number exceeding remaining surplus, an error banner appears: *"Allocations cannot exceed monthly surplus."*
- **Unallocated Surplus:** Players are allowed to leave surplus unallocated (unallocated money accumulates automatically in liquid bank cash).
- **Zero-Duration Goals:** Handled gracefully with current balance check.

---

## 6. Exit Criteria & Navigation
- **Onboarding Mode Next Screen:** Screen 5 (`main_game`).
- **Trigger:** Player clicks `[ START LIFE SIMULATION 🚀 ]`.
- **Global Store Mutation:**
  - `gameState.allocations = allocations`
  - `gameState.currentScreen = 'main_game'`
