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

  // 1. HERO PROFILE CARD
  const heroCard = document.createElement('div');
  heroCard.className = 'card';
  heroCard.style.cssText = `
    background: linear-gradient(135deg, #1b0a3d 0%, #0d0424 100%);
    border: 2px solid rgba(176,38,255,0.35);
    box-shadow: 0 10px 32px rgba(0,0,0,0.6), 0 0 20px rgba(176,38,255,0.18);
  `;
  heroCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:0.65rem; font-weight:900; color:var(--neon-purple); text-transform:uppercase; letter-spacing:1px;">
        PLAYER IDENTITY • LEVEL FLEX
      </span>
      <span class="badge badge-gold">VIP TIER</span>
    </div>
    <div style="font-size:2.2rem; font-weight:900; background:var(--grad-purple); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin:4px 0 10px; letter-spacing:-0.5px;">
      ${formatCurrency(netWorth)}
    </div>
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
      <div style="background:rgba(0,0,0,0.35); padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
        <span style="display:block; font-size:0.6rem; color:var(--text-muted); font-weight:800; text-transform:uppercase;">💵 Cash in Hand</span>
        <span style="font-size:1.05rem; font-weight:900; color:var(--neon-lime);">${formatCurrency(p.money)}</span>
      </div>
      <div style="background:rgba(0,0,0,0.35); padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
        <span style="display:block; font-size:0.6rem; color:var(--text-muted); font-weight:800; text-transform:uppercase;">🏦 High-Yield Savings</span>
        <span style="font-size:1.05rem; font-weight:900; color:var(--neon-cyan);">${formatCurrency(p.savingsBalance)}</span>
      </div>
    </div>
  `;
  container.appendChild(heroCard);

  // 1b. DOCTOR ADVISORY ALERT (IF IN DANGER ZONE)
  if (healthWarnings.length > 0) {
    const docCard = document.createElement('div');
    docCard.className = 'card doctor-alert-card';
    docCard.innerHTML = `
      <div class="doctor-alert-header">
        <span class="doctor-alert-icon">👨‍⚕️</span>
        <div>
          <div class="doctor-alert-title">CRITICAL MEDICAL ALERT</div>
          <div class="doctor-alert-sub">${healthWarnings[0].doctorName}</div>
        </div>
        <span class="badge badge-red">⚠️ ${healthWarnings[0].pct}% DANGER</span>
      </div>
      <div class="doctor-quote-box">"${healthWarnings[0].advice}"</div>
      <div class="impending-box">
        ⚠️ <strong>Impending:</strong> ${healthWarnings[0].impendingCrisis} (Est. ${formatCurrency(healthWarnings[0].expectedCost)})
      </div>
    `;
    container.appendChild(docCard);
  }

  // 2. ACTIVE CERTIFICATION STUDY ARC (HERO WIDGET)
  if (p.activeCourseId) {
    const activeCourse = COURSES.find(c => c.id === p.activeCourseId);
    if (activeCourse) {
      const progress = p.educationProgress[activeCourse.id] ?? 0;
      const studySlots = Math.max(1, p.timeAllocation.education || 0);
      const daysLeft = Math.max(1, Math.ceil(((100 - progress) / 100) * (activeCourse.slotsRequired / studySlots)));

      const activeStudyCard = document.createElement('div');
      activeStudyCard.className = 'active-study-hud-card';
      activeStudyCard.innerHTML = `
        <div class="study-header-row">
          <span class="study-tag">📚 CURRENT STUDY GRIND</span>
          <button class="btn-3d btn-3d-sub" id="btn-pause-course" style="width:auto; padding:4px 10px; font-size:0.65rem;">
            ⏸️ PAUSE STUDY
          </button>
        </div>
        <div class="study-course-title">${activeCourse.name}</div>
        <div class="study-xp-track" style="height:14px;">
          <div class="study-xp-fill" style="width: ${Math.max(4, progress)}%;"></div>
        </div>
        <div class="study-footer-row">
          <span>⚡ Progress: <strong>${Math.round(progress)}%</strong> (~${daysLeft} days left)</span>
          <span style="color:var(--neon-cyan); font-weight:800;">✨ Unlocks: ${activeCourse.unlocksJobTitle}</span>
        </div>
      `;
      activeStudyCard.querySelector('#btn-pause-course')?.addEventListener('click', () => {
        onAction('pause-course');
      });
      container.appendChild(activeStudyCard);
    }
  }

  // 3. OCCUPATION & ROUTINE (TIME HUSTLE)
  const careerCard = document.createElement('div');
  careerCard.className = 'card';
  careerCard.innerHTML = `
    <div class="card-title">
      <span>💼 Career Role & Daily Hustle</span>
      <button class="btn-3d btn-3d-cyan" id="btn-status-time-alloc" style="width:auto; padding:6px 14px; font-size:0.7rem;">
        ⏰ TIME ALLOCATION
      </button>
    </div>

    <div style="background:rgba(0,255,136,0.08); padding:12px 14px; border-radius:14px; border:1.5px solid rgba(0,255,136,0.25); display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-weight:900; font-size:0.92rem; color:#ffffff;">${p.job.title}</div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:3px;">
          Pay: <strong style="color:var(--neon-lime);">${formatCurrency(p.job.salaryPerCycle)}</strong> / 15d 
          &nbsp;•&nbsp; ${p.job.timeSlotsCost} Time Slots
          &nbsp;•&nbsp; Stress: +${p.job.stressPerDay}/d
        </div>
      </div>
      <span class="badge badge-green">ACTIVE GIG</span>
    </div>

    <!-- Health Risk Trackers (Boss Danger Bars) -->
    <div style="border-top:1.5px solid var(--border-subtle); padding-top:10px;">
      <div style="font-size:0.7rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px;">
        🩺 Health Strain & Burnout Shield
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${renderMeterRow('Street Food Gut Strain', p.consequenceMeters.cheapFoodDays, 20, 'At 20d: Gastroenteritis (₹3,500 bill)')}
        ${renderMeterRow('Sedentary Inactivity', p.consequenceMeters.noExerciseDays, 35, 'At 35d: Spinal Spasm (₹5,500 bill)')}
        ${renderMeterRow('Stress Fatigue Level', p.consequenceMeters.highStressDays, 25, 'At 25d: Burnout Crash (₹7,000 bill)')}
        ${renderMeterRow('Energy Battery Drain', p.consequenceMeters.lowEnergyDays, 15, 'At 15d: Adrenal Fatigue (₹4,000 bill)')}
      </div>
    </div>
  `;
  container.appendChild(careerCard);

  // 4. CERTIFICATIONS & EDUCATION (TAKES TIME & DAILY STUDY)
  const skillsCard = document.createElement('div');
  skillsCard.className = 'card';
  skillsCard.innerHTML = `
    <div class="card-title">
      <span>🎓 Skill Tree & Certifications</span>
      <span class="badge badge-purple">Skill Tree</span>
    </div>
    <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:6px;">
      Enroll to begin daily study. Each simulated day advances your knowledge until certified!
    </div>
    <div style="display:flex; flex-direction:column; gap:10px;">
      ${COURSES.map(c => {
        const isCertified = (p.educationProgress[c.id] ?? 0) >= 100;
        const isStudying = p.activeCourseId === c.id;
        const currentProgress = Math.round(p.educationProgress[c.id] ?? 0);
        const trackColor = c.track === 'finance' ? 'badge-blue' : (c.track === 'tech' ? 'badge-green' : 'badge-gold');

        return `
          <div style="background:${isStudying ? 'rgba(176,38,255,0.12)' : 'rgba(255,255,255,0.03)'}; 
            padding:12px 14px; border-radius:14px; 
            border:1.5px solid ${isCertified ? 'rgba(0,255,136,0.35)' : (isStudying ? 'var(--neon-purple)' : 'rgba(255,255,255,0.08)')};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="badge ${trackColor}" style="font-size:0.6rem;">TIER ${c.tier} ${c.track.toUpperCase()}</span>
                  <span style="font-weight:900; font-size:0.86rem; color:#ffffff;">${c.name}</span>
                </div>
                <div style="font-size:0.7rem; color:var(--text-muted); margin:4px 0;">${c.description}</div>
                <div style="font-size:0.72rem; color:var(--neon-cyan); font-weight:800;">
                  ✨ Unlocks: ${c.unlocksJobTitle} (${formatCurrency(c.unlocksJobSalary)}/15d)
                </div>
                <div style="font-size:0.66rem; color:var(--text-dim); margin-top:2px;">
                  ⏱️ Study Duration: <strong>${c.slotsRequired} days</strong>
                </div>
              </div>

              <div style="flex-shrink:0;">
                ${isCertified
                  ? '<span class="badge badge-green" style="padding:6px 12px; font-size:0.72rem;">✅ CERTIFIED</span>'
                  : (isStudying
                    ? `<span class="badge badge-purple" style="padding:6px 10px; font-size:0.68rem;">🔥 STUDYING (${currentProgress}%)</span>`
                    : `<button class="btn-3d btn-3d-lime btn-enroll-course" data-id="${c.id}" 
                        style="width:auto; padding:8px 14px; font-size:0.72rem;" ${p.money < c.fee ? 'disabled' : ''}>
                        🚀 ENROLL (${formatCurrency(c.fee)})
                      </button>`
                  )
                }
              </div>
            </div>

            ${isStudying ? `
              <div class="study-xp-track" style="height:8px; margin-top:8px;">
                <div class="study-xp-fill" style="width: ${Math.max(4, currentProgress)}%;"></div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(skillsCard);

  // 5. CAREER LADDER (UNLOCKED ROLES)
  const jobsCard = document.createElement('div');
  jobsCard.className = 'card';
  jobsCard.innerHTML = `
    <div class="card-title">
      <span>🚀 Career Ladder & Promotion Ranks</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${ALL_JOBS.map(j => {
        const isCurrent = p.job.id === j.id;
        const reqCourse = j.requiredCourse ? COURSES.find(c => c.id === j.requiredCourse) : undefined;
        const hasCourse = !j.requiredCourse || (p.educationProgress[j.requiredCourse] ?? 0) >= 100;
        const hasNetWorth = !j.requiredMinNetWorth || netWorth >= j.requiredMinNetWorth;
        const isQualified = hasCourse && hasNetWorth;

        return `
          <div style="background:${isCurrent ? 'rgba(0,255,136,0.08)' : (isQualified ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)')}; 
            padding:11px 13px; border-radius:14px; 
            border:1.5px solid ${isCurrent ? 'rgba(0,255,136,0.35)' : (isQualified ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)')};
            opacity:${isQualified || isCurrent ? '1' : '0.55'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:900; font-size:0.86rem; color:#ffffff;">${j.title}</div>
                <div style="font-size:0.72rem; color:var(--neon-lime); font-weight:800;">
                  ${formatCurrency(j.salaryPerCycle)} / 15d 
                  <span style="color:var(--text-muted); font-weight:600;">• ${j.timeSlotsCost} slots • +${j.stressPerDay} stress/d</span>
                </div>
              </div>
              ${isCurrent
                ? '<span class="badge badge-green">CURRENT ROLE</span>'
                : (isQualified
                  ? `<button class="btn-3d btn-3d-lime btn-switch-job-status" data-id="${j.id}" style="width:auto; padding:6px 12px; font-size:0.68rem;">SWITCH →</button>`
                  : '<span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-dim);">🔒 LOCKED</span>'
                )
              }
            </div>
            ${!isQualified && (reqCourse || j.requiredMinNetWorth) ? `
              <div style="font-size:0.65rem; color:var(--neon-coral); font-weight:700; margin-top:4px;">
                Requires: ${reqCourse ? `🎓 ${reqCourse.name}` : ''} ${j.requiredMinNetWorth ? `• Net Worth ${formatCurrency(j.requiredMinNetWorth)}` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(jobsCard);

  // 6. MONTHLY LIFESTYLE & EXPENSE CHOICES
  const lifestyleCard = document.createElement('div');
  lifestyleCard.className = 'card';
  lifestyleCard.innerHTML = `
    <div class="card-title">
      <span>🛍️ Lifestyle Setup & Monthly Outgoings</span>
    </div>

    <!-- Diet Grid -->
    <div>
      <div style="font-size:0.74rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px;">🍽️ Food & Diet Tier</div>
      <div class="expense-grid">
        ${(Object.values(FOOD_TIERS)).map(f => `
          <button class="expense-option-btn ${p.lifestyle.foodTier === f.id ? 'active' : ''} btn-select-food" data-id="${f.id}">
            <div class="expense-option-title">${getFoodEmoji(f.id)} ${f.name}</div>
            <div class="expense-option-cost">₹${f.costPerDay}/day (₹${f.costPerDay * 30}/mo)</div>
            <div class="expense-option-desc">${f.physicalDelta >= 0 ? '+' : ''}${f.physicalDelta} Health / day</div>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Transport Grid -->
    <div style="border-top:1.5px solid var(--border-subtle); padding-top:12px;">
      <div style="font-size:0.74rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px;">🚗 Transport Mode</div>
      <div class="expense-grid">
        ${(Object.values(TRANSPORT_MODES)).map(t => {
          const owned = t.id === 'walk' || p.lifestyleAssets.some(a => a.id === t.id) || t.id === 'bicycle';
          const canBuy = !owned && t.id !== 'walk';
          const catalogItem = ASSET_CATALOG.find(a => a.id === t.id);
          return `
            <button class="expense-option-btn ${p.lifestyle.transportMode === t.id ? 'active' : ''} btn-select-transport" 
              data-id="${t.id}">
              <div class="expense-option-title">${getTransportEmoji(t.id)} ${t.name}</div>
              <div class="expense-option-cost">${t.dailyCost > 0 ? `₹${t.dailyCost}/day (₹${t.dailyCost * 30}/mo)` : 'Free'}</div>
              <div class="expense-option-desc">Stress: +${t.stressPerDay}/d${!owned && canBuy && catalogItem ? ` • Buy: ₹${catalogItem.price.toLocaleString('en-IN')}` : ''}</div>
            </button>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Housing Levels -->
    <div style="border-top:1.5px solid var(--border-subtle); padding-top:12px;">
      <div style="font-size:0.74rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px;">🏠 Housing Living Box</div>
      <div class="monthly-expense-section">
        ${renderHousingOption('studio', 'Studio PG Box', 4500, p.housing.amountPerCycle === 4500)}
        ${renderHousingOption('1bhk', '1 BHK Starter Flat', 8000, p.housing.amountPerCycle === 8000)}
        ${renderHousingOption('2bhk', '2 BHK City Apartment', 14000, p.housing.amountPerCycle === 14000)}
        ${renderHousingOption('3bhk', '3 BHK Premium Highrise', 22000, p.housing.amountPerCycle === 22000)}
        ${renderHousingOption('villa', 'Luxury Bungalow Villa', 45000, p.housing.amountPerCycle === 45000)}
      </div>
    </div>

    <!-- Subscriptions & Living Extras -->
    <div style="border-top:1.5px solid var(--border-subtle); padding-top:12px;">
      <div style="font-size:0.74rem; font-weight:900; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.6px; margin-bottom:8px;">📱 Subscriptions & Monthly Passes</div>
      <div class="expense-grid">
        ${renderSubscriptionBtn('Basic 5G Mobile Plan', '₹299/mo', 'phone-basic')}
        ${renderSubscriptionBtn('VIP Phone + OTT Pack', '₹999/mo', 'phone-premium')}
        ${renderSubscriptionBtn('Local Iron Gym Pass', '₹600/mo', 'gym-local')}
        ${renderSubscriptionBtn('Luxury Wellness Club', '₹1,800/mo', 'gym-premium')}
        ${renderSubscriptionBtn('Zero Entertainment', 'Free (Boring)', 'entertainment-none')}
        ${renderSubscriptionBtn('Gaming + 4K OTT Stream', '₹1,200/mo', 'entertainment-full')}
        ${renderSubscriptionBtn('Budget Groceries', '₹2,500/mo', 'grocery-basic')}
        ${renderSubscriptionBtn('Organic Farm Direct', '₹5,000/mo', 'grocery-premium')}
      </div>
    </div>
  `;
  container.appendChild(lifestyleCard);

  // 7. BANKING & CREDIT
  const bankCard = document.createElement('div');
  bankCard.className = 'card';
  bankCard.innerHTML = `
    <div class="card-title">
      <span>🏦 Banking & Financial Protection</span>
    </div>

    <!-- High-Yield Savings -->
    ${unlockManager.isUnlocked('banking') ? `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1.5px solid rgba(255,255,255,0.08); padding:12px 14px; border-radius:14px;">
        <div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:800;">High-Yield Savings (3.5% APY)</div>
          <div style="font-weight:900; font-size:1.15rem; color:var(--neon-cyan);">${formatCurrency(p.savingsBalance)}</div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-3d btn-3d-cyan" id="btn-status-deposit" style="width:auto; padding:7px 12px; font-size:0.7rem;">💰 DEPOSIT</button>
          <button class="btn-3d btn-3d-sub" id="btn-status-withdraw" style="width:auto; padding:7px 12px; font-size:0.7rem;" ${p.savingsBalance <= 0 ? 'disabled' : ''}>WITHDRAW</button>
        </div>
      </div>
    ` : renderLockedTeaser(unlockManager.getFeatureDef('banking')!, state)}

    <!-- Loans -->
    <div style="margin-top:10px;">
      ${unlockManager.isUnlocked('loans') ? `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:0.82rem; font-weight:900;">💳 Credit & Loans</span>
          <button class="btn-3d btn-3d-gold" id="btn-status-apply-loan" style="width:auto; padding:5px 12px; font-size:0.68rem;">+ APPLY CREDIT</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${p.loans.length === 0
            ? `<div style="font-size:0.78rem; color:var(--neon-lime); font-weight:800; padding:10px 12px; background:rgba(0,255,136,0.06); border-radius:12px; border:1px solid rgba(0,255,136,0.2);">✅ Zero Debts. Clean Credit Score!</div>`
            : p.loans.map(l => `
              <div style="background:rgba(255,51,102,0.08); padding:10px 12px; border-radius:12px; border:1px solid rgba(255,51,102,0.25); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:900; font-size:0.84rem;">${l.name}</div>
                  <div style="font-size:0.68rem; color:var(--text-muted);">Principal: ${formatCurrency(l.principalRemaining)} • EMI: ${formatCurrency(l.emiAmount)}/30d</div>
                </div>
                <span class="badge ${l.missedPayments > 0 ? 'badge-red' : 'badge-green'}">${l.missedPayments > 0 ? `⚠️ ${l.missedPayments} Missed` : '✅ Good'}</span>
              </div>
            `).join('')
          }
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('loans')!, state)}
    </div>

    <!-- Health Insurance -->
    <div style="border-top:1.5px solid var(--border-subtle); padding-top:10px;">
      ${unlockManager.isUnlocked('insurance') ? `
        <div style="font-size:0.82rem; font-weight:900; margin-bottom:8px;">🛡️ Health Insurance Coverage</div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
          ${HEALTH_INSURANCE_TIERS.map(tier => `
            <button class="btn-3d ${p.insurance.health.tier === tier.tier ? 'btn-3d-lime' : 'btn-3d-sub'} btn-ins-tier" data-tier="${tier.tier}" style="text-align:left; padding:8px 10px; display:flex; flex-direction:column; align-items:flex-start; gap:2px;">
              <div style="font-weight:900; font-size:0.78rem;">${tier.name}</div>
              <div style="font-size:0.66rem; opacity:0.8;">${tier.premium > 0 ? `${formatCurrency(tier.premium)}/mo` : 'Free'}</div>
            </button>
          `).join('')}
        </div>
      ` : renderLockedTeaser(unlockManager.getFeatureDef('insurance')!, state)}
    </div>
  `;
  container.appendChild(bankCard);

  // 8. SAVE & SETTINGS
  const saveCard = document.createElement('div');
  saveCard.className = 'card';
  saveCard.innerHTML = `
    <div class="card-title"><span>⚙️ Game Data & Sync</span></div>
    <div style="display:flex; gap:10px;">
      <button class="btn-3d btn-3d-cyan" id="btn-status-export-save" style="flex:1;">EXPORT SAVE 💾</button>
      <button class="btn-3d btn-3d-coral" id="btn-status-reset" style="flex:1;">HARD RESET ⚠️</button>
    </div>
  `;
  container.appendChild(saveCard);

  // ─── EVENT HANDLERS ───────────────────────────────────────
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

  lifestyleCard.querySelectorAll('.btn-select-food').forEach(btn => {
    btn.addEventListener('click', () => {
      onAction('open-diet-modal');
    });
  });

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
    if (confirm('Reset your entire game progress and start over fresh?')) {
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
    <div style="background:rgba(255,255,255,0.02); border:1.5px dashed rgba(255,255,255,0.1); border-radius:12px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>🔒</span>
          <span style="font-size:0.82rem; font-weight:800; color:var(--text-muted);">${def.icon} ${def.name}</span>
        </div>
        <span class="badge badge-blue">${prog.pct}%</span>
      </div>
      <div style="font-size:0.68rem; color:var(--text-dim);">${def.requirementText}</div>
      <div class="meter-track">
        <div class="meter-fill" style="width:${prog.pct}%; background:var(--neon-cyan);"></div>
      </div>
    </div>
  `;
}

function renderMeterRow(name: string, cur: number, max: number, crisis: string): string {
  const pct = Math.min(100, Math.round((cur / max) * 100));
  const isDanger = pct >= 60;
  const color = isDanger ? 'var(--neon-coral)' : (pct >= 40 ? 'var(--neon-gold)' : 'var(--neon-lime)');
  return `
    <div style="background:rgba(255,255,255,0.03); padding:9px 12px; border-radius:12px; border:1.5px solid ${isDanger ? 'rgba(255,51,102,0.3)' : 'rgba(255,255,255,0.07)'};">
      <div style="display:flex; justify-content:space-between; font-size:0.74rem;">
        <span style="font-weight:800; color:#ffffff;">${name}</span>
        <span style="color:${color}; font-weight:900;">${cur}/${max}d (${pct}%) ${isDanger ? '⚠️ RISK' : ''}</span>
      </div>
      <div class="meter-track" style="margin:5px 0;">
        <div class="meter-fill" style="width:${pct}%; background:${color};"></div>
      </div>
      <div style="font-size:0.64rem; color:var(--text-dim);">${crisis}</div>
    </div>
  `;
}

function renderHousingOption(_id: string, name: string, amount: number, isActive: boolean): string {
  return `
    <div class="monthly-expense-row" style="${isActive ? 'border-color:var(--neon-lime); background:rgba(0,255,136,0.08);' : ''}">
      <span class="expense-name">${isActive ? '✅ ' : ''}${name}</span>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="expense-amount">₹${amount.toLocaleString('en-IN')}/mo</span>
        ${!isActive ? `<button class="btn-3d btn-3d-sub btn-select-housing" data-amount="${amount}" style="width:auto; font-size:0.64rem; padding:4px 9px;">SELECT</button>` : ''}
      </div>
    </div>
  `;
}

function renderSubscriptionBtn(name: string, cost: string, _id: string): string {
  return `
    <div style="background:rgba(255,255,255,0.03); border:1.5px solid rgba(255,255,255,0.08); border-radius:12px; padding:10px 12px;">
      <div style="font-size:0.78rem; font-weight:800; color:var(--text-main);">${name}</div>
      <div style="font-size:0.7rem; color:var(--neon-coral); font-weight:900; margin-top:3px;">${cost}</div>
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
