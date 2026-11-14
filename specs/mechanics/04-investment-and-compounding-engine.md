# Mechanism Spec: Investment Instruments, Realistic Risk, Macro Cycles & Compounding Engine (`specs/mechanics/04-investment-and-compounding-engine.md`)

## 1. Overview & Objective
This mechanism models 4 real-world Indian asset classes (Liquid Savings, Fixed Deposits, Gold/SGB, and Equity Mutual Funds). It introduces **realistic monthly volatility, guaranteed macro market cycles, and actuarial stress testing without breaking game progression**:
1. **Guaranteed vs. Volatile Assets**: Fixed guaranteed yields for bank instruments vs. realistic market oscillations and volatility for equities and gold.
2. **Realistic Monthly Volatility**:
   - **Equity Mutual Funds**: Monthly returns bound within $[-3.5\%, +4.5\%]$ per month, averaging $\sim 12\%$ p.a. long-term CAGR.
   - **Gold / SGB**: Monthly returns bound within $[-1.0\%, +2.0\%]$ per month, averaging $\sim 8.5\%$ p.a. long-term CAGR.
3. **Guaranteed Macro Economic Market Crash (100% of Lifetimes)**: Every 37-year playthrough is guaranteed to experience a severe macro market crash between ages 34 and 45 with variable depth tiers ($-28\%$ to $-55\%$), testing the player's asset allocation.
4. **FD Premature Withdrawal Penalty**: Liquidating a Fixed Deposit before target maturity incurs a **1.5% premature exit penalty**.
5. **The Asset Allocation Stress Test**: Teaches the foundational financial principle of horizon-matching: **Short-term goals belong in Liquid Savings and Fixed Deposits**, while **long-term wealth (Retirement) belongs in Equity Mutual Funds**.

---

## 2. Asset Class Specifications

| Asset Class | Long-Term CAGR | Monthly Volatility Bounds | Liquidity / Exit Rules | Realistic Behavior & Role |
| :--- | :--- | :--- | :--- | :--- |
| **Liquid Savings** (`savings`) | **4.0% p.a.** | **0% (Zero Volatility)** | Instant (0% penalty) | Safe haven. No market drops. Principal is 100% protected. Always available for emergency shocks. |
| **Fixed Deposit** (`fd`) | **7.0% p.a.** | **0% (Guaranteed)** | **1.5% Premature Exit Penalty** | Zero market volatility. Capital guaranteed. If broken early for unexpected shortfalls, deducts 1.5% from withdrawn principal. |
| **Gold / SGB** (`gold`) | **8.5% p.a.** | **$[-1.0\%, +2.0\%]$ / month** | Moderate liquidity | Inflation hedge & safe haven. Experiences moderate cyclical swings, but remains resilient during equity market crashes. |
| **Equity Mutual Funds** (`equity`) | **12.0% p.a.** (mean) | **$[-3.5\%, +4.5\%]$ / month** | Market-priced redemption | High-growth wealth multiplier over 15–35 years. Subject to monthly volatility, multi-year cycles, and a **guaranteed macro crash (-28% to -55%)**. |

---

## 3. Mathematical Models & Return Formulas

### A. Monthly Return Calculations
For each month $m$ in simulation ($m \ge 0$):

1. **Liquid Savings**:
   $$r_{\text{savings}}(m) = \frac{0.04}{12} \approx 0.003333 \quad (+0.333\% / \text{mo})$$

2. **Fixed Deposit (FD)**:
   $$r_{\text{fd}}(m) = \frac{0.07}{12} \approx 0.005833 \quad (+0.583\% / \text{mo})$$

3. **Gold / SGB**:
   $$r_{\text{gold}}(m) = \frac{0.085}{12} + \text{noise}_{\text{gold}}(m, \text{seed})$$
   $$\text{noise}_{\text{gold}} \in [-0.017, +0.013] \implies r_{\text{gold}}(m) \in [-0.010, +0.020] \quad (-1.0\% \text{ to } +2.0\% / \text{mo})$$

4. **Equity Mutual Funds (Baseline Volatility)**:
   Outside the guaranteed macro crash window, equity returns incorporate cyclical macroeconomic trends and monthly bounded noise:
   $$r_{\text{equity\_baseline}}(m) = \frac{0.12}{12} + 0.008 \times \sin\left(\frac{2\pi \cdot m}{72}\right) + \text{noise}_{\text{equity}}(m, \text{seed})$$
   $$r_{\text{equity\_baseline}}(m) = \max\left(-0.035, \min\left(0.045, r_{\text{equity\_baseline}}(m)\right)\right) \quad (-3.5\% \text{ to } +4.5\% / \text{mo})$$
   - Preserves a strictly calibrated long-term mean of $\sim 12.0\%$ p.a. over 20–35 simulation years.

---

## 4. Guaranteed Macro Economic Market Crash (100% of Lifetimes)

In real life, no 37-year career passes without at least one catastrophic macroeconomic crisis (e.g. 1992 Harshad Mehta / Balance of Payments, 2000 Dot-Com Meltdown, 2008 Global Financial Crisis, 2020 COVID Market Crash). To test the player's asset allocation integrity, **every single game run is guaranteed to experience a severe macro market crash between ages 34 and 45**.

### A. Deterministic Trigger Timing
The crash trigger age and starting month are computed deterministically from the character's PRNG seed:
$$A_{\text{crash}} = 34 + \lfloor \text{prng}(\text{seed} + \text{"_crash_age"}) \times 12 \rfloor \in [34, 45]$$
$$M_{\text{crash}} = (A_{\text{crash}} - \text{startingAge}) \times 12 + \lfloor \text{prng}(\text{seed} + \text{"_crash_mo"}) \times 12 \rfloor$$

### B. Variable Crash Depth Tiers
The severity of the crisis is determined deterministically by the character PRNG seed:

| Severity Tier | Probability | Historical Analogy | Cumulative Drop ($\Delta_{\text{crash}}$) | Drop Phase Duration |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (Mild Bear Market)** | 35% | 2011 Euro Debt Crisis / 2015-16 China Slowdown | **$-28\%$ to $-34\%$** | 3–4 months |
| **Tier 2 (Severe Crisis)** | 45% | 2020 COVID Crash / 1996 Asian Financial Crisis | **$-35\%$ to $-44\%$** | 3–5 months |
| **Tier 3 (Catastrophic Meltdown)** | 20% | 2008 Global Financial Crisis / 2000 Dot-Com Bust | **$-48\%$ to $-55\%$** | 4–5 months |

### C. The 3-Phase Crash & Recovery Trajectory
When month $m \ge M_{\text{crash}}$, the equity market executes a deterministic 3-phase trajectory:

```
 Equity NAV
   ▲
   │        Peak
100┼─────────╮
   │          \ [ 1. Plunge Phase: 3-5 mos ]
 70┼           \  (-28% to -55% Drop)
   │            \
 50┼             ╰──────────────╮ [ 3. Bull Rebound Phase: 18-30 mos ]
   │              [ 2. Trough ]  \                         ╭─────────
   │               Consolidation  \            ╭───────────╯
 30┼               (6 Months)      ╰───────────╯
   │
   └───────────┴───────────────┴───────────────────────────┴─────────► Month
            M_crash        M_crash + 5                 M_recovery
```

1. **Phase 1: Plunge Phase (Months $M_{\text{crash}} \dots M_{\text{crash}} + D_{\text{plunge}} - 1$, with $D_{\text{plunge}} \in [3, 5]$)**:
   - Equity markets drop sharply. The monthly drop is distributed across the duration:
     $$r_{\text{equity}}(m) = \left(1 - |\Delta_{\text{crash}}|\right)^{1 / D_{\text{plunge}}} - 1 + \epsilon_m$$
   - Generates realistic brutal monthly drawdowns (e.g., $-9\%$ to $-15\%$ per month).
2. **Phase 2: Trough & Bottom Consolidation (Next 6 Months)**:
   - Markets reach the absolute bottom and trade in a choppy, sideways range.
   - Monthly returns fluctuate tightly within $[-1.0\%, +1.0\%]$ with zero directional recovery.
   - Psychological test: Portfolio looks depressed; players who panic and sell crystallize massive losses.
3. **Phase 3: Bull Rebound & Recovery (Next 18 to 30 Months)**:
   - Aggressive economic recovery and bull market.
   - Monthly returns average $+1.5\%$ to $+3.0\%$ per month ($+18\%$ to $+36\%$ annualized).
   - Equities fully recover to pre-crash levels and resume the secular 12% p.a. long-term compounding path.

---

## 5. The Asset Allocation Stress Test

The Guaranteed Macro Crash acts as the ultimate actuarial test of the player's financial architecture:

### A. The Short-Term Goal Trap (Capital Impairment)
* **The Error:** A player places short-term milestone goals (Emergency Shield, Car at 27, Wedding at 29, Home Down Payment at 34) into **Equity Mutual Funds** to chase higher returns.
* **The Consequence:**
  - If the crash hits between ages 34 and 45 when the Home Down Payment, Child Education, or Wedding is due:
  - The goal balance drops by $-28\%$ to $-55\%$ right before the target deadline!
  - **Forced Liquidation at the Trough:** If the player is forced to liquidate equities to fund the milestone or shock, they sell at the absolute bottom, crystallizing catastrophic losses.
  - The player faces massive milestone shortfalls, forced high-interest loans, or having to postpone their life milestone.

### B. The Horizon Segregation Defense (Liquid / FD Protection)
* **The Solution:** The player segregates goals by time horizon:
  - **Emergency Fund (0–6 mos):** Kept strictly in Liquid Savings (4%). 100% immune to market crash. Available instantly.
  - **Short-Term Milestones (< 5 yrs):** Kept in Fixed Deposits (7%). Zero volatility. 100% principal and accrued interest guaranteed.
  - **Gold / SGB:** Remains steady or rallies as a safe haven during the equity panic.
* **The Result:** Even when the equity market drops $-45\%$, all short-term goals and emergency reserves remain 100% intact!

### C. The Long-Term Compounding Miracle (Retirement & DCA)
* **Retirement Horizon (15–35 yrs):**
  - The player does NOT need to withdraw retirement funds during their 30s or 40s.
  - **Rupee Cost Averaging (SIP Miracle):** Because the player's monthly SIP continues running during the crash:
    $$\text{Units Purchased} = \frac{\text{Monthly SIP}}{\text{Depressed NAV}}$$
  - The player accumulates massive unit volumes during the 3-5 month crash and 6-month bottom consolidation at bargain valuations.
  - When the 18–30 month recovery occurs, these cheap units explode in value, generating superior multi-crore terminal wealth at Age 60.

---

## 6. Forced Liquidation & Penalty Mechanics

When a life shock (medical, job loss, eviction) or milestone shortfall draws from goal balances:

1. **Drawing from Liquid Savings**:
   - `amountDrawn = requested`
   - `penalty = 0` (Instant and free).
2. **Drawing from Fixed Deposit (FD)**:
   - Incurs a **1.5% premature exit penalty**:
     $$\text{Penalty} = \text{amountDrawn} \times 0.015$$
   - Deducted from the player's balance and logged in the scorecard audit.
3. **Drawing from Equity Mutual Funds**:
   - Redeemed at current market NAV.
   - If redeemed during a crash or correction, the player crystallizes an irreversible market loss.
   - The endgame scorecard flags: *"Forced Selling in Market Crash: Liquidated ₹X of equities at a loss during macro crisis."*

---

## 7. Pure Function Interfaces

```javascript
import { createPRNG } from './prng.js';

/**
 * Computes deterministic crash parameters for a character lifetime.
 */
export function getEquityCrashProfile(seed, startingAge = 23) {
  const rng = createPRNG(`${seed}_macro_crash`);
  
  // Crash trigger between age 34 and 45
  const crashAge = 34 + Math.floor(rng() * 12);
  const crashMonthOfYear = Math.floor(rng() * 12);
  const triggerMonthIndex = (crashAge - startingAge) * 12 + crashMonthOfYear;
  
  // Crash severity tier roll
  const tierRoll = rng();
  let tier, depthPercent, plungeMonths, recoveryMonths;
  
  if (tierRoll < 0.35) {
    tier = 1; // Mild Bear Market (-28% to -34%)
    depthPercent = -(0.28 + rng() * 0.06);
    plungeMonths = 3 + Math.floor(rng() * 2);
    recoveryMonths = 18 + Math.floor(rng() * 6);
  } else if (tierRoll < 0.80) {
    tier = 2; // Severe Crisis (-35% to -44%)
    depthPercent = -(0.35 + rng() * 0.09);
    plungeMonths = 3 + Math.floor(rng() * 3);
    recoveryMonths = 22 + Math.floor(rng() * 6);
  } else {
    tier = 3; // Catastrophic Meltdown (-48% to -55%)
    depthPercent = -(0.48 + rng() * 0.07);
    plungeMonths = 4 + Math.floor(rng() * 2);
    recoveryMonths = 26 + Math.floor(rng() * 5);
  }

  const consolidationMonths = 6;
  const totalCrashDuration = plungeMonths + consolidationMonths + recoveryMonths;

  return {
    crashAge,
    triggerMonthIndex,
    tier,
    depthPercent,
    plungeMonths,
    consolidationMonths,
    recoveryMonths,
    totalCrashDuration,
  };
}

/**
 * Calculates monthly return rate for an instrument taking into account
 * PRNG seed, monthly volatility, and guaranteed macro crashes.
 */
export function getMonthlyInstrumentReturnRate(instrumentId, monthIndex = 0, seed = 'default', startingAge = 23) {
  const m = Number(monthIndex) || 0;

  if (instrumentId === 'savings') {
    return 0.04 / 12; // Flat 4% p.a. (zero volatility)
  }

  if (instrumentId === 'fd') {
    return 0.07 / 12; // Flat 7% p.a. (zero volatility, guaranteed)
  }

  if (instrumentId === 'gold') {
    const rng = createPRNG(`${seed}_gold_${m}`);
    const noise = (rng() * 2 - 1) * 0.015; // Moderate cyclical noise
    const rate = (0.085 / 12) + noise;
    return Math.max(-0.010, Math.min(0.020, rate)); // Bounded [-1.0%, +2.0%]
  }

  if (instrumentId === 'equity') {
    const crash = getEquityCrashProfile(seed, startingAge);
    const startM = crash.triggerMonthIndex;
    const plungeEnd = startM + crash.plungeMonths;
    const consolEnd = plungeEnd + crash.consolidationMonths;
    const recoveryEnd = consolEnd + crash.recoveryMonths;

    // Phase 1: Plunge Phase
    if (m >= startM && m < plungeEnd) {
      const perMonthDrop = Math.pow(1 + crash.depthPercent, 1 / crash.plungeMonths) - 1;
      const rng = createPRNG(`${seed}_crash_noise_${m}`);
      const microNoise = (rng() * 2 - 1) * 0.01;
      return perMonthDrop + microNoise;
    }

    // Phase 2: Consolidation Phase (Bottom Bumping)
    if (m >= plungeEnd && m < consolEnd) {
      const rng = createPRNG(`${seed}_consol_noise_${m}`);
      return (rng() * 2 - 1) * 0.01; // Choppy [-1%, +1%]
    }

    // Phase 3: Recovery Phase (Bull Rebound)
    if (m >= consolEnd && m < recoveryEnd) {
      const recoveryTotal = Math.abs(crash.depthPercent) / (1 + crash.depthPercent);
      const perMonthGain = Math.pow(1 + recoveryTotal, 1 / crash.recoveryMonths) - 1;
      const rng = createPRNG(`${seed}_rec_noise_${m}`);
      return perMonthGain + (rng() * 2 - 1) * 0.005;
    }

    // Normal Market Environment: Cyclical Macro Sine + Monthly Volatility Bounded [-3.5%, +4.5%]
    const rng = createPRNG(`${seed}_equity_${m}`);
    const noise = (rng() * 2 - 1) * 0.025;
    const cycle = 0.008 * Math.sin((2 * Math.PI * m) / 72);
    const baseRate = (0.12 / 12) + cycle + noise;
    return Math.max(-0.035, Math.min(0.045, baseRate));
  }

  return 0.04 / 12;
}

/**
 * Calculates liquidation penalty when breaking an asset early.
 */
export function calculateLiquidationPenalty(instrumentId, withdrawalAmount) {
  const amt = Number(withdrawalAmount) || 0;
  if (amt <= 0) return 0;
  if (instrumentId === 'fd') {
    return Math.round(amt * 0.015); // 1.5% penalty for early FD withdrawal
  }
  return 0;
}
```
