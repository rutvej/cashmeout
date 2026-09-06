import { GameState } from '../types/game';
import { SeededRNG } from './prng';
import { MS_PER_GAME_DAY } from './time-system';
import { processDayEconomy } from './economy-engine';
import { processHealthAndConsequences, HealthConsequenceResult } from './health-engine';
import { tickMarket } from './market-engine';
import { tickNpcs } from './npc-engine';

export class GameLoop {
  private state: GameState;
  private rng: SeededRNG;
  private lastFrameTime = 0;
  private accumulatedMs = 0;
  private isRunning = false;
  private onRenderCallback: () => void;
  private onDayTickCallback: (day: number, healthEmergency?: HealthConsequenceResult) => void;

  constructor(
    state: GameState,
    onDayTick: (day: number, healthEmergency?: HealthConsequenceResult) => void,
    onRender: () => void
  ) {
    this.state = state;
    this.rng = new SeededRNG(state.gameSeed + state.player.currentDay);
    this.onDayTickCallback = onDayTick;
    this.onRenderCallback = onRender;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(t => this.frame(t));
  }

  public stop(): void {
    this.isRunning = false;
  }

  public simulateSingleDay(): void {
    const nextDay = this.state.player.currentDay + 1;
    this.state.player.currentDay = nextDay;
    this.state.player.lastActiveTimestamp = Date.now();

    // 1. Process time allocation side effects (side hustle income, education progress)
    const p = this.state.player;
    if (p.timeAllocation.sideHustle > 0) {
      const hasLaptop = p.lifestyleAssets.some(a => a.id === 'laptop');
      const sideIncome = p.timeAllocation.sideHustle * (hasLaptop ? 500 : 250);
      p.money += sideIncome;
      p.taxes.incomeThisCycle += sideIncome;
    }

    // 2. Health & Lifestyle Consequences
    const healthRes = processHealthAndConsequences(this.state, nextDay);

    // 3. Economy (Living costs, salary, rent, debt, taxes)
    processDayEconomy(this.state, nextDay);

    // 4. Market & Investments (Stocks, gold, SIPs, properties, businesses)
    tickMarket(this.state, nextDay, this.rng);

    // 5. NPC Decisions
    tickNpcs(this.state, nextDay, this.rng);

    // 6. Check achievements
    this.checkAchievements();

    this.onDayTickCallback(nextDay, healthRes);
  }

  private frame(timestamp: number): void {
    if (!this.isRunning) return;

    const delta = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    this.accumulatedMs += delta;

    while (this.accumulatedMs >= MS_PER_GAME_DAY) {
      this.accumulatedMs -= MS_PER_GAME_DAY;
      this.simulateSingleDay();
    }

    this.onRenderCallback();
    requestAnimationFrame(t => this.frame(t));
  }

  private checkAchievements(): void {
    const p = this.state.player;
    const addAch = (id: string, text: string) => {
      if (!p.achievements.includes(id)) {
        p.achievements.push(id);
        p.eventLog.unshift({
          day: p.currentDay,
          text: `🏆 Achievement Unlocked: ${text}!`,
          type: 'achievement'
        });
      }
    };

    if (p.money >= 100000) addAch('first-lakh', 'Lakhpati (₹1 Lakh liquid cash)');
    if (p.properties.length >= 1) addAch('first-property', 'Property Owner');
    if (p.businesses.length >= 1) addAch('entrepreneur', 'Business Mogul');
    if (p.health.physical >= 95 && p.health.mental >= 95) addAch('peak-health', 'Peak Performance (95+ Health)');
    if (p.consequenceMeters.cheapFoodDays >= 18) addAch('gut-of-steel', 'Living on the Edge (18+ Street Food Days)');
  }
}
