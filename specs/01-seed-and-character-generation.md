# Seed & Character Generation System

## Overview
This specification details the Seed & Character Generation System, responsible for initializing the player's starting state. The system leverages a seed-based PRNG to ensure replicable scenarios, allowing players to share specific financial setups. It defines the character's demographics, initial financial standing, and narrative backstory.

## Implementation Status

### What EXISTS (✅)
- ✅ Seed input (auto-generated or user-entered) using mulberry32 PRNG.
- ✅ Tier selection (T1/T2/T3) with cost multipliers.
- ✅ Field selection (Science/Arts/Commerce) with salary multipliers.
- ✅ Character generation: name, age (20-25), starting salary, housing (own/rent), existing loans (student/personal 30% chance), dependants (parents health 25% chance), side income (15% chance), rent income from property (10% chance).
- ✅ Fixed expenses and utilities scaled by tier.

### What's MISSING (❌)
- ❌ City selection within tiers (user should pick or see a city name, not just T1/T2/T3).
- ❌ Character backstory/narrative text generation - showing the character's dreams and aspirations as a story paragraph.
- ❌ Character awareness system - the character is unaware of financial skills, the player acts as the financial advisor.
- ❌ Detailed starting condition display: current rent amount, exact fixed expenses breakdown (not just total), utility breakdown, outstanding loan details with EMI and remaining tenure, dependent details (what illness, monthly cost).
- ❌ Age selection or display of starting age prominently.
- ❌ Side income details (what business, monthly income amount).
- ❌ Rent income details (what property, monthly rent amount).
- ❌ Seed shareability (like Minecraft) so friends can play the same scenario.
- ❌ Seed display should be prominent and copyable.

## Data Models

### `SeedConfig`
```typescript
interface SeedConfig {
  seedValue: string; // The alphanumeric string used for PRNG
  tier: 'T1' | 'T2' | 'T3';
  cityName: string; // Derived from Tier
  field: 'Science' | 'Arts' | 'Commerce';
}
```

### `CharacterProfile`
```typescript
interface CharacterProfile {
  name: string;
  age: number; // 20-25
  backstory: string; // Narrative text
  isFinanciallyAware: boolean; // Defaults to false
  
  // Income
  baseSalary: number;
  sideIncome: { active: boolean; businessName?: string; monthlyAmount?: number };
  rentIncome: { active: boolean; propertyType?: string; monthlyAmount?: number };
  
  // Expenses & Liabilities
  housing: { type: 'own' | 'rent'; monthlyCost: number };
  fixedExpenses: Record<string, number>; // e.g., { groceries: 300, transport: 150 }
  utilities: Record<string, number>; // e.g., { electricity: 50, internet: 30 }
  loans: {
    active: boolean;
    type?: 'student' | 'personal';
    principalRemaining?: number;
    emi?: number;
    tenureMonthsRemaining?: number;
  }[];
  dependants: {
    active: boolean;
    condition?: string;
    monthlyMedicalCost?: number;
  }[];
}
```

## Game Mechanics
1. **Seed Processing**: The `seedValue` initializes the `mulberry32` PRNG. All probabilistic outcomes (e.g., side income chance, loan generation) must consume PRNG sequence values to guarantee determinism.
2. **City Selection**: Each tier maps to an array of real-world or fictional city names. The RNG selects a city from the list based on the chosen Tier.
3. **Narrative Generation**: Based on generated attributes (field, loans, dependents), construct a 2-3 sentence paragraph. Example: "Meet [Name], a [Age]-year-old working in [Field] in [City]. Burdened by [Loan Type] and caring for [Dependent], they dream of a stable future but have no idea where to start."
4. **Player Role**: The game enforces the narrative that the Character is clueless. The Player is the "Financial Advisor" guiding their decisions.

## UI Flow
1. **New Game Screen**:
   - Field to enter a custom seed (or leave blank to auto-generate).
   - Prominent "Copy Seed" button next to the active seed.
   - Dropdowns for Tier (with City preview) and Field.
2. **Character Setup Display**:
   - Prominent header showing Age and Name.
   - Backstory text block.
   - **Income Column**: Salary, Side Business (with details), Rent (with details).
   - **Expense/Liability Column**: Rent amount, Itemized fixed expenses, Itemized utilities, Detailed loan breakdown (EMI, Tenure), Dependent care costs.
   - "Accept Client" button to begin gameplay.

## Edge Cases
- Invalid seed strings: Fallback to hashing the string into a numeric seed or generate a random one.
- Math mismatch: Ensure sum of itemized expenses exactly matches the total deductions applied to the character's monthly cashflow.

## Acceptance Criteria
- [ ] Seed can be copied to clipboard and pasted into a new game to generate the exact same `CharacterProfile`.
- [ ] UI shows itemized breakdown of expenses, utilities, and loans rather than grouped totals.
- [ ] Backstory paragraph dynamically adapts to the generated traits.
- [ ] City name is displayed instead of just "T1/T2/T3".
