# Phase 6 Technical Specification: Real Estate Financing, Scaled Down Payments & Housing Shocks

## 1. Overview & Objective
Phase 6 overhauls property acquisition into an authentic home financing simulation. Instead of treating the home target as the full property value, it models the **20% Down Payment Corpus** and the resulting **80% Long-Term Mortgage Loan (15–20 years)**. It introduces critical player choices when the down payment is achieved early and adds realistic housing pressure shocks (sudden eviction or steep rent spikes).

---

## 2. Core Real Estate Financing Model

### A. Property Valuation & Capital Structure
- **Total Property Cost ($V_{\text{home}}$):** e.g., ₹75,00,000 (city tier dependent).
- **Target Down Payment ($DP_{\text{target}}$):** 20% of property cost = ₹15,00,000.
- **Mortgage Principal ($P_{\text{loan}}$):**
  $$P_{\text{loan}} = V_{\text{home}} - DP_{\text{actual}}$$
- **Mortgage Terms:**
  - Tenure: 180 to 240 months (15 to 20 years).
  - Interest Rate: $8.5\%$ p.a.
  - Standard monthly reducing balance EMI calculation:
    $$\text{EMI} = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}, \quad r = \frac{0.085}{12}, \; n = 240$$

---

## 3. Decision Matrix: Early Down Payment Completion

When a player hits the ₹15,00,000 down payment target **before** their planned target age (e.g., at age 29 instead of 34):

```
                        [ Down Payment 100% Ready at Age 29 ]
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            ▼                             ▼                             ▼
    [ OPTION A: BUY NOW ]        [ OPTION B: SCALE DP ]       [ OPTION C: LOCK & WAIT ]
  • Buy home immediately       • Keep contributing to fund    • Freeze home fund
  • Start 20-yr mortgage now   • Reach ₹25L down payment      • Lock ₹15L in safe liquid yield
  • Move in, stop paying rent    by age 34                    • Waterfall SIP redirects
  • Begin equity compounding   • Loan drops from ₹60L to ₹50L   to Retirement
                               • Saves ₹18,000/mo in EMI!
```

### Strategic Trade-Off Comparison
1. **Option A (Buy Immediately):**
   - Eliminates rent immediately and begins property value appreciation (+6.5% p.a.).
   - Initiates mortgage EMI immediately, tightening monthly surplus earlier in career.
2. **Option B (Scale Down Payment / Overfund):**
   - By contributing for an additional 4–5 years, down payment grows to 35%–40%.
   - Loan principal shrinks drastically $\implies$ lifelong monthly EMI drops significantly, creating immense cash flow security for family years.
3. **Option C (Lock & Redirect):**
   - Preserves down payment in a stable debt instrument while pouring surplus into high-compounding equity/retirement.

---

## 4. Underfunded Down Payment at Target Age

If the character reaches their target age (e.g. 34) and down payment is only partially funded:
- **Decision 1: Postpone Purchase (Default):** Delay home purchase by 2 to 3 years to continue saving.
- **Decision 2: Dip into Other Funds:** Transfer shortfall from Bank Cash and Emergency Fund.
- **Decision 3: Downsize Budget:** Choose a Tier-2 or smaller apartment with a lower total cost matching the accumulated down payment.

---

## 5. Housing Pressure Shocks ("Spicing Things Up")

### Landlord Eviction / 40% Rent Spike Shock (`shock_landlord_eviction`)
- **Trigger:** Can trigger randomly between ages 28–36 if the player is still renting.
- **Narrative:** *"Your landlord is selling the flat. You must vacate within 30 days or accept a +40% rent increase!"*
- **Player Choices:**
  1. **"Emergency Home Purchase":**
     - Available if home fund is at least 70% complete.
     - Character uses existing fund, covers the gap with liquid cash, and buys immediately!
  2. **"Relocate to New Rental":**
     - Incurs moving fees & security deposit shock (-₹60,000 one-time).
     - Fixed expenses increase by +₹3,000/mo for higher market rent.

---

## 6. UI & Interaction Design (Cred NeoPOP Light Theme)

### A. Home Milestone Decision Sheet (`HomePurchaseModal.jsx`)
- Interactive real-estate financing calculator:
  - Down Payment Slider (from minimum 20% up to 50%).
  - Live recalculation of:
    - **Down Payment Paid** (₹)
    - **Mortgage Required** (₹)
    - **Monthly EMI** (₹/month)
    - **Total Interest Saved Over 20 Years** (₹)
- Allows players to simulate and feel the mathematical power of a larger down payment before committing.
