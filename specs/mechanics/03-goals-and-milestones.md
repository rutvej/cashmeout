# Mechanism Spec: Goals & Milestones System (`specs/mechanics/03-goals-and-milestones.md`)

## 1. Overview & Objective
This mechanism manages life goals. Goals in this game are categorized into two fundamentally distinct types:
1. **One-Time Milestone Goals:** Have a fixed target date/age (e.g., Marriage at 29, Home at 34, Retirement at 60). Once achieved, they trigger a life transition.
2. **Recurring / Dynamic Goals:** 
   - **Yearly Trip / Vacation (Annual Cycle):** Every 12 months. Flexible package selection (Domestic vs International). Resets every year.
   - **Emergency Fund (Dynamic Continuous Buffer):** Stays funded at $6\times$ monthly outflow. Allocations stop when full, but automatically resume if drawn down by emergencies or if living expenses rise due to lifestyle inflation.

---

## 2. Global Type Schema (`GoalItem`)

```typescript
export type GoalKind = 'milestone' | 'recurring';
export type GoalCategory = 'safety' | 'lifestyle' | 'asset' | 'long_term';

export interface GoalItem {
  id: string;                     // e.g. "goal_emergency", "goal_vacation", "goal_home"
  name: string;                   // Display title
  kind: GoalKind;                 // 'milestone' (one-time) | 'recurring' (repeating cycle / buffer)
  category: GoalCategory;
  description: string;
  
  targetAmount: number;           // Target corpus in ₹
  currentAmount: number;          // Accumulated corpus in ₹
  
  // Timeline & Dates
  targetAge: number | null;       // Target age deadline for milestones (e.g. 27, 29, 34, 60), null for continuous
  targetMonthsRemaining: number;  // Months until maturity (or until next annual cycle)
  recurrenceIntervalMonths?: number; // e.g. 12 for annual vacation, 0 for continuous safety buffer
  
  // Customization & Options
  selectedTierOption?: string;    // e.g. "domestic" | "international" for vacation
  isMandatory: boolean;           // true for Emergency Fund & Retirement
  priority: number;               // 1 (highest) to 5 (lowest)
  status: 'in_progress' | 'completed' | 'missed';
  icon: string;                   // Visual icon / emoji
}
```

---

## 3. Detailed Goal Specifications & Mechanics

### Group A: Dynamic & Recurring Goals

#### 1. 🛡️ Emergency Fund (Safety • Continuous Dynamic Buffer • Mandatory)
- **Target Formula:** $6 \times \text{totalMonthlyOutflow}$.
- **Target Deadline:** Initial target age = $\text{startingAge} + 2$ (24 months to fully fund).
- **Behavior:**
  - When $\text{currentAmount} \ge \text{targetAmount}$, monthly contributions **stop** and money is redirected to other goals.
  - **Refill Trigger:** If an emergency event deducts money from this buffer, status changes to `refill_needed` and allocations resume until restored.
  - **Inflation Trigger:** Whenever salary raises or lifestyle upgrades increase $\text{totalMonthlyOutflow}$, the target expands automatically, resuming funding.

#### 2. ✈️ Annual Vacation / Trip (Lifestyle • Recurring 12-Month Cycle • Optional)
- **Recurrence:** Every 12 months.
- **Flexible Package Options:**
  - **Domestic Trip:** ₹40,000 to ₹75,000 / year (e.g. Goa, Himachal, Kerala).
  - **International Trip:** ₹1,50,000 to ₹2,50,000 / year (e.g. Southeast Asia, Europe).
- **Behavior:** At month 12 of each year, if target is met, vacation is executed, burnout/stress is reset, corpus is spent, and the goal resets for the next 12 months.

---

### Group B: One-Time Life Milestones (Fixed Target Dates)

#### 3. 🚗 Buy First Car (Lifestyle • One-Time)
- **Target Date / Age:** Age 27 ($\text{startingAge} + (27 - \text{startingAge})$).
- **Target Amount:** 
  - Tier 1: ₹8,00,000
  - Tier 2: ₹6,50,000
  - Tier 3: ₹5,00,000
- **Consequence:** Once purchased, adds +₹4,000/mo vehicle running cost.

#### 4. 💍 Marriage & Wedding (Life Milestone • One-Time)
- **Target Date / Age:** Age 29.
- **Target Amount:** $\approx 12 \times \text{monthlyTakeHome}$ (Tier 1: ₹10L–₹14L, Tier 2: ₹7L–₹10L, Tier 3: ₹5L–₹7L).
- **Consequence:** Unlocks dual-income boost (+40% household income) and shared living efficiencies.

#### 5. 🏠 Home Down Payment (Asset • One-Time)
- **Target Date / Age:** Age 34.
- **Target Amount:** 25% down payment on standard apartment:
  - Tier 1: ₹28,00,000
  - Tier 2: ₹18,00,000
  - Tier 3: ₹11,00,000
- **Consequence:** Eliminates rent; initiates 20-year home loan EMI and property asset appreciation.

#### 6. 🎓 Child Higher Education (Family • One-Time)
- **Target Date / Age:** Age 46.
- **Target Amount:** ₹25,00,000 to ₹35,00,000.
- **Consequence:** Pays university fees debt-free.

#### 7. 🌴 Retirement & Financial Independence (Endgame • One-Time • Mandatory)
- **Target Date / Age:** Age 60.
- **Target Amount:** $300 \times \text{totalFixedExpenses}$ (Rule of 25 / 4% Safe Withdrawal Rate).
- **Consequence:** Final scorecard evaluation. Tests if 4% annual withdrawal covers living expenses forever.

---

## 4. Pure Function Interface

```javascript
/**
 * Generates initial goals tailored to the character.
 * 
 * @param {CharacterState} character
 * @returns {GoalItem[]}
 */
export function generateInitialGoals(character) {
  // Pure deterministic generation
}
```
