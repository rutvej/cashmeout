# 12 — Market Cycles & NPC Social Pressure

The game environment is populated by dynamic macroeconomic waves and competitive peers whose actions test your psychological resolve.

---

## 1. The 10-Year Macroeconomic Trajectory

The simulation progresses through five defined economic eras:

```
Year 1 ──> Year 3 : Bull Expansion Phase
Year 4 ──> Year 5 : Euphoric Peak & Speculative Bubble
Year 5 ──> Year 6 : Severe Macroeconomic Recession & Crash
Year 7 ──> Year 8 : Sluggish Post-Crisis Reconstruction
Year 9 ──> Year 10: Tech & Innovation Super-Cycle
```

### Macroeconomic Impact Matrix

| Indicator | Bull Era (Y1–3, Y9–10) | Bubble Era (Y4–5) | Recession Era (Y5–6) | Recovery Era (Y7–8) |
|---|---|---|---|---|
| **Stock Market Index** | +15% to +22% p.a. | +28% p.a. (Volatile) | **-35% to -45% Drawdown** | +12% p.a. |
| **Annual Inflation** | 4.0% – 5.5% | 7.5% – 9.0% | 2.0% – 3.0% (Deflationary pressure) | 4.5% |
| **Corporate Layoff Risk** | 4% annual probability | 6% | **22% annual probability** | 8% |
| **Commercial Loan Rates** | 8.5% | 11.0% | 14.5% (Credit crunch) | 9.0% |
| **Business Revenue** | +12% YoY baseline | +25% YoY | **-28% YoY contraction** | +8% YoY |

---

## 2. Inflation & Lifestyle Creep

Every 360 days, the simulation calculates the annual inflation delta:
- **Automatic Price Escalation:** Rent increases by 6–8%, base groceries increase by 5–7%, utility costs rise.
- **The Real Wage Illusion:** If the player receives a 4% salary raise during a year with 7% inflation, their real purchasing power has contracted by 3%. The UI explicitly visualizes this real-dollar decline.

---

## 3. The 8 NPC Archetypes & Social Pressure Engine

Eight non-player peers advance their lives alongside the player, acting as mirrors and FOMO triggers in the feed:

| NPC Name | Behavioral Archetype | Life Strategy | Typical Trajectory Across 10 Years |
|---|---|---|---|
| **Aarav Sharma** | Serial Entrepreneur | Quits job early, raises seed money, high leverage | Launches 2 failed startups before hitting a $2M exit in Year 9. |
| **Priya Mehta** | Aggressive High-Beta Trader | Puts 90% of net worth in tech options and crypto | Multiplies wealth 4x in Bull run; loses 70% in Year 5 crash; struggles with anxiety. |
| **Vikram Verma** | Cautious Saver | Strict fixed deposits, zero equity risk | Completely safe from crashes, but real wealth gets eroded 30% by inflation. |
| **Ananya Iyer** | Pragmatic Business Owner | Launches retail shop, reinvests profits slowly | Steady $6,000/mo cashflow, buys commercial property in Year 6. |
| **Rohan Gupta** | Real Estate Landlord | Heavy mortgages, buys 3 rental flats | Cash-poor early due to high EMIs; by Year 8, rental income covers all living costs. |
| **Sneha Patel** | Disciplined Boglehead / SIP | Index funds, 50% savings rate, calm life | Steady, unemotional compounder; reaches $180k net worth by Year 10. |
| **Kabir Das** | Consumerist Spender | Upgrades cars, buys designer clothes, luxury vacations | Earns high corporate salary ($8k/mo) but has $0 net worth and $25k card debt. |
| **Neha Joshi** | High-Stress Executive | 80-hour weeks at consulting firm, climbs to Director | Reaches $14k/mo salary by Year 7, but suffers 2 hospitalizations and hair loss. |

### Social Pressure Event Types
1. **The Brag Post (Elevates `cryptoFomoCounter`):**
   > *"Aarav just posted a photo with his new sports car on LinkedIn: 'Blessed to hit our Series A milestone.' You are currently taking the subway."*
2. **The Cautionary Tale (Reduces Risk Appetite):**
   > *"Priya was liquidated on her leveraged crypto position during yesterday's flash crash. She is asking to crash on a friend's couch."*
3. **The Group Trip Peer Pressure:**
   > *"Four college friends are booking a $2,200 group holiday in Bali. Join them or pass?"*
   - *Join:* -$2,200 cash, +20 Happiness, prevents social isolation.
   - *Pass:* Keeps money in emergency fund; triggers slight FOMO regret.
