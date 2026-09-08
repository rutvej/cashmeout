# Scenarios: Career & Professional Events

This document details all potential career, workplace, promotion, appraisal, and employment transition cards in CashFlow Life Sim.

---

### [CAR-001] Inbound Headhunter Inquiry: Competitive Analyst
- **Trigger:** Resume Score ≥ 40, Years in current role ≥ 1.0.
- **Frequency:** Random (15% chance per quarter).
- **Prompt:** *"A headhunter reaches out on LinkedIn. A fintech competitor is expanding their research desk and wants to interview you."*
- **Choices:**
  - **A: Schedule the interview** → Takes 1 time slot this week. 70% chance of receiving formal job offer ($3,600/mo, +25% salary bump).
  - **B: Decline politely** → Stay with current firm. +5 loyalty rating with current manager.
- **Behavioral Impact:** Choice A decreases `lateNightWorkCounter` if new job has better culture.
- **Financial Impact:** Potential increase from $2,800 to $3,600/mo.

---

### [CAR-002] The Annual Performance Appraisal: Merit Review
- **Trigger:** Exactly Day 360, 720, 1080... (Every 12 months at same company).
- **Frequency:** Mandatory Annual Event.
- **Prompt:** *"Your annual performance evaluation is scheduled. Your manager reviews your attendance, late-night contributions, and work quality."*
- **Choices:**
  - **A: Accept standard company raise (6%)** → Salary adjusts upward. No friction.
  - **B: Aggressively counter-offer for a 15% raise** → If Resume Score > 55, succeeds (+15% salary, +5 respect). If fails, keeps 6% raise, but manager relationship cools (-5 mental health).
- **Financial Impact:** Base salary scales by 6% to 15%.

---

### [CAR-003] The Overtime Crunch: Emergency Client Delivery
- **Trigger:** Company `overtimeFrequency` roll succeeds.
- **Frequency:** High in Consulting / Startups; Rare in Government / Established firms.
- **Prompt:** *"A major enterprise client moved the deadline forward. The team lead asks everyone to stay until 10:30 PM tonight."*
- **Choices:**
  - **A: Stay late and deliver** → Gym slot cancelled for today; sleep reduced to 5.5 hours. Manager praises your dedication (+10 internal promotion points).
  - **B: Log off on time (Enforce work-life boundary)** → Attend gym, protect sleep. Manager notes lack of commitment (-8 internal review score).
- **Behavioral Impact:** Choice A adds +1.5 `lateNightWorkCounter`, +1.5 `gymSkipCounter`, +2.0 `sleepDebtCounter`.
- **Health Impact:** Choice A deals -8 Energy, -4 Mental Health.

---

### [CAR-004] Corporate Downsizing: Division Restructuring
- **Trigger:** Economic Recession phase OR company `layoffRisk` triggers.
- **Frequency:** Rare during bull markets (3%), Common in severe recessions (25%).
- **Prompt:** *"Due to macroeconomic headwinds and quarterly losses, leadership announces immediate workforce reductions. Your desk is affected."*
- **Choices:**
  - **A: Accept severance package and file for benefits** → Receive 1.5 months salary lump sum. Employment status changes to Unemployed.
  - **B: Inquire about internal transfer to Operations Desk** → 40% chance of staying employed at 15% lower salary. If fails, exit with standard severance.
- **Financial Impact:** Loss of primary monthly income; emergency fund timer begins.

---

### [CAR-005] Executive Certification Sponsorship
- **Trigger:** Employed for ≥ 2 consecutive years, Performance Rating ★★★★☆.
- **Frequency:** Occasional.
- **Prompt:** *"Your employer offers a 50% tuition subsidy for an accredited Financial Modeling or Cloud Architecture master-class."*
- **Choices:**
  - **A: Co-fund and enroll ($1,500 personal outlay)** → Spends $1,500 cash; dedicates 1 daily study slot for 30 days; adds certification to Resume.
  - **B: Pass on the opportunity** → Keep cash liquid; no time commitment.
- **Behavioral Impact:** Choice A reinforces discipline.

---

### [CAR-006] Startup Stock Option Poach
- **Trigger:** Year 3+, Resume Score ≥ 50.
- **Frequency:** Random (10% chance per year).
- **Prompt:** *"A venture-backed AI startup invites you to join as an early lead. Cash salary is 20% lower, but grants 0.5% equity options."*
- **Choices:**
  - **A: Take the high-risk bet** → Salary drops by 20%; receives startup equity ticket (50% chance of zero, 10% chance of $50k+ exit in Year 9).
  - **B: Reject and stay in corporate stability** → Retain predictable cashflow and benefits.

---

### [CAR-007] Toxic Manager Micromanagement
- **Trigger:** Company Culture ≤ ★★☆☆☆, employed > 6 months.
- **Frequency:** Recurring every 60–90 days.
- **Prompt:** *"Your supervisor demands daily microscopic status reports and questions every 15-minute calendar entry."*
- **Choices:**
  - **A: Endure and absorb the stress** → -10 Mental Health, -5 Happiness.
  - **B: Confront respectfully with HR** → 50% chance manager backs off; 50% chance friction worsens and triggers layoff watch.
  - **C: Immediately start applying on Job Board** → Opens Job Board with bonus motivation.

---

### [CAR-008] Unplanned Fast-Track Promotion
- **Trigger:** Senior colleague abruptly resigns, Player has completed prerequisite course.
- **Frequency:** Rare (8% chance).
- **Prompt:** *"Your department head abruptly departed for a competitor. Leadership asks you to step up as Interim Department Lead."*
- **Choices:**
  - **A: Accept promotion and leadership burden** → Immediate +$1,500/mo salary increase; +2 work slots/day; daily stress +1.5.
  - **B: Decline and maintain current scope** → Preserve personal schedule; salary unchanged.

---

### [CAR-009] The Counter-Offer Dilemma
- **Trigger:** Player accepts an external offer from the Job Board.
- **Frequency:** Triggered during 30-day resignation notice.
- **Prompt:** *"Upon receiving your resignation, your current company offers an immediate matching salary raise and a promise of better work-life balance."*
- **Choices:**
  - **A: Accept counter-offer and stay** → Retain tenure; salary jumps +25%; 30% chance culture promises are broken after 6 months.
  - **B: Leave anyway for the fresh start** → Join new company as planned.

---

### [CAR-010] Job Application Rejection: Overqualified
- **Trigger:** Applying for a Mid-tier role with a Senior-tier resume score.
- **Frequency:** Conditional upon application.
- **Prompt:** *"Application Status: XYZ Corp has declined your submission: 'We feel this role would not offer sufficient challenge for someone with your credentials.'"*
- **Choices:**
  - **A: Acknowledge and target higher-level roles** → +2 Mental resilience.
