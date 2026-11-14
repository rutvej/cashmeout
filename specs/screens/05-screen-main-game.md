# Screen 5: Main Game Simulation Dashboard (`specs/screens/05-screen-main-game.md`)

## 1. Purpose & User Objective
The Main Game Dashboard is the central live interface where the player watches their financial life unfold across their career (Age 23 to 60). 

The player monitors their goal progress, balances cashflow, manages loans, weathers life events, and makes strategic adjustments whenever the simulation pauses or auto-stops for major life milestones.

---

## 2. Layout & Visual Hierarchy (Wireframe)

### A. Main Dashboard View (Collapsed Goal Cards by Default)
```
+-------------------------------------------------------------+
| AGE 24 (Yr 2, Mo 4)  •  Retirement at Age 60                |
| Net Worth: ₹4,85,000  •  Bank Cash: ₹82,000                 |
| Controls: [⏸ Pause] [▶ Play]  Speed: [1x] [2x] [5x]         |
+-------------------------------------------------------------+
|                                                             |
|  [ MONTHLY CASHFLOW TICKER ]                                |
|  Take-Home: ₹72,000 | Outflows: ₹48,000 | Surplus: ₹24,000  |
|  Active SIPs: ₹18,000/mo  | Flowing to Bank: ₹6,000/mo      |
|                                                             |
|  [ LIFE GOAL BUCKETS — COMPACT SUMMARY CARDS ]              |
|  (Tap any card to expand Analytics & Lump-Sum Seeding)      |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🛡️ Emergency Shield     [Safety]    [100% FULL] Age 24 |  |
|  | ₹3,15,000 / ₹3,15,000  [████████████████████]  (FD 7%)  |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🚗 Buy First Car        [Asset]          [74%] Age 27 |  |
|  | ₹4,80,000 / ₹6,50,000  [██████████████░░░░░]  (SIP ₹5k) |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | ✈️ Annual Vacation     [Lifestyle]      [48%] 8 mos left|  |
|  | ₹24,000 / ₹50,000      [█████████░░░░░░░░░░]  (SIP ₹4k) |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  +-------------------------------------------------------+  |
|  | 🌴 Retirement Corpus    [Wealth]          [9%] Age 60 |  |
|  | ₹14,20,000 / ₹1.58 Cr  [██░░░░░░░░░░░░░░░░░]  (MF 12%)  |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [ BOTTOM INSPECTION TABS (When Paused) ]                   |
|  [ Goals & SIPs ] [ Income & Career ] [ Loans ] [ Insurance]|
|                                                             |
+-------------------------------------------------------------+
```

---

### B. Goal Interaction: Transition to Integrated Surplus Distribution Screen
When the player taps any collapsed goal card on the Main Game Screen, the simulation auto-pauses (`pause()`) and opens the existing **Surplus Distribution Screen (`FinancialSetupScreen.jsx`)** in modal mode, focused directly on that goal (`initialGoalId`).

Inside `FinancialSetupScreen`, the player has complete, unified control over the goal:
1. **Corpus Accumulation Progress:** Live progress bar showing accumulated corpus vs target.
2. **Mid-Game Lump-Sum Bank Cash Seeding:** Transfer accumulated Bank Cash (`character.liquidCash`) directly into the goal.
3. **Monthly SIP Rebalancing:** Set ₹ Amount or % Surplus Share with real-time feedback and quick presets.
4. **4-Pill Instrument Selector & Risk Profile Card:** Instant vehicle switching with dedicated risk behavior guidelines.
5. **Interactive Multi-Curve Compounding Growth Chart:** Compares Invested Principal ($P(t)$) vs Compounded Fund Value ($V(t)$) over Monthly/Yearly horizons with net wealth created metrics.

```
+-------------------------------------------------------------+
| 🚗 FIRST CAR MILESTONE             [← Back to Dashboard]    |
| Category: Asset  •  Target: ₹6,50,000 by Age 27             |
| Current Corpus: ₹4,80,000 (74% Achieved • 28 Months Left)   |
| [====================================                      ]|
+-------------------------------------------------------------+
|                                                             |
|  [ 1. SEED CAPITAL FROM BANK CASH ]                         |
|  Available Bank Cash: ₹82,000                               |
|  Transfer Lump-Sum into Goal:                               |
|  [ − ]  ₹ 25,000  [ + ]                                      |
|  Quick Chips: [+₹10,000] [+₹25,000] [+₹50,000] [Max: ₹82k]  |
|  [ ⚡ TRANSFER LUMP-SUM FROM BANK CASH ]                     |
|                                                             |
|  Monthly SIP Allocation:                                    |
|  [ − ]  ₹ 5,000 / month  [ + ]   [Mode: ₹ Fixed | % Share]  |
|                                                             |
|  ---------------------------------------------------------  |
|                                                             |
|  [ 2. MULTI-CURVE GROWTH ENGINE: PRINCIPAL VS. FUND VALUE ] |
|  Time Horizon: [ ● Monthly ] [ ○ Yearly ]                   |
|                                                             |
|  ₹ Value                                                    |
|  5.0L ┤                                       ╭── V(t) Actual|
|  4.0L ┤                             ╭─────────╯              |
|  3.0L ┤                    ╭────────╯ ── P(t) Principal     |
|  2.0L ┤           ╭────────╯                                |
|  1.0L ┤  ╭────────╯                                         |
|    0L ┴──┴─────────┴─────────┴─────────┴─────────┴─────► mo  |
|          Mo 6     Mo 12     Mo 18     Mo 24     Mo 28       |
|                                                             |
|  • Curve 1 (Invested Principal): ₹4,20,000 (Seeds + SIPs)   |
|  • Curve 2 (Actual Fund Value):  ₹4,80,000 (Compounded)     |
|  • Net Compounding Wealth Gain:  +₹60,000 (+14.3%)          |
|                                                             |
|  ---------------------------------------------------------  |
|                                                             |
|  [ 3. INSTRUMENT RISK PROFILE CARD ]                        |
|  Selected: ★ Equity Mutual Funds (12% p.a. Long-Term Mean)  |
|  +-------------------------------------------------------+  |
|  | ⚠️ HIGH MONTHLY VOLATILITY (-3.5% to +4.5% / mo)       |  |
|  | Macro Economic Cycles: Features multi-year boom/bust  |  |
|  | runs and guaranteed economic crash between age 34-45.  |  |
|  | Suitability: Ideal for 10+ yr horizons; risky for 2-3 |  |
|  | year short-term milestones due to drawdown vulnerability.|  |
|  +-------------------------------------------------------+  |
|  Change Instrument: [ Savings 4% ] [ FD 7% ] [ Gold 8.5% ]  |
|                                                             |
|  [◄ PREV GOAL]    [NEXT GOAL ►]    [ RESUME SIMULATION ▶ ]  |
+-------------------------------------------------------------+
```

---

## 3. Data Contract

### A. Inputs (Read from Store)
- `character: CharacterState` (reads `character.liquidCash`, `character.monthlySurplus`)
- `goals: GoalItem[]` (reads `goal.currentAmount`, `goal.history`, `goal.instrumentId`)
- `insurance: Record<string, InsurancePolicy>`
- `simulation: SimulationState`

### B. Outputs (Mutations on State)

#### 1. Mid-Game Lump-Sum Seeding
```typescript
// Transfers ₹X from liquidCash to goal.currentAmount
const transferAmount = Math.min(requestedAmount, character.liquidCash);
character.liquidCash -= transferAmount;
goal.currentAmount += transferAmount;
goal.initialLumpSumSeed = (goal.initialLumpSumSeed || 0) + transferAmount;
goal.totalPrincipalDeposited = (goal.totalPrincipalDeposited || 0) + transferAmount;
```

#### 2. Per-Goal Monthly Ledger Snapshot
Each tick appends an analytics snapshot to `goal.history`:
```typescript
goal.history.push({
  month: simulation.currentMonthIndex,
  age: simulation.currentAge,
  investedPrincipal: goal.totalPrincipalDeposited,
  actualBalance: goal.currentAmount,
  monthlyReturnRate: effectiveMonthlyRate,
});
```

---

## 4. UI Controls & User Interactions

### 1. Simulation Top Bar
- **Play/Pause Button:** Prominent toggle (green when playing, amber when paused).
- **Speed Selector:** `1x` (1500ms/mo), `2x` (800ms/mo), `5x` (350ms/mo).
- **Age Progress Bar:** Visual timeline showing months completed towards age 60.
- **Live Net Worth Counter:** Computes $(\text{Total Goal Assets} + \text{Liquid Bank Cash} + \text{Home Asset}) - \text{Remaining Loans}$.

### 2. Collapsed Goal Cards (Default View)
- Goals are rendered as sleek, compact summary cards:
  - **Left Section:** Goal Icon, Name, Category Badge (`[Safety]`, `[Asset]`, `[Lifestyle]`, `[Wealth]`).
  - **Middle Section:** Current Rupee / Target Rupee in monospace bold, accompanied by a slim animated progress bar.
  - **Right Section:** Target Age / Remaining Months badge, and current vehicle/SIP tag.
- Clicking any collapsed card pauses the simulation (if playing) and opens the existing **Surplus Distribution Screen (`FinancialSetupScreen.jsx`)** focused directly on that goal (`initialGoalId`).

### 3. Integrated Goal Management Inside Surplus Distribution Screen
1. **Lump-Sum Bank Seeding Section:**
   - Input stepper + quick presets (`+₹5,000`, `+₹10,000`, `+₹25,000`, `+₹50,000`, `Max Available`).
   - Validates that transfer cannot exceed `character.liquidCash`.
   - Primary Action Button: `[ Transfer ]`.
2. **Monthly SIP Adjuster:**
   - Real-time stepper, dual ₹ / % mode toggle, and quick presets to allocate monthly surplus.
3. **Multi-Curve Compounding Growth Chart (Recharts):**
   - **Curve 1 (Invested Principal):** Slate dashed curve showing cumulative cost basis ($P(t)$).
   - **Curve 2 (Compounded Value):** Emerald/amber area showing real-time compounded valuation ($V(t)$).
   - **Reference Line:** Target goal corpus threshold.
   - **Time Horizon Toggle:** Segmented pill toggle:
     - `[ Monthly ]`: Raw month-by-month trajectory with full market volatility.
     - `[ Yearly ]`: Aggregated 12-month interval trendline.
4. **Integrated Instrument Risk Profile Card:**
   - Displays real-world risk/return trade-offs right below the 4 instrument pills:
     - **Liquid Savings:** Steady linear climb, zero volatility, safe liquidity.
     - **Fixed Deposit (FD):** Steady, guaranteed compounded growth; 1.5% premature penalty.
     - **Gold:** Capital preservation with moderate cyclical dips ($-1.0\%$ to $+2.0\%$).
     - **Mutual Funds (Equity):** High monthly volatility ($-3.5\%$ to $+4.5\%$) with boom/bust cycles & guaranteed macro crash.

---

## 5. Event & Milestone Overlays (Auto-Pause)
Whenever a milestone or event occurs, the game automatically pauses and presents a dedicated modal:
1. **Macro Economic Market Crash News Alert:** When the guaranteed macro crash begins (between age 34 and 45), the simulation auto-pauses with an informational news bulletin. Non-directive with single `[ Understood / Continue ]` CTA.
2. **Annual Vacation Celebration Modal:** Appears at month 12. Displays trip photos/graphics, resets corpus, and offers package selection for next year.
3. **Salary Raise Modal:** Appears at month 12 anniversary. Shows $+X\%$ hike and lets player allocate the new surplus.
4. **Milestone Achievement Modal:** Appears at Target Age for Car, Marriage, or Home Down Payment.
5. **Random Life Event Modal:** Appears if a random medical, car repair, or bonus event occurs.

---

## 6. Exit Criteria & Navigation
- **Next Screen:** Screen 6 (`scorecard`).
- **Trigger:** Character reaches Age 60 (`currentAge >= retirementAge`).
- **Global Store Mutation:**
  - `currentScreen: 'scorecard'`
