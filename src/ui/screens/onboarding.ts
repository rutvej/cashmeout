import { GameState } from '../../types/game';
import { LIFE_GOALS } from '../../data/life-goals';
import { COMPANIES, JOB_DEFINITIONS } from '../../data/jobs';
import { RENTAL_TIERS } from '../../data/properties';
import { formatCurrency } from '../components/format';

export interface OnboardingCallbacks {
  onComplete: () => void;
}

export function renderOnboardingWizard(state: GameState, callbacks: OnboardingCallbacks): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const wealthGoals = LIFE_GOALS.filter(g => g.category === 'wealth');
  const healthGoals = LIFE_GOALS.filter(g => g.category === 'health');
  const lifestyleGoals = LIFE_GOALS.filter(g => g.category === 'lifestyle');

  const starterJobs = JOB_DEFINITIONS.filter(j => j.rung === 1).slice(0, 3);

  overlay.innerHTML = `
    <div class="modal-content" style="max-width: 680px;">
      <div style="text-align: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
        <h1 style="font-size: 1.6rem; font-weight: 800; color: #fff;">CashFlow Life Sim</h1>
        <p style="font-size: 0.88rem; color: var(--accent-cyan); margin-top: 4px;">
          10 Years • 120 Months • Every decision compounds
        </p>
      </div>

      <!-- Step 1: Identity & Starter Job -->
      <div>
        <label style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Character Name</label>
        <input type="text" id="inp-player-name" value="${state.player.name}" style="width: 100%; background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: var(--radius-md); font-size: 1rem; margin-top: 6px;" />
      </div>

      <div>
        <label style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Starting Career (Age 22 Entry Level)</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 6px;">
          ${starterJobs.map((job, idx) => `
            <div class="list-item starter-job-card ${idx === 0 ? 'selected' : ''}" data-job-id="${job.id}" style="cursor: pointer; border-color: ${idx === 0 ? 'var(--accent-cyan)' : 'var(--border-subtle)'};">
              <div>
                <div style="font-weight: 700; font-size: 0.92rem;">${job.title}</div>
                <div style="font-size: 0.8rem; color: var(--accent-green); margin-top: 2px;">${formatCurrency(job.salaryMonthly)}/mo</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Culture: ${'★'.repeat(job.cultureStars)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Step 2: Living Arrangement -->
      <div>
        <label style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Initial Housing</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
          ${RENTAL_TIERS.slice(0, 2).map((tier, idx) => `
            <div class="list-item starter-rent-card ${idx === 1 ? 'selected' : ''}" data-rent-id="${tier.id}" style="cursor: pointer; border-color: ${idx === 1 ? 'var(--accent-cyan)' : 'var(--border-subtle)'};">
              <div>
                <div style="font-weight: 700; font-size: 0.92rem;">${tier.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${formatCurrency(tier.monthlyCostYear1)}/mo • ${tier.commuteHoursDaily}h commute</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Step 3: Life Goals (Spec 10) -->
      <div>
        <label style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Select Your 3 Life Goals (Year 10 Audit)</label>
        
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          <div>
            <span style="font-size: 0.8rem; color: var(--accent-green); font-weight: 600;">💰 Wealth Ambition:</span>
            <select id="sel-goal-wealth" style="width: 100%; background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 8px; border-radius: var(--radius-sm); margin-top: 4px;">
              ${wealthGoals.map(g => `<option value="${g.id}">${g.title} (${g.targetDescription})</option>`).join('')}
            </select>
          </div>

          <div>
            <span style="font-size: 0.8rem; color: var(--accent-purple); font-weight: 600;">🏥 Health Ambition:</span>
            <select id="sel-goal-health" style="width: 100%; background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 8px; border-radius: var(--radius-sm); margin-top: 4px;">
              ${healthGoals.map(g => `<option value="${g.id}">${g.title} (${g.targetDescription})</option>`).join('')}
            </select>
          </div>

          <div>
            <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">🏖️ Lifestyle Ambition:</span>
            <select id="sel-goal-lifestyle" style="width: 100%; background: var(--bg-card); color: #fff; border: 1px solid var(--border-subtle); padding: 8px; border-radius: var(--radius-sm); margin-top: 4px;">
              ${lifestyleGoals.map(g => `<option value="${g.id}">${g.title} (${g.targetDescription})</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Launch Button -->
      <div style="margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 16px; text-align: center;">
        <button id="btn-launch-sim" class="btn-action success" style="width: 100%; padding: 12px; font-size: 1.05rem; font-weight: 800;">
          Launch 10-Year Life Simulation 🚀
        </button>
      </div>
    </div>
  `;

  let selectedJobId = starterJobs[0].id;
  let selectedRentId = 'studio';

  // Selection handlers
  overlay.querySelectorAll('.starter-job-card').forEach(card => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.starter-job-card').forEach(c => (c as HTMLElement).style.borderColor = 'var(--border-subtle)');
      (card as HTMLElement).style.borderColor = 'var(--accent-cyan)';
      selectedJobId = (card as HTMLElement).dataset.jobId!;
    });
  });

  overlay.querySelectorAll('.starter-rent-card').forEach(card => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.starter-rent-card').forEach(c => (c as HTMLElement).style.borderColor = 'var(--border-subtle)');
      (card as HTMLElement).style.borderColor = 'var(--accent-cyan)';
      selectedRentId = (card as HTMLElement).dataset.rentId!;
    });
  });

  // Launch button handler
  overlay.querySelector('#btn-launch-sim')?.addEventListener('click', () => {
    const nameInput = overlay.querySelector('#inp-player-name') as HTMLInputElement;
    const wealthSel = overlay.querySelector('#sel-goal-wealth') as HTMLSelectElement;
    const healthSel = overlay.querySelector('#sel-goal-health') as HTMLSelectElement;
    const lifestyleSel = overlay.querySelector('#sel-goal-lifestyle') as HTMLSelectElement;

    state.player.name = nameInput.value.trim() || 'Alex Morgan';
    state.player.lifeGoals = {
      wealthGoalId: wealthSel.value,
      healthGoalId: healthSel.value,
      lifestyleGoalId: lifestyleSel.value
    };

    const starterJob = JOB_DEFINITIONS.find(j => j.id === selectedJobId) || JOB_DEFINITIONS[0];
    state.career.currentJob = {
      id: starterJob.id,
      title: starterJob.title,
      company: COMPANIES[1],
      salaryMonthly: starterJob.salaryMonthly,
      stressMonthly: starterJob.stressMonthly,
      monthsInRole: 0,
      performanceRating: 3.5,
      consecutiveLowReviews: 0
    };

    const rentTier = RENTAL_TIERS.find(t => t.id === selectedRentId) || RENTAL_TIERS[1];
    state.property.rentalTier = rentTier.id;
    state.property.currentMonthlyRent = rentTier.monthlyCostYear1;
    state.resources.dailySchedule.commuteHours = rentTier.commuteHoursDaily;

    state.player.onboardingComplete = true;
    overlay.remove();
    callbacks.onComplete();
  });

  return overlay;
}
