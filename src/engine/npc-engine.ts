import { GameState, NpcState } from '../types/game';
import { SeededRNG } from './prng';

export function tickNpcs(state: GameState, day: number, rng: SeededRNG): void {
  for (const npc of state.npcs) {
    processSingleNpcDay(npc, state, day, rng);
  }
}

function processSingleNpcDay(npc: NpcState, state: GameState, day: number, rng: SeededRNG): void {
  // Decision roll every 3-5 days
  if (day % 3 !== (npc.name.length % 3)) return;

  const roll = rng.next();

  switch (npc.archetype) {
    case 'aggressive-investor': {
      // Loves trending stocks
      if (npc.money > 5000 && roll < 0.65) {
        // Pick best performing stock
        const sorted = [...state.market.tickers].sort((a, b) => {
          const aPerf = (a.history[a.history.length - 1] || a.price) - (a.history[0] || a.price);
          const bPerf = (b.history[b.history.length - 1] || b.price) - (b.history[0] || b.price);
          return bPerf - aPerf;
        });
        const target = sorted[0];
        if (target) {
          const spend = Math.min(npc.money * 0.7, 12000);
          const shares = Math.floor(spend / target.price);
          if (shares > 0) {
            npc.money -= shares * target.price;
            const cur = npc.portfolio[target.id] || { shares: 0, avgCost: target.price };
            cur.shares += shares;
            npc.portfolio[target.id] = cur;
            recordDecision(npc, day, 'Bought', `${shares} shares of ${target.name} at ₹${target.price}`);
          }
        }
      } else if (roll > 0.85) {
        // Take profits / cut losses
        const keys = Object.keys(npc.portfolio);
        if (keys.length > 0) {
          const tickerId = keys[rng.intRange(0, keys.length - 1)];
          const entry = npc.portfolio[tickerId];
          const ticker = state.market.tickers.find(t => t.id === tickerId);
          if (entry && ticker && entry.shares > 0) {
            const soldShares = Math.max(1, Math.floor(entry.shares * 0.5));
            npc.money += soldShares * ticker.price;
            entry.shares -= soldShares;
            if (entry.shares <= 0) delete npc.portfolio[tickerId];
            recordDecision(npc, day, 'Sold', `${soldShares} shares of ${ticker.name} for cash`);
          }
        }
      }
      break;
    }

    case 'serial-entrepreneur': {
      // Scans for empty business slots
      if (npc.money > 6000 && roll < 0.5) {
        for (const sector of state.market.businessSectors) {
          if (sector.specialMechanic === 'lending') continue; // Too high capital
          const emptySlot = sector.slots.find(s => s.owner === null);
          if (emptySlot && npc.money >= sector.startupCost) {
            npc.money -= sector.startupCost;
            emptySlot.owner = npc.id;
            npc.businesses.push({ sectorId: sector.id, slotId: emptySlot.id });
            recordDecision(npc, day, 'Started Business', `Claimed slot in ${sector.name} for ₹${sector.startupCost.toLocaleString('en-IN')}`);
            break;
          }
        }
      }
      break;
    }

    case 'landlord': {
      // Scans for available properties
      if (roll < 0.4) {
        const availableProps = state.market.properties.filter(p => p.owner === null);
        for (const prop of availableProps) {
          if (npc.money >= prop.price * 0.4) {
            // Can buy or mortgage
            prop.owner = npc.id;
            npc.properties.push(prop.id);
            npc.money = Math.max(0, npc.money - prop.price * 0.5);
            recordDecision(npc, day, 'Acquired Property', `Bought ${prop.name} in ${prop.location}`);
            break;
          }
        }
      }
      break;
    }

    case 'cautious-saver': {
      // Accumulates gold or cash
      if (npc.money > 10000 && roll < 0.4) {
        const goldGrams = Math.floor((npc.money * 0.3) / state.market.goldPricePerGram);
        if (goldGrams > 0) {
          const cost = goldGrams * state.market.goldPricePerGram;
          npc.money -= cost;
          recordDecision(npc, day, 'Bought Gold', `Secured ${goldGrams}g of 24K gold as safe reserve`);
        }
      }
      break;
    }
  }
}

function recordDecision(npc: NpcState, day: number, action: string, detail: string): void {
  npc.decisionLog.unshift({ day, action, detail });
  if (npc.decisionLog.length > 20) {
    npc.decisionLog.pop();
  }
}
