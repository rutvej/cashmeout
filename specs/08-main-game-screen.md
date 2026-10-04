# Main Game Screen & Simulation Loop

## Overview
The Main Game Screen is the central dashboard where the player watches their financial life unfold. The Simulation Loop is the engine that processes income, expenses, and market changes month by month.

## What Exists (✅)
- Monthly simulation tick.
- Play/Pause/Speed controls (1x, 2x, 5x).
- Timeline bar for age.
- Live financial ledger and goal bucket bars.
- Tab bar (Income, Loans, Investments, Goals, Insurance, Bank).

## What's Missing & Needs Implementation (❌)

### 1. Main Game Chart (Central Visualization)
- **Type:** Multi-line chart (X-axis = Time in months, Y-axis = Amount in ₹).
- **Data:** One line per active goal tracking its current funded amount over time.
- **Targets:** Horizontal dashed lines representing the target amount for each goal.
- **Color Coding:**
  - Green: On track to hit target by deadline.
  - Yellow: Borderline.
  - Red: Behind schedule.
- **Updates:** Re-renders on every monthly tick.

### 2. Time Progression & Simulation Loop
- **Monthly Actions:**
  1. Add Income (Salary + Business + Rent + Dividends).
  2. Deduct Expenses (Fixed + Utilities + EMIs + Premiums).
  3. Calculate Surplus = Income - Expenses.
  4. Auto-invest Surplus based on the player's set allocations.
  5. Apply monthly growth/interest to investments and savings.
  6. Check for Events (if event exists for current month -> PAUSE).

### 3. Pause Functionality
- Must have a prominent Play/Pause toggle.
- **When Paused:** Game stops ticking. Player has full access to UI to:
  - Adjust surplus allocations.
  - Take/prepay loans.
  - Buy insurance.
  - Invest in courses.
- **Resume:** Game ONLY resumes when the player clicks Play (no auto-resume after closing a menu, except for resolving forced events).

### 4. Income Options & Yearly Raise
- **Income Button:** Opens a modal to explore ways to increase income:
  - Take a Course: Costs money and time, guarantees a salary bump later.
  - Apply for Job: Change jobs for a potential hike.
  - Start Business.
- **Yearly Raise:**
  - Every 12 months, salary automatically increases (5-8%).
  - Triggers a Pause and shows a Redistribution Screen for the *new* extra surplus (Delta).

### 5. Game End & Scorecard
- **Trigger:** Reaching the selected retirement age (max 60).
- **Checks:**
  - All loans must be 0. If not, penalize score.
  - Calculate net worth.
  - Determine if passive income > expenses (Financial Independence achieved).
- **Transition:** Move from Main Game Screen to Scorecard Screen.

## Simulation Loop Pseudocode

```javascript
function tickMonth(gameState) {
  if (gameState.isPaused) return;

  // 1. Process Income
  let totalIncome = calculateTotalIncome(gameState);
  
  // 2. Process Expenses
  let totalExpenses = calculateTotalExpenses(gameState);
  
  // 3. Calculate Surplus
  let surplus = totalIncome - totalExpenses;
  
  // 4. Distribute Surplus
  allocateSurplus(surplus, gameState.allocations);
  
  // 5. Grow Investments
  applyMonthlyReturns(gameState.investments);
  
  // 6. Check Events
  const eventsThisMonth = getEventsForDate(gameState.currentDate);
  if (eventsThisMonth.length > 0) {
    gameState.isPaused = true;
    triggerEventUI(eventsThisMonth[0]);
  }
  
  // 7. Check Yearly Raise
  if (isYearAnniversary(gameState.currentDate)) {
    gameState.isPaused = true;
    triggerYearlyRaise(gameState);
  }

  // 8. Check End Game
  if (gameState.age >= gameState.retirementAge) {
    endGame(gameState);
  }

  // Increment Date
  gameState.currentDate.addMonth(1);
}
```

## UI Component Hierarchy
- `MainGameScreen`
  - `TopBar` (Age Timeline, Net Worth, Play/Pause Controls)
  - `CentralDashboard`
    - `GoalProgressChart` (The new Line Chart)
    - `EventNotificationArea`
  - `SidePanel`
    - `MonthlyLedger` (Income, Expenses, Surplus breakdown)
    - `QuickActions` (Income Options Button)
  - `BottomTabBar` (Income, Loans, Investments, Goals, Insurance, Bank)

## Acceptance Criteria
- [ ] Central chart correctly plots multiple goal trajectories vs targets.
- [ ] Simulation correctly handles all 6 steps of the monthly tick.
- [ ] Game pauses on events and yearly raises, awaiting user action.
- [ ] Yearly raise accurately calculates delta and forces allocation.
- [ ] Game transitions to end screen cleanly at retirement age.
