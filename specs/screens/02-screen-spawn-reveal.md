# Screen 2: Spawn Reveal (`specs/screens/02-screen-spawn-reveal.md`)

## 1. Purpose & User Objective
The Spawn Reveal screen is where the player discovers who they are in this simulation. It introduces their character, job, city, income, living expenses, existing debt (if any), initial bank balance, and starting monthly surplus. 

The player reviews their baseline financial reality, understands how much discretionary money they have each month, and clicks **"Continue to Financial Goals"** to proceed to Screen 3 (`goal_setup`).

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-------------------------------------------------------------+
|                     CHARACTER PROFILE                       |
|           Seed: #491823  •  Tier 1 Metro  •  Tech           |
+-------------------------------------------------------------+
|                                                             |
|  [ CHARACTER IDENTITY CARD ]                                |
|  Avatar / Initials   | Name: Aarav Sharma                   |
|  Age: 23             | Role: Junior Software Engineer       |
|  City: Bengaluru     | Ambition: "Buy a home by 32"         |
|                                                             |
|  +----------------------------+  +------------------------+ |
|  | MONTHLY INFLOW             |  | MONTHLY OUTFLOW        | |
|  | Gross Salary:     ₹78,000  |  | Rent:         ₹18,500  | |
|  | Taxes & PF:      - ₹9,360  |  | Utilities:     ₹4,000  | |
|  |                            |  | Groceries:     ₹9,500  | |
|  |                            |  | Lifestyle:     ₹6,000  | |
|  |                            |  | Dependants:    ₹6,000  | |
|  |                            |  | Loan EMI:      ₹8,625  | |
|  | -------------------------- |  | ---------------------- | |
|  | TAKE-HOME:        ₹68,640  |  | TOTAL OUTFLOW: ₹52,625 | |
|  +----------------------------+  +------------------------+ |
|                                                             |
|  [ CASHFLOW SNAPSHOT ]                                      |
|  +-------------------------------------------------------+  |
|  | Monthly Surplus (Investable):               ₹16,015   |  |
|  | Starting Liquid Bank Buffer:                ₹65,000   |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  [ EDUCATION LOAN DETAILS (if active) ]                     |
|  Education Loan: ₹3,50,000 at 8.5% p.a. (48 months remaining)|
|                                                             |
|  +-------------------------------------------------------+  |
|  |         [ CONTINUE TO FINANCIAL GOALS -> ]            |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

---

## 3. Data Contract

### A. Inputs (Read from Store)
This screen reads directly from `gameState.character: CharacterState` (produced by `specs/mechanics/02-character-generation-and-finances.md`).
- `character.name`
- `character.age`
- `character.city`
- `character.jobTitle`
- `character.grossMonthlySalary`
- `character.taxAndPFDeductions`
- `character.monthlyTakeHome`
- `character.expenses` (rent, utilities, groceries, lifestyle, dependantSupport)
- `character.loans` (array of LoanItem)
- `character.totalFixedExpenses`
- `character.totalLoanEMIs`
- `character.totalMonthlyOutflow`
- `character.monthlySurplus`
- `character.liquidCash`
- `character.primaryDream`

### B. Outputs (Store Mutations on Exit)
This screen does **NOT** mutate financial state. It only advances navigation:
- `currentScreen: 'goal_setup'`

---

## 4. UI Controls & User Interactions

1. **Top Identity Bar:**
   - Displays avatar with initials or career icon.
   - Character name, age, city, and role.
   - Seed indicator (allows player to copy seed to clipboard).

2. **Inflow & Outflow Cards:**
   - Clearly separated side-by-side (or stacked on mobile).
   - Inflow styled in emerald/green tint.
   - Outflow styled in slate/rose tint.
   - Clean Indian currency formatting (e.g., `₹68,640`).

3. **Loan Banner (Conditional):**
   - Renders only if `character.loans.length > 0`.
   - Explains the loan principal, interest rate, and remaining EMI tenure.

4. **Cashflow Snapshot:**
   - Prominently highlights the **Monthly Surplus** with a clear explanation: *"This is the monthly surplus you will allocate toward your life goals on the next screen."*
   - Displays the **Initial Liquid Cash** buffer currently in the bank.

5. **"Continue to Financial Goals" Action Button:**
   - Large, prominent CTA at the bottom.
   - On click: calls `navigateTo('goal_setup')`.

6. **"← Start Over" Link:**
   - Discrete link in header or footer to return to Landing Screen if the player wants to reroll or pick a different seed/tier.

---

## 5. Edge Cases & Boundary Conditions
- **Character with No Loans:** The Loan card/banner cleanly collapses without leaving blank gaps.
- **Character with Zero Dependant Support:** If `dependantSupport === 0`, that row either displays "₹0 (None)" or is hidden with a clean layout.
- **Currency Formatting:** All numbers must use Indian number grouping: `₹1,00,000` instead of `₹100,000`.

---

## 6. Exit Criteria & Navigation
- **Next Screen:** Screen 3 (`goal_setup`).
- **Trigger:** Player clicks `[ Continue to Financial Goals -> ]`.
- **Global Store Mutation:**
  - `gameState.currentScreen = 'goal_setup'`
