import { GameState } from '../types/game';

export interface ResumeScoreBreakdown {
  totalScore: number;
  expPoints: number;       // max 25
  coursePoints: number;    // max 30
  rankPoints: number;      // max 25
  stabilityPoints: number; // max 10
  founderPoints: number;   // max 10
  tierLabel: string;
  headhunterChanceMonthly: number;
  negotiationBonusPct: number;
}

export function calculateResumeScore(state: GameState): ResumeScoreBreakdown {
  // 1. Experience (2.5 pts per year, max 25)
  const expPoints = Math.min(25, Math.round(state.career.yearsOfExperience * 2.5));

  // 2. Education (6 pts per course, max 30)
  const coursePoints = Math.min(30, state.career.completedCourseIds.length * 6);

  // 3. Hierarchy Rank (Entry: 5, Mid: 10, Senior: 15, Manager: 20, Director/VP: 25)
  let rankPoints = 5;
  const currentJob = state.career.currentJob;
  if (currentJob) {
    if (currentJob.salaryMonthly >= 11000) rankPoints = 25;
    else if (currentJob.salaryMonthly >= 6800) rankPoints = 20;
    else if (currentJob.salaryMonthly >= 4200) rankPoints = 15;
    else if (currentJob.salaryMonthly >= 2200) rankPoints = 10;
    else rankPoints = 5;
  }

  // 4. Employment Continuity (max 10)
  const stabilityPoints = state.career.unemploymentMonths === 0 ? 10 : Math.max(0, 10 - state.career.unemploymentMonths * 2);

  // 5. Entrepreneurship Premium (max 10)
  const founderPoints = state.business.activeBusinesses.length > 0 ? (state.business.activeBusinesses.some(b => b.scaleLevel >= 2) ? 10 : 5) : 0;

  const totalScore = Math.min(100, expPoints + coursePoints + rankPoints + stabilityPoints + founderPoints);

  // Tier mapping from Spec 13 Section 3
  let tierLabel = 'Junior / Stagnant';
  let headhunterChanceMonthly = 0.0;
  let negotiationBonusPct = 0;

  if (totalScore >= 91) {
    tierLabel = 'Industry Icon';
    headhunterChanceMonthly = 0.60;
    negotiationBonusPct = 25;
  } else if (totalScore >= 76) {
    tierLabel = 'Elite Tier';
    headhunterChanceMonthly = 0.40;
    negotiationBonusPct = 20;
  } else if (totalScore >= 56) {
    tierLabel = 'Senior Professional';
    headhunterChanceMonthly = 0.22;
    negotiationBonusPct = 12;
  } else if (totalScore >= 31) {
    tierLabel = 'Developing Talent';
    headhunterChanceMonthly = 0.08;
    negotiationBonusPct = 5;
  }

  return {
    totalScore,
    expPoints,
    coursePoints,
    rankPoints,
    stabilityPoints,
    founderPoints,
    tierLabel,
    headhunterChanceMonthly,
    negotiationBonusPct
  };
}
