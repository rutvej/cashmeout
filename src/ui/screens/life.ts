import { GameState } from '../../types/game';
import { exportSaveFile, resetGame } from '../../save/save-manager';
import { COURSES, ALL_JOBS } from '../../data/static-data';
import { formatCurrency } from '../components/format';

export function renderLifeScreen(state: GameState, onAction: (action: string, payload?: any) => void): HTMLElement {
  const p = state.player;

  const container = document.createElement('div');
  container.className = 'screen-content';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '14px';

  // 1. Consequence & Health Meters Deep-Dive
  const metersCard = document.createElement('div');
  metersCard.className = 'card';
  metersCard.innerHTML = `
    <div class="card-title">
      <span>Hidden Consequence Risk Trackers</span>
      <span class="badge badge-gold">Cause & Effect</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Personal health events are not random! They build up when you compromise on food, rest, or exercise:
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
      ${renderMeterRow('Street Food Strain', p.consequenceMeters.cheapFoodDays, 20, 'At 20d: Gastroenteritis bill')}
      ${renderMeterRow('Sedentary Inactivity', p.consequenceMeters.noExerciseDays, 35, 'At 35d: Chronic spinal pain')}
      ${renderMeterRow('Stress Fatigue', p.consequenceMeters.highStressDays, 25, 'At 25d: Panic & counseling')}
      ${renderMeterRow('Energy Depletion', p.consequenceMeters.lowEnergyDays, 15, 'At 15d: Adrenal burnout')}
    </div>
  `;
  container.appendChild(metersCard);

  // 2. Career Job Market & Skill Courses
  const careerCard = document.createElement('div');
  careerCard.className = 'card';
  careerCard.innerHTML = `
    <div class="card-title">
      <span>Career Market & Education</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">Available Jobs:</div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin: 4px 0 8px 0;">
      ${ALL_JOBS.map(job => {
        const isCurrent = p.job.id === job.id;
        const meetsCourse = !job.requiredCourse || (p.educationProgress[job.requiredCourse] || 0) >= 100;
        const meetsNetWorth = !job.requiredMinNetWorth || p.money >= job.requiredMinNetWorth;
        const canApply = meetsCourse && meetsNetWorth;

        return `
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${job.title} ${isCurrent ? '<span style="color: var(--accent-green);">(Active)</span>' : ''}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">
                Salary: ${formatCurrency(job.salaryPerCycle)} / 15d • Takes ${job.timeSlotsCost} slots • Req: ${job.requiredCourse ? COURSES.find(c => c.id === job.requiredCourse)?.name : 'None'}
              </div>
            </div>
            <div>
              ${isCurrent
                ? `<span class="badge badge-green">Current</span>`
                : (canApply
                  ? `<button class="btn btn-primary btn-switch-job" data-id="${job.id}" style="font-size: 0.7rem;">Switch</button>`
                  : `<span class="badge" style="background:#334155; color:#94a3b8;">Locked</span>`)
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Certifications & Degrees:</div>
    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
      ${COURSES.map(c => {
        const prog = p.educationProgress[c.id] || 0;
        const isDone = prog >= 100;

        return `
          <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">${c.name}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">${c.description} (Fee: ${formatCurrency(c.fee)})</div>
              <div style="font-size: 0.65rem; color: #38bdf8; margin-top: 2px;">Progress: ${prog}%</div>
            </div>
            <div>
              ${isDone
                ? `<span class="badge badge-green">Completed</span>`
                : `<button class="btn btn-primary btn-enroll-course" data-id="${c.id}" style="font-size: 0.7rem;">Enroll (${formatCurrency(c.fee)})</button>`
              }
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  container.appendChild(careerCard);

  // 3. NPC Roster in the City
  const npcsCard = document.createElement('div');
  npcsCard.className = 'card';
  npcsCard.innerHTML = `
    <div class="card-title">
      <span>Fellow Residents & Competitors</span>
      <span class="badge badge-green">Living Economy</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px;">
      ${state.npcs.map(n => `
        <div style="background: #0b0f19; padding: 8px 10px; border-radius: 6px; border: 1px solid #1a2336; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; font-size: 0.85rem;">${n.name}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: capitalize;">${n.archetype.replace('-', ' ')} • Net Cash: ${formatCurrency(n.money)}</div>
            ${n.decisionLog[0] ? `<div style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px;">Latest: ${n.decisionLog[0].action} ${n.decisionLog[0].detail}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(npcsCard);

  // 4. Data & Save Controls
  const saveCard = document.createElement('div');
  saveCard.className = 'card';
  saveCard.innerHTML = `
    <div class="card-title">
      <span>Game Save & Data Management</span>
    </div>
    <div style="font-size: 0.75rem; color: var(--text-muted);">
      Your game auto-saves to your device browser. You can export or reset your simulation:
    </div>
    <div style="display: flex; gap: 8px; margin-top: 6px;">
      <button class="btn btn-primary" id="btn-export-save" style="flex: 1; font-size: 0.75rem;">Export JSON Save</button>
      <button class="btn btn-danger" id="btn-reset-game" style="flex: 1; font-size: 0.75rem;">Hard Reset Game</button>
    </div>
  `;
  container.appendChild(saveCard);

  // Wire buttons
  saveCard.querySelector('#btn-export-save')?.addEventListener('click', () => {
    exportSaveFile(state);
  });

  saveCard.querySelector('#btn-reset-game')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset your life simulation? All progress will be wiped.')) {
      resetGame();
      location.reload();
    }
  });

  careerCard.querySelectorAll('.btn-switch-job').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('switch-job', { jobId: id });
    });
  });

  careerCard.querySelectorAll('.btn-enroll-course').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      onAction('enroll-course', { courseId: id });
    });
  });

  return container;
}

function renderMeterRow(name: string, cur: number, max: number, consequence: string): string {
  const pct = Math.min(100, Math.round((cur / max) * 100));
  const isDanger = pct >= 70;
  return `
    <div style="background: #0b0f19; padding: 6px 10px; border-radius: 6px; border: 1px solid #1a2336;">
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
        <span style="font-weight: 600;">${name}</span>
        <span style="color: ${isDanger ? 'var(--accent-red)' : 'var(--text-muted)'}; font-weight: 700;">${cur} / ${max} days (${pct}%)</span>
      </div>
      <div class="meter-track" style="margin: 4px 0;">
        <div class="meter-fill" style="width: ${pct}%; background: ${isDanger ? 'var(--accent-red)' : 'var(--accent-gold)'};"></div>
      </div>
      <div style="font-size: 0.65rem; color: #64748b;">${consequence}</div>
    </div>
  `;
}
