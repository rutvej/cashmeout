import { GameState } from '../types/game';
import { getTimelineInfo } from './time';
import { tickDailyHealth } from './health';
import { evaluateHabitsDaily } from './behavioral';
import { updateMarketPricesMonthly } from './market';
import { calculateIncomeTax } from './economy';
import { selectActiveEvents } from '../scenarios/deck';
import { saveGame } from '../save/save-manager';

export interface GameLoopCallbacks {
  onRender: () => void;
  onSalaryDay: () => void;
  onYearEndTax: (taxAmount: number) => void;
  onGameOver: () => void;
}

export class GameLoop {
  private state: GameState;
  private callbacks: GameLoopCallbacks;
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(state: GameState, callbacks: GameLoopCallbacks) {
    this.state = state;
    this.callbacks = callbacks;
  }

  public start(): void {
    this.stop();
    this.state.simulation.isPaused = false;
    const intervalMs = this.getIntervalMs();
    this.timerId = setInterval(() => this.tickDay(), intervalMs);
    this.callbacks.onRender();
  }

  public pause(): void {
    this.stop();
    this.state.simulation.isPaused = true;
    this.callbacks.onRender();
  }

  public stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public setSpeed(speed: 1 | 2 | 4): void {
    this.state.simulation.simulationSpeed = speed;
    if (!this.state.simulation.isPaused) {
      this.start();
    } else {
      this.callbacks.onRender();
    }
  }

  private getIntervalMs(): number {
    switch (this.state.simulation.simulationSpeed) {
      case 4: return 200;
      case 2: return 500;
      case 1:
      default: return 1000;
    }
  }

  public stepDay(): void {
    this.tickDay();
  }

  public advanceMonth(): void {
    // Fast-forward until next Salary Day (Day 1 of next month)
    const currentM = this.state.player.currentMonth;
    while (this.state.player.currentMonth === currentM && this.state.player.currentDay < 3650) {
      this.tickDay(true);
      if (this.state.player.currentDay % 30 === 1) break;
    }
    this.callbacks.onRender();
  }

  private tickDay(suppressRender = false): void {
    if (this.state.player.currentDay >= 3650) {
      this.pause();
      this.state.player.gameOver = true;
      saveGame(this.state);
      this.callbacks.onGameOver();
      return;
    }

    const prevInfo = getTimelineInfo(this.state.player.currentDay, this.state.player.startingAge);
    this.state.player.currentDay += 1;
    const nextInfo = getTimelineInfo(this.state.player.currentDay, this.state.player.startingAge);

    this.state.player.currentAge = nextInfo.age;
    this.state.player.currentYear = nextInfo.year;
    this.state.player.currentMonth = nextInfo.month;

    // 1. Health daily adjustments
    tickDailyHealth(this.state);

    // 2. Behavioral daily habits
    evaluateHabitsDaily(
      this.state.behavioral,
      this.state.resources.dailySchedule.sleepHours,
      this.state.resources.dailySchedule.gymHours
    );

    // 3. Career experience & course progression
    if (this.state.career.currentJob) {
      this.state.career.yearsOfExperience = Number((this.state.career.yearsOfExperience + (1 / 365)).toFixed(3));
      this.state.career.consecutiveEmploymentMonths += (1 / 30);
    } else {
      this.state.career.unemploymentMonths += (1 / 30);
    }

    // Active course progress
    if (this.state.career.activeCourse && nextInfo.dayInMonth === 30) {
      this.state.career.activeCourse.monthsRemaining -= 1;
      if (this.state.career.activeCourse.monthsRemaining <= 0) {
        const cId = this.state.career.activeCourse.courseId;
        this.state.career.completedCourseIds.push(cId);
        this.state.career.activeCourse = null;
        this.state.simulation.recentLogs.unshift({
          day: this.state.player.currentDay,
          message: `🎓 Course Completed: Successfully attained qualification in ${cId.replace('course-', '')}!`,
          type: 'positive'
        });
      }
    }

    // 4. Monthly transition check
    if (nextInfo.month !== prevInfo.month) {
      // Update market asset prices monthly
      updateMarketPricesMonthly(this.state);

      // Annual rent creep (Spec 06: Jan 1 / Month % 12 === 1)
      if (nextInfo.monthInYear === 1 && this.state.property.isRenting) {
        const rentHike = Math.round(this.state.property.currentMonthlyRent * 0.075);
        this.state.property.currentMonthlyRent += rentHike;
        this.state.simulation.recentLogs.unshift({
          day: this.state.player.currentDay,
          message: `📈 Annual Rent Creep: Landlord increased monthly rent by $${rentHike}.`,
          type: 'warning'
        });
      }

      // Check Year-End Tax (Spec 07: Month 12 Day 30)
      if (prevInfo.isYearEnd) {
        const taxDue = calculateIncomeTax(this.state.resources.currentYearTaxableIncome);
        this.state.resources.cashOnHand = Math.max(0, this.state.resources.cashOnHand - taxDue);
        this.state.resources.annualTaxPaid += taxDue;
        this.state.resources.currentYearTaxableIncome = 0;
        this.state.simulation.recentLogs.unshift({
          day: this.state.player.currentDay,
          message: `🏛️ Year-End Tax Audit: Paid $${taxDue} in progressive income tax.`,
          type: 'info'
        });
        this.callbacks.onYearEndTax(taxDue);
      }
    }

    // 5. Salary Day Trigger (Day 1 of month)
    if (nextInfo.isSalaryDay) {
      this.pause();
      saveGame(this.state);
      this.callbacks.onSalaryDay();
      return;
    }

    // 6. Mid-month random event cards (every ~7 to 10 days)
    if (this.state.simulation.activeEventCards.length === 0 && (nextInfo.dayInMonth === 8 || nextInfo.dayInMonth === 18 || nextInfo.dayInMonth === 25)) {
      this.state.simulation.activeEventCards = selectActiveEvents(this.state);
    }

    // Auto-save every 5 days
    if (this.state.player.currentDay % 5 === 0) {
      saveGame(this.state);
    }

    if (!suppressRender) {
      this.callbacks.onRender();
    }
  }
}
