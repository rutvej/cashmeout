# 02 — Core Resources: Time · Health · Money

The entire game is a trade-off between three resources. Every decision moves at least one of them.

---

## ⏰ TIME

**Time is the only non-renewable resource.**

### The 24-Hour Day

| Block | Default slots | Can change? |
|-------|--------------|-------------|
| 😴 Sleep | 7–9 hrs | Yes — but health consequences |
| 💼 Work | 8–10 hrs | Mostly fixed by job; events extend it |
| 🚗 Commute | 0–2 hrs | Changes with transport choice or home location |
| 🏋️ Gym | 1 hr | Default ON — events can cancel |
| 🍳 Food prep | 0.5–1 hr | Changes with food tier choice |
| 📚 Study/Course | 0–2 hrs | Player sets monthly default |
| 💻 Side hustle / Business | 0–4 hrs | Player sets monthly default |
| 📊 Active trading | 0–2 hrs | Optional; conflicts with other slots |
| 🌙 Free time / Recovery | Remainder | What's left after everything else |

### Monthly Default Setting

On Salary Day, player sets time allocation defaults for the entire month. Events override defaults when they fire.

### Time Conflicts

When an event extends work or creates an emergency, time must be cut somewhere:

```
⚠️ TIME CONFLICT
Work ran 2hrs late tonight.
Something must be cut:
  → [Skip gym]
  → [Skip side hustle]
  → [Sleep less — health impact]
  → [Skip studying]
```

If player doesn't choose, system auto-cuts in priority order: free time → gym → side hustle → study → sleep.

### Transport & Commute Time

| Transport | Daily commute slots | Daily cost | Requirement |
|-----------|-------------------|-----------|-------------|
| Walk / Public transit | 2 hrs (1 each way) | $5 | Nothing |
| Bicycle | 1.5 hrs | $0 | Own bicycle ($500) |
| Scooter / Bike | 0 hrs (fast) | $8 | Own vehicle |
| Car | 0 hrs (fast) | $20 | Own car |
| Near-office home | 0–0.5 hrs | Built into rent/mortgage | Higher housing cost |

Saving commute time = more slots for gym, side hustle, study, or rest.

---

## 🏥 HEALTH

**Health never improves on its own. You actively fight decline.**

### Three Health Bars (each 0–100)

| Bar | What it represents | Hits 0 → |
|-----|--------------------|----------|
| 💪 Physical | Body condition | Medical emergency, cannot work |
| 🧠 Mental | Stress & motivation | Burnout, quits job, therapy forced |
| ⚡ Energy | Daily functioning | Poor work performance, can't gym, decisions worse |

### What Drains Each Bar

**Physical health drains from:**
- Junk food / skipping meals: -1.2/day
- No gym for 7+ days: -0.5/day
- Illness events: -5 to -20 (single hit)
- Poor sleep (< 6 hrs): -0.5/day
- High-stress job: -0.3/day

**Mental health drains from:**
- High-stress job: -2 to -5/month
- Late-night work events: -3 per event
- Financial crises: -5 to -15 (single hit)
- No vacation for 6+ months: -2/month
- No social life: -1/month

**Energy drains from:**
- Sleep < 7 hrs: -3/day
- No gym: -1/day
- Poor food: -0.8/day
- Stress: -1/day

### What Refills Each Bar

| Activity | Physical | Mental | Energy | Cost |
|----------|---------|--------|--------|------|
| Gym (daily) | +1.5/day | +0.5/day | +1/day | 1 time slot |
| Good food (home cooked) | +1.2/day | +0.5/day | +0.8/day | $8/day |
| 8hrs sleep | +0.3/day | +0.5/day | +3/day | 1 extra slot |
| Vacation (3–7 days) | +5 | +20 to +40 | +15 | $800–3,000 |
| Social evening | 0 | +5 | +2 | $50–150 |
| Hobby (regular) | 0 | +3/week | +1/week | 1 slot/day |
| Therapy session | 0 | +8 | +3 | $80–150 |
| Free time / rest | +0.2/day | +2/day | +2/day | $0 |

### Health Cascade Examples

**The gym-skip chain:**
```
Work late → gym skipped
→ Energy -2 next day
→ Work slower → more likely to work late again
→ Gym skipped again
→ Week 3: physical health starts dropping
→ Event: "You haven't exercised in 3 weeks. Feeling sluggish."
→ gymSkipCounter at 6 → more motivation-loss events fire
```

**Sleep debt cascade:**
```
Player sets sleep to 5hrs to make time for side hustle
→ Energy -5/day
→ Day 5: "Exhausted. Work quality dropping."
→ Day 10: "Boss flagged your mistakes."
→ Performance review at risk
→ Gym impossible (no energy)
→ Physical + mental both declining
```

**Burnout (mental hits 20%):**
```
Forced event — cannot be avoided:
  "You've hit your limit. Doctor orders rest."
  → Mandatory 2-week leave
  → No salary for 2 weeks
  → Business unattended (if any): revenue -40%
  → Mental health: +30 (forced recovery)
  → Doctor bill: $400
```

---

## 💰 MONEY

**Money is the most visible resource but not the most important.**

### Money Flows

**Monthly IN:**
- Salary (after tax deductions and EPF)
- Business profit (if running business)
- Rental income (if investment property owned)
- Dividends (if holding dividend stocks)
- FD interest (on maturity or monthly)
- Side hustle revenue

**Monthly OUT (auto-debits):**
- Rent / Mortgage EMI
- Loan EMIs (car, education, personal, business)
- Insurance premiums (health, vehicle, property, life)
- SIP contributions (if set)
- Phone, internet, subscriptions
- Food (based on food tier setting)
- Transport costs

**Player-controlled (set on Salary Day):**
- Emergency fund contribution
- Extra investment amount
- Extra EMI payment
- Discretionary budget (fun money)

### Emergency Fund

The buffer between a crisis and a spiral.

| Fund size | Protection |
|-----------|-----------|
| 0 months | Any crisis → forced loan → credit score drop |
| 1 month | Minor emergencies covered |
| 3 months | Job loss covered (3 months to find new job) |
| 6 months | Most crises absorbed without debt |

Visible warning: **"0 months of expenses saved. You are 1 event from debt."**

### Net Worth

Calculated and visible at all times:
```
Net Worth = Cash + Savings + Portfolio value + Crypto value 
          + Property equity + Business value 
          - All outstanding debts
```

Negative net worth is possible and shown prominently.

### Credit Score (350–900)

Affects interest rate on every loan.

| Score | Label | Loan rate |
|-------|-------|----------|
| 750–900 | Excellent | 8–10% |
| 650–749 | Good | 12–15% |
| 550–649 | Fair | 18–22% |
| Below 550 | Poor | 25–35% or rejected |

**Rises:** On-time EMI payments (+2/month per loan), clearing loans (+30), good credit history (time)
**Falls:** Missed EMI (-50), loan default (-150), multiple applications short-term (-20)
