import { GameState } from '../../types/game';
import { formatCurrency } from '../components/format';
import { ALL_JOBS, COURSES } from '../../data/static-data';
import { calculateResumeScore } from './profile-resume';

export function renderJobBoardScreen(
  state: GameState,
  onAction?: (action: string, payload?: any) => void
): HTMLElement {
  const p = state.player;
  const container = document.createElement('div');
  container.className = 'screen-content job-board-screen';
  const resume = calculateResumeScore(state);

  // Active Job Hero Card
  const activeJobCard = document.createElement('div');
  activeJobCard.className = 'card active-job-card';
  activeJobCard.innerHTML = `
    <div class="active-job-header">
      <div>
        <span class="badge badge-green">CURRENT EMPLOYMENT</span>
        <h2 class="active-job-title">${p.job.title}</h2>
        <div class="active-job-sub">
          Salary: <strong>${formatCurrency(p.job.salaryPerCycle * 2)} / month</strong> (${formatCurrency(p.job.salaryPerCycle)} / 15d)
        </div>
      </div>
      <div class="active-job-culture">
        <span class="culture-stars">★★★☆☆</span>
        <span class="culture-lbl">Company Culture</span>
      </div>
    </div>
    <div class="active-job-metrics">
      <div class="job-metric-item">
        <span class="metric-lbl">Daily Stress Drain</span>
        <span class="metric-val">+${p.job.stressPerDay}/day</span>
      </div>
      <div class="job-metric-item">
        <span class="metric-lbl">Core Work Hours</span>
        <span class="metric-val">8.0 hrs / day</span>
      </div>
      <div class="job-metric-item">
        <span class="metric-lbl">Layoff Risk</span>
        <span class="metric-val val-emerald">Low (5%)</span>
      </div>
    </div>
  `;
  container.appendChild(activeJobCard);

  // Available Job Openings Card
  const jobListCard = document.createElement('div');
  jobListCard.className = 'card';
  jobListCard.innerHTML = `
    <div class="card-title">
      <span>🏢 Open Career Opportunities</span>
      <span class="badge badge-sky">Resume Score: ${resume.total}/100</span>
    </div>
    <p class="card-sub-hint">
      Every opening requires verified experience and specific course qualifications.
    </p>
    <div class="job-openings-list" id="job-openings-list"></div>
  `;

  const openingsListEl = jobListCard.querySelector('#job-openings-list')!;

  ALL_JOBS.forEach(job => {
    const isCurrent = job.id === p.job.id;
    const requiredCourse = COURSES.find(c => c.unlocksJobId === job.id || c.id === job.requiredCourse);
    const hasCourse = requiredCourse ? (p.educationProgress[requiredCourse.id] || 0) >= 100 : true;
    const minDays = job.requiredMinDays || 0;
    const hasExperience = p.currentDay >= minDays;
    const isQualified = hasCourse && hasExperience;

    const jobEl = document.createElement('div');
    jobEl.className = `job-opening-item ${isCurrent ? 'current-job' : ''}`;
    jobEl.innerHTML = `
      <div class="job-item-main">
        <div class="job-item-info">
          <div class="job-item-title">
            ${job.title} ${isCurrent ? '<span class="badge badge-green">Your Role</span>' : ''}
          </div>
          <div class="job-item-salary">
            ${formatCurrency(job.salaryPerCycle * 2)} / month
            <span class="job-item-cycle">(${formatCurrency(job.salaryPerCycle)} / 15d)</span>
          </div>
          <div class="job-reqs-row">
            ${requiredCourse ? `
              <span class="req-tag ${hasCourse ? 'req-met' : 'req-unmet'}">
                ${hasCourse ? '✓' : '✗'} ${requiredCourse.name}
              </span>
            ` : '<span class="req-tag req-met">✓ No Course Req</span>'}
            ${minDays > 0 ? `
              <span class="req-tag ${hasExperience ? 'req-met' : 'req-unmet'}">
                ${hasExperience ? '✓' : '✗'} ${(minDays / 360).toFixed(1)}y Experience
              </span>
            ` : ''}
          </div>
        </div>

        <div class="job-item-action">
          ${isCurrent ? `
            <button class="btn btn-sm btn-secondary disabled" disabled>Active</button>
          ` : `
            <button class="btn btn-sm ${isQualified ? 'btn-primary' : 'btn-secondary disabled'}" data-apply-id="${job.id}" ${!isQualified ? 'disabled' : ''}>
              ${isQualified ? 'Apply & Switch' : 'Locked'}
            </button>
          `}
        </div>
      </div>
    `;

    jobEl.querySelector('[data-apply-id]')?.addEventListener('click', () => {
      if (onAction) onAction('switch-job', { jobId: job.id });
    });

    openingsListEl.appendChild(jobEl);
  });

  container.appendChild(jobListCard);

  // Available Courses Card
  const coursesCard = document.createElement('div');
  coursesCard.className = 'card';
  coursesCard.innerHTML = `
    <div class="card-title">
      <span>📚 Career Accreditations & Courses</span>
      <span class="badge badge-purple">${COURSES.length} Available</span>
    </div>
    <p class="card-sub-hint">
      Complete courses to unlock higher job rungs and increase your Algorithmic Resume Score (+6 pts per tier).
    </p>
    <div class="courses-grid" id="courses-grid"></div>
  `;

  const coursesGridEl = coursesCard.querySelector('#courses-grid')!;

  COURSES.forEach(course => {
    const progress = p.educationProgress[course.id] || 0;
    const isCompleted = progress >= 100;
    const isActive = p.activeCourseId === course.id;
    const canAfford = p.money >= course.fee;

    const cEl = document.createElement('div');
    cEl.className = `course-card ${isCompleted ? 'course-done' : ''} ${isActive ? 'course-active' : ''}`;
    cEl.innerHTML = `
      <div class="course-header">
        <span class="course-name">${course.name}</span>
        <span class="course-fee">${formatCurrency(course.fee)}</span>
      </div>
      <div class="course-desc">Unlocks: ${course.unlocksJobTitle} (${formatCurrency(course.unlocksJobSalary)}/15d)</div>
      
      <div class="course-footer">
        ${isCompleted ? `
          <span class="badge badge-green">✓ Certified</span>
        ` : isActive ? `
          <span class="badge badge-sky">⚡ Studying (${Math.round(progress)}%)</span>
        ` : `
          <button class="btn btn-sm btn-primary" data-enroll-id="${course.id}" ${!canAfford ? 'disabled' : ''}>
            ${canAfford ? 'Enroll' : 'Need Cash'}
          </button>
        `}
      </div>
    `;

    cEl.querySelector('[data-enroll-id]')?.addEventListener('click', () => {
      if (onAction) onAction('enroll-course', { courseId: course.id });
    });

    coursesGridEl.appendChild(cEl);
  });

  container.appendChild(coursesCard);
  return container;
}
