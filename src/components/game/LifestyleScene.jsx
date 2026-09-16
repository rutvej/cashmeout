import React, { useState } from 'react';
import useGameStore from '../../engine/store';
import { formatCurrency } from '../../utils/format';

function getLifestyleTier(incomes, businessIncome, homesOwned, carsOwned) {
  const monthly = (incomes || []).reduce((s, i) => s + i.amount, 0) + (businessIncome || 0);
  const hasHome = (homesOwned || []).length > 0;
  const hasCar = (carsOwned || []).length > 0;
  if (monthly > 150000 && hasHome && hasCar) return 'wealthy';
  if (monthly > 80000 && hasHome)            return 'comfortable';
  if (monthly > 40000)                       return 'middle';
  return 'starter';
}

export default function LifestyleScene() {
  const player              = useGameStore(s => s.player);
  const incomes             = useGameStore(s => s.incomes);
  const businessIncome      = useGameStore(s => s.businessIncome);
  const homesOwned          = useGameStore(s => s.homesOwned || []);
  const carsOwned           = useGameStore(s => s.carsOwned || []);
  const married             = useGameStore(s => s.married || false);
  const homeNeedsRenovation = useGameStore(s => s.homeNeedsRenovation || false);
  const pool                = useGameStore(s => s.pool || 0);
  const currentDay          = useGameStore(s => s.currentDay || 0);

  // Time of day toggle: 'day' | 'golden' | 'night'
  const [timeMode, setTimeMode] = useState('day');
  const [hoveredElement, setHoveredElement] = useState(null);

  const tier = getLifestyleTier(incomes, businessIncome, homesOwned, carsOwned);
  const cityTier = player?.cityTier || 2;
  const isRenting = player?.isRenting ?? true;
  const hasHome = homesOwned.length > 0;
  const hasSecondHome = homesOwned.length >= 2;
  const primaryHome = homesOwned[0];
  const isVilla = hasHome && (primaryHome?.value || 0) > 7500000;
  const primaryCar = carsOwned[0];

  const tierMeta = {
    starter: {
      label: 'Early Hustle Loft',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      tagline: 'Urban rental loft · Lean & agile living',
      color: '#64748b',
    },
    middle: {
      label: 'Scandinavian Townhouse',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      tagline: 'Contemporary 2-level home · Solar powered',
      color: '#0284c7',
    },
    comfortable: {
      label: 'Architectural Estate',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagline: 'Spacious modern home · Landscaped courtyard',
      color: '#059669',
    },
    wealthy: {
      label: 'Cantilevered Luxury Villa',
      badge: 'bg-amber-50 text-amber-800 border-amber-300',
      tagline: 'Infinity pool mansion · Passive multi-assets',
      color: '#d97706',
    },
  };

  const cityNames = {
    1: 'Tier 1 Mega-Metropolis',
    2: 'Tier 2 Metro Tech Hub',
    3: 'Tier 3 Scenic Valley',
  };

  const homeStatusLabel = isRenting || !hasHome
    ? 'Urban Studio Loft'
    : isVilla
    ? 'Infinity Pool Villa'
    : hasSecondHome
    ? 'Townhouse + Rental Asset'
    : 'Contemporary Townhouse';

  const carStatusLabel = carsOwned.length > 0
    ? (tier === 'wealthy' ? 'Cyber Hypercar EV' : 'Smart Electric Crossover')
    : 'Commuter E-Bike';

  // Palette settings per time of day
  const skyThemes = {
    day: {
      skyTop: '#38bdf8',
      skyMid: '#bae6fd',
      skyBot: '#f0f9ff',
      sun: '#facc15',
      sunGlow: 'rgba(250, 204, 21, 0.45)',
      sunInner: '#fef08a',
      cloudFill: '#ffffff',
      cloudOpacity: 0.85,
      // Island turf
      lawnTop1: '#4ade80',
      lawnTop2: '#22c55e',
      lawnSideL: '#16a34a',
      lawnSideR: '#15803d',
      soilL: '#854d0e',
      soilR: '#713f12',
      bedrockL: '#334155',
      bedrockR: '#1e293b',
      // Road
      roadFace: '#64748b',
      roadSide: '#475569',
      curb: '#cbd5e1',
      // Architecture
      wallWhite: '#ffffff',
      wallWhiteShade: '#e2e8f0',
      wallDark: '#334155',
      wallDarkShade: '#1e293b',
      roofMetal: '#475569',
      woodTop: '#d97706',
      woodSide: '#b45309',
      // Glass
      windowGlass: 'rgba(186, 230, 253, 0.75)',
      windowGlow: '#fef9c3',
      windowGlowOpacity: 0.35,
      interiorWarmth: 'rgba(254, 240, 138, 0.3)',
      // Ambient
      lampGlow: 0,
      shadowOpacity: 0.22,
      islandShadow: 'rgba(15, 23, 42, 0.28)',
      poolWater: '#06b6d4',
      poolGleam: '#67e8f9',
    },
    golden: {
      skyTop: '#f43f5e',
      skyMid: '#fb923c',
      skyBot: '#fef08a',
      sun: '#ea580c',
      sunGlow: 'rgba(234, 88, 12, 0.55)',
      sunInner: '#fde047',
      cloudFill: '#ffedd5',
      cloudOpacity: 0.9,
      // Island turf
      lawnTop1: '#65a30d',
      lawnTop2: '#4d7c0f',
      lawnSideL: '#3f6212',
      lawnSideR: '#365314',
      soilL: '#78350f',
      soilR: '#451a03',
      bedrockL: '#292524',
      bedrockR: '#1c1917',
      // Road
      roadFace: '#78716c',
      roadSide: '#57534e',
      curb: '#d6d3d1',
      // Architecture
      wallWhite: '#fff7ed',
      wallWhiteShade: '#fed7aa',
      wallDark: '#44403c',
      wallDarkShade: '#292524',
      roofMetal: '#57534e',
      woodTop: '#ea580c',
      woodSide: '#c2410c',
      // Glass
      windowGlass: 'rgba(253, 186, 116, 0.8)',
      windowGlow: '#fef08a',
      windowGlowOpacity: 0.7,
      interiorWarmth: 'rgba(254, 215, 170, 0.65)',
      // Ambient
      lampGlow: 0.4,
      shadowOpacity: 0.36,
      islandShadow: 'rgba(67, 20, 7, 0.38)',
      poolWater: '#0891b2',
      poolGleam: '#fb923c',
    },
    night: {
      skyTop: '#030712',
      skyMid: '#0f172a',
      skyBot: '#1e1b4b',
      sun: '#f8fafc',
      sunGlow: 'rgba(224, 231, 255, 0.2)',
      sunInner: '#ffffff',
      cloudFill: '#1e293b',
      cloudOpacity: 0.4,
      // Island turf
      lawnTop1: '#064e3b',
      lawnTop2: '#022c22',
      lawnSideL: '#022c22',
      lawnSideR: '#011c16',
      soilL: '#451a03',
      soilR: '#290e03',
      bedrockL: '#0f172a',
      bedrockR: '#020617',
      // Road
      roadFace: '#1e293b',
      roadSide: '#0f172a',
      curb: '#475569',
      // Architecture
      wallWhite: '#1e293b',
      wallWhiteShade: '#0f172a',
      wallDark: '#0f172a',
      wallDarkShade: '#020617',
      roofMetal: '#0f172a',
      woodTop: '#78350f',
      woodSide: '#451a03',
      // Glass
      windowGlass: 'rgba(254, 240, 138, 0.95)',
      windowGlow: '#fef08a',
      windowGlowOpacity: 0.95,
      interiorWarmth: 'rgba(254, 240, 138, 0.9)',
      // Ambient
      lampGlow: 0.9,
      shadowOpacity: 0.6,
      islandShadow: 'rgba(2, 6, 23, 0.75)',
      poolWater: '#0e7490',
      poolGleam: '#22d3ee',
    },
  };

  const theme = skyThemes[timeMode];

  return (
    <div className="mx-4 my-3 rounded-2xl overflow-hidden shadow-md border border-stone-200/80 bg-white select-none transition-all">
      {/* 2026 Sleek Glassmorphic Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-text-primary">
              2.5D Isometric World
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${tierMeta[tier].badge}`}>
            {tierMeta[tier].label}
          </span>
        </div>

        {/* Time of Day & Interactive Controls */}
        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-text-muted hidden sm:inline font-semibold mr-1">
            📍 {cityNames[cityTier]}
          </span>
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100/90 p-0.5 shadow-inner">
            <button
              onClick={() => setTimeMode('day')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                timeMode === 'day'
                  ? 'bg-white shadow-xs text-sky-600 scale-[1.02]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Daylight Scene"
            >
              ☀️ Day
            </button>
            <button
              onClick={() => setTimeMode('golden')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                timeMode === 'golden'
                  ? 'bg-white shadow-xs text-amber-600 scale-[1.02]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Golden Hour Sunset"
            >
              🌅 Golden
            </button>
            <button
              onClick={() => setTimeMode('night')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                timeMode === 'night'
                  ? 'bg-white shadow-xs text-indigo-900 scale-[1.02]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Cyber Midnight Glow"
            >
              🌙 Night
            </button>
          </div>
        </div>
      </div>

      {/* Main 2.5D Isometric Diorama Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-950 group">
        <svg
          viewBox="0 0 920 500"
          className="w-full h-auto block"
          style={{ minHeight: '260px', maxHeight: '520px' }}
          preserveAspectRatio="xMidYMid meet"
          aria-label="Interactive 2.5D Isometric Lifestyle Diorama"
        >
          <defs>
            {/* Embedded Smooth Animation CSS */}
            <style>{`
              @keyframes cloudDriftSlow {
                0% { transform: translateX(0px); }
                50% { transform: translateX(35px); }
                100% { transform: translateX(0px); }
              }
              @keyframes cloudDriftFast {
                0% { transform: translateX(0px); }
                50% { transform: translateX(-40px); }
                100% { transform: translateX(0px); }
              }
              @keyframes islandFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-4px); }
              }
              @keyframes waterPulse {
                0%, 100% { opacity: 0.55; transform: scaleX(1); }
                50% { opacity: 0.9; transform: scaleX(1.02); }
              }
              @keyframes petTail {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(18deg); }
              }
              @keyframes beaconFlash {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
              }
              @keyframes starTwinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.9; }
              }
              .anim-cloud-slow { animation: cloudDriftSlow 24s ease-in-out infinite; }
              .anim-cloud-fast { animation: cloudDriftFast 16s ease-in-out infinite; }
              .anim-island { animation: islandFloat 5.5s ease-in-out infinite; }
              .anim-water { animation: waterPulse 3s ease-in-out infinite; transform-origin: center; }
              .anim-tail { transform-origin: 395px 335px; animation: petTail 0.75s ease-in-out infinite; }
              .anim-beacon { animation: beaconFlash 1.6s ease-in-out infinite; }
              .anim-star-1 { animation: starTwinkle 2.4s ease-in-out infinite; }
              .anim-star-2 { animation: starTwinkle 3.2s ease-in-out 0.8s infinite; }
            `}</style>

            {/* Sky Background Gradient */}
            <linearGradient id="isoSkyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.skyTop} />
              <stop offset="60%" stopColor={theme.skyMid} />
              <stop offset="100%" stopColor={theme.skyBot} />
            </linearGradient>

            {/* Floating Island Top Lawn Gradient */}
            <linearGradient id="islandLawnGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme.lawnTop1} />
              <stop offset="100%" stopColor={theme.lawnTop2} />
            </linearGradient>

            {/* Teak Wood Cladding Gradient */}
            <linearGradient id="teakSlatGrad" x1="0" y1="0" x2="1" y2="0.3">
              <stop offset="0%" stopColor={theme.woodTop} />
              <stop offset="50%" stopColor={theme.woodSide} />
              <stop offset="100%" stopColor={theme.woodTop} />
            </linearGradient>

            {/* Solar Photovoltaic Panels Sheen */}
            <linearGradient id="solarGlassGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="40%" stopColor="#2563eb" />
              <stop offset="70%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Pool Water 3D Depth Gradient */}
            <linearGradient id="isoPoolGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={theme.poolGleam} />
              <stop offset="60%" stopColor={theme.poolWater} />
              <stop offset="100%" stopColor="#083344" />
            </linearGradient>

            {/* Car Gloss Paint (Dynamic by Tier) */}
            <linearGradient id="carGlossGrad" x1="0" y1="0" x2="1" y2="0.8">
              {tier === 'wealthy' ? (
                <>
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#0284c7" />
                  <stop offset="75%" stopColor="#0c4a6e" />
                  <stop offset="100%" stopColor="#082f49" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="40%" stopColor="#cbd5e1" />
                  <stop offset="70%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </>
              )}
            </linearGradient>

            {/* Glass Facade High-Grade Reflection */}
            <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="30%" stopColor="rgba(224,242,254,0.45)" />
              <stop offset="60%" stopColor="rgba(186,230,253,0.15)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.3)" />
            </linearGradient>

            {/* Glow & Soft Shadow Filters */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="lampGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
            <filter id="islandShadowBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="22" />
            </filter>
            <filter id="windowBloomFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* ========================================================
              1. ATMOSPHERIC SKY & HORIZON BACKDROP
              ======================================================== */}
          <rect width="920" height="500" fill="url(#isoSkyGrad)" />

          {/* Night Mode: Twinkling Starfield */}
          {timeMode === 'night' && (
            <g>
              {[
                { x: 75, y: 35, r: 1.2, cls: 'anim-star-1' },
                { x: 140, y: 70, r: 1.5, cls: 'anim-star-2' },
                { x: 230, y: 40, r: 1, cls: 'anim-star-1' },
                { x: 310, y: 85, r: 1.4, cls: 'anim-star-2' },
                { x: 620, y: 45, r: 1.2, cls: 'anim-star-1' },
                { x: 690, y: 80, r: 1.6, cls: 'anim-star-2' },
                { x: 760, y: 35, r: 1, cls: 'anim-star-1' },
                { x: 840, y: 65, r: 1.5, cls: 'anim-star-2' },
                { x: 480, y: 30, r: 1.2, cls: 'anim-star-1' },
              ].map((s, i) => (
                <circle key={`star-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" className={s.cls} />
              ))}
            </g>
          )}

          {/* Celestial Body (Sun / Moon) */}
          <g transform="translate(780, 80)">
            <circle cx="0" cy="0" r="50" fill={theme.sunGlow} />
            <circle cx="0" cy="0" r="32" fill={theme.sunGlow} />
            <circle cx="0" cy="0" r="20" fill={theme.sunInner} />
            {timeMode === 'night' && (
              <circle cx="6" cy="-6" r="16" fill={theme.skyTop} opacity="0.95" />
            )}
          </g>

          {/* Distant Skyline / Mountains */}
          {cityTier === 3 ? (
            /* Scenic Mountain Range for Tier 3 */
            <g opacity={timeMode === 'night' ? 0.35 : 0.55}>
              <polygon points="40,240 180,120 320,240" fill={timeMode === 'night' ? '#1e1b4b' : '#93c5fd'} />
              <polygon points="180,120 230,165 180,180 130,165" fill="#ffffff" opacity="0.8" />
              <polygon points="260,250 440,110 620,250" fill={timeMode === 'night' ? '#0f172a' : '#60a5fa'} />
              <polygon points="440,110 500,160 440,175 380,160" fill="#ffffff" opacity="0.8" />
              <polygon points="560,260 720,135 880,260" fill={timeMode === 'night' ? '#1e1b4b' : '#93c5fd'} />
            </g>
          ) : (
            /* Sleek Metropolis Skyline Towers for Tier 1 & 2 */
            <g opacity={timeMode === 'night' ? 0.65 : 0.45}>
              {/* Distant Skyscraper 1 */}
              <polygon points="610,130 655,108 655,270 610,290" fill={timeMode === 'night' ? '#1e293b' : '#94a3b8'} />
              <polygon points="655,108 700,130 700,290 655,270" fill={timeMode === 'night' ? '#0f172a' : '#64748b'} />
              {/* Tower Antenna with Pulsing Beacon */}
              <line x1="655" y1="108" x2="655" y2="65" stroke="#ef4444" strokeWidth="2" />
              <circle cx="655" cy="65" r="3.5" fill="#ef4444" className="anim-beacon" />

              {/* Distant Skyscraper 2 */}
              <polygon points="720,150 760,130 760,285 720,305" fill={timeMode === 'night' ? '#1e293b' : '#94a3b8'} />
              <polygon points="760,130 800,150 800,305 760,285" fill={timeMode === 'night' ? '#0f172a' : '#64748b'} />

              {/* Distant Skyscraper 3 */}
              <polygon points="120,160 160,140 160,280 120,300" fill={timeMode === 'night' ? '#1e293b' : '#94a3b8'} />
              <polygon points="160,140 200,160 200,300 160,280" fill={timeMode === 'night' ? '#0f172a' : '#64748b'} />

              {/* Glowing Skyline Windows at Night */}
              {timeMode === 'night' && (
                <g fill="#fef08a" opacity="0.8">
                  <rect x="620" y="140" width="6" height="4" rx="1" />
                  <rect x="635" y="148" width="6" height="4" rx="1" />
                  <rect x="620" y="165" width="6" height="4" rx="1" />
                  <rect x="670" y="150" width="6" height="4" rx="1" />
                  <rect x="685" y="165" width="6" height="4" rx="1" />
                  <rect x="735" y="170" width="5" height="4" rx="1" />
                  <rect x="775" y="175" width="5" height="4" rx="1" />
                </g>
              )}
            </g>
          )}

          {/* Drifting Stylized Clouds */}
          <g className="anim-cloud-slow" opacity={theme.cloudOpacity}>
            <path
              d="M140,85 Q160,65 190,70 Q220,55 250,75 Q275,80 270,105 L150,105 Q125,100 140,85 Z"
              fill={theme.cloudFill}
            />
            <path
              d="M580,75 Q600,55 630,60 Q660,45 685,65 Q710,70 705,90 L600,90 Q570,85 580,75 Z"
              fill={theme.cloudFill}
            />
          </g>
          <g className="anim-cloud-fast" opacity={theme.cloudOpacity * 0.75}>
            <path
              d="M340,105 Q360,88 385,92 Q410,80 435,98 Q450,105 445,120 L350,120 Q330,115 340,105 Z"
              fill={theme.cloudFill}
            />
          </g>

          {/* ========================================================
              2. THE FLOATING ISOMETRIC ISLAND DIORAMA (The "Chunk")
              ======================================================== */}
          {/* Island Floating Drop Shadow onto the Void */}
          <ellipse
            cx="460"
            cy="445"
            rx="320"
            ry="45"
            fill={theme.islandShadow}
            filter="url(#islandShadowBlur)"
          />

          {/* Island Group with gentle hover animation */}
          <g className="anim-island">
            {/* --- 3D Under-Cliff Strata (Cross-Section Soil & Bedrock) --- */}
            {/* Left Soil Face */}
            <polygon
              points="140,290 460,440 460,465 140,315"
              fill={theme.soilL}
            />
            {/* Right Soil Face */}
            <polygon
              points="460,440 780,290 780,315 460,465"
              fill={theme.soilR}
            />

            {/* Left Bedrock Strata (Deep geological layer) */}
            <polygon
              points="140,315 460,465 460,480 300,430 140,315"
              fill={theme.bedrockL}
            />
            {/* Right Bedrock Strata */}
            <polygon
              points="460,465 780,315 620,430 460,480"
              fill={theme.bedrockR}
            />
            {/* Bottom floating craggy keel */}
            <polygon
              points="300,430 460,480 460,490 380,470"
              fill="#0f172a"
              opacity="0.8"
            />
            <polygon
              points="460,480 620,430 540,470 460,490"
              fill="#020617"
              opacity="0.9"
            />

            {/* Overhanging Grass Sod Lip (Rich green overhang bevel) */}
            <polygon
              points="140,290 460,440 460,446 140,296"
              fill={theme.lawnSideL}
            />
            <polygon
              points="460,440 780,290 780,296 460,446"
              fill={theme.lawnSideR}
            />

            {/* --- Top Isometric Turf Surface (Diamond Island Plot) --- */}
            {/* Top vertex: (460, 140), Left: (140, 290), Right: (780, 290), Bottom: (460, 440) */}
            <polygon
              points="460,140 780,290 460,440 140,290"
              fill="url(#islandLawnGrad)"
            />

            {/* Isometric Lawn Grid Texture / Stripes */}
            {[
              "M220,252 L540,402",
              "M300,215 L620,365",
              "M380,178 L700,328",
            ].map((d, i) => (
              <path key={`mow-${i}`} d={d} stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
            ))}

            {/* --- Isometric Diagonal Road / Paved Access Driveway --- */}
            {/* Road coming from bottom-left (190, 315) across to (370, 400) */}
            <polygon
              points="140,290 280,355 410,295 270,230"
              fill={theme.roadFace}
            />
            {/* Concrete Curb edge */}
            <polygon
              points="280,355 410,295 413,296 283,357"
              fill={theme.curb}
            />
            {/* Road markings (dashed white isometric lane divider) */}
            <line x1="205" y1="260" x2="235" y2="274" stroke="#ffffff" strokeWidth="2" strokeDasharray="6,6" opacity="0.8" />
            <line x1="275" y1="292" x2="345" y2="325" stroke="#ffffff" strokeWidth="2" strokeDasharray="6,6" opacity="0.8" />

            {/* Modern Architectural Stone Paver Path to Front Entryway */}
            {[
              { x: 340, y: 320, w: 22, h: 11 },
              { x: 365, y: 308, w: 22, h: 11 },
              { x: 390, y: 296, w: 22, h: 11 },
              { x: 415, y: 284, w: 22, h: 11 },
            ].map((p, i) => (
              <polygon
                key={`paver-${i}`}
                points={`${p.x},${p.y} ${p.x + p.w},${p.y + p.h * 0.5} ${p.x},${p.y + p.h} ${p.x - p.w},${p.y + p.h * 0.5}`}
                fill="#e2e8f0"
                stroke="#94a3b8"
                strokeWidth="0.8"
                opacity={timeMode === 'night' ? 0.4 : 0.85}
              />
            ))}

            {/* ========================================================
                3. ARCHITECTURE PROGRESSION (Isometric 2.5D Buildings)
                ======================================================== */}
            {isRenting || !hasHome ? (
              /* =======================================================
                 TIER 1: CHIC MINIMALIST URBAN STUDIO LOFT (Starter)
                 ======================================================= */
              <g
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onMouseEnter={() => setHoveredElement('Urban Studio Loft: Lean starter pad with high mobility and low overhead.')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Building Ground Contact Shadow */}
                <polygon
                  points="390,320 630,210 670,230 430,340"
                  fill="black"
                  opacity={theme.shadowOpacity}
                />

                {/* --- Main 3-Storey Loft Volume --- */}
                {/* Center base vertex: (470, 310), Top: (470, 150) */}
                {/* Left Face (Shaded): Width 110 */}
                <polygon
                  points="360,255 470,310 470,160 360,105"
                  fill={theme.wallWhiteShade}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                {/* Right Face (Sunlit/Key lit): Width 140 */}
                <polygon
                  points="470,310 610,240 610,90 470,160"
                  fill={theme.wallWhite}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                {/* Roof Top Face (Flat modern terrace) */}
                <polygon
                  points="470,160 610,90 500,35 360,105"
                  fill={theme.roofMetal}
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Rooftop Parapet Perimeter Lip */}
                <polygon
                  points="470,160 610,90 610,85 470,155"
                  fill="#64748b"
                />
                <polygon
                  points="360,105 470,155 470,160 360,110"
                  fill="#475569"
                />

                {/* Rooftop HVAC Chiller Unit */}
                <polygon points="430,120 460,105 460,95 430,110" fill="#94a3b8" />
                <polygon points="460,105 485,118 485,108 460,95" fill="#cbd5e1" />
                <polygon points="430,110 460,95 485,108 455,123" fill="#e2e8f0" />
                {/* Satellite Receiver Dish */}
                <line x1="530" y1="85" x2="530" y2="70" stroke="#0f172a" strokeWidth="2" />
                <ellipse cx="530" cy="70" rx="8" ry="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" transform="rotate(-25 530 70)" />

                {/* --- Left Facade Details: Balconies & Glass Windows --- */}
                {/* 3rd Floor Left Window */}
                <polygon points="380,135 440,165 440,195 380,165" fill={theme.windowGlass} stroke="#334155" strokeWidth="1" />
                {timeMode !== 'day' && (
                  <polygon points="380,135 440,165 440,195 380,165" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}
                {/* Balcony Steel Railing */}
                <polygon points="375,155 445,190 445,198 375,163" fill="rgba(255,255,255,0.6)" stroke="#475569" strokeWidth="0.8" />

                {/* 2nd Floor Left Window */}
                <polygon points="380,185 440,215 440,245 380,215" fill={theme.windowGlass} stroke="#334155" strokeWidth="1" />
                {timeMode !== 'day' && (
                  <polygon points="380,185 440,215 440,245 380,215" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}

                {/* Ground Floor Chic Glass Entrance Lobby */}
                <polygon points="380,245 445,278 445,302 380,270" fill="url(#glassSheen)" stroke="#0f172a" strokeWidth="1.5" />
                {/* Glass Door Frame */}
                <line x1="412" y1="261" x2="412" y2="286" stroke="#0f172a" strokeWidth="1.5" />
                {/* Modern Cantilevered Entrance Canopy */}
                <polygon points="370,245 450,285 460,280 380,240" fill="#0f172a" />

                {/* --- Right Facade Details: Floor-to-Ceiling Panoramic Windows --- */}
                {/* 3rd Floor Right Window */}
                <polygon points="490,145 590,95 590,140 490,190" fill={theme.windowGlass} stroke="#334155" strokeWidth="1" />
                {timeMode !== 'day' && (
                  <polygon points="490,145 590,95 590,140 490,190" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}
                {/* Glass Reflection Streak */}
                <polygon points="505,145 530,132 530,170 505,182" fill="url(#glassSheen)" />

                {/* 2nd Floor Right Window */}
                <polygon points="490,195 590,145 590,190 490,240" fill={theme.windowGlass} stroke="#334155" strokeWidth="1" />
                {timeMode !== 'day' && (
                  <polygon points="490,195 590,145 590,190 490,240" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}

                {/* Ground Floor Teak Wood Cladding Accent */}
                <polygon points="490,245 590,195 590,245 490,295" fill="url(#teakSlatGrad)" stroke="#78350f" strokeWidth="1" />
                {/* Slats detail */}
                <line x1="515" y1="233" x2="515" y2="283" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <line x1="540" y1="220" x2="540" y2="270" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                <line x1="565" y1="207" x2="565" y2="257" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
              </g>
            ) : isVilla ? (
              /* =======================================================
                 TIER 4: ULTRA-LUXURY CANTILEVERED GLASS VILLA (Wealthy)
                 ======================================================= */
              <g
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onMouseEnter={() => setHoveredElement(`Modernist Villa: ₹${((primaryHome?.value || 9000000) / 100000).toFixed(0)}L · High architectural pedigree & infinity pool.`)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Villa Dramatic Drop Shadow */}
                <polygon
                  points="360,330 650,185 710,215 420,360"
                  fill="black"
                  opacity={theme.shadowOpacity}
                />

                {/* --- Ground Level Pavilion (Crisp White Stucco & Glass) --- */}
                {/* Base center: (490, 310) */}
                <polygon points="380,255 490,310 490,210 380,155" fill={theme.wallWhiteShade} />
                <polygon points="490,310 650,230 650,130 490,210" fill={theme.wallWhite} />

                {/* Floor-to-Ceiling Ground Glass Curtain Wall */}
                <polygon points="505,215 635,150 635,225 505,290" fill={theme.windowGlass} stroke="#334155" strokeWidth="1.2" />
                {timeMode !== 'day' && (
                  <polygon points="505,215 635,150 635,225 505,290" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}
                <line x1="550" y1="193" x2="550" y2="268" stroke="#1e293b" strokeWidth="1.5" />
                <line x1="595" y1="170" x2="595" y2="245" stroke="#1e293b" strokeWidth="1.5" />

                {/* --- Dramatic Upper Cantilever Volume (Floating Box) --- */}
                {/* Upper Left Shaded Face */}
                <polygon
                  points="350,180 470,240 470,140 350,80"
                  fill={theme.wallDarkShade}
                  stroke="#0f172a"
                  strokeWidth="1.2"
                />
                {/* Upper Right Sunlit Face (Charcoal Slate & Wood) */}
                <polygon
                  points="470,240 640,155 640,55 470,140"
                  fill={theme.wallDark}
                  stroke="#0f172a"
                  strokeWidth="1.2"
                />
                {/* Upper Cantilever Flat Roof Terrace */}
                <polygon
                  points="470,140 640,55 520,-5 350,80"
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Teak Wood Feature Siding on Upper Box */}
                <polygon points="360,170 420,200 420,130 360,100" fill="url(#teakSlatGrad)" opacity="0.9" />

                {/* Upper Master Suite Panoramic Glass Front */}
                <polygon points="490,140 625,72 625,135 490,202" fill={theme.windowGlass} stroke="#0f172a" strokeWidth="1.5" />
                {timeMode !== 'day' && (
                  <polygon points="490,140 625,72 625,135 490,202" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}
                {/* Chandelier Interior Light Bloom */}
                <circle cx="550" cy="140" r="5" fill="#fde047" opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />

                {/* Rooftop Garden Lounge Deck */}
                <polygon points="480,100 580,50 540,30 440,80" fill="url(#teakSlatGrad)" />
                {/* Rooftop Tempered Glass Balustrade */}
                <polygon points="475,135 635,55 635,45 475,125" fill="rgba(255,255,255,0.7)" stroke="#cbd5e1" strokeWidth="1" />
                {/* Rooftop Lounge Sunbed */}
                <polygon points="500,80 525,67 535,72 510,85" fill="#38bdf8" />

                {/* --- Sunken Infinity Edge Swimming Pool --- */}
                {/* Teak Pool Deck Border */}
                <polygon points="440,340 590,265 630,285 480,360" fill="url(#teakSlatGrad)" stroke="#78350f" strokeWidth="1" />
                {/* Pool Basin Cavity */}
                <polygon points="460,345 575,287 610,305 495,362" fill="#083344" />
                {/* Crystal Turquoise Pool Water */}
                <polygon points="462,347 573,291 608,307 497,363" fill="url(#isoPoolGrad)" className="anim-water" />
                {/* Night Underwater Pool Glow */}
                {timeMode === 'night' && (
                  <polygon
                    points="462,347 573,291 608,307 497,363"
                    fill="#22d3ee"
                    opacity="0.8"
                    filter="url(#softGlow)"
                  />
                )}
                {/* Sun Loungers by Pool */}
                <polygon points="435,325 450,317 458,321 443,329" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <polygon points="448,318 463,310 471,314 456,322" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                {/* Pool Parasol Umbrella */}
                <line x1="430" y1="315" x2="430" y2="280" stroke="#475569" strokeWidth="2" />
                <polygon points="430,280 410,290 430,295 450,290" fill="#f43f5e" />

                {/* Manicured Landscaping: Architectural Italian Cypress Trees */}
                <g transform="translate(640, 180)">
                  <polygon points="0,40 -8,15 0,-15 8,15" fill="#14532d" />
                  <polygon points="0,40 0,-15 8,15" fill="#16a34a" />
                  <rect x="-2" y="38" width="4" height="10" fill="#451a03" />
                </g>
                <g transform="translate(665, 195)">
                  <polygon points="0,35 -7,12 0,-10 7,12" fill="#14532d" />
                  <polygon points="0,35 0,-10 7,12" fill="#16a34a" />
                  <rect x="-2" y="33" width="4" height="8" fill="#451a03" />
                </g>
              </g>
            ) : (
              /* =======================================================
                 TIER 2 & 3: CONTEMPORARY SCANDINAVIAN TOWNHOUSE (Middle/Comfortable)
                 ======================================================= */
              <g
                className="cursor-pointer transition-transform hover:scale-[1.01]"
                onMouseEnter={() => setActiveTooltipHelper(`Owned Home: ₹${((primaryHome?.value || 4500000) / 100000).toFixed(0)}L · Detached modern property.`)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Ground Contact Shadow */}
                <polygon
                  points="370,320 630,190 680,215 420,345"
                  fill="black"
                  opacity={theme.shadowOpacity}
                />

                {/* --- House Main Volume --- */}
                {/* Left Shaded Face */}
                <polygon
                  points="360,250 480,310 480,180 360,120"
                  fill={theme.wallWhiteShade}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                {/* Right Sunlit Face */}
                <polygon
                  points="480,310 620,240 620,110 480,180"
                  fill={theme.wallWhite}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />

                {/* Pitched Modern Gable Roof */}
                {/* Gable triangle on Left Face: Peak at (420, 70) */}
                <polygon
                  points="360,120 420,70 480,180"
                  fill={theme.roofMetal}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                {/* Long Sloping Roof Plane to Right: Peak ridge (420, 70) -> (560, 0) */}
                <polygon
                  points="420,70 560,0 620,110 480,180"
                  fill={theme.wallDark}
                  stroke="#0f172a"
                  strokeWidth="1"
                />

                {/* Rooftop High-Efficiency Solar Panel Array */}
                <polygon
                  points="450,110 540,65 570,115 480,160"
                  fill="url(#solarGlassGrad)"
                  stroke="#60a5fa"
                  strokeWidth="1.2"
                />
                {/* Solar Cell Grid Lines */}
                <line x1="495" y1="87" x2="525" y2="137" stroke="#93c5fd" strokeWidth="0.8" opacity="0.6" />
                <line x1="465" y1="135" x2="555" y2="90" stroke="#93c5fd" strokeWidth="0.8" opacity="0.6" />

                {/* Front Cedar Wood Siding Bay */}
                <polygon points="495,200 560,167 560,240 495,272" fill="url(#teakSlatGrad)" stroke="#78350f" strokeWidth="1" />

                {/* Large Living Room Floor-to-Ceiling Window */}
                <polygon points="505,205 550,182 550,235 505,258" fill={theme.windowGlass} stroke="#1e293b" strokeWidth="1.5" />
                {timeMode !== 'day' && (
                  <polygon points="505,205 550,182 550,235 505,258" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}

                {/* Left Side Picture Window */}
                <polygon points="380,195 440,225 440,265 380,235" fill={theme.windowGlass} stroke="#334155" strokeWidth="1.2" />
                {timeMode !== 'day' && (
                  <polygon points="380,195 440,225 440,265 380,235" fill={theme.windowGlow} opacity={theme.windowGlowOpacity} filter="url(#windowBloomFilter)" />
                )}

                {/* Front Entrance Porch & Modern Door */}
                <polygon points="575,185 615,165 615,225 575,245" fill="#451a03" stroke="#78350f" strokeWidth="1" />
                <line x1="605" y1="195" x2="605" y2="215" stroke="#fef08a" strokeWidth="1.5" />
                {/* Porch Sconce Light */}
                <circle cx="570" cy="180" r="2.5" fill="#fef08a" />
                {timeMode !== 'day' && (
                  <ellipse cx="570" cy="180" rx="14" ry="14" fill="#fde047" opacity={theme.lampGlow} filter="url(#lampGlowFilter)" />
                )}

                {/* Renovation Badge if Home Needs Repair */}
                {homeNeedsRenovation && (
                  <g transform="translate(450, 140)">
                    <rect x="-45" y="-18" width="90" height="20" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="0" y="-4" fill="#b91c1c" fontSize="8" fontWeight="800" textAnchor="middle">
                      ⚠️ REPAIR NEEDED
                    </text>
                  </g>
                )}

                {/* Flowering Garden Landscaping */}
                <g transform="translate(635, 230)">
                  <circle cx="0" cy="0" r="14" fill="#15803d" />
                  <circle cx="-5" cy="-4" r="10" fill="#22c55e" />
                  <circle cx="-2" cy="-6" r="3" fill="#f472b6" />
                  <circle cx="4" cy="2" r="3.5" fill="#fb7185" />
                  <circle cx="-6" cy="4" r="3" fill="#fbcfe8" />
                </g>
              </g>
            )}

            {/* Second Property / Rental Investment Asset (If owned) */}
            {hasSecondHome && (
              <g
                transform="translate(180, -35)"
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                onMouseEnter={() => setHoveredElement('Rental Asset: Generating steady monthly passive cash flow!')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Annex Building Left & Right Faces */}
                <polygon points="490,195 550,225 550,150 490,120" fill="#312e81" stroke="#4338ca" strokeWidth="1" />
                <polygon points="550,225 610,195 610,120 550,150" fill="#1e1b4b" stroke="#4338ca" strokeWidth="1" />
                <polygon points="490,120 550,150 610,120 550,90" fill="#4338ca" stroke="#6366f1" strokeWidth="1" />
                {/* Illuminated Rental Badge */}
                <polygon points="510,165 540,180 540,165 510,150" fill="#4f46e5" />
                <polygon points="560,180 590,165 590,150 560,165" fill="#fef08a" opacity={timeMode === 'night' ? 0.9 : 0.6} />
              </g>
            )}

            {/* ========================================================
                4. ISOMETRIC VEHICLE (Progression: E-Bike -> EV Crossover -> Cyber Hypercar)
                ======================================================== */}
            {carsOwned.length === 0 ? (
              /* --- NO CAR: HIGH-TECH COMMUTER E-BIKE / E-SCOOTER --- */
              <g
                transform="translate(260, 275)"
                className="cursor-pointer transition-transform hover:scale-[1.05]"
                onMouseEnter={() => setHoveredElement('Commuter E-Bike: Zero fuel costs, zero EMIs, low maintenance freedom.')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Ground Shadow */}
                <ellipse cx="25" cy="28" rx="26" ry="6" fill="black" opacity={theme.shadowOpacity} />
                {/* Rear Wheel (Isometric ellipse) */}
                <ellipse cx="8" cy="20" rx="9" ry="12" fill="none" stroke="#0f172a" strokeWidth="3" transform="rotate(-15 8 20)" />
                <circle cx="8" cy="20" r="3" fill="#94a3b8" />
                {/* Front Wheel */}
                <ellipse cx="44" cy="38" rx="9" ry="12" fill="none" stroke="#0f172a" strokeWidth="3" transform="rotate(-15 44 38)" />
                <circle cx="44" cy="38" r="3" fill="#94a3b8" />
                {/* Modern Aero Frame (Vibrant Cyan) */}
                <path d="M8,20 L24,28 L44,38 L34,16 Z" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinejoin="round" />
                <line x1="24" y1="28" x2="20" y2="12" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
                {/* Saddle */}
                <line x1="14" y1="11" x2="24" y2="13" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                {/* Steering & Handlebars */}
                <line x1="44" y1="38" x2="38" y2="14" stroke="#0f172a" strokeWidth="2.5" />
                <line x1="32" y1="12" x2="44" y2="16" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                {/* LED Headlight */}
                <circle cx="41" cy="18" r="2.5" fill="#38bdf8" />
              </g>
            ) : (
              /* --- OWNED CAR: SLEEK ISOMETRIC ELECTRIC VEHICLE --- */
              <g
                transform="translate(235, 260)"
                className="cursor-pointer transition-transform hover:scale-[1.02]"
                onMouseEnter={() => setHoveredElement(`${carStatusLabel}: High performance mobility & safety.`)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {/* Vehicle Contact Shadow */}
                <polygon
                  points="20,70 125,122 170,100 65,48"
                  fill="black"
                  opacity={theme.shadowOpacity}
                />

                {/* --- 2.5D Isometric Car Body Chassis --- */}
                {/* Left Side Face */}
                <polygon
                  points="25,58 120,105 120,85 25,38"
                  fill="url(#carGlossGrad)"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                {/* Front Nose Face */}
                <polygon
                  points="120,105 160,85 160,68 120,85"
                  fill="url(#carGlossGrad)"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                {/* Top Hood & Aerodynamic Cabin Roof */}
                <polygon
                  points="25,38 120,85 160,68 65,22"
                  fill="url(#carGlossGrad)"
                  stroke="#334155"
                  strokeWidth="1"
                />

                {/* Panoramic Glass Cabin / Windshield */}
                <polygon
                  points="50,38 105,65 125,55 70,28"
                  fill="#38bdf8"
                  opacity="0.8"
                  stroke="#0f172a"
                  strokeWidth="1"
                />
                <polygon
                  points="105,65 125,55 125,65 105,75"
                  fill="#0284c7"
                  opacity="0.9"
                />

                {/* Front Continuous LED Lightbar */}
                <line x1="122" y1="88" x2="158" y2="70" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
                {/* Headlight Beams Projected Forward onto Driveway at Night */}
                {timeMode !== 'day' && (
                  <polygon
                    points="122,88 158,70 240,110 180,140"
                    fill="#fef08a"
                    opacity="0.3"
                    filter="url(#lampGlowFilter)"
                  />
                )}

                {/* Rear Sleek Red LED Tail Strip */}
                <line x1="24" y1="45" x2="28" y2="52" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

                {/* 3D Isometric Alloy Wheels */}
                {/* Front Wheel */}
                <g transform="translate(108, 92)">
                  <ellipse cx="0" cy="0" rx="9" ry="14" fill="#0f172a" />
                  <ellipse cx="0" cy="0" rx="6" ry="10" fill="#475569" />
                  <circle cx="0" cy="0" r="3" fill="#e2e8f0" />
                </g>
                {/* Rear Wheel */}
                <g transform="translate(48, 62)">
                  <ellipse cx="0" cy="0" rx="9" ry="14" fill="#0f172a" />
                  <ellipse cx="0" cy="0" rx="6" ry="10" fill="#475569" />
                  <circle cx="0" cy="0" r="3" fill="#e2e8f0" />
                </g>
              </g>
            )}

            {/* ========================================================
                5. LIVING CHARACTERS & PETS (Modern Isometric Vector Avatars)
                ======================================================== */}
            <g
              transform="translate(375, 275)"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredElement(married ? 'You & Your Partner: Building wealth and a family legacy.' : 'Your Avatar: On the path to financial independence.')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              {/* Contact shadow beneath feet */}
              <ellipse cx="20" cy="48" rx={married ? "24" : "14"} ry="5" fill="black" opacity={theme.shadowOpacity} />

              {/* --- PLAYER AVATAR & ACTIVITY SCENE --- */}
              <g transform="translate(8, 0)">
                {/* Dynamic Aging Hairstyle with progressive silver/gray streaks */}
                {currentDay >= 3650 ? (
                  /* Mature 38-42 salt & pepper hair */
                  <polygon points="12,4 18,2 24,5 22,12 10,12" fill="#64748b" />
                ) : currentDay >= 2190 ? (
                  /* Mid 32-37 hair with silver accents */
                  <polygon points="12,4 18,2 24,5 22,12 10,12" fill="#475569" />
                ) : (
                  /* Youthful 22-31 dark hair */
                  <polygon points="12,4 18,2 24,5 22,12 10,12" fill="#1e293b" />
                )}

                {/* Head with dynamic age lines */}
                <circle cx="16" cy="12" r="7" fill="#fcd9b6" />
                <circle cx="14" cy="11" r="0.9" fill="#0f172a" />
                <circle cx="18" cy="11" r="0.9" fill="#0f172a" />
                {currentDay >= 4380 && (
                  /* Subtle mature smile lines for 36+ */
                  <path d="M12,14 Q14,16 13,17 M20,14 Q18,16 19,17" stroke="#d4a373" strokeWidth="0.6" fill="none" />
                )}

                {/* Activity State: Working on Laptop vs Idle at Home */}
                {incomes && incomes.some(i => i.type === 'job') ? (
                  /* === WORKING STATE (Corporate or Freelance on Laptop) === */
                  <g>
                    {/* Upper Body / Outfit */}
                    {tier === 'wealthy' ? (
                      <polygon points="10,18 22,18 24,36 8,36" fill="#0f172a" />
                    ) : tier === 'comfortable' ? (
                      <polygon points="10,18 22,18 23,35 9,35" fill="#0369a1" />
                    ) : (
                      <polygon points="10,18 22,18 23,34 9,34" fill={tier === 'middle' ? '#2563eb' : '#475569'} />
                    )}
                    <polygon points="14,18 16,22 18,18" fill="#ffffff" />

                    {/* Desk & Workstation Prop */}
                    <polygon points="-6,32 38,32 44,40 -12,40" fill="#334155" opacity="0.9" />
                    <line x1="-8" y1="40" x2="-8" y2="48" stroke="#1e293b" strokeWidth="2" />
                    <line x1="40" y1="40" x2="40" y2="48" stroke="#1e293b" strokeWidth="2" />

                    {/* Open Glowing Laptop */}
                    <polygon points="10,34 22,34 24,37 8,37" fill="#64748b" />
                    <polygon points="10,26 22,26 22,34 10,34" fill="#38bdf8" />
                    <rect x="11" y="27" width="10" height="6" fill="#f0f9ff" opacity="0.85" />
                    {/* Typing arms animation */}
                    <path d="M10,21 Q14,29 12,35" stroke="#fcd9b6" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                    <path d="M22,21 Q18,29 20,35" stroke="#fcd9b6" strokeWidth="2.4" fill="none" strokeLinecap="round" />

                    {/* Steaming Coffee Mug */}
                    <rect x="28" y="32" width="4" height="5" rx="1" fill="#f59e0b" />
                    <path d="M30,30 Q31,28 30,26" stroke="#e2e8f0" strokeWidth="0.8" fill="none" opacity="0.7" />

                    {/* Live Activity Badge */}
                    <g transform="translate(16, -6)">
                      <rect x="-24" y="-8" width="48" height="9" rx="3" fill="#0f172a" opacity="0.85" />
                      <text x="0" y="-2" textAnchor="middle" fill="#38bdf8" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
                        {incomes.some(i => i.id?.includes('gig')) ? '💻 FREELANCING' : '💼 ON LAPTOP'}
                      </text>
                    </g>
                  </g>
                ) : (
                  /* === IDLE STATE (Unemployed / Lounging at Home) === */
                  <g>
                    {/* Relaxed Lounger / Patio Chair */}
                    <path d="M6,26 Q4,38 2,46 L26,46 Q24,38 22,26 Z" fill="#94a3b8" opacity="0.4" />
                    
                    {/* Casual Streetwear Hoodie */}
                    <polygon points="10,18 22,18 23,35 9,35" fill="#64748b" />
                    
                    {/* Relaxed Arms resting on lap */}
                    <line x1="10" y1="20" x2="13" y2="30" stroke="#fcd9b6" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="22" y1="20" x2="19" y2="30" stroke="#fcd9b6" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Smartphone in hand while idle */}
                    <rect x="14" y="29" width="4" height="6" rx="0.8" fill="#38bdf8" />

                    {/* Trousers & Sneakers */}
                    <line x1="13" y1="35" x2="11" y2="46" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="19" y1="35" x2="21" y2="46" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
                    <rect x="8" y="44" width="6" height="3" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                    <rect x="19" y="44" width="6" height="3" rx="1.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />

                    {/* Idle Status Badge */}
                    <g transform="translate(16, -6)">
                      <rect x="-24" y="-8" width="48" height="9" rx="3" fill="#0f172a" opacity="0.8" />
                      <text x="0" y="-2" textAnchor="middle" fill="#f59e0b" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
                        🏖️ AT HOME / IDLE
                      </text>
                    </g>
                  </g>
                )}
              </g>

              {/* --- PARTNER AVATAR (Rendered side-by-side if married) --- */}
              {married && (
                <g transform="translate(28, 2)">
                  {/* Flowing Styled Hair */}
                  <path d="M8,10 Q14,2 20,6 Q24,14 20,24 Q16,20 10,20 Z" fill="#78350f" />
                  {/* Head */}
                  <circle cx="15" cy="12" r="6.5" fill="#fde2cb" />
                  <circle cx="13" cy="12" r="0.8" fill="#0f172a" />
                  <circle cx="17" cy="12" r="0.8" fill="#0f172a" />

                  {/* Chic Outfit */}
                  <polygon points="10,18 20,18 22,36 8,36" fill="#ec4899" />
                  {/* Arms */}
                  <line x1="10" y1="20" x2="7" y2="28" stroke="#fde2cb" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20" y1="20" x2="23" y2="28" stroke="#fde2cb" strokeWidth="2" strokeLinecap="round" />

                  {/* Slacks & Shoes */}
                  <line x1="12" y1="36" x2="12" y2="45" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  <line x1="18" y1="36" x2="18" y2="45" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
                  <rect x="9" y="43" width="5" height="3" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />
                  <rect x="16" y="43" width="5" height="3" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.6" />

                  {/* Floating Love Heart */}
                  <path
                    d="M-2,6 C-2,3 -6,3 -6,6 C-6,9 -2,11 -2,13 C-2,11 2,9 2,6 C2,3 -2,3 -2,6 Z"
                    fill="#f43f5e"
                    opacity="0.9"
                  />
                </g>
              )}

              {/* --- PLAYFUL PET COMPANION (Golden Retriever if comfortable or wealthy) --- */}
              {(tier === 'comfortable' || tier === 'wealthy') && (
                <g transform="translate(-25, 20)">
                  {/* Dog Body */}
                  <ellipse cx="14" cy="14" rx="10" ry="7" fill="#f59e0b" />
                  {/* Head */}
                  <circle cx="23" cy="9" r="5.5" fill="#f59e0b" />
                  <circle cx="25" cy="8" r="0.9" fill="#0f172a" />
                  <ellipse cx="27" cy="11" rx="2" ry="1.5" fill="#b45309" />
                  <ellipse cx="20" cy="9" rx="2" ry="4" fill="#b45309" />
                  {/* Legs */}
                  <line x1="9" y1="17" x2="8" y2="24" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="18" y1="17" x2="18" y2="24" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Wagging Tail */}
                  <path d="M5,12 Q0,8 1,3" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" className="anim-tail" />
                  {/* Red Toy Ball */}
                  <circle cx="32" cy="22" r="3" fill="#ef4444" />
                </g>
              )}
            </g>

            {/* ========================================================
                6. MODERN SOLAR STREET FURNITURE & AMBIENT BOLLARDS
                ======================================================== */}
            {/* Front Left Solar Bollard Lamp */}
            <g transform="translate(190, 310)">
              <polygon points="0,0 5,2 5,16 0,14" fill="#334155" />
              <polygon points="5,2 10,0 10,14 5,16" fill="#1e293b" />
              <polygon points="0,0 5,2 10,0 5,-2" fill="#fef08a" />
              {timeMode !== 'day' && (
                <ellipse cx="5" cy="14" rx="24" ry="10" fill="#fef08a" opacity={theme.lampGlow} filter="url(#lampGlowFilter)" />
              )}
            </g>

            {/* Front Right Solar Bollard Lamp */}
            <g transform="translate(420, 420)">
              <polygon points="0,0 5,2 5,16 0,14" fill="#334155" />
              <polygon points="5,2 10,0 10,14 5,16" fill="#1e293b" />
              <polygon points="0,0 5,2 10,0 5,-2" fill="#fef08a" />
              {timeMode !== 'day' && (
                <ellipse cx="5" cy="14" rx="24" ry="10" fill="#fef08a" opacity={theme.lampGlow} filter="url(#lampGlowFilter)" />
              )}
            </g>
          </g>
        </svg>

        {/* Dynamic Interactive Hotspot Popover Tooltip */}
        {hoveredElement && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-[11px] font-semibold px-4 py-2 rounded-full shadow-xl backdrop-blur-md pointer-events-none transition-all duration-200 flex items-center space-x-2 z-10 border border-white/15">
            <span className="text-amber-400">✨</span>
            <span>{hoveredElement}</span>
          </div>
        )}
      </div>

      {/* Modern 2026 Metric Snapshot Footer */}
      <div className="grid grid-cols-3 divide-x divide-stone-100 bg-stone-50/70 text-center py-2.5 px-2 border-t border-stone-100">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Property</p>
          <p className="text-xs font-black text-text-primary truncate px-1">{homeStatusLabel}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Transit</p>
          <p className="text-xs font-black text-text-primary truncate px-1">{carStatusLabel}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Household</p>
          <p className="text-xs font-black text-text-primary truncate px-1">
            {married ? 'Couple + Partner' : 'Solo Professional'}
          </p>
        </div>
      </div>
    </div>
  );

  function setActiveTooltipHelper(msg) {
    setHoveredElement(msg);
  }
}
