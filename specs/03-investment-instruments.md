# Investment Instruments System

## Overview
The Investment Instruments System governs where players can allocate their money to grow their wealth over time. It simulates real-world financial vehicles, modeling their risks, returns, and specific rules like lock-in periods and market volatility.

## Implementation Status

### What EXISTS (✅)
- ✅ 5 instruments: Equity (~12%), Mutual Fund (~10%), Fixed Deposit (~7%), Gold (~8%), Savings Account (~4%).
- ✅ Each has avgReturn, risk level, minReturn, maxReturn.
- ✅ simulateReturn and getMonthlyReturn functions.
- ✅ Portfolio view in InvestmentsTab.

### What's MISSING (❌)
- ❌ Per-goal instrument allocation (not just overall portfolio split).
- ❌ Independent tracking of money in a chosen instrument for each goal.
- ❌ Growth/loss simulation per goal per instrument monthly.
- ❌ Risk display: UI showing that equity can lose money, FD is safe but slow.
- ❌ Instrument comparison view so user can understand tradeoffs.
- ❌ Market events (crash/boom) affecting instruments differently.
- ❌ FD lock-in period and penalty for early withdrawal.
- ❌ Gold and Silver (silver needs to be added).
- ❌ Rebalancing: ability to move money between instruments within a goal or across goals.
- ❌ Monthly SIP-style investment for MF and Equity.
- ❌ Lump sum option for FD, Gold, and Silver.
- ❌ Visual growth chart per instrument per goal.

## Data Models

### `InstrumentDef`
```typescript
interface InstrumentDef {
  id: string; // 'EQUITY', 'MF', 'FD', 'GOLD', 'SILVER', 'SAVINGS'
  name: string;
  avgReturn: number;
  minReturn: number;
  maxReturn: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  allowsSIP: boolean; // True for Equity, MF. 
  allowsLumpSum: boolean; // True for FD, Gold, Silver
  lockInMonths: number; // e.g., 12 for FD, 0 for others
  earlyWithdrawalPenaltyPct: number; // e.g., 2% for FD
}
```

### `GoalInvestmentState`
```typescript
interface GoalInvestmentState {
  goalId: string;
  instrumentId: string;
  currentBalance: number;
  monthlySIP: number;
  lumpSumContributions: { amount: number, date: Date, unlockDate: Date }[];
  historicalValues: { date: Date, value: number }[]; // For charting
}
```

## Game Mechanics
1. **Per-Goal Allocation**: Investments are completely siloed per goal. Goal A might use Mutual Funds, while Goal B uses FD.
2. **Investment Modes**:
   - *SIP*: Recurring monthly deductions from surplus (used for Equity, MF, Savings).
   - *Lump Sum*: One-time manual transfers from Savings to FD/Gold/Silver.
3. **Lock-ins & Penalties**: FD requires a term. If the player rebalances or withdraws from an FD before the term ends, a flat penalty is applied to the principal/interest.
4. **Market Simulation**: 
   - Base monthly return is randomized between min/max.
   - **Market Events**: Macro events (e.g., "Economic Boom", "Market Crash") apply multipliers. Equity takes massive hits during crashes, FDs and Savings are unaffected, Gold might increase.
5. **Rebalancing**: Players can shift funds from Instrument A to Instrument B for a specific goal. This triggers selling (realizing gains/losses) and buying, subject to penalties if applicable.

## UI Flow
1. **Instrument Selection (Per-Goal)**:
   - A comparison matrix showing Avg Return, Risk, Lock-in, and SIP/LumpSum support.
   - Visual cues: Risk icons (e.g., fire icon for High Risk Equity, shield for FD).
2. **Investment Dashboard**:
   - Line chart showing historical growth of the instrument for the selected goal.
   - If Equity: Chart should visually demonstrate volatility (jagged lines).
3. **Rebalance Modal**:
   - "Move Funds" interface.
   - Warning prompt if breaking an FD early ("You will lose X in penalties. Proceed?").
4. **Market Event Popups**: News flashes showing event impacts on asset classes.

## Edge Cases
- Changing SIP amounts midway: Historical balance continues compounding; only new contributions change.
- Goal target date reached while funds are in lock-in: Player must pay penalty to withdraw for the goal.

## Acceptance Criteria
- [ ] Silver is added as a valid instrument.
- [ ] Each goal tracks its own balance and growth independently based on its assigned instrument.
- [ ] Market crash events severely drop Equity values but leave FD values intact.
- [ ] Rebalancing from an active FD applies the correct penalty to the balance.
