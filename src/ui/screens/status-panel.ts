import { GameState } from '../../types/game';
import { calculateNetWorth } from '../../engine/economy-engine';
import { formatCurrency } from '../components/format';
import { exportSaveFile, resetGame } from '../../save/save-manager';
import { ALL_JOBS, FOOD_TIERS, COURSES, TRANSPORT_MODES, ASSET_CATALOG } from '../../data/static-data';
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

  // 1. Hero Net Worth Card
  const heroCard = document.createElement('div');
  heroCard.className = 'card status-hero-card';
  heroCard.innerHTML = `
    <div class="hero-label">Total Estimated Net Worth</div>
    <div class="hero-val">${formatCurrency(netWorth)}</div>
    <div class="hero-grid">
      <div class="hero-sub-box">
        <span class="sub-label">💵 Liquid Cash</span>
        <span class="sub-val green">${formatCurrency(p.money)}</span>
      </div>
      <div class="hero-sub-box">
        <span class="sub-label">🏦 Savings (3.5%)</span>
        <span class="sub-val blue">${formatCurrency(p.savingsBalance)}</span>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 1b. Doctor Warning
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
        <span class="badge badge-red">⚠️ ${healthWarnings[0].pct}% Risk</span>
      </div>
      <div class="doctor-quote-box">"${healthWarnings[0].advice}"</div>
      <div class="impending-box">
        ⚠️ <strong>Impending:</strong> ${healthWarnings[0].impendingCrisis} (Est. ${formatCurrency(healthWarnings[0].expectedCost)})
      </div>
    `;
    container.appendChild(docCard);
  }

  // 2. Occupation Card
  const careerCard = document.createElement('div');
  careerCard.className = 'card';
  careerCard.innerHTML = `
    <div class="card-title">
      <span>💼 Occupation & Routine</span>
      <button class="btn btn-primary btn-sm" id="btn-status-time-alloc">⏰ Reallocate Time</button>
    </div>

    <div style="background:rgba(0,230,118,0.06); padding:10px 12px; border-radius:10px; border:1px solid rgba(0,230,118,0.14); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:800; font-size:0.85rem;">${p.job.title}</div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
          Salary: <strong style="color:var(--accent-green);">${formatCurrency(p.job.salaryPerCycle)}</strong> / 15d 
          &nbsp;•&nbsp; ${p.job.timeSlotsCost} time slots
          &nbsp;•&nbsp; Stress: ${p.job.stressPerDay}/day
        </div>
      </div>
      <span class="badge badge-green">✅ Active</span>
    </div>

    <!-- Health Consequence Trackers -->
    <div style="border-top:1px solid var(--border-color); padding-top:8px;">
      <div style="font-size:0.67rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:6px;">🩺 Health Risk Trackers</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${renderMeterRow('Street Food Strain', p.consequenceMeters.cheapFoodDays, 20, 'At 20d: Gastroenteritis (₹3,500)')}
        ${renderMeterRow('Sedentary Inactivity', p.consequenceMeters.noExerciseDays, 35, 'At 35d: Back Spasm (₹5,500)')}
        ${renderMeterRow('High Stress Fatigue', p.consequenceMeters.highStressDays, 25, 'At 25d: Burnout (₹7,000)')}
        ${renderMeterRow('Energy Depletion', p.consequenceMeters.lowEnergyDays, 15, 'At 15d: Adrenal Crisis (₹4,000)')}
      </div>
    </div>
  `;
  container.appendChild(careerCard);

  // 3. Monthly Lifestyle & Expense Management
  const lifestyleCard = document.createElement('div');
  lifestyleCard.className = 'card';
  lifestyleCard.innerHTML = `
    <div class="card-title">
      <span>🛍️ Monthly Lifestyle Setup</span>
    </div>

    <!-- Diet Selection -->
    <div>
      <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:7px;">🍽️ Diet / Food Choice</div>
      <div class="expense-grid">
        ${(Object.values(FOOD_TIERS)).map(f => `
          <button class="expense-option-btn ${p.lifestyle.foodTier === f.id ? 'active' : ''} btn-select-food" data-id="${f.id}">
            <div class="expense-option-title">${getFoodEmoji(f.id)} ${f.name}</div>
            <div class="expense-option-cost">₹${f.costPerDay}/day (₹${f.costPerDay * 30}/mo)</div>
            <div class="expense-option-desc">${f.physicalDelta >= 0 ? '+' : ''}${f.physicalDelta} health/day</div>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Transport Selection -->
    <div style="border-top:1px solid var(--border-color); padding-top:10px;">
      <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:7px;">🚗 Transport Mode</div>
      <div class="expense-grid">
        ${(Object.values(TRANSPORT_MODES)).map(t => {
          const owned = t.id === 'walk' || p.lifestyleAssets.some(a => a.id === t.id) || t.id === 'bicycle';
          const canBuy = !owned && t.id !== 'walk';
          const catalogItem = ASSET_CATALOG.find(a => a.id === t.id);
          return `
            <button class="expense-option-btn ${p.lifestyle.transportMode === t.id ? 'active' : ''} btn-select-transport" 
              data-id="${t.id}" ${!owned && canBuy ? '' : ''}>
              <div class="expense-option-title">${getTransportEmoji(t.id)} ${t.name}</div>
              <div class="expense-option-cost">${t.dailyCost > 0 ? `₹${t.dailyCost}/day (₹${t.dailyCost * 30}/mo)` : 'Free'}</div>
              <div class="expense-option-desc">Stress: ${t.stressPerDay}/day${!owned && canBuy && catalogItem ? ` • Buy: ₹${catalogItem.price.toLocaleString('en-IN')}` : ''}</div>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Housing Options -->
    <div style="border-top:1px solid var(--border-color); padding-top:10px;">
      <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:7px;">🏠 Housing</div>
      <div class="monthly-expense-section">
        ${renderHousingOption('studio', 'Studio Apartment (PG)', 4500, p.housing.amountPerCycle === 4500)}
        ${renderHousingOption('1bhk', '1 BHK Flat', 8000, p.housing.amountPerCycle === 8000)}
        ${renderHousingOption('2bhk', '2 BHK Apartment', 14000, p.housing.amountPerCycle === 14000)}
        ${renderHousingOption('3bhk', '3 BHK Premium', 22000, p.housing.amountPerCycle === 22000)}
        ${renderHousingOption('villa', 'Villa / Bungalow', 45000, p.housing.amountPerCycle === 45000)}
      </div>
    </div>

    <!-- Subscriptions & Lifestyle extras -->
    <div style="border-top:1px solid var(--border-color); padding-top:10px;">
      <div style="font-size:0.72rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:7px;">📱 Subscriptions & Lifestyle</div>
      <div class="expense-grid">
        ${renderSubscriptionBtn('Basic Phone Plan', '₹299/mo', 'phone-basic')}
        ${renderSubscriptionBtn('Premium Phone + OTT', '₹999/mo', 'phone-premium')}
        ${renderSubscriptionBtn('Local Gym Pass', '₹600/mo', 'gym-local')}
        ${renderSubscriptionBtn('Premium Fitness Club', '₹1,800/mo', 'gym-premium')}
        ${renderSubscriptionBtn('No Entertainment', 'Free', 'entertainment-none')}
        ${renderSubscriptionBtn('OTT + Gaming', '₹1,200/mo', 'entertainment-full')}
        ${renderSubscriptionBtn('Basic Groceries', '₹2,500/mo', 'grocery-basic')}
        ${renderSubscriptionBtn('Organic Premium', '₹5,000/mo', 'grocery-premium')}
      </div>
    </div>
  `;
  container.appendChild(lifestyleCard);

  // 4. Banking & Credit Card
  const bankCard = document.createElement('div');
  bankCard.className = 'card';
  bankCard.innerHTML = `
    <div class="card-title">
      <span>🏦 Banking, Credit & Protection</span>
    </div>

    <!-- Savings -->
    ${unlockManager.isUnlocked('banking') ? `
      <div class="bank-action-row">
        <div>
          <div style="font-size:0.72rem; color:var(--text-muted);">High-Yield Savings (3.5% APY)</div>
          <div style="font-weight:800; font-size:1.05rem; color:var(--accent-blue);">${formatCurrency(p.savingsBalance)}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-primary btn-sm" id="btn-status-deposit">💰 Deposit</button>
          <button class="btn btn-sm" id="btn-status-withdraw" ${p.savingsBalance <= 0 ? 'disabled' : ''}>Withdraw</button>
        </div>
      </div>
    ` : renderLockedTeaser(unlockManager.getFeatureDef('banking')!, state)}

    <!-- Loans -->
    <div style="margin-top:8px;">
      ${unlockManager.isUnlocked('loans') ? `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.8rem; font-weight:800;">💳 Active Loans</span>
          <button class="btn btn-sm" id="btn-status-apply-loan">Apply Loan</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${p.loans.length === 0
            ? `<div style="font-size:0.75rem; color:var(--text-muted); padding:8px 10px; background:rgba(0,230,118,0.05); border-radius:8px; border:1px solid rgba(0,230,118,0.12);">✅ No debts. Excellent credit standing!</div>`
            : p.loans.map(l => `
              <div style="background:rgba(255,71,87,0.05); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,71,87,0.12); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:0.78rem;">${l.name}</div>
                  <div style="font-size:0.63rem; color:var(--text-muted);">Outstanding: ${formatCurrency(l.principalRemaining)} • EMI: ${formatCurrency(l.emiAmount)}/30d</div>
                </div>
                <span class="badge ${l.missedPayments > 0 ? 'badge-red' : 'badge-green'}">${l.missedPayments > 0 ? `⚠️ ${l.missedPayments} Missed` : '✅ Current'}</span>
              </div>
            `).join('')
          }
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('loans')!, state)}
    </div>

    <!-- Health Insurance -->
    <div style="border-top:1px solid var(--border-color); padding-top:10px;">
      ${unlockManager.isUnlocked('insurance') ? `
        <div style="font-size:0.8rem; font-weight:800; margin-bottom:6px;">🛡️ Health Insurance</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
          ${HEALTH_INSURANCE_TIERS.map(tier => `
            <button class="btn btn-sm ${p.insurance.health.tier === tier.tier ? 'btn-success' : ''} btn-ins-tier" data-tier="${tier.tier}" style="text-align:left; padding:7px 10px;">
              <div style="font-weight:800; font-size:0.75rem;">${tier.name}</div>
              <div style="font-size:0.63rem; color:var(--text-muted); margin-top:1px;">${tier.premium > 0 ? `${formatCurrency(tier.premium)}/mo` : 'Free'}</div>
            </button>
          `).join('')}
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('insurance')!, state)}
    </div>
  `;
  container.appendChild(bankCard);

  // 5. Career Ladder Card
  const jobsCard = document.createElement('div');
  jobsCard.className = 'card';
  jobsCard.innerHTML = `
    <div class="card-title">
      <span>🚀 Career Ladder</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      ${ALL_JOBS.map(j => {
        const isCurrent = p.job.id === j.id;
        const reqCourse = j.requiredCourse ? COURSES.find(c => c.id === j.requiredCourse) : undefined;
        const hasCourse = !j.requiredCourse || p.educationProgress[j.requiredCourse] === 100;
        const hasNetWorth = !j.requiredMinNetWorth || netWorth >= j.requiredMinNetWorth;
        const isQualified = hasCourse && hasNetWorth;

        return `
          <div style="background:${isCurrent ? 'rgba(0,230,118,0.06)' : (isQualified ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)')}; 
            padding:9px 11px; border-radius:10px; 
            border:1px solid ${isCurrent ? 'rgba(0,230,118,0.25)' : (isQualified ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)')};
            opacity:${isQualified || isCurrent ? '1' : '0.55'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:800; font-size:0.8rem;">${j.title}</div>
                <div style="font-size:0.67rem; color:var(--accent-green); font-weight:700;">
                  ${formatCurrency(j.salaryPerCycle)}/15d 
                  <span style="color:var(--text-dim); font-weight:400;">• ${j.timeSlotsCost} slots • ${j.stressPerDay} stress/d</span>
                </div>
              </div>
              ${isCurrent
                ? '<span class="badge badge-green">✅ Current</span>'
                : (isQualified
                  ? `<button class="btn btn-success btn-sm btn-switch-job-status" data-id="${j.id}">Switch →</button>`
                  : '<span class="badge" style="background:rgba(255,255,255,0.05); color:var(--text-dim);">🔒 Locked</span>'
                )
              }
            </div>
            ${!isQualified && (reqCourse || j.requiredMinNetWorth) ? `
              <div style="font-size:0.62rem; color:#ff4757; margin-top:3px;">
                Requires: ${reqCourse ? `🎓 ${reqCourse.name}` : ''} ${j.requiredMinNetWorth ? `• Net Worth ${formatCurrency(j.requiredMinNetWorth)}` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(jobsCard);

  // 6. Education / Courses Card
  const skillsCard = document.createElement('div');
  skillsCard.className = 'card';
  skillsCard.innerHTML = `
    <div class="card-title">
      <span>🎓 Certifications & Courses</span>
      <span style="font-size:0.65rem; color:var(--text-muted);">Unlock High Pay</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:7px;">
      ${COURSES.map(c => {
        const isCertified = p.educationProgress[c.id] === 100;
        const trackColor = c.track === 'finance' ? 'badge-blue' : (c.track === 'tech' ? 'badge-green' : 'badge-gold');
        return `
          <div style="background:rgba(255,255,255,0.025); padding:9px 11px; border-radius:10px; border:1px solid ${isCertified ? 'rgba(0,230,118,0.22)' : 'rgba(255,255,255,0.06)'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="badge ${trackColor}" style="font-size:0.58rem;">${c.track.toUpperCase()} T${c.tier}</span>
                <span style="font-weight:700; font-size:0.8rem; margin-left:6px;">${c.name}</span>
              </div>
              ${isCertified
                ? '<span class="badge badge-green">✅ Certified</span>'
                : `<button class="btn btn-primary btn-sm btn-enroll-course" data-id="${c.id}" ${p.money < c.fee ? 'disabled' : ''}>Enroll (${formatCurrency(c.fee)})</button>`
              }
            </div>
            <div style="font-size:0.63rem; color:var(--text-muted); margin:4px 0 2px;">${c.description}</div>
            <div style="font-size:0.67rem; color:var(--accent-blue); font-weight:600;">✨ Unlocks: ${c.unlocksJobTitle} (${formatCurrency(c.unlocksJobSalary)}/15d)</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(skillsCard);

  // 7. Save & Settings
  const saveCard = document.createElement('div');
  saveCard.className = 'card';
  saveCard.innerHTML = `
    <div class="card-title"><span>⚙️ Save & Settings</span></div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-primary btn-sm" id="btn-status-export-save" style="flex:1;">Export Save</button>
      <button class="btn btn-danger btn-sm" id="btn-status-reset" style="flex:1;">Hard Reset</button>
    </div>
  `;
  container.appendChild(saveCard);

  // ─── Event Handlers ───────────────────────────────────────
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

  // Diet selection (opens modal)
  lifestyleCard.querySelectorAll('.btn-select-food').forEach(btn => {
    btn.addEventListener('click', () => {
      onAction('open-diet-modal');
    });
  });

  // Transport selection
  lifestyleCard.querySelectorAll('.btn-select-transport').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const catalogItem = ASSET_CATALOG.find(a => a.id === id);
      if (id === 'walk') {
        onAction('set-transport', { mode: 'walk' });
      } else if (p.lifestyleAssets.some(a => a.id === id) || id === 'bicycle') {
        onAction('set-transport', { mode: id });
      } else if (catalogItem) {
        onAction('buy-lifestyle-asset', { assetId: id });
      }
    });
  });

  // Housing selection
  lifestyleCard.querySelectorAll('.btn-select-housing').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amount = parseInt((e.currentTarget as HTMLElement).getAttribute('data-amount') || '0', 10);
      onAction('set-housing', { amount });
    });
  });

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
    <div style="background:rgba(255,255,255,0.025); padding:7px 9px; border-radius:8px; border:1px solid ${isDanger ? 'rgba(255,71,87,0.2)' : 'rgba(255,255,255,0.06)'};">
      <div style="display:flex; justify-content:space-between; font-size:0.7rem;">
        <span style="font-weight:700;">${name}</span>
        <span style="color:${color}; font-weight:800;">${cur}/${max}d (${pct}%) ${isDanger ? '⚠️' : ''}</span>
      </div>
      <div class="meter-track" style="margin:4px 0;">
        <div class="meter-fill" style="width:${pct}%; background:${color};"></div>
      </div>
      <div style="font-size:0.59rem; color:var(--text-dim);">${crisis}</div>
    </div>
  `;
}

function renderHousingOption(_id: string, name: string, amount: number, isActive: boolean): string {
  return `
    <div class="monthly-expense-row" style="${isActive ? 'border-color:rgba(0,230,118,0.28); background:rgba(0,230,118,0.06);' : ''}">
      <span class="expense-name">${isActive ? '✅ ' : ''}${name}</span>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="expense-amount">₹${amount.toLocaleString('en-IN')}/mo</span>
        ${!isActive ? `<button class="btn btn-sm btn-select-housing" data-amount="${amount}" style="font-size:0.62rem; padding:3px 7px;">Select</button>` : ''}
      </div>
    </div>
  `;
}

function renderSubscriptionBtn(name: string, cost: string, _id: string): string {
  return `
    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 10px;">
      <div style="font-size:0.74rem; font-weight:700; color:var(--text-main);">${name}</div>
      <div style="font-size:0.65rem; color:var(--accent-red); font-weight:700; margin-top:2px;">${cost}</div>
    </div>
  `;
}

function getFoodEmoji(id: string): string {
  const map: Record<string, string> = { street: '🌮', basic: '🍳', 'home-cooked': '🥗', restaurant: '🍱' };
  return map[id] || '🍽️';
}

function getTransportEmoji(id: string): string {
  const map: Record<string, string> = { walk: '🚶', bicycle: '🚲', scooter: '🛵', car: '🚗' };
  return map[id] || '🚌';
}
