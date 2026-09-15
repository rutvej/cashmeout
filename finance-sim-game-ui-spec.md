# Finance Life-Sim — UI Design Spec

**Style direction:** Cred-inspired clean minimal fintech. Lots of whitespace, soft rounded cards, restrained iconography (thin-line, not colorful emoji), numbers given visual weight. Calm, muted, low-saturation palette — nothing loud. Mobile-first: single column, bottom sheets instead of centered modals, sticky bottom action buttons.

**Game-feel element:** a minimal avatar marker (a dot/silhouette, not an illustrated character) slides along the age-timeline as days pass. Its color shifts with financial health (calm muted blue = stable, muted terracotta = distress) instead of using an illustrated character — keeps the "life passing by" feeling without turning the clean fintech look into a cartoon.

---

## 1. Color Palette (calm & muted, low-saturation)

| Role | Example | Use |
|---|---|---|
| Background | `#F7F5F2` soft off-white | App background |
| Card surface | `#FFFFFF` / `#FBFAF8` | Cards, sheets |
| Text primary | `#33322E` soft charcoal (not pure black) | Body text, numbers |
| Text muted | `#8A8781` | Secondary labels |
| Accent — stable/positive | `#C9D9C3` muted sage green | Healthy stats, good events, "achieved" |
| Accent — caution/negative | `#E3B7A5` muted terracotta | Bad events, distress state, "sacrificed" |
| Accent — primary action | `#B8C9E8` muted powder blue | CTAs, active tab, progress fill |
| Accent — bonus | `#D9C9E8` muted lavender | "Bonus goal" tags |

No pure black, no saturated red/green — every status color stays desaturated so nothing feels alarming or gamey.

## 2. Typography
- Clean sans-serif (Inter or similar system font).
- Money figures and the day/age counter get the largest, boldest weight on any screen — Cred-style emphasis on numbers.
- Everything else (labels, card text) stays lighter weight, muted text color.

## 3. Layout Pattern (mobile-first)
- Single column, full-width cards with generous padding.
- Menus (Bank/Investments/Insurance/Loans/Income/Goals) live in a **bottom tab bar**, not a hamburger menu — thumb-reachable.
- Modals (events, allocation, milestones) are **bottom sheets** that slide up, rounded top corners — native mobile pattern, not centered popup dialogs.
- Primary actions are **sticky buttons** pinned to the bottom of the sheet/screen.

---

## 4. Screen-by-Screen

### 4.1 Landing
- Centered logo/title on the off-white background.
- One-line pitch below it, muted text.
- Single sticky CTA: "Start New Life" (powder-blue pill button).

### 4.2 Spawn Reveal
- Vertical stack of stat cards, revealed one at a time (light staggered fade-in): income source, starting savings, existing loan/debt, home/car ownership, city tier, starting salary.
- Each card: small thin-line icon + label + value, white card on off-white background.
- Sticky "Set Your Goals" button once all cards revealed.

### 4.3 Goal Setup
- Known goal types shown as tappable cards (thin-line icon, name, suggested price shown as editable inline field once selected).
- "+ Add your own goal" as a dashed-border card at the end of the list — tapping opens a small inline form (name + target price).
- Sticky "Begin" button, disabled until at least one goal selected (ties to the "at least one goal required" rule).

### 4.4 Main Game Screen
- **Top:** thin horizontal life-timeline, age 22 → 42, filled in powder-blue up to current position; the avatar marker (dot, color = financial health) sits at the current point. Day counter shown as a small label above the marker.
- **Center:** total pool value in large bold numerals.
- **Below that:** two thin horizontal stacked bars, stacked vertically with small labels —
  - Bucket split (goal %'s), each segment a distinct muted pastel with a small goal icon
  - Instrument split (savings/stocks/gold/MF/FD), same treatment
- **Below that:** a compact income-vs-deductions row (salary in, EMIs + living cost out) — small muted text, not the visual focus.
- **Bottom tab bar:** Bank · Investments · Insurance · Loans · Income · Goals — each opens as its own simple list screen (same card style), always reachable, never gated by the timeline.

### 4.5 Event/Decision Card (bottom sheet)
- Slides up from the bottom, rounded top corners.
- Thin-line icon + short title + 1–2 sentence scenario text.
- 1–3 full-width stacked buttons for the choices — no more than 3 to keep it scannable on a phone.
- "Do nothing / Dismiss" is always a silent option — accessible by a small muted text link below the buttons, not a full button slot.

### 4.6 Allocation Screen (bottom sheet)
- Locked fixed-deduction rows at the top, greyed out (EMIs, living cost) — visibly non-editable.
- Below: one tap-to-enter-% field per goal bucket (not sliders — avoids the "must sum to 100" frustration on mobile); a live "remaining to allocate" number updates as fields change.
- An "Unallocated" catch-all row absorbs any remainder automatically, keeping allocation always valid.
- Sticky "Confirm Allocation" button, disabled until fully allocated (i.e. unallocated = 0).

### 4.7 Milestone Decision Modal (bottom sheet)
- Short congratulatory line ("Your Car fund hit ₹8L!").
- Three stacked buttons: Spend in full / Grow the target / Delete this goal.

### 4.8 Scorecard / Results (full-screen takeover)
- Big centered numbers: final net worth, financial literacy score.
- Goals list below, each with a small pastel pill badge: Achieved (sage), Sacrificed (terracotta), Bonus (lavender).
- "Biggest mistake" callout card near the bottom.
- Sticky CTA into the Google Form.

---

## 5. Open items / deferred to v2 polish
- Whether the avatar marker's health-color transitions are gradual or threshold-based.
- Whether stat-card reveal animations on Spawn Reveal are worth the build time for v1, or a plain instant list is fine first.
- Insurance tab screen contents — needs its own spec before the tab is built out beyond a placeholder.
- Life-timeline granularity: continuous day-progress bar vs. 5-year chapter blocks (deferred — continuous bar ships first, chapter blocks considered if the slow movement feels unsatisfying in playtesting).
