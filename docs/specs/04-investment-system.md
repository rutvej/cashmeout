# 04 — Investment System

The investment system provides both passive and active avenues for wealth generation. Investments are accessible at any time from the navigation bar as well as through spontaneous market event cards.

---

## 1. Stock Market & Trading

### Overview & Access
- **Always Accessible:** Players can inspect tickers, analyze historical performance, and buy or sell shares on demand via the "Invest" tab.
- **Trading Modes:**
  - **Long-Term Holding (Buy & Hold):** Invest liquid cash, collect periodic dividends, and hold through market cycles. Incurs 0 time slots per day.
  - **Active Day Trading:** Requires allocating **2 daily time slots**. Increases portfolio volatility and potential daily returns, but adds daily mental stress (+2 stress/day) and risks significant drawdown on bad trading days.

### Stock Catalog
The market includes 8 diverse tickers across distinct macroeconomic sectors:

| Ticker | Company Name | Sector | Base Price | Volatility | Dividend Yield | Description / Sensitivity |
|---|---|---|---|---|---|---|
| **ORFOOD** | Orion Foods Co. | Consumer Staple | $120 | Low (0.04) | 2.5% | Recession-resilient, steady modest dividends. |
| **LUXBEV** | Luxe Beverages | Consumer Discretionary | $85 | Med (0.06) | 1.8% | Sensitive to consumer spending and bull markets. |
| **NXTECH** | NexGen Technologies | Tech | $340 | High (0.09) | 0.0% | High growth, volatile, surges during tech booms. |
| **CLDNET** | CloudNet Solutions | Tech / SaaS | $210 | High (0.08) | 0.0% | High recurring revenue multiple, prone to tech corrections. |
| **SOLPWR** | SolarPower Energy | Energy / Green | $175 | Med (0.07) | 2.0% | Policy and energy-cycle sensitive. |
| **GRNFUEL** | GreenFuel Corp | Energy / Commodities | $92 | Med-High (0.08) | 1.2% | Cyclical commodity pricing. |
| **STBANK** | Sterling Bank Ltd | Finance / Banking | $540 | Low (0.03) | 3.5% | High dividend, benefits from rising interest rates. |
| **INSFIN** | InsureFirst Finance | Finance / Insurance | $158 | Med-Low (0.05) | 2.2% | Underwriting profit, defensive financial play. |

---

## 2. Mutual Funds & Systematic Investment Plans (SIP)

- **Mechanism:** Configured during **Salary Day** (Day 1 of each month) or modified via the Invest menu.
- **Execution:** Auto-debits on Salary Day into selected funds.
- **Available Index & Mutual Funds:**
  1. **Broad Market Index Fund:** Low expense ratio, mimics market average (8–12% annual nominal return).
  2. **Aggressive Growth Fund:** Focused on Tech & High-Beta equities (12–18% in bull cycles, -30% in recessions).
  3. **Balanced Hybrid Fund:** 60% equities, 40% government debt (6–9% stable yield).
- **Behavioral Mechanics During Crashes:**
  When a market crash event strikes, players receive an event card:
  - *Option A (Panic Pause):* Stop SIP to "protect cash" (misses the recovery rebound, locks in behavioral penalty).
  - *Option B (Stay the Course):* Keep auto-investing at discounted valuations (+financial intelligence score).
  - *Option C (Double Down):* Inject extra lump sum into the dip (requires liquid reserves, highest long-term payoff).

---

## 3. Fixed Deposits (FD)

- **Mechanism:** Locked-term cash deposit opened through the Banking portal.
- **Durations & Annual Yields:**
  - **6 Months:** 5.5% p.a.
  - **1 Year:** 7.0% p.a.
  - **3 Years:** 8.2% p.a.
- **Liquidity Penalty:** Funds are strictly locked until maturity. Early liquidation in a financial emergency triggers a **25% penalty on accrued interest** and a 3-day withdrawal delay.
- **Maturity Event:** On maturity day, an alert card prompts the player:
  - Auto-renew principal + interest.
  - Withdraw total proceeds to liquid checking.

---

## 4. Cryptocurrencies & Speculative Assets

- **Nature:** High-risk, speculative, emotionally charged digital tokens.
- **Assets Available:**
  - **BTC (Bitcoin):** "Digital Gold" ($30,000–$80,000 range, macro-volatile).
  - **ETH (Ethereum):** Smart contract backbone ($1,800–$5,000 range).
  - **MOON (Speculative Meme Coin):** $0.001 to $5.00 — subject to 10x spikes or complete -99% rug-pulls.
- **The FOMO Engine:**
  - When `cryptoFomoCounter` rises, random notifications pop up: *"Your coworker Aarav made $14,000 on a trending dog token."*
  - Prompts impulsive allocations ($100, $500, or $2,000 bets).
  - High risk of panic-selling during a 50% drawdown.

---

## 5. Dividends

- **Distribution:** Distributed quarterly based on share holdings.
- **Notification:** Automatic event toast / feed entry:
  > *"💰 Dividend Credited: STBANK distributed $0.85/share. You own 40 shares. +$34 deposited into checking."*
- **Taxation:** Added to annual investment income calculations.

---

## 6. Capital Gains Tax (CGT)

- **Trigger:** Realized upon selling equities, crypto, or properties.
- **Tax Schedule:**
  - **Short-Term Capital Gains (STCG - Held < 360 game days):** 15% flat deduction on net profits at time of sale.
  - **Long-Term Capital Gains (LTCG - Held ≥ 360 game days):** 10% on profits exceeding an initial $1,000 exemption.
- **Loss Harvesting:** Realized capital losses offset realized gains in the current tax cycle.

---

## 7. Market Cycle Integration

The economy cycles across 5 distinct phases over the 10-year game:

```
[Bull Run (Y1-3)] ──> [Market Peak (Y3-4)] ──> [Correction / Recession (Y5-6)] ──> [Recovery (Y7-8)] ──> [New Super-Bull (Y9-10)]
```

- **Bull Phase:** Stock prices climb 15–25% p.a.; high FOMO temptation; speculative coins rally.
- **Recession Phase:** Equities drop 30–45%; company layoff risks surge; dividend yields may be slashed by struggling firms.
- **Recovery Phase:** Value stocks and discounted tech names rally first; disciplined SIP investors reap exponential compound growth.
