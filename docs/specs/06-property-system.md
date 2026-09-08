# 06 — Property System

> **Pillar:** Property | **Resources Affected:** Money (primary), Time (secondary), Health/Mental (tertiary)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Personal Home Options](#2-personal-home-options)
3. [Renting vs Buying Analysis](#3-renting-vs-buying-analysis)
4. [Mortgage Mechanics](#4-mortgage-mechanics)
5. [Property Equity Calculation](#5-property-equity-calculation)
6. [Property Appreciation](#6-property-appreciation)
7. [Investment Properties](#7-investment-properties)
8. [Property Events](#8-property-events)
9. [Property Sale Mechanics](#9-property-sale-mechanics)
10. [Property Insurance](#10-property-insurance)
11. [Location Strategy & Time Cost](#11-location-strategy--time-cost)
12. [10-Year Rent vs Buy Projection](#12-10-year-rent-vs-buy-projection)
13. [UI & State Summary](#13-ui--state-summary)

---

## 1. System Overview

The Property System governs where the player lives and what real estate they own as investments. It is one of the four core pillars and interacts deeply with the financial engine (mortgage EMIs reduce monthly cash flow), the time system (commute distance consumes daily time slots), and the health system (cramped living or long commutes can degrade Mental and Energy health bars).

### Core Property State

```
PlayerProperty {
  personalHome:       PropertyRecord | null
  isRenting:          boolean
  currentRent:        number          // monthly rent if renting
  rentLastIncreased:  GameMonth
  investments:        PropertyRecord[]  // max 3
  totalEquity:        number          // computed on Salary Day
  totalMortgageDebt:  number          // computed on Salary Day
}

PropertyRecord {
  id:               string
  type:             PropertyType
  purchasePrice:    number
  purchaseMonth:    GameMonth
  currentValue:     number          // updated annually on Jan 1
  mortgageBalance:  number
  monthlyEMI:       number
  downPayment:      number
  isInsured:        boolean
  insuranceTier:    InsuranceTier
  tenantRent:       number          // 0 if personal home
  isVacant:         boolean         // investment only
  maintenanceDue:   boolean
}
```

### When Property Calculations Run

| Event | Trigger |
|---|---|
| EMI deducted | 1st of each month (Salary Day), before income is credited |
| Rent income credited | 1st of each month, after EMI |
| Property value updated | 1st of January each in-game year |
| Equity recalculated | Every Salary Day |
| Vacancy/maintenance events | Random check each month (weighted by property age + event counters) |

---

## 2. Personal Home Options

The player always needs a place to live. If they do not buy, they rent. The personal home choice has **no rental income** but directly affects commute time and, once the player has children, unlocks a space requirement.

### 2.1 Renting Options (Starting State)

When the player rents, they pay a flat monthly cost that rises ~7–8% per year. Renting is the default state at game start.

| Rental Tier | Monthly Cost (Yr 1) | Commute Impact | Notes |
|---|---|---|---|
| Shared room | $250/mo | +2 hr/day | Cramped: −5 Mental Health/mo |
| Studio rental | $380/mo | +1 hr/day | Baseline |
| 1BHK rental | $540/mo | +1 hr/day | Comfortable |
| 2BHK rental | $700/mo | +2 hr/day (suburb) | More space, further out |

> **Rent Creep:** Each in-game January, all rental costs increase by a random draw in `[7%, 8%]`. This is permanent — the player cannot negotiate it down. Over 10 years a $380/mo studio becomes ~$720/mo.

### 2.2 Buyable Personal Homes

The player may purchase exactly **one** personal home at any time. Purchasing removes the monthly rent payment and replaces it with a fixed EMI. The EMI **never increases**.

---

#### 🏠 Studio Downtown

```
Type:           Studio Downtown
Purchase Price: $38,000
Down Payment:   $7,600  (20%)
Loan Amount:    $30,400
Loan Term:      15 years (180 months)
Monthly EMI:    $290/mo
Commute Impact: Saves commute entirely (0 hr/day added)
Space:          Sufficient for single player
Kids Allowed:   ✗  (player must upgrade if kids arrive)
Appreciation:   3–5%/year
```

**Design Notes:**
- Cheapest entry into homeownership.
- Ideal for early-career players who want to eliminate rent creep while freeing commute time.
- Forces an upgrade event if the player marries + has a child — the engine fires a `HOME_TOO_SMALL` event.
- Downtown location means no commute time penalty, giving back **1 daily time slot** vs a studio rental.

---

#### 🏠 1BHK Near Office

```
Type:           1BHK Near Office
Purchase Price: $65,000
Down Payment:   $13,000  (20%)
Loan Amount:    $52,000
Loan Term:      20 years (240 months)
Monthly EMI:    $495/mo
Commute Impact: Saves 1 hr/day versus baseline (net: −1 hr vs renting suburban)
Space:          Comfortable for couple
Kids Allowed:   ✗  (tight, but manageable for 1 child — see event)
Appreciation:   3–5%/year
```

**Design Notes:**
- Sweet spot for mid-career players.
- Close proximity to office means players recover 1 time slot per day compared to a distant rental.
- If the player has **1 child**, a `CRAMPED_WITH_CHILD` event fires at month 6; if a **second child** arrives it escalates to `MUST_UPGRADE`.

---

#### 🏠 2BHK Suburb

```
Type:           2BHK Suburb
Purchase Price: $45,000
Down Payment:   $9,000  (20%)
Loan Amount:    $36,000
Loan Term:      15 years (180 months)
Monthly EMI:    $342/mo
Commute Impact: +2 hr/day (long commute)
Space:          Spacious
Kids Allowed:   ✓  (up to 2 children)
Appreciation:   3–5%/year
```

**Design Notes:**
- Low purchase price and moderate EMI, but the **+2 hr/day commute tax** costs 2 time slots every day.
- Best for players who prioritize cash flow over time.
- Suburban location means higher Energy drain from commuting: `−3 Energy/day` passive.
- Good "family home" if the player plans on having children but cannot afford the 3BHK.

---

#### 🏠 3BHK Family Home

```
Type:           3BHK Family Home
Purchase Price: $90,000
Down Payment:   $18,000  (20%)
Loan Amount:    $72,000
Loan Term:      25 years (300 months)
Monthly EMI:    $685/mo
Commute Impact: +1 hr/day (medium suburb)
Space:          Large; required once 2+ kids present
Kids Allowed:   ✓  (up to 3 children)
Appreciation:   4–5%/year  (family neighborhoods appreciate faster)
Bonus:          −5% monthly stress when fully furnished (see Furnishing event)
```

**Design Notes:**
- Unlocked/required only when the player has 2+ children. The game will surface this option explicitly.
- Highest EMI, highest appreciation corridor.
- Furnishing the 3BHK costs a one-time $2,000–$5,000 but reduces Mental Health drain from `FAMILY_CHAOS` events.

---

### 2.3 Personal Home Comparison Table

| Property | Price | Down Payment | EMI/mo | Commute Time/day | Kids OK | Yr-10 Approx. Value |
|---|---|---|---|---|---|---|
| Studio Downtown | $38,000 | $7,600 | $290 | 0 hr | ✗ | ~$55,000 |
| 1BHK Near Office | $65,000 | $13,000 | $495 | 0–1 hr | ✗ (1 child OK) | ~$95,000 |
| 2BHK Suburb | $45,000 | $9,000 | $342 | +2 hr | ✓ | ~$65,000 |
| 3BHK Family Home | $90,000 | $18,000 | $685 | +1 hr | ✓✓ | ~$135,000 |

> Values at Year 10 assume 4% average annual appreciation.

---

## 3. Renting vs Buying Analysis

### 3.1 Conceptual Model

Renting is cheap to start but bleeds money long-term via rent creep. Buying locks in a fixed EMI and **builds equity** — every payment chips away at the mortgage balance. The crossover point (where buying becomes cheaper total outlay than renting) occurs roughly at **Year 3–4** for most property types.

### 3.2 Rent Creep Formula

```
rentThisYear = rentYear1 × (1 + annualIncrease) ^ (yearNumber - 1)
annualIncrease: random draw from [0.07, 0.08] each January
```

Example for a $380/mo studio rental:

| Year | Monthly Rent | Annual Rent |
|---|---|---|
| 1 | $380 | $4,560 |
| 2 | $407 | $4,884 |
| 3 | $436 | $5,232 |
| 4 | $467 | $5,604 |
| 5 | $500 | $6,000 |
| 6 | $535 | $6,420 |
| 7 | $573 | $6,876 |
| 8 | $613 | $7,356 |
| 9 | $656 | $7,872 |
| 10 | $703 | $8,436 |
| **Total** | | **$62,240** |

### 3.3 Buying Builds Equity

When the player buys, each EMI payment is split into **principal** (reduces debt, builds equity) and **interest** (gone). Early payments are interest-heavy; later payments are principal-heavy (standard amortization).

```
monthlyInterest  = mortgageBalance × (annualRate / 12)
monthlyPrincipal = EMI - monthlyInterest
mortgageBalance -= monthlyPrincipal
equity           = currentPropertyValue - mortgageBalance
```

> **Key insight for players:** Renting costs more every year. Buying costs the same every year AND transfers wealth from the bank to the player over time.

---

## 4. Mortgage Mechanics

### 4.1 Down Payment Requirement

All property purchases require a **20% down payment** paid upfront from the player's cash balance. If the player cannot afford the down payment, the purchase is blocked.

```
downPayment = purchasePrice × 0.20
loanAmount  = purchasePrice - downPayment

// Check before allowing purchase:
if player.cash < downPayment → PURCHASE_BLOCKED: "Insufficient down payment"
```

### 4.2 Bank Approval Criteria

The bank evaluates two things before approving a mortgage:

#### Salary Check (Debt-to-Income Ratio)

```
totalMonthlyDebt = sum of all existing EMIs (personal + investment)
newEMI           = proposedEMI
proposedDTI      = (totalMonthlyDebt + newEMI) / monthlySalary

if proposedDTI > 0.50 → LOAN_DENIED: "Debt exceeds 50% of income"
```

#### Credit Score Check

| Credit Score Range | Loan Approval | Interest Rate Applied |
|---|---|---|
| 750–900 | ✓ Auto-approved | 6.5% annual |
| 680–749 | ✓ Approved | 7.5% annual |
| 600–679 | ✓ Approved with note | 9.0% annual |
| 500–599 | ⚠ Conditional (requires co-signer NPC) | 11.5% annual |
| 350–499 | ✗ Denied | — |

> **Note:** The interest rate applied at purchase is **locked in for the life of that loan**. Improving credit after purchase does not reduce the interest rate (but affects future mortgages).

### 4.3 Mortgage Interest Rate Impact on EMI

EMI is calculated using the standard amortization formula:

```
r   = annualRate / 12           // monthly rate
n   = loanTermMonths
EMI = loanAmount × [r(1+r)^n] / [(1+r)^n - 1]
```

Example for Studio Downtown ($30,400 loan, 180 months):

| Credit Score | Rate | EMI |
|---|---|---|
| 750+ | 6.5% | $265/mo |
| 680–749 | 7.5% | $282/mo |
| 600–679 | 9.0% | $308/mo |
| 500–599 | 11.5% | $350/mo |

> **Spec uses $290/mo as canonical EMI**, which corresponds to approximately a 7.0% rate. Credit score modifies this upward or downward slightly. The displayed canonical figures are for reference; the engine computes the actual EMI at purchase time.

### 4.4 Refinancing (Late Game Option)

If the player's credit score improves significantly (by ≥100 points) after Year 3, they unlock a **REFINANCE** action. This recalculates the EMI on the remaining balance at the new (lower) interest rate. Refinancing costs a one-time $500 processing fee.

```
if creditScore - scoreAtPurchase >= 100 AND yearsSincePurchase >= 3:
  → unlock REFINANCE action on that property
```

---

## 5. Property Equity Calculation

Equity is the portion of a property that the player truly owns. It is the most important wealth metric in the Property pillar.

### 5.1 Formula

```
propertyEquity = currentMarketValue - remainingMortgageBalance

// At purchase (Year 0):
equity = downPayment  // e.g. $7,600 for Studio Downtown

// Each month, equity increases by:
equityGain = principalPaidThisMonth + monthlyAppreciation
```

### 5.2 Equity Growth Components

There are **two** drivers of equity growth:

| Driver | Description | Certainty |
|---|---|---|
| Mortgage amortization | Each EMI chips away at the balance | Fixed / Certain |
| Property appreciation | Market value rises 3–5%/year | Variable / Random draw |

### 5.3 Worked Example — Studio Downtown Over 5 Years

Assumptions: $38,000 price, $7,600 down payment, $30,400 loan, 7% rate, 180-month term, 4% annual appreciation.

| Year | Market Value | Mortgage Balance | **Equity** | Equity % |
|---|---|---|---|---|
| 0 | $38,000 | $30,400 | **$7,600** | 20% |
| 1 | $39,520 | $29,006 | **$10,514** | 27% |
| 2 | $41,101 | $27,514 | **$13,587** | 33% |
| 3 | $42,745 | $25,918 | **$16,827** | 39% |
| 4 | $44,455 | $24,212 | **$20,243** | 46% |
| 5 | $46,233 | $22,390 | **$23,843** | 52% |

> By Year 5 the player has more than tripled their initial $7,600 investment — even on the cheapest property.

### 5.4 Net Worth Contribution

```
playerNetWorth += sum(all propertyEquity values)
```

Property equity is surfaced on the **Net Worth** dashboard and in the Year 10 Life Report.

---

## 6. Property Appreciation

### 6.1 Annual Appreciation Roll

Every in-game January 1st, each owned property receives an appreciation roll:

```
// Personal homes
appreciationRate = randomFloat(0.03, 0.05)     // 3–5% per year

// Investment properties
appreciationRate = 0.04                         // fixed 4% per year

// 3BHK Family Home (family neighborhood premium)
appreciationRate = randomFloat(0.04, 0.05)      // 4–5% per year

currentValue = currentValue × (1 + appreciationRate)
```

### 6.2 Market Cycle Modifiers

The game's macro market cycle (see Market System spec) applies a multiplier to all property appreciation:

| Market Phase | Years | Property Appreciation Modifier |
|---|---|---|
| Bull Market | 1–3 | ×1.3 (appreciation at upper bound of range) |
| Correction | 4–5 | ×0.5 (appreciation halved, may be near-flat) |
| Recession | 5–6 | ×0.0 to ×0.3 (property values may stagnate or dip −1%) |
| Recovery | 6–8 | ×1.0 (normal range restored) |
| New Bull | 8–10 | ×1.2 (elevated) |

```
adjustedRate = baseRate × cycleModifier
// Floor: property value never drops below 85% of purchase price
currentValue = max(purchasePrice × 0.85, currentValue × (1 + adjustedRate))
```

> **Recession note:** Property values may temporarily fall, but the mortgage balance does not fall with them. This can create negative equity — a powerful negative event trigger.

### 6.3 Negative Equity Event

```
if currentValue < mortgageBalance:
  → trigger NEGATIVE_EQUITY_WARNING event
  → player Mental Health: −5
  → if player tries to sell: SALE_BLOCKED (bank requires payoff of outstanding balance)
```

---

## 7. Investment Properties

The player may own up to **3 investment properties** simultaneously (in addition to their personal home). Investment properties generate passive rental income every month after covering the EMI.

### 7.1 Investment Property Unlocks

| Unlock Condition | Unlocks |
|---|---|
| Any time (cash + credit permitting) | Studio Investment |
| After 1 investment property owned 6+ months | 1BHK Investment |
| After 2 investment properties OR Business revenue > $1,000/mo | Shop Space |

### 7.2 Investment Property Profiles

---

#### 📦 Studio Investment Property

```
Type:           Studio Investment
Purchase Price: $50,000
Down Payment:   $10,000  (20%)
Loan Amount:    $40,000
Loan Term:      20 years
Monthly EMI:    $320/mo
Expected Rent:  $420/mo
Net Passive:    $420 − $320 = $100/mo
Vacancy Risk:   Low (studios rent quickly)
Maintenance:    $30–60/mo average (when triggered)
Appreciation:   4%/year
```

**Income Statement (monthly, when occupied):**

| Line | Amount |
|---|---|
| Rental Income | +$420 |
| EMI | −$320 |
| Maintenance reserve | −$20 (auto-deducted) |
| **Net Cash Flow** | **+$80** |

---

#### 📦 1BHK Investment Property

```
Type:           1BHK Investment
Purchase Price: $65,000
Down Payment:   $13,000  (20%)
Loan Amount:    $52,000
Loan Term:      20 years
Monthly EMI:    $415/mo
Expected Rent:  $540/mo
Net Passive:    $540 − $415 = $125/mo
Vacancy Risk:   Medium
Maintenance:    $40–80/mo average (when triggered)
Appreciation:   4%/year
```

**Income Statement (monthly, when occupied):**

| Line | Amount |
|---|---|
| Rental Income | +$540 |
| EMI | −$415 |
| Maintenance reserve | −$25 (auto-deducted) |
| **Net Cash Flow** | **+$100** |

---

#### 📦 Shop Space

```
Type:           Commercial Shop Space
Purchase Price: $80,000
Down Payment:   $16,000  (20%)
Loan Amount:    $64,000
Loan Term:      20 years
Monthly EMI:    $520/mo
Expected Rent:  $700/mo
Net Passive:    $700 − $520 = $180/mo
Vacancy Risk:   High (commercial spaces take longer to fill)
Maintenance:    $60–120/mo average (when triggered)
Appreciation:   4%/year
Special:        If player owns a Business, they may rent it to themselves at reduced rate ($500/mo)
```

**Income Statement (monthly, when occupied):**

| Line | Amount |
|---|---|
| Rental Income | +$700 |
| EMI | −$520 |
| Maintenance reserve | −$35 (auto-deducted) |
| **Net Cash Flow** | **+$145** |

---

### 7.3 Combined Investment Portfolio Potential

If the player owns all three investment properties simultaneously and all are occupied:

| Property | Net Monthly Cash Flow |
|---|---|
| Studio | +$80 |
| 1BHK | +$100 |
| Shop Space | +$145 |
| **Total Passive Income** | **+$325/mo** |

> This represents a meaningful passive income stream that compounds wealth in the late game.

### 7.4 Investment Property Affordability Gate

Before allowing purchase, the engine checks:

```
// Existing investment EMIs
existingInvestmentEMI = sum(all investment property EMIs)
personalEMI           = personalHome.monthlyEMI or 0

totalDebt = existingInvestmentEMI + personalEMI + proposedEMI
dtiRatio  = totalDebt / monthlySalary

if dtiRatio > 0.50 → INVESTMENT_BLOCKED: "Total debt exceeds 50% of income"
if player.cash < downPayment → INVESTMENT_BLOCKED: "Insufficient down payment"
```

---

## 8. Property Events

Property events are random occurrences that affect cash flow, mental health, and time. Each event has a **counter** that tracks how often it has previously fired on that property. Counters never reset to zero — repeated bad luck compounds difficulty.

### 8.1 Event Probability Engine

```
baseChance    = event.baseMonthlyProbability
adjustedChance = baseChance × (1 + (eventCounter × 0.05))
// Counter adds 5% more probability per previous occurrence
// Max cap: 3× base probability

roll = random(0, 1)
if roll < adjustedChance → fire event
```

### 8.2 Investment Property Events

| Event | Base Monthly Chance | Effect | Counter Behavior |
|---|---|---|---|
| `TENANT_LATE_PAYMENT` | 8% | Rent delayed by 1 month; credited next month | Counter+1 per occurrence |
| `TENANT_NO_PAYMENT` | 4% | Rent lost entirely; Mental −8 | Counter+1; if counter≥3 → `EVICTION_REQUIRED` |
| `EVICTION_REQUIRED` | — (escalation) | Legal cost $800–$1,500; 2–3 month vacancy forced | Counter resets to 1 for new tenant |
| `VACANCY` | 5% (studio), 8% (1BHK), 15% (shop) | No rent income for 1–3 months | Counter+1 |
| `MAINTENANCE_MINOR` | 10% | Cost $150–$400; −1 time slot to handle | Counter+1 |
| `MAINTENANCE_MAJOR` | 4% | Cost $800–$2,500; −2 time slots; Mental −5 | Counter+1 |
| `LEGAL_DISPUTE` | 2% | Legal fees $500–$2,000; Mental −10; +1 time slot/mo for 3 months | Counter+1 |
| `GOOD_TENANT_BONUS` | 6% | Tenant offers 6-month prepay at 5% discount; stable cash flow | Positive event, no counter |
| `APPRECIATION_SPIKE` | 5% (bull market only) | Property value jumps extra 2% beyond normal appreciation | Positive event, no counter |

### 8.3 Personal Home Events

| Event | Base Monthly Chance | Effect |
|---|---|---|
| `HOME_MAINTENANCE` | 6% | Cost $200–$800; −1 time slot |
| `APPLIANCE_BREAKDOWN` | 4% | Cost $300–$1,200; −1 time slot; Energy −5 |
| `HOME_TOO_SMALL` | Triggered by kids | Must upgrade within 3 months or Mental −5/mo |
| `PROPERTY_TAX_BILL` | Annual (January) | 0.8–1.2% of market value due; cannot be avoided |
| `NATURAL_DISASTER` | 1% | If uninsured: $3,000–$15,000 repair; if insured: $200–$500 deductible |
| `NEIGHBORHOOD_UPGRADE` | 3% | Appreciation +1% bonus this year; Mental +5 |
| `NEIGHBOR_DISPUTE` | 3% | Mental −8; possible legal cost $200–$600 |

### 8.4 Uninsured Property Penalty Multiplier

```
if !property.isInsured:
  damageCost         = damageCost × 2.5   // Uninsured pays full repair + penalty
  mentalHealthImpact = impact × 1.5
```

### 8.5 Cascade Risk: No Emergency Fund

If the player has **0 months of emergency fund** when a major property event fires:

```
emergencyFund = 0
→ trigger FINANCIAL_SPIRAL event chain:
   1. Player cannot pay → takes high-interest emergency loan (18% APR)
   2. Credit score drops −25 to −50
   3. Mental Health −15
   4. Next month: increased probability of further property events (counter +2 forced)
```

---

## 9. Property Sale Mechanics

### 9.1 How to Sell

The player may sell any owned property at any time by selecting the **SELL** action. Sale is not instantaneous — it takes **1–2 in-game months** to close.

```
// Timeline:
Month 0: Player initiates sale
Month 1: Property listed (tenant must vacate for investment properties — possible dispute)
Month 2: Sale closes, proceeds deposited
```

### 9.2 Sale Proceeds Calculation

```
salePrice      = currentMarketValue              // engine-set; player may list 5% below for faster sale
agentFee       = salePrice × 0.025               // 2.5% to realtor (always applies)
mortgagePayoff = remainingMortgageBalance
netProceeds    = salePrice - agentFee - mortgagePayoff

if netProceeds < 0:
  → SALE_AT_LOSS: Player must pay the shortfall from cash balance
```

### 9.3 Capital Gains Tax

Capital gains tax applies when the player **profits** on a property sale.

```
capitalGain = salePrice - purchasePrice - agentFee - totalRepairsPaid

// Tax rate depends on how long property was held:
if monthsHeld < 12:
  taxRate = 0.30   // Short-term: taxed as ordinary income rate
else:
  taxRate = 0.15   // Long-term: reduced capital gains rate

capitalGainsTax = max(0, capitalGain × taxRate)
finalProceeds   = netProceeds - capitalGainsTax
```

> **Tax planning tip (surfaced via NPC Rohan):** Holding a property for at least 12 months halves the effective capital gains tax rate.

### 9.4 Sale Scenarios

| Scenario | Sale Price | Purchase Price | Gain/Loss | Tax (held >1yr) | Net Proceeds |
|---|---|---|---|---|---|
| Studio Downtown (Yr 5) | $46,000 | $38,000 | +$8,000 | $1,200 | ~$5,655 after fee + payoff |
| 1BHK Investment (Yr 3) | $73,000 | $65,000 | +$8,000 | $2,400 (short-term) | ~$5,255 |
| Selling in recession | $32,000 | $38,000 | −$6,000 | $0 (loss) | Player may owe if balance > $32k |

---

## 10. Property Insurance

### 10.1 Insurance Tiers

Property insurance is separate from health insurance. Each owned property (personal or investment) can be insured individually.

| Tier | Monthly Cost | Coverage |
|---|---|---|
| **None** | $0 | No coverage; full damage costs apply |
| **Basic** | $30–45/mo | Fire and flood; covers 60% of major damage |
| **Standard** | $60–80/mo | Fire, flood, theft, liability; covers 85% of damage; legal dispute partial cover |
| **Premium** | $100–130/mo | Full coverage; covers 95% of all damage types; includes tenant legal coverage; rental income protection (pays rent for up to 2 vacant months) |

> Insurance costs vary slightly by property type: commercial shop space costs 20% more to insure than residential.

### 10.2 What Happens Without Insurance

```
Event: NATURAL_DISASTER fires on uninsured property
  repairCost = roll(3000, 15000)
  player.cash -= repairCost
  if player.cash < 0:
    → DEBT_SPIRAL trigger (see Emergency Fund cascade above)
    → Mental Health −20
    → Energy −10

Event: LEGAL_DISPUTE fires on uninsured property
  legalCost    = roll(500, 2000) × 2.5   // no legal coverage multiplier
  Mental Health −15
```

### 10.3 Insurance Cost-Benefit Analysis

Over 10 years, the expected value of insurance vs. no insurance on a single property:

| Metric | No Insurance | Standard Insurance |
|---|---|---|
| 10-yr premium paid | $0 | ~$7,200 |
| Expected uncovered damage | ~$9,000 (avg) | ~$1,350 (15% residual) |
| Spiral risk events | High | Low |
| **10-yr expected net cost** | **~$9,000** | **~$8,550** |

> The real value of insurance is **risk mitigation**, not just average cost. A single $12,000 uninsured disaster in Year 2 can derail an entire 10-year plan.

### 10.4 NPC Behavior as Signal

- **Rohan (landlord NPC)** always carries Standard insurance on investments → signals best practice
- **Kabir (saver NPC)** goes uninsured to save money → occasionally triggers visible financial stress events, teaching the player by example

---

## 11. Location Strategy & Time Cost

### 11.1 The 24-Hour Time Slot System

The player has **24 time slots per day** (each represents 1 hour). Core life functions consume slots:

| Activity | Slots/day | Notes |
|---|---|---|
| Sleep | 7 | Minimum; below 7 → Energy degrades |
| Work | 8 | Fixed (full-time job) |
| Meals & hygiene | 2 | Fixed |
| **Free slots** | **7** | Available for skills, side hustle, social, leisure |

Commute directly **eats into free slots**:

```
freeSlots = 24 - 7 (sleep) - 8 (work) - 2 (meals) - commuteHoursPerDay
```

### 11.2 Commute Impact by Property

| Property | Commute | Free Slots Lost | Free Slots Remaining |
|---|---|---|---|
| Studio Downtown | 0 hr | 0 | 7 |
| 1BHK Near Office | 0–1 hr | 0–1 | 6–7 |
| 2BHK Suburb | +2 hr | 2 | 5 |
| 3BHK Family Home | +1 hr | 1 | 6 |
| Distant rental | +2 hr | 2 | 5 |

### 11.3 Opportunity Cost of Commute Time

Each free time slot can be used to earn or grow. Losing 2 slots per day to commute has compounding long-term consequences:

```
// Over 1 year of 2BHK Suburb commute:
slotsLost = 2 hr/day × 365 days = 730 hours

// Potential equivalent (if used for freelancing @ $15/hr): $10,950/yr in lost earnings
// Potential equivalent (if used for skill-building):        2 course credits saved
```

### 11.4 Commute & Health Drain

Long commutes also passively degrade health bars each day:

| Commute | Energy Effect | Mental Effect |
|---|---|---|
| 0 hr | — | — |
| 1 hr | −1 Energy/day | — |
| 2 hr | −3 Energy/day | −1 Mental/day |

> At **−3 Energy/day**, if the player does not compensate with leisure or sleep activities, Energy can drop to critical levels within 30 days, triggering `BURNOUT_WARNING`.

### 11.5 Strategy Decision Framework

```
Early game (Yr 1–2, no kids):
  → Prioritize Studio Downtown or 1BHK Near Office
  → Maximize free time for career advancement and side business
  → Buy early to escape rent creep

Mid game (Yr 3–5, career growing):
  → Consider Investment Properties (buy Studio Investment first)
  → Personal home upgrade if kids arrive

Late game (Yr 6–10, family established):
  → 3BHK Family Home if 2+ kids
  → Maximize investment property portfolio
  → Refinance if credit score improved ≥100 points since purchase
```

---

## 12. 10-Year Rent vs Buy Projection

### 12.1 Scenario A: Studio — Rent vs Buy

Both scenarios assume the player starts at Year 1 and makes no changes for 10 years.
- **Rent scenario:** $380/mo studio rental with 7.5% average annual creep.
- **Buy scenario:** $38,000 Studio Downtown, $7,600 down payment, $290/mo EMI, 4% annual appreciation.

| Year | **Rent/mo** | **Annual Rent** | **Cumul. Rent Paid** | **EMI/mo** | **Annual EMI** | **Cumul. Buy Outflow** | **Property Value** | **Mortgage Balance** | **Equity** |
|---|---|---|---|---|---|---|---|---|---|
| 0 | — | — | — | — | — | $7,600* | $38,000 | $30,400 | **$7,600** |
| 1 | $380 | $4,560 | $4,560 | $290 | $3,480 | $11,080 | $39,520 | $29,006 | **$10,514** |
| 2 | $409 | $4,908 | $9,468 | $290 | $3,480 | $14,560 | $41,101 | $27,514 | **$13,587** |
| 3 | $440 | $5,280 | $14,748 | $290 | $3,480 | $18,040 | $42,745 | $25,918 | **$16,827** |
| 4 | $473 | $5,676 | $20,424 | $290 | $3,480 | $21,520 | $44,455 | $24,212 | **$20,243** |
| 5 | $509 | $6,108 | $26,532 | $290 | $3,480 | $25,000 | $46,233 | $22,390 | **$23,843** |
| 6 | $547 | $6,564 | $33,096 | $290 | $3,480 | $28,480 | $48,082 | $20,444 | **$27,638** |
| 7 | $588 | $7,056 | $40,152 | $290 | $3,480 | $31,960 | $50,005 | $18,369 | **$31,636** |
| 8 | $633 | $7,596 | $47,748 | $290 | $3,480 | $35,440 | $52,005 | $16,154 | **$35,851** |
| 9 | $681 | $8,172 | $55,920 | $290 | $3,480 | $38,920 | $54,085 | $13,792 | **$40,293** |
| 10 | $732 | $8,784 | $64,704 | $290 | $3,480 | $42,400 | $56,249 | $11,273 | **$44,976** |

*Year 0 cumulative buy outflow = down payment only.

**Summary — Scenario A:**

| Metric | Renting (10 yr) | Buying (10 yr) |
|---|---|---|
| Total cash outflow | $64,704 | $42,400 (EMI) + $7,600 (down) = $50,000 |
| Equity built | $0 | **$44,976** |
| Net wealth effect on housing | −$64,704 | −$50,000 + $44,976 = **−$5,024** |
| Commute time saved | — | 1 slot/day vs rental |

> **Bottom line:** The renter spent ~$64,700 over 10 years and built zero equity. The buyer spent ~$50,000 **and holds $44,976 in equity** — net housing cost of only $5,024 versus the renter's $64,704.

---

### 12.2 Scenario B: 2BHK — Rent vs Buy

- **Rent scenario:** $700/mo 2BHK suburban rental, 7.5% annual creep.
- **Buy scenario:** $45,000 2BHK Suburb, $9,000 down, $342/mo EMI, 4% annual appreciation.

| Year | Rent/mo | Cumul. Rent | Buy EMI/mo | Cumul. Buy Outflow | Property Value | Mortgage Balance | **Equity** |
|---|---|---|---|---|---|---|---|
| 0 | — | — | — | $9,000* | $45,000 | $36,000 | **$9,000** |
| 1 | $700 | $8,400 | $342 | $13,104 | $46,800 | $34,430 | **$12,370** |
| 2 | $753 | $17,436 | $342 | $17,208 | $48,672 | $32,770 | **$15,902** |
| 3 | $810 | $27,156 | $342 | $21,312 | $50,619 | $30,996 | **$19,623** |
| 4 | $871 | $37,608 | $342 | $25,416 | $52,644 | $29,103 | **$23,541** |
| 5 | $936 | $48,840 | $342 | $29,520 | $54,749 | $27,083 | **$27,666** |
| 6 | $1,007 | $60,924 | $342 | $33,624 | $56,939 | $24,927 | **$32,012** |
| 7 | $1,083 | $73,920 | $342 | $37,728 | $59,217 | $22,628 | **$36,589** |
| 8 | $1,164 | $87,888 | $342 | $41,832 | $61,586 | $20,177 | **$41,409** |
| 9 | $1,251 | $102,900 | $342 | $45,936 | $64,049 | $17,565 | **$46,484** |
| 10 | $1,345 | $119,040 | $342 | $50,040 | $66,611 | $14,785 | **$51,826** |

*Year 0 cumulative buy outflow = down payment only.

**Summary — Scenario B:**

| Metric | Renting (10 yr) | Buying (10 yr) |
|---|---|---|
| Total cash outflow | $119,040 | $50,040 + $9,000 = **$59,040** |
| Equity built | $0 | **$51,826** |
| Net wealth effect on housing | −$119,040 | −$59,040 + $51,826 = **−$7,214** |

> **Gap: ~$111,826 in favor of buying.** The suburban renter bleeds money through rent creep while the buyer's fixed $342/mo EMI locks in costs and steadily builds ownership.

---

## 13. UI & State Summary

### 13.1 Property Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  PROPERTY PORTFOLIO                          Month 42   │
├────────────────────┬────────────┬────────────┬──────────┤
│ Property           │ Curr Value │ Equity     │ EMI/mo   │
├────────────────────┼────────────┼────────────┼──────────┤
│ 🏠 Studio Dtown    │ $44,500    │ $16,900    │ -$290    │
│ 📦 Studio Invest.  │ $56,200    │ $19,400    │ -$320    │
│ 📦 Shop Space      │ $90,100    │ $28,300    │ -$520    │
├────────────────────┼────────────┼────────────┼──────────┤
│ TOTAL              │ $190,800   │ $64,600    │ -$1,130  │
├────────────────────┴────────────┴────────────┴──────────┤
│ Monthly Rental Income:  +$1,120 (Studio $420 + Shop $700│
│ Net Property Cash Flow: -$10/mo                         │
│ Insurance Status:       ✓ All covered (Standard)        │
└─────────────────────────────────────────────────────────┘
```

### 13.2 Key Flags Tracked in Save State

```
playerProperty {
  hasEverOwned:         boolean    // unlocks property sections in Year 10 report
  totalRentPaid:        number     // lifetime tally for Life Report
  totalEquityBuilt:     number     // lifetime tally for Life Report
  landlordAchievement:  boolean    // true if ≥2 investment properties owned simultaneously
  refinancedCount:      number
  propertiesSold:       number
  totalCapGainsTaxPaid: number
}
```

### 13.3 NPC Interactions in Property System

| NPC | Role | Property Advice / Triggered Event |
|---|---|---|
| **Rohan** | Landlord mentor | Teaches tenant screening; offers co-investment deal (optional) |
| **Ananya** | Entrepreneur | Tips on renting Shop Space from player's portfolio to her business |
| **Vikram** | Cautious saver | Warns against over-leveraging multiple mortgages |
| **Priya** | Aggressive investor | Encourages buying all 3 investment properties early |
| **Kabir** | Conservative | Advocates renting and liquid savings — provides contrast |

### 13.4 Year 10 Life Report — Property Section

```
PROPERTY REPORT CARD
─────────────────────────────────────────────────────────
Personal Home:        Owned (3BHK Family Home)        ✓
Investment Props:     2 of 3 slots used
Total Equity Built:   $87,500
Total Rent Paid:      $12,400  (Years 1–2, pre-purchase)
Capital Gains Tax:    $2,200   (1 property sold in Yr 6)
Net Property Wealth:  $87,500 − $2,200 = $85,300

Property Grade: B+
─────────────────────────────────────────────────────────
"You built significant property wealth. Owning investment
 properties earlier could have maximized passive income."
```

### 13.5 Property Section Grading Rubric

| Grade | Criteria |
|---|---|
| **A** | Owned personal home + 3 investment properties; all insured; net positive property cash flow by Yr 5 |
| **B** | Owned personal home + 2 investment properties; mostly insured; net positive by Yr 7 |
| **C** | Owned personal home only; minimal investment exposure |
| **D** | Rented entire game OR owned home but suffered uninsured disaster spiral |
| **F** | Mortgage default OR negative equity at game end |

---

*Spec version 1.0 — Property System | CashFlow Life Sim*
*Cross-references: `01-core-systems`, `02-financial-engine`, `04-career-system`, `07-market-cycles`, `09-health-system`*
