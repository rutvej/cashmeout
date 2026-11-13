# Screen 6: Scorecard & Financial Life Retrospective (`specs/screens/06-screen-scorecard.md`)

## 1. Overview & Objective
This screen is the **Grand Finale** of the simulation upon reaching Age 60. It replaces static score numbers with an engaging, story-driven **Financial Life Retrospective & Strategic Debrief** presented in simple, relatable terms.

---

## 2. Layout & Wireframe

```
+-------------------------------------------------------------------------+
|                  FINANCIAL LIFE RETROSPECTIVE (AGE 60)                  |
|          Aarav • Age 23 to 60 • 37 Years Simulated • Seed #491823       |
+-------------------------------------------------------------------------+
|                                                                         |
|  [ GRADE HERO BANNER ]                                                  |
|  +-------------------------------------------------------------------+  |
|  |  🌟 GRADE A (84 / 100) — Comfortable Financial Independence       |  |
|  |  Net Worth: ₹2.42 Cr  •  Passive: ₹80,500/mo  •  Debt: ₹0 (Free)   |  |
|  +-------------------------------------------------------------------+  |
|                                                                         |
|  [ RETROSPECTIVE TABS ]                                                 |
|  [ 🎯 Milestones & Decisions ]  [ 💼 Career & What-Ifs ]  [ 📊 Asset Audit ] |
|                                                                         |
|  ---------------------------------------------------------------------  |
|                                                                         |
|  SECTION 1: MILESTONES & DECISION AUDIT                                 |
|                                                                         |
|  🚗 First Car (Target: ₹6,00,000)                                       |
|  • Outcome: Shortfall of ₹1,20,000 at Age 27                            |
|  • Decision Taken: Postponed by +2 Years                                |
|  • Verdict: 🟢 Smart Move! Postponing avoided a 9.5% loan and let your   |
|    early surplus compound uninterrupted.                                |
|                                                                         |
|  💍 Wedding & Marriage (Target: ₹8,00,000)                              |
|  • Outcome: Funded 100% On-Time at Age 29                               |
|  • Verdict: 🟢 Perfect Execution! Married debt-free.                   |
|                                                                         |
|  🏠 Home Down Payment (Target: ₹22,00,000)                              |
|  • Outcome: Filled 14 Months Early!                                    |
|  • Verdict: 🌟 Outstanding! Early completion unlocked lower mortgage.   |
|                                                                         |
|  ---------------------------------------------------------------------  |
|                                                                         |
|  SECTION 2: "WHAT COULD YOU HAVE DONE?" (CAREER & WHAT-IF ENGINE)       |
|                                                                         |
|  💡 Career Leap Opportunity:                                            |
|  "You stayed 7 years in Junior Specialist. Enrolling in a 3-month       |
|  Bootcamp at Age 26 and job hopping would have earned an estimated     |
|  +₹32,00,000 in additional lifetime income!"                            |
|                                                                         |
|  💡 Debt Avoidance:                                                     |
|  "By choosing not to take a personal loan for vacation, you saved       |
|  ₹38,000 in interest charges."                                          |
|                                                                         |
|  ---------------------------------------------------------------------  |
|                                                                         |
|  SECTION 3: ASSET ALLOCATION SUITABILITY AUDIT                          |
|                                                                         |
|  🛡️ Emergency Fund: Kept in Liquid Savings (4%)                        |
|  • Verdict: 🟢 Optimal! Instant access with zero market risk.           |
|                                                                         |
|  🌴 Retirement Corpus: Kept in Equity Mutual Funds (12%)                |
|  • Verdict: 🟢 Optimal! Long horizon absorbed market volatility and     |
|    compounded to ₹2.10 Cr.                                              |
|                                                                         |
+-------------------------------------------------------------------------+
|  [ 🔁 PLAY AGAIN (SAME SEED) ]     [ 🎲 ROLL NEW LIFE ]                 |
+-------------------------------------------------------------------------+
```

---

## 3. UI Sections & Interaction Details

1. **Grade Hero Banner**:
   - Displays Letter Grade (`A+`, `A`, `B`, `C`, `D`, `F`), Score `/100`, and Narrative Title.
   - Summarizes retirement sustainability: **Net Worth**, **Monthly Passive Income (4% Rule)**, and **Living Expense Coverage Ratio**.

2. **Milestone & Decision Cards**:
   - For every life milestone:
     - Badge: `Filled Early (+N mos)`, `On-Time`, or `Shortfall (-₹X)`.
     - Details on how shortfall was resolved (Loan, Emergency Buffer, or Postponed).
     - **Clear Educational Verdict**: Plain-language assessment explaining whether postponing or taking the loan was a good or bad financial choice for the character.

3. **Career & Counterfactuals Tab ("What You Could Have Done")**:
   - Highlights actionable financial lessons from the simulation:
     - Missed earnings from career stagnation.
     - Upskilling returns (course fee vs. lifelong salary gains).
     - Debt cost vs. disciplined savings comparison.

4. **Asset Suitability Tab**:
   - Audits whether instruments were matched properly to time horizons:
     - Flags placing Emergency Fund in FD (lock-in/penalties) or Equities (crash risk).
     - Flags keeping 30-year retirement funds in low-yield savings.

5. **Action Controls**:
   - **Play Again (Same Seed)**: Re-runs the exact same life scenario so the player can test if upskilling earlier or changing their asset mix produces a higher grade.
   - **Roll New Life**: Resets save state and begins a new character.
