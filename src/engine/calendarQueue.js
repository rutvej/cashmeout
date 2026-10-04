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
  const startAge = playerProfile?.characterAge || 22;
  const retirementAge = playerProfile?.retirementAge || 50;
  const totalDays = Math.max(365 * 10, (retirementAge - startAge) * 365);
  const totalYears = Math.floor(totalDays / 365);

  if (seed) setSeed(seed);

  const getTemplate = (id) => eventDeck.find(e => e.id === id);

  // 1. Fixed Marriage Milestone
  if (playerProfile && playerProfile.marriageAge) {
    const marriageDay = (playerProfile.marriageAge - startAge) * 365 + randInt(30, 200);
    if (marriageDay > 0 && marriageDay < totalDays) {
      queue.schedule(marriageDay, { type: 'deck_event', id: 'marriage_event' });
    }
  }

  // 2. Bonus: Once a year (if employed)
  const bonusTemplate = getTemplate('work_bonus');
  if (bonusTemplate) {
    for (let y = 1; y <= totalYears; y++) {
      const bonusDay = (y - 1) * 365 + randInt(320, 355);
      if (bonusDay > 30 && bonusDay < totalDays) {
        queue.schedule(bonusDay, { type: 'deck_event', id: 'work_bonus', template: bonusTemplate });
      }
    }
  }

  // 3. Medical Emergency: Once every 3 years
  const medTemplate = getTemplate('medical_emergency');
  if (medTemplate) {
    for (let y = 3; y <= totalYears; y += 3) {
      const medDay = (y - 1) * 365 + randInt(60, 300);
      if (medDay < totalDays) {
        queue.schedule(medDay, { type: 'deck_event', id: 'medical_emergency', template: medTemplate });
      }
    }
  }

  // 4. Renovation: Once every 1 to 2 years (only if player owns a home)
  const renoTemplate = getTemplate('home_renovation');
  if (renoTemplate && playerProfile?.homeOwned) {
    let renoYear = 2;
    while (renoYear <= totalYears) {
      const renoDay = (renoYear - 1) * 365 + randInt(40, 320);
      if (renoDay < totalDays) {
        queue.schedule(renoDay, { type: 'deck_event', id: 'home_renovation', template: renoTemplate });
      }
      renoYear += randInt(1, 2);
    }
  }

  // 5. Job Loss: Max 5 times in one gameplay, min 0, at least 5 years apart
  const jlTemplate = getTemplate('job_loss');
  if (jlTemplate) {
    const jobLossCount = randInt(1, Math.min(3, Math.floor(totalYears / 6)));
    let lastJlYear = randInt(3, 5);
    for (let j = 0; j < jobLossCount; j++) {
      if (lastJlYear < totalYears) {
        const jlDay = (lastJlYear - 1) * 365 + randInt(30, 300);
        if (jlDay < totalDays) {
          queue.schedule(jlDay, { type: 'deck_event', id: 'job_loss', template: jlTemplate });
        }
        lastJlYear += randInt(5, 7); // At least 5 years apart!
      }
    }
  }

  // 6. Windfall (sold old house / family property share): Exactly ONCE in lifetime!
  const wfTemplate = getTemplate('inheritance_gift');
  if (wfTemplate && totalYears >= 4) {
    const windfallYear = randInt(4, Math.max(5, totalYears - 2));
    const windfallDay = (windfallYear - 1) * 365 + randInt(60, 300);
    if (windfallDay < totalDays) {
      queue.schedule(windfallDay, { type: 'deck_event', id: 'inheritance_gift', template: wfTemplate });
    }
  }

  // 7. Vehicle Accident / Repair: Occasional (every 4-5 years) if vehicle owned
  const vaTemplate = getTemplate('vehicle_accident');
  if (vaTemplate && playerProfile?.carOwned) {
    for (let y = 4; y <= totalYears; y += randInt(4, 6)) {
      const vaDay = (y - 1) * 365 + randInt(60, 300);
      if (vaDay < totalDays) {
        queue.schedule(vaDay, { type: 'deck_event', id: 'vehicle_accident', template: vaTemplate });
      }
    }
  }

  return queue;
}
