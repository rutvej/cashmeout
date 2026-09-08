# Scenarios: Health, Vitality & Medical Events

This document details physical health, mental stress, sleep debt, gym habits, and hospital emergency events in CashFlow Life Sim.

---

### [HLT-001] Sudden Food Poisoning & Acute Dehydration
- **Trigger:** Selected Food Tier is "Street Food / Unhealthy Takeout" (`junkFoodCounter` ≥ 4.0).
- **Prompt:** *"You wake up at 3:00 AM with violent stomach cramps, fever, and severe food poisoning from street stall food."*
- **Choices:**
  - **A: Visit emergency urgent care clinic** → -$180 cash; prescribed IV rehydration; misses 1 full day of work; Energy drops to 20%.
  - **B: Try to power through at home with hydration salts** → $15 cost; misses 2 full days of work; Physical Health drops by -12%.
- **Behavioral Impact:** Decreases temptation for street food; lowers `junkFoodCounter` by -1.0.

---

### [HLT-002] The Gym Motivation Collapse (Inertia Barrier)
- **Trigger:** `gymSkipCounter` ≥ 6.0; player has skipped workouts for 14 consecutive days.
- **Prompt:** *"Your gym gear sits dusty by the doorway. The mental resistance to step foot inside the fitness center feels overwhelming."*
- **Choices:**
  - **A: Force yourself to go for just 20 minutes today** → Overcomes inertia barrier; `gymSkipCounter` drops by -1.5; +5 Mental Resilience.
  - **B: Surrender and lounge on the couch** → `gymSkipCounter` rises to 7.5; Physical Health declines by -3%; Energy drops -4%.

---

### [HLT-003] Clinical Burnout Warning: Chronic Stress Overload
- **Trigger:** Mental Health ≤ 30%, `lateNightWorkCounter` ≥ 6.0.
- **Prompt:** *"You find it impossible to concentrate. Brain fog, insomnia, and persistent chest tightness prompt a visit to your physician: 'You are on the precipice of clinical exhaustion.'"*
- **Choices:**
  - **A: Take a mandatory 5-day unpaid medical leave** → -$600 lost wages; sleep reset to 8.5 hrs; Mental Health rebounds by +25%; Physical Health +10%.
  - **B: Take prescription anti-stress medication and continue working** → -$90 pharmacy copay; temporary energy stabilization, but risks full hospital collapse within 60 days.

---

### [HLT-004] Orthopedic Knee Sprain & Physical Therapy
- **Trigger:** Random exercise injury or slip on icy pavement.
- **Prompt:** *"During an intense training session, your knee twists awkwardly. The orthopedist diagnoses a grade-2 ligament sprain."*
- **Choices:**
  - **A: Complete full physiotherapy rehab program** → -$450 cost (or $90 if Standard Health Insurance owned); cancels high-intensity cardio for 21 days; full recovery guaranteed.
  - **B: Ignore physical therapy and rest passively** → Zero cost; 40% chance of chronic joint pain and permanent -5% Physical Health ceiling.

---

### [HLT-005] Acute Dental Abscess & Root Canal
- **Trigger:** Random annual medical roll (10%).
- **Prompt:** *"An excruciating throbbing toothache prevents sleep and work. The dentist confirms an infected nerve requiring an immediate root canal and crown."*
- **Choices:**
  - **A: Complete full endodontic procedure immediately** → -$1,200 out-of-pocket (Health insurance pays 50% if Standard/Premium owned); instant pain relief; restores normal sleep.
  - **B: Request temporary antibiotics and delay procedure** → -$40 copay; infection flares back with double intensity in 30 days.

---

### [HLT-006] The 8-Hour Sleep Streak: Cognitive Clarity
- **Trigger:** Player maintains 8+ hours of sleep for 14 consecutive days (`sleepDebtCounter` ≤ 1.0).
- **Prompt:** *"Consistency Triumph: Two weeks of uninterrupted 8-hour sleep cycles have cleared your accumulated sleep debt. You wake up sharp and energized."*
- **Choices:**
  - **A: Harness cognitive clarity for productivity** → Energy set to 95%; Work performance rating +10%; +5 Mental Health.

---

### [HLT-007] Chronic Screen Eyestrain & Migraines
- **Trigger:** Tech / Finance desk job, working overtime ≥ 4 times this month.
- **Prompt:** *"Staring at dual monitors for 11 hours daily causes blinding tension headaches and visual blurriness."*
- **Choices:**
  - **A: Purchase blue-light ergonomic prescription glasses ($220)** → Eliminates daily headache events; restores work comfort.
  - **B: Endure with over-the-counter pain relievers** → -$15 pharmacy; headache events recur every 14 days.

---

### [HLT-008] Preventive Annual Executive Wellness Screening
- **Trigger:** Month 12 / Year-End health checkup event.
- **Prompt:** *"Your insurance offers an annual comprehensive biometric blood panel and cardiovascular stress test."*
- **Choices:**
  - **A: Undergo comprehensive screening ($150 copay)** → Uncovers dietary deficiencies; unlocks tailored lifestyle guidance (+10 Physical Health).
  - **B: Skip the checkup to save time** → Saves 1 time slot; leaves potential silent health risks undetected.

---

### [HLT-009] Recharging Weekend Nature Retreat
- **Trigger:** Mental Health between 35% and 60%, liquid cash ≥ $400.
- **Prompt:** *"Feeling drained from corporate routine, you notice a peaceful mountain cabin retreat available for the weekend."*
- **Choices:**
  - **A: Book the weekend retreat (-$380 cash)** → Spend 2 days offline in nature; Mental Health surges +20%; Energy +15%.
  - **B: Stay home and scroll social media** → Zero cost; mental state remains stagnant.

---

### [HLT-010] Major Emergency Surgery: Acute Appendicitis
- **Trigger:** Rare emergency event (5% chance over 10 years).
- **Prompt:** *"Severe abdominal pain lands you in the hospital emergency room at 2:00 AM. Surgeons confirm an inflamed appendix requiring immediate laparoscopic removal."*
- **Choices:**
  - **A: Proceed with emergency surgery ($8,400 total billing)** →
    - *If Uninsured:* Out-of-pocket $8,400 (or forced high-interest medical debt).
    - *If Standard Insurance:* Insurance pays 80%; player pays **$1,880**.
    - *If Premium Insurance:* Player pays **$420**.
  - Recovers physical health over 14 in-game days.
