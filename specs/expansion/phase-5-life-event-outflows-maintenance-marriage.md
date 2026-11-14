# Phase 5 Technical Specification: Life Event Recurring Outflows (Car, Marriage, Home) & Heterosexual Spouse Compatibility

## 1. Overview & Objective
In standard games, purchasing a car or house is a one-time capital deduction. In the real world, major life milestones permanently reshape ongoing cash flows. Phase 5 adds **ongoing vehicle upkeep**, **household marriage economics (dual vs. single earner)** with **strict heterosexual spouse compatibility**, and **property maintenance fees**.

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

### B. Marriage & Spouse Household Economics (Heterosexual Compatibility)
- **Trigger:** Wedding Milestone reached at target age (e.g. Age 29).
- **One-Time Wedding Disbursement:** Event corpus is spent.
- **Heterosexual Spouse Compatibility Rule:**
  At the wedding ceremony, `generateSpouseProfile(seed, characterGender)` deterministically generates a complementary heterosexual partner:
  - If the player character is **Male** (`characterGender === 'male'`):
    - Spouse is strictly assigned a **Female** identity:
      - Gender: `'female'`
      - Name pool: `['Ananya Iyer', 'Priya Nair', 'Sneha Patel', 'Meera Rao', 'Divya Menon', 'Tanvi Deshmukh', 'Isha Mehra', 'Pooja Reddy']`
      - Narrative role: Wife / Bride.
  - If the player character is **Female** (`characterGender === 'female'`):
    - Spouse is strictly assigned a **Male** identity:
      - Gender: `'male'`
      - Name pool: `['Rohan Verma', 'Aditya Kulkarni', 'Vikram Joshi', 'Kabir Sengupta', 'Arjun Kapoor', 'Siddharth Pillai', 'Rishi Choudhury', 'Aarav Sharma']`
      - Narrative role: Husband / Groom.

- **Spouse Archetype Distribution:**

| Archetype | Probability | Spouse Monthly Income | Household Expense Increase | Net Impact on Monthly Surplus |
| :--- | :--- | :--- | :--- | :--- |
| **Dual Income High Earner** | 35% | +₹65,000/month | +₹22,000/month | **+₹43,000/mo (Surplus Jumps!)** |
| **Dual Income Equal Earner** | 40% | +₹40,000/month | +₹20,000/month | **+₹20,000/mo (Surplus Rises)** |
| **Single Income Household** | 25% | ₹0/month | +₹18,000/month | **-₹18,000/mo (Surplus Tightens)** |

- **Household Finances Invariant:**
  $$\text{HouseholdTakeHome} = \text{character.takeHome} + \text{spouse.takeHome}$$
  $$\text{HouseholdFixedExpenses} = \text{character.fixedExpenses} + \text{spouse.addedLivingCosts}$$
  - The Emergency Fund automatically expands to safeguard the entire joint household ($6 \times \text{HouseholdFixedExpenses}$).

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
  gender: 'male' | 'female';        // Complementary to character.gender
  profession: string;
  archetype: string;
  archetypeId: 'high_earner' | 'equal_earner' | 'single_income';
  monthlyTakeHome: number;
  addedHouseholdExpenses: number;
  netSurplusDelta: number;
  isEmployed: boolean;
  tagline: string;
  badgeBg: string;
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

## 4. Pure Function Interface: `generateSpouseProfile`

```javascript
import { createPRNG } from '../engine/prng.js';

const FEMALE_SPOUSE_NAMES = [
  'Ananya Iyer', 'Priya Nair', 'Sneha Patel', 'Meera Rao',
  'Divya Menon', 'Tanvi Deshmukh', 'Isha Mehra', 'Pooja Reddy',
];

const MALE_SPOUSE_NAMES = [
  'Rohan Verma', 'Aditya Kulkarni', 'Vikram Joshi', 'Kabir Sengupta',
  'Arjun Kapoor', 'Siddharth Pillai', 'Rishi Choudhury', 'Aarav Sharma',
];

/**
 * Deterministically rolls a complementary spouse profile based on PRNG seed and character gender.
 * 
 * @param {string} seed 
 * @param {'male'|'female'} characterGender 
 * @returns {SpouseProfile}
 */
export function generateSpouseProfile(seed, characterGender = 'male') {
  const rng = createPRNG(`${seed}_spouse_profile`);
  const roll = rng();

  let archetypeConfig;
  if (roll < 0.35) {
    archetypeConfig = SPOUSE_ARCHETYPES.high_earner;
  } else if (roll < 0.75) {
    archetypeConfig = SPOUSE_ARCHETYPES.equal_earner;
  } else {
    archetypeConfig = SPOUSE_ARCHETYPES.single_income;
  }

  const professionIndex = Math.floor(rng() * archetypeConfig.professions.length);
  const profession = archetypeConfig.professions[professionIndex];

  // Heterosexual Spouse Compatibility Enforcement:
  // Male character -> Female spouse; Female character -> Male spouse
  const spouseGender = characterGender === 'male' ? 'female' : 'male';
  const namePool = spouseGender === 'female' ? FEMALE_SPOUSE_NAMES : MALE_SPOUSE_NAMES;
  const nameIndex = Math.floor(rng() * namePool.length);
  const name = namePool[nameIndex];

  return {
    name,
    gender: spouseGender,
    profession,
    archetype: archetypeConfig.name,
    archetypeId: archetypeConfig.id,
    monthlyTakeHome: archetypeConfig.monthlyTakeHome,
    addedHouseholdExpenses: archetypeConfig.addedHouseholdExpenses,
    netSurplusDelta: archetypeConfig.netSurplusDelta,
    isEmployed: archetypeConfig.isEmployed,
    tagline: archetypeConfig.tagline,
    badgeBg: archetypeConfig.badgeBg,
  };
}
```

---

## 5. UI & Interaction Design (Cred NeoPOP Light Theme)

### A. Wedding Reveal Modal (`WeddingModal.jsx`)
- Celebratory NeoPOP card introducing the player's life partner.
- Respects complementary gender titles and pronouns:
  - If Character is Male $\implies$ Displays *"Meet your Wife, [Spouse Name]"*.
  - If Character is Female $\implies$ Displays *"Meet your Husband, [Spouse Name]"*.
- Interactive breakdown showing:
  - Combined Household Inflows (+₹X) vs. Combined New Outflows (-₹Y).
  - New Net Household Surplus.
  - Expanded Emergency Shield requirements.

### B. Scorecard & Retrospective Summary
- Endgame retrospective acknowledges the spouse's career and economic contribution with correct gender terminology (e.g. *"Your wife Sneha's career as Senior Product Manager contributed ₹43,000/mo to household surplus"*).

### C. Monthly Outflow Ledger Breakdown
- In the command bar and financial details drawer, outflows are cleanly itemized:
  - `Base Living: ₹28,000`
  - `Car Upkeep: ₹3,500`
  - `Home Maintenance: ₹5,500`
  - `Spouse Household Addon: ₹20,000`
  - `Loan EMIs: ₹42,000`
  - `Total Outflow: ₹99,000/mo`
