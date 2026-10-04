# Scoring & End Game System

PARTIALLY IMPLEMENTED.

## What EXISTS (✅):
- calculateScore function evaluating: goals achieved %, emergency fund adequacy, retirement fund, loan-free at retirement, insurance coverage, investment diversity
- Letter grade (A-F)
- Scorecard screen with animations and confetti
- Per-goal status display

## What's MISSING (❌ - write detailed spec):

### RETIREMENT DATE:
- User selects retirement age at game start (or it's fixed based on character)
- Max retirement age: 60
- At retirement:
  - ALL loans must be paid off → if not, penalty
  - Retirement fund must be adequate → if not, warning
  - All goals should have been addressed (achieved, postponed with resolution, or explicitly skipped)

### COMPREHENSIVE SCORING:

1. **Goals Achievement Score (40% weight)**:
   - Each goal: achieved on time (full marks), achieved late (partial), missed (0)
   - Bonus for achieving ahead of schedule
   - Vacation: scored per year (how many years of vacation achieved out of total)

2. **Financial Health Score (20% weight)**:
   - Emergency fund maintained above 3 months throughout game (track months where it was adequate)
   - EMI-to-income ratio stayed below 50% throughout
   - No bankruptcy/broke moments

3. **Risk Management Score (15% weight)**:
   - Had health insurance (mediclaim) throughout
   - Had term insurance when home loan was active
   - Had vehicle insurance when owning a car
   - Emergency fund consistently maintained

4. **Investment Wisdom Score (15% weight)**:
   - Diversification across instruments
   - Appropriate risk levels for goal timelines (short-term goals in safe instruments, long-term in equity)
   - Didn't panic-sell during market crashes
   - Used SIP approach for long-term goals

5. **Debt Management Score (10% weight)**:
   - All loans paid off by retirement
   - Never exceeded 50% EMI-to-income ratio
   - Used prepayment wisely
   - Didn't take unnecessary loans

### END GAME DISPLAY:
- Overall score (0-100) with letter grade
- Detailed breakdown of each scoring category
- Per-goal timeline showing when each was achieved/missed
- "Best Decision" highlight
- "Worst Decision" highlight (biggest mistake callout from existing SPEC.md)
- Net worth at retirement
- Comparison: "How others played" (based on seed, show average score for that seed if multiplayer data available, otherwise skip)
- Life story summary: narrative paragraph summarizing the character's financial journey
- Share button (screenshot scorecard)
- Play Again button

### SPECIAL ENDINGS:
- "Broke" ending: if player runs out of money and can't cover mandatory expenses → game ends early, special scorecard
- "Perfect" ending: all goals achieved on time, zero debt, adequate retirement fund → special celebration
- "Survivor" ending: barely made it, lots of struggles but reached retirement

### Data model for Score
```typescript
interface GameScore {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  categories: {
    goalsAchievement: number;
    financialHealth: number;
    riskManagement: number;
    investmentWisdom: number;
    debtManagement: number;
  };
  highlights: {
    bestDecision: string;
    worstDecision: string;
  };
  netWorth: number;
  endingType: 'PERFECT' | 'STANDARD' | 'SURVIVOR' | 'BROKE';
  lifeSummary: string;
}
```

### Scoring formulas
- `totalScore` = Sum of all 5 category sub-scores.
- Grade Mapping: S (95-100), A (80-94), B (70-79), C (60-69), D (50-59), F (<50).
- `goalsAchievement` = `(sum of goal multipliers) / (total goals)` * 40. Where multiplier is 1 (on time), 1.1 (early), 0.5 (late), 0 (missed).

### UI layout for scorecard
- **Hero Section**: Character avatar, total score large, glowing grade letter.
- **Stats Grid**: Net Worth, Final Age, Years Played.
- **Category Bars**: 5 progress bars showing category scores.
- **Timeline/Goals**: Horizontal scrolling timeline of milestones.
- **Narrative Box**: The life summary paragraph.
