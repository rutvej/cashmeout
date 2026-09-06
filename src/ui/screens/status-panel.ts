import { GameState } from '../../types/game';
import { calculateNetWorth } from '../../engine/economy-engine';
import { formatCurrency } from '../components/format';
import { exportSaveFile, resetGame } from '../../save/save-manager';
import { ALL_JOBS, FOOD_TIERS, COURSES } from '../../data/static-data';
import { HEALTH_INSURANCE_TIERS } from '../../data/insurance-plans';
import { UnlockManager } from '../../progression/unlock-manager';
import { FeatureUnlockDef } from '../../progression/unlock-types';
import { getConsequenceWarnings } from '../../engine/health-engine';

export function renderStatusPanelScreen(
  state: GameState,
  onAction: (action: string, payload?: any) => void,
  unlockManager: UnlockManager = new UnlockManager()
): HTMLElement {
  const p = state.player;
  const netWorth = calculateNetWorth(state);
  const healthWarnings = getConsequenceWarnings(state);

  const container = document.createElement('div');
  container.className = 'screen-content status-panel-screen';

  // 1. Hero Net Worth Card (Always Unlocked)
  const heroCard = document.createElement('div');
  heroCard.className = 'card status-hero-card';
  heroCard.innerHTML = `
    <div class="hero-label">Total Estimated Net Worth</div>
    <div class="hero-val">${formatCurrency(netWorth)}</div>
    <div class="hero-grid">
      <div class="hero-sub-box">
        <span class="sub-label">Liquid Cash</span>
        <span class="sub-val green">${formatCurrency(p.money)}</span>
      </div>
      <div class="hero-sub-box">
        <span class="sub-label">Bank Savings (3.5%)</span>
        <span class="sub-val blue">${formatCurrency(p.savingsBalance)}</span>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 1b. Active Doctor's Warning Advisory Banner (if any meter >= 60%)
  if (healthWarnings.length > 0) {
    const docCard = document.createElement('div');
    docCard.className = 'card doctor-alert-card';
    docCard.innerHTML = `
      <div class="doctor-alert-header">
        <span class="doctor-alert-icon">👨‍⚕️</span>
        <div>
          <div class="doctor-alert-title">Doctor's Medical Advisory</div>
          <div class="doctor-alert-sub">${healthWarnings[0].doctorName}</div>
        </div>
        <span class="badge badge-red">⚠️ ${healthWarnings[0].pct}% Red Zone</span>
      </div>
      <div class="doctor-quote-box">"${healthWarnings[0].advice}"</div>
      <div class="impending-box">
        ⚠️ <strong>Impending Emergency:</strong> ${healthWarnings[0].impendingCrisis} (Estimated Bill: ${formatCurrency(healthWarnings[0].expectedCost)})
      </div>
    `;
    container.appendChild(docCard);
  }

  // 2. Career, Occupation & Schedule Card
  const careerCard = document.createElement('div');
  careerCard.className = 'card';
  const foodTier = FOOD_TIERS[p.lifestyle.foodTier];
  careerCard.innerHTML = `
    <div class="card-title">
      <span>💼 Current Occupation & Routine</span>
      <button class="btn btn-primary btn-sm" id="btn-status-time-alloc">Reallocate Time</button>
    </div>
    
    <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:700; font-size:0.85rem;">${p.job.title}</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">Salary: ${formatCurrency(p.job.salaryPerCycle)} / 15d • Takes ${p.job.timeSlotsCost} slots</div>
      </div>
      <span class="badge badge-green">Active Position</span>
    </div>

    <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
      <div>
        <div style="font-weight:700; font-size:0.85rem;">Diet: ${foodTier.name}</div>
        <div style="font-size:0.7rem; color:var(--text-muted);">${formatCurrency(foodTier.costPerDay)}/day • ${foodTier.physicalDelta >= 0 ? '+' : ''}${foodTier.physicalDelta} health/day</div>
      </div>
      <button class="btn btn-sm" id="btn-status-change-diet">Change Diet</button>
    </div>

    <!-- Consequence Risk Trackers -->
    <div style="margin-top:12px; border-top:1px solid #1a2336; padding-top:8px;">
      <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); margin-bottom:6px;">
        🩺 Health Consequence Trackers (Doctor Alert at 60% • Crisis at 100%):
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${renderMeterRow('Street Food Strain', p.consequenceMeters.cheapFoodDays, 20, 'At 20d: Acute Gastroenteritis (₹3,500)')}
        ${renderMeterRow('Sedentary Inactivity', p.consequenceMeters.noExerciseDays, 35, 'At 35d: Severe Lumbar Spasm (₹5,500)')}
        ${renderMeterRow('High Stress Fatigue', p.consequenceMeters.highStressDays, 25, 'At 25d: Panic & Clinical Burnout (₹7,000)')}
        ${renderMeterRow('Energy Depletion', p.consequenceMeters.lowEnergyDays, 15, 'At 15d: Adrenal Burnout (₹4,000)')}
      </div>
    </div>
  `;
  container.appendChild(careerCard);

  // 2b. Skills, Study Material & Certifications Catalog Card
  const skillsCard = document.createElement('div');
  skillsCard.className = 'card';
  skillsCard.innerHTML = `
    <div class="card-title">
      <span>🎓 Study Material & Skills Catalog</span>
      <span style="font-size:0.7rem; color:var(--text-muted);">Certify to Unlock High-Paying Jobs</span>
    </div>

    <div style="display:flex; flex-direction:column; gap:8px;">
      ${COURSES.map(c => {
        const isCertified = p.educationProgress[c.id] === 100;
        const trackBadge = c.track === 'finance' ? 'badge-blue' : (c.track === 'tech' ? 'badge-green' : 'badge-gold');
        return `
          <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; border:1px solid ${isCertified ? 'rgba(34, 197, 94, 0.3)' : '#1a2336'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="badge ${trackBadge}" style="text-transform:uppercase; font-size:0.6rem;">${c.track} • Tier ${c.tier}</span>
                <span style="font-weight:700; font-size:0.8rem; margin-left:4px;">${c.name}</span>
              </div>
              ${isCertified
                ? '<span class="badge badge-green">✅ Certified</span>'
                : `<button class="btn btn-primary btn-sm btn-enroll-course" data-id="${c.id}" ${p.money < c.fee ? 'disabled' : ''}>Enroll (${formatCurrency(c.fee)})</button>`
              }
            </div>
            <div style="font-size:0.65rem; color:#94a3b8; margin:4px 0;">${c.description}</div>
            <div style="font-size:0.7rem; color:#38bdf8; font-weight:600;">
              ✨ Unlocks Job: <strong>${c.unlocksJobTitle}</strong> (${formatCurrency(c.unlocksJobSalary)} / 15d)
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(skillsCard);

  // 2c. Career Ladder & High-Paying Openings
  const jobsCard = document.createElement('div');
  jobsCard.className = 'card';
  jobsCard.innerHTML = `
    <div class="card-title">
      <span>💼 High-Paying Career Openings</span>
    </div>

    <div style="display:flex; flex-direction:column; gap:6px;">
      ${ALL_JOBS.map(j => {
        const isCurrent = p.job.id === j.id;
        const reqCourse = j.requiredCourse ? COURSES.find(c => c.id === j.requiredCourse) : undefined;
        const hasCourse = !j.requiredCourse || p.educationProgress[j.requiredCourse] === 100;
        const hasNetWorth = !j.requiredMinNetWorth || netWorth >= j.requiredMinNetWorth;
        const isQualified = hasCourse && hasNetWorth;

        return `
          <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; border:1px solid ${isCurrent ? '#38bdf8' : (isQualified ? '#1e293b' : '#141a29')}; opacity:${isQualified || isCurrent ? '1' : '0.65'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:0.8rem;">${j.title}</div>
                <div style="font-size:0.7rem; color:var(--accent-green); font-weight:700;">
                  ${formatCurrency(j.salaryPerCycle)} / 15d <span style="color:#64748b; font-weight:400;">(${j.timeSlotsCost} slots • ${j.stressPerDay} stress/d)</span>
                </div>
              </div>
              ${isCurrent
                ? '<span class="badge badge-green">Current Role</span>'
                : (isQualified
                  ? `<button class="btn btn-success btn-sm btn-switch-job-status" data-id="${j.id}">Switch Job</button>`
                  : `<span class="badge" style="background:#1e293b; color:#94a3b8;">🔒 Locked</span>`
                )
              }
            </div>
            ${!isQualified && (reqCourse || j.requiredMinNetWorth) ? `
              <div style="font-size:0.65rem; color:#f87171; margin-top:3px;">
                Requires: ${reqCourse ? `🎓 ${reqCourse.name}` : ''} ${j.requiredMinNetWorth ? `• Net Worth ${formatCurrency(j.requiredMinNetWorth)}` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(jobsCard);

  // 3. Banking & Debt Desk Card (Gated behind 'banking', 'loans', 'insurance')
  const bankCard = document.createElement('div');
  bankCard.className = 'card';
  bankCard.innerHTML = `
    <div class="card-title">
      <span>🏦 Banking, Credit & Protection</span>
    </div>

    <!-- Savings Desk -->
    ${unlockManager.isUnlocked('banking') ? `
      <div class="bank-action-row">
        <div>
          <div style="font-size:0.75rem; color:var(--text-muted);">High-Yield Savings (3.5% Daily APY)</div>
          <div style="font-weight:700; font-size:1.1rem; color:#38bdf8;">${formatCurrency(p.savingsBalance)}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-primary btn-sm" id="btn-status-deposit">Deposit</button>
          <button class="btn btn-sm" id="btn-status-withdraw" ${p.savingsBalance <= 0 ? 'disabled' : ''}>Withdraw</button>
        </div>
      </div>
    ` : renderLockedTeaser(unlockManager.getFeatureDef('banking')!, state)}

    <!-- Loans Facility -->
    <div style="margin-top:10px;">
      ${unlockManager.isUnlocked('loans') ? `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8rem; font-weight:700;">Active Credit & Loans</span>
          <button class="btn btn-sm" id="btn-status-apply-loan">Apply Loan</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
          ${p.loans.length === 0
            ? `<div style="font-size:0.75rem; color:var(--text-muted); padding:6px; background:#0b0f19; border-radius:6px;">No debts. Excellent credit score!</div>`
            : p.loans.map(l => `
              <div style="background:#0b0f19; padding:6px 10px; border-radius:6px; border:1px solid #1a2336; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:0.8rem;">${l.name}</div>
                  <div style="font-size:0.65rem; color:var(--text-muted);">Due: ${formatCurrency(l.principalRemaining)} • EMI: ${formatCurrency(l.emiAmount)}/30d</div>
                </div>
                <span class="badge ${l.missedPayments > 0 ? 'badge-red' : 'badge-green'}">${l.missedPayments > 0 ? `${l.missedPayments} Missed` : 'On Time'}</span>
              </div>
            `).join('')
          }
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('loans')!, state)}
    </div>

    <!-- Health Insurance -->
    <div style="margin-top:12px; border-top:1px solid #1a2336; padding-top:10px;">
      ${unlockManager.isUnlocked('insurance') ? `
        <div style="font-size:0.8rem; font-weight:700; margin-bottom:4px;">Health Insurance Policy Desk</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
          ${HEALTH_INSURANCE_TIERS.map(tier => `
            <button class="btn btn-sm ${p.insurance.health.tier === tier.tier ? 'btn-success' : ''} btn-ins-tier" data-tier="${tier.tier}" style="text-align:left; padding:6px 8px;">
              <div style="font-weight:700; font-size:0.75rem;">${tier.name}</div>
              <div style="font-size:0.65rem; color:var(--text-muted);">${tier.premium > 0 ? `${formatCurrency(tier.premium)}/mo` : 'Free'}</div>
            </button>
          `).join('')}
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('insurance')!, state)}
    </div>
  `;
  container.appendChild(bankCard);

  // 4. Investments Desk Card (Gated behind 'stocks', 'gold', 'real-estate', 'business')
  const investCard = document.createElement('div');
  investCard.className = 'card';
  const goldGrams = p.goldHoldings.grams;
  investCard.innerHTML = `
    <div class="card-title">
      <span>📈 Investments & Wealth Accumulation</span>
    </div>

    <!-- Stock Market Desk -->
    <div style="margin-bottom:10px;">
      ${unlockManager.isUnlocked('stocks') ? `
        <div style="font-size:0.8rem; font-weight:700; margin-bottom:4px;">Stock Exchange (BSE / NSE):</div>
        ${Object.keys(p.portfolio).length === 0
          ? `<div style="font-size:0.75rem; color:var(--text-muted); padding:6px; background:#0b0f19; border-radius:6px;">No stocks owned yet. Tap market cards or explore opportunities!</div>`
          : Object.entries(p.portfolio).map(([id, item]) => {
            const t = state.market.tickers.find(x => x.id === id);
            return `
              <div style="background:#0b0f19; padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <div>
                  <div style="font-weight:700; font-size:0.8rem;">${t?.name || id} (${item.shares} shares)</div>
                  <div style="font-size:0.65rem; color:var(--text-muted);">Price: ${formatCurrency(t?.price || 0)} • Avg: ${formatCurrency(item.avgCost)}</div>
                </div>
                <button class="btn btn-sm btn-trade-ticker-status" data-ticker="${id}">Trade</button>
              </div>
            `;
          }).join('')
        }
      ` : renderLockedTeaser(unlockManager.getFeatureDef('stocks')!, state)}
    </div>

    <!-- 24K Gold Desk -->
    <div style="margin-bottom:10px;">
      ${unlockManager.isUnlocked('gold') ? `
        <div style="background:#0b0f19; padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:0.85rem; color:#fbbf24;">✨ 24K Gold Vault: ${goldGrams}g</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Rate: ${formatCurrency(state.market.goldPricePerGram)}/g (Value: ${formatCurrency(goldGrams * state.market.goldPricePerGram)})</div>
          </div>
          <div style="display:flex; gap:4px;">
            <button class="btn btn-primary btn-sm" id="btn-status-buy-gold">Buy</button>
            <button class="btn btn-sm" id="btn-status-sell-gold" ${goldGrams <= 0 ? 'disabled' : ''}>Sell</button>
          </div>
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('gold')!, state)}
    </div>

    <!-- Real Estate Desk -->
    <div style="margin-bottom:10px;">
      ${unlockManager.isUnlocked('real-estate') ? `
        <div style="font-size:0.8rem; font-weight:700; margin-bottom:4px;">Real Estate Marketplace:</div>
        <div style="font-size:0.75rem; color:#94a3b8; background:#0b0f19; padding:8px 10px; border-radius:6px;">
          You own <strong>${p.properties.length}</strong> properties. Generating steady rental yields!
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('real-estate')!, state)}
    </div>

    <!-- Commercial Franchises Desk -->
    <div>
      ${unlockManager.isUnlocked('business') ? `
        <div style="font-size:0.8rem; font-weight:700; margin-bottom:4px;">Commercial Franchises:</div>
        <div style="font-size:0.75rem; color:#94a3b8; background:#0b0f19; padding:8px 10px; border-radius:6px;">
          Operating <strong>${p.businesses.length}</strong> commercial business franchises.
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('business')!, state)}
    </div>
  `;
  container.appendChild(investCard);

  // 5. Save & Settings Card (Always Unlocked)
  const saveCard = document.createElement('div');
  saveCard.className = 'card';
  saveCard.innerHTML = `
    <div class="card-title">
      <span>⚙️ Simulation Save & Controls</span>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-primary btn-sm" id="btn-status-export-save" style="flex:1;">Export JSON Save</button>
      <button class="btn btn-danger btn-sm" id="btn-status-reset" style="flex:1;">Hard Reset Game</button>
    </div>
  `;
  container.appendChild(saveCard);

  // Event Handlers
  bankCard.querySelector('#btn-status-deposit')?.addEventListener('click', () => onAction('deposit-savings'));
  bankCard.querySelector('#btn-status-withdraw')?.addEventListener('click', () => onAction('withdraw-savings'));
  bankCard.querySelector('#btn-status-apply-loan')?.addEventListener('click', () => onAction('open-loan-modal'));

  bankCard.querySelectorAll('.btn-ins-tier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = (e.currentTarget as HTMLElement).getAttribute('data-tier');
      onAction('select-insurance-tier', { tier });
    });
  });

  careerCard.querySelector('#btn-status-time-alloc')?.addEventListener('click', () => onAction('open-time-modal'));
  careerCard.querySelector('#btn-status-change-diet')?.addEventListener('click', () => onAction('open-diet-modal'));

  skillsCard.querySelectorAll('.btn-enroll-course').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('enroll-course', { courseId: id });
    });
  });

  jobsCard.querySelectorAll('.btn-switch-job-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('switch-job', { jobId: id });
    });
  });

  investCard.querySelector('#btn-status-buy-gold')?.addEventListener('click', () => onAction('trade-gold', { action: 'buy' }));
  investCard.querySelector('#btn-status-sell-gold')?.addEventListener('click', () => onAction('trade-gold', { action: 'sell' }));

  investCard.querySelectorAll('.btn-trade-ticker-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-ticker');
      onAction('trade-stock', { tickerId: id });
    });
  });

  saveCard.querySelector('#btn-status-export-save')?.addEventListener('click', () => exportSaveFile(state));
  saveCard.querySelector('#btn-status-reset')?.addEventListener('click', () => {
    if (confirm('Reset your entire life simulation progress?')) {
      resetGame();
      location.reload();
    }
  });

  return container;
}

function renderLockedTeaser(def: FeatureUnlockDef, state: GameState): string {
  if (!def) return '';
  const prog = def.progress(state);
  return `
    <div class="locked-feature-teaser">
      <div class="locked-teaser-header">
        <div class="locked-title-row">
          <span class="locked-lock-icon">🔒</span>
          <span class="locked-name">${def.icon} ${def.name}</span>
        </div>
        <span class="locked-pct-tag">${prog.pct}%</span>
      </div>
      <div class="locked-condition-text">${def.requirementText}</div>
      <div class="locked-bar-track">
        <div class="locked-bar-fill" style="width: ${prog.pct}%;"></div>
      </div>
    </div>
  `;
}

function renderMeterRow(name: string, cur: number, max: number, crisis: string): string {
  const pct = Math.min(100, Math.round((cur / max) * 100));
  const isDanger = pct >= 60;
  const color = isDanger ? 'var(--accent-red)' : (pct >= 40 ? 'var(--accent-gold)' : 'var(--accent-green)');
  return `
    <div style="background:#0b0f19; padding:6px 8px; border-radius:6px; border:1px solid ${isDanger ? 'rgba(239, 68, 68, 0.4)' : '#1a2336'};">
      <div style="display:flex; justify-content:space-between; font-size:0.7rem;">
        <span style="font-weight:600;">${name}</span>
        <span style="color:${color}; font-weight:700;">${cur} / ${max}d (${pct}%) ${isDanger ? '⚠️ 60% Danger' : ''}</span>
      </div>
      <div class="meter-track" style="margin:4px 0; height:4px; background:#141c2c; border-radius:999px; overflow:hidden;">
        <div class="meter-fill" style="width:${pct}%; background:${color}; height:100%;"></div>
      </div>
      <div style="font-size:0.6rem; color:#64748b;">${crisis}</div>
    </div>
  `;
}
