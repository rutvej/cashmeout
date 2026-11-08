# Phase 2 Technical Specification: Dual-Engine Surplus Allocation & Auto-Split

## 1. Overview & Objective
Phase 2 upgrades the monthly surplus distribution engine to support both **Fixed Rupee (₹ Amount)** and **Proportional Percentage (%)** allocations. When a character's surplus changes (annual raise, loan completion, side business income, or spouse earnings), the system automatically redistributes the surplus based on configured weights, eliminating repetitive manual adjustments.

---

## 2. Core Architecture & Mathematical Model

### A. Dual Allocation Modes
Every active goal bucket $g$ maintains two linked allocation representations:
1. `allocationMode`: `'percentage' | 'fixed'` (default: `'percentage'`).
2. `allocationPercent`: $w_g \in [0, 100]\%$, representing the slice of total monthly surplus.
3. `baseMonthlySIP`: Explicit ₹ value allocated to goal $g$.

$$\sum_{g \in \text{Goals}} w_g \le 100\%$$

#### Synchronization Invariant
When the player modifies an allocation, both representations update bidirectionally:
- **Changing ₹ Amount:**
  $$w_g = \text{Math.round}\left(\frac{\text{baseMonthlySIP}_g}{\text{MonthlySurplus}} \times 100\right)$$
- **Changing % Weight:**
  $$\text{baseMonthlySIP}_g = \text{Math.round}\left(\frac{w_g}{100} \times \text{MonthlySurplus}\right)$$

Unallocated surplus ($100\% - \sum w_g$) represents the **Liquid Cash Buffer** deposited directly into the player's bank account every month.

---

### B. Auto-Split on Inflow Changes (Salary Hikes, Appraisals, Promoted Jobs)
When monthly surplus expands from $S_{\text{old}}$ to $S_{\text{new}}$ with delta $\Delta S = S_{\text{new}} - S_{\text{old}} > 0$:

1. **Option 1: Proportional Auto-Split (Default)**
   - Each goal's SIP scales up automatically according to its percentage weight $w_g$:
     $$\text{SIP}_{g, \text{new}} = \text{Math.round}\left(\frac{w_g}{100} \times S_{\text{new}}\right)$$
   - The player does not have to stop simulation ticks or manually drag sliders.

2. **Option 2: 100% to Wealth / Retirement Sink**
   - Base SIPs for milestone goals remain unchanged.
   - The entire delta $\Delta S$ is funneled directly into `goal_retirement` (equity compounding).

3. **Option 3: Manual Cred NeoPOP Rebalance**
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
  baseMonthlySIP: number;           // e.g. ₹5,000
  effectiveMonthlySIP: number;      // Active SIP post-waterfall cascading
  minPriority: number;              // 1 = Safety (Emergency), 2 = Debt, 3 = Assets, 4 = Lifestyle
}

export interface SurplusAllocationProfile {
  autoSplitOnRaise: boolean;        // true: auto-scales without pause
  raiseRoutingStrategy: 'proportional_split' | 'all_to_retirement' | 'ask_every_time';
  unallocatedPercent: number;       // Cash buffer slice (e.g. 10%)
}
```

---

## 4. UI & Interaction Design (Cred NeoPOP Light Theme)

### A. Dual Toggle Controller in Allocation Screens
- Each goal card in the Allocation Sheet includes a segmented pill toggle:
  ```
  [ ₹ Amount ] [ % Percentage ]
  ```
- Sliding the percentage slider immediately shows the calculated ₹ amount in real time and updates the circular surplus breakdown chart.

### B. NeoPOP Total Allocation Progress Bar
- A dynamic top progress bar displays total allocation:
  - 🟢 **100% Allocated (Balanced)**: Emerald border with clear distribution.
  - 🟡 **< 100% (Cash Buffer)**: Displays *"15% (₹6,000/mo) flowing to Bank Cash"*.
  - 🔴 **> 100% (Over-Allocated)**: Red alert banner disabling confirmation until rebalanced.

### C. Appraisal Hike Modal Upgrade (`RaiseModal.jsx`)
- Adds three one-touch action buttons:
  1. `⚡ Auto-Split (+₹8,500 across current %)` ➔ Resumes instantly.
  2. `🌴 Maximize Retirement (100% delta to Equity)` ➔ Resumes instantly.
  3. `⚙️ Custom Rebalance` ➔ Opens allocation drawer.
