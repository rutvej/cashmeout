# 08 — The Behavioral Feedback Loop

The core psychological mechanic of CashFlow Life Sim is that **habits compound**. Poor decisions make future bad decisions more frequent and harder to resist, while discipline gradually inoculates the player from disruption.

---

## 1. The Dynamic Habit Counters

Every player profile tracks seven hidden behavioral counters (scale: 0.0 to 10.0):

| Counter Name | Underlying Impulse | What Increases It | What Decreases It | Threshold Consequence (Counter ≥ 6.0) |
|---|---|---|---|---|
| `impulseBuyCounter` | Instant gratification, retail therapy | Accepting impulse buys (+2.0), browsing social feeds | Rejecting deals (-1.0, floor 1.0) | Weekly flash sale & gadget temptations flood the card feed. |
| `junkFoodCounter` | Dietary convenience, comfort eating | Choosing street/fast food (+1.5), skipped cooking | Home-cooked meals (-0.5), gym consistency | Cardiovascular risk events, rapid physical health drop. |
| `gymSkipCounter` | Inertia, lethargy | Skipping gym for work/sleep (+1.5) | Working out despite exhaustion (-1.0) | Severe motivation penalties; gym feels 2x harder to restart. |
| `sleepDebtCounter` | Burning the candle at both ends | Sleeping < 6 hours (+2.0/night) | 8-hour sleep streaks (-0.5/night) | Brain fog, work mistakes, sudden energy crashes. |
| `cryptoFomoCounter` | Get-rich-quick speculation | Buying meme tokens (+2.0), reading hype chats | Passing on hype bets (-1.0) | Obsessive portfolio checking, panic trading during dips. |
| `lifestyleCreepCounter` | Inflating standard of living with raises | Upgrading apartment/cars upon promotions (+1.5) | Living below means upon raise (-0.8) | Living paycheck to paycheck despite a $100k+ salary. |
| `lateNightWorkCounter` | Corporate martyrdom, poor boundaries | Working overtime (+1.0), toxic company culture | Enforcing log-off hours (-0.5) | Fast-track to clinical burnout and chronic stress. |

> **Universal Rule:** Counters **never drop to 0.0**. Temptation and vulnerability are permanent aspects of the human condition.

---

## 2. Event Probability Math

At the start of each in-game week, the Event Scheduler calculates trigger probabilities based on current counter levels:

$$\text{Probability} = \text{Base Chance} + (\text{Counter Value} \times 0.075)$$

- **Counter = 1.0:** ~12% weekly chance of a temptation card.
- **Counter = 5.0:** ~42% weekly chance.
- **Counter = 8.5:** ~75% weekly chance (the player is caught in a self-reinforcing behavioral spiral).

---

## 3. Narrative Anatomy of a Compound Spiral

### Month 1: The First Compromise
- *Event:* Boss assigns an urgent deadline at 8:00 PM.
- *Player Action:* Accepts overtime. Skips gym (+1.5 `gymSkipCounter`), orders takeout (+1.5 `junkFoodCounter`), sleeps 5 hours (+2.0 `sleepDebtCounter`).

### Month 2: The Cascading Burden
- Because `sleepDebtCounter` is high, player wakes up exhausted (Energy: 45%).
- At 2:00 PM, an energy crash event triggers: *"You feel groggy and crave sugar. Buy a $12 specialty energy drink and artisan pastry?"*
- Player accepts: `impulseBuyCounter` rises.
- In the evening, player feels too tired for the gym: skips again (`gymSkipCounter` hits 5.5).

### Month 3: The Crisis
- `gymSkipCounter` and `lateNightWorkCounter` both exceed 7.0.
- Physical health declines to 52%.
- A **Severe Migraine & Burnout Event** triggers: Player is forced into 3 days of bed rest, incurs a $350 medical bill, misses a pivotal client pitch, and suffers a performance warning at work.

---

## 4. The Path to Recovery

Digging out requires intentional, sustained discipline:
1. **Saying "NO" repeatedly:** Each rejected impulse buy chips away at `impulseBuyCounter` by 1.0.
2. **Protecting the Schedule:** Resetting sleep to 8 hours daily gradually clears accumulated sleep debt over 14 consecutive days.
3. **The Habit Reset Milestone:** Once all counters remain below 3.0 for 60 consecutive days, the player unlocks the **"Mindful Discipline"** achievement (+15 mental resilience, immune to low-level FOMO cards).
