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
  const [activeTooltip, setActiveTooltip] = useState(null);

  const tier = getLifestyleTier(incomes, businessIncome, homesOwned, carsOwned);
  const cityTier = player?.cityTier || 2;
  const isRenting = player?.isRenting ?? true;
  const hasHome = homesOwned.length > 0;
  const hasSecondHome = homesOwned.length >= 2;
  const isVilla = hasHome && (homesOwned[0]?.value || 0) > 8000000;
  const primaryHome = homesOwned[0];
  const primaryCar = carsOwned[0];

  const tierMeta = {
    starter: {
      label: 'Early Career Hustle',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      tagline: 'Building the foundation · Lean & focused',
      color: '#64748b',
    },
    middle: {
      label: 'Rising Professional',
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      tagline: 'Steady growth & financial momentum',
      color: '#0284c7',
    },
    comfortable: {
      label: 'Established Comfort',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tagline: 'Homeowner · Secure surplus & freedom',
      color: '#059669',
    },
    wealthy: {
      label: 'High Net-Worth Estate',
      badge: 'bg-amber-50 text-amber-800 border-amber-300',
      tagline: 'Luxury living · Passive income & multi-assets',
      color: '#d97706',
    },
  };

  const cityNames = {
    1: 'Tier 1 Mega-City',
    2: 'Tier 2 Metro Hub',
    3: 'Tier 3 Scenic Valley',
  };

  const homeStatusLabel = isRenting || !hasHome
    ? 'Urban Rental Studio'
    : isVilla
    ? 'Modernist Luxury Villa'
    : hasSecondHome
    ? 'Townhouse + Investment Asset'
    : 'Contemporary Townhouse';

  const carStatusLabel = carsOwned.length > 0
    ? (tier === 'wealthy' ? 'Luxury Performance EV' : 'Smart Electric Crossover')
    : 'Urban Commuter E-Bike';

  // Palette settings per time of day
  const skyThemes = {
    day: {
      skyTop: '#60a5fa',
      skyMid: '#93c5fd',
      skyBot: '#e0f2fe',
      sun: '#fde047',
      sunGlow: 'rgba(254, 240, 138, 0.45)',
      sunInner: '#fef08a',
      groundLawn1: '#4ade80',
      groundLawn2: '#22c55e',
      groundDriveway: '#e2e8f0',
      pavementTone: '#cbd5e1',
      hillFar: '#93c5fd',
      hillMid: '#86efac',
      buildingLight: '#ffffff',
      windowGlow: '#fef3c7',
      windowOpacity: 0.5,
      lampGlowOpacity: 0,
      shadowOpacity: 0.28,
    },
    golden: {
      skyTop: '#fb7185',
      skyMid: '#fdba74',
      skyBot: '#fef3c7',
      sun: '#f97316',
      sunGlow: 'rgba(251, 146, 60, 0.5)',
      sunInner: '#fdba74',
      groundLawn1: '#65a30d',
      groundLawn2: '#4d7c0f',
      groundDriveway: '#e5e5e5',
      pavementTone: '#d4d4d4',
      hillFar: '#f472b6',
      hillMid: '#ca8a04',
      buildingLight: '#fff7ed',
      windowGlow: '#fde047',
      windowOpacity: 0.85,
      lampGlowOpacity: 0.45,
      shadowOpacity: 0.4,
    },
    night: {
      skyTop: '#090d16',
      skyMid: '#111827',
      skyBot: '#1e1b4b',
      sun: '#f1f5f9',
      sunGlow: 'rgba(224, 231, 255, 0.25)',
      sunInner: '#ffffff',
      groundLawn1: '#14532d',
      groundLawn2: '#052e16',
      groundDriveway: '#334155',
      pavementTone: '#1e293b',
      hillFar: '#1e1b4b',
      hillMid: '#064e3b',
      buildingLight: '#1e293b',
      windowGlow: '#fef08a',
      windowOpacity: 0.98,
      lampGlowOpacity: 0.85,
      shadowOpacity: 0.6,
    },
  };

  const theme = skyThemes[timeMode];

  return (
    <div className="mx-4 my-3 rounded-2xl overflow-hidden shadow-sm border border-stone-200/80 bg-white select-none transition-all">
      {/* 2026 Sleek Glassmorphic Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-gradient-to-r from-stone-50 via-white to-stone-50 border-b border-stone-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-text-primary">
              Lifestyle Scene
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierMeta[tier].badge}`}>
            {tierMeta[tier].label}
          </span>
        </div>

        {/* Time of Day & Interactive Controls */}
        <div className="flex items-center space-x-1.5 text-[10px]">
          <span className="text-text-muted hidden sm:inline mr-1">{cityNames[cityTier]}</span>
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100/80 p-0.5">
            <button
              onClick={() => setTimeMode('day')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${
                timeMode === 'day' ? 'bg-white shadow-xs text-sky-700 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Daylight View"
            >
              ☀️ Day
            </button>
            <button
              onClick={() => setTimeMode('golden')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${
                timeMode === 'golden' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Golden Hour"
            >
              🌅 Golden
            </button>
            <button
              onClick={() => setTimeMode('night')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${
                timeMode === 'night' ? 'bg-white shadow-xs text-indigo-900 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Night Lights"
            >
              🌙 Night
            </button>
          </div>
        </div>
      </div>

      {/* Main 2D Visual Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-900 group">
        <svg
          viewBox="0 0 800 360"
          className="w-full h-auto block"
          style={{ minHeight: '190px', maxHeight: '380px' }}
          preserveAspectRatio="xMidYMid slice"
          aria-label="Interactive 2D Lifestyle Scene"
        >
          <defs>
            {/* Embedded CSS Animations for dynamic living scene */}
            <style>{`
              @keyframes cloudDriftSlow {
                0% { transform: translateX(0px); }
                50% { transform: translateX(35px); }
                100% { transform: translateX(0px); }
              }
              @keyframes cloudDriftFast {
                0% { transform: translateX(0px); }
                50% { transform: translateX(-28px); }
                100% { transform: translateX(0px); }
              }
              @keyframes avatarFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-2.5px); }
              }
              @keyframes beaconPulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
              }
              @keyframes waterShimmer {
                0%, 100% { opacity: 0.45; transform: scaleX(1); }
                50% { opacity: 0.85; transform: scaleX(1.05); }
              }
              @keyframes dogTail {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(20deg); }
              }
              .anim-cloud-slow { animation: cloudDriftSlow 18s ease-in-out infinite; }
              .anim-cloud-fast { animation: cloudDriftFast 12s ease-in-out infinite; }
              .anim-avatar { animation: avatarFloat 3.6s ease-in-out infinite; }
              .anim-beacon { animation: beaconPulse 2.2s ease-in-out infinite; }
              .anim-water { animation: waterShimmer 3s ease-in-out infinite; }
              .anim-tail { transform-origin: 396px 290px; animation: dogTail 0.8s ease-in-out infinite; }
            `}</style>

            {/* Sky Gradients */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.skyTop} />
              <stop offset="55%" stopColor={theme.skyMid} />
              <stop offset="100%" stopColor={theme.skyBot} />
            </linearGradient>

            {/* Lawn Gradients */}
            <linearGradient id="lawnGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.groundLawn1} />
              <stop offset="100%" stopColor={theme.groundLawn2} />
            </linearGradient>

            {/* Ground / Patio / Road */}
            <linearGradient id="pavementGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={theme.groundDriveway} />
              <stop offset="50%" stopColor={theme.pavementTone} />
              <stop offset="100%" stopColor={theme.groundDriveway} />
            </linearGradient>

            {/* Glass Facade Reflective Gradient */}
            <linearGradient id="glassReflect" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
              <stop offset="40%" stopColor="rgba(186,230,253,0.4)" />
              <stop offset="100%" stopColor="rgba(125,211,252,0.15)" />
            </linearGradient>

            {/* Warm Luxury Teak Wood Grain */}
            <linearGradient id="teakWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Modern Charcoal Cladding */}
            <linearGradient id="charcoalPanel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Pool Turquoise Gradient */}
            <linearGradient id="poolGrad" x1="0" y1="0" x2="1" y2="0.8">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Car Paint Gradient */}
            <linearGradient id="carPaint" x1="0" y1="0" x2="1" y2="0.5">
              {tier === 'wealthy' ? (
                <>
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="45%" stopColor="#1e293b" />
                  <stop offset="60%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="45%" stopColor="#38bdf8" />
                  <stop offset="70%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#075985" />
                </>
              )}
            </linearGradient>

            {/* Filters */}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity={theme.shadowOpacity} />
            </filter>
            <filter id="groundDrop" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id="lampGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            <filter id="windowBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* 1. Dynamic Sky Base */}
          <rect width="800" height="360" fill="url(#skyGrad)" />

          {/* 2. Celestial Body (Sun / Moon) */}
          <g transform="translate(680, 65)">
            <circle cx="0" cy="0" r="48" fill={theme.sunGlow} />
            <circle cx="0" cy="0" r="32" fill={theme.sunGlow} />
            <circle cx="0" cy="0" r="20" fill={theme.sunInner} />
            {timeMode === 'night' && (
              <circle cx="6" cy="-6" r="16" fill={theme.skyTop} opacity="0.9" />
            )}
          </g>

          {/* 3. Drifting Fluffy Clouds */}
          <g className="anim-cloud-slow" opacity={timeMode === 'night' ? 0.22 : 0.85}>
            {/* Cloud 1 */}
            <path
              d="M120,70 Q135,45 165,50 Q195,40 220,60 Q245,65 240,85 Q235,95 210,95 L130,95 Q110,90 120,70 Z"
              fill="#ffffff"
              opacity="0.9"
            />
            {/* Cloud 2 */}
            <path
              d="M480,50 Q500,30 530,35 Q560,25 580,45 Q605,50 600,70 L500,70 Q475,65 480,50 Z"
              fill="#ffffff"
              opacity="0.75"
            />
          </g>
          <g className="anim-cloud-fast" opacity={timeMode === 'night' ? 0.15 : 0.65}>
            <path
              d="M320,85 Q335,68 360,72 Q385,62 405,80 Q420,84 415,98 L330,98 Q315,94 320,85 Z"
              fill="#ffffff"
              opacity="0.8"
            />
          </g>

          {/* 4. Distant City Skyline & Mountains */}
          {cityTier === 3 ? (
            /* Scenic Valley Hills for Tier 3 */
            <g>
              <path
                d="M-50,220 Q120,130 320,190 Q520,110 850,210 L850,300 L-50,300 Z"
                fill={theme.hillFar}
                opacity="0.45"
              />
              <path
                d="M-20,240 Q180,180 440,230 Q650,170 820,245 L820,300 L-20,300 Z"
                fill={theme.hillMid}
                opacity="0.55"
              />
            </g>
          ) : (
            /* Modern City Skyline for Tier 1 & 2 */
            <g opacity={timeMode === 'night' ? 0.75 : 0.6}>
              {/* Distant Towers Layer */}
              <rect x="420" y="110" width="38" height="150" fill={timeMode === 'night' ? '#1e293b' : '#94a3b8'} rx="3" />
              <rect x="470" y="85" width="44" height="175" fill={timeMode === 'night' ? '#0f172a' : '#64748b'} rx="3" />
              {/* Tower Antenna with Pulsing Beacon */}
              <line x1="492" y1="85" x2="492" y2="52" stroke="#ef4444" strokeWidth="2" />
              <circle cx="492" cy="52" r="3" fill="#ef4444" className="anim-beacon" />

              <rect x="525" y="125" width="34" height="135" fill={timeMode === 'night' ? '#1e293b' : '#94a3b8'} rx="3" />
              <rect x="570" y="95" width="50" height="165" fill={timeMode === 'night' ? '#0f172a' : '#64748b'} rx="3" />
              <rect x="630" y="130" width="42" height="130" fill={timeMode === 'night' ? '#1e293b' : '#94a3b8'} rx="3" />
              <rect x="685" y="105" width="48" height="155" fill={timeMode === 'night' ? '#0f172a' : '#64748b'} rx="4" />

              {/* Glowing Skyline Windows */}
              {[
                { x: 476, y: 95 }, { x: 486, y: 95 }, { x: 498, y: 95 },
                { x: 476, y: 110 }, { x: 498, y: 110 },
                { x: 486, y: 125 }, { x: 476, y: 140 },
                { x: 578, y: 108 }, { x: 592, y: 108 }, { x: 606, y: 108 },
                { x: 578, y: 124 }, { x: 606, y: 124 },
                { x: 692, y: 118 }, { x: 708, y: 118 }, { x: 720, y: 118 },
                { x: 692, y: 135 }, { x: 720, y: 135 },
              ].map((w, i) => (
                <rect
                  key={`skywin-${i}`}
                  x={w.x}
                  y={w.y}
                  width="5"
                  height="7"
                  rx="1"
                  fill={theme.windowGlow}
                  opacity={timeMode === 'night' ? 0.95 : 0.45}
                />
              ))}
            </g>
          )}

          {/* 5. Ground Terraces, Lawn & Modern Paver Driveway */}
          <g>
            {/* Back Lawn Slope */}
            <path
              d="M0,235 Q250,225 500,238 Q680,245 800,235 L800,360 L0,360 Z"
              fill="url(#lawnGrad)"
            />

            {/* Contemporary Concrete Pavement / Sidewalk Strip */}
            <path
              d="M0,285 L800,285 L800,360 L0,360 Z"
              fill="url(#pavementGrad)"
            />

            {/* Pavement Joint Lines (Modern Architectural Grid) */}
            {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800].map(x => (
              <line
                key={`pave-${x}`}
                x1={x}
                y1="285"
                x2={x - 25}
                y2="360"
                stroke="rgba(0,0,0,0.07)"
                strokeWidth="1.5"
              />
            ))}
            <line x1="0" y1="285" x2="800" y2="285" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          </g>

          {/* 6. PRIMARY ARCHITECTURE (Home Visual Progression) */}
          {isRenting || !hasHome ? (
            /* =========================================================
               TIER A: CHIC URBAN APARTMENT BUILDING (Renting / Starter)
               ========================================================= */
            <g
              filter="url(#softShadow)"
              className="cursor-pointer transition-transform hover:scale-[1.005]"
              onMouseEnter={() => setActiveTooltip('Urban Apartment: Modern rental living with low maintenance overhead.')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Building Base Shadow */}
              <ellipse cx="200" cy="285" rx="145" ry="12" fill="black" opacity={theme.shadowOpacity} filter="url(#groundDrop)" />

              {/* Main Structural Block */}
              <rect x="65" y="110" width="260" height="175" rx="10" fill={theme.buildingLight} stroke="#cbd5e1" strokeWidth="2" />
              {/* Charcoal Architectural Trim */}
              <rect x="65" y="110" width="260" height="12" rx="4" fill="url(#charcoalPanel)" />
              {/* Vertical Timber Slat Accent Panel */}
              <rect x="235" y="122" width="60" height="163" fill="url(#teakWood)" opacity="0.9" />

              {/* Modern Building Signage */}
              <rect x="85" y="96" width="90" height="18" rx="4" fill="#0f172a" />
              <text x="130" y="108" fill="#f8fafc" fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="1.5">
                URBAN RESIDENCES
              </text>

              {/* Floor 3 Balcony & Floor-to-ceiling Glass */}
              <g transform="translate(85, 130)">
                <rect x="0" y="0" width="55" height="38" rx="3" fill="#0f172a" />
                <rect x="2" y="2" width="51" height="34" rx="2" fill={theme.windowGlow} opacity={theme.windowOpacity} />
                <rect x="2" y="2" width="51" height="34" rx="2" fill="url(#glassReflect)" />
                {/* Indoor Pendant Light Silhouette */}
                <circle cx="28" cy="10" r="3" fill="#eab308" />
                <line x1="28" y1="2" x2="28" y2="8" stroke="#0f172a" strokeWidth="1" />
                {/* Balcony Railing with Frosted Glass */}
                <rect x="-4" y="24" width="63" height="15" rx="2" fill="rgba(255,255,255,0.7)" stroke="#64748b" strokeWidth="1.2" />
                {/* Potted Plant on Balcony */}
                <circle cx="5" cy="22" r="5" fill="#22c55e" />
                <rect x="3" y="24" width="4" height="6" fill="#78350f" rx="1" />
              </g>

              {/* Floor 2 Balcony & Floor-to-ceiling Glass */}
              <g transform="translate(85, 180)">
                <rect x="0" y="0" width="55" height="38" rx="3" fill="#0f172a" />
                <rect x="2" y="2" width="51" height="34" rx="2" fill={theme.windowGlow} opacity={theme.windowOpacity} />
                <rect x="2" y="2" width="51" height="34" rx="2" fill="url(#glassReflect)" />
                {/* Balcony Railing */}
                <rect x="-4" y="24" width="63" height="15" rx="2" fill="rgba(255,255,255,0.7)" stroke="#64748b" strokeWidth="1.2" />
                {/* Small potted succulent */}
                <circle cx="50" cy="23" r="4" fill="#10b981" />
              </g>

              {/* Floor 3 & 2 Corner Windows */}
              <g transform="translate(160, 130)">
                <rect x="0" y="0" width="60" height="38" rx="3" fill={theme.windowGlow} opacity={theme.windowOpacity} stroke="#475569" strokeWidth="1.5" />
                <rect x="0" y="0" width="60" height="38" rx="3" fill="url(#glassReflect)" />
                {/* Blinds detail */}
                <line x1="0" y1="8" x2="60" y2="8" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
                <line x1="0" y1="16" x2="60" y2="16" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
              </g>

              <g transform="translate(160, 180)">
                <rect x="0" y="0" width="60" height="38" rx="3" fill={theme.windowGlow} opacity={theme.windowOpacity} stroke="#475569" strokeWidth="1.5" />
                <rect x="0" y="0" width="60" height="38" rx="3" fill="url(#glassReflect)" />
              </g>

              {/* Ground Floor Chic Glass Lobby Entrance */}
              <g transform="translate(125, 230)">
                {/* Entrance Canopy */}
                <rect x="-15" y="-6" width="105" height="7" rx="2" fill="url(#charcoalPanel)" />
                {/* Warm Entrance Recessed Downlight */}
                <ellipse cx="37" cy="0" rx="30" ry="12" fill={theme.windowGlow} opacity={theme.lampGlowOpacity} filter="url(#lampGlow)" />
                {/* Glass Entryway */}
                <rect x="0" y="0" width="75" height="55" rx="2" fill="url(#glassReflect)" stroke="#334155" strokeWidth="2" />
                {/* Sliding Door Frame */}
                <line x1="37" y1="0" x2="37" y2="55" stroke="#334155" strokeWidth="2" />
                <rect x="18" y="24" width="3" height="14" rx="1" fill="#94a3b8" />
                <rect x="42" y="24" width="3" height="14" rx="1" fill="#94a3b8" />
              </g>

              {/* Landscaping around apartment */}
              <circle cx="70" cy="275" r="16" fill="#16a34a" />
              <circle cx="62" cy="272" r="12" fill="#22c55e" />
              <circle cx="315" cy="274" r="18" fill="#15803d" />
              <circle cx="325" cy="270" r="14" fill="#4ade80" />
            </g>
          ) : isVilla ? (
            /* =========================================================
               TIER C: ULTRA-LUXURY ARCHITECTURAL VILLA (Wealthy Tier)
               ========================================================= */
            <g
              filter="url(#softShadow)"
              className="cursor-pointer transition-transform hover:scale-[1.005]"
              onMouseEnter={() => setActiveTooltip(`Luxury Villa: Est. Value ₹${((primaryHome?.value || 9000000) / 100000).toFixed(0)}L · Prestigious architectural masterwork.`)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Villa Ground Shadow */}
              <ellipse cx="210" cy="285" rx="170" ry="14" fill="black" opacity={theme.shadowOpacity} filter="url(#groundDrop)" />

              {/* Lower Level: Minimalist White Stucco & Panoramic Glass */}
              <rect x="60" y="160" width="280" height="125" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />

              {/* Upper Cantilever Volume: Textured Slate & Teak Wood Louvers */}
              <rect x="40" y="90" width="240" height="85" rx="8" fill="url(#charcoalPanel)" />
              {/* Teak Wood Slats Accent on Cantilever */}
              <rect x="45" y="95" width="95" height="75" rx="4" fill="url(#teakWood)" opacity="0.95" />

              {/* Rooftop Garden Terrace & Glass Balustrade */}
              <rect x="150" y="80" width="130" height="14" rx="2" fill="rgba(255,255,255,0.85)" stroke="#94a3b8" strokeWidth="1" />
              {/* Rooftop Lounge Chairs */}
              <path d="M175,82 L190,75 L200,82" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Rooftop Planter */}
              <circle cx="260" cy="76" r="7" fill="#16a34a" />
              <circle cx="270" cy="74" r="5" fill="#22c55e" />

              {/* Upper Master Suite Panoramic Glass */}
              <g transform="translate(150, 102)">
                <rect x="0" y="0" width="120" height="62" rx="4" fill={theme.windowGlow} opacity={theme.windowOpacity} />
                <rect x="0" y="0" width="120" height="62" rx="4" fill="url(#glassReflect)" stroke="#475569" strokeWidth="1.5" />
                {/* Modern Chandelier Silhouette */}
                <circle cx="60" cy="18" r="4" fill="#fbbf24" filter="url(#windowBloom)" />
                <line x1="60" y1="0" x2="60" y2="15" stroke="#94a3b8" strokeWidth="1" />
              </g>

              {/* Ground Floor Living Pavilion: Floor-to-Ceiling Curtain Wall */}
              <g transform="translate(75, 175)">
                <rect x="0" y="0" width="170" height="98" rx="4" fill={theme.windowGlow} opacity={theme.windowOpacity} />
                <rect x="0" y="0" width="170" height="98" rx="4" fill="url(#glassReflect)" stroke="#334155" strokeWidth="2" />
                <line x1="56" y1="0" x2="56" y2="98" stroke="#334155" strokeWidth="1.5" />
                <line x1="112" y1="0" x2="112" y2="98" stroke="#334155" strokeWidth="1.5" />
                {/* Interior Living Art & Shelf Silhouette */}
                <rect x="18" y="35" width="22" height="42" fill="#334155" opacity="0.3" rx="2" />
              </g>

              {/* Front Private Infinity Reflection Pool */}
              <g transform="translate(85, 276)">
                {/* Pool Basin Rim */}
                <rect x="-4" y="-3" width="158" height="24" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                {/* Turquoise Pool Water */}
                <rect x="0" y="0" width="150" height="18" rx="2" fill="url(#poolGrad)" />
                {/* Animated Light Shimmer */}
                <ellipse cx="75" cy="8" rx="55" ry="4" fill="#ffffff" className="anim-water" />
              </g>

              {/* Villa Entryway with Floating Stepping Stones */}
              <g transform="translate(260, 205)">
                <rect x="0" y="0" width="65" height="78" fill="url(#teakWood)" rx="4" />
                <rect x="10" y="0" width="45" height="78" fill="#1e293b" rx="2" />
                <rect x="42" y="34" width="3" height="18" fill="#f59e0b" rx="1" />
                {/* Sconce Light */}
                <circle cx="8" cy="22" r="3" fill="#fef08a" />
                <ellipse cx="8" cy="22" rx="16" ry="16" fill="#fde047" opacity={theme.lampGlowOpacity} filter="url(#lampGlow)" />
              </g>

              {/* Manicured Landscaping: Cypress trees & modern planter box */}
              <g transform="translate(345, 175)">
                {/* Tall Architectural Italian Cypress Tree */}
                <path d="M12,0 Q24,45 18,100 L6,100 Q0,45 12,0 Z" fill="#14532d" />
                <path d="M12,0 Q18,45 14,100 L6,100 Q2,45 12,0 Z" fill="#16a34a" />
                <rect x="8" y="98" width="8" height="14" fill="#451a03" />
              </g>
              <g transform="translate(30, 185)">
                <path d="M10,0 Q20,38 15,85 L5,85 Q0,38 10,0 Z" fill="#15803d" />
                <rect x="7" y="83" width="6" height="12" fill="#451a03" />
              </g>
            </g>
          ) : (
            /* =========================================================
               TIER B: CONTEMPORARY SCANDINAVIAN TOWNHOUSE (Comfortable / Middle)
               ========================================================= */
            <g
              filter="url(#softShadow)"
              className="cursor-pointer transition-transform hover:scale-[1.005]"
              onMouseEnter={() => setActiveTooltip(`Owned Home: Est. Value ₹${((primaryHome?.value || 4500000) / 100000).toFixed(0)}L · Modern detached home.`)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Base Drop Shadow */}
              <ellipse cx="190" cy="285" rx="145" ry="12" fill="black" opacity={theme.shadowOpacity} filter="url(#groundDrop)" />

              {/* Main House Body */}
              <rect x="65" y="145" width="245" height="140" rx="6" fill={theme.buildingLight} stroke="#cbd5e1" strokeWidth="2" />

              {/* Pitched Modern Standing-Seam Slate Roof */}
              <polygon points="50,148 185,82 320,148" fill="url(#charcoalPanel)" stroke="#0f172a" strokeWidth="1.5" />
              <polygon points="58,145 185,85 312,145" fill="#334155" />

              {/* Rooftop Solar Panels Array */}
              <g transform="translate(195, 96)">
                <polygon points="0,32 45,10 90,32 45,54" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
                {/* Solar grid lines */}
                <line x1="22" y1="21" x2="68" y2="43" stroke="#93c5fd" strokeWidth="0.8" opacity="0.6" />
                <line x1="45" y1="10" x2="45" y2="54" stroke="#93c5fd" strokeWidth="0.8" opacity="0.6" />
              </g>

              {/* Architectural Cedar Accent Wall */}
              <rect x="75" y="155" width="105" height="125" fill="url(#teakWood)" rx="3" opacity="0.9" />

              {/* Large Picture Window with Warm Glow */}
              <g transform="translate(85, 170)">
                <rect x="0" y="0" width="85" height="68" rx="3" fill={theme.windowGlow} opacity={theme.windowOpacity} />
                <rect x="0" y="0" width="85" height="68" rx="3" fill="url(#glassReflect)" stroke="#1e293b" strokeWidth="2" />
                <line x1="42" y1="0" x2="42" y2="68" stroke="#1e293b" strokeWidth="1.5" />
                {/* Indoor plant silhouette on windowsill */}
                <circle cx="20" cy="56" r="6" fill="#16a34a" />
              </g>

              {/* Upper Attic Gable Circular Window */}
              <circle cx="185" cy="120" r="13" fill={theme.windowGlow} opacity={theme.windowOpacity} stroke="#0f172a" strokeWidth="2" />
              <line x1="185" y1="107" x2="185" y2="133" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="172" y1="120" x2="198" y2="120" stroke="#0f172a" strokeWidth="1.5" />

              {/* Front Porch & Modern Door */}
              <g transform="translate(200, 185)">
                {/* Porch Overhang Canopy */}
                <rect x="-6" y="-6" width="72" height="8" rx="2" fill="url(#charcoalPanel)" />
                {/* Modern Solid Oak Door */}
                <rect x="6" y="2" width="48" height="95" rx="3" fill="#451a03" stroke="#78350f" strokeWidth="1.5" />
                {/* Sleek Vertical Steel Handle */}
                <rect x="42" y="44" width="3" height="22" rx="1" fill="#e2e8f0" />
                {/* Glowing Porch Light */}
                <circle cx="58" cy="20" r="3" fill="#fde047" />
                <ellipse cx="58" cy="20" rx="18" ry="18" fill="#fde047" opacity={theme.lampGlowOpacity} filter="url(#lampGlow)" />
                {/* Welcome Doormat */}
                <rect x="10" y="94" width="40" height="6" rx="1" fill="#a16207" />
              </g>

              {/* Renovation Cue Overlay if Home Needs Repair */}
              {homeNeedsRenovation && (
                <g transform="translate(130, 130)">
                  <path d="M0,0 L18,22 L10,35 L24,50" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <rect x="-40" y="-25" width="115" height="20" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
                  <text x="18" y="-12" fill="#b91c1c" fontSize="8" fontWeight="800" textAnchor="middle">
                    ⚠️ MAINTENANCE DUE
                  </text>
                </g>
              )}

              {/* Garden Landscaping & Flowering Bushes */}
              <circle cx="60" cy="275" r="16" fill="#15803d" />
              <circle cx="52" cy="270" r="12" fill="#22c55e" />
              {/* Pink Flower Blooms */}
              <circle cx="50" cy="265" r="3" fill="#f472b6" />
              <circle cx="62" cy="272" r="3" fill="#fb7185" />
              <circle cx="315" cy="274" r="15" fill="#16a34a" />
            </g>
          )}

          {/* 7. SECOND PROPERTY / INVESTMENT ASSET (If owned) */}
          {hasSecondHome && (
            <g
              transform="translate(325, 160)"
              filter="url(#softShadow)"
              className="cursor-pointer transition-transform hover:scale-[1.01]"
              onMouseEnter={() => setActiveTooltip('Investment Asset: Generating monthly rental yield.')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Annex Building */}
              <rect x="0" y="25" width="85" height="98" rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
              <polygon points="-5,28 42,0 90,28" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />
              {/* Active Rental Badge */}
              <rect x="10" y="34" width="65" height="15" rx="3" fill="#4338ca" />
              <text x="42" y="44" fill="#e0e7ff" fontSize="7" fontWeight="800" textAnchor="middle">
                RENTAL ASSET
              </text>
              {/* Lit Windows */}
              <rect x="12" y="55" width="26" height="24" rx="2" fill="#fef08a" opacity="0.85" />
              <rect x="46" y="55" width="26" height="24" rx="2" fill="#fef08a" opacity="0.85" />
              {/* Door */}
              <rect x="28" y="86" width="28" height="37" fill="#0f172a" rx="2" />
            </g>
          )}

          {/* 8. VEHICLE DISPLAY (Progression: E-Bike -> EV Crossover -> Luxury Grand Tourer) */}
          {carsOwned.length === 0 ? (
            /* =========================================================
               NO CAR: URBAN COMMUTER E-BIKE / E-SCOOTER
               ========================================================= */
            <g
              transform="translate(450, 255)"
              filter="url(#softShadow)"
              className="cursor-pointer transition-transform hover:scale-[1.03]"
              onMouseEnter={() => setActiveTooltip('E-Bike: Eco-friendly commuting with zero fuel/loan debt.')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Bike Shadow */}
              <ellipse cx="40" cy="30" rx="36" ry="5" fill="black" opacity={theme.shadowOpacity} filter="url(#groundDrop)" />

              {/* Front and Rear Spoke Wheels */}
              <circle cx="16" cy="20" r="12" fill="none" stroke="#0f172a" strokeWidth="3" />
              <circle cx="16" cy="20" r="4" fill="#94a3b8" />
              <circle cx="64" cy="20" r="12" fill="none" stroke="#0f172a" strokeWidth="3" />
              <circle cx="64" cy="20" r="4" fill="#94a3b8" />

              {/* Sleek Modern Frame with Cyan Battery Pack */}
              <path d="M16,20 L36,20 L52,6 L64,20" stroke="#0284c7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M36,20 L44,2 L32,2" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />
              <line x1="52" y1="6" x2="56" y2="-4" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
              {/* Handlebars */}
              <line x1="50" y1="-4" x2="62" y2="-4" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
              {/* Saddle */}
              <path d="M28,2 L40,2" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
              {/* Glowing LED Headlight */}
              <circle cx="62" cy="-2" r="2.5" fill="#38bdf8" />
            </g>
          ) : (
            /* =========================================================
               OWNED CAR: SLEEK 2026 MODERN EV / LUXURY GT
               ========================================================= */
            <g
              transform="translate(430, 240)"
              filter="url(#softShadow)"
              className="cursor-pointer transition-transform hover:scale-[1.01]"
              onMouseEnter={() => setActiveTooltip(`${carStatusLabel}: Reliable mobility and comfort.`)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Vehicle Underbody Shadow */}
              <ellipse cx="85" cy="46" rx="80" ry="8" fill="black" opacity={theme.shadowOpacity} filter="url(#groundDrop)" />

              {/* Lower Body Aero Aerodynamics */}
              <rect x="6" y="24" width="160" height="22" rx="9" fill="url(#carPaint)" />

              {/* Sweeping Aerodynamic Greenhouse / Glass Cabin */}
              <path
                d="M26,24 L48,6 Q100,2 135,10 L152,24 Z"
                fill="url(#carPaint)"
              />
              {/* Tinted Panoramic Windshields & Side Windows */}
              <path
                d="M32,22 L50,8 Q85,5 110,8 L110,22 Z"
                fill="#38bdf8"
                opacity="0.75"
              />
              <path
                d="M115,22 L115,8 Q130,10 144,22 Z"
                fill="#38bdf8"
                opacity="0.75"
              />

              {/* Shoulder Line Chrome / Specular Highlight */}
              <path d="M8,25 Q80,21 162,25" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" fill="none" />

              {/* Front Continuous LED Lightbar */}
              <path d="M152,24 L165,27 L158,32" stroke="#fef08a" strokeWidth="3" fill="none" strokeLinecap="round" />
              {timeMode !== 'day' && (
                <polygon points="165,26 230,15 230,45" fill="#fef08a" opacity="0.35" filter="url(#lampGlow)" />
              )}

              {/* Rear Sleek Red LED Tail Strip */}
              <path d="M8,26 L6,30" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />

              {/* Aero Turbine Alloy Wheels */}
              {/* Rear Wheel */}
              <g transform="translate(42, 44)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" />
                <circle cx="0" cy="0" r="9" fill="#475569" />
                <circle cx="0" cy="0" r="4" fill="#e2e8f0" />
                <line x1="-7" y1="-7" x2="7" y2="7" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="-7" y1="7" x2="7" y2="-7" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
              {/* Front Wheel */}
              <g transform="translate(132, 44)">
                <circle cx="0" cy="0" r="14" fill="#0f172a" />
                <circle cx="0" cy="0" r="9" fill="#475569" />
                <circle cx="0" cy="0" r="4" fill="#e2e8f0" />
                <line x1="-7" y1="-7" x2="7" y2="7" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="-7" y1="7" x2="7" y2="-7" stroke="#94a3b8" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {/* 9. THE CHARACTERS (Modern 2026 Stylized Vector Avatars) */}
          <g
            className="anim-avatar cursor-pointer"
            onMouseEnter={() => setActiveTooltip(married ? 'You & Your Partner: Growing your life and net worth together.' : 'Your Avatar: In pursuit of financial independence.')}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            {/* Soft Ground Contact Shadow beneath character feet */}
            <ellipse cx={married ? "382" : "368"} cy="290" rx={married ? "36" : "20"} ry="5" fill="black" opacity={theme.shadowOpacity} filter="url(#groundDrop)" />

            {/* PLAYER AVATAR */}
            <g transform="translate(355, 205)">
              {/* Hair (Layered Modern Cut) */}
              <path d="M8,12 Q14,0 26,4 Q34,6 30,16 Q28,12 18,12 Z" fill="#1e293b" />

              {/* Head & Neck */}
              <circle cx="18" cy="18" r="11" fill="#fcd9b6" />
              {/* Stylized Eyes & Smile */}
              <circle cx="15" cy="18" r="1.2" fill="#0f172a" />
              <circle cx="21" cy="18" r="1.2" fill="#0f172a" />
              <path d="M16,22 Q18,24 20,22" stroke="#0f172a" strokeWidth="1" fill="none" strokeLinecap="round" />

              {/* Upper Garment based on lifestyle tier */}
              {tier === 'wealthy' ? (
                /* Tailored Designer Overcoat */
                <path d="M6,30 Q18,26 30,30 L32,60 L4,60 Z" fill="#0f172a" />
              ) : tier === 'comfortable' ? (
                /* Smart Tailored Blazer */
                <path d="M7,30 Q18,27 29,30 L31,58 L5,58 Z" fill="#0369a1" />
              ) : (
                /* Casual Streetwear Hoodie */
                <path d="M7,30 Q18,27 29,30 L30,56 L6,56 Z" fill={tier === 'middle' ? '#2563eb' : '#475569'} />
              )}
              {/* Collar Accent */}
              <polygon points="15,30 18,36 21,30" fill="#ffffff" />

              {/* Arms & Hands */}
              <rect x="2" y="32" width="6" height="22" rx="3" fill="#fcd9b6" />
              <rect x="28" y="32" width="6" height="22" rx="3" fill="#fcd9b6" />

              {/* Coffee Tumbler / Smartphone in Hand */}
              <rect x="31" y="48" width="5" height="8" rx="1.5" fill="#f59e0b" />

              {/* Trousers / Jeans */}
              <rect x="9" y="58" width="8" height="24" rx="2" fill="#1e293b" />
              <rect x="19" y="58" width="8" height="24" rx="2" fill="#1e293b" />

              {/* Clean White Modern Sneakers */}
              <rect x="7" y="80" width="11" height="5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="18" y="80" width="11" height="5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            </g>

            {/* PARTNER (Rendered seamlessly side-by-side if married) */}
            {married && (
              <g transform="translate(385, 208)">
                {/* Long Flowing Styled Hair */}
                <path d="M4,14 Q14,0 26,6 Q32,16 28,34 Q22,26 12,26 Z" fill="#78350f" />

                {/* Head */}
                <circle cx="16" cy="18" r="10" fill="#fde2cb" />
                {/* Face */}
                <circle cx="13" cy="18" r="1.1" fill="#0f172a" />
                <circle cx="19" cy="18" r="1.1" fill="#0f172a" />
                <path d="M14,22 Q16,24 18,22" stroke="#e11d48" strokeWidth="1" fill="none" strokeLinecap="round" />

                {/* Stylish Knit / Wrap Dress */}
                <path d="M6,29 Q16,26 26,29 L28,58 L4,58 Z" fill="#ec4899" />
                <circle cx="16" cy="34" r="2" fill="#fbcfe8" />

                {/* Arms */}
                <rect x="2" y="31" width="5" height="20" rx="2.5" fill="#fde2cb" />
                <rect x="25" y="31" width="5" height="20" rx="2.5" fill="#fde2cb" />

                {/* Trousers / Skirt & Boots */}
                <rect x="8" y="56" width="7" height="24" rx="2" fill="#334155" />
                <rect x="17" y="56" width="7" height="24" rx="2" fill="#334155" />
                <rect x="7" y="78" width="9" height="5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="16" y="78" width="9" height="5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

                {/* Floating Heart between the couple */}
                <path
                  d="M-2,10 C-2,6 -7,6 -7,10 C-7,13 -2,16 -2,18 C-2,16 3,13 3,10 C3,6 -2,6 -2,10 Z"
                  fill="#f43f5e"
                  opacity="0.9"
                />
              </g>
            )}

            {/* PET COMPANION (Playful Golden Retriever if comfortable or wealthy) */}
            {(tier === 'comfortable' || tier === 'wealthy') && (
              <g transform="translate(320, 260)">
                {/* Dog Body */}
                <ellipse cx="22" cy="18" rx="14" ry="9" fill="#f59e0b" />
                {/* Dog Head */}
                <circle cx="36" cy="12" r="7" fill="#f59e0b" />
                <circle cx="38" cy="11" r="1" fill="#0f172a" />
                <ellipse cx="42" cy="14" rx="3" ry="2" fill="#d97706" />
                {/* Droopy Ear */}
                <ellipse cx="33" cy="12" rx="3" ry="6" fill="#b45309" />
                {/* Legs */}
                <rect x="12" y="22" width="4" height="9" rx="1.5" fill="#d97706" />
                <rect x="26" y="22" width="4" height="9" rx="1.5" fill="#d97706" />
                {/* Wagging Tail */}
                <path d="M8,16 Q2,12 4,6" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" className="anim-tail" />
              </g>
            )}
          </g>

          {/* 10. MODERN STREET FURNITURE & AMBIENT LIGHTING */}
          <g>
            {/* Sleek Minimalist Solar Bollard Lights */}
            {[20, 760].map(lampX => (
              <g key={`lamp-${lampX}`} transform={`translate(${lampX}, 255)`}>
                {/* Post */}
                <rect x="0" y="0" width="6" height="36" rx="2" fill="url(#charcoalPanel)" />
                {/* Light Fixture */}
                <rect x="-2" y="0" width="10" height="7" rx="2" fill="#fef08a" />
                {/* Soft Radial Light Cone on Ground */}
                <ellipse cx="3" cy="35" rx="38" ry="12" fill="#fef08a" opacity={theme.lampGlowOpacity} filter="url(#lampGlow)" />
              </g>
            ))}
          </g>
        </svg>

        {/* Dynamic Tooltip / Milestone Overlay */}
        {activeTooltip && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-[11px] font-medium px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none transition-all flex items-center space-x-2 z-10 border border-white/10">
            <span className="text-amber-400">✨</span>
            <span>{activeTooltip}</span>
          </div>
        )}
      </div>

      {/* Modern 2026 Metric Snapshot Footer */}
      <div className="grid grid-cols-3 divide-x divide-stone-100 bg-stone-50/60 text-center py-2 px-1 border-t border-stone-100">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Residence</p>
          <p className="text-xs font-black text-text-primary truncate px-1">{homeStatusLabel}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Transport</p>
          <p className="text-xs font-black text-text-primary truncate px-1">{carStatusLabel}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-text-muted font-bold">Household</p>
          <p className="text-xs font-black text-text-primary truncate px-1">
            {married ? 'Married Couple' : 'Solo Professional'}
          </p>
        </div>
      </div>
    </div>
  );
}
