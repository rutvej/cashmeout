# Mechanism Spec: Browser DB Persistence & Single Active Game Session (`specs/mechanics/08-browser-persistence-save-state.md`)

## 1. Overview & Objective
This mechanism adds **persistent game save and resume** capabilities using the browser's IndexedDB (with fallback to `localStorage`). It ensures:
1. **No Lost Progress**: Closing the tab, refreshing the browser, or navigating away preserves the full simulation state.
2. **Single Active Game Policy ("Only One Game at a Time")**: The browser maintains exactly one active playable session at any given time.
3. **Seamless Resume Experience**: The Landing Screen automatically detects existing saves and offers a 1-click **"Resume Life"** action, while protecting active games from accidental overwrite.

---

## 2. Storage Architecture

```
IndexedDB: "cashmeout_db" (Version 1)
  └─ Object Store: "game_session"
       └─ Key: "active_session"
            └─ Payload: SavedGamePayload
```

### Fallback Policy:
If IndexedDB is unavailable or blocked (e.g., restricted iframe or incognito storage restrictions), the storage engine automatically falls back to `window.localStorage` using the key `cashmeout_active_session`.

---

## 3. Data Schema (`SavedGamePayload`)

```typescript
export interface SavedGamePayload {
  version: number;                  // Schema version (e.g. 1)
  lastSavedAt: string;              // ISO timestamp (e.g. "2026-11-13T06:30:00Z")
  status: 'in_progress' | 'completed';
  
  // Game State
  currentScreen: 'spawn_reveal' | 'goal_setup' | 'financial_setup' | 'main_game' | 'scorecard';
  config: {
    seed: string;
    cityTier: 'tier1' | 'tier2' | 'tier3';
    careerField: 'science' | 'commerce' | 'arts';
  };
  character: CharacterState;
  goals: GoalItem[];
  insurance: Record<string, InsurancePolicy>;
  surplusAllocation: SurplusAllocationState;
  simulation: {
    currentMonthIndex: number;
    currentAge: number;
    currentMonthOfYear: number;
    isPaused: boolean;
    gameSpeed: number;
    history: SimulationSnapshot[];
    decisionJournal: DecisionRecord[];
  };
}
```

---

## 4. Auto-Save Triggers

The game automatically commits the active state to the browser DB on:
1. **Monthly Simulation Tick**: Saved at the completion of every month in `tickMonthlySimulation`.
2. **Surplus Reallocation**: Saved whenever `setGoalAllocation` or `setAllocationMode` is updated.
3. **Milestone Decisions**: Saved when resolving shortfalls via `resolveMilestoneShortfall` (Postpone, Loan, or Buffer Drain).
4. **Shock Resolutions**: Saved on `acknowledgeShock` or `resolveHousingEvictionShock`.
5. **Career & Education**: Saved on course enrollment, course drop, course completion, and job offer acceptance.
6. **Life Milestone Finalization**: Saved on car purchase, marriage economics transition, and home purchase.

---

## 5. UI Integration & Landing Screen Flow

### A. Landing Screen (`LandingScreen.jsx`)
Upon mounting, the screen checks for an active session in the browser DB:

1. **If Active Game Exists (`status === 'in_progress'`):**
   - Renders a prominent **"Resume Active Life" Card**:
     - Character Name, Current Age, Career Title & Company.
     - Net Worth & Progress to Retirement (% or Month Index).
     - Prominent CTA: `Resume Life (Age X, Month Y) ➔` (restores state and navigates directly to `currentScreen`).
   - "Start New Life" Action:
     - Prompts an overwrite confirmation modal:
       > *"Starting a new life will overwrite your existing game for [Character Name] (Age X). Are you sure you want to proceed?"*
     - If confirmed, clears the active record and starts fresh from Character Spawn.

2. **If No Active Game Exists or Game Was Completed:**
   - Standard "Start Your Financial Journey" landing screen.

### B. In-Game Controls
- A subtle "Auto-Saved" status indicator in the top header of `MainGameScreen`.
- Reset or Clear Game action in settings cleanly deletes the record from the database.
