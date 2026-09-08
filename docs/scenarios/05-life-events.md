# Scenarios: Life, Family & Relationship Events

This document details dating, co-living, marriage, children, extended family, friendships, and lifestyle crossroads in CashFlow Life Sim.

---

### [LFE-001] The Prospective Partner Encounter
- **Trigger:** Year 2, Player status is Single.
- **Prompt:** *"At an industry networking mixer, you connect with an ambitious, warm professional. You exchange contact details."*
- **Choices:**
  - **A: Pursue dating actively ($80/date, 1 time slot/wk)** → Sets relationship status to 'Dating'; +8 Happiness; slight monthly budget outlay.
  - **B: Focus purely on career and pass** → Remains Single; retains full personal time budget.

---

### [LFE-002] The Co-Living Milestone: Moving In Together
- **Trigger:** Dating for ≥ 12 months (Year 3).
- **Prompt:** *"After a year of dating, you discuss moving into a shared apartment. Rent and broadband costs will be split 50/50, saving both of you money."*
- **Choices:**
  - **A: Sign a joint residential lease** → Housing rent expense drops by -$350/mo; living costs pool together; +15 Happiness.
  - **B: Maintain separate apartments for personal space** → Keeps current housing costs; delays family progression.

---

### [LFE-003] The Wedding Budget Crossroads
- **Trigger:** Relationship status 'Engaged' (Year 4–5).
- **Prompt:** *"Wedding planning is underway! You and your partner must decide on the scale and style of your ceremony."*
- **Choices:**
  - **A: Intimate City Hall & Family Dinner ($1,500)** → Minimal cash drain; saves capital for primary home down payment; +10 Happiness.
  - **B: Traditional Banquet with Friends & Relatives ($8,000)** → Balanced celebration; parents chip in $3,000; net outlay $5,000; +20 Happiness.
  - **C: Destination Luxury Wedding ($20,000)** → High social prestige; requires draining liquid savings or taking a wedding loan; +30 Happiness, high financial stress.
- **Behavioral Impact:** Choice C spikes `lifestyleCreepCounter`.

---

### [LFE-004] Hidden Debt Disclosure
- **Trigger:** Within 90 days post-marriage.
- **Prompt:** *"While setting up a joint household account, your partner reveals they still carry $8,500 in student loan debt with a $220/mo EMI."*
- **Choices:**
  - **A: Pay off the loan immediately from your liquid reserves ($8,500)** → Wipes out partner's debt; clears monthly EMI; +25 marital trust; drains emergency buffer.
  - **B: Incorporate the $220/mo EMI into joint household obligations** → Adds $220/mo ongoing liability; preserves liquid cash.

---

### [LFE-005] Welcoming Your First Child
- **Trigger:** Married for ≥ 1 year, Year 5–7.
- **Prompt:** *"Life Milestone: Your partner gives birth to a healthy baby girl! Parenthood begins."*
- **Effects:**
  - **Medical Delivery:** $4,500 bill (reduced to $900 with Standard/Premium health insurance).
  - **Time Impact:** **-2 daily time slots permanently** (parenting responsibilities).
  - **Monthly Cost:** +$650/mo ongoing child expenses.
  - **Emotional:** +40 Happiness; Energy drops temporarily.

---

### [LFE-006] Aging Parent Healthcare Support
- **Trigger:** Year 5+, random filial event (20% chance).
- **Prompt:** *"Your mother undergoes unexpected knee replacement surgery. After Medicare/Insurance, an out-of-pocket balance of $3,200 remains. The family asks for your help."*
- **Choices:**
  - **A: Cover the full $3,200 from your emergency reserves** → +25 Family Harmony, +10 Mental Peace; -$3,200 cash.
  - **B: Contribute a partial sum ($1,000)** → Balances personal budget with filial support.
  - **C: Decline assistance due to tight finances** → -20 Family Harmony; -15 Mental Health guilt.

---

### [LFE-007] The High School Reunion: Comparison Anxiety
- **Trigger:** Year 6 (Age 28).
- **Prompt:** *"You attend your 10-year high school reunion. Former classmates are talking about tech startup exits, overseas villas, and executive promotions."*
- **Choices:**
  - **A: Ground yourself in your own financial plan & steady progress** → +10 Mental Fortitude; lowers `lifestyleCreepCounter`.
  - **B: Feel deeply insecure and consider upgrading your car to look successful** → Spikes `lifestyleCreepCounter` by +2.0; triggers an impulse auto purchase prompt next month.

---

### [LFE-008] Friend's Destination Bachelor Party
- **Trigger:** Close friend gets married (Year 3–6).
- **Prompt:** *"Your best friend invites you to a 4-day bachelor party weekend in Las Vegas. Estimated cost: $1,400 all-in."*
- **Choices:**
  - **A: Attend and celebrate (-$1,400 cash, 4 days off)** → +20 Happiness; deepens lifelong friendship.
  - **B: Politely decline due to financial priorities** → Saves $1,400 cash; -5 Happiness FOMO.

---

### [LFE-009] Adopting a Family Rescue Pet
- **Trigger:** Household has a stable home (Rent or Own).
- **Prompt:** *"A local animal shelter has an adorable golden retriever rescue pup looking for a loving home."*
- **Choices:**
  - **A: Adopt the pet ($250 adoption fee + $80/mo food/vet)** → -1 flexible daily time slot; +15 permanent Happiness; recurring pet expense.
  - **B: Pass on adoption** → Zero added commitments.

---

### [LFE-010] The Marital Divorce Crossroads (Severe Friction)
- **Trigger:** Rare event (only fires if 3+ major marital financial conflicts remain unresolved).
- **Prompt:** *"Irreconcilable financial friction and chronic stress have fractured your marriage. You and your spouse agree to separate."*
- **Effects:**
  - Net worth divided 50/50.
  - Legal fees: -$4,000.
  - Housing: Must move into independent studio apartment.
  - -30 Mental Health; requires 6 months of emotional recovery.
