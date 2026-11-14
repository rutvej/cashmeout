# Mechanism Spec: Character Generation & Initial Finances (`specs/mechanics/02-character-generation-and-finances.md`)

## 1. Overview & Objective
This mechanism provides the pure, deterministic algorithm that transforms user selections `(seed, cityTier, careerField)` into a complete `CharacterState` object. It governs all starting financial variables: in-hand salary, line-item living expenses, initial debts/loans, initial cash buffer, and net surplus.

It also introduces an explicit, deterministic **character gender assignment** (`gender: 'male' | 'female'`) to ensure downstream heterosexual spouse pairing at the wedding milestone.

No UI or React code is included here. This is pure business logic and mathematical rules.

---

## 2. Global Type Schema (`CharacterState`)

```typescript
export interface LoanItem {
  id: string;                    // e.g. "loan_education"
  name: string;                  // e.g. "Education Loan"
  principalRemaining: number;    // Remaining balance in ₹ (e.g. 350000)
  interestRateAnnual: number;    // Annual interest rate as decimal (e.g. 0.085 for 8.5%)
  tenureMonthsRemaining: number; // Remaining tenure in months (e.g. 48)
  emi: number;                   // Monthly EMI deducted in ₹ (e.g. 8625)
}

export interface ExpensesBreakdown {
  rent: number;                  // Housing / rent per month in ₹
  utilities: number;             // Electricity, broadband, mobile, water in ₹
  groceries: number;             // Food & daily household essentials in ₹
  lifestyle: number;             // Discretionary, entertainment, dining out in ₹
  dependantSupport: number;      // Monthly financial support sent to parents/family (₹0 if none)
}

export interface CharacterState {
  id: string;                    // Unique identifier / seed hash
  seed: string;                  // Reproducible PRNG seed
  name: string;                  // Character's full name
  gender: 'male' | 'female';     // Explicit gender for narrative & heterosexual marriage pairing
  age: number;                   // Starting age (22, 23, or 24)
  retirementAge: number;         // Fixed retirement age (default: 60)
  city: string;                  // City name (e.g. "Bengaluru", "Pune", "Indore")
  cityTier: 'tier1' | 'tier2' | 'tier3';
  careerField: 'science' | 'commerce' | 'arts';
  jobTitle: string;              // e.g. "Associate Software Engineer"
  
  // Inflow (Monthly)
  grossMonthlySalary: number;    // Pre-tax monthly gross salary in ₹
  taxAndPFDeductions: number;    // Income tax + EPF deduction in ₹
  monthlyTakeHome: number;       // Net in-hand income = gross - taxAndPFDeductions
  
  // Outflows (Monthly)
  expenses: ExpensesBreakdown;   // Breakdown of living expenses
  loans: LoanItem[];             // Array of active loans (can be empty)
  
  // Balance Sheet (Initial)
  liquidCash: number;            // Initial savings in bank account in ₹
  
  // Derived / Calculated metrics (Calculated by standard formulas)
  totalFixedExpenses: number;    // Sum of all expenses breakdown items
  totalLoanEMIs: number;         // Sum of all loans[].emi
  totalMonthlyOutflow: number;   // totalFixedExpenses + totalLoanEMIs
  monthlySurplus: number;        // monthlyTakeHome - totalMonthlyOutflow
  
  // Narrative Profile
  primaryDream: string;          // Narrative life dream (e.g. "Buy a home by 32")
}
```

---

## 3. Mathematical Models & Calibration (in ₹ INR)

### A. Name Pools & Deterministic Gender Assignment
Characters are assigned names deterministically from balanced pools. The assigned `gender` is strictly bound to the selected name:

| Pool | Names | Deterministic Gender |
| :--- | :--- | :--- |
| **Male Names** | `Aarav Sharma`, `Rohan Verma`, `Aditya Kulkarni`, `Vikram Joshi`, `Kabir Sengupta`, `Arjun Kapoor`, `Rishi Choudhury`, `Siddharth Pillai` | `'male'` |
| **Female Names** | `Ananya Iyer`, `Priya Nair`, `Sneha Patel`, `Divya Menon`, `Meera Rao`, `Tanvi Deshmukh`, `Isha Mehra`, `Pooja Reddy` | `'female'` |

```javascript
// Deterministic Name & Gender Generation
const isMaleRoll = prng(seed + '_gender') < 0.50;
const pool = isMaleRoll ? MALE_NAMES : FEMALE_NAMES;
const nameIndex = Math.floor(prng(seed + '_name') * pool.length);
const name = pool[nameIndex];
const gender = isMaleRoll ? 'male' : 'female';
```

#### Heterosexual Downstream Marriage Rule:
The character's `gender` is passed to `generateSpouseProfile(seed, character.gender)` at the marriage milestone:
- **Male Character** $\implies$ Spouse is strictly assigned a **Female** name and profile.
- **Female Character** $\implies$ Spouse is strictly assigned a **Male** name and profile.

---

### B. City Tier Configuration
| Tier | Cities Pool | Cost of Living Multiplier | Starting Salary Multiplier |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Metro)** | Bengaluru, Mumbai, Delhi NCR, Hyderabad | 1.25x | 1.30x |
| **Tier 2 (Growth)** | Pune, Ahmedabad, Chandigarh, Chennai, Kochi | 1.00x | 1.00x |
| **Tier 3 (Town)** | Indore, Coimbatore, Jaipur, Nagpur, Bhubaneswar | 0.75x | 0.80x |

### C. Career Field Starting Gross Salaries (Tier 2 Base)
- **Science / Tech:** Base range ₹50,000 – ₹70,000 / month.
  - Job Titles: *"Junior Software Engineer"*, *"Data Analyst"*, *"Cloud Systems Associate"*, *"Biotech Research Associate"*
- **Commerce / Finance:** Base range ₹42,000 – ₹60,000 / month.
  - Job Titles: *"Financial Analyst"*, *"Junior Auditor"*, *"Tax Associate"*, *"Risk Analyst"*
- **Arts / Creative:** Base range ₹38,000 – ₹55,000 / month.
  - Job Titles: *"UI/UX Designer"*, *"Brand Strategist"*, *"Digital Media Associate"*, *"Junior Architect"*

### D. Tax & Deductions Formula (Progressive Marginal Tax with Section 87A Rebate)
The game uses a progressive marginal tax calculation with Section 87A rebate and statutory Employee Provident Fund (EPF), completely eliminating tax cliffs:
- **Employee Provident Fund (EPF):** Flat 5% across all earnings tiers:
  $$\text{monthlyPF} = \text{round}(\text{grossMonthlySalary} \times 0.05)$$
- **Section 87A Tax Rebate:** Annual gross earnings up to ₹7,00,000 (Monthly $\le$ ₹58,333) receive a 100% tax rebate (₹0 income tax).
- **Marginal Tax Above ₹7,00,000/yr:** Income tax applies strictly at 15% on the incremental income exceeding ₹7,00,000/year:
  $$\text{taxableExcess} = \max(0, \text{annualGross} - 700000)$$
  $$\text{monthlyTax} = \text{round}\left(\frac{\text{taxableExcess} \times 0.15}{12}\right)$$
- **Total Deductions & Net Take-Home:**
  $$\text{taxAndPFDeductions} = \text{monthlyPF} + \text{monthlyTax}$$
  $$\text{monthlyTakeHome} = \text{grossMonthlySalary} - \text{taxAndPFDeductions}$$

### E. Living Expenses Model
Living expenses are calibrated as percentages of `monthlyTakeHome` to guarantee realistic budgets:
1. **Rent:** 22% – 28% of take-home (scaled by city cost multiplier).
2. **Utilities:** Flat ₹3,000 – ₹5,000 / month.
3. **Groceries & Essentials:** 12% – 16% of take-home.
4. **Lifestyle & Discretionary:** 8% – 12% of take-home.
5. **Dependant Support:** 30% deterministic probability. If true: ₹6,000 / month; otherwise ₹0.

### F. Starting Loans (Education Debt)
- **Probability:** 45% chance character has an education loan.
- **Principal:** ₹2,50,000 to ₹5,00,000.
- **Interest Rate:** 8.5% per annum ($r = 0.085 / 12$ monthly rate).
- **Tenure:** 60 months (5 years).
- **Standard EMI Formula:**
  $$\text{EMI} = P \times r \times \frac{(1 + r)^n}{(1 + r)^n - 1}$$

### G. The Golden Invariant: Guaranteed Starting Surplus
A game must never spawn an unwinnable, negative cashflow state on turn 1.
$$\text{monthlySurplus} = \text{monthlyTakeHome} - (\text{totalFixedExpenses} + \text{totalLoanEMIs})$$
**Rule:** $\text{monthlySurplus}$ **MUST be $\ge$ ₹10,000**.
If expenses + EMIs exceed `monthlyTakeHome - 10000`, the algorithm scales down lifestyle and rent expenses until `monthlySurplus >= 10000`.

### H. Initial Liquid Cash Buffer
Character spawns with an initial liquid bank balance:
$$\text{liquidCash} = \text{round}(\text{totalMonthlyOutflow} \times \text{random}(1.2, 2.0))$$
(Equivalent to 1.2 to 2 months of emergency expenses).

---

## 4. Pure Function Interface

```javascript
import { createPRNG } from './prng.js';

/**
 * Generates the full initial character state deterministically from PRNG seed,
 * including explicit gender assignment.
 * 
 * @param {string} seed - PRNG seed string
 * @param {'tier1'|'tier2'|'tier3'} cityTier
 * @param {'science'|'commerce'|'arts'} careerField
 * @returns {CharacterState}
 */
export function generateCharacter(seed, cityTier, careerField) {
  const rng = createPRNG(seed);

  // Deterministic Name and Gender Selection
  const isMale = rng() < 0.50;
  const pool = isMale ? MALE_NAMES : FEMALE_NAMES;
  const nameIndex = Math.floor(rng() * pool.length);
  const name = pool[nameIndex];
  const gender = isMale ? 'male' : 'female';

  // Deterministic City, Career, Gross Salary, Taxes, Expenses, Loans...
  // (Full calculation preserving monthlySurplus >= 10000)

  return {
    id: `char_${seed}`,
    seed,
    name,
    gender,
    age: 23,
    retirementAge: 60,
    city,
    cityTier,
    careerField,
    jobTitle,
    grossMonthlySalary,
    taxAndPFDeductions,
    monthlyTakeHome,
    expenses,
    loans,
    liquidCash,
    totalFixedExpenses,
    totalLoanEMIs,
    totalMonthlyOutflow,
    monthlySurplus,
    primaryDream,
  };
}
```

---

## 5. Verification & Unit Test Criteria
1. **Determinism:** Calling `generateCharacter("491823", "tier1", "science")` 100 times in a row returns identical numbers, name, and gender down to the exact rupee and string.
2. **Gender Integrity:** Male names always produce `gender === 'male'`; female names always produce `gender === 'female'`.
3. **Surplus Invariant:** For 500 random seeds across all tiers and fields, `monthlySurplus` is **always $\ge$ 10,000**.
4. **Math Consistency:** `monthlyTakeHome - totalMonthlyOutflow === monthlySurplus` with 0 rounding errors.
