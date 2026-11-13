# Screen 5: Main Game Simulation Dashboard (`specs/screens/05-screen-main-game.md`)

## 1. Purpose & User Objective
The Main Game Dashboard is the central live interface where the player watches their financial life unfold across their career (Age 23 to 60). 

Designed with modern fintech clarity (inspired by CRED / Apple Wallet), the screen maximizes focus on the player's core wealth pulse—**Net Worth**, **Monthly Net Surplus**, and **Active Goal Progress**—while tucking complex secondary controls and hubs behind a clean **Hamburger Menu (`☰`)** and **Floating Simulation Dock**.

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-------------------------------------------------------------+
| 👤 Age 24 (Yr 1, M1)      Net Worth: ₹4,85,000         [ ☰ ] |
| ------------------- Career Timeline (37% to Age 60) ------  |
+-------------------------------------------------------------+
|                                                             |
|  ┌───────────────────────────────────────────────────────┐  |
|  │  MONTHLY CASHFLOW PULSE                               │  |
|  │  Inflow: ₹72,000   •   Outflow: ₹48,000               │  |
|  │  Surplus to Goals: +₹24,000/mo                 [ ℹ️ ]  │  |
|  └───────────────────────────────────────────────────────┘  |
|                                                             |
|  🎯 ACTIVE LIFE GOALS (4)                                   |
|  ┌───────────────────────────────────────────────────────┐  |
|  │ 🛡️ Emergency Fund                       [100% Full]  │  |
|  │ ₹3.15L / ₹3.15L  (SIP ₹5,000 cascading to Car)        │  |
|  └───────────────────────────────────────────────────────┘  |
|  ┌───────────────────────────────────────────────────────┐  |
|  │ 🚗 Buy First Car                        Target: Age 27│  |
|  │ ₹4.80L / ₹6.50L  [████████████░░░] 74%                │  |
|  └───────────────────────────────────────────────────────┘  |
|  ┌───────────────────────────────────────────────────────┐  |
|  │ 🌴 Retirement Corpus                    Target: Age 60│  |
|  │ ₹14.20L / ₹1.58 Cr  [███░░░░░░░░░] 9%                 │  |
|  └───────────────────────────────────────────────────────┘  |
|                                                             |
|  [ FLOATING SIMULATION DOCK ]                               |
|  [ ▶ PLAY ]   Speed: [ 1x | 2x | 5x ]         Bank: ₹82,000 |
+-------------------------------------------------------------+
```

---

## 3. The Hamburger Menu (`☰`) Drawer

Tapping `☰` opens a slide-over drawer (or bottom sheet on mobile) containing secondary actions and settings:

```
┌──────────────────────────────────────────────┐
│  ⚙️ FINANCIAL COMMAND & LIFE DECISIONS    [✕] │
├──────────────────────────────────────────────┤
│                                              │
│  💼 CAREER & INCOME                          │
│  • 🎓 Upskill Hub      (Boost skill rating)   │
│  • 💼 Job Market       (Explore +30% raises) │
│  • 🏢 View Career Profile & CTC Breakdown     │
│                                              │
│  🚀 WEALTH ENGINES                           │
│  • ➕ Launch New Venture / Side Hustle        │
│  • ⚙️ Rebalance SIP Allocations & Redirection │
│  • 📊 Active Businesses & Real Estate Assets │
│                                              │
│  🛡️ PROTECTION & LIABILITIES                 │
│  • 💳 Debt & Loan Prepayment Manager         │
│  • 🛡️ Insurance Policies (Health & Term)     │
│  • 📋 Itemized Monthly Outflow Ledger        │
│  • 💍 Household & Partner Economics (if wed) │
│                                              │
│  ⚡ SIMULATION SETTINGS                       │
│  • ✈️ Annual Vacation Mode:  [ Auto | Manual ]│
│  • ⏱️ Simulation Speed:      [ 1x | 2x | 5x ] │
│  • 💾 Storage:               Auto-Saved (DB) │
│  • 🔄 Walkthrough Voice-Over Tour Demo       │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 4. UI Controls & User Interactions

1. **Top Command Bar:**
   - **Age Progress Ring:** Circular visual indicator showing age and career completion towards Age 60.
   - **Net Worth Hero:** Bold, high-contrast counter computing $(\text{Goal Assets} + \text{Liquid Bank Cash} + \text{Real Estate}) - \text{Debts}$.
   - **Hamburger Menu Button (`☰`):** Toggles the Life Decisions & Settings Drawer.

2. **Cashflow Pulse Card:**
   - Summarizes Inflow, Outflow, and Net Monthly Surplus in one unified card.
   - Includes quick `[ ℹ️ Ledger ]` toggle to view the itemized breakdown (rent, car upkeep, home maintenance, spouse expenses, EMIs).

3. **Goal Progress Cards:**
   - Prominently displays active compounding buckets with percentage rings, remaining targets, and cascading SIP waterfall indicators.
   - Toggles to filter or inspect completed goals.

4. **Floating Simulation Dock (Mobile Thumb Zone):**
   - **Play/Pause Toggle:** Prominent thumb button (Green when running, Amber when paused).
   - **Speed Selector:** Segmented toggle (`1x`, `2x`, `5x`).
   - **Bank Cash Display:** Quick glance at available liquid cash.

5. **Integrated Voice-Over Tour:**
   - Accessible via the Hamburger Menu or onboarding prompt: Launches an interactive mobile screen demo with spoken narration walking through each UI section.

---

## 5. Event & Milestone Overlays (Auto-Pause)
Whenever a milestone or event occurs, the game automatically pauses and presents a dedicated modal:
1. **Annual Vacation Celebration Modal:** Appears at month 12. Displays trip photos/graphics, resets corpus, and offers package selection for next year.
2. **Salary Raise Modal:** Appears at month 12 anniversary. Shows $+X\%$ hike and lets player allocate the new surplus.
3. **Milestone Achievement Modal:** Appears at Target Age for Car, Marriage, or Home Down Payment.
4. **Random Life Event Modal:** Appears if a random medical, car repair, or bonus event occurs.

---

## 6. Exit Criteria & Navigation
- **Next Screen:** Screen 6 (`scorecard`).
- **Trigger:** Character reaches Age 60 (`currentAge >= retirementAge`).
- **Global Store Mutation:**
  - `currentScreen: 'scorecard'`
