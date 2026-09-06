import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { ASSET_CATALOG } from '../../data/static-data';

export function renderAssetsScreen(state: GameState, onAction: (action: string, payload?: any) => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-content';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '14px';

  // 1. Real Estate Properties
  const propCard = document.createElement('div');
  propCard.className = 'card';
  propCard.innerHTML = `
    <div class="card-title">
      <span>Real Estate Marketplace</span>
      <span class="badge badge-green">Appreciating Assets</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Acquire land or apartments for monthly rental yield and capital appreciation:</div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      ${state.market.properties.map(p => {
        const isOwnedByPlayer = p.owner === 'player';
        const isOwnedByNpc = p.owner && p.owner !== 'player';
        const ownerNpc = isOwnedByNpc ? state.npcs.find(n => n.id === p.owner) : null;

        return `
          <div style="background: #0b0f19; padding: 10px 12px; border-radius: 8px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${p.name} <span style="font-size: 0.7rem; color: var(--text-muted);">(${p.location})</span></div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">
                Valuation: ${formatCurrency(p.price)} • Yield: ${p.rentYieldPct}% (~${formatCurrency(Math.round(p.price * (p.rentYieldPct/100/12)))}/mo)
              </div>
              <div style="font-size: 0.65rem; color: ${p.riskProfile.legalStatus === 'clear' ? 'var(--accent-green)' : 'var(--accent-gold)'};">
                Legal status: ${p.riskProfile.legalStatus.toUpperCase()} (${p.riskProfile.issueChancePct}% dispute risk)
              </div>
            </div>
            <div>
              ${isOwnedByPlayer
                ? `<span class="badge badge-green">Owned by You</span>`
                : (isOwnedByNpc
                  ? `<span class="badge badge-gold">Owned: ${ownerNpc?.name || 'NPC'}</span>`
                  : `<button class="btn btn-primary btn-buy-prop" data-id="${p.id}" style="font-size: 0.75rem;">Buy</button>`)
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(propCard);

  // 2. Functional & Depreciating Assets (Vehicles, Laptop, Equipment)
  const lifestyleCard = document.createElement('div');
  lifestyleCard.className = 'card';
  lifestyleCard.innerHTML = `
    <div class="card-title">
      <span>Tools, Vehicles & Lifestyle Assets</span>
      <span class="badge badge-gold">Time-Saving Tools</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">These depreciate over time, but unlock critical time-slots, side hustles, or health boosts:</div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
      ${ASSET_CATALOG.map(item => {
        const owned = state.player.lifestyleAssets.find(a => a.id === item.id);

        return `
          <div style="background: #0b0f19; padding: 10px 12px; border-radius: 8px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div style="max-width: 70%;">
              <div style="font-weight: 700; font-size: 0.85rem;">${item.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">${item.description}</div>
              <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">
                Price: ${formatCurrency(item.price)} • Deprec: ${(item.depreciationPerYear * 100).toFixed(0)}%/yr • Upkeep: ${formatCurrency(item.monthlyUpkeep)}/mo
              </div>
            </div>
            <div>
              ${owned
                ? `<span class="badge badge-green">In Garage</span>`
                : `<button class="btn btn-primary btn-buy-asset" data-id="${item.id}" style="font-size: 0.75rem;">Acquire</button>`
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(lifestyleCard);

  // Wire Property Buttons
  propCard.querySelectorAll('.btn-buy-prop').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('buy-property', { propertyId: id });
    });
  });

  // Wire Asset Buttons
  lifestyleCard.querySelectorAll('.btn-buy-asset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('buy-lifestyle-asset', { assetId: id });
    });
  });

  return container;
}
