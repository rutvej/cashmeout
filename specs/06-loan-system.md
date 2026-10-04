# Loan System

## Overview
The Loan System governs borrowing mechanics in the game. It allows players to leverage debt for goals (Home, Car, Business, Education) or as a last resort during emergencies. It also enforces realistic constraints like debt-to-income ratios and retirement deadlines.

## What Exists (✅)
- Loan types: Home, Car, Personal, Business.
- Fixed interest rates and maximum tenures.
- EMI calculation and monthly deductions.
- Basic UI to take or prepay loans.
- State tracking for principal, rate, tenure, EMI, and remaining balance.

## What's Missing & Needs Implementation (❌)

### 1. Loan Constraints & Links
- **Term Insurance Link:** Home Loans MUST be linked to a Term Insurance policy (cross-ref Spec 05).
- **Retirement Deadline:** All loans MUST be paid off by the player's retirement date (max age 60).
  - Game warns the player as retirement approaches (e.g., 5 years out).
  - If loans remain at retirement, apply a severe scoring penalty or force asset liquidation to clear them.

### 2. New Loan Types
- **Education/Course Loan:** Taken for career improvement/upskilling. Short tenure, moderate interest.
- **Business Loan:** Used to fund side businesses. Higher interest rates, shorter tenures.

### 3. Emergency & Event Loans
- **Event Response:** When an emergency or goal event occurs and the player lacks funds, the UI must offer an option to take a Personal Loan to cover the shortfall.
- **Goal Shortfalls:** If a milestone event fires (e.g., Marriage) and the goal bucket isn't fully funded, taking a loan should be a primary option.

### 4. EMI & Expense Mechanics
- EMIs must automatically increase the player's Fixed Expenses, directly reducing the monthly surplus available for investment.
- **DTI Check:** Warn the player if their EMI-to-Income ratio exceeds 50%.

### 5. Advanced Loan Features
- **Pre-payment:** Options for part-prepayment or full closure. Pre-payments reduce the principal and recalculate tenure or EMI.
- **Interest Types:** Introduce Fixed vs. Floating rates. Floating rates should fluctuate based on Market Events.
- **Restructuring:** Option to extend tenure if struggling, resulting in lower EMI but higher total interest paid.

### 6. UI Updates
- Amortization schedule view.
- Total interest paid vs. Principal paid tracker.

## Data Models

```typescript
interface Loan {
  id: string;
  type: 'HOME' | 'CAR' | 'PERSONAL' | 'BUSINESS' | 'EDUCATION';
  principal: number;
  remainingPrincipal: number;
  interestRate: number; // Annual percentage
  rateType: 'FIXED' | 'FLOATING';
  tenureMonths: number;
  monthsPaid: number;
  emi: number;
  linkedGoalId?: string;
}
```

## EMI Calculation Formula
```javascript
// EMI = P * r * (1+r)^n / ((1+r)^n - 1)
// Where P is Principal, r is monthly interest rate (Annual Rate / 12 / 100), n is tenure in months.
function calculateEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
```

## Prepayment Rules
- **Part-payment:** Reduces `remainingPrincipal`. Player can choose to either keep EMI same (reduces tenure) or keep tenure same (reduces EMI). Default to reducing tenure.
- **Full closure:** Pays off `remainingPrincipal` completely. May attract a small foreclosure penalty (e.g., 1-2% of remaining principal) for certain loan types.

## Acceptance Criteria
- [ ] Cannot take a Home Loan without an active Term Insurance policy.
- [ ] Warning generated if DTI > 50%.
- [ ] All loans force resolution/penalty at retirement age.
- [ ] Pre-payment correctly updates remaining principal and tenure.
- [ ] taking a loan immediately updates Fixed Expenses and recalculates monthly surplus.
