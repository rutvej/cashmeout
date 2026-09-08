# 09 — Salary Day (Monthly Financial Blueprint)

Salary Day triggers automatically on **Day 1 of every in-game month**. It is the game's flagship financial interaction screen, taking over the UI to present a complete accounting of income, obligations, and strategic allocations.

---

## 1. Step-by-Step Salary Day Workflow

```
[1. Total Inflow Calculation]
           │
           ▼
[2. Automated Fixed Liabilities Outflow]
           │
           ▼
[3. Net Available Discretionary Surplus]
           │
           ▼
[4. Allocation Sliders: Emergency, Investments, Extra Debt, Fun Money]
           │
           ▼
[5. Daily 24-Hour Time Slot Calibration for the Month]
           │
           ▼
[6. Confirm & Resume Day-to-Day Simulation]
```

---

## 2. Inflow & Outflow Breakdown Screen

```
╔════════════════════════════════════════════════════════════╗
║ 📅 SALARY DAY — Month 8, Year 2                            ║
╠════════════════════════════════════════════════════════════╣
║ INFLOWS                                                    ║
║  • Primary Base Salary (Analyst @ XYZ Corp):      +$3,500  ║
║  • Side Hustle Net Profit (Consulting):             +$650  ║
║  • Dividends Credited (STBANK):                      +$28  ║
║  TOTAL GROSS INFLOW:                              $4,178  ║
╠════════════════════════════════════════════════════════════╣
║ AUTO-DEBITED FIXED OBLIGATIONS                             ║
║  • Residential Rent (1BHK Midtown):                -$950  ║
║  • Car Loan EMI ($18k balance @ 9.5%):              -$380  ║
║  • Student Education Loan EMI:                      -$220  ║
║  • Health Insurance Premium (Standard Silver):      -$120  ║
║  • Utilities, Broadband & Mobile:                    -$95  ║
║  • Base Grocery / Food Budget:                      -$320  ║
║  TOTAL FIXED COMMITMENTS:                        -$2,085  ║
╠════════════════════════════════════════════════════════════╣
║ 💵 NET FREE CASHFLOW AVAILABLE:                   $2,093  ║
╚════════════════════════════════════════════════════════════╝
```

---

## 3. Allocation Sliders

The player directs the remaining **$2,093 surplus** across four strategic buckets:

1. **Emergency Buffer Top-Up ($0 to Max Surplus):**
   - Directs cash to high-yield savings (3.5% APY).
   - Dynamic prompt indicates status: *"Current: $2,400 (1.15 months of expenses). Target: $6,255 (3 months)."*
2. **Wealth Accumulation (SIP & Equities):**
   - Automatically funds selected Index or Mutual Funds.
3. **Aggressive Debt Paydown:**
   - Extra principal reduction on the highest-interest loan (debt avalanche method).
4. **Discretionary "Fun Money" Envelope:**
   - Budget for restaurant dining, entertainment, shopping, and casual leisure.
   - If player spends more than this envelope during random monthly events, they incur overdraft stress and `impulseBuyCounter` penalties.

---

## 4. 24-Hour Daily Time Slot Budgeting

On Salary Day, the player calibrates their daily routine for the upcoming 30 days. The sum of all allocated categories must equal **exactly 24 hours**:

- **Sleep:** 5 to 9 hours (Default: 7.5 hrs).
- **Core Employment:** 8 hours (Fixed by current employer contract).
- **Commute:** 0 to 2.5 hours (Determined by home location vs. office and transport mode).
- **Physical Gym / Cardio:** 0 to 2 hours (Default: 1 hr).
- **Home Cooking / Meal Prep:** 0 to 1.5 hours.
- **Side Hustle / Education:** 0 to 4 hours.
- **Unassigned Free Leisure:** Remaining slots.

---

## 5. Automated Recurring Mode

If the player enjoys their existing financial configuration, they can toggle **"Auto-Run Monthly Blueprint"**.
- Subsequent Salary Days will automatically apply the same percentage distribution.
- The game will only pause Salary Day if an unexpected variable occurs (e.g., salary increase, loan fully paid off, or negative cashflow alert).
