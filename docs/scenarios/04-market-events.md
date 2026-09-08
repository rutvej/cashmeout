# Scenarios: Market & Investment Events

This document details macroeconomic cycles, equities, crypto euphoria, market crashes, dividends, and portfolio events in CashFlow Life Sim.

---

### [MKT-001] Macroeconomic Black Swan: Tech Sector Flash Crash
- **Trigger:** Economic Correction / Recession Phase; Tech stock holdings > $0.
- **Prompt:** *"Global supply chain shocks and high interest rates trigger a broad market sell-off. Tech equities plunge -28% in 48 hours. Your portfolio is down significantly on paper."*
- **Choices:**
  - **A: Panic Sell all shares to cash** → Locks in paper loss as permanent capital loss; transfers remaining value to checking. Eliminates market risk but misses future rebound.
  - **B: Do nothing (Hold the line)** → Keeps shares intact. Mental health temporarily drops by -8 due to paper loss anxiety.
  - **C: Buy the dip with available liquid cash ($1,500)** → Deploys cash into heavily discounted tech shares; yields massive 3-year compound gains when recovery era arrives.
- **Behavioral Impact:** Choice A elevates future market fear; Choice C rewards financial resilience.

---

### [MKT-002] The Viral Doge-Token Euphoria (Crypto FOMO)
- **Trigger:** Bull market phase, `cryptoFomoCounter` ≥ 3.0.
- **Prompt:** *"Social media and office chats are erupting: 'MOON coin is up 420% this week!' Your coworker Priya just bought a luxury watch with trading profits."*
- **Choices:**
  - **A: FOMO Buy $1,000 worth of MOON coin** → Spends $1,000 cash. 30% chance coin doubles; 70% chance of an 80% collapse within 14 days. Increases `cryptoFomoCounter` by +2.0.
  - **B: Take a small speculative gamble ($150)** → Limits exposure; scratches speculative itch.
  - **C: Laugh it off and stick to your Index Fund SIP** → Decreases `cryptoFomoCounter` by -1.0; +5 Financial Discipline.

---

### [MKT-003] Central Bank Interest Rate Hike
- **Trigger:** High Inflation environment (Year 4–5).
- **Prompt:** *"The Central Bank raises benchmark interest rates by 150 basis points to combat runaway consumer inflation."*
- **Effects:**
  - Fixed Deposit yields jump from 6.0% to **8.5% APY**.
  - New mortgage and personal loan borrowing rates climb from 9% to **13.5% APR**.
  - Equities face downward multiple compression.

---

### [MKT-004] Dividend Aristocrat Special Distribution
- **Trigger:** Holding shares of Sterling Bank (STBANK) for ≥ 360 days.
- **Prompt:** *"Corporate Earnings Triumph: STBANK reports record net interest margins and announces a special one-time cash dividend of $2.40 per share."*
- **Choices:**
  - **A: Reinvest payout into additional shares** → Compounds share count automatically.
  - **B: Cash out dividend to liquid checking** → Direct cash windfall.

---

### [MKT-005] The Cryptographic Rug-Pull / Protocol Exploit
- **Trigger:** Player holds any balance in speculative altcoins / meme tokens.
- **Prompt:** *"Breaking News: Developers behind MOON token drained the liquidity pool and deleted their social accounts. Token value collapses -98% overnight."*
- **Choices:**
  - **A: Liquidate the remaining dust ($20) and accept the loss** → Permanently removes speculative coin balance; harsh financial reality lesson.
- **Behavioral Impact:** Resets `cryptoFomoCounter` to 1.0 (Lesson learned).

---

### [MKT-006] The 1-Year Fixed Deposit Maturity
- **Trigger:** Exactly 360 days after opening a 1-Year FD.
- **Prompt:** *"Maturity Notice: Your $10,000 Fixed Deposit has matured, generating $750 in guaranteed interest. Total balance: $10,750."*
- **Choices:**
  - **A: Auto-Renew principal + interest into a new 1-Year FD at 8.0%** → Locks $10,750 for another 360 days of guaranteed compounding.
  - **B: Withdraw full $10,750 to liquid checking** → Boosts liquid cash for real estate down payment or personal spending.

---

### [MKT-007] Mutual Fund SIP Performance Review (Year 3)
- **Trigger:** Maintaining an active SIP for 36 consecutive months.
- **Prompt:** *"SIP Compounding Report: Through discipline and dollar-cost averaging across bull and bear weeks, your cumulative $300/mo investments have grown to $14,200 (+$3,400 net capital gain)."*
- **Choices:**
  - **A: Increase monthly SIP contribution to $500/mo** → Accelerates long-term wealth engine.
  - **B: Maintain current $300/mo allocation** → Steady continuation.

---

### [MKT-008] Hot Insider Stock Tip From a Friend
- **Trigger:** NPC peer interaction event (Year 3+).
- **Prompt:** *"A college friend who works in clean tech whispers: 'Our firm is about to announce a government grant. Buy SOLPWR before Thursday.'"*
- **Choices:**
  - **A: Buy $2,000 worth of SOLPWR on the rumor** → 50% chance stock surges +30%; 50% chance the rumor was priced in and stock drops -15%.
  - **B: Decline to trade on unsubstantiated rumors** → Protects capital; avoids speculative emotional roller-coaster.

---

### [MKT-009] The Great Inflation Surge: Cash Erosion
- **Trigger:** Year 5, Player holding > $20,000 idle cash in checking account (earning 0%).
- **Prompt:** *"Economic Insight: Annual inflation registered at 8.2% this year. Because your $25,000 liquid reserves sat in a non-interest checking account, you silently lost over $2,000 in real purchasing power."*
- **Choices:**
  - **A: Transfer surplus cash to High-Yield Savings (3.5%) or FDs** → Optimizes cash yield.
  - **B: Keep it all in checking for immediate peace of mind** → Continues suffering inflationary decay.

---

### [MKT-010] Portfolio Milestone: Net Investment Crosses $50,000
- **Trigger:** Sum of all stock, fund, and crypto holdings ≥ $50,000.
- **Prompt:** *"Financial Milestone: Your invested portfolio has crossed $50,000! Your passive assets now generate more monthly wealth through compound growth than an entry-level salary."*
- **Choices:**
  - **A: Stay humble and let compound interest work** → +15 Mental Peace; unlocks advanced wealth management insights.
