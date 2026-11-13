# Screen 5: Main Game Simulation Dashboard (`specs/screens/05-screen-main-game.md`)

## 1. Purpose & User Objective
The Main Game Dashboard is the central live interface where the player watches their financial life unfold across their career (Age 23 to 60). 

The player monitors their goal progress, balances cashflow, manages loans, weathers life events, and makes strategic adjustments whenever the simulation pauses or auto-stops for major life milestones.

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-------------------------------------------------------------+
| AGE 24 (Yr 2, Mo 4)  •  Retirement at Age 60                |
| Net Worth: ₹4,85,000  •  Bank: ₹82,000                      |
| Controls: [⏸ Pause] [▶ Play]  Speed: [1x] [2x] [5x]         |
+-------------------------------------------------------------+
|                                                             |
|  [ MONTHLY CASHFLOW TICKER ]                                |
|  Take-Home: ₹72,000 | Outflows: ₹48,000 | Surplus: ₹24,000  |
|  SIPs Running: ₹22,000/mo  | Leftover to Bank: ₹2,000/mo    |
|                                                             |
|  [ LIVE GOAL PROGRESS BUCKETS ]                             |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🛡️ Emergency Fund                       [SHIELD 100%] |  |
|  | Corpus: ₹3,15,000 / ₹3,15,000 (Full!)                  |  |
|  | [████████████████████████████████████████████] 100%   |  |
|  | ↪️ SIP ₹5,000 cascading into: 🚗 Buy First Car        |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🚗 Buy First Car                        Target: Age 27 |  |
|  | Corpus: ₹4,80,000 / ₹6,50,000                          |  |
|  | [████████████████████████████░░░░░░░░░░░░░░░░] 74%    |  |
|  | SIP: ₹9,000/mo (Base: ₹4,000 + Waterfall: ₹5,000)     |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | ✈️ Annual Vacation (Month 4 / 12)        [ACTIVE]     |  |
|  | Corpus: ₹24,000 / ₹50,000                              |  |
|  | [████████████████████░░░░░░░░░░░░░░░░░░░░░░░░] 48%    |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🌴 Retirement Corpus (FI/RE)            Target: Age 60 |  |
|  | Corpus: ₹14,20,000 / ₹1.58 Crore (Equity 12%)         |  |
|  | [████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 9%     |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [ BOTTOM INSPECTION TABS (When Paused) ]                   |
|  [ Goals & SIPs ] [ Income & Career ] [ Loans ] [ Insurance]|
|                                                             |
+-------------------------------------------------------------+
```

---

## 3. Data Contract

### A. Inputs (Read from Store)
- `character: CharacterState`
- `goals: GoalItem[]`
- `insurance: Record<string, InsurancePolicy>`
- `simulation: SimulationState`

### B. Outputs (Mutations on State)
- Monthly progression of `goals[].currentAmount` and compounding growth.
- Redirection cascades as goals reach 100%.
- Loan amortizations and payoff updates.
- Transitions to Screen 6 (`scorecard`) upon reaching Age 60.

---

## 4. UI Controls & User Interactions

1. **Simulation Top Bar:**
   - **Play/Pause Button:** Prominent toggle (green when playing, amber when paused).
   - **Speed Selector:** `1x` (1.5s/mo), `2x` (0.8s/mo), `5x` (0.35s/mo).
   - **Age Progress Bar:** Visual timeline showing months completed towards age 60.
   - **Live Net Worth Counter:** Computes $(\text{Total Goal Assets} + \text{Liquid Bank Cash} + \text{Home Asset}) - \text{Remaining Loans}$.

2. **Goal Progress Cards:**
   - Visual progress bars with smooth animations.
   - Distinct badges:
     - 🛡️ **Shield 100% Full:** Indicates Emergency Fund is full and safely redirecting cash.
     - ⚡ **Shield Refill:** Highlights when Emergency Fund is recovering from an emergency draw.
     - 🌊 **Waterfall Active:** Displays exact bonus SIP received from upstream finished goals.
     - 🏆 **Completed:** Marks milestones achieved.

3. **Bottom Inspection & Action Tabs:**
   - **Goals & SIPs:** Opens the Reusable Financial Allocation module to adjust SIPs or redirect targets anytime while paused.
   - **Income & Career:** Shows current salary breakdown, past raises, and option to take a professional course or search jobs.
   - **Loans:** Shows active loans, remaining EMI tenure, and a button to **"Prepay Loan"** from liquid bank cash.
   - **Insurance:** Shows active health/term policies.

---

## 5. Event & Milestone Overlays (Auto-Pause)
Whenever a milestone or event occurs, the game automatically pauses and presents a dedicated modal:
1. **Annual Vacation Celebration Modal:** Appears at month 12. Displays trip photos/graphics, resets corpus, and offers package selection for next year.
2. **Salary Raise Modal:** Appears at month 12 anniversary. Shows $+X\%$ hike and lets player allocate the new surplus.
3. **Milestone Achievement Modal:** Appears at Target Age for Car, Marriage, or Home Down Payment.
4. **Random Life Event Modal:** Appears if a random medical, car repair, or bonus event occurs.

---

## 6. Exit Criteria & Navigation
- **Next Screen:** Screen 6 (`scorecard`).
- **Trigger:** Character reaches Age 60 (`currentAge >= retirementAge`).
- **Global Store Mutation:**
  - `currentScreen: 'scorecard'`
