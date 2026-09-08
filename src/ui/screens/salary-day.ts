import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { calculateTimeline } from '../components/hud';
import { saveGame } from '../../save/save-manager';
import { FOOD_TIERS } from '../../data/static-data';

export function renderSalaryDayCard(
  state: GameState,
  onConfirm: () => void
): HTMLElement {
  const p = state.player;
  const timeline = calculateTimeline(p.currentDay, p.startingAge || 22);

  // 1. Calculate Inflows
  const monthlySalary = Math.round(p.job.salaryPerCycle * (30 / p.job.payCycleDays));
  const hasLaptop = p.lifestyleAssets.some(a => a.id === 'laptop');
  const sideHustleRate = hasLaptop ? 500 : 250;
  const monthlySideHustle = p.timeAllocation.sideHustle * sideHustleRate * 30;

  let monthlyDividends = 0;
  for (const [tickerId, entry] of Object.entries(p.portfolio)) {
    const t = state.market.tickers.find(x => x.id === tickerId);
    if (t && t.dividendYieldPct) {
      monthlyDividends += Math.round((entry.shares * t.price * t.dividendYieldPct) / 12);
    }
  }

  let monthlyRentalIncome = 0;
  for (const prop of p.properties) {
    const def = state.market.properties.find(x => x.id === prop.id);
    if (def) {
      monthlyRentalIncome += Math.round((def.price * (def.rentYieldPct / 100)) / 12);
    }
  }

  const totalInflow = monthlySalary + monthlySideHustle + monthlyDividends + monthlyRentalIncome;

  // 2. Calculate Outflows (Auto-Debits)
  const rentOrHousing = p.housing.amountPerCycle;
  const loanEmis = p.loans.reduce((s, l) => s + Math.round((l.emiAmount * 30) / l.cycleDays), 0);
  const ins = p.insurance;
  const insuranceTotal = ins.health.premiumPerMonth + ins.vehicle.premiumPerMonth + ins.property.premiumPerMonth + ins.life.premiumPerMonth;
  const utilities = 95;
  const foodTier = FOOD_TIERS[p.lifestyle.foodTier];
  const groceries = foodTier ? foodTier.costPerDay * 30 : 320;

  const totalFixedDebits = rentOrHousing + loanEmis + insuranceTotal + utilities + groceries;
  const netSurplus = Math.max(0, totalInflow - totalFixedDebits);

  // Target 3 months emergency buffer calculation
  const emergencyTarget = totalFixedDebits * 3;
  const currentEmergencyFund = p.savingsBalance;
  const emergencyMonths = totalFixedDebits > 0 ? (currentEmergencyFund / totalFixedDebits).toFixed(1) : '3.0';

  // State for sliders (percentages of surplus)
  const prefs = p.salaryDayPreferences || {
    autoRunBlueprint: false,
    emergencyBufferAllocPct: 35,
    sipAllocPct: 30,
    debtPaydownAllocPct: 15,
    discretionaryAllocPct: 20,
    lastEvaluatedMonth: 0
  };

  let bufferPct = prefs.emergencyBufferAllocPct;
  let sipPct = prefs.sipAllocPct;
  let debtPct = p.loans.length > 0 ? prefs.debtPaydownAllocPct : 0;
  let funPct = 100 - bufferPct - sipPct - debtPct;
  if (funPct < 0) funPct = 15;

  let autoRunChecked = prefs.autoRunBlueprint;

  // 24-Hour Routine state
  let sleepHours = 7.5;
  const workHours = 8.0; // fixed by contract
  const commuteHours = p.housing.locationTier === 'distant' ? 2.0 : 0.5;
  let gymHours = 1.0;
  let mealHours = 1.0;
  let studyHours = 1.0;
  let freeHours = Math.max(0, 24 - (sleepHours + workHours + commuteHours + gymHours + mealHours + studyHours));

  const container = document.createElement('div');
  container.className = 'salary-day-backdrop';

  function renderView() {
    // Dollar amounts computed from surplus percentages
    const bufferAmount = Math.round((netSurplus * bufferPct) / 100);
    const sipAmount = Math.round((netSurplus * sipPct) / 100);
    const debtAmount = Math.round((netSurplus * debtPct) / 100);
    const funAmount = Math.max(0, netSurplus - bufferAmount - sipAmount - debtAmount);

    const routineTotal = sleepHours + workHours + commuteHours + gymHours + mealHours + studyHours + freeHours;
    const routineValid = Math.abs(routineTotal - 24.0) < 0.1;

    container.innerHTML = `
      <div class="salary-day-card">
        <!-- Header -->
        <div class="salary-header">
          <div class="salary-header-badge">
            <span class="badge-dot-green"></span>
            <span>DAY 1 MONTHLY FINANCIAL BLUEPRINT</span>
          </div>
          <h1 class="salary-title">📅 Salary Day — Month ${timeline.month}, Year ${timeline.year}</h1>
          <p class="salary-subtitle">Age ${timeline.age} · Evaluate cashflow, configure allocations, and calibrate daily schedule.</p>
        </div>

        <div class="salary-grid">
          <!-- Left Column: Inflows & Auto-Debits -->
          <div class="salary-col">
            <!-- Inflows Section -->
            <div class="financial-block block-inflow">
              <div class="block-header">
                <span class="block-title">💵 Gross Monthly Inflow</span>
                <span class="block-sum val-emerald">+${formatCurrency(totalInflow)}</span>
              </div>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <span>💼 Base Salary (${p.job.title})</span>
                  <span class="val-emerald">+${formatCurrency(monthlySalary)}</span>
                </div>
                ${monthlySideHustle > 0 ? `
                  <div class="breakdown-item">
                    <span>💻 Side Hustle Income</span>
                    <span class="val-emerald">+${formatCurrency(monthlySideHustle)}</span>
                  </div>
                ` : ''}
                ${monthlyDividends > 0 ? `
                  <div class="breakdown-item">
                    <span>📈 Equity Dividends Credited</span>
                    <span class="val-emerald">+${formatCurrency(monthlyDividends)}</span>
                  </div>
                ` : ''}
                ${monthlyRentalIncome > 0 ? `
                  <div class="breakdown-item">
                    <span>🏠 Investment Property Rent</span>
                    <span class="val-emerald">+${formatCurrency(monthlyRentalIncome)}</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Auto-Debits Section -->
            <div class="financial-block block-outflow">
              <div class="block-header">
                <span class="block-title">💳 Auto-Debited Obligations</span>
                <span class="block-sum val-rose">-${formatCurrency(totalFixedDebits)}</span>
              </div>
              <div class="breakdown-list">
                <div class="breakdown-item">
                  <span>🏠 Residential Rent / Housing</span>
                  <span class="val-rose">-${formatCurrency(rentOrHousing)}</span>
                </div>
                ${loanEmis > 0 ? `
                  <div class="breakdown-item">
                    <span>💳 Active Loan EMIs</span>
                    <span class="val-rose">-${formatCurrency(loanEmis)}</span>
                  </div>
                ` : ''}
                ${insuranceTotal > 0 ? `
                  <div class="breakdown-item">
                    <span>🛡️ Insurance Premiums</span>
                    <span class="val-rose">-${formatCurrency(insuranceTotal)}</span>
                  </div>
                ` : ''}
                <div class="breakdown-item">
                  <span>⚡ Utilities, Phone & Internet</span>
                  <span class="val-rose">-${formatCurrency(utilities)}</span>
                </div>
                <div class="breakdown-item">
                  <span>🛒 Base Food & Grocery Budget</span>
                  <span class="val-rose">-${formatCurrency(groceries)}</span>
                </div>
              </div>
            </div>

            <!-- Net Free Surplus Callout -->
            <div class="surplus-banner">
              <div class="surplus-label">NET FREE CASHFLOW SURPLUS</div>
              <div class="surplus-value val-emerald">${formatCurrency(netSurplus)}</div>
              <div class="surplus-sub">Available for savings buffer, investing, debt acceleration, and lifestyle.</div>
            </div>
          </div>

          <!-- Right Column: Interactive Allocation Sliders & 24h Routine -->
          <div class="salary-col">
            <!-- Strategic Allocation Buckets -->
            <div class="financial-block">
              <div class="block-header">
                <span class="block-title">🎯 Strategic Cashflow Allocation</span>
                <span class="badge badge-sky">100% Allocated</span>
              </div>

              <!-- Slider 1: Emergency Buffer -->
              <div class="slider-group">
                <div class="slider-label-row">
                  <span class="slider-title">🛡️ Emergency Buffer Top-Up</span>
                  <span class="slider-amt val-emerald">${formatCurrency(bufferAmount)} (${bufferPct}%)</span>
                </div>
                <input type="range" class="form-range" id="range-buffer" min="0" max="80" step="5" value="${bufferPct}" />
                <div class="slider-hint">
                  Current Fund: <strong>${formatCurrency(currentEmergencyFund)}</strong> (${emergencyMonths} mo). Target: <strong>${formatCurrency(emergencyTarget)}</strong> (3 mo).
                </div>
              </div>

              <!-- Slider 2: Wealth & SIP -->
              <div class="slider-group">
                <div class="slider-label-row">
                  <span class="slider-title">📈 Wealth Accumulation (SIP & Stocks)</span>
                  <span class="slider-amt val-sky">${formatCurrency(sipAmount)} (${sipPct}%)</span>
                </div>
                <input type="range" class="form-range" id="range-sip" min="0" max="80" step="5" value="${sipPct}" />
                <div class="slider-hint">Auto-deploys into equities & index funds for long-term compound growth.</div>
              </div>

              <!-- Slider 3: Debt Paydown -->
              ${p.loans.length > 0 ? `
                <div class="slider-group">
                  <div class="slider-label-row">
                    <span class="slider-title">⚡ Extra Debt Principal Paydown</span>
                    <span class="slider-amt val-amber">${formatCurrency(debtAmount)} (${debtPct}%)</span>
                  </div>
                  <input type="range" class="form-range" id="range-debt" min="0" max="60" step="5" value="${debtPct}" />
                  <div class="slider-hint">Debt Avalanche: directly reduces highest-interest balance.</div>
                </div>
              ` : ''}

              <!-- Bucket 4: Fun Money / Discretionary -->
              <div class="slider-group">
                <div class="slider-label-row">
                  <span class="slider-title">🎉 Discretionary "Fun Money" Budget</span>
                  <span class="slider-amt val-purple">${formatCurrency(funAmount)} (${funPct}%)</span>
                </div>
                <div class="slider-hint">Unrestricted envelope for dining out, leisure & entertainment events.</div>
              </div>
            </div>

            <!-- 24-Hour Routine Calibrator -->
            <div class="financial-block">
              <div class="block-header">
                <span class="block-title">⏰ 24-Hour Daily Schedule Calibration</span>
                <span class="badge ${routineValid ? 'badge-green' : 'badge-red'}">
                  ${routineTotal.toFixed(1)} / 24.0 hrs ${routineValid ? '✅' : '⚠️'}
                </span>
              </div>

              <div class="routine-grid">
                <div class="routine-input-item">
                  <label class="routine-lbl">😴 Sleep (hrs)</label>
                  <input type="number" class="routine-num-input" id="routine-sleep" min="5" max="9.5" step="0.5" value="${sleepHours}" />
                </div>
                <div class="routine-input-item">
                  <label class="routine-lbl">💼 Work (Fixed)</label>
                  <input type="number" class="routine-num-input disabled" value="${workHours}" disabled />
                </div>
                <div class="routine-input-item">
                  <label class="routine-lbl">🚗 Commute</label>
                  <input type="number" class="routine-num-input disabled" value="${commuteHours}" disabled />
                </div>
                <div class="routine-input-item">
                  <label class="routine-lbl">🏋️ Gym / Workout</label>
                  <input type="number" class="routine-num-input" id="routine-gym" min="0" max="2.5" step="0.5" value="${gymHours}" />
                </div>
                <div class="routine-input-item">
                  <label class="routine-lbl">🍳 Meals & Cooking</label>
                  <input type="number" class="routine-num-input" id="routine-meals" min="0.5" max="2" step="0.5" value="${mealHours}" />
                </div>
                <div class="routine-input-item">
                  <label class="routine-lbl">📚 Study / Hustle</label>
                  <input type="number" class="routine-num-input" id="routine-study" min="0" max="4" step="0.5" value="${studyHours}" />
                </div>
              </div>

              <div class="routine-free-time-row">
                <span>🌙 Remaining Unassigned Free Recovery Time:</span>
                <strong class="val-sky">${Math.max(0, freeHours).toFixed(1)} hrs</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="salary-footer">
          <label class="blueprint-checkbox-label">
            <input type="checkbox" id="check-auto-blueprint" ${autoRunChecked ? 'checked' : ''} />
            <span>Auto-Run Monthly Blueprint (Only pause if unexpected deficit occurs)</span>
          </label>
          <button class="btn btn-primary btn-lg" id="btn-confirm-salary-day">
            Confirm & Start Month ${timeline.month} →
          </button>
        </div>
      </div>
    `;

    attachHandlers();
  }

  function attachHandlers() {
    // Slider handlers
    const bufferRange = container.querySelector('#range-buffer') as HTMLInputElement;
    const sipRange = container.querySelector('#range-sip') as HTMLInputElement;
    const debtRange = container.querySelector('#range-debt') as HTMLInputElement;

    bufferRange?.addEventListener('input', (e) => {
      bufferPct = parseInt((e.target as HTMLInputElement).value, 10);
      rebalanceAllocations('buffer');
      renderView();
    });

    sipRange?.addEventListener('input', (e) => {
      sipPct = parseInt((e.target as HTMLInputElement).value, 10);
      rebalanceAllocations('sip');
      renderView();
    });

    debtRange?.addEventListener('input', (e) => {
      debtPct = parseInt((e.target as HTMLInputElement).value, 10);
      rebalanceAllocations('debt');
      renderView();
    });

    // Routine inputs
    container.querySelector('#routine-sleep')?.addEventListener('change', (e) => {
      sleepHours = parseFloat((e.target as HTMLInputElement).value) || 7.5;
      recalculateFreeHours();
      renderView();
    });

    container.querySelector('#routine-gym')?.addEventListener('change', (e) => {
      gymHours = parseFloat((e.target as HTMLInputElement).value) || 1.0;
      recalculateFreeHours();
      renderView();
    });

    container.querySelector('#routine-meals')?.addEventListener('change', (e) => {
      mealHours = parseFloat((e.target as HTMLInputElement).value) || 1.0;
      recalculateFreeHours();
      renderView();
    });

    container.querySelector('#routine-study')?.addEventListener('change', (e) => {
      studyHours = parseFloat((e.target as HTMLInputElement).value) || 0;
      recalculateFreeHours();
      renderView();
    });

    // Checkbox
    container.querySelector('#check-auto-blueprint')?.addEventListener('change', (e) => {
      autoRunChecked = (e.target as HTMLInputElement).checked;
    });

    // Confirm button
    container.querySelector('#btn-confirm-salary-day')?.addEventListener('click', () => {
      applySalaryDay();
    });
  }

  function rebalanceAllocations(source: 'buffer' | 'sip' | 'debt') {
    const committed = bufferPct + sipPct + debtPct;
    if (committed > 100) {
      if (source === 'buffer') {
        sipPct = Math.max(0, 100 - bufferPct - debtPct);
      } else if (source === 'sip') {
        bufferPct = Math.max(0, 100 - sipPct - debtPct);
      } else if (source === 'debt') {
        bufferPct = Math.max(0, 100 - debtPct - sipPct);
      }
    }
    funPct = Math.max(0, 100 - bufferPct - sipPct - debtPct);
  }

  function recalculateFreeHours() {
    freeHours = Math.max(0, 24 - (sleepHours + workHours + commuteHours + gymHours + mealHours + studyHours));
  }

  function applySalaryDay() {
    // 1. Credit Salary & other inflows
    p.money += totalInflow;
    p.taxes.incomeThisCycle += totalInflow;

    // 2. Debit Fixed Commitments
    p.money = Math.max(0, p.money - totalFixedDebits);

    // 3. Apply Allocated Buckets
    const bufferAmount = Math.round((netSurplus * bufferPct) / 100);
    const sipAmount = Math.round((netSurplus * sipPct) / 100);
    const debtAmount = Math.round((netSurplus * debtPct) / 100);

    // Emergency buffer top up -> savings account
    if (bufferAmount > 0 && p.money >= bufferAmount) {
      p.money -= bufferAmount;
      p.savingsBalance += bufferAmount;
    }

    // SIP allocation -> deployed into first active stock or index
    if (sipAmount > 0 && p.money >= sipAmount) {
      p.money -= sipAmount;
      const primaryTicker = state.market.tickers[0];
      if (primaryTicker) {
        const sharesBought = Math.max(1, Math.floor(sipAmount / primaryTicker.price));
        const cur = p.portfolio[primaryTicker.id] || { shares: 0, avgCost: primaryTicker.price };
        cur.shares += sharesBought;
        p.portfolio[primaryTicker.id] = cur;
      }
    }

    // Extra Debt principal paydown
    if (debtAmount > 0 && p.loans.length > 0 && p.money >= debtAmount) {
      p.money -= debtAmount;
      // Avalanche: highest interest loan first
      const sortedLoans = [...p.loans].sort((a, b) => b.interestRate - a.interestRate);
      const targetLoan = sortedLoans[0];
      targetLoan.principalRemaining = Math.max(0, targetLoan.principalRemaining - debtAmount);
      p.loans = p.loans.filter(l => l.principalRemaining > 0);
    }

    // 4. Update Time Allocation in player state
    p.timeAllocation.commute = commuteHours;
    p.timeAllocation.exercise = gymHours;
    p.timeAllocation.cooking = mealHours;
    p.timeAllocation.education = studyHours;
    p.timeAllocation.rest = sleepHours >= 8 ? 2 : 1;
    p.timeAllocation.free = Math.round(freeHours);

    // 5. Store Preferences
    p.salaryDayPreferences = {
      autoRunBlueprint: autoRunChecked,
      emergencyBufferAllocPct: bufferPct,
      sipAllocPct: sipPct,
      debtPaydownAllocPct: debtPct,
      discretionaryAllocPct: funPct,
      lastEvaluatedMonth: timeline.month + (timeline.year - 1) * 12
    };

    // 6. Log event
    p.eventLog.unshift({
      day: p.currentDay,
      text: `📅 Salary Day Processed: Net free cashflow ${formatCurrency(netSurplus)} distributed (Buffer: ${formatCurrency(bufferAmount)}, SIP: ${formatCurrency(sipAmount)}).`,
      type: 'income'
    });

    saveGame(state);
    container.remove();
    onConfirm();
  }

  renderView();
  return container;
}
