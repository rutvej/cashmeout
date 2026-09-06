import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';

export function renderBusinessScreen(state: GameState, onAction: (action: string, payload?: any) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-content';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '14px';

  const headerCard = document.createElement('div');
  headerCard.className = 'card';
  headerCard.innerHTML = `
    <div class="card-title">
      <span>Enterprise & Commerce Sectors</span>
      <span class="badge badge-gold">Fixed Slots Scarcity</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Each sector has limited operator licenses. If you don't claim an open slot, ambitious NPCs will.
      More competitors in the same sector dilute individual profit margins.
    </div>
  `;
  container.appendChild(headerCard);

  // Render each sector
  state.market.businessSectors.forEach(sector => {
    const card = document.createElement('div');
    card.className = 'card';

    const occupiedCount = sector.slots.filter(s => s.owner !== null).length;
    const isPlayerInSector = sector.slots.some(s => s.owner === 'player');
    const freeSlots = sector.slots.filter(s => s.owner === null);

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem;">${sector.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">
            Cost: ${formatCurrency(sector.startupCost)} • Base Rev: ${formatCurrency(sector.baseRevenuePerCycle)} / 30d • Upkeep: ${formatCurrency(sector.slotUpkeepPerCycle)}/mo
          </div>
        </div>
        <span class="badge ${occupiedCount >= sector.capacity ? 'badge-red' : 'badge-green'}">
          ${occupiedCount}/${sector.capacity} Slots
        </span>
      </div>

      <!-- Slots Visual -->
      <div style="display: grid; grid-template-columns: repeat(${sector.capacity}, 1fr); gap: 6px; margin: 6px 0;">
        ${sector.slots.map(s => {
          if (!s.owner) {
            return `
              <div style="border: 1px dashed #334155; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: var(--text-muted);">
                Vacant Slot
              </div>
            `;
          }
          if (s.owner === 'player') {
            return `
              <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid var(--accent-green); padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: #4ade80; font-weight: 700;">
                ⭐ Your Business
              </div>
            `;
          }
          const npc = state.npcs.find(n => n.id === s.owner);
          return `
            <div style="background: #0b0f19; border: 1px solid #1a2336; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.65rem; color: var(--text-muted);">
              ${npc?.name.split(' ')[0] || 'Competitor'}
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end;">
        ${!isPlayerInSector && freeSlots.length > 0
          ? `<button class="btn btn-primary btn-claim-slot" data-sector="${sector.id}" style="font-size: 0.75rem;">Launch Business (${formatCurrency(sector.startupCost)})</button>`
          : (isPlayerInSector ? `<span style="font-size: 0.75rem; color: var(--accent-green); font-weight: 700;">Active Operator</span>` : `<span style="font-size: 0.75rem; color: var(--text-muted);">Sector Full</span>`)
        }
      </div>
    `;

    card.querySelector('.btn-claim-slot')?.addEventListener('click', () => {
      onAction('claim-business-slot', { sectorId: sector.id });
    });

    container.appendChild(card);
  });

  return container;
}
