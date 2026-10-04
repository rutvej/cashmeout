# Bonus & Windfall Income Allocation System

PARTIALLY IMPLEMENTED. Store has pendingAllocation but UI is basic.

## What EXISTS (✅):
- pendingAllocation in store state
- eventResolver adds bonus/windfall to pendingAllocation
- distributeBonus action in store

## What's MISSING (❌ - write detailed spec):

### BONUS ALLOCATION FLOW:
1. Bonus event fires (annual company bonus, ~1-3 months salary)
2. Game auto-pauses
3. Allocation screen appears showing:
   - Total bonus amount
   - All current goals with their current funding status
   - Slider/input per goal to allocate portions of the bonus
   - Option to put into emergency fund
   - Option to put into savings/bank
   - Option to prepay a loan
   - Total allocated must equal bonus amount
4. User distributes as desired
5. Confirm → money flows into chosen buckets
6. Game resumes

### WINDFALL ALLOCATION:
- Same as bonus but for large one-time amounts
- "Family sold property" / "Inheritance" / "Lottery" type events
- Happens EXACTLY ONCE in entire game
- Amount: 5L-20L based on tier
- Same allocation UI but with larger amounts
- Additional option: invest lump sum in a new instrument

### SALARY RAISE ALLOCATION:
- When yearly raise happens or job change increases salary
- The ADDITIONAL monthly surplus (new surplus - old surplus) needs to be allocated
- Show: "Your income increased by ₹X/month. How would you like to allocate the additional ₹Y surplus?"
- Same goal allocation interface
- Can also increase insurance premiums, increase loan prepayment

### SIDE INCOME ALLOCATION:
- When side business starts generating income
- New recurring monthly income to be allocated
- Same interface

### UI DESIGN:
- Full-screen overlay / bottom sheet
- Pie chart showing proposed allocation
- Equal distribution button (split equally across all goals)
- Proportional button (split proportional to how much each goal still needs)
- Custom allocation with sliders
- Running total showing allocated vs remaining
- Confirm button (disabled until fully allocated)

### Data model for AllocationEvent
```typescript
interface AllocationEvent {
  id: string;
  type: 'BONUS' | 'WINDFALL' | 'SALARY_RAISE' | 'SIDE_INCOME';
  amount: number;
  isMonthly: boolean; // True for Raise/Side Income, False for Bonus/Windfall
  source: string;
  title: string;
  description: string;
}

interface AllocationResult {
  allocations: {
    destinationId: string;
    destinationType: 'GOAL' | 'EMERGENCY_FUND' | 'BANK' | 'LOAN_PREPAYMENT';
    amount: number;
  }[];
}
```

### UI wireframe description
- **Layout**: Full-screen overlay or large bottom sheet over paused game.
- **Visuals**: 
  - Top: Total Amount Available (sticky, large font).
  - Center: Interactive Pie chart mapping directly to sliders.
- **Quick Actions**: "Split Equally" and "Split Proportionally" buttons to auto-set sliders.
- **Goal Rows**: List view. Each row shows Goal Name, Current/Target progress bar, a slider, and a numeric input for granular control.
- **Footer**: Sticky footer with Running total (`Allocated` vs `Remaining`) and `Confirm` button (active only when Remaining = 0).

### Validation rules
- `Sum of all allocations` MUST exactly equal `Total Amount Available`.
- Ensure no negative allocations.
- For loan prepayments, allocation cannot exceed outstanding principal.
- For raises/side income (monthly), allocations configure recurring SIPs/EMIs/Savings.
