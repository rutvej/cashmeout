import { GameState, Property } from '../../types/game';
import { RENTAL_TIERS, BUYABLE_PROPERTIES } from '../../data/properties';
import { getCreditTierInfo } from '../../engine/credit';
import { formatCurrency } from '../components/format';

export interface PropertyCallbacks {
  onRefresh: () => void;
}

export function renderPropertyScreen(state: GameState, callbacks: PropertyCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-container';

  const creditInfo = getCreditTierInfo(state.resources.creditScore);
  const ownedHome = state.property.ownedProperties.find(p => p.type === 'home');
  const investmentProps = state.property.ownedProperties.filter(p => p.type === 'rental');

  container.innerHTML = `
    <!-- Current Living Arrangement -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🏠 Primary Residence</h2>
        <span class="time-tag">${state.property.isRenting ? 'Tenant (Renting)' : 'Homeowner'}</span>
      </div>

      ${state.property.isRenting ? `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 1.1rem; font-weight: 700;">
              ${RENTAL_TIERS.find(t => t.id === state.property.rentalTier)?.name}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
              Commute: ${RENTAL_TIERS.find(t => t.id === state.property.rentalTier)?.commuteHoursDaily} hrs/day • Rent Creep applies every Jan 1 (~7-8%)
            </div>
          </div>
          <div>
            <div class="metric-label">Monthly Rent</div>
            <div class="metric-value danger" style="font-size: 1.2rem;">${formatCurrency(state.property.currentMonthlyRent)}/mo</div>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); width: 100%;">Switch Rental Tier:</span>
          ${RENTAL_TIERS.map(tier => `
            <button class="btn-ctrl ${state.property.rentalTier === tier.id ? 'active' : ''}" data-change-rent="${tier.id}">
              ${tier.name} (${formatCurrency(tier.monthlyCostYear1)}/mo)
            </button>
          `).join('')}
        </div>
      ` : (ownedHome ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
          <div>
            <div style="font-size: 1.1rem; font-weight: 700;">${ownedHome.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Mortgage: 25-Year Fixed @ ${(creditInfo.mortgageAPR * 100).toFixed(1)}% APR</div>
          </div>
          <div>
            <div class="metric-label">Property Valuation</div>
            <div class="metric-value positive">${formatCurrency(ownedHome.currentValue)}</div>
          </div>
          <div>
            <div class="metric-label">Mortgage Balance</div>
            <div class="metric-value danger">${formatCurrency(ownedHome.mortgageBalance)}</div>
          </div>
          <div>
            <div class="metric-label">Monthly EMI</div>
            <div class="metric-value">${formatCurrency(ownedHome.monthlyEMI)}/mo</div>
          </div>
          <div>
            <div class="metric-label">Net Equity</div>
            <div class="metric-value positive">${formatCurrency(ownedHome.currentValue - ownedHome.mortgageBalance)}</div>
          </div>
        </div>
      ` : '')}
    </div>

    <!-- Real Estate Acquisitions Catalog -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🏗️ Real Estate Market (Spec 06)</h3>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Mortgage Rate: ${(creditInfo.mortgageAPR * 100).toFixed(1)}% APR</span>
      </div>

      <div class="item-list">
        ${BUYABLE_PROPERTIES.map(prop => {
          const downPayment = Math.round(prop.purchasePrice * prop.downPaymentPct);
          const canAffordDown = state.resources.cashOnHand >= downPayment;
          const isEligible = canAffordDown && creditInfo.mortgageEligible;
          const isAlreadyHomeowner = prop.type === 'home' && !state.property.isRenting;

          // Approx EMI
          const loanPrincipal = prop.purchasePrice - downPayment;
          const monthlyRate = creditInfo.mortgageAPR / 12;
          const totalMonths = 300; // 25 years
          const emi = Math.round((loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1));

          return `
            <div class="list-item">
              <div style="max-width: 500px;">
                <div style="font-weight: 700; font-size: 0.95rem;">
                  ${prop.name} <span class="time-tag">${prop.type === 'home' ? 'Residential Home' : 'Investment Asset'}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${prop.description}</div>
                <div style="font-size: 0.78rem; color: var(--accent-cyan); margin-top: 2px;">
                  Price: ${formatCurrency(prop.purchasePrice)} • Down Payment (20%): ${formatCurrency(downPayment)} • EMI: ~${formatCurrency(emi)}/mo
                  ${prop.type === 'rental' ? ` • <strong style="color: var(--accent-green);">Tenant Rent: ${formatCurrency(prop.expectedMonthlyRent)}/mo</strong>` : ''}
                </div>
              </div>

              <div>
                ${isAlreadyHomeowner ? `
                  <span class="time-tag">Already Own Home</span>
                ` : `
                  <button class="btn-action ${isEligible ? 'success' : ''}" data-buy-prop="${prop.id}" ${!isEligible ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                    ${creditInfo.mortgageEligible ? (canAffordDown ? 'Purchase Property' : 'Down Payment Short') : 'Credit Ineligible'}
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Investment Properties Portfolio -->
    ${investmentProps.length > 0 ? `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">🏢 Investment Real Estate Portfolio</h3>
        </div>
        <div class="item-list">
          ${investmentProps.map(p => `
            <div class="list-item">
              <div>
                <div style="font-weight: 700;">${p.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  Valuation: ${formatCurrency(p.currentValue)} • Mortgage: ${formatCurrency(p.mortgageBalance)} • EMI: ${formatCurrency(p.monthlyEMI)}/mo
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="metric-value positive">+${formatCurrency(p.tenantMonthlyRent)}/mo Rent</span>
                <span class="time-tag" style="color: var(--accent-green);">Occupied</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  // Change rent tier listener
  container.querySelectorAll('button[data-change-rent]').forEach(btn => {
    btn.addEventListener('click', () => {
      const rId = (btn as HTMLElement).dataset.changeRent! as any;
      const tier = RENTAL_TIERS.find(t => t.id === rId);
      if (!tier) return;
      state.property.rentalTier = rId;
      state.property.currentMonthlyRent = tier.monthlyCostYear1;
      state.resources.dailySchedule.commuteHours = tier.commuteHoursDaily;
      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `🏠 Relocated to ${tier.name}. Monthly rent is now ${formatCurrency(tier.monthlyCostYear1)}/mo.`,
        type: 'info'
      });
      callbacks.onRefresh();
    });
  });

  // Buy property listener
  container.querySelectorAll('button[data-buy-prop]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pId = (btn as HTMLElement).dataset.buyProp!;
      const opt = BUYABLE_PROPERTIES.find(p => p.id === pId);
      if (!opt) return;

      const downPayment = Math.round(opt.purchasePrice * opt.downPaymentPct);
      if (state.resources.cashOnHand < downPayment) return;

      const loanPrincipal = opt.purchasePrice - downPayment;
      const monthlyRate = creditInfo.mortgageAPR / 12;
      const totalMonths = 300;
      const emi = Math.round((loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1));

      state.resources.cashOnHand -= downPayment;

      const newProp: Property = {
        id: `prop-${Date.now()}`,
        name: opt.name,
        type: opt.type,
        purchasePrice: opt.purchasePrice,
        currentValue: opt.purchasePrice,
        mortgageBalance: loanPrincipal,
        monthlyEMI: emi,
        downPayment,
        isInsured: true,
        tenantMonthlyRent: opt.expectedMonthlyRent,
        isVacant: false
      };

      state.property.ownedProperties.push(newProp);

      if (opt.type === 'home') {
        state.property.isRenting = false;
        state.resources.dailySchedule.commuteHours = opt.commuteHoursDaily;
      }

      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `🏡 Acquired ${opt.name}! Down payment of ${formatCurrency(downPayment)} cleared.`,
        type: 'positive'
      });
      callbacks.onRefresh();
    });
  });

  return container;
}
