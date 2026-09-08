# 03 — Career System

---

## Career Ladder

Every job has explicit requirements. Attempting to apply without them → instant rejection with reason.

### Entry Level (Rung 1) — No requirements

| Job Title | Salary/month | Stress/month | Culture typical |
|-----------|-------------|-------------|----------------|
| Junior Analyst | $1,800 | Low | ★★★☆☆ |
| Sales Associate | $1,600 | Medium | ★★★☆☆ |
| Customer Support Rep | $1,400 | Medium | ★★★★☆ |
| Data Entry Clerk | $1,200 | Low | ★★★★☆ |
| Admin Assistant | $1,300 | Low | ★★★★★ |
| Junior Developer | $2,200 | Low-Med | ★★★☆☆ |

### Mid Level (Rung 2) — 1yr experience OR 1 relevant course

| Job Title | Salary/month | Stress/month | Culture typical |
|-----------|-------------|-------------|----------------|
| Analyst | $2,800 | Medium | ★★★☆☆ |
| Marketing Executive | $2,600 | Medium | ★★★☆☆ |
| Operations Lead | $2,400 | Medium | ★★★★☆ |
| Software Developer | $3,500 | Low-Med | ★★★★☆ |
| Financial Associate | $3,200 | Medium | ★★★☆☆ |
| HR Executive | $2,200 | Low-Med | ★★★★☆ |

### Senior Level (Rung 3) — 3yr experience + 1 course

| Job Title | Salary/month | Stress/month | Culture typical |
|-----------|-------------|-------------|----------------|
| Senior Analyst | $4,500 | Med-High | ★★★☆☆ |
| Senior Developer | $5,500 | Medium | ★★★★☆ |
| Product Manager | $5,200 | High | ★★★☆☆ |
| Marketing Manager | $4,200 | Medium | ★★★☆☆ |
| Senior Financial Analyst | $5,000 | Med-High | ★★★☆☆ |

### Manager Level (Rung 4) — 5yr experience + 2 courses

| Job Title | Salary/month | Stress/month | Culture typical |
|-----------|-------------|-------------|----------------|
| Finance Manager | $7,500 | High | ★★☆☆☆ |
| Engineering Manager | $8,500 | High | ★★★☆☆ |
| Marketing Director | $7,000 | Med-High | ★★★☆☆ |
| Operations Manager | $6,800 | High | ★★★☆☆ |
| Product Director | $8,000 | High | ★★☆☆☆ |

### Director / VP (Rung 5) — 7yr experience + 3 courses

| Job Title | Salary/month | Stress/month | Culture typical |
|-----------|-------------|-------------|----------------|
| VP Finance | $12,000 | Very High | ★★☆☆☆ |
| CTO | $16,000 | Very High | ★★★☆☆ |
| VP Marketing | $11,000 | High | ★★★☆☆ |
| COO | $14,000 | Very High | ★★☆☆☆ |
| Chief Investment Officer | $18,000 | Very High | ★★☆☆☆ |

---

## Course → Job Unlock Matrix

Courses unlock the next rung. More courses = more job options.

| Course | Unlocks |
|--------|---------|
| Financial Accounting | Rung 2 Finance jobs |
| Financial Modeling | Rung 3 Finance jobs |
| Risk Analysis | Rung 3-4 Finance/Ops jobs |
| Full-Stack Development | Rung 2-3 Tech jobs |
| Cloud Architecture | Rung 3-4 Tech jobs |
| AI & Machine Learning | Rung 4-5 Tech jobs |
| Digital Marketing | Rung 2-3 Marketing jobs |
| MBA (Executive) | Rung 4-5 any track |
| CFA (Finance) | Rung 4-5 Finance jobs |
| PMP (Project Mgmt) | Rung 3-4 Ops/Product jobs |

### Education Loan Option

If player cannot afford course fee:
```
Course: Financial Modeling — $15,000
Your savings: $3,000

Options:
  Pay outright: ❌ Insufficient funds
  Education loan: $12,000 @ 10% p.a. — $550/month EMI for 2 years
  Wait and save: Delays career progress

Break-even analysis shown:
  New salary after promotion: +$1,700/month
  EMI cost: $550/month
  Net gain from Month 1: +$1,150/month
  Loan paid off in: 22 months
```

---

## Job Application Flow

### Player-Initiated (Job Board Tab)

Player can open Job Board at any time. Shows all positions with:
- Salary range
- Culture rating (★ to ★★★★★)
- Requirements met / not met
- Application status (if applied)

**Application process:**
1. Player clicks Apply
2. System checks requirements (exp + courses)
3. If not met → instant rejection with reason
4. If met → "Under Review — 3 days"
5. After 3 days → Accept (60–85% probability) or Reject with reason

**Rejection reasons (even when qualified):**
- "Position filled internally"
- "Looking for someone with a specific industry background"
- "Salary expectations too high"
- "Another candidate was preferred"

**Max 2 active applications at a time.**

### Random Job Offers (Event-Driven)

Fires as an event card in the feed. Probability based on resume score:
- Resume 0–30: Rare offers, entry-level only
- Resume 31–60: Occasional offers, mid-level
- Resume 61–80: Regular offers, senior level
- Resume 81–100: Frequent offers, management level, with salary negotiation room

Offer card includes:
- Company name + culture rating
- Salary
- Role title
- What typical week looks like (late nights, vacation days)
- Projected health impact (gym skips/month, mental health drain)
- Layoff risk %
- Deadline: "Offer expires in 7 days"

**Salary negotiation (one attempt):**
- Player can try to negotiate higher (once per offer)
- Success probability: resume score / 100 × 70%
- If successful: +8–15% on top of offer
- If rejected: original offer still stands

---

## Company Culture System

Every company has a profile that determines what events fire and how often.

### Culture Data Points

| Field | Range | Effect |
|-------|-------|--------|
| `cultureRating` | 1–5 ★ | Overall indicator |
| `overtimeFrequency` | 0.0–1.0 | Probability of late-night event per week |
| `growthOpportunity` | 0.0–1.0 | Chance of raise/promotion at appraisal |
| `layoffRisk` | 0.0–1.0 | Annual probability of layoff event |
| `vacationDays` | 5–30 | Days off allowed per year |
| `weekendWork` | never / occasional / frequent | Weekend disruption events |

### Example Companies

| Company Type | Culture ★ | Overtime | Growth | Layoff Risk |
|-------------|----------|---------|--------|------------|
| Government office | ★★★★★ | 5% | 10% | 1% |
| Stable mid-size corp | ★★★★☆ | 20% | 30% | 5% |
| Big tech company | ★★★★☆ | 30% | 50% | 8% |
| Consulting firm | ★★☆☆☆ | 70% | 45% | 10% |
| Startup (early stage) | ★★☆☆☆ | 60% | 60% | 25% |
| Investment bank | ★★☆☆☆ | 75% | 55% | 12% |
| Family business | ★★★☆☆ | 15% | 20% | 3% |

---

## Getting Fired / Laid Off

Player does not always leave voluntarily. The game fires people.

### Layoff Triggers

| Trigger | Probability driver |
|---------|------------------|
| Company downsizing | `layoffRisk` × random annual roll |
| Poor performance review | `performanceRating` < 2/5 for 2 consecutive reviews |
| Startup shutdown | startup `layoffRisk` + market recession multiplier |
| Too many late arrivals | `lateArrivalCount` > 8 in a month |
| Business closure (employer) | External economic event |

### Layoff Event Card

```
EVENT: "Company Restructuring — Layoff Notice"

Your role has been eliminated due to company restructuring.
Last working day: End of this month.
Severance: 1 month salary.

Your emergency fund: 2 months of expenses.
Total runway: 3 months to find a new job.

[Open Job Board now]   [Take a breath first]
```

### Consequence of Layoff

| Emergency fund level | Outcome |
|---------------------|---------|
| 0 months | Immediate financial crisis event fires |
| 1 month | Moderate pressure — 1 month to find job |
| 3+ months | Stable — can afford to be selective |
| 6+ months | Can even take time to start a business or upskill |

---

## Annual Performance Appraisal

Fires every 12 months at current company.

### Performance Rating System

Rating is calculated based on:
- Attendance (missed work events)
- Overtime contributed (if company culture expects it)
- Courses completed while employed
- Late-night compliance (did player work late when events fired?)
- Behavioral counters (high sleep debt = poor performance flag)

### Appraisal Outcomes

| Rating | Outcome options |
|--------|----------------|
| ★★★★★ Exceptional | 15–20% raise + promotion offer |
| ★★★★☆ Strong | 8–12% raise OR promotion offer |
| ★★★☆☆ Meets expectations | 3–5% raise (below inflation) |
| ★★☆☆☆ Needs improvement | No raise + performance warning |
| ★☆☆☆☆ Poor | Termination notice |

### Raise Negotiation

Even when offered a raise, player can push for more:
```
Offer: 8% raise ($3,200 → $3,456)
Push for 15%? (Resume score 68 → 55% success chance)
  → Success: $3,200 → $3,680
  → Failure: 8% still stands (relationship slightly strained)
```

---

## Resignation Flow

When player accepts a new job offer:
```
Resigning from: Corp A
Notice period: 30 days (events still fire from old job)
Joining date: Day 31

Transition events possible:
  → "Counter-offer from Corp A: +$500 raise to stay"
  → "New company revokes offer during notice period" (rare, 5%)
  → "Old boss asks you to stay — how to handle?"
```
