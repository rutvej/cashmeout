# 05 — Business System

> **Pillar:** Business  
> **Resources Affected:** Money, Time, Health (Mental, Energy)  
> **Unlocks:** Year 1, Day 1 (always available)  
> **Related Specs:** `04-career-system.md`, `06-investment-system.md`, `08-loan-credit-system.md`, `10-tax-system.md`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Starting a Business](#2-starting-a-business)
3. [Business Types Catalog](#3-business-types-catalog)
4. [Monthly Business Review (Salary Day)](#4-monthly-business-review-salary-day)
5. [Business Spending Categories](#5-business-spending-categories)
6. [Scaling Decisions](#6-scaling-decisions)
7. [Business Loans](#7-business-loans)
8. [Time Conflict — Job + Business](#8-time-conflict--job--business)
9. [Job → Side Hustle → Full Business Transition](#9-job--side-hustle--full-business-transition)
10. [Business Health Metrics](#10-business-health-metrics)
11. [Business Failure & Closure](#11-business-failure--closure)
12. [Business Tax](#12-business-tax)
13. [Business → Job Transition (Post-Failure)](#13-business--job-transition-post-failure)

---

## 1. Overview

The Business pillar lets the player create, grow, and eventually sell or close a business venture at any point during the 10-year simulation. Businesses operate on the same monthly cadence as everything else — revenue and costs are settled on **Salary Day (1st of each month)**. The player can hold a job and a business simultaneously, but total **time slots** are the hard constraint that forces real trade-offs.

### Business Lifecycle States

```
NONE → PLANNING → ACTIVE (Side Hustle) → ACTIVE (Full-Time) → [SOLD | CLOSED | FAILED]
```

| State | Description | Job Possible? |
|---|---|---|
| `NONE` | No business | Yes |
| `PLANNING` | Business started this month; no revenue yet | Yes |
| `ACTIVE (Side Hustle)` | Running alongside a job | Yes — if time slots allow |
| `ACTIVE (Full-Time)` | Player quit job or business exceeds 5 slots | No (recommended) |
| `SOLD` | Business sold for lump sum; exits pillar | N/A |
| `CLOSED` | Voluntarily shut down; loans remain | Yes |
| `FAILED` | Forced closure due to bankruptcy | Yes (re-entry path) |

---

## 2. Starting a Business

### Entry Point

The **"Start a Business"** action is accessible at any time via the **Bottom Navigation → Business tab**. It does not require a specific day, career level, or prior event trigger. The player can begin the process on Day 1, Year 1.

### Startup Flow (Modal / Screen Sequence)

```
Step 1: Choose Business Type
        → Shows catalog with startup cost, time slots, risk level

Step 2: Choose Funding Source
        → Personal savings | Bank loan | Personal loan

Step 3: Confirm Time Slot Allocation
        → Visual time grid showing remaining free slots after business

Step 4: Name the Business (optional flavor text)

Step 5: CONFIRM → Deducts startup cost → Enters PLANNING state
```

### Startup Cost Deduction

- Startup cost is deducted **immediately** from cash on hand (or via loan).
- If the player cannot cover startup cost with cash + available loan, the **"Start Business"** button is disabled with tooltip: *"Insufficient funds — consider a startup loan."*
- First month has **no revenue** (PLANNING state). Ops cost is charged at the end of Month 1 on Salary Day.

### Prerequisites

| Business Type | Hard Prerequisite | Soft Bonus |
|---|---|---|
| Food Cart / Tiffin | None | Cooking hobby → +5% revenue |
| Freelancing | 1 relevant course OR 6 months job experience | Each additional course → +10% revenue cap |
| Retail Shop | None | Negotiation course → -5% rent cost |
| E-commerce | None | Digital Marketing course → +15% revenue cap |
| Tutoring Center | 1 Education/Skill course completed | Each additional course → +8% revenue cap |

---

## 3. Business Types Catalog

### 3.1 Summary Table

| Business | Startup Cost | Monthly Ops Cost | Revenue Range / mo | Time Slots | Risk Level | Scalable? |
|---|---|---|---|---|---|---|
| Food Cart / Tiffin | $3,000 | $800 | $2,000 – $5,000 | 4 slots | Medium | Yes (2nd cart) |
| Freelancing | $500 | $200 | $1,500 – $8,000 | 2–4 slots | Low-Medium | Yes (agency) |
| Retail Shop | $15,000 | $3,000 | $5,000 – $12,000 | 6 slots | High | Yes (2nd location) |
| E-commerce | $8,000 | $1,500 | $3,000 – $15,000 | 3 slots | Medium | Yes (warehouse) |
| Tutoring Center | $5,000 | $1,000 | $3,000 – $8,000 | 3 slots | Low | Yes (franchise) |

> **Note:** Revenue figures are **gross** (before ops cost deduction). Net profit = Revenue − Ops Cost − Loan EMI − Tax. Revenue within the stated range is determined monthly by the **Business Health Score** (see §10).

---

### 3.2 Food Cart / Tiffin Service

| Attribute | Value |
|---|---|
| Startup Cost | $3,000 |
| Monthly Ops Cost | $800 (ingredients $400, stall rental $250, packaging $150) |
| Revenue Range | $2,000 – $5,000 / month |
| Time Slots Required | 4 slots (morning + lunch rush) |
| Risk Level | Medium |
| Market Sensitivity | Affected by local events (festival → +30%, rainy season → -15%) |
| Failure Threshold | 3 consecutive months with net loss > $500 triggers **Struggling** flag |

**Revenue Drivers:**
- Location quality (unlockable: premium spot +$500/mo, costs $200 extra)
- Menu variety (invest $300 → unlock new item → +$400 avg revenue)
- Health inspection rating (A → +10%, C → -20%, F → 1-month forced closure)

**Example Event Card — Food Cart:**
```
╔════════════════════════════════════════════════════════╗
║  🍱  HEALTH INSPECTION VISIT                          ║
║                                                        ║
║  The municipal health inspector stopped by your cart   ║
║  today. Your hygiene score: B+                         ║
║                                                        ║
║  Revenue impact: +5% this month                        ║
║  Tip: Upgrade your handwashing station ($150) to       ║
║  guarantee an A rating next time.                      ║
╚════════════════════════════════════════════════════════╝
```

---

### 3.3 Freelancing

| Attribute | Value |
|---|---|
| Startup Cost | $500 (laptop/tools setup) |
| Monthly Ops Cost | $200 (software subscriptions, internet, co-working) |
| Revenue Range | $1,500 – $8,000 / month |
| Time Slots Required | 2–4 slots (player-controlled; more slots = higher revenue ceiling) |
| Risk Level | Low–Medium |
| Prerequisite | 1 relevant course OR 6 months of job experience |

**Slot → Revenue Ceiling Mapping:**

| Time Slots Allocated | Monthly Revenue Ceiling |
|---|---|
| 2 slots | $3,500 |
| 3 slots | $6,000 |
| 4 slots | $8,000 |

**Revenue Drivers:**
- Portfolio score (built by completing projects; max 100 pts)
- Client rating (1–5 stars; affects repeat business rate)
- Niche specialization (e.g., Finance Freelancing requires Accounting course → +25% rate)

**Scaling Path:** Freelancing → **Agency** (hire 1–3 subcontractors, ops cost rises to $800, revenue cap rises to $20,000)

**Example Event Card — Freelancing:**
```
╔════════════════════════════════════════════════════════╗
║  💼  HIGH-VALUE CLIENT INQUIRY                        ║
║                                                        ║
║  A corporate client wants a 3-month retainer          ║
║  contract at $4,500/month.                             ║
║                                                        ║
║  ⚠ Requires 4 time slots this month (currently at 3)  ║
║                                                        ║
║  [Accept — reassign 1 slot]   [Decline]               ║
╚════════════════════════════════════════════════════════╝
```

---

### 3.4 Retail Shop

| Attribute | Value |
|---|---|
| Startup Cost | $15,000 (fit-out, initial inventory, deposit) |
| Monthly Ops Cost | $3,000 (rent $1,500, staff $1,000, utilities $300, misc $200) |
| Revenue Range | $5,000 – $12,000 / month |
| Time Slots Required | 6 slots |
| Risk Level | High |
| Market Sensitivity | Economic cycle has strong effect (recession → revenue floor drops to $2,000) |

**Revenue Drivers:**
- Inventory investment level (spend more → higher avg revenue)
- Foot traffic modifiers (location grade A/B/C)
- Staff count and satisfaction score

> **Warning:** Retail Shop at 6 time slots is effectively **incompatible with full-time employment** (see §8). Players must transition to Full-Time business mode or accept severe health penalties.

**Example Event Card — Retail Shop:**
```
╔════════════════════════════════════════════════════════╗
║  🏪  COMPETITOR OPENS NEARBY                          ║
║                                                        ║
║  A chain store opened 200m from your shop.             ║
║                                                        ║
║  Revenue impact: -$800/month until resolved            ║
║                                                        ║
║  Options:                                              ║
║  [Increase marketing ($300/mo)]                        ║
║  [Pivot product line ($2,000 one-time)]                ║
║  [Do nothing — accept lower revenue]                   ║
╚════════════════════════════════════════════════════════╝
```

---

### 3.5 E-commerce Store

| Attribute | Value |
|---|---|
| Startup Cost | $8,000 (website, initial stock, logistics setup) |
| Monthly Ops Cost | $1,500 (hosting/platform $200, ads $600, shipping/logistics $500, misc $200) |
| Revenue Range | $3,000 – $15,000 / month |
| Time Slots Required | 3 slots |
| Risk Level | Medium |
| Upside | Highest revenue ceiling of all 5 types |

**Revenue Drivers:**
- Ad spend multiplier (marketing budget directly boosts revenue; see §5.4)
- Product-market fit score (increases over 6 months; 0→100)
- Return rate (high returns → ops cost spikes by 10–25%)

**Scaling Path:** Standard store → Warehouse model (adds $1,200/mo ops, unlocks $25,000 revenue cap)

**Example Event Card — E-commerce:**
```
╔════════════════════════════════════════════════════════╗
║  📦  VIRAL PRODUCT MOMENT                             ║
║                                                        ║
║  One of your products got featured in an              ║
║  influencer's post. Traffic spiked 400%.               ║
║                                                        ║
║  This month's revenue: +$6,000 (one-time bonus)       ║
║  ⚠ Inventory running low — restock now?               ║
║                                                        ║
║  [Restock ($1,500)]   [Let it sell out]               ║
╚════════════════════════════════════════════════════════╝
```

---

### 3.6 Tutoring Center

| Attribute | Value |
|---|---|
| Startup Cost | $5,000 (premises setup, materials, registration) |
| Monthly Ops Cost | $1,000 (rent $600, materials $200, admin $200) |
| Revenue Range | $3,000 – $8,000 / month |
| Time Slots Required | 3 slots |
| Risk Level | Low |
| Prerequisite | 1 Education or Skill course completed by player |

**Revenue Drivers:**
- Student enrollment count (max 40 students at base; expands with staff hire)
- Subject breadth (each additional subject requires one more course or a hired tutor)
- Reputation score (word-of-mouth; grows 5 pts/month if satisfaction > 70)

**Example Event Card — Tutoring Center:**
```
╔════════════════════════════════════════════════════════╗
║  📚  EXAM SEASON ENROLLMENT SPIKE                     ║
║                                                        ║
║  Exam season has boosted enrollment requests.          ║
║  You can accept 15 additional students this month.     ║
║                                                        ║
║  Revenue boost: +$1,800 this month                     ║
║  ⚠ Requires 1 extra time slot for 4 weeks             ║
║                                                        ║
║  [Accept (costs 1 slot)]   [Decline]                  ║
╚════════════════════════════════════════════════════════╝
```

---

## 4. Monthly Business Review (Salary Day)

Every **1st of the month**, the game runs the **Business Review** after the personal Salary Day evaluation. This is a dedicated screen/modal presented before returning to the normal day view.

### 4.1 Review Screen Layout

```
┌──────────────────────────────────────────────────────┐
│  📊  MONTHLY BUSINESS REVIEW — [Business Name]       │
│  Month 14 of operation                               │
├──────────────────────────────────────────────────────┤
│  REVENUE                                             │
│    Gross Revenue            +$4,200                  │
│    Business Health Score:   72 / 100                 │
├──────────────────────────────────────────────────────┤
│  COSTS BREAKDOWN                                     │
│    Rent / Location Fee      -$600                    │
│    Inventory / Materials    -$400                    │
│    Staff Wages              -$800                    │
│    Marketing Budget         -$300                    │
│    Loan EMI                 -$180                    │
│    Misc / Ops               -$120                    │
│    TOTAL COSTS              -$2,400                  │
├──────────────────────────────────────────────────────┤
│  NET PROFIT (pre-tax)       +$1,800                  │
│  Business Tax Held (25%)    -$450                    │
│  NET PROFIT (post-tax)      +$1,350                  │
├──────────────────────────────────────────────────────┤
│  RUNNING METRICS                                     │
│    Revenue Trend: ↗ (+8% vs last month)              │
│    Profit Margin: 32%                                │
│    Employee Satisfaction: 74%                        │
│    Consecutive Profitable Months: 5                  │
├──────────────────────────────────────────────────────┤
│  DECISIONS THIS MONTH                                │
│  [Hire Staff]  [Increase Marketing]  [Take a Loan]   │
│  [Scale Up]    [Close Business]                      │
└──────────────────────────────────────────────────────┘
```

### 4.2 Revenue Calculation Formula

```
Gross Revenue = BaseRevenue(BusinessType)
              × BusinessHealthMultiplier       -- (0.5 – 1.4)
              × MarketCycleModifier            -- (see below)
              × RandomVariance                 -- (±10%)
              + MarketingBonus
              + OneTimeEventBonus
```

**Market Cycle Modifiers:**

| Game Year | Cycle | Business Revenue Modifier |
|---|---|---|
| Year 1–3 | Bull Market | ×1.10 |
| Year 4–5 | Correction | ×0.90 |
| Year 5–6 | Recession | ×0.70 |
| Year 6–8 | Recovery | ×1.00 |
| Year 8–10 | New Bull | ×1.20 |

### 4.3 Net Loss Scenario

If `Net Profit (pre-tax) < 0`:
- Loss is deducted from player's personal cash account
- **Struggling flag** applied if loss > $300 for 2 consecutive months
- **Critical flag** applied if loss > $300 for 4 consecutive months → Forced closure event triggered (see §11)

---

## 5. Business Spending Categories

The player can adjust spending in **four controllable categories** each month. Changes take effect on the next Salary Day.

### 5.1 Rent / Location Fee

| Tier | Monthly Cost | Revenue Impact |
|---|---|---|
| Budget Location | Base cost (e.g., $600) | Revenue floor at −15% |
| Standard Location | Base cost × 1.25 | No modifier |
| Premium Location | Base cost × 1.75 | Revenue ceiling +20% |

- Locked for 3 months per tier (lease commitment)
- Breaking a lease early costs **2 months' rent** as penalty

### 5.2 Inventory / Materials

| Spend Level | Monthly Cost | Revenue Impact |
|---|---|---|
| Minimal | 60% of base | Revenue cap at 70% of max |
| Standard | 100% of base | Normal revenue range |
| Overstocked | 140% of base | Revenue cap +10%; risk of write-offs (+5%) |

- Overstocked inventory can result in **write-off events** (lose 20–40% of excess stock value with 15% probability each month)

### 5.3 Employees (Hire / Fire)

**Hire:**
- Each employee costs **$800–$1,200/month** depending on role (junior/senior)
- New hire: +1 effective time slot for business (offloads work)
- New hire: −5 business health score for first month (training overhead)
- Max employees: 3 (base), 6 (after Scale Up — 2nd location)

**Fire:**
- Immediate: −$400 one-time severance payment
- Employee satisfaction drops −15 pts for remaining staff
- Business health score: −8 pts for 1 month

**Employee Satisfaction Effects:**

| Satisfaction Score | Effect |
|---|---|
| 80–100 | +5% revenue; new hire cost reduced $100 |
| 60–79 | Neutral |
| 40–59 | -5% revenue; +10% churn risk per month |
| Below 40 | -15% revenue; employee quit event (50% chance/mo) |

**Raise action:** Pay $150/mo more per employee → +12 satisfaction pts

### 5.4 Marketing Budget

| Monthly Ad Spend | Revenue Boost | Diminishing Returns |
|---|---|---|
| $0 | No boost | — |
| $100–$300 | +5% to +12% | Linear |
| $300–$600 | +12% to +20% | Slightly diminishing |
| $600–$1,000 | +20% to +28% | Strongly diminishing |
| $1,000+ | +28% to +32% (hard cap) | Near-flat |

- E-commerce receives a **1.5× marketing multiplier** (digital-first business)
- Tutoring Center receives a **0.7× marketing multiplier** (word-of-mouth driven)

### 5.5 Loan EMI

- Loan repayments are **fixed** and cannot be adjusted within a given loan
- Displayed separately in the Business Review for transparency
- Can be **prepaid** to reduce outstanding principal (no penalty)
- Missing an EMI: Credit score −25 pts, +$50 late fee, interest on missed payment

---

## 6. Scaling Decisions

Scaling decisions appear in the **Monthly Business Review "Decisions"** panel. Eligibility conditions must be met before an option is shown.

### 6.1 Hire More Staff

| Condition | Available When |
|---|---|
| Min. eligibility | Business has been ACTIVE for 2+ months |
| Revenue threshold | Gross revenue > $3,000/month |
| Cash requirement | $1,500 liquid (first-month wage buffer) |

Effects: +1 business capacity, +1 effective slot freed for player, −5 profit margin (initial), +12% revenue ceiling after 2 months of training.

### 6.2 Increase Marketing Budget

Available at any time. Player sets a new monthly marketing spend. Changes reflect in **next** Salary Day revenue calculation. No minimum eligibility.

### 6.3 Expand to 2nd Location

| Condition | Value |
|---|---|
| Minimum operation time | 12 months active |
| Consecutive profitable months | 6+ |
| Net worth threshold | Player net worth > $30,000 |
| One-time expansion cost | Same as original startup cost |
| Monthly ops cost increase | +70% of current ops cost |
| Revenue ceiling after expansion | +80% of current ceiling |
| Time slots added (player) | +2 (more management needed) |

> **Important:** Expanding to a 2nd location permanently locks the player into **Full-Time Business** mode. They cannot hold a salaried job while managing 2 locations.

### 6.4 Upgrade Equipment / Infrastructure

| Business | Upgrade Type | Cost | Benefit |
|---|---|---|---|
| Food Cart | Commercial kitchen equipment | $2,500 | Revenue ceiling +$800/mo; ops cost -$100/mo |
| Freelancing | Premium software suite | $600 (one-time) | Revenue cap +15%; delivery speed +1 slot freed |
| Retail | POS & inventory system | $3,000 | Ops cost -$200/mo; write-off risk -50% |
| E-commerce | Warehouse automation | $10,000 | Ops cost -$400/mo; return rate -8% |
| Tutoring | Online platform integration | $1,500 | Student cap +25; enables online enrollment |

### 6.5 Convert to Agency / Franchise (Advanced Scaling)

Only available Year 5+ with Business Health Score ≥ 80 for 3+ consecutive months.

| Type | One-Time Setup | Ongoing Benefit |
|---|---|---|
| Freelancing → Agency | $3,000 | Hire up to 3 subcontractors; revenue cap $20,000/mo |
| Tutoring → Franchise | $8,000 | Passive income $1,500/mo per franchise unit (max 3) |
| Food Cart → Mini-Chain | $10,000 | 2nd cart operates semi-autonomously; +$2,000/mo |

---

## 7. Business Loans

### 7.1 Loan Types Comparison

| Loan Type | Interest Rate | Approval | Amount Range | Equity Cost | Availability |
|---|---|---|---|---|---|
| Bank Business Loan | 12% p.a. | 5 business days (5 in-game days) | $5,000 – $50,000 | None | Year 1+ |
| Personal Loan (for Business) | 18% p.a. | Instant | $1,000 – $15,000 | None | Year 1+ |
| Angel Investor | 0% interest + 15–25% equity | 10 days negotiation | $20,000 – $100,000 | 15–25% profit share | Year 5+, Health Score ≥ 70 |
| Venture Capital | 0% interest + 30–40% equity | 20 days negotiation | $100,000+ | 30–40% profit share | Year 7+, Health Score ≥ 85 |

### 7.2 Bank Business Loan (12%, 5-Day Approval)

- Approval based on **credit score** and **business profitability**:

| Credit Score | Business Profitable? | Outcome |
|---|---|---|
| 700–900 | Yes | Approved; full amount |
| 600–699 | Yes | Approved; 80% of requested amount |
| 500–599 | Either | Approved; 60% of requested amount; rate bumped to 14% |
| 350–499 | Either | Rejected |
| Any | No (2+ loss months) | Rejected |

- During the 5-day approval window, the player continues normal gameplay. A **notification** fires on Day 5 with the result.
- EMI is calculated over 24-month default term (configurable: 12, 24, 36 months).

**EMI Formula:**
```
EMI = P × [r(1+r)^n] / [(1+r)^n − 1]
  where:
    P = principal
    r = monthly rate (annual_rate / 12)
    n = number of months
```

**Example:** $10,000 loan at 12% p.a. over 24 months  
→ r = 0.01, n = 24  
→ EMI = $470.73/month  
→ Total repaid = $11,297.52

### 7.3 Personal Loan for Business (18%, Instant)

- No credit check beyond minimum score of 500
- Instant disbursement — funds arrive same day
- Appears in **both** personal loan tracker and business loan section
- Higher rate makes it suitable only for short-term cash crunches

### 7.4 Angel Investor (Year 5+, Equity-Based)

**Unlock condition:** `Game Year ≥ 5 AND Business Health Score ≥ 70 AND consecutive profitable months ≥ 4`

**Negotiation mechanic:**
- Player receives a pitch event with 3 investor profiles (drawn from NPC pool: Aarav, Ananya, Priya)
- Each NPC offers different equity %:

| NPC | Equity Ask | Capital Offered | Special Condition |
|---|---|---|---|
| Aarav Shah | 18% | $35,000 | Requires 2 monthly pitch meetings (−1 slot each) |
| Ananya Iyer | 22% | $50,000 | Hands-off; no conditions |
| Priya Mehta | 15% | $25,000 | Monthly KPI review; miss 2 → equity increases to 25% |

- Equity dilution means `Net Profit to Player = Gross Net Profit × (1 − equity%)` permanently until buyout

**Buyout option:** Player can buy back equity at `3× original capital` amount (e.g., buy back Aarav's 18% for $105,000)

### 7.5 Venture Capital (Year 7+)

- Unlocks only if Business Health Score ≥ 85 for 3+ consecutive months AND net monthly profit > $5,000
- VC funding triggers a special **Pitch Day** scenario (3 in-game days of events)
- Post-VC: Business enters **Hyper-Growth** mode → time slots +3, revenue ceiling doubles, employee count cap raised to 15
- VC exit at Year 10 review: If business valued > $500,000, player receives an **Acquisition Offer** (lump sum) for the Life Report

---

## 8. Time Conflict — Job + Business

### 8.1 The 24-Slot Day

The player has **24 time slots per day** allocated across:
- Sleep: 8 slots (mandatory, non-negotiable)
- Personal care / meals: 2 slots (mandatory)
- **Free slots: 14** (distributed across Career, Business, Investments, Social, Health, Leisure)

### 8.2 Simultaneous Job + Business Budget

| Scenario | Job Slots | Business Slots | Free Remaining | Viable? |
|---|---|---|---|---|
| Entry-Level Job + Freelancing (2 slots) | 8 | 2 | 4 | ✅ Comfortable |
| Mid-Level Job + Food Cart (4 slots) | 9 | 4 | 1 | ⚠ Tight |
| Senior Job + Retail Shop (6 slots) | 9 | 6 | −1 | ❌ Impossible |
| Mid-Level Job + E-commerce (3 slots) | 9 | 3 | 2 | ✅ Manageable |
| Manager + Tutoring (3 slots) | 10 | 3 | 1 | ⚠ Tight |

> Career jobs consume slots based on level:
> - Entry: 8 slots/day → effectively 8 (incl. commute)
> - Mid: 8 slots
> - Senior: 9 slots (extra responsibility)
> - Manager: 10 slots
> - Director/VP: 11 slots

### 8.3 Over-Allocation Consequences

If the player's scheduled slots exceed 14 (free budget):

| Overage | Consequence |
|---|---|
| 1 slot over | Energy −5/month; Mental Health −3/month |
| 2 slots over | Energy −10/month; Mental Health −8/month; Physical −3/month |
| 3+ slots over | **Burnout Risk Event** triggers within 1–3 months |

**Burnout Event Card:**
```
╔════════════════════════════════════════════════════════╗
║  🔥  BURNOUT WARNING                                  ║
║                                                        ║
║  You've been running on fumes for months. Your        ║
║  doctor says you need rest — immediately.              ║
║                                                        ║
║  Energy: 12 / 100 (CRITICAL)                          ║
║  Mental Health: 28 / 100 (CRITICAL)                   ║
║                                                        ║
║  Forced outcome: 1 week sick leave (job) +            ║
║  business revenue -40% this month.                    ║
║                                                        ║
║  [Take medical leave]   ← only option                 ║
╚════════════════════════════════════════════════════════╝
```

### 8.4 Slot Conflict Resolution UI

When starting a business or changing job, the game displays a **Slot Allocation Grid**:

```
[Job: ████████░░░░░░] 8/14 slots
[Business: ████░░░░░░░░] 4/14 slots
[Free: ██░░░░░░░░░░░░] 2/14 slots remaining
```

If total > 14, a **red warning banner** appears: *"Over-allocated! Reduce business hours or consider leaving your job."*

---

## 9. Job → Side Hustle → Full Business Transition

### 9.1 Transition Stages

```
Stage 1: JOB ONLY
  └─ Player holds a salary job, no business

Stage 2: JOB + SIDE HUSTLE
  └─ Business active, time slots still balanced (≤14)
  └─ Business revenue < salary

Stage 3: CROSSOVER POINT
  └─ Business net revenue > salary for 3 consecutive months
  └─ Milestone Event fires

Stage 4: FULL-TIME BUSINESS
  └─ Player quits job (prompted) or gets fired (if over-allocated)
  └─ Business is primary income
```

### 9.2 Milestone Events

**Milestone 1 — "First Dollar" (Month 1 of Business):**
```
╔════════════════════════════════════════════════════════╗
║  🎉  YOUR FIRST BUSINESS REVENUE!                     ║
║                                                        ║
║  You earned your first $1,200 from [Business Name].   ║
║  It's not much — but you built it yourself.            ║
║                                                        ║
║  Mental Health +5   |   Motivation unlocked           ║
╚════════════════════════════════════════════════════════╝
```

**Milestone 2 — "Break-Even" (First month net profit > $0 after ops costs):**
- Notification: *"Your business is officially profitable!"*
- Unlocks: Bank Business Loan eligibility

**Milestone 3 — "Side Hustle Surpasses Salary":**
```
╔════════════════════════════════════════════════════════╗
║  🚀  YOUR BUSINESS EARNS MORE THAN YOUR JOB          ║
║                                                        ║
║  For 3 months running, [Business Name] has paid       ║
║  you more than your $3,200 salary.                    ║
║                                                        ║
║  This month's business net profit: $3,800             ║
║                                                        ║
║  Decision time:                                       ║
║  [Quit your job — go full-time on business]           ║
║  [Keep both for now — manage the risk]                ║
╚════════════════════════════════════════════════════════╝
```

**Milestone 4 — "Full-Time Entrepreneur" (after quitting job):**
- Unlocks: Angel investor pitch, scaling options
- Adds business-specific NPC introductions (Aarav, Ananya)
- Life Report category "Entrepreneur" track becomes available

### 9.3 Quitting Job to Go Full-Time

| Action | Consequence |
|---|---|
| Voluntary quit | Standard exit; no penalty; job history preserved |
| Quit mid-probation (< 3 months on job) | −20 pts reputation; future job re-entry harder |
| Quit Director/VP level job | Significant opportunity cost noted in Life Report |
| Return to job (if business fails later) | Resume at same career level − 1 rung; see §13 |

---

## 10. Business Health Metrics

### 10.1 Business Health Score (BHS)

The **Business Health Score** is a single 0–100 composite metric that determines where within the revenue range the business actually lands each month.

```
BHS = (Revenue Trend Score × 0.30)
    + (Profit Margin Score × 0.25)
    + (Employee Satisfaction Score × 0.20)
    + (Marketing Effectiveness Score × 0.15)
    + (Operational Consistency Score × 0.10)
```

| BHS Range | Revenue Position | Label |
|---|---|---|
| 85–100 | Revenue ceiling (max of range) | 🟢 Thriving |
| 65–84 | 70–90% of ceiling | 🟡 Healthy |
| 45–64 | 40–70% of ceiling | 🟠 Struggling |
| 25–44 | Floor to 40% of ceiling | 🔴 At Risk |
| 0–24 | Below floor (net loss territory) | 💀 Critical |

### 10.2 Revenue Trend Score

Calculated over the last 3 months:

| Pattern | Score |
|---|---|
| Revenue growing > 10% month-over-month | 90–100 |
| Revenue growing 1–10% | 70–89 |
| Revenue flat (±1%) | 50–69 |
| Revenue declining 1–10% | 30–49 |
| Revenue declining > 10% | 0–29 |

### 10.3 Profit Margin Score

```
Profit Margin = (Net Profit / Gross Revenue) × 100

Score = clamp(Profit Margin × 2.5, 0, 100)
```

Example: 32% margin → Score = 80

### 10.4 Employee Satisfaction Score

- Starts at 70 on hire
- Adjusted monthly by: wages (above/below market), workload (slot count), raise events, fire events
- Displayed as a direct 0–100 score in the Business Review

### 10.5 Marketing Effectiveness Score

- Tracks the ratio of `(Revenue attributed to marketing) / (Marketing spend)`
- Returns ≥ 3× spend → Score 80–100
- Returns 1–3× → Score 40–79
- Returns < 1× → Score 0–39

### 10.6 Operational Consistency Score

| Factor | Points |
|---|---|
| No missed loan EMIs this month | +20 |
| No inventory stockout events | +20 |
| Health/compliance inspection passed | +20 |
| No employee quit events | +20 |
| Business open all 30 days (no forced closures) | +20 |

---

## 11. Business Failure & Closure

### 11.1 Voluntary Closure

The player can close the business at **any time** from the Business Review screen or the Business tab in the bottom nav.

**Closure Checklist (shown to player):**
```
┌──────────────────────────────────────────────────────┐
│  🚪  CLOSE [Business Name]?                          │
│                                                      │
│  ✅  Remaining inventory liquidated at 40% value     │
│      → +$480 cash recovered                         │
│  ⚠   Outstanding bank loan: $6,200 (continues)      │
│  ⚠   1 employee severance: -$400                    │
│  ℹ   Time slots freed: +4                           │
│  ℹ   Business tax filing required next quarter      │
│                                                      │
│  [Confirm Closure]   [Cancel]                        │
└──────────────────────────────────────────────────────┘
```

**Post-closure rules:**
- Outstanding loans **do not disappear**. They transfer to the personal loan tracker and continue accruing interest.
- Inventory is sold at **40% liquidation value** (not full retail value).
- Any rented premises: player pays a **break-lease penalty** = 1 month rent unless given 30-day notice (i.e., decided on Day 1 of prior month).

### 11.2 Forced Failure (Bankruptcy Path)

Triggered when **4 consecutive months of net loss > $300** and player takes no corrective action.

**Forced Failure Event:**
```
╔════════════════════════════════════════════════════════╗
║  💸  BUSINESS BANKRUPTCY                              ║
║                                                        ║
║  [Business Name] has run out of runway.               ║
║  You could not cover operating costs this month.      ║
║                                                        ║
║  Consequences:                                         ║
║  • Business permanently closed                         ║
║  • Remaining loan: $8,400 → personal liability         ║
║  • Credit score: −60 pts                               ║
║  • Mental Health: −20 pts                              ║
║  • All employees automatically terminated              ║
║    (no severance — bankruptcy protection)              ║
║                                                        ║
║  [Continue]                                            ║
╚════════════════════════════════════════════════════════╝
```

**Bankruptcy Aftermath:**
| Impact | Value |
|---|---|
| Credit score penalty | −60 pts (applied immediately) |
| Mental Health | −20 pts |
| Energy | −10 pts |
| Loan liability | Transferred to personal account |
| Job re-entry cooldown | 0 days (can apply immediately) |
| Future business cooldown | 6 months before new business can be started |

### 11.3 "Lessons Learned" Event

Fires 1 month after any closure (voluntary or forced). One-time event.

```
╔════════════════════════════════════════════════════════╗
║  📖  LESSONS LEARNED                                  ║
║                                                        ║
║  Looking back on [Business Name], you've grown.       ║
║                                                        ║
║  What you gained:                                     ║
║  • Business Management XP: +30 pts                    ║
║  • Unlocked: "Experienced Founder" trait              ║
║  • Next business: Startup cost −10%                   ║
║  • Freelancing rate premium: +$200/mo base            ║
║                                                        ║
║  Failure isn't final — it's data.                     ║
╚════════════════════════════════════════════════════════╝
```

**"Experienced Founder" trait effects (permanent, stacks up to 2×):**
- Startup cost for next business: −10%
- First 3 months: Business Health Score floor = 30 (not 0)
- Angel investor negotiation: equity ask reduced by 2%

---

## 12. Business Tax

> **Important:** Business income is taxed **separately** from personal employment income. The two pools do not merge for tax purposes until the Life Report final calculation.

### 12.1 Quarterly Business Tax Filing

Business tax is filed every **3 months** (Month 3, 6, 9, 12 of every game year). The filing happens automatically on the Salary Day of the filing month.

**Tax quarters:**

| Quarter | Filing Month | Covers |
|---|---|---|
| Q1 | Month 3 | Months 1–3 |
| Q2 | Month 6 | Months 4–6 |
| Q3 | Month 9 | Months 7–9 |
| Q4 | Month 12 | Months 10–12 |

### 12.2 Business Tax Brackets

Business net profit (pre-tax) is taxed at a flat progressive rate:

| Quarterly Net Profit | Tax Rate |
|---|---|
| $0 – $3,000 | 15% |
| $3,001 – $7,500 | 22% |
| $7,501 – $15,000 | 28% |
| $15,001+ | 35% |

> These are **quarterly** thresholds, not annual. A business earning $5,000/month net → $15,000/quarter → taxed at 28%.

### 12.3 Monthly Tax Holdback

To prevent surprise tax bills, the game **automatically withholds 25% of monthly net profit** into a virtual "Tax Reserve" account (non-spendable). On quarterly filing day:
- If actual tax owed < reserve: **refund** the difference to player cash
- If actual tax owed > reserve: **shortfall** charged from player cash (can cause cash crisis if business was overly optimistic)

**Example:**
```
Q1 Net Profit:   $9,000 (3 months × $3,000/mo)
Tax Rate:        28%
Tax Owed:        $2,520
Tax Held (25%):  $2,250
Shortfall:       $270 charged on filing day
```

### 12.4 Tax Deductions

Players can reduce taxable business income through legitimate deductions:

| Deduction | Max Deductible | Condition |
|---|---|---|
| Equipment purchase | 100% in first year | One-time hardware/tools |
| Home office (for freelancers) | $200/month | Freelancing only |
| Course / training for business | 100% of course cost | Must be business-relevant |
| Vehicle (if used for delivery) | $150/month | Food Cart, E-commerce only |
| Loan interest paid | 100% of interest component | All business loan types |

Deductions are applied automatically when the qualifying action is taken. The tax filing screen shows a **Deductions Applied** line item.

### 12.5 Late / Missed Filing Penalty

If the player has no cash to cover the tax shortfall on filing day:
- First offense: $150 flat penalty; tax debt carried forward with 1.5% monthly interest
- Second offense: $300 penalty + credit score −15
- Third offense: Business operations suspended for 1 month (revenue $0, costs continue)

---

## 13. Business → Job Transition (Post-Failure)

When a business closes (voluntary or forced), the player may re-enter the job market. This section defines the re-entry rules and friction points.

### 13.1 Re-Entry Career Level

| Business Operation Duration | Job Gap | Re-Entry Career Level |
|---|---|---|
| < 6 months | Any | Same level as when they left |
| 6–18 months | Any | Same level − 1 rung (max) |
| 18+ months | Any | Entry level (market perception: "long gap") |
| Business was profitable for 5+ years | Any | Same level (entrepreneurship recognized) |

> **Tip:** If the player holds a part-time job while running the business (side hustle mode), the "job gap" clock does **not** start. This is the mechanical reward for maintaining employment.

### 13.2 Re-Entry Resume Boost

Entrepreneurial experience is recognized in job applications:
- **"Founder" tag** added to resume → Interview success rate +15%
- **Business Management course equivalency**: If business ran for 12+ months, counts as 1 Management course for career ladder purposes
- **Experienced Founder trait**: Stack with career bonuses — interview panel event may yield a managerial role offer directly

### 13.3 Re-Entry Salary Adjustment

| Business Exit Type | First Job Salary Modifier |
|---|---|
| Sold profitably | +10% vs. market rate (perceived success) |
| Voluntary closure (no loss) | +0% (neutral) |
| Voluntary closure (with loss) | −5% (slight negative signal) |
| Forced bankruptcy | −15% (risk signal to employer) |

### 13.4 Re-Entry Event (NPC-Driven)

One of the NPC characters may refer the player to a job opening, smoothing re-entry:

```
╔════════════════════════════════════════════════════════╗
║  📱  MESSAGE FROM VIKRAM                              ║
║                                                        ║
║  "Hey, heard about the business. Tough break.         ║
║   But my company's hiring a Project Manager.          ║
║   Your experience running [Business Name] is          ║
║   exactly what they want. Want me to refer you?"      ║
║                                                        ║
║  [Accept referral — interview next week]              ║
║  [Decline — I'll find my own path]                    ║
╚════════════════════════════════════════════════════════╝
```

Referral benefit: Skip initial application screen; interview success rate +20%.

### 13.5 Starting a New Business After Failure

- **Voluntary closure:** Can start new business immediately
- **Bankruptcy:** 6-month cooldown before new business allowed
- **"Experienced Founder" trait:** Active and applied to new business (see §11.3)
- Outstanding loans from previous business must be **paid off or reduced to < $2,000** before a new Bank Business Loan can be approved

---

## Appendix A: Business System State Diagram

```
NONE
  │
  │  [Start Business → deduct startup cost]
  ▼
PLANNING (Month 0 — no revenue, ops cost charged)
  │
  │  [Month 1 Salary Day — first revenue received]
  ▼
ACTIVE: Side Hustle ◄──────────────────────────────────────┐
  │                                                         │
  │  [Business net > salary × 3 consecutive months]        │
  ▼                                                         │
  CROSSOVER MILESTONE EVENT                                 │
  │                                                         │
  │  [Quit job]        [Keep both]──────────────────────────┘
  ▼
ACTIVE: Full-Time
  │
  ├──[Sell business]────────────────────► SOLD (lump sum, Life Report)
  │
  ├──[Voluntary close]──────────────────► CLOSED
  │                                          │
  │                                          │ [Lessons Learned event, 1 mo later]
  │                                          ▼
  │                                       Job re-entry possible
  │
  └──[4 consecutive loss months]──────────► FAILED / BANKRUPTCY
                                               │
                                               │ [6-month business cooldown]
                                               ▼
                                            Job re-entry possible
```

---

## Appendix B: NPC Business Interactions Reference

| NPC | Role | Business Interaction |
|---|---|---|
| Aarav Shah | Entrepreneur | Mentor events, angel investor (Year 5+), co-founder proposal |
| Ananya Iyer | Entrepreneur | Partnership opportunities, angel investor (Year 5+) |
| Priya Mehta | Aggressive investor | Angel investor with KPI conditions (Year 5+) |
| Rohan Kapoor | Landlord | Commercial property rentals; negotiated lease discounts |
| Kabir Nair | Cautious saver | Warns against over-leverage; occasionally offers personal loan |
| Vikram Rao | Cautious saver | Job referral post-failure; stable business advice |
| Sneha Pillai | Investor | Business valuation advice pre-sale |
| Neha Sharma | Landlord | 2nd location property for retail/tutoring expansion |

---

## Appendix C: Quick Reference — Business Viability by Year

| Year | Best Business Choice | Why |
|---|---|---|
| 1–2 | Freelancing | Low startup cost, fits alongside Entry/Mid job |
| 2–4 | E-commerce or Food Cart | Growing revenue potential, manageable slots |
| 4–6 | Retail (if cash-rich) or E-commerce scale | Market correction — high-volume buffers decline |
| 5–7 | Seek Angel investment; scale existing | Lock in equity before recession fully lifts |
| 7–10 | VC pitch or prepare for acquisition | New bull market maximizes exit valuation |
