// Deterministic PRNG utility (Mulberry32)

export function hashStringToInt(str) {
  let hash = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return (hash >>> 0);
}

export function createPRNG(seedInput) {
  let seed = typeof seedInput === 'number' ? seedInput >>> 0 : hashStringToInt(String(seedInput || '123456'));

  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRandomSeedString() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
