# 13 — Resume System & Algorithmic Scoring

The Resume is the invisible engine that powers inbound headhunter offers, corporate application success rates, and salary negotiation power. It updates automatically with every career milestone.

---

## 1. Resume Structure & Real-Time Elements

A player can inspect their generated CV at any moment via the Profile tab:

```
╔════════════════════════════════════════════════════════════╗
║ CURRICULUM VITAE: ALEX MORGAN                              ║
║ Age: 27 | Professional Experience: 5.2 Years              ║
╠════════════════════════════════════════════════════════════╣
║ 💼 EMPLOYMENT HISTORY                                      ║
║  • Senior Investment Analyst | Zenith Capital (Y4 – Pres)  ║
║    Base Comp: $5,200/mo | Performance Rating: ★★★★☆        ║
║  • Financial Associate | Apex Banking Ltd (Y2 – Y4)        ║
║    Base Comp: $3,200/mo | Promoted Internally              ║
║  • Junior Financial Analyst | Metro Corp (Y1 – Y2)         ║
║    Base Comp: $1,800/mo | Left on good terms               ║
╠════════════════════════════════════════════════════════════╣
║ 🎓 ACCREDITATIONS & LICENSES                               ║
║  • Financial Modeling & Valuation Analyst (FMVA) — Y2      ║
║  • Advanced Python for Quant Finance — Y3                  ║
║  • Chartered Financial Analyst (CFA Level I) — Y5          ║
╠════════════════════════════════════════════════════════════╣
║ 🏢 VENTURES & LEADERSHIP                                   ║
║  • Founder, FinTech Advisory Side Hustle ($1,500/mo rev)   ║
╠════════════════════════════════════════════════════════════╣
║ 🛠️ VERIFIED COMPETENCIES                                   ║
║  Discounted Cashflow (DCF) • Equity Research • SQL •       ║
║  Team Mentorship • Commercial Due Diligence                ║
╠════════════════════════════════════════════════════════════╣
║ 📈 ALGORITHMIC RESUME SCORE: 76 / 100                      ║
╚════════════════════════════════════════════════════════════╝
```

---

## 2. Resume Score Formula (Scale: 0 to 100)

$$\text{Score} = \text{Exp Points} + \text{Course Points} + \text{Job Rank Points} + \text{Stability Bonus} + \text{Founder Bonus}$$

1. **Experience (Max 25 pts):** +2.5 points per full year of active employment or enterprise operations.
2. **Education & Certifications (Max 30 pts):** +6 points per completed specialized curriculum tier.
3. **Hierarchy Rank Achieved (Max 25 pts):**
   - Entry Level: 5 pts
   - Mid Level: 10 pts
   - Senior Level: 15 pts
   - Managerial Rank: 20 pts
   - Director / C-Suite: 25 pts
4. **Employment Continuity (Max 10 pts):** Continuous employment with zero jobless gaps > 60 days grants +10 pts.
5. **Entrepreneurship Premium (Max 10 pts):** Launching and scaling a registered commercial business grants +5 to +10 pts.

---

## 3. How Resume Score Drives In-Game Mechanics

| Resume Score Tier | Inbound Headhunter Inquiries | Corporate Application Rejection Rate | Base Salary Negotiation Leverage |
|---|---|---|---|
| **0 to 30 (Junior/Stagnant)** | 0% chance per quarter | 60% rejection rate for Mid-tier roles | 0% (Take what is offered) |
| **31 to 55 (Developing)** | 8% chance per month | 25% rejection rate for Mid-tier roles | +5% above posted salary |
| **56 to 75 (Senior Pro)** | 22% chance per month | 10% rejection rate; qualifies for Senior jobs | +10% to +15% above posted salary |
| **76 to 90 (Elite Tier)** | 40% chance per month | Direct interviews with C-Suite | +20% with signing bonus |
| **91 to 100 (Industry Icon)** | Constant recruitment | Board director opportunities | Can name terms and negotiate equity |
