# Phase 5 Technical Specification: Life Event Recurring Outflows (Car, Marriage, Home)

## 1. Overview & Objective
In standard games, purchasing a car or house is a one-time capital deduction. In the real world, major life milestones permanently reshape ongoing cash flows. Phase 5 adds **ongoing vehicle upkeep**, **household marriage economics (dual vs. single earner)**, and **property maintenance fees**.

---

## 2. Milestone Upkeep & Cash Flow Formulations

### A. Car Ownership & Recurring Upkeep
- **Trigger:** Car Milestone achieved and vehicle purchased.
- **Immediate Impact on Outflows:**
  - Adds mandatory monthly vehicle operating expenses to `character.totalFixedExpenses`:
    $$\Delta \text{fixedExpenses}_{\text{car}} = \text{₹3,500/month}$$
  - Breakdown: Fuel & charging (₹2,200) + Annual servicing reserve (₹800) + Motor insurance premium (₹500).
- **Secondary Cascading Effects:**
  - `totalMonthlyOutflow` increases by ₹3,500/mo.
  - Required Emergency Fund target increases by $+6 \times 3,500 = +\text{₹21,000}$!

---

### B. Marriage & Spouse Household Economics
- **Trigger:** Wedding Milestone reached at target age (e.g. Age 29).
- **One-Time Wedding Disbursement:** Event corpus is spent.
- **Spouse Profile Generation:**
  At the wedding ceremony, a deterministic spouse profile is rolled:

| Archetype | Probability | Spouse Monthly Income | Household Expense Increase | Net Impact on Monthly Surplus |
|---|---|---|---|---|
| **Dual Income High Earner** | 35% | +₹65,000/month | +₹22,000/month | **+₹43,000/mo (Surplus Jumps!)** |
| **Dual Income Equal Earner** | 40% | +₹40,000/month | +₹20,000/month | **+₹20,000/mo (Surplus Rises)** |
| **Single Income Household** | 25% | ₹0/month | +₹18,000/month | **-₹18,000/mo (Surplus Tightens)** |

- **Household Finances Invariant:**
  $$\text{HouseholdTakeHome} = \text{character.takeHome} + \text{spouse.takeHome}$$
  $$\text{HouseholdFixedExpenses} = \text{character.fixedExpenses} + \text{spouse.addedLivingCosts}$$
  - The Emergency Fund automatically expands to safeguard the entire joint household.

---

### C. Home Maintenance & Property Taxes
- **Trigger:** Home Purchase executed (either early or at milestone maturity).
- **Impact on Outflows:**
  - Replacing rent with homeownership introduces property maintenance:
    $$\Delta \text{fixedExpenses}_{\text{home\_maint}} = \text{₹5,500/month}$$
  - Covers apartment society maintenance, civic water/sewer charges, and municipal property taxes.
  - Combined with the **Mortgage EMI**, this reflects the true cash-flow reality of buying a house.

---

## 3. Data Schema Extensions

```typescript
export interface SpouseProfile {
  name: string;
  profession: string;
  monthlyTakeHome: number;
  addedHouseholdExpenses: number;
  isEmployed: boolean;
}

export interface AssetMaintenanceState {
  hasCar: boolean;
  carMonthlyUpkeep: number;
  hasOwnedHome: boolean;
  homeMonthlyMaintenance: number;
  isMarried: boolean;
  spouse: SpouseProfile | null;
}
```

---

## 4. UI & Interaction Design (Cred NeoPOP Light Theme)

### A. Wedding Reveal Modal (`WeddingModal.jsx`)
- Celebratory NeoPOP card introducing the player's life partner.
- Interactive breakdown showing:
  - Combined Household Inflows (+₹X) vs. Combined New Outflows (-₹Y).
  - New Net Household Surplus.

### B. Monthly Outflow Ledger Breakdown
- In the command bar and financial details drawer, outflows are cleanly itemized:
  - `Base Living: ₹28,000`
  - `Car Upkeep: ₹3,500`
  - `Home Maintenance: ₹5,500`
  - `Spouse Household Addon: ₹20,000`
  - `Loan EMIs: ₹42,000`
  - `Total Outflow: ₹99,000/mo`
