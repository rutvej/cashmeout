# Screen 1: Landing & Seed Configuration (`01-screen-landing.md`)

## 1. Purpose & User Objective
The Landing Screen is the entry point of the game. The player configures their starting scenario by either entering a custom seed (for reproducible runs / sharing with friends) or generating a random one, then selecting their character's city tier and career field. Clicking **"Generate Character"** generates a deterministic starting profile and transitions the player to **Screen 2: Spawn Reveal**.

---

## 2. Layout & Visual Hierarchy (Wireframe)

```
+-------------------------------------------------------------+
|                        CASHFLOW SIM                         |
|            Master Your Finances, Shape Your Life            |
+-------------------------------------------------------------+
|                                                             |
|  [ 1. WORLD SEED ]                                          |
|  +--------------------------------+  +-------------------+  |
|  | Enter custom seed (e.g. 74829) |  | [🎲 Randomize]    |  |
|  +--------------------------------+  +-------------------+  |
|  (Deterministic: Same seed always yields identical life)    |
|                                                             |
|  [ 2. SELECT CITY TIER ]                                    |
|  +----------------+  +----------------+  +----------------+ |
|  | Tier 1 (Metro) |  | Tier 2 (City)  |  | Tier 3 (Town)  | |
|  | High Cost/Pay  |  | Moderate       |  | Lower Cost     | |
|  +----------------+  +----------------+  +----------------+ |
|                                                             |
|  [ 3. CAREER FIELD ]                                        |
|  +----------------+  +----------------+  +----------------+ |
|  | Science / Tech |  | Commerce / Fin |  | Arts / Creative| |
|  +----------------+  +----------------+  +----------------+ |
|                                                             |
|  +-------------------------------------------------------+  |
|  |            [ GENERATE CHARACTER -> ]                  |  |
|  +-------------------------------------------------------+  |
|                                                             |
+-------------------------------------------------------------+
```

---

## 3. Data Contract

### A. Inputs (Initial State)
This screen does not require any prior state. It boots with clean default selections:
- `seed`: Random 6-digit integer string (e.g. `"491823"`).
- `selectedCityTier`: `'tier1'` | `'tier2'` | `'tier3'` (default: `'tier1'`).
- `selectedCareerField`: `'science'` | `'commerce'` | `'arts'` (default: `'science'`).

### B. Output Payload (Produced on clicking "Generate Character")
```typescript
interface InitialGenerationConfig {
  seed: string;
  cityTier: 'tier1' | 'tier2' | 'tier3';
  careerField: 'science' | 'commerce' | 'arts';
}
```

### C. Seed Generator Contract
- The seed must be a deterministic pseudo-random number generator (PRNG) seed (e.g., Mulberry32 or splitmix32).
- Given `(seed, cityTier, careerField)`, the character generation algorithm will **always** yield the exact same character profile, salary, expenses, loans, and starting dreams on Screen 2.

---

## 4. UI Controls & User Interactions

1. **Seed Input Field:**
   - Text input supporting alphanumeric characters (1-16 chars).
   - Typing updates the active seed state.
   - Trimming whitespace automatically.

2. **"Randomize" Button (`[🎲 Randomize]`):**
   - Generates a new random 6-digit numeric seed string.
   - Clears any manual typed seed and sets the new value.

3. **City Tier Selection Cards:**
   - 3 selectable options (single select):
     - **Tier 1 (Metro):** Mumbai, Bangalore, Delhi NCR. Higher starting salaries, higher rents/costs.
     - **Tier 2 (Growth City):** Pune, Hyderabad, Ahmedabad, Chandigarh. Balanced cost/pay ratio.
     - **Tier 3 (Emerging Town):** Lower living expenses, steady lower starting salary.
   - Visually indicates active selection with an accented border and highlight.

4. **Career Field Selection Cards:**
   - 3 selectable options (single select):
     - **Science / Tech:** Software Engineer, Data Analyst, Hardware Specialist, Biotech.
     - **Commerce / Finance:** Financial Analyst, Accountant, Consultant, Marketing Ops.
     - **Arts / Creative:** UI/UX Designer, Content Strategist, Media Producer, Architect.
   - Visually indicates active selection.

5. **"Generate Character" Action Button:**
   - Disabled if `seed.trim() === ''` or neither tier nor field is selected.
   - On click:
     - Initializes the PRNG engine with the seed.
     - Generates the initial character state.
     - Advances screen navigation to `spawn_reveal`.

---

## 5. Edge Cases & Boundary Conditions
- **Empty Seed:** If the player clears the seed input field, the "Generate Character" button is disabled and a helper message appears: *"Please enter or roll a seed"*.
- **Special Characters in Seed:** Strips or hashes arbitrary Unicode/emojis cleanly into a 32-bit integer so the PRNG never NaN's or crashes.
- **Screen Resizing:** Clean mobile-first responsive layout (collapses to single column on small screens).

---

## 6. Exit Criteria & Navigation
- **Next Screen:** Screen 2 (`spawn_reveal`).
- **Trigger:** Player clicks `[ Generate Character -> ]`.
- **Global Store Mutation:**
  - `gameState.screen = 'spawn_reveal'`
  - `gameState.config = { seed, cityTier, careerField }`
  - `gameState.character = generateCharacter(seed, cityTier, careerField)`
