import { randInt, randFloat, setSeed } from '../utils/random.js';

export class CalendarQueue {
  constructor() {
    this.events = new Map();
  }

  schedule(day, eventPayload) {
    if (!this.events.has(day)) {
      this.events.set(day, []);
    }
    this.events.get(day).push(eventPayload);
  }

  popEventsForDay(day) {
    if (this.events.has(day)) {
      const dayEvents = this.events.get(day);
      this.events.delete(day);
      return dayEvents;
    }
    return [];
  }

  peekUpcoming(fromDay, windowDays = 30) {
    const upcoming = [];
    for (let day = fromDay; day <= fromDay + windowDays; day++) {
      if (this.events.has(day)) {
        upcoming.push({ day, count: this.events.get(day).length, events: this.events.get(day) });
      }
    }
    return upcoming;
  }

  getAllScheduled() {
    const all = [];
    const sortedDays = Array.from(this.events.keys()).sort((a, b) => a - b);
    for (const day of sortedDays) {
      all.push({ day, events: this.events.get(day) });
    }
    return all;
  }
}

export function generateEventCalendar(seed, playerProfile, eventDeck) {
  const queue = new CalendarQueue();
  const totalDays = 7300; // ~20 years

  // Seed is set prior to calling or here
  if (seed) setSeed(seed);

  if (playerProfile && playerProfile.marriageAge) {
    const marriageDay = (playerProfile.marriageAge - 22) * 365 + randInt(30, 300);
    if (marriageDay > 0 && marriageDay < totalDays) {
      queue.schedule(marriageDay, { type: 'deck_event', id: 'marriage_event' });
    }
  }

  const numRandomEvents = 28;
  const interval = Math.floor(totalDays / numRandomEvents);

  for (let i = 0; i < numRandomEvents; i++) {
    const baseDay = i * interval;
    const jitter = randInt(15, Math.max(20, interval - 15));
    const day = Math.min(totalDays - 10, baseDay + jitter);
    
    if (eventDeck && eventDeck.length > 0) {
      // Pick a random event template from the deck
      const eventIndex = randInt(0, eventDeck.length - 1);
      const eventTemplate = eventDeck[eventIndex];
      
      // Skip marriage if it's already scheduled manually
      if (eventTemplate && (eventTemplate.id === 'marriage_event' || eventTemplate.id === 'marriage') && playerProfile?.marriageAge) {
        continue;
      }

      if (day > 30 && day < totalDays) {
        queue.schedule(day, { type: 'deck_event', id: eventTemplate.id, template: eventTemplate });
      }
    }
  }

  return queue;
}
