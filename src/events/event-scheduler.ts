import { GameState } from '../types/game';
import { ActiveEventCard, EventCardDef, ChoiceResult } from './event-types';
import { ALL_EVENT_DEFS, getEventDefById } from './event-pool';
import { HealthConsequenceResult, HealthWarning } from '../engine/health-engine';
import { COURSES, ALL_JOBS } from '../data/static-data';

export class EventScheduler {
  private seenEvents: Map<string, number> = new Map(); // defId -> lastDaySeen
  private onceTriggered: Set<string> = new Set();

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem('cashflow_event_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.seen) {
          for (const [k, v] of Object.entries(parsed.seen)) {
            this.seenEvents.set(k, v as number);
          }
        }
        if (parsed.once && Array.isArray(parsed.once)) {
          parsed.once.forEach((id: string) => this.onceTriggered.add(id));
        }
      }
    } catch {
      // ignore
    }
  }

  private saveHistory(): void {
    try {
      const obj = {
        seen: Object.fromEntries(this.seenEvents),
        once: Array.from(this.onceTriggered)
      };
      localStorage.setItem('cashflow_event_history', JSON.stringify(obj));
    } catch {
      // ignore
    }
  }

  /**
   * Generates 1 to 2 event cards for the current game day.
   */
  public generateCardsForDay(
    state: GameState,
    healthEmergency?: HealthConsequenceResult
  ): ActiveEventCard[] {
    const cards: ActiveEventCard[] = [];
    const currentDay = state.player.currentDay;

    // 1. If a critical health consequence was triggered, build an emergency card
    if (healthEmergency && healthEmergency.triggered && healthEmergency.name) {
      const emergencyCard = this.createMedicalEmergencyCard(state, healthEmergency, currentDay);
      cards.push(emergencyCard);
    }

    // 2. If a 60% danger zone doctor warning was triggered, build doctor warning card
    if (healthEmergency && healthEmergency.warning) {
      const warningCard = this.createDoctorWarningCard(state, healthEmergency.warning, currentDay);
      cards.push(warningCard);
    }

    // 3. Filter available event defs
    const eligibleDefs = ALL_EVENT_DEFS.filter(def => {
      // If once-only and already triggered
      if (def.once && this.onceTriggered.has(def.id)) return false;

      // Check cooldown
      const lastSeen = this.seenEvents.get(def.id);
      if (lastSeen !== undefined && def.cooldownDays) {
        if (currentDay - lastSeen < def.cooldownDays) return false;
      }

      // Check custom condition
      if (def.condition) {
        try {
          if (!def.condition(state)) return false;
        } catch {
          return false;
        }
      }

      return true;
    });

    // Sort by priority descending
    eligibleDefs.sort((a, b) => b.priority - a.priority);

    // Pick top high-priority card (priority >= 80, e.g. milestones) if present
    const highPri = eligibleDefs.find(d => d.priority >= 80);
    if (highPri) {
      cards.push(this.instantiateCard(highPri, state, currentDay));
      if (highPri.once) this.onceTriggered.add(highPri.id);
      this.seenEvents.set(highPri.id, currentDay);
    }

    // Pick 1 regular event (dilemma, daily, opportunity, market, npc) if we haven't reached 2 cards
    const remaining = eligibleDefs.filter(d => !cards.some(c => c.defId === d.id) && d.priority < 80);
    if (remaining.length > 0 && cards.length < 2) {
      // Weighted shuffle among top 5 eligible to keep it varied
      const candidatePool = remaining.slice(0, 6);
      const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      cards.push(this.instantiateCard(chosen, state, currentDay));
      if (chosen.once) this.onceTriggered.add(chosen.id);
      this.seenEvents.set(chosen.id, currentDay);
    }

    this.saveHistory();
    return cards;
  }

  private instantiateCard(def: EventCardDef, state: GameState, day: number): ActiveEventCard {
    return {
      instanceId: `card-${def.id}-${day}-${Date.now()}`,
      defId: def.id,
      category: def.category,
      title: def.title,
      emoji: def.emoji,
      narrative: def.narrative,
      day,
      choices: def.choices.map(c => ({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        preview: c.preview,
        disabled: c.disabled ? c.disabled(state) : false,
        disabledReason: c.disabledReason
      })),
      resolved: false
    };
  }

  private createMedicalEmergencyCard(
    _state: GameState,
    med: HealthConsequenceResult,
    day: number
  ): ActiveEventCard {
    return {
      instanceId: `card-med-emergency-${day}-${Date.now()}`,
      defId: 'medical-emergency-generic',
      category: 'health',
      title: `🚨 ${med.name}`,
      emoji: '🏥',
      narrative: `A medical crisis struck! ${med.description || ''} The bill was ₹${med.medicalBill?.toLocaleString('en-IN') || '0'}.`,
      day,
      choices: [
        {
          id: 'pay-and-rest',
          label: 'Acknowledge & Recover',
          emoji: '🩹',
          preview: [
            { text: `Paid ₹${med.outOfPocketCost?.toLocaleString('en-IN') || '0'}`, type: 'negative' },
            { text: 'Reset Habits Now', type: 'positive' }
          ]
        }
      ],
      resolved: false
    };
  }

  private createDoctorWarningCard(
    state: GameState,
    w: HealthWarning,
    day: number
  ): ActiveEventCard {
    return {
      instanceId: `card-doctor-warning-${w.meterKey}-${day}-${Date.now()}`,
      defId: `doctor-warning-${w.meterKey}`,
      category: 'health',
      title: `👨‍⚕️ Doctor's Warning: ${w.title}`,
      emoji: '🩺',
      narrative: `${w.doctorName} stops you after inspecting your test indicators: "${w.advice}"`,
      day,
      choices: [
        {
          id: 'follow-advice',
          label: "Follow Doctor's Detox Regimen",
          emoji: '💊',
          preview: [
            { text: '-₹400 Consultation/Meds', type: 'negative' },
            { text: `-8 ${w.meterName} Days (Safe Zone!)`, type: 'positive' },
            { text: '+12 Health Recovery', type: 'positive' }
          ],
          disabled: state.player.money < 400,
          disabledReason: 'Need ₹400 cash'
        },
        {
          id: 'brush-off',
          label: "Brush Off: 'I'll Be Fine, Doc'",
          emoji: '🏃',
          preview: [
            { text: '₹0 spent', type: 'neutral' },
            { text: `Impending ${w.impendingCrisis} (~₹${w.expectedCost})`, type: 'negative' }
          ]
        }
      ],
      resolved: false
    };
  }

  public resolveCardChoice(
    card: ActiveEventCard,
    choiceId: string,
    state: GameState
  ): ChoiceResult {
    // If it's the dynamic emergency card
    if (card.defId === 'medical-emergency-generic') {
      card.resolved = true;
      card.selectedChoiceId = choiceId;
      card.outcomeText = 'You paid the medical charges and rested. Time to re-evaluate lifestyle habits!';
      return { outcomeText: card.outcomeText };
    }

    // If it's the doctor 60% warning card
    if (card.defId.startsWith('doctor-warning-')) {
      const meterKey = card.defId.replace('doctor-warning-', '') as
        | 'cheapFoodDays'
        | 'noExerciseDays'
        | 'highStressDays'
        | 'lowEnergyDays';

      card.resolved = true;
      card.selectedChoiceId = choiceId;

      if (choiceId === 'follow-advice') {
        state.player.money = Math.max(0, state.player.money - 400);
        if (state.player.consequenceMeters[meterKey] !== undefined) {
          state.player.consequenceMeters[meterKey] = Math.max(0, state.player.consequenceMeters[meterKey] - 8);
        }
        state.player.health.physical = Math.min(100, state.player.health.physical + 12);
        card.moneyDelta = -400;
        card.outcomeText = `You followed doctor's advice, rested, and took prescribed detox supplements. Your strain dropped safely to ${state.player.consequenceMeters[meterKey]} days!`;
        return { outcomeText: card.outcomeText, moneyDelta: -400 };
      } else {
        state.player.stats.stress = Math.min(100, state.player.stats.stress + 5);
        card.outcomeText = `You brushed off the physician's warning. The risk continues building toward an emergency...`;
        return { outcomeText: card.outcomeText };
      }
    }

    // If it's a course certification milestone card
    if (card.defId.startsWith('cert-')) {
      const courseId = card.defId.replace('cert-', '');
      card.resolved = true;
      card.selectedChoiceId = choiceId;

      if (choiceId === 'switch-now') {
        const course = COURSES.find(c => c.id === courseId);
        if (course) {
          const job = ALL_JOBS.find(j => j.id === course.unlocksJobId);
          if (job) {
            state.player.job = {
              id: job.id,
              title: job.title,
              salaryPerCycle: job.salaryPerCycle,
              payCycleDays: job.payCycleDays,
              stressPerDay: job.stressPerDay,
              timeSlotsCost: job.timeSlotsCost
            };
            card.outcomeText = `Congratulations! You accepted the offer as ${job.title} earning ₹${job.salaryPerCycle.toLocaleString('en-IN')} / 15d!`;
            return { outcomeText: card.outcomeText };
          }
        }
      }
      card.outcomeText = `Certification safely added to your resume! You can switch into this high-paying role anytime from your Life Status panel.`;
      return { outcomeText: card.outcomeText };
    }

    const def = getEventDefById(card.defId);
    if (!def) {
      card.resolved = true;
      card.selectedChoiceId = choiceId;
      card.outcomeText = 'Choice recorded.';
      return { outcomeText: 'Choice recorded.' };
    }

    const choiceDef = def.choices.find(c => c.id === choiceId);
    if (!choiceDef) {
      card.resolved = true;
      card.selectedChoiceId = choiceId;
      return { outcomeText: 'Done.' };
    }

    const result = choiceDef.onSelect(state);
    card.resolved = true;
    card.selectedChoiceId = choiceId;
    card.outcomeText = result.outcomeText;
    card.moneyDelta = result.moneyDelta;

    // Log to journal
    state.player.eventLog.unshift({
      day: state.player.currentDay,
      text: `${card.emoji} ${card.title}: ${result.outcomeText}`,
      type: (result.moneyDelta && result.moneyDelta > 0) ? 'income' : ((result.moneyDelta && result.moneyDelta < 0) ? 'expense' : 'event')
    });

    return result;
  }
}
