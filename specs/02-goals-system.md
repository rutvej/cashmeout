# Goals System

## Overview
The Goals System handles the financial milestones a player must achieve. It differentiates between Desired goals (e.g., Home, Vacation) and Mandatory goals (Emergency Fund, Retirement). The system manages target amounts, timelines, and goal-specific financial allocations.

## Implementation Status

### What EXISTS (✅)
- ✅ Goal types: MARRIAGE, HOME, CAR, VACATION, BUSINESS, KIDS_FUTURE, EMERGENCY_FUND, RETIREMENT.
- ✅ Each goal has targetAmount, targetAge, priority, isRecurring.
- ✅ KIDS_FUTURE unlocks only after MARRIAGE.
- ✅ Target amounts scale by tier city.
- ✅ Goals displayed as cards in GoalSetup screen.
- ✅ Feasibility signals (red/yellow/green) on FinancialSetup screen.

### What's MISSING (❌)
- ❌ Goals should have FIXED dates (not just target age) - e.g., marriage at age 28, home at 30.
- ❌ Vacation is RECURRING (every year) - need special handling for annual trip budgeting.
- ❌ Goal amounts should be fixed based on tier (not adjustable by user per current vision).
- ❌ Per-goal investment instrument selection (which instrument for which goal's money).
- ❌ Per-goal allocation screen with back/forth navigation between goals.
- ❌ Bottom signal indicator per goal showing will-it-make-it projection.
- ❌ Mandatory Goals: Emergency fund target = 6 months of expenses; Retirement fund target = enough corpus to sustain till age 80 at 4% withdrawal rate.
- ❌ Detailed Goal Screen UI: goal name, target amount, target date, monthly allocation input, instrument selector, projected growth chart, red/yellow/green signal.
- ❌ Surplus restriction: Total allocation across all goals cannot exceed surplus (Surplus = Income - Fixed Expenses - Loan EMIs - Insurance Premiums).

## Data Models

### `Goal`
```typescript
interface Goal {
  id: string;
  type: 'MARRIAGE' | 'HOME' | 'CAR' | 'VACATION' | 'BUSINESS' | 'KIDS_FUTURE' | 'EMERGENCY_FUND' | 'RETIREMENT';
  isMandatory: boolean;
  isRecurring: boolean; // True for VACATION
  
  targetAmount: number; // Fixed based on tier
  targetDate: Date; // Fixed date (derived from target age at start)
  targetAge: number; // e.g., 28
  
  // Player Allocation State
  monthlyAllocation: number;
  allocatedInstrumentId: string; // Links to Investment Instrument
  currentAccumulatedAmount: number;
  
  // Projection State
  projectedFeasibility: 'RED' | 'YELLOW' | 'GREEN';
}
```

## Game Mechanics
1. **Fixed Dates**: Target age is converted to a fixed in-game date/month at initialization.
2. **Mandatory Targets**:
   - *Emergency Fund*: Dynamically calculated as `6 * (Current Fixed Expenses + Utilities)`. Must update if expenses change.
   - *Retirement*: Calculated using the 4% rule: `(Annual Expenses at retirement age) * 25`. Needs assumed inflation logic.
3. **Recurring Goals**: Vacation triggers every 12 months. When triggered, the accumulated amount is deducted, and the goal resets for the next year.
4. **Feasibility Projection**: Formula checks: `Future Value of current monthlyAllocation via allocatedInstrumentId's expected return` vs `targetAmount`. 
   - GREEN: ≥ 100% of target.
   - YELLOW: 80-99% of target.
   - RED: < 80% of target.
5. **Surplus Constraint**: The sum of `monthlyAllocation` across all goals cannot exceed the current monthly surplus.

## UI Flow
1. **Goal Setup / Allocation Hub**: 
   - Shows total surplus available.
   - Cards for each goal showing target amount and date.
2. **Per-Goal Allocation Screen**:
   - Accessed by tapping a goal card.
   - UI Elements: Name, Target Amount, Target Date.
   - Input: Slider or number pad for `monthlyAllocation`.
   - Dropdown/Carousel for Instrument selection (e.g., Equity, FD).
   - **Chart**: Visual projection curve comparing trajectory to target point.
   - **Signal**: Large Red/Yellow/Green indicator at the bottom.
   - Next/Prev buttons to quickly switch between goals.

## Edge Cases
- Surplus drops below allocated total (due to job loss or expense increase): System must prompt user to re-allocate or automatically pause allocations starting from lowest priority.
- Recurring goal underfunded at deadline: Player goes on a "budget vacation" or skips it, potentially impacting happiness/stress metrics.

## Acceptance Criteria
- [ ] User cannot adjust the target amounts; they are locked based on tier.
- [ ] User cannot allocate more than their calculated surplus.
- [ ] Each goal can be assigned its own investment instrument.
- [ ] Navigation allows seamless back-and-forth between individual goal allocation screens.
