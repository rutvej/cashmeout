# 🎲 Scenarios — All Possible Game Events

Every event that can fire in CashFlow Life Sim is documented here. Use this file to:
- Review game balance (are there enough events of each type?)
- Identify missing scenarios
- Plan new event additions
- Verify counter/behavioral logic
- Test specific event chains

---

## Event Format

Each event in every file follows this structure:

```
### [EVENT-ID] Event Title
Trigger: [conditions]
Frequency: [timing]
Choices:
  A: [choice text] → Effect: [outcome]
  B: [choice text] → Effect: [outcome]
  C: (optional) [choice text] → Effect: [outcome]
Behavioral impact: [counter changes]
Financial impact: [money change]
Health impact: [bar changes]
Time impact: [slots affected]
```

---

## Event Files

| File | Events | Count |
|------|--------|-------|
| [01-career-events.md](01-career-events.md) | Job offers, rejections, promotions, layoffs, appraisals, work events | 40+ |
| [02-financial-events.md](02-financial-events.md) | Windfalls, tax events, EMI issues, unexpected expenses | 35+ |
| [03-health-events.md](03-health-events.md) | Illness, injury, burnout, doctor visits, recovery, gym chains | 35+ |
| [04-market-events.md](04-market-events.md) | Stock crash/surge, crypto FOMO, MF events, FD maturity | 40+ |
| [05-life-events.md](05-life-events.md) | Relationships, marriage, kids, friends, parents, social | 40+ |
| [06-business-events.md](06-business-events.md) | Supplier, staff, orders, tax, scaling, crises | 45+ |
| [07-property-events.md](07-property-events.md) | Tenant issues, maintenance, appreciation, legal disputes | 30+ |
| [08-behavioral-events.md](08-behavioral-events.md) | Impulse buys, lifestyle creep, FOMO, habit formation | 40+ |
| [09-emergency-crisis-events.md](09-emergency-crisis-events.md) | Medical, job loss, debt spiral, cascading crises | 35+ |

**Total: 340+ unique events documented**

---

## Event Frequency Targets

Per month, the player should experience approximately:

| Category | Events/month | Notes |
|----------|-------------|-------|
| Career | 0–3 | Driven by company culture + random |
| Financial | 1–3 | Driven by behavioral counters |
| Health | 0–2 | Driven by lifestyle choices |
| Market | 1–2 | Market phase determines intensity |
| Life | 1–2 | Life stage determines which fire |
| Business | 0–3 | Only if running a business |
| Property | 0–1 | Only if owning property |
| Behavioral | 1–5 | Driven directly by counters |
| Emergency | 0–0.5 | Rare but impactful |

**Salary Day is always Day 1 of each month (not a random event).**

---

## Event Design Principles

1. **No perfect choices** — every decision should have a real trade-off
2. **Consequences are felt** — effects should be visible and meaningful in numbers
3. **Compounding matters** — events should reference or amplify previous decisions
4. **Realistic** — based on real-world situations people face
5. **Educational** — player learns a financial/life lesson without being lectured
6. **Behavioral feedback** — almost every event should affect at least one counter
7. **Timing matters** — the same event hitting when emergency fund is full vs empty should feel completely different

---

## How to Add New Events

1. Pick the right scenario file based on category
2. Generate a unique EVENT-ID (e.g., `CAR-023`, `MKT-041`, `LFE-039`)
3. Follow the event format exactly
4. Specify which counters are affected
5. Make sure there are no "obviously correct" choices — trade-offs should be real
6. Add to the count in this README
