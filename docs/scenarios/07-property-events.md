# Scenarios: Real Estate & Property Events

This document details tenant relationships, structural maintenance, property valuation cycles, and mortgage refinances in CashFlow Life Sim.

---

### [PRP-001] Tenant Chronic Rent Default & Eviction Protocol
- **Trigger:** Player owns an investment rental property; random tenant default (8% annual chance).
- **Prompt:** *"Your investment flat tenant has missed their second consecutive month of rent and stopped answering phone calls."*
- **Choices:**
  - **A: Hire an eviction attorney to begin legal formal notice ($600)** → Legal process takes 60 days with zero rental income; clears property on Day 61.
  - **B: Offer 'Cash for Keys' ($800 moving incentive to vacate this week)** → Tenant leaves peacefully in 3 days; avoids legal delays; property available for leasing immediately.
- **Financial Impact:** 1 to 2 months lost rental income plus legal/moving costs.

---

### [PRP-002] Main Water Pipe Rupture & Water Damage
- **Trigger:** Player owns real estate (Primary Residence or Investment Property).
- **Prompt:** *"A major water pipe bursts behind the bathroom drywall, flooding hardwood floors and soaking the ceiling below."*
- **Choices:**
  - **A: File property insurance claim ($500 deductible)** → If Property Insurance is active; insurer covers the remaining $3,200 repairs; repairs completed in 5 days.
  - **B: Pay private emergency plumbers in cash ($2,800)** → Required if uninsured; direct cash deduction.

---

### [PRP-003] City Metro Line Transit Hub Announcement
- **Trigger:** Year 4 or Year 7; random municipal infrastructure roll.
- **Prompt:** *"Urban Planning Milestone: The city council approves a new rapid subway transit station within 400 meters of your residential property."*
- **Effects:**
  - Property appraisal value instantly appreciates by **+18%**.
  - Market rental yield on the property increases by **+$90/month**.
  - Net Worth jumps significantly on the balance sheet.

---

### [PRP-004] Central Bank Mortgage Refinancing Window
- **Trigger:** Player holds an active mortgage, and benchmark interest rates fall.
- **Prompt:** *"Favorable Credit Window: Mortgage rates have dropped from 6.8% to 4.5%. You are eligible to refinance your existing mortgage."*
- **Choices:**
  - **A: Refinance mortgage ($1,200 closing appraisal fee)** → Reduces monthly mortgage EMI permanently from $550/mo to **$440/mo** (+$110/mo free cashflow).
  - **B: Keep existing mortgage unchanged** → Avoids closing fee; preserves higher monthly outflow.

---

### [PRP-005] High-Quality Long-Term Tenant Application
- **Trigger:** Vacant investment rental property.
- **Prompt:** *"A tenured pediatrician applies to rent your investment apartment on a guaranteed 24-month lease, offering to pay 6 months upfront."*
- **Choices:**
  - **A: Accept lease and collect 6 months upfront ($3,600)** → Injects $3,600 liquid cash; guarantees 0% default risk for 2 years.
  - **B: Counter-offer for a slightly higher rent (+5%)** → 30% chance tenant walks away to another apartment.

---

### [PRP-006] Homeowners Association (HOA) Special Assessment
- **Trigger:** Player owns a condominium / apartment unit.
- **Prompt:** *"HOA Board Notice: Structural exterior repointing and elevator modernization require a mandatory one-time special assessment of $1,400 per unit."*
- **Choices:**
  - **A: Pay special assessment in full (-$1,400 cash)** → Clears obligation; maintains building equity value.
  - **B: Enroll in a 12-month HOA payment surcharge ($130/mo)** → Spreads cashflow burden over a year.

---

### [PRP-007] Kitchen & Bathroom Modernization ROI
- **Trigger:** Primary or investment property owned for ≥ 4 years.
- **Prompt:** *"A local contractor quotes $6,000 for a comprehensive modern kitchen overhaul (quartz counters, new cabinetry, energy-star appliances)."*
- **Choices:**
  - **A: Commission the renovation ($6,000 cash outlay)** → Boosts property appraisal value by +$9,000; increases rental potential by +$120/mo; +10 Happiness.
  - **B: Leave existing functional fixtures as-is** → Preserves cash reserves.

---

### [PRP-008] Unsolicited Cash Buyout Offer from Developer
- **Trigger:** Property owned in an appreciating neighborhood; Year 6+.
- **Prompt:** *"A commercial redeveloper assembling land parcels offers a premium all-cash buyout of your property at 25% above prevailing market appraisal value."*
- **Choices:**
  - **A: Accept buyout and liquidate equity** → Mortgages cleared automatically; massive cash windfall deposited (subject to LTCG tax).
  - **B: Hold the property as a generational compounding asset** → Keeps asset and ongoing rental income.
