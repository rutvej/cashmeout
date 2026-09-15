# Finance Life-Sim — Full Game Spec

**Goal:** A 20-year, no-backend, single-page finance simulation game (age 22 → 42) that teaches CFP-level concepts (assets vs liabilities, insurance, investing, debt, inflation) through lived consequences rather than lessons. Ends in a Google Form funnel to validate two follow-on products.

---

## 1. Core Loop

1. **Spawn** — random seed generates starting conditions (see §2).
2. **Set goals** — player adds their own goals from suggested types + custom ones (see §3).
3. **Sim runs continuously** — no manual "advance" click. Time moves forward at a random pace and auto-pauses only when something happens: an event, a milestone, or a new income/expense source starting.
4. **Player acts** on whatever card is shown, sim resumes, repeat until 20 in-game years have passed.
5. **Scorecard → Google Form** funnel at the end.

---

## 2. Starting Conditions (fully random every game)

Each of these rolls independently — no fixed archetype:

| Variable | Possible values |
|---|---|
| Income source | Job only / Family business (already running) / Passive income already active, no business / Nothing yet, just starting a job |
| Starting savings | ₹0 to a random amount |
| Existing loan | None, or a random loan (education loan, personal loan) with its own EMI |
| Existing debt | None, or random informal debt |
| City tier | Tier 1 / Tier 2 / Tier 3 (drives goal costs — see §5) |
| Starting salary | Randomized band appropriate to city tier |
| Home ownership | Owns a home already, or no home — if owned, its maintenance cost is auto-added to fixed monthly deductions |
| Car ownership | Owns a car already, or no car — if owned, its maintenance cost is auto-added to fixed monthly deductions |

**UI note:** Screen shows a running day counter as time passes. Events fire on a random day; the counter is the only "clock" the player sees — no manual advance control.

---

## 3. Goals System

- Player adds goals themselves. No fixed goal list.
- **Known types** (Home, Car, Marriage, Business, Passive Income) come with a *suggested* price (from §5 table, adjustable) and a **realistic inflation rate** specific to that type.
- **Custom/own goals** (e.g. "Kid's future fund") get a **flat static inflation rate** (default 6%/yr, general CPI proxy).
- Goals can be **deleted** anytime.
- Goals can be **added mid-game**. When added mid-game, player chooses:
  - **Retroactive split** — recompute all bucket %'s as if this goal existed from day one, or
  - **Fresh start** — existing buckets keep their current balances untouched; the new goal's bucket starts at ₹0 from today.

---

## 4. Money Model — Buckets vs Instruments (two independent layers)

**Buckets** = a purely *visual/tracking* layer. They represent % claims on one single real pool of money. They are **not** real ring-fenced accounts — the player can spend from any bucket at any time regardless of its label.

**Instruments** = where the real pool is physically invested. This is the layer that actually generates growth/loss.

```
Total Pool (₹) 
 ├─ Instrument split (where money sits, drives growth):
 │   e.g. 50% Savings / 20% Stocks / 10% Gold / 10% MF / 10% FD
 └─ Bucket split (what the money is "for", a % label):
     e.g. 20% Car / 20% Home / 20% Marriage / 20% Business / 20% Kids-future

Bucket value = bucket% × Total Pool value
Total Pool grows/shrinks based on the blended return of the instrument split.
Growth flows proportionally back into every bucket's value.
```

- **Allocation screen** appears any time a new income or expense source begins (new job, business launched, passive income starts). Player decides how the **surplus** (income minus fixed deductions) splits across bucket %'s.
- **Fixed deductions** (existing loan EMIs, real living costs — food, electricity, etc.) are automatically applied first and are **not editable** in this screen.
- Player can freely re-split instrument allocation at any time (not gated to allocation screen).

---

## 5. Instruments — Return & Volatility Model

| Instrument | Avg return | Volatility | Liquidity |
|---|---|---|---|
| Savings account | 3.5%/yr | None | Instant |
| Fixed Deposit (FD) | 7%/yr | None | Locked; small penalty to break early |
| Gold | ~8%/yr long-run | Swings −5% to +20% per event | High |
| Mutual Funds (SIP-style) | ~11–12% CAGR | Occasional −10% to −20% correction years | High |
| Stocks | ~15% long-run | Swings −30% to +40% per event | High |
| Home equity | 6–8%/yr appreciation | Low | Illiquid until sold |

---

## 6. Goal Costs by City Tier (₹) + Inflation

| Goal | Tier 1 (Mum/Del/Blr) | Tier 2 | Tier 3 | Inflation/yr |
|---|---|---|---|---|
| Home | 60L – 1.2Cr | 35L – 70L | 15L – 40L | 6–7% |
| Car | 8L – 15L | 6L – 12L | 5L – 10L | 4–5% |
| Marriage | 10L – 25L | 7L – 18L | 5L – 12L | 7–8% |
| Business setup | 5L – 20L | 3L – 15L | 2L – 10L | 5–6% |
| Custom/own goal | player-defined | player-defined | player-defined | flat 6% |

---

## 7. Event Deck (20 cards, pure random draw — never weighted by financial state)

Eligibility conditions (e.g. "only if vehicle owned") are **not** the same as weighting by fragility — they just prevent nonsensical draws.

1. **Medical Emergency (bad)** — ₹50k–5L bill. Covered cleanly if emergency fund suffices; otherwise forced loan/asset sale at a penalty.
2. **Job Loss (bad)** — income drops to ₹0 for a random 2–6 months; fixed costs keep deducting.
3. **Market Crash (bad)** — stocks portion of pool drops 20–35% instantly.
4. **Market Boom (good)** — stocks portion jumps 20–40%.
5. **MF Correction (bad, mild)** — MF portion dips 8–15%.
6. **Salary Hike (good)** — 8–20% raise, opens allocation screen.
7. **Job Switch Offer (choice, gated)** — only eligible once enough experience/tenure accrued. Stable MNC pay vs. risky higher-paying startup.
8. **Vehicle Accident (bad, needs vehicle)** — ₹10k–1L repair; insured = small copay, uninsured = full hit.
9. **Uninsured Illness (bad)** — large bill if no health insurance; small copay if insured.
10. **Family Wedding Ask (bad, social)** — expected contribution ₹20k–2L.
11. **Scam/Fraud Attempt (bad)** — small % of liquid savings lost to a scam.
12. **Inheritance/Gift (good)** — windfall ₹1L–10L.
13. **Business Opportunity (choice)** — upfront capital needed; payoff resolved later by random roll + capital invested.
14. **Business Downturn (bad, needs active business)** — business income drops/stops for a period.
15. **Gold Surge (good)** — gold jumps 15–25%.
16. **Inflation Spike (bad, macro)** — goal costs re-inflate faster for a stretch.
17. **Tax Event (neutral/bad)** — small refund or a late-fee notice, random.
18. **Theft (bad)** — loss from idle cash/physical assets only, never from bank/digital holdings.
19. **Loan Rate Change (neutral/bad, needs floating loan)** — EMI adjusts up or down.
20. **Work Bonus (good, filler)** — small unexpected cash bump.

Roughly 55% bad / 45% good across the deck.

---

## 8. Interconnected / Consequence Cards

These are richer than the flat event deck — each is a small decision tree with lasting state changes.

### 8.1 Course / Skill-Up Card
- Trigger: random, independent of job status.
- Choice: pay course cost **out of pocket** (lump deduction from pool) or **take a loan** (new EMI created for the course amount).
- Outcome: on completion, raises the player's future salary ceiling and/or unlocks better job offers (feeds into §8.2 eligibility).

### 8.2 Job Offer Card
- **Gated** — only appears once enough experience/tenure has accrued (and/or after a completed course).
- Choice: accept (new salary, may re-trigger allocation screen) or decline.

### 8.3 Home Decision Tree
- Trigger: random "home-buying opportunity" event.
- If enough cash on hand → **buy outright**.
- If not → **take a home loan**, new EMI starts.
- If the player **already owns a home** at this point:
  - Keep the old home and **rent it out** → it becomes an income-generating **asset**.
  - **Sell** the old home → proceeds reduce the principal needed on the new loan.
- Player may instead choose to **rent** rather than buy at all — ongoing rent expense, no asset built, easier on cash flow.
- **Ongoing home state:**
  - Lived-in home → **liability** (recurring maintenance cost) but still appreciates in value (§5).
  - Rented-out home → **asset** (generates rental income) and still appreciates.
- Player can **sell any owned home at any time** for current market value, then choose: buy another, rent, downsize, or upsize (with a new loan).

### 8.4 Business Venture Card
- Trigger: random side-business / joint-business opportunity.
- If **loan-financed** → new EMI runs against the business's income stream.
- If **self-funded** (no loan) → pure new income stream added, no EMI drag.
- Feeds into event #14 (Business Downturn) eligibility once active.

---

## 9. Goal Bucket Milestone Behavior

When a bucket's value crosses its goal's current (inflation-adjusted) target:

- **Spend in full** — goal is "achieved," money leaves the pool, consequence applied per §10.
- **Grow the bucket** — raise the target and keep saving (player wants more before acting).
- **Delete the bucket** — abandon the goal; its % claim is redistributed (player chooses how, same retroactive/fresh-start choice as §3).

---

## 10. Post-Purchase Consequences by Goal Type

| Goal | Behavior after purchase |
|---|---|
| Car | New recurring maintenance cost added going forward. |
| Marriage | Fully consumed — no return, no further recurring cost. Pure sunk expense. |
| Home | Asset or liability depending on use — see §8.3. Always appreciates regardless. |
| Business | Ongoing income stream (asset-like) but exposed to Business Downturn risk. |
| Custom/own goal | Ambiguous by design — player-defined, so asset/liability nature is up to context, same as home. |

---

## 11. End of Game

### 11.1 Ways the game can end
- **Broke ending** — player runs completely out of money with no assets left to sell and no way to cover a mandatory deduction. Game ends immediately, right there — doesn't wait for year 20.
- **Full-run ending** — player reaches age 42 / year 20. **Resolved:** yes, the player can keep adding goals and taking loans all the way to year 20 — the game never "locks." This matches real life (goals and financing needs don't stop), and it's already what the results formula in §11.2 is built for: bonus goals reward late additions, and a struggling player can still take one more loan to try to recover rather than being cut off early.
- **Requirement:** at least one goal must exist at end-state for a results screen to be shown at all. A run with zero goals ever set has nothing to score.

### 11.2 Results formula
```
Result = Goals Achieved − Sacrificed Goals + Bonus Goals
```
- **Achieved** — a goal's bucket was spent in full to complete it. Still counts as achieved even if later sold (e.g. bought a home, sold it years later — that's a sold asset, not a failure).
- **Sacrificed** — a goal was deleted *before* ever being completed.
- **Bonus** — a goal that was added mid-game (not part of the original set at spawn).

### 11.3 Scorecard contents
Shown at either ending, before the Form funnel:
- Goals achieved (%), listed with any sacrificed/bonus goals called out separately
- Final net worth (or the balance at the point of going broke)
- Financial literacy score (derived from: emergency fund maintained, insurance held, diversification, EMI-to-income ratio kept healthy, use of loans vs cash)
- "Biggest mistake" callout (single worst decision, computed from the play-through)

## 12. Funnel — Google Form

Two **separate** questions (not either/or):
1. Would you pay for an app that teaches personal finance this way?
2. Would you pay for a privacy-secured app where you input your *real* financial data to simulate your own life and see your real goal-achievement probability?

---

## 13. Build Phasing Note (for later decision, not yet chosen)

- **v1 candidate scope:** core loop + two-layer money model + 20-card event deck + simple (non-branching) versions of course/job/home/business cards.
- **v2 candidate scope:** full branching decision trees in §8 (home resell/re-buy loop, course-gated promotions), full milestone spend/grow/delete flow (§9), full asset/liability tracking (§10).
- Decision on which to build first is still open.

---

## 14. See also

UI/screen design and tech stack/deployment have been split into their own documents:
- `finance-sim-game-ui-spec.md` — screens, layout, visual design
- `finance-sim-game-tech-stack.md` — framework choice + GitHub Pages deployment

