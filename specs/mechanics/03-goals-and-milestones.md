# Mechanism Spec: Goals, Protection & Waterfall Engine (`specs/mechanics/03-goals-and-milestones.md`)

## 1. Overview & Core Philosophy
This mechanism governs two core financial pillars:
1. **Protection over Speculation (Insurance vs. Investment):** Medical emergencies are protected via **Health & Term Insurance** (recurring premium expenses with claim coverage), NOT through volatile investment compounding.
2. **The Cascading Waterfall SIP Engine:** When any goal is achieved (e.g. Emergency Fund hits 100% or Car is purchased), its monthly SIP automatically redirects to a designated fallback goal. If an emergency drains the safety shield, the SIP is automatically recalled to refill the buffer first.
3. **The Annual Vacation Reset Cycle:** Executes every 12 months, resets the corpus, and prompts the player to choose their next destination package (Domestic vs. International).

---

## 2. Insurance & Protection Schema

```typescript
export interface InsurancePolicy {
  id: 'health_insurance' | 'term_life_insurance';
  name: string;
  isPurchased: boolean;
  monthlyPremium: number;         // e.g. ₹800/mo for Health, ₹600/mo for Term Life
  sumInsured: number;             // e.g. ₹10,00,000 cover for hospitalization
  deductible: number;             // Co-pay in ₹ (e.g. ₹5,000)
}
```

* **Health Insurance Rule:** 
  * If an unexpected medical event hits (e.g., ₹1,50,000 hospital bill):
    * **With Insurance:** The policy pays 100% of costs above deductible. Character only pays deductible (₹5,000).
    * **Without Insurance:** The full ₹1,50,000 is violently drained from the Emergency Fund and bank cash.

---

## 3. The Cascading Waterfall & Auto-Recall Rules

```
                      [ Monthly Surplus: ₹16,000 ]
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [ 🛡️ Emergency Fund: ₹5,000/mo ]          [ 🌴 Retirement: ₹7,000/mo ]
   Is Buffer 100% Full?
        │
        ├── NO  ──► Continue filling Emergency Buffer
        │
        └── YES ──► [ CASCADING REDIRECTION ]
                    SIP automatically shifts to configured:
                    `redirectGoalId` (e.g. Car or Retirement)
```

### A. The Forward Waterfall (Goal Complete)
1. Every goal has an optional `redirectGoalId: string | null`.
2. When a goal's $\text{currentAmount} \ge \text{targetAmount}$:
   - The goal transitions to `completed` (or `buffer_full` for Emergency Fund).
   - Its `monthlySIP` is automatically added to `redirectGoalId`'s SIP.
   - If the target goal is ALSO full or completed, it cascades to that goal's `redirectGoalId`, continuing down the chain until reaching `goal_retirement` (the ultimate sink).

### B. The Emergency Auto-Recall (Safety Shield Priority)
1. If any life shock event (medical bill, job layoff, repair) drains the Emergency Fund so that $\text{currentAmount} < \text{targetAmount}$:
   - The Emergency Fund immediately switches to `refill_mode`.
   - **The system instantly recalls its original SIP** from the redirected goal.
   - The redirected goal's SIP drops back to its base allocation.
   - Once the Emergency Fund reaches 100% again, the SIP automatically cascades forward once more!

### C. The Annual Vacation Re-selection Cycle
1. Every 12 months (Months 12, 24, 36, etc.):
   - If $\text{currentAmount} \ge \text{targetAmount}$, the vacation executes successfully (erases career stress/burnout).
   - The vacation corpus is disbursed (resets to ₹0).
   - An annual vacation modal appears, prompting the player to choose their package for the upcoming year:
     - **Domestic:** ₹40,000 – ₹60,000
     - **International:** ₹1,50,000 – ₹2,50,000
   - Monthly SIP can be adjusted or kept on auto-pilot.

---

## 4. Goal Schema with Cascading Properties

```typescript
export interface GoalItem {
  id: string;
  name: string;
  kind: 'milestone' | 'recurring';
  category: 'safety' | 'lifestyle' | 'asset' | 'long_term';
  description: string;
  
  targetAmount: number;
  currentAmount: number;
  
  targetAge: number | null;
  targetMonthsRemaining: number;
  recurrenceIntervalMonths?: number;
  
  // Waterfall Cascading Logic
  baseMonthlySIP: number;          // Original allocated SIP
  effectiveMonthlySIP: number;     // Active SIP including incoming waterfall overflows
  redirectGoalId: string | null;   // Next goal in line when this one is full
  isRefillPriority?: boolean;      // true for Emergency Fund
  
  selectedTierOption?: string;
  isMandatory: boolean;
  priority: number;
  status: 'in_progress' | 'completed' | 'buffer_full' | 'refill_needed';
  icon: string;
}
```
