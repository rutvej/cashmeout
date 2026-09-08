# Scenarios: Financial & Cashflow Events

This document details random cashflow, liquidity, banking, windfall, and debt-servicing events in CashFlow Life Sim.

---

### [FIN-001] Unexpected Vehicle Alternator Breakdown
- **Trigger:** Player owns a car or scooter; random probability (12% annually).
- **Prompt:** *"Your vehicle fails to turn over during the morning rush. The towing mechanic reports a burned-out alternator and battery."*
- **Choices:**
  - **A: Pay cash from checking ($650)** → Instant deduction; commute restored tomorrow.
  - **B: Charge to high-interest credit card** → If liquid cash is zero; adds $650 to revolving balance @ 24% APR.
  - **C: Abandon car and switch to bicycle for the month** → Avoids repair for now; commute time increases by +1 slot/day.
- **Financial Impact:** -$650 one-off.

---

### [FIN-002] Discretionary Performance Windfall / Year-End Bonus
- **Trigger:** Company has strong quarterly performance; Month 12.
- **Prompt:** *"Corporate leadership rewards your division with an unannounced cash performance distribution: $2,500!"*
- **Choices:**
  - **A: Deposit 100% into High-Yield Emergency Fund** → Increases cash buffer; reinforces financial safety.
  - **B: Split 50% into Index Fund SIP, 50% into debt paydown** → Accelerates compounding and debt snowball.
  - **C: Splurge on a designer wardrobe & luxury electronics weekend** → -$2,500 cash; +25 Happiness; increases `impulseBuyCounter` by +2.0.
- **Behavioral Impact:** Choice C triggers future lifestyle creep.

---

### [FIN-003] Missed EMI Payment Warning
- **Trigger:** Cash in checking < total monthly scheduled loan EMIs on Day 1.
- **Prompt:** *"Automatic Debit Failed: Insufficient funds to clear your monthly car loan payment ($380). The bank levies an overdraft fee."*
- **Choices:**
  - **A: Liquidate emergency savings immediately to settle ($380 + $45 penalty)** → Clears loan; credit score suffers minor 10-point dip.
  - **B: Ignore until next paycheck** → Credit score drops by -45 points; bank forwards account to collections desk.

---

### [FIN-004] Pre-Approved Unsecured Consumer Loan Offer
- **Trigger:** Credit Score ≥ 720, steady employment > 1 year.
- **Prompt:** *"Your bank's mobile app notifies you: 'Congratulations! You are pre-approved for an instant $10,000 personal loan at 11% APR.'"*
- **Choices:**
  - **A: Dismiss notification** → Maintain zero consumer debt.
  - **B: Accept loan to fund speculative crypto / luxury travel** → Injects $10,000 liquid cash; creates a mandatory **$325/mo EMI obligation** for 36 months.
- **Behavioral Impact:** Choice B spikes `impulseBuyCounter` and adds immediate cashflow friction.

---

### [FIN-005] Peer Financial Assistance Request: Close Friend
- **Trigger:** Year 2+, Friend NPC (e.g., Aarav or Kabir) faces cash crunch.
- **Prompt:** *"Your friend reaches out in distress: their freelance client failed to pay, and they cannot make rent. They ask to borrow $1,200."*
- **Choices:**
  - **A: Lend the money without formal contract** → -$1,200 from cash. 50% chance friend repays in 6 months; 50% chance money is lost and friendship strained.
  - **B: Offer a smaller non-repayable gift ($250)** → Helps friend within personal safety limit; preserves friendship.
  - **C: Decline politely, citing strict personal financial rules** → -$5 Happiness; zero financial loss.

---

### [FIN-006] Smartphone Screen Shatter & Replacement
- **Trigger:** Random (15% annual chance).
- **Prompt:** *"Your smartphone slips from your pocket onto concrete, shattering the display completely."*
- **Choices:**
  - **A: Repair display at third-party kiosk ($180)** → Practical fix; phone restored.
  - **B: Upgrade to latest flagship model on 24-month financing ($1,200)** → Adds $50/mo to recurring phone bills; increases `lifestyleCreepCounter`.

---

### [FIN-007] Annual Tax Assessment Shock
- **Trigger:** Year-End Tax Audit; player neglected tax provisioning on Salary Day.
- **Prompt:** *"Internal Revenue Notice: Based on capital gains and salary adjustments, you owe an outstanding tax liability of $2,100 within 14 days."*
- **Choices:**
  - **A: Pay from liquid reserves** → -$2,100; clears tax liability cleanly.
  - **B: Request an installment payment plan (+12% statutory interest)** → Adds $190/mo to monthly obligations for 12 months.

---

### [FIN-008] Unclaimed Dividend Reinvestment Credit
- **Trigger:** Holding dividend-paying equities (e.g., ORFOOD, STBANK) for ≥ 180 days.
- **Prompt:** *"Dividend Announcement: Your portfolio generated $140 in quarterly dividends. Reinvest or deposit to checking?"*
- **Choices:**
  - **A: Auto-Reinvest into additional shares (DRIP)** → Compounds share count automatically.
  - **B: Deposit to cash checking account** → +$140 liquid cash.

---

### [FIN-009] Utility Surge & Polar Freeze
- **Trigger:** Winter season (Month 11 or 12).
- **Prompt:** *"Severe cold weather triggers a 70% surge in residential heating consumption. Utility bill jumps from $90 to $280 this month."*
- **Choices:**
  - **A: Absorb higher utility bill (-$280)** → Deducted from checking.
  - **B: Lower thermostat and bundle up** → Deducted -$160; -4 Energy comfort for the week.

---

### [FIN-010] Emergency Fund Milestone: 3 Months Secured
- **Trigger:** Liquid savings balance exceeds 3 months of fixed monthly living expenses for the first time.
- **Prompt:** *"Financial Milestone Reached: Your Emergency Safety Fortress holds $7,200 (3+ months of runway). You are officially immune to minor economic shocks!"*
- **Choices:**
  - **A: Celebrate the milestone and maintain the habit** → +15 Mental Peace; unlocks reduced interest rates on future credit inquiries.
