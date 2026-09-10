import { GameState } from '../../types/game';
import { computeMonthlyCashflow, executeSalaryDaySettlement } from '../../engine/economy';
import { formatCurrency } from '../components/format';

export interface SalaryDayModalCallbacks {
  onConfirmed: () => void;
}

export function renderSalaryDayModal(state: GameState, callbacks: SalaryDayModalCallbacks): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const cf = computeMonthlyCashflow(state);
  const surplus = Math.max(0, cf.netFreeCashflow);

  let allocEmergency = Math.round(surplus * 0.35);
  let allocSIP = Math.round(surplus * 0.40);
  let allocDebt = Math.min(state.liabilities.loans.reduce((sum, l) => sum + l.balance, 0), Math.round(surplus * 0.15));
  let allocFun = surplus - allocEmergency - allocSIP - allocDebt;

  const sched = state.resources.dailySchedule;

  overlay.innerHTML = `
    <div class="modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
        <h2 style="font-size: 1.25rem; font-weight: 700;">📅 Salary Day — Month ${state.player.currentMonth}, Year ${state.player.currentYear}</h2>
        <span class="time-tag">Day 1 Calibration</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md);">
          <div class="metric-label" style="margin-bottom: 6px;">Total Inflows</div>
          <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;"><span>Primary Salary:</span> <strong>${formatCurrency(cf.inflows.salary)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Business Profit:</span> <strong>${formatCurrency(cf.inflows.businessProfit)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Rental Income:</span> <strong>${formatCurrency(cf.inflows.rentalIncome)}</strong></div>
            <div style="border-top: 1px solid var(--border-subtle); margin-top: 4px; padding-top: 4px; display: flex; justify-content: space-between; font-weight: 700; color: var(--accent-green);">
              <span>Gross Inflow:</span> <span>${formatCurrency(cf.inflows.totalInflow)}</span>
            </div>
          </div>
        </div>

        <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md);">
          <div class="metric-label" style="margin-bottom: 6px;">Fixed Commitments (Auto-Debited)</div>
          <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between;"><span>Housing (Rent/EMI):</span> <strong>${formatCurrency(cf.outflows.housingCost)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Loan EMIs:</span> <strong>${formatCurrency(cf.outflows.loanEMIs)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Insurance:</span> <strong>${formatCurrency(cf.outflows.insuranceCost)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Food & Utilities:</span> <strong>${formatCurrency(cf.outflows.foodBudget + cf.outflows.utilitiesCost)}</strong></div>
            <div style="border-top: 1px solid var(--border-subtle); margin-top: 4px; padding-top: 4px; display: flex; justify-content: space-between; font-weight: 700; color: var(--accent-rose);">
              <span>Fixed Outflow:</span> <span>${formatCurrency(cf.outflows.totalFixedOutflow)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; font-size: 0.95rem;">💵 Net Discretionary Surplus Available:</span>
        <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-green);">${formatCurrency(surplus)}</span>
      </div>

      <div>
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 10px;">Allocate Surplus Funds</h4>
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem;">
          <div>
            <div style="display: flex; justify-content: space-between;">
              <span>Emergency Buffer Top-Up (3.5% APY):</span>
              <strong id="val-alloc-emergency">${formatCurrency(allocEmergency)}</strong>
            </div>
            <input type="range" id="range-emergency" min="0" max="${surplus}" step="25" value="${allocEmergency}" style="width: 100%; accent-color: var(--accent-green);" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between;">
              <span>Wealth Accumulation (Index SIP):</span>
              <strong id="val-alloc-sip">${formatCurrency(allocSIP)}</strong>
            </div>
            <input type="range" id="range-sip" min="0" max="${surplus}" step="25" value="${allocSIP}" style="width: 100%; accent-color: var(--accent-cyan);" />
          </div>

          <div>
            <div style="display: flex; justify-content: space-between;">
              <span>Extra Debt Avalanche Paydown:</span>
              <strong id="val-alloc-debt">${formatCurrency(allocDebt)}</strong>
            </div>
            <input type="range" id="range-debt" min="0" max="${surplus}" step="25" value="${allocDebt}" style="width: 100%; accent-color: var(--accent-amber);" />
          </div>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h4 style="font-size: 0.95rem; font-weight: 700;">Daily 24-Hour Schedule Budgeting</h4>
          <span class="time-tag" id="total-time-tag">Total: 24.0 / 24.0 Hrs</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.82rem;">
          <div class="metric-pill">
            <span class="metric-label">Sleep (hrs)</span>
            <input type="number" id="inp-sleep" min="5" max="9" step="0.5" value="${sched.sleepHours}" style="background: transparent; color: #fff; border: 1px solid var(--border-subtle); padding: 4px; border-radius: 4px;" />
          </div>
          <div class="metric-pill">
            <span class="metric-label">Core Work (hrs)</span>
            <span style="font-weight: 700; margin-top: 4px;">${sched.workHours} hrs (Contract)</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Commute (hrs)</span>
            <span style="font-weight: 700; margin-top: 4px;">${sched.commuteHours} hrs (Location)</span>
          </div>
          <div class="metric-pill">
            <span class="metric-label">Gym (hrs)</span>
            <input type="number" id="inp-gym" min="0" max="2" step="0.5" value="${sched.gymHours}" style="background: transparent; color: #fff; border: 1px solid var(--border-subtle); padding: 4px; border-radius: 4px;" />
          </div>
          <div class="metric-pill">
            <span class="metric-label">Meal Prep (hrs)</span>
            <input type="number" id="inp-meal" min="0" max="1.5" step="0.5" value="${sched.mealDisciplineHours}" style="background: transparent; color: #fff; border: 1px solid var(--border-subtle); padding: 4px; border-radius: 4px;" />
          </div>
          <div class="metric-pill">
            <span class="metric-label">Study / Side Biz (hrs)</span>
            <input type="number" id="inp-study" min="0" max="4" step="0.5" value="${sched.studySideHustleHours}" style="background: transparent; color: #fff; border: 1px solid var(--border-subtle); padding: 4px; border-radius: 4px;" />
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
        <button id="btn-confirm-salary-day" class="btn-action success" style="padding: 10px 24px; font-size: 0.95rem;">
          Confirm Blueprint & Resume Month ▶
        </button>
      </div>
    </div>
  `;

  const rangeEmergency = overlay.querySelector('#range-emergency') as HTMLInputElement;
  const rangeSIP = overlay.querySelector('#range-sip') as HTMLInputElement;
  const rangeDebt = overlay.querySelector('#range-debt') as HTMLInputElement;

  const updateAllocLabels = () => {
    allocEmergency = parseInt(rangeEmergency.value, 10);
    allocSIP = parseInt(rangeSIP.value, 10);
    allocDebt = parseInt(rangeDebt.value, 10);
    allocFun = Math.max(0, surplus - allocEmergency - allocSIP - allocDebt);

    overlay.querySelector('#val-alloc-emergency')!.textContent = formatCurrency(allocEmergency);
    overlay.querySelector('#val-alloc-sip')!.textContent = formatCurrency(allocSIP);
    overlay.querySelector('#val-alloc-debt')!.textContent = formatCurrency(allocDebt);
  };

  rangeEmergency.addEventListener('input', updateAllocLabels);
  rangeSIP.addEventListener('input', updateAllocLabels);
  rangeDebt.addEventListener('input', updateAllocLabels);

  const inpSleep = overlay.querySelector('#inp-sleep') as HTMLInputElement;
  const inpGym = overlay.querySelector('#inp-gym') as HTMLInputElement;
  const inpMeal = overlay.querySelector('#inp-meal') as HTMLInputElement;
  const inpStudy = overlay.querySelector('#inp-study') as HTMLInputElement;
  const totalTag = overlay.querySelector('#total-time-tag') as HTMLElement;

  const updateSchedule = () => {
    const sleep = parseFloat(inpSleep.value) || 7.5;
    const gym = parseFloat(inpGym.value) || 1.0;
    const meal = parseFloat(inpMeal.value) || 1.0;
    const study = parseFloat(inpStudy.value) || 1.5;
    const fixed = sched.workHours + sched.commuteHours;
    const assigned = sleep + gym + meal + study + fixed;
    const leisure = Math.max(0, 24 - assigned);

    sched.sleepHours = sleep;
    sched.gymHours = gym;
    sched.mealDisciplineHours = meal;
    sched.studySideHustleHours = study;
    sched.leisureHours = leisure;

    totalTag.textContent = `Total: ${(assigned + leisure).toFixed(1)} / 24.0 Hrs (Leisure: ${leisure.toFixed(1)}h)`;
  };

  inpSleep.addEventListener('input', updateSchedule);
  inpGym.addEventListener('input', updateSchedule);
  inpMeal.addEventListener('input', updateSchedule);
  inpStudy.addEventListener('input', updateSchedule);

  overlay.querySelector('#btn-confirm-salary-day')?.addEventListener('click', () => {
    executeSalaryDaySettlement(state, {
      emergencyTopUp: allocEmergency,
      sipEquities: allocSIP,
      extraDebtPaydown: allocDebt,
      funMoney: allocFun
    });

    state.simulation.recentLogs.unshift({
      day: state.player.currentDay,
      message: `📅 Salary Day Completed: Discretionary cashflow allocated ($${allocEmergency} Buffer, $${allocSIP} SIP, $${allocDebt} Debt).`,
      type: 'info'
    });

    overlay.remove();
    callbacks.onConfirmed();
  });

  return overlay;
}
