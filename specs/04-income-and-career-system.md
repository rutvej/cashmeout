# Income & Career Progression System

## Overview
The Income & Career Progression System dictates how the player generates active income. It transitions the game from a passive "wait-for-age-based-promotions" loop into an active simulation where upskilling, job hunting, side hustles, and economic risks (like job loss) directly impact the player's financial trajectory.

## Implementation Status

### What EXISTS (✅)
- ✅ Career paths: Science, Arts, Commerce with 5 levels each (Entry to Director).
- ✅ Age-based auto-promotion.
- ✅ baseSalary per level.
- ✅ Yearly salary raise of 5-8%.
- ✅ Side income (15% chance at start).
- ✅ Rent income from property (10% chance at start).

### What's MISSING (❌)
- ❌ USER-DRIVEN job change: player proactively changes jobs instead of purely age-based.
- ❌ Course/upskilling system: invest money/take loan for courses to unlock jobs/hikes.
- ❌ Job field switching: switch from Arts to Commerce etc. after enough experience/courses.
- ❌ Apply for new jobs: apply for higher salary jobs (success based on experience + courses).
- ❌ Same company yearly raise: automatic annual increment scaling by tier/field (T1: 5-8%, T2: 3-6%, T3: 2-5%).
- ❌ Raised income redistribution: screen to allocate new surplus into goals upon getting a raise.
- ❌ Side business investment: invest capital (from Business goal or loan) to start a side business.
- ❌ Side business income: variable monthly income, can grow or fail.
- ❌ Side business risk: business can fail (income stops, loan remains).
- ❌ Loan for business: take business loans to fund side businesses.
- ❌ Income growth options button: UI accessible during pause.
- ❌ Multiple income streams tracking: salary + side business + rent + freelance.
- ❌ Job loss mechanics: salary stops, but side business/rent continue.
- ❌ Re-employment: 2-6 months to find a job after loss, salary might fluctuate.

## Data Models

### `CareerState`
```typescript
interface CareerState {
  currentField: 'Science' | 'Arts' | 'Commerce';
  currentLevel: number; // 1 to 5
  yearsExperience: number;
  completedCourses: string[]; // Course IDs
  
  // Income Streams
  salaryIncome: number;
  sideBusiness: { active: boolean; income: number; riskFactor: number; loanId?: string };
  rentIncome: number;
  freelanceIncome: number;
  
  // Status
  isUnemployed: boolean;
  monthsUnemployed: number;
}
```

### `CourseDef`
```typescript
interface CourseDef {
  id: string;
  name: string;
  cost: number;
  durationMonths: number;
  unlocksField?: string;
  promotionMultiplier: number;
}
```

## Game Mechanics
1. **User-Driven Progression**: Promotions are no longer automatic. The player must actively click "Apply for Promotion" or "Apply for New Job". Success probability = `f(yearsExperience, completedCourses)`.
2. **Upskilling**: Player can browse a Course Catalog, pay out of pocket or via loan. While taking a course, a monthly deduction occurs (if installment-based) or a lump sum is paid.
3. **Field Switching**: Taking specialized courses unlocks cross-field lateral moves (e.g., Arts -> Commerce).
4. **Annual Raises**: Every 12 in-game months at the same job, apply `[Min%, Max%]` raise based on Tier.
   - Immediately pause game, show "Salary Increased!" modal, force player to assign the new surplus difference to goals.
5. **Side Business**: Requires initial capital. Generates monthly income. Every month, a random check against `riskFactor` determines if the business fails. If it fails, income = 0, but any business loan EMI continues.
6. **Job Loss Event**: Randomly triggered (based on economy/market events). `salaryIncome` drops to 0. Player must actively apply for jobs. Takes 2-6 months to succeed. New salary can be 80%-120% of previous salary.

## UI Flow
1. **Income Dashboard (Growth Options)**:
   - Button available on the main/pause screen: "Income Growth".
   - Tabs: "Career", "Side Hustle", "Upskill".
2. **Career Tab**: Shows current job, experience. Buttons to "Ask for Raise", "Apply for New Job", "Switch Field".
3. **Upskill Tab**: Catalog of courses with Cost, Duration, and ROI hints.
4. **Side Hustle Tab**: Interface to start a business, showing Capital Required vs Potential Income. Option to "Take Loan".
5. **Raise Redistribution Modal**: "Your income went up by $X. Where should this extra money go?" with sliders for active goals.

## Edge Cases
- Player takes business loan, business fails, and player loses job: Extreme negative cashflow. Emergency fund handles this, otherwise player goes into debt spiral (game over state).
- Applying for jobs while unemployed: Highest priority action, success rate increases slightly each month to prevent infinite soft-locks.

## Acceptance Criteria
- [ ] Auto-promotions are disabled; player must initiate job changes or promotions.
- [ ] Side business tracks independently and can fail, leaving the player with loan debt.
- [ ] Job loss only affects base salary, preserving other income streams.
- [ ] Annual raises trigger a mandatory surplus reallocation screen.
