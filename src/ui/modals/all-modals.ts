import { GameState } from '../../types/game';
import { FOOD_TIERS } from '../../data/static-data';
import { formatCurrency } from '../components/format';

export function showTimeAllocationModal(state: GameState, onClose: () => void, onSave: (newAlloc: any) => void): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const t = { ...state.player.timeAllocation };

  const sheet = document.createElement('div');
  sheet.className = 'modal-sheet';
  sheet.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.1rem;">Divide 6 Time Slots</h3>
      <span id="slot-counter" class="badge badge-green" style="font-size: 0.8rem;">6 / 6 Allocated</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Every hour counts. Balance work, exercise, study, and rest. Job takes fixed ${t.job} slots.
    </div>
    <div id="alloc-rows" style="display: flex; flex-direction: column; gap: 8px;">
      ${renderTimeRow('Commute', t.commute, 'commute')}
      ${renderTimeRow('Exercise / Workout', t.exercise, 'exercise')}
      ${renderTimeRow('Home Cooking', t.cooking, 'cooking')}
      ${renderTimeRow('Freelance Side Hustle', t.sideHustle, 'sideHustle')}
      ${renderTimeRow('Education & Study', t.education, 'education')}
      ${renderTimeRow('Deep Rest & Sleep', t.rest, 'rest')}
      ${renderTimeRow('Free Time & Leisure', t.free, 'free')}
    </div>
    <div style="display: flex; gap: 8px; margin-top: 10px;">
      <button class="btn" id="btn-cancel-time" style="flex: 1;">Cancel</button>
      <button class="btn btn-primary" id="btn-save-time" style="flex: 1;">Confirm Schedule</button>
    </div>
  `;

  backdrop.appendChild(sheet);

  function updateCount() {
    const total = t.job + t.commute + t.exercise + t.cooking + t.sideHustle + t.education + t.rest + t.free;
    const badge = sheet.querySelector('#slot-counter') as HTMLElement;
    badge.innerText = `${total} / 6 Allocated`;
    badge.className = `badge ${total === 6 ? 'badge-green' : 'badge-red'}`;
  }

  sheet.querySelectorAll('.btn-slot-adj').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = (e.currentTarget as HTMLElement).getAttribute('data-key') as keyof typeof t;
      const delta = parseInt((e.currentTarget as HTMLElement).getAttribute('data-delta') || '0', 10);
      const cur = t[key] as number;
      if (cur + delta >= 0) {
        (t as any)[key] = cur + delta;
        const valSpan = sheet.querySelector(`#val-${key}`) as HTMLElement;
        if (valSpan) valSpan.innerText = String((t as any)[key]);
        updateCount();
      }
    });
  });

  sheet.querySelector('#btn-cancel-time')?.addEventListener('click', onClose);
  sheet.querySelector('#btn-save-time')?.addEventListener('click', () => {
    const total = t.job + t.commute + t.exercise + t.cooking + t.sideHustle + t.education + t.rest + t.free;
    if (total !== 6) {
      alert(`Must allocate exactly 6 time slots! Currently have ${total}.`);
      return;
    }
    onSave(t);
    onClose();
  });

  return backdrop;
}

function renderTimeRow(label: string, val: number, key: string): string {
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; background: #0b0f19; padding: 6px 10px; border-radius: 6px;">
      <span style="font-size: 0.8rem; font-weight: 600;">${label}</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn btn-slot-adj" data-key="${key}" data-delta="-1" style="padding: 2px 8px; font-size: 0.8rem;">-</button>
        <span id="val-${key}" style="font-weight: 700; min-width: 16px; text-align: center;">${val}</span>
        <button class="btn btn-slot-adj" data-key="${key}" data-delta="1" style="padding: 2px 8px; font-size: 0.8rem;">+</button>
      </div>
    </div>
  `;
}

export function showDietModal(state: GameState, onClose: () => void, onSelect: (diet: any) => void): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const sheet = document.createElement('div');
  sheet.className = 'modal-sheet';
  sheet.innerHTML = `
    <h3 style="font-size: 1.1rem;">Choose Daily Diet Quality</h3>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Cheap food saves cash but triggers severe gastroenteritis bills. Healthy cooking requires equipment and time.
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${Object.values(FOOD_TIERS).map(tier => {
        const isCurrent = state.player.lifestyle.foodTier === tier.id;
        const hasEquipment = state.player.lifestyleAssets.some(a => a.id === 'cooking-equipment');
        const canPick = !tier.requiresCookingEquipment || hasEquipment;

        return `
          <div style="background: #0b0f19; border: 1px solid ${isCurrent ? 'var(--accent-green)' : '#1a2336'}; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${tier.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${tier.description}</div>
              ${tier.requiresCookingEquipment && !hasEquipment ? '<div style="font-size: 0.65rem; color: var(--accent-red); margin-top: 2px;">⚠️ Requires Gourmet Kitchen Set from Assets tab</div>' : ''}
            </div>
            <button class="btn ${isCurrent ? 'btn-success' : 'btn-primary'} btn-pick-diet" data-id="${tier.id}" style="font-size: 0.75rem;" ${!canPick ? 'disabled' : ''}>
              ${isCurrent ? 'Active' : 'Choose'}
            </button>
          </div>
        `;
      }).join('')}
    </div>
    <button class="btn" id="btn-close-diet" style="margin-top: 10px;">Close</button>
  `;

  backdrop.appendChild(sheet);

  sheet.querySelectorAll('.btn-pick-diet').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onSelect(id);
      onClose();
    });
  });

  sheet.querySelector('#btn-close-diet')?.addEventListener('click', onClose);

  return backdrop;
}

export function showStockTradeModal(
  state: GameState,
  tickerId: string,
  onClose: () => void,
  onTrade: (action: 'buy' | 'sell' | 'sip', shares: number) => void
): HTMLElement {
  const ticker = state.market.tickers.find(t => t.id === tickerId)!;
  const holding = state.player.portfolio[tickerId] || { shares: 0, avgCost: 0 };

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const sheet = document.createElement('div');
  sheet.className = 'modal-sheet';
  sheet.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size: 1.1rem;">${ticker.name} (${ticker.id})</h3>
      <span class="badge badge-green">${formatCurrency(ticker.price)}</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Your holding: <strong>${holding.shares} shares</strong> (Avg: ${formatCurrency(holding.avgCost)}) • Liquid cash: ${formatCurrency(state.player.money)}
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <label style="font-size: 0.75rem; font-weight: 600;">Shares to Trade:</label>
      <input type="number" id="trade-shares-input" value="10" min="1" max="10000" style="background: #0b0f19; border: 1px solid #1a2336; padding: 8px; color: white; border-radius: 6px; font-size: 1rem;" />
      <div id="trade-cost-preview" style="font-size: 0.75rem; color: #38bdf8;">Estimated Cost: ${formatCurrency(10 * ticker.price)}</div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 6px;">
      <button class="btn btn-primary" id="btn-exec-buy">Buy Shares</button>
      <button class="btn btn-danger" id="btn-exec-sell" ${holding.shares <= 0 ? 'disabled' : ''}>Sell Shares</button>
    </div>

    <hr style="border-color: #1a2336; margin: 4px 0;" />

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-weight: 700; font-size: 0.85rem;">Systematic Investment Plan (SIP)</div>
        <div style="font-size: 0.65rem; color: var(--text-muted);">Auto-invest ₹1,000 every 15 days into this stock</div>
      </div>
      <button class="btn btn-primary" id="btn-toggle-sip" style="font-size: 0.75rem;">Enable SIP</button>
    </div>

    <button class="btn" id="btn-close-trade" style="margin-top: 6px;">Done</button>
  `;

  backdrop.appendChild(sheet);

  const input = sheet.querySelector('#trade-shares-input') as HTMLInputElement;
  const preview = sheet.querySelector('#trade-cost-preview') as HTMLElement;

  input?.addEventListener('input', () => {
    const qty = parseInt(input.value || '0', 10);
    preview.innerText = `Estimated Cost: ${formatCurrency(qty * ticker.price)}`;
  });

  sheet.querySelector('#btn-exec-buy')?.addEventListener('click', () => {
    const qty = parseInt(input.value || '0', 10);
    if (qty <= 0) return;
    if (state.player.money < qty * ticker.price) {
      alert('Insufficient liquid cash!');
      return;
    }
    onTrade('buy', qty);
    onClose();
  });

  sheet.querySelector('#btn-exec-sell')?.addEventListener('click', () => {
    const qty = parseInt(input.value || '0', 10);
    if (qty <= 0) return;
    if (holding.shares < qty) {
      alert('Cannot sell more shares than you hold!');
      return;
    }
    onTrade('sell', qty);
    onClose();
  });

  sheet.querySelector('#btn-toggle-sip')?.addEventListener('click', () => {
    onTrade('sip', 1000);
    onClose();
  });

  sheet.querySelector('#btn-close-trade')?.addEventListener('click', onClose);

  return backdrop;
}
