import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { calculateTimeline } from '../components/hud';
import { COURSES } from '../../data/static-data';
import { exportSaveFile, resetGame } from '../../save/save-manager';

export function calculateResumeScore(state: GameState): {
  total: number;
  expPoints: number;
  coursePoints: number;
  rankPoints: number;
  continuityBonus: number;
  founderBonus: number;
  tierLabel: string;
} {
  const p = state.player;
  const yearsExp = Math.max(0.2, (p.currentDay / 360));

  // 1. Experience: +2.5 pts per full year (max 25)
  const expPoints = Math.min(25, Math.round(yearsExp * 2.5 * 10) / 10);

  // 2. Education & Certifications: +6 pts per completed tier (max 30)
  const completedCourses = Object.entries(p.educationProgress).filter(([_, prog]) => prog >= 100).length;
  const coursePoints = Math.min(30, completedCourses * 6);

  // 3. Hierarchy Rank: Entry 5, Mid 10, Senior 15, Manager 20, Director/VP 25
  const title = p.job.title.toLowerCase();
  let rankPoints = 5;
  if (title.includes('director') || title.includes('vp') || title.includes('chief') || title.includes('officer')) {
    rankPoints = 25;
  } else if (title.includes('manager') || title.includes('lead')) {
    rankPoints = 20;
  } else if (title.includes('senior')) {
    rankPoints = 15;
  } else if (title.includes('associate') || title.includes('analyst') || title.includes('developer')) {
    rankPoints = 10;
  }

  // 4. Continuity Bonus (max 10)
  const continuityBonus = 10;

  // 5. Founder Bonus (max 10)
  const founderBonus = Math.min(10, p.businesses.length * 5);

  const total = Math.min(100, Math.round(expPoints + coursePoints + rankPoints + continuityBonus + founderBonus));

  let tierLabel = 'Junior / Stagnant (0-30)';
  if (total >= 76) tierLabel = 'Elite / Headhunter Target (76-90)';
  else if (total >= 56) tierLabel = 'Senior Professional (56-75)';
  else if (total >= 31) tierLabel = 'Developing Talent (31-55)';

  return {
    total,
    expPoints,
    coursePoints,
    rankPoints,
    continuityBonus,
    founderBonus,
    tierLabel
  };
}

export function renderProfileResumeScreen(
  state: GameState,
  onAction?: (action: string, payload?: any) => void
): HTMLElement {
  const p = state.player;
  const timeline = calculateTimeline(p.currentDay, p.startingAge || 22);
  const resume = calculateResumeScore(state);

  const container = document.createElement('div');
  container.className = 'screen-content profile-screen';

  const completedCertList = COURSES.filter(c => (p.educationProgress[c.id] || 0) >= 100);
  const activeCourse = COURSES.find(c => c.id === p.activeCourseId);

  const b = p.behavioralCounters || {
    impulseBuyCounter: 1.5,
    junkFoodCounter: 1.5,
    gymSkipCounter: 1.5,
    sleepDebtCounter: 1.5,
    cryptoFomoCounter: 1.0,
    lifestyleCreepCounter: 1.0,
    lateNightWorkCounter: 1.0
  };

  container.innerHTML = `
    <!-- Header Summary Card -->
    <div class="card resume-hero-card">
      <div class="resume-hero-header">
        <div>
          <span class="badge badge-sky">VERIFIED RESUME</span>
          <h2 class="resume-name">${p.name}</h2>
          <div class="resume-meta">Age ${timeline.age} · ${(p.currentDay / 360).toFixed(1)} Yrs Experience</div>
        </div>
        <div class="resume-score-badge">
          <span class="score-num">${resume.total}</span>
          <span class="score-denom">/ 100</span>
          <div class="score-tier-label">${resume.tierLabel.split(' ')[0]}</div>
        </div>
      </div>

      <!-- Score Breakdown Grid -->
      <div class="score-breakdown-row">
        <div class="score-chip">
          <span class="chip-lbl">Experience</span>
          <span class="chip-val">${resume.expPoints} / 25</span>
        </div>
        <div class="score-chip">
          <span class="chip-lbl">Certifications</span>
          <span class="chip-val">${resume.coursePoints} / 30</span>
        </div>
        <div class="score-chip">
          <span class="chip-lbl">Corporate Rank</span>
          <span class="chip-val">${resume.rankPoints} / 25</span>
        </div>
        <div class="score-chip">
          <span class="chip-lbl">Continuity</span>
          <span class="chip-val">+${resume.continuityBonus}</span>
        </div>
      </div>
    </div>

    <!-- Active Study In Progress (If Any) -->
    ${activeCourse ? `
      <div class="card active-study-card">
        <div class="card-title">
          <span>📚 Active Certification Study</span>
          <button class="btn btn-sm btn-secondary" id="btn-pause-study">Pause</button>
        </div>
        <div class="study-info-row">
          <strong class="val-sky">${activeCourse.name}</strong>
          <span>${Math.round(p.educationProgress[activeCourse.id] || 0)}% Complete</span>
        </div>
        <div class="health-progress-track">
          <div class="health-progress-fill fill-sky" style="width: ${Math.max(4, p.educationProgress[activeCourse.id] || 0)}%;"></div>
        </div>
        <div class="study-sub-desc">Unlocks: ${activeCourse.unlocksJobTitle} (${formatCurrency(activeCourse.unlocksJobSalary)}/15d)</div>
      </div>
    ` : ''}

    <!-- Career History -->
    <div class="card">
      <div class="card-title">
        <span>💼 Employment History</span>
        <span class="badge badge-green">Current: ${p.job.title}</span>
      </div>
      <div class="history-list">
        ${p.careerHistory && p.careerHistory.length > 0 ? p.careerHistory.map(entry => `
          <div class="history-item">
            <div class="history-bullet"></div>
            <div class="history-content">
              <div class="history-title">${entry.title}</div>
              <div class="history-sub">
                Day ${entry.startDay} – ${entry.endDay ? `Day ${entry.endDay}` : 'Present'} · Base: ${formatCurrency(entry.salary * 2)}/mo
              </div>
            </div>
          </div>
        `).join('') : `
          <div class="history-item">
            <div class="history-bullet"></div>
            <div class="history-content">
              <div class="history-title">${p.job.title}</div>
              <div class="history-sub">Day 1 – Present · ${formatCurrency(p.job.salaryPerCycle * 2)}/mo</div>
            </div>
          </div>
        `}
      </div>
    </div>

    <!-- Accreditations & Certifications -->
    <div class="card">
      <div class="card-title">
        <span>🎓 Accreditations & Completed Courses (${completedCertList.length})</span>
      </div>
      ${completedCertList.length > 0 ? `
        <div class="certs-grid">
          ${completedCertList.map(c => `
            <div class="cert-pill">
              <span>📜</span>
              <span>${c.name}</span>
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="empty-state-text">No completed certifications yet. Enroll in courses to boost your algorithmic resume score!</p>
      `}
    </div>

    <!-- Behavioral Feedback Loop Audit (The 7 Hidden Counters) -->
    <div class="card">
      <div class="card-title">
        <span>🧠 Dynamic Behavioral Habits Audit</span>
        <span class="badge badge-sky">7 Counters</span>
      </div>
      <p class="card-sub-hint">
        Universal Rule: Counters never drop below 1.0. High counters compound into frequent temptation cards.
      </p>

      <div class="behavioral-counters-grid">
        <div class="beh-counter-item">
          <div class="beh-header">
            <span>🛒 Impulse Buying</span>
            <span class="beh-val ${b.impulseBuyCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.impulseBuyCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.impulseBuyCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.impulseBuyCounter * 10}%;"></div>
          </div>
        </div>

        <div class="beh-counter-item">
          <div class="beh-header">
            <span>🍔 Junk Food / Fast Food</span>
            <span class="beh-val ${b.junkFoodCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.junkFoodCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.junkFoodCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.junkFoodCounter * 10}%;"></div>
          </div>
        </div>

        <div class="beh-counter-item">
          <div class="beh-header">
            <span>🛋️ Gym Skip Inertia</span>
            <span class="beh-val ${b.gymSkipCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.gymSkipCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.gymSkipCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.gymSkipCounter * 10}%;"></div>
          </div>
        </div>

        <div class="beh-counter-item">
          <div class="beh-header">
            <span>😴 Sleep Debt Deficit</span>
            <span class="beh-val ${b.sleepDebtCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.sleepDebtCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.sleepDebtCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.sleepDebtCounter * 10}%;"></div>
          </div>
        </div>

        <div class="beh-counter-item">
          <div class="beh-header">
            <span>🎰 Crypto / Speculation FOMO</span>
            <span class="beh-val ${b.cryptoFomoCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.cryptoFomoCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.cryptoFomoCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.cryptoFomoCounter * 10}%;"></div>
          </div>
        </div>

        <div class="beh-counter-item">
          <div class="beh-header">
            <span>🚘 Lifestyle Creep</span>
            <span class="beh-val ${b.lifestyleCreepCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.lifestyleCreepCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.lifestyleCreepCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.lifestyleCreepCounter * 10}%;"></div>
          </div>
        </div>

        <div class="beh-counter-item">
          <div class="beh-header">
            <span>🕯️ Late-Night Overtime Strain</span>
            <span class="beh-val ${b.lateNightWorkCounter >= 4.0 ? 'val-rose' : 'val-emerald'}">${b.lateNightWorkCounter.toFixed(1)} / 10</span>
          </div>
          <div class="health-progress-track">
            <div class="health-progress-fill ${b.lateNightWorkCounter >= 4.0 ? 'fill-rose' : 'fill-emerald'}" style="width: ${b.lateNightWorkCounter * 10}%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Management & Restart -->
    <div class="card">
      <div class="card-title">
        <span>⚙️ Session & Save Management</span>
      </div>
      <div class="actions-row">
        <button class="btn btn-secondary" id="btn-export-save">💾 Export Save JSON</button>
        <button class="btn btn-danger" id="btn-restart-game">🔄 Restart Game (Onboarding)</button>
      </div>
    </div>
  `;

  // Pause study button
  container.querySelector('#btn-pause-study')?.addEventListener('click', () => {
    if (onAction) onAction('pause-course');
  });

  // Export save
  container.querySelector('#btn-export-save')?.addEventListener('click', () => {
    exportSaveFile(state);
  });

  // Restart
  container.querySelector('#btn-restart-game')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset and start a new playthrough?')) {
      resetGame();
      location.reload();
    }
  });

  return container;
}
