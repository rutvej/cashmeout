# Mechanism Spec: Investment Instruments, Realistic Risk & Compounding Engine (`specs/mechanics/04-investment-and-compounding-engine.md`)

## 1. Overview & Objective
This mechanism models 4 real-world Indian asset classes (Liquid Savings, Fixed Deposits, Gold/SGB, and Equity Mutual Funds). It introduces **realistic market behavior and liquidity constraints without breaking game progression**:
1. **Guaranteed vs. Volatile Assets**: Fixed guaranteed yields for bank instruments vs. realistic market cycles for equities.
2. **FD Premature Withdrawal Penalty**: Liquidating a Fixed Deposit before maturity incurs a real-world **1.5% interest/principal penalty**.
3. **Equity Market Cycles**: Long-term average remains ~12% p.a., but includes natural market oscillations and periodic mild corrections (-10% to -15%) followed by recoveries.
4. **Liquidity Matching**: Teaches the core financial principle that **Emergency Funds belong in Liquid Savings**, not volatile equities or locked FDs.

---

## 2. Asset Class Specifications

| Asset Class | Long-Term Return | Monthly Volatility ($\sigma_m$) | Liquidity / Exit Rules | Realistic Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Liquid Savings** (`savings`) | **4.0% p.a.** | **0% (Zero)** | Instant (0% penalty) | Safe haven. No market drops. Always available for emergencies. |
| **Fixed Deposit** (`fd`) | **7.0% p.a.** | **0% (Guaranteed)** | **1.5% Premature Exit Penalty** | Zero market volatility. If broken early for shocks/shortfalls, deducts 1.5% from the withdrawn amount. |
| **Gold / SGB** (`gold`) | **8.5% p.a.** | **$\pm 0.8\%$** | Moderate liquidity | Inflation hedge. Stays resilient or slightly gains during stock market drawdowns. |
| **Equity Mutual Funds** (`equity`) | **12.0% p.a.** (mean) | **$\pm 1.8\%$** monthly noise | Market-priced redemption | Long-term wealth multiplier (~12% p.a. over 20+ years). Subject to periodic market cycles. |

---

## 3. Mathematical Models & Return Formulas

### A. Monthly Return Calculations
For each month $m$ in simulation:
1. **Savings**:
   $$r_{\text{savings}}(m) = \frac{0.04}{12} = 0.003333$$
2. **Fixed Deposit (FD)**:
   $$r_{\text{fd}}(m) = \frac{0.07}{12} = 0.005833$$
3. **Gold / SGB**:
   $$r_{\text{gold}}(m) = \frac{0.085}{12} + \text{noise}_{\text{gold}}(m)$$
   where $\text{noise}_{\text{gold}}$ is a bounded deterministic PRNG gaussian offset ($\pm 0.8\%$).
4. **Equity Mutual Funds (Market Cycles)**:
   $$\text{Market Cycle Multiplier } M(t) = 1.0 + 0.08 \times \sin\left(\frac{2\pi \cdot t}{72}\right) + \text{noise}_{\text{equity}}(t)$$
   - Generates a natural 6-year macro cycle ($72\text{ months}$):
     - **Bull Run Phase**: Returns average $+1.2\%$ to $+1.6\%$ monthly ($+15\%$ to $+18\%$ annualized).
     - **Mild Correction Phase**: Returns pull back by $-0.8\%$ to $-1.5\%$ monthly for 4–6 months (total $-10\%$ to $-15\%$ dip), before recovering.
     - **Long-term mean**: Strictly maintains the 12.0% p.a. CAGR over 20–35 simulation years.

---

## 4. Forced Liquidation & Penalty Mechanics

When a life shock (medical, job loss, eviction) or milestone shortfall draws from goal balances:

1. **Drawing from Liquid Savings**:
   - `amountDrawn = requested`
   - `penalty = 0`
2. **Drawing from Fixed Deposit (FD)**:
   - Incurs a **1.5% early-break penalty**:
     $$\text{Penalty} = \text{amountDrawn} \times 0.015$$
   - The penalty is deducted from the player's capital and recorded in the decision journal.
3. **Drawing from Equity Mutual Funds**:
   - Redeemed at current market NAV.
   - If redeemed during a market dip ($M(t) < 0.95$), the player crystallizes an irreversible market loss.
   - The endgame audit flags: *"Forced Selling in Market Dip: Liquidated ₹X of equities at a loss during an emergency shock."*

---

## 5. Pure Function Interfaces

```javascript
/**
 * Calculates monthly return rate for an instrument taking into account PRNG seed and month.
 */
export function getMonthlyInstrumentReturnRate(instrumentId, monthIndex, seed) {
  // Pure deterministic function
}

/**
 * Calculates liquidation penalty and net proceeds when breaking an asset early.
 */
export function calculateLiquidationPenalty(instrumentId, withdrawalAmount) {
  if (instrumentId === 'fd') {
    return Math.round(withdrawalAmount * 0.015);
  }
  return 0;
}
```
