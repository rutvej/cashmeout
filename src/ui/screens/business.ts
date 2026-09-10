import { GameState, ActiveBusiness } from '../../types/game';
import { BUSINESS_TYPES } from '../../data/businesses';
import { formatCurrency } from '../components/format';

export interface BusinessCallbacks {
  onRefresh: () => void;
}

export function renderBusinessScreen(state: GameState, callbacks: BusinessCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-container';

  container.innerHTML = `
    <!-- Active Businesses -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">🏪 Active Commercial Ventures</h2>
        <span class="metric-value positive">${state.business.activeBusinesses.length} Operating</span>
      </div>

      ${state.business.activeBusinesses.length > 0 ? `
        <div class="item-list">
          ${state.business.activeBusinesses.map(biz => {
            const net = biz.currentMonthlyRevenue - biz.currentMonthlyOpsCost;
            return `
              <div class="list-item">
                <div>
                  <div style="font-weight: 700; font-size: 1.05rem;">
                    ${biz.name} <span class="time-tag">Level ${biz.scaleLevel}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">
                    Stage: ${biz.stage} • Time Required: ${biz.timeSlots} Daily Slots • Staff: ${biz.employeesCount}
                  </div>
                  <div style="font-size: 0.82rem; margin-top: 4px;">
                    Rev: ${formatCurrency(biz.currentMonthlyRevenue)}/mo • Ops Cost: ${formatCurrency(biz.currentMonthlyOpsCost)}/mo
                    • <strong style="color: ${net >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)'};">Net Profit: ${formatCurrency(net)}/mo</strong>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <button class="btn-action success" data-scale-biz="${biz.id}">Scale Up ($4,000)</button>
                  <button class="btn-action danger" data-sell-biz="${biz.id}">Sell (12x Mo Profit)</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">
          No active businesses. Launch a side hustle or enterprise from the catalog below!
        </div>
      `}
    </div>

    <!-- Start a Business Catalog -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🚀 Launch a New Enterprise (Spec 05)</h3>
      </div>
      <div class="item-list">
        ${BUSINESS_TYPES.map(bType => {
          const alreadyRunning = state.business.activeBusinesses.some(b => b.typeId === bType.id);
          const hasPrereq = !bType.prerequisiteCourseId || state.career.completedCourseIds.includes(bType.prerequisiteCourseId);
          const canAfford = state.resources.cashOnHand >= bType.startupCost;
          const isEligible = !alreadyRunning && hasPrereq && canAfford;

          return `
            <div class="list-item">
              <div style="max-width: 500px;">
                <div style="font-weight: 700; font-size: 0.95rem;">${bType.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  Monthly Revenue Potential: ${formatCurrency(bType.minRevenue)} – ${formatCurrency(bType.maxRevenue)} • Base Ops: ${formatCurrency(bType.monthlyOpsCost)}/mo
                </div>
                <div style="font-size: 0.75rem; color: var(--accent-cyan); margin-top: 2px;">
                  Startup Cost: ${formatCurrency(bType.startupCost)} • Daily Time Slots: ${bType.timeSlots} • Risk: ${bType.riskLevel}
                  ${bType.prerequisiteCourseId && !hasPrereq ? ` • <span style="color: var(--accent-rose);">Requires ${bType.prerequisiteCourseId.replace('course-', '')}</span>` : ''}
                </div>
              </div>

              <div>
                ${alreadyRunning ? `
                  <span class="time-tag">Already Active</span>
                ` : `
                  <button class="btn-action ${isEligible ? 'success' : ''}" data-start-biz="${bType.id}" ${!isEligible ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                    ${canAfford ? (hasPrereq ? 'Launch Venture' : 'Prereq Missing') : 'Insufficient Cash'}
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Scale business listener
  container.querySelectorAll('button[data-scale-biz]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bId = (btn as HTMLElement).dataset.scaleBiz!;
      const biz = state.business.activeBusinesses.find(b => b.id === bId);
      if (!biz || state.resources.cashOnHand < 4000) return;
      state.resources.cashOnHand -= 4000;
      biz.scaleLevel += 1;
      biz.currentMonthlyRevenue = Math.round(biz.currentMonthlyRevenue * 1.4);
      biz.currentMonthlyOpsCost = Math.round(biz.currentMonthlyOpsCost * 1.25);
      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `📈 Scaled ${biz.name} to Level ${biz.scaleLevel}! Revenue expanded to ${formatCurrency(biz.currentMonthlyRevenue)}/mo.`,
        type: 'positive'
      });
      callbacks.onRefresh();
    });
  });

  // Sell business listener
  container.querySelectorAll('button[data-sell-biz]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bId = (btn as HTMLElement).dataset.sellBiz!;
      const biz = state.business.activeBusinesses.find(b => b.id === bId);
      if (!biz) return;
      const net = Math.max(0, biz.currentMonthlyRevenue - biz.currentMonthlyOpsCost);
      const valuation = net * 12 + (biz.scaleLevel * 6000);
      state.resources.cashOnHand += valuation;
      state.business.activeBusinesses = state.business.activeBusinesses.filter(b => b.id !== bId);
      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `🤝 Enterprise Exit: Sold ${biz.name} for ${formatCurrency(valuation)} lump sum!`,
        type: 'positive'
      });
      callbacks.onRefresh();
    });
  });

  // Start business listener
  container.querySelectorAll('button[data-start-biz]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tId = (btn as HTMLElement).dataset.startBiz!;
      const bType = BUSINESS_TYPES.find(b => b.id === tId);
      if (!bType || state.resources.cashOnHand < bType.startupCost) return;

      state.resources.cashOnHand -= bType.startupCost;
      const newBiz: ActiveBusiness = {
        id: `biz-${Date.now()}`,
        typeId: bType.id,
        name: bType.name,
        stage: 'SIDE_HUSTLE',
        currentMonthlyRevenue: Math.round((bType.minRevenue + bType.maxRevenue) / 2),
        currentMonthlyOpsCost: bType.monthlyOpsCost,
        timeSlots: bType.timeSlots,
        scaleLevel: 1,
        totalProfitGenerated: 0,
        employeesCount: 1
      };
      state.business.activeBusinesses.push(newBiz);
      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `🚀 Venture Launched: ${bType.name} is now operational!`,
        type: 'positive'
      });
      callbacks.onRefresh();
    });
  });

  return container;
}
