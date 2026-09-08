import { GameState, WealthGoalId, HealthGoalId, LifestyleGoalId } from '../../types/game';
import { WEALTH_GOALS, HEALTH_GOALS, LIFESTYLE_GOALS } from '../../data/life-goals';
import { formatCurrency } from '../components/format';
import { saveGame } from '../../save/save-manager';

export interface StarterJobChoice {
  id: string;
  title: string;
  salaryMonthly: number;
  salaryPerCycle: number;
  payCycleDays: number;
  stressPerDay: number;
  timeSlotsCost: number;
  cultureRating: string;
  description: string;
}

export const STARTER_JOBS: StarterJobChoice[] = [
  {
    id: 'junior-analyst',
    title: 'Junior Financial Analyst',
    salaryMonthly: 1800,
    salaryPerCycle: 900,
    payCycleDays: 15,
    stressPerDay: 0.6,
    timeSlotsCost: 2,
    cultureRating: '★★★☆☆',
    description: 'Corporate finance entry role. Moderate workload, good baseline for finance ladder.'
  },
  {
    id: 'junior-dev',
    title: 'Junior Software Developer',
    salaryMonthly: 2200,
    salaryPerCycle: 1100,
    payCycleDays: 15,
    stressPerDay: 0.8,
    timeSlotsCost: 2,
    cultureRating: '★★★☆☆',
    description: 'Tech startup engineering role. Higher starting compensation with occasional crunch.'
  },
  {
    id: 'customer-support',
    title: 'Customer Support Specialist',
    salaryMonthly: 1400,
    salaryPerCycle: 700,
    payCycleDays: 15,
    stressPerDay: 0.7,
    timeSlotsCost: 2,
    cultureRating: '★★★★☆',
    description: 'Client success & operations. Supportive culture, predictable hours, steady rhythm.'
  }
];

export interface HousingOption {
  id: 'near-office' | 'distant';
  title: string;
  rentMonthly: number;
  commuteDailyHours: number;
  energyDrainPerDay: number;
  freeSlotsImpact: string;
  description: string;
}

export const HOUSING_OPTIONS: HousingOption[] = [
  {
    id: 'near-office',
    title: '1BHK Near Downtown Office',
    rentMonthly: 540,
    commuteDailyHours: 0.5,
    energyDrainPerDay: 0,
    freeSlotsImpact: '+1.5 Free Hours Daily',
    description: 'Short 15-minute walk. Zero transit stress, gives you precious hours for gym & study.'
  },
  {
    id: 'distant',
    title: 'Suburban Studio Rental',
    rentMonthly: 380,
    commuteDailyHours: 2.0,
    energyDrainPerDay: 2,
    freeSlotsImpact: '-2 Hours Commute Transit',
    description: 'Saves $160/mo in rent, but burns 2 hours in daily public transit with passive energy drain.'
  }
];

export function renderOnboardingWizard(
  state: GameState,
  onComplete: () => void
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'onboarding-backdrop';

  let currentStep = 1;
  let selectedName = state.player.name || 'Alex Morgan';
  let selectedJob = STARTER_JOBS[0];
  let selectedHousing = HOUSING_OPTIONS[0];
  let selectedWealth: WealthGoalId = 'six-figure-net-worth';
  let selectedHealth: HealthGoalId = 'olympic-resilience';
  let selectedLifestyle: LifestyleGoalId = 'homeowner-pride';

  function renderStep() {
    container.innerHTML = `
      <div class="onboarding-modal">
        <!-- Progress Steps Tracker -->
        <div class="onboarding-header">
          <div class="onboarding-brand">
            <span class="brand-badge">PHASE 1 FOUNDATION</span>
            <h1 class="brand-title">Life Architect Onboarding</h1>
            <p class="brand-subtitle">Age 22 · Configure your 10-year journey</p>
          </div>
          <div class="wizard-stepper">
            <div class="wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'complete' : ''}">
              <span class="step-num">1</span>
              <span class="step-lbl">Career</span>
            </div>
            <div class="wizard-step-line ${currentStep >= 2 ? 'active' : ''}"></div>
            <div class="wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'complete' : ''}">
              <span class="step-num">2</span>
              <span class="step-lbl">Housing</span>
            </div>
            <div class="wizard-step-line ${currentStep >= 3 ? 'active' : ''}"></div>
            <div class="wizard-step ${currentStep === 3 ? 'active' : ''}">
              <span class="step-num">3</span>
              <span class="step-lbl">3 Goals</span>
            </div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="onboarding-body" id="onboarding-body">
          ${renderStepContent()}
        </div>

        <!-- Stepper Navigation Buttons -->
        <div class="onboarding-footer">
          ${currentStep > 1 ? `<button class="btn btn-secondary" id="btn-wizard-prev">← Back</button>` : `<div></div>`}
          <button class="btn btn-primary" id="btn-wizard-next">
            ${currentStep === 3 ? 'Confirm & Begin Journey 🚀' : 'Next Step →'}
          </button>
        </div>
      </div>
    `;

    attachEvents();
  }

  function renderStepContent(): string {
    if (currentStep === 1) {
      return `
        <div class="step-section">
          <div class="step-title-row">
            <h2 class="step-title">Identity & Starting Career</h2>
            <span class="step-hint">Step 1 of 3</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="player-name-input">Your Name</label>
            <input type="text" class="form-input" id="player-name-input" value="${selectedName}" placeholder="Alex Morgan" maxlength="28" />
          </div>

          <div class="form-group">
            <label class="form-label">Select Starting Job (Age 22 Entry Level)</label>
            <div class="selection-grid">
              ${STARTER_JOBS.map(job => `
                <div class="selectable-card ${selectedJob.id === job.id ? 'selected' : ''}" data-job-id="${job.id}">
                  <div class="card-radio-row">
                    <span class="card-option-title">${job.title}</span>
                    <span class="card-option-badge">${job.cultureRating} Culture</span>
                  </div>
                  <div class="card-stat-highlight">
                    ${formatCurrency(job.salaryMonthly)} / month
                    <span class="card-sub-stat">(${formatCurrency(job.salaryPerCycle)} / 15 days)</span>
                  </div>
                  <p class="card-desc">${job.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (currentStep === 2) {
      return `
        <div class="step-section">
          <div class="step-title-row">
            <h2 class="step-title">Starting Residence & Commute</h2>
            <span class="step-hint">Step 2 of 3</span>
          </div>
          <p class="step-subtitle">
            Housing is a foundational trade-off between <strong>cashflow</strong> and <strong>daily time & energy</strong>.
          </p>

          <div class="selection-grid">
            ${HOUSING_OPTIONS.map(opt => `
              <div class="selectable-card ${selectedHousing.id === opt.id ? 'selected' : ''}" data-housing-id="${opt.id}">
                <div class="card-radio-row">
                  <span class="card-option-title">${opt.title}</span>
                  <span class="badge ${opt.id === 'near-office' ? 'badge-green' : 'badge-sky'}">
                    ${opt.id === 'near-office' ? '⚡ High Time Surplus' : '💰 Low Outflow'}
                  </span>
                </div>
                <div class="card-stat-highlight">
                  ${formatCurrency(opt.rentMonthly)} / month
                  <span class="card-sub-stat">Commute: ${opt.commuteDailyHours}h / day</span>
                </div>
                <div class="housing-impact-pill">${opt.freeSlotsImpact}</div>
                <p class="card-desc">${opt.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Step 3: Life Goals
    return `
      <div class="step-section">
        <div class="step-title-row">
          <h2 class="step-title">Select Your 3 Decade Life Ambitions</h2>
          <span class="step-hint">Step 3 of 3</span>
        </div>
        <p class="step-subtitle">
          At Year 10 (Age 32), your final retrospective evaluates whether you achieved these targets.
        </p>

        <!-- Category A: Wealth -->
        <div class="form-group">
          <label class="form-label">💰 1. Wealth & Financial Ambition</label>
          <div class="goals-selection-list">
            ${WEALTH_GOALS.map(g => `
              <div class="goal-option-item ${selectedWealth === g.id ? 'selected' : ''}" data-goal-category="wealth" data-goal-id="${g.id}">
                <span class="goal-opt-icon">${g.emoji}</span>
                <div class="goal-opt-info">
                  <div class="goal-opt-name">${g.title}</div>
                  <div class="goal-opt-desc">${g.targetDescription}</div>
                </div>
                <div class="goal-radio-circle"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Category B: Health -->
        <div class="form-group">
          <label class="form-label">🏥 2. Health & Vitality Ambition</label>
          <div class="goals-selection-list">
            ${HEALTH_GOALS.map(g => `
              <div class="goal-option-item ${selectedHealth === g.id ? 'selected' : ''}" data-goal-category="health" data-goal-id="${g.id}">
                <span class="goal-opt-icon">${g.emoji}</span>
                <div class="goal-opt-info">
                  <div class="goal-opt-name">${g.title}</div>
                  <div class="goal-opt-desc">${g.targetDescription}</div>
                </div>
                <div class="goal-radio-circle"></div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Category C: Lifestyle -->
        <div class="form-group">
          <label class="form-label">🌟 3. Lifestyle & Career Ambition</label>
          <div class="goals-selection-list">
            ${LIFESTYLE_GOALS.map(g => `
              <div class="goal-option-item ${selectedLifestyle === g.id ? 'selected' : ''}" data-goal-category="lifestyle" data-goal-id="${g.id}">
                <span class="goal-opt-icon">${g.emoji}</span>
                <div class="goal-opt-info">
                  <div class="goal-opt-name">${g.title}</div>
                  <div class="goal-opt-desc">${g.targetDescription}</div>
                </div>
                <div class="goal-radio-circle"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function attachEvents() {
    // Step 1 Job Selection
    container.querySelectorAll('[data-job-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-job-id');
        const match = STARTER_JOBS.find(j => j.id === id);
        if (match) {
          selectedJob = match;
          renderStep();
        }
      });
    });

    // Step 2 Housing Selection
    container.querySelectorAll('[data-housing-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-housing-id');
        const match = HOUSING_OPTIONS.find(h => h.id === id);
        if (match) {
          selectedHousing = match;
          renderStep();
        }
      });
    });

    // Step 3 Goal Selection
    container.querySelectorAll('[data-goal-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute('data-goal-category');
        const id = (e.currentTarget as HTMLElement).getAttribute('data-goal-id')!;
        if (cat === 'wealth') selectedWealth = id as WealthGoalId;
        if (cat === 'health') selectedHealth = id as HealthGoalId;
        if (cat === 'lifestyle') selectedLifestyle = id as LifestyleGoalId;
        renderStep();
      });
    });

    // Prev Button
    container.querySelector('#btn-wizard-prev')?.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        renderStep();
      }
    });

    // Next Button
    container.querySelector('#btn-wizard-next')?.addEventListener('click', () => {
      if (currentStep === 1) {
        const nameInput = container.querySelector('#player-name-input') as HTMLInputElement;
        if (nameInput && nameInput.value.trim()) {
          selectedName = nameInput.value.trim();
        }
        currentStep = 2;
        renderStep();
      } else if (currentStep === 2) {
        currentStep = 3;
        renderStep();
      } else if (currentStep === 3) {
        // Complete onboarding and commit state
        commitOnboarding();
      }
    });
  }

  function commitOnboarding() {
    const p = state.player;
    p.name = selectedName;
    p.onboardingComplete = true;
    p.startingAge = 22;

    // Apply job
    p.job = {
      id: selectedJob.id,
      title: selectedJob.title,
      salaryPerCycle: selectedJob.salaryPerCycle,
      payCycleDays: selectedJob.payCycleDays,
      stressPerDay: selectedJob.stressPerDay,
      timeSlotsCost: selectedJob.timeSlotsCost
    };

    p.careerHistory = [
      {
        jobId: selectedJob.id,
        title: selectedJob.title,
        startDay: 1,
        endDay: null,
        salary: selectedJob.salaryPerCycle
      }
    ];

    // Apply housing
    p.housing = {
      type: 'rent',
      amountPerCycle: selectedHousing.rentMonthly,
      cycleDays: 30,
      lastPaidDay: 1,
      locationTier: selectedHousing.id
    };

    // Apply daily schedule defaults
    const commuteSlots = selectedHousing.id === 'near-office' ? 0.5 : 2.0;
    p.timeAllocation.commute = commuteSlots;
    p.timeAllocation.job = 2; // 8 hours core work
    p.timeAllocation.exercise = 1; // 1 hr gym
    p.timeAllocation.cooking = selectedHousing.id === 'near-office' ? 1 : 0.5;
    p.timeAllocation.free = Math.max(1, 4 - commuteSlots);

    // Apply life goals
    p.lifeGoals = {
      wealth: selectedWealth,
      health: selectedHealth,
      lifestyle: selectedLifestyle
    };

    p.lifeGoalStats = {
      burnoutEpisodes: 0,
      totalGymSessions: 0,
      totalDaysTracked: 1
    };

    p.eventLog.unshift({
      day: 1,
      text: `🎉 Started life journey at Age 22 as ${selectedJob.title}! Targets set for 10-year Life Report.`,
      type: 'achievement'
    });

    saveGame(state);
    container.remove();
    onComplete();
  }

  renderStep();
  return container;
}
