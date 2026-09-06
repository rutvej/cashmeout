import { GameState } from '../../types/game';
import { calculateNetWorth } from '../../engine/economy-engine';
import { formatCurrency } from '../components/format';
import { FOOD_TIERS } from '../../data/static-data';

export function renderDashboardScreen(state: GameState, onAction: (action: string, payload?: any) => void): HTMLElement {
  const p = state.player;
  const netWorth = calculateNetWorth(state);

  const container = document.createElement('div');
  container.className = 'screen-content';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '14px';

  // 1. Net Worth Hero Card
  const netWorthCard = document.createElement('div');
  netWorthCard.className = 'card';
  netWorthCard.innerHTML = `
    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Estimated Net Worth</div>
    <div style="font-size: 1.8rem; font-weight: 800; color: #38bdf8;">${formatCurrency(netWorth)}</div>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 6px;">
      <div style="background: #0b0f19; padding: 8px; border-radius: 8px; border: 1px solid #1a2336;">
        <div style="font-size: 0.65rem; color: var(--text-muted);">Liquid Wallet</div>
        <div style="font-weight: 700; color: var(--accent-green); font-size: 1rem;">${formatCurrency(p.money)}</div>
      </div>
      <div style="background: #0b0f19; padding: 8px; border-radius: 8px; border: 1px solid #1a2336;">
        <div style="font-size: 0.65rem; color: var(--text-muted);">Bank Savings (3.5%)</div>
        <div style="font-weight: 700; color: #38bdf8; font-size: 1rem;">${formatCurrency(p.savingsBalance)}</div>
      </div>
    </div>
  `;
  container.appendChild(netWorthCard);

  // 2. Day Schedule & Time Allocation
  const scheduleCard = document.createElement('div');
  scheduleCard.className = 'card';
  scheduleCard.innerHTML = `
    <div class="card-title">
      <span>Daily Schedule (6 Time Slots)</span>
      <button class="btn btn-primary" id="btn-reallocate-time" style="font-size: 0.7rem; padding: 4px 8px;">Reallocate</button>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">How your 24 hours are divided today:</div>
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; text-align: center;">
      ${renderSlotPills(p.timeAllocation)}
    </div>
  `;
  container.appendChild(scheduleCard);

  // 3. Quick Career & Food Status
  const statusCard = document.createElement('div');
  statusCard.className = 'card';
  const foodTier = FOOD_TIERS[p.lifestyle.foodTier];
  statusCard.innerHTML = `
    <div class="card-title">
      <span>Active Occupation & Diet</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 10px; border-radius: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">${p.job.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Salary: ${formatCurrency(p.job.salaryPerCycle)} / ${p.job.payCycleDays} days</div>
      </div>
      <span class="badge badge-green">Level 1</span>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 10px; border-radius: 8px;">
      <div>
        <div style="font-weight: 700; font-size: 0.9rem;">Diet: ${foodTier.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">Cost: ${formatCurrency(foodTier.costPerDay)}/day • ${foodTier.physicalDelta >= 0 ? '+' : ''}${foodTier.physicalDelta} health/day</div>
      </div>
      <button class="btn" id="btn-change-diet" style="font-size: 0.7rem; padding: 4px 8px;">Change</button>
    </div>
  `;
  container.appendChild(statusCard);

  // 4. Ad Placeholder Slot
  const adCard = document.createElement('div');
  adCard.className = 'ad-slot-placeholder';
  adCard.innerText = '— Sponsored Partner Ad Slot —';
  container.appendChild(adCard);

  // 5. Recent Activity Ledger
  const logCard = document.createElement('div');
  logCard.className = 'card';
  logCard.innerHTML = `
    <div class="card-title">
      <span>Life & Financial Journal</span>
      <span style="font-size: 0.7rem; color: var(--text-muted);">Live stream</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
      ${p.eventLog.slice(0, 10).map(e => `
        <div style="font-size: 0.75rem; padding: 6px 8px; background: #0b0f19; border-left: 3px solid ${getLogColor(e.type)}; border-radius: 4px;">
          <span style="color: var(--text-muted); font-size: 0.65rem; margin-right: 6px;">Day ${e.day}</span>
          <span>${e.text}</span>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(logCard);

  // Attach handlers
  scheduleCard.querySelector('#btn-reallocate-time')?.addEventListener('click', () => {
    onAction('open-time-modal');
  });

  statusCard.querySelector('#btn-change-diet')?.addEventListener('click', () => {
    onAction('open-diet-modal');
  });

  return container;
}

function renderSlotPills(alloc: any): string {
  const slots: { name: string; color: string; icon: string }[] = [];

  for (let i = 0; i < alloc.job; i++) slots.push({ name: 'Job', color: '#0284c7', icon: '💼' });
  for (let i = 0; i < alloc.commute; i++) slots.push({ name: 'Commute', color: '#64748b', icon: '🚗' });
  for (let i = 0; i < alloc.exercise; i++) slots.push({ name: 'Workout', color: '#22c55e', icon: '🏋️' });
  for (let i = 0; i < alloc.cooking; i++) slots.push({ name: 'Cook', color: '#f97316', icon: '🍳' });
  for (let i = 0; i < alloc.sideHustle; i++) slots.push({ name: 'Hustle', color: '#eab308', icon: '💻' });
  for (let i = 0; i < alloc.education; i++) slots.push({ name: 'Study', color: '#a855f7', icon: '📚' });
  for (let i = 0; i < alloc.rest; i++) slots.push({ name: 'Rest', color: '#ec4899', icon: '😴' });
  for (let i = 0; i < alloc.free; i++) slots.push({ name: 'Free', color: '#475569', icon: '☕' });

  return slots.slice(0, 6).map(s => `
    <div style="background: ${s.color}22; border: 1px solid ${s.color}66; border-radius: 6px; padding: 6px 2px;">
      <div style="font-size: 0.9rem;">${s.icon}</div>
      <div style="font-size: 0.6rem; color: ${s.color}; font-weight: 700; margin-top: 2px;">${s.name}</div>
    </div>
  `).join('');
}

function getLogColor(type: string): string {
  switch (type) {
    case 'income': return '#22c55e';
    case 'expense': return '#ef4444';
    case 'investment': return '#38bdf8';
    case 'achievement': return '#fbbf24';
    default: return '#94a3b8';
  }
}
