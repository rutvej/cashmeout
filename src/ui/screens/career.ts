import { GameState } from '../../types/game';
import { calculateResumeScore } from '../../engine/resume';
import { JOB_DEFINITIONS } from '../../data/jobs';
import { COURSES } from '../../data/courses';
import { formatCurrency } from '../components/format';

export interface CareerCallbacks {
  onRefresh: () => void;
}

export function renderCareerScreen(state: GameState, callbacks: CareerCallbacks): HTMLElement {
  const container = document.createElement('div');
  container.className = 'screen-container';

  const resume = calculateResumeScore(state);
  const currentJob = state.career.currentJob;

  container.innerHTML = `
    <!-- Current Role & Culture -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">💼 Active Employment</h2>
        ${currentJob ? `<span class="time-tag">Tenure: ${currentJob.monthsInRole} Months</span>` : ''}
      </div>

      ${currentJob ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 700;">${currentJob.title}</div>
            <div style="color: var(--accent-cyan); font-weight: 600; font-size: 0.9rem;">${currentJob.company.name} (${currentJob.company.industry})</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
              Culture: ${'★'.repeat(currentJob.company.cultureStars)}${'☆'.repeat(5 - currentJob.company.cultureStars)} • Overtime Risk: ${(currentJob.company.overtimeFrequency * 100).toFixed(0)}%
            </div>
          </div>

          <div>
            <div class="metric-label">Monthly Gross Salary</div>
            <div class="metric-value positive" style="font-size: 1.2rem;">${formatCurrency(currentJob.salaryMonthly)}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Stress: ${currentJob.stressMonthly} pts/mo</div>
          </div>

          <div>
            <div class="metric-label">Performance Review Standing</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--accent-amber);">
              ${'★'.repeat(Math.round(currentJob.performanceRating))} (${currentJob.performanceRating.toFixed(1)} / 5.0)
            </div>
            <div style="margin-top: 8px;">
              <button id="btn-negotiate-raise" class="btn-ctrl">Negotiate Raise (+${resume.negotiationBonusPct}%)</button>
            </div>
          </div>
        </div>
      ` : `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-md);">
          ⚠️ Currently Unemployed. Browse the Job Board below to apply for a role.
        </div>
      `}
    </div>

    <!-- Algorithmic Resume Score Card -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">📜 Algorithmic Resume Score (Spec 13)</h3>
        <span class="metric-value ${resume.totalScore >= 70 ? 'positive' : (resume.totalScore >= 40 ? 'warning' : '')}">${resume.totalScore} / 100 (${resume.tierLabel})</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 14px;">
        <div class="metric-pill">
          <span class="metric-label">Experience</span>
          <span class="metric-value">${resume.expPoints} / 25 pts</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Courses & Certs</span>
          <span class="metric-value">${resume.coursePoints} / 30 pts</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Hierarchy Rank</span>
          <span class="metric-value">${resume.rankPoints} / 25 pts</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Continuity</span>
          <span class="metric-value">${resume.stabilityPoints} / 10 pts</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Founder Bonus</span>
          <span class="metric-value">${resume.founderPoints} / 10 pts</span>
        </div>
      </div>

      <div style="font-size: 0.82rem; color: var(--text-secondary);">
        💡 Headhunter monthly reachout odds: <strong>${(resume.headhunterChanceMonthly * 100).toFixed(0)}%</strong> • Salary negotiation premium: <strong>+${resume.negotiationBonusPct}%</strong>
      </div>
    </div>

    <!-- Job Board & Ladder -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🏢 Career Ladder & Job Board</h3>
      </div>
      <div class="item-list">
        ${JOB_DEFINITIONS.map(job => {
          const expOk = state.career.yearsOfExperience >= job.requiredExpYears;
          const coursesOk = job.requiredCourseIds.every(cId => state.career.completedCourseIds.includes(cId));
          const isEligible = expOk && coursesOk;
          const isCurrent = currentJob?.id === job.id;

          return `
            <div class="list-item">
              <div>
                <div style="font-weight: 700; font-size: 0.95rem;">
                  ${job.title} <span style="font-size: 0.75rem; color: var(--accent-cyan);">[Rung ${job.rung}]</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  Required: ${job.requiredExpYears} yrs exp ${job.requiredCourseIds.length > 0 ? `• Courses: ${job.requiredCourseIds.map(c => c.replace('course-', '')).join(', ')}` : '• No courses needed'}
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 14px;">
                <span class="metric-value positive">${formatCurrency(job.salaryMonthly)}/mo</span>
                ${isCurrent ? `
                  <span class="time-tag">Current Role</span>
                ` : `
                  <button class="btn-action ${isEligible ? 'success' : ''}" data-job-id="${job.id}" ${!isEligible ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
                    ${isEligible ? 'Apply Now' : 'Requirements Unmet'}
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Upskilling & Courses -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🎓 Education & Professional Certifications</h3>
      </div>
      <div class="item-list">
        ${COURSES.map(course => {
          const isCompleted = state.career.completedCourseIds.includes(course.id);
          const isEnrolled = state.career.activeCourse?.courseId === course.id;

          return `
            <div class="list-item">
              <div style="max-width: 500px;">
                <div style="font-weight: 700; font-size: 0.92rem;">${course.title}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${course.description}</div>
                <div style="font-size: 0.75rem; color: var(--accent-amber); margin-top: 2px;">
                  Unlocks Rungs: ${course.unlocksRungs.join(', ')} • Duration: ${course.durationMonths} Months
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="metric-value">${formatCurrency(course.cost)}</span>
                ${isCompleted ? `
                  <span class="time-tag" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-green);">Completed ✓</span>
                ` : (isEnrolled ? `
                  <span class="time-tag">Studying (${state.career.activeCourse?.monthsRemaining} mos left)</span>
                ` : `
                  <button class="btn-action" data-course-id="${course.id}">Enroll</button>
                `)}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Action listeners
  container.querySelector('#btn-negotiate-raise')?.addEventListener('click', () => {
    if (!state.career.currentJob) return;
    const bonus = resume.negotiationBonusPct;
    const hike = Math.round(state.career.currentJob.salaryMonthly * (bonus / 100));
    state.career.currentJob.salaryMonthly += hike;
    state.simulation.recentLogs.unshift({
      day: state.player.currentDay,
      message: `🎉 Raise Negotiated: Algorithmic leverage secured +${bonus}% hike (+$${hike}/mo)!`,
      type: 'positive'
    });
    callbacks.onRefresh();
  });

  container.querySelectorAll('button[data-job-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const jId = (btn as HTMLElement).dataset.jobId!;
      const targetJob = JOB_DEFINITIONS.find(j => j.id === jId);
      if (!targetJob) return;

      state.career.currentJob = {
        id: targetJob.id,
        title: targetJob.title,
        company: currentJob?.company || {
          id: 'corp',
          name: 'Global Enterprise Corp',
          industry: 'Commerce',
          cultureStars: targetJob.cultureStars,
          overtimeFrequency: 0.25,
          growthOpportunity: 0.35,
          layoffRisk: 0.05,
          vacationDays: 20
        },
        salaryMonthly: targetJob.salaryMonthly,
        stressMonthly: targetJob.stressMonthly,
        monthsInRole: 0,
        performanceRating: 3.5,
        consecutiveLowReviews: 0
      };

      state.simulation.recentLogs.unshift({
        day: state.player.currentDay,
        message: `💼 Offer Accepted: Joined as ${targetJob.title} with base salary $${targetJob.salaryMonthly}/mo!`,
        type: 'positive'
      });
      callbacks.onRefresh();
    });
  });

  container.querySelectorAll('button[data-course-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cId = (btn as HTMLElement).dataset.courseId!;
      const course = COURSES.find(c => c.id === cId);
      if (!course) return;

      if (state.resources.cashOnHand >= course.cost) {
        state.resources.cashOnHand -= course.cost;
        state.career.activeCourse = { courseId: course.id, monthsRemaining: course.durationMonths };
        state.simulation.recentLogs.unshift({
          day: state.player.currentDay,
          message: `🎓 Enrolled in ${course.title} for $${course.cost}.`,
          type: 'info'
        });
      } else {
        // Education loan option (Spec 03 Section 2)
        const loanAmt = course.cost;
        state.liabilities.loans.push({
          id: `edu-loan-${Date.now()}`,
          name: `Education Loan (${course.title})`,
          principal: loanAmt,
          balance: loanAmt,
          annualInterestRate: 0.09,
          monthlyEMI: Math.round(loanAmt * 0.05),
          remainingMonths: 24
        });
        state.career.activeCourse = { courseId: course.id, monthsRemaining: course.durationMonths };
        state.simulation.recentLogs.unshift({
          day: state.player.currentDay,
          message: `🎓 Enrolled in ${course.title} via Education Loan ($${loanAmt} @ 9% APR).`,
          type: 'info'
        });
      }
      callbacks.onRefresh();
    });
  });

  return container;
}
