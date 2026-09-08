import { EventCardDef } from './event-types';
import { DAILY_GRIND_EVENTS } from './pools/daily-grind';
import { LIFE_DILEMMA_EVENTS } from './pools/life-dilemmas';
import { HEALTH_TRIGGER_EVENTS } from './pools/health-triggers';
import { OPPORTUNITY_EVENTS } from './pools/opportunity';
import { MARKET_EVENTS } from './pools/market-events';
import { NPC_EVENTS } from './pools/npc-events';
import { MILESTONE_EVENTS } from './pools/milestones';
import { BEHAVIORAL_EVENTS } from './pools/behavioral-events';

export const ALL_EVENT_DEFS: EventCardDef[] = [
  ...MILESTONE_EVENTS,
  ...BEHAVIORAL_EVENTS,
  ...HEALTH_TRIGGER_EVENTS,
  ...OPPORTUNITY_EVENTS,
  ...MARKET_EVENTS,
  ...NPC_EVENTS,
  ...LIFE_DILEMMA_EVENTS,
  ...DAILY_GRIND_EVENTS,
];

export function getEventDefById(id: string): EventCardDef | undefined {
  return ALL_EVENT_DEFS.find(e => e.id === id);
}
