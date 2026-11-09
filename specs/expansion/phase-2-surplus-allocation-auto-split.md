# Phase 2 Technical Specification: Dual-Engine Surplus Allocation & Auto-Split

## 1. Overview & Objective
Phase 2 upgrades the monthly surplus distribution engine to support both **Fixed Rupee (₹ Amount)** and **Proportional Percentage (%)** allocations. When a character's surplus changes (annual raise, loan completion, side business income, or spouse earnings), the system automatically redistributes the surplus based on configured weights, eliminating repetitive manual adjustments.

---

## 2. Core Architecture & Mathematical Model

### A. Dual Allocation Modes & Clean Slate Starting Strategy
Every active goal bucket $g$ maintains two linked allocation representations:
1. `allocationMode`: `'percentage' | 'fixed'` (default: `'fixed'`).
2. `allocationPercent`: $w_g \in [0, 100]\%$, representing the slice of total monthly surplus.
3. `baseMonthlySIP`: Explicit ₹ value allocated to goal $g$.

$$\sum_{g \in \text{Goals}} w_g \le 100\%$$

#### Clean Slate Starting Design
- At game spawn, all initial goals start with **₹0 / 0%** allocated (`baseMonthlySIP: 0`, `allocationPercent: 0`).
- This grants the player full agency to allocate surplus based on their risk profile and preferences rather than forcing prefilled assumptions.
- **Goal Strategy Guidance (`?` Hint Modal):** Each goal card provides an interactive `?` strategy hint that details:
  - **Recommended Monthly SIP:** Exact baseline needed to hit the target corpus strictly on time.
  - **Dynamic Growth Reassurance:** Explains that falling short early on is normal and expected:
    - 📈 **Annual Salary Hikes:** Real appraisals (5–7%+) expand surplus year after year.
    - ↪️ **Waterfall & Auto-Redistribution:** Shorter-term goals (Emergency Fund, Vacation) complete and automatically redirect or scale into downstream long-term goals.
    - ⏳ **Long-Term Compounding:** Exponential returns accelerate significantly over decades.

#### Synchronization Invariant
When the player modifies an allocation, both representations update bidirectionally:
- **Changing ₹ Amount:**
  $$w_g = \text{Math.round}\left(\frac{\text{baseMonthlySIP}_g}{\text{MonthlySurplus}} \times 100\right)$$
- **Changing % Weight:**
  $$\text{baseMonthlySIP}_g = \text{Math.round}\left(\frac{w_g}{100} \times \text{MonthlySurplus} / 500\right) \times 500$$

Unallocated surplus ($100\% - \sum w_g$) represents the **Liquid Cash Buffer** deposited directly into the player's bank account every month.

---

### B. Auto-Split on Inflow Changes (Salary Hikes, Appraisals)
When monthly surplus expands from $S_{\text{old}}$ to $S_{\text{new}}$ with delta $\Delta S = S_{\text{new}} - S_{\text{old}} > 0$:

1. **Option 1: Proportional Auto-Split with 7s Auto-Timer (Default)**
   - Scales each active goal's SIP proportionally according to current % weights:
     $$\text{SIP}_{g, \text{new}} = \text{Math.round}\left(\frac{w_g}{100} \times S_{\text{new}} / 500\right) \times 500$$
   - Displays a 7-second countdown timer badge on the modal. If the player does not interact or pause, it automatically confirms Auto-Split and resumes smoothly. The player can pause the timer anytime to inspect or pick another option.

2. **Option 2: Keep in Liquid Bank Cash & Resume**
   - Keeps all existing goal SIPs unchanged.
   - The entire delta $\Delta S$ flows into monthly liquid bank cash. Resumes instantly.

3. **Option 3: Custom Rebalance**
   - Pauses the simulation and opens the Allocation Modal for interactive custom adjustments.

---

### C. Downward Adjustments (Inflation, New EMIs, Deficits)
When surplus shrinks ($\Delta S < 0$):
- If $\sum \text{SIP}_g > S_{\text{new}}$:
  - If in **Percentage Mode**, all SIPs automatically contract proportionally to fit the new surplus.
  - Mandatory buffer goals (Emergency Fund) maintain priority; non-mandatory lifestyle goals contract first.

---

## 3. Data Schema Extensions

```typescript
export interface GoalAllocationConfig {
  id: string;
  allocationMode: 'percentage' | 'fixed';
  allocationPercent: number;        // e.g. 25 for 25%
  baseMonthlySIP: number;           // e.g. ₹5,000 (starts at 0)
  effectiveMonthlySIP: number;      // Active SIP post-waterfall cascading
  minPriority: number;              // 1 = Safety (Emergency), 2 = Debt, 3 = Assets, 4 = Lifestyle
}

export interface SurplusAllocationProfile {
  autoSplitOnRaise: boolean;        // true: auto-scales without pause
  raiseRoutingStrategy: 'proportional_split' | 'bank_cash' | 'ask_every_time';
  autoSplitTimerSeconds: number;    // e.g. 7 seconds countdown
  unallocatedPercent: number;       // Cash buffer slice (e.g. 10%)
}
```

---

## 4. UI & Interaction Design (Cred NeoPOP Light Theme)

### A. Dual Toggle Controller & Goal Strategy Hint (`?`) in Allocation Screens
- Each goal card in the Allocation Sheet includes a segmented pill toggle:
  ```
  [ ₹ Amount ] [ % Percentage ]
  ```
- Sliding the percentage slider immediately shows the calculated ₹ amount in real time and updates the circular surplus breakdown chart.
- **Interactive `[?] Strategy Hint` button**: Opens an educational drawer showing recommended SIP based on compounding math, and reassuring context on why starting small is fine (future raises, waterfall cascade, and compounding).

### B. NeoPOP Total Allocation Progress Bar
- A dynamic top progress bar displays total allocation:
  - 🟢 **100% Allocated (Balanced)**: Emerald border with clear distribution.
  - 🟡 **< 100% (Cash Buffer)**: Displays *"15% (₹6,000/mo) flowing to Bank Cash"*.
  - 🔴 **> 100% (Over-Allocated)**: Red alert banner disabling confirmation until rebalanced.

### C. Appraisal Hike Modal Upgrade (`RaiseModal.jsx`)
- Adds three streamlined action buttons with a 7-second countdown auto-select:
  1. `⚡ Auto-Split (+₹8,500 across current %)` ➔ Confirms proportional scaling (auto-confirms in 7s unless paused).
  2. `💵 Keep in Liquid Bank Cash & Resume` ➔ Keeps current SIPs untouched, funnels extra cash into liquid savings buffer.
  3. `⚙️ Custom Rebalance` ➔ Pauses simulation and opens allocation drawer.
