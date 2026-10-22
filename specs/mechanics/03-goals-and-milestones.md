# Mechanism Spec: Goals & Milestones System (`specs/mechanics/03-goals-and-milestones.md`)

## 1. Overview & Objective
This mechanism manages life goals. Every character begins life with an auto-generated set of realistic financial milestones tailored to their city tier, starting income, and age. Goals have target amounts, target ages (deadlines), and priority levels.

In later screens (Screen 4 & 5), monthly surplus is allocated to investment instruments dedicated to funding these goals, and milestone events trigger upon reaching their target deadlines.

---

## 2. Global Type Schema (`GoalItem`)

```typescript
export type GoalCategory = 'safety' | 'lifestyle' | 'asset' | 'long_term';

export interface GoalItem {
  id: string;                     // e.g. "goal_emergency", "goal_home"
  name: string;                   // Display title e.g. "Emergency Fund (6 Months)"
  category: GoalCategory;
  description: string;
  targetAmount: number;           // Target corpus in ₹
  currentAmount: number;          // Accumulated corpus in ₹ (starts at 0)
  targetAge: number;              // Target age deadline (e.g. 28, 33, 60)
  targetMonth: number;            // (targetAge - startingAge) * 12
  isMandatory: boolean;           // true for Emergency Fund & Retirement
  priority: number;               // 1 (highest) to 5 (lowest)
  status: 'in_progress' | 'completed' | 'missed';
  icon: string;                   // Visual icon / emoji e.g. "🛡️", "🏠"
}
```

---

## 3. Mathematical Models & Goal Calibration

Goals are auto-scaled dynamically to the character's baseline financial reality:

### 1. Emergency Fund (Safety) — Mandatory
- **Formula:** $6 \times \text{totalMonthlyOutflow}$
- **Target Age:** $\text{startingAge} + 2$ years (24 months to fully fund).
- **Priority:** 1 (Highest).
- **Rule:** Non-negotiable safety net before high-risk investments.

### 2. Vehicle / Car Purchase (Lifestyle) — Optional
- **Formula:** Scaled to annual take-home: $\approx 0.8\text{x}$ to $1.2\text{x}$ annual take-home.
  - Tier 1: ₹7,00,000 to ₹10,00,000.
  - Tier 2: ₹5,50,000 to ₹7,50,000.
  - Tier 3: ₹4,00,000 to ₹6,00,000.
- **Target Age:** Age 27 (or $\text{startingAge} + 4$).
- **Priority:** 3.

### 3. Marriage & Wedding (Lifestyle) — Optional
- **Formula:**
  - Tier 1: ₹10,00,000 to ₹15,00,000.
  - Tier 2: ₹7,00,000 to ₹10,00,000.
  - Tier 3: ₹5,00,000 to ₹7,00,000.
- **Target Age:** Age 29.
- **Priority:** 2.

### 4. Home Down Payment (Asset) — Optional
- **Formula:** 20% down payment on a standard residential apartment in that city tier.
  - Tier 1: ₹25,00,000 to ₹35,00,000.
  - Tier 2: ₹16,00,000 to ₹22,00,000.
  - Tier 3: ₹10,00,000 to ₹15,00,000.
- **Target Age:** Age 34.
- **Priority:** 2.

### 5. Child Higher Education (Long Term) — Optional
- **Target Amount:** ₹25,00,000 to ₹40,00,000.
- **Target Age:** Age 46.
- **Priority:** 3.

### 6. Retirement Corpus / Financial Independence (Long Term) — Mandatory
- **Formula:** $300 \times \text{totalMonthlyOutflow}$ (Rule of 25 / 4% Safe Withdrawal Rate for 25-30 years post-retirement).
  - Typically ₹1.5 Crore to ₹3.5 Crore depending on lifestyle and tier.
- **Target Age:** Age 60.
- **Priority:** 1 (Highest).

---

## 4. Pure Function Interface

```javascript
/**
 * Generates the initial list of financial goals tailored to the character.
 * 
 * @param {CharacterState} character
 * @returns {GoalItem[]}
 */
export function generateInitialGoals(character) {
  // Deterministic calculation from character state
}
```

---

## 5. Verification & Unit Test Criteria
1. **Safety First:** Emergency fund target equals exact $6 \times \text{totalMonthlyOutflow}$.
2. **Retirement Sizing:** Retirement corpus equals exact $300 \times \text{totalMonthlyOutflow}$.
3. **Deadlines Order:** Target ages strictly follow $\text{Emergency Fund} < \text{Car} < \text{Marriage} < \text{Home} < \text{Child} < \text{Retirement}$.
4. **Customization Validation:** If user edits a goal target, target must be $> 0$ and target age must be $> \text{startingAge}$ and $\le \text{retirementAge}$.
