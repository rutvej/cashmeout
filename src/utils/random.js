// Seeded Pseudo-Random Number Generator (Mulberry32)
// Allows Minecraft-like seed replays and deterministic game worlds

let currentSeed = Math.floor(100000 + Math.random() * 900000);
let rngState = currentSeed;

export const setSeed = (seed) => {
  if (seed === undefined || seed === null || seed === '') {
    currentSeed = Math.floor(100000 + Math.random() * 900000);
  } else if (typeof seed === 'string') {
    // String hash into 32-bit uint
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    currentSeed = Math.abs(hash) || 123456;
  } else {
    currentSeed = Math.abs(Number(seed)) || 123456;
  }
  rngState = currentSeed;
  return currentSeed;
};

export const getSeed = () => currentSeed;

// Mulberry32 generator
const seededRandom = () => {
  let t = (rngState += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const rand = () => seededRandom();

export const randInt = (min, max) => Math.floor(seededRandom() * (max - min + 1)) + min;

export const randFloat = (min, max) => seededRandom() * (max - min) + min;

export const randChoice = (array) => array[Math.floor(seededRandom() * array.length)];

export const randPercent = (min, max) => parseFloat((seededRandom() * (max - min) + min).toFixed(4));

export const weightedRandom = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = seededRandom() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item.value;
    random -= item.weight;
  }
  return items[items.length - 1].value;
};

export const shuffleArray = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};
