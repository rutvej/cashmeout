# Scenarios: Behavioral, Habit & Temptation Events

This document details dynamic psychological cards driven directly by the player's behavioral counters: impulse buys, junk food, gym skips, sleep deprivation, and lifestyle creep.

---

### [BEH-001] The Midnight Electronics Flash Sale
- **Trigger:** `impulseBuyCounter` ≥ 4.0; Friday evening.
- **Prompt:** *"An e-commerce push notification buzzes: 'Flash Deal Ends in 45 Minutes: 4K OLED Gaming Monitor marked down 40% to $620!' You don't technically need it, but the discount looks incredible."*
- **Choices:**
  - **A: Buy it before the countdown timer hits zero (-$620)** → Deducts $620 cash; +8 short-term Happiness; increases `impulseBuyCounter` by **+2.0**; increases likelihood of next week's gadget temptation.
  - **B: Close the browser and step away** → Lowers `impulseBuyCounter` by **-1.0**; +3 Financial Discipline.

---

### [BEH-002] The Rainy Evening Food Delivery Impulse
- **Trigger:** `junkFoodCounter` ≥ 3.5, 7:30 PM.
- **Prompt:** *"It is raining cold outside. You planned to boil pasta and make a fresh salad, but the food delivery app highlights an artisan double-bacon smash burger and loaded cheese fries ($32 delivered)."*
- **Choices:**
  - **A: Order the decadent feast (-$32)** → Saves 45 minutes of cooking time; `junkFoodCounter` rises by **+1.5**; Physical Health takes -1.0% drop; sleep quality drops slightly.
  - **B: Cook the simple home meal** → Takes 1 cooking time slot; `junkFoodCounter` drops by **-0.5**; Physical Health +0.5%.

---

### [BEH-003] The "Too Tired to Lift" Gym Barrier
- **Trigger:** `gymSkipCounter` ≥ 3.0, Energy ≤ 55%.
- **Prompt:** *"Your work day was mentally draining. Your gym bag is packed, but your couch looks infinitely more welcoming. 'One missed workout won't hurt, right?'"*
- **Choices:**
  - **A: Skip gym and collapse on the couch** → `gymSkipCounter` rises by **+1.5**; Physical Health -0.5%; makes tomorrow's workout twice as hard to attend.
  - **B: Show up anyway and do a light 30-minute cardio session** → Breaks the inertia chain! `gymSkipCounter` decreases by **-1.0**; Energy rebounds by +8%; +5 Mental Resilience.

---

### [BEH-004] Streaming Binge vs. The 8-Hour Sleep Rule
- **Trigger:** `sleepDebtCounter` ≥ 2.5, 11:15 PM.
- **Prompt:** *"The thrilling season finale of your favorite suspense series just ended on a massive cliffhanger. Season 2, Episode 1 is auto-playing. You need to be awake at 6:45 AM."*
- **Choices:**
  - **A: Watch 'just one more episode' (Bedtime: 1:30 AM)** → Sleep reduced to 5.2 hours; `sleepDebtCounter` increases by **+2.0**; Energy next day capped at 45%; triggers tomorrow's caffeine craving card.
  - **B: Turn off the screen immediately and sleep** → Sleep is 7.5 hours; `sleepDebtCounter` decreases by **-0.5**; Energy starts at 90%.

---

### [BEH-005] Promotion Lifestyle Creep: The Luxury Vehicle Seduction
- **Trigger:** Player receives a salary raise to ≥ $5,000/mo, `lifestyleCreepCounter` ≥ 3.0.
- **Prompt:** *"Colleagues at your new managerial rank drive German luxury sedans. A dealership salesperson sends an email: 'Executive Lease Special: $550/mo with zero down.'"*
- **Choices:**
  - **A: Sign the executive car lease ($550/mo for 36 months)** → High social prestige (+15 Happiness); permanent -$550/mo fixed overhead; `lifestyleCreepCounter` surges by **+2.0**.
  - **B: Keep driving your reliable, fully-paid commuter car** → Saves $550/mo in free cashflow for stock compounding; `lifestyleCreepCounter` drops by **-1.0**.

---

### [BEH-006] The Weekend Bar Crawl Peer Pressure
- **Trigger:** Friday night, friends planning a social outing.
- **Prompt:** *"Your friend group is heading to an upscale downtown cocktail lounge where drinks cost $22 each. 'Come out with us! Don't be boring.'"*
- **Choices:**
  - **A: Go all-out and buy rounds of drinks (-$240)** → High social bonding (+15 Happiness); `impulseBuyCounter` +1.5; wakes up hungover with 30% Energy tomorrow.
  - **B: Go for 1 drink and switch to club soda (-$35)** → Great social connection (+10 Happiness); saves $205; wakes up refreshed.
  - **C: Stay home alone** → Zero cost; -5 Happiness FOMO.

---

### [BEH-007] The Revenge Trading Temptation
- **Trigger:** Holding an asset that dropped > 15% this week (`cryptoFomoCounter` ≥ 4.0).
- **Prompt:** *"Your speculative crypto portfolio took a painful $800 hit yesterday. An aggressive voice whispers: 'If you double down with leverage on this new breakout token, you can make back the entire loss by tomorrow morning.'"*
- **Choices:**
  - **A: Take the leveraged revenge trade ($1,200 bet)** → 20% chance of recovery; 80% chance of complete liquidation; `cryptoFomoCounter` rises to 8.0.
  - **B: Accept the loss, close trading app, and go for a walk** → Halts the emotional downward spiral; lowers `cryptoFomoCounter` by -1.5; +10 Emotional Discipline.

---

### [BEH-008] The Habit Inoculation Milestone: 30-Day Clean Streak
- **Trigger:** All behavioral counters remain below 2.5 for 30 consecutive days.
- **Prompt:** *"Behavioral Breakthrough: A month of consistent discipline has decoupled you from consumerist triggers. You feel calm, unhurried, and completely in control of your wallet and calendar."*
- **Choices:**
  - **A: Celebrate the new baseline** → Mental Health +15; permanently reduces the base trigger rate of low-tier temptation cards by 30%.
