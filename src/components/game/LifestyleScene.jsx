import React from 'react';
import useGameStore from '../../engine/store';

function getLifestyleTier(incomes, businessIncome, homesOwned, carsOwned) {
  const monthly = (incomes || []).reduce((s, i) => s + i.amount, 0) + (businessIncome || 0);
  const hasHome = (homesOwned || []).length > 0;
  const hasCar = (carsOwned || []).length > 0;
  if (monthly > 150000 && hasHome && hasCar) return 'wealthy';
  if (monthly > 80000 && hasHome)            return 'comfortable';
  if (monthly > 40000)                       return 'middle';
  return 'starter';
}

function CityBg({ tier }) {
  const configs = {
    1: [
      { x: 278, y: 52, w: 28, h: 103 },
      { x: 312, y: 38, w: 22, h: 117 },
      { x: 342, y: 62, w: 30, h: 93 },
      { x: 375, y: 48, w: 18, h: 107 },
    ],
    2: [
      { x: 282, y: 78, w: 38, h: 77 },
      { x: 325, y: 88, w: 30, h: 67 },
      { x: 358, y: 72, w: 34, h: 83 },
    ],
    3: [
      { x: 288, y: 108, w: 42, h: 47 },
      { x: 334, y: 102, w: 36, h: 53 },
      { x: 374, y: 112, w: 22, h: 43 },
    ],
  };
  const buildings = configs[tier] || configs[2];
  const wallColors = { 1: '#94a3b8', 2: '#a3b18a', 3: '#c9b99a' };
  const winColors  = { 1: '#e2e8f0', 2: '#fefce8', 3: '#fef3c7' };

  return (
    <g opacity="0.72">
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={wallColors[tier]} rx="2" />
          {Array.from({ length: Math.max(1, Math.floor(b.h / 19)) }).map((_, row) =>
            Array.from({ length: Math.max(1, Math.floor(b.w / 11)) }).map((_, col) => (
              <rect
                key={`${i}-${row}-${col}`}
                x={b.x + 3 + col * 11}
                y={b.y + 5 + row * 19}
                width="6" height="8"
                fill={winColors[tier]} rx="1" opacity="0.85"
              />
            ))
          )}
        </g>
      ))}
    </g>
  );
}

function HomeVisual({ isRenting, homesOwned, needsRenovation }) {
  const hasHome  = homesOwned.length > 0;
  const hasSecond = homesOwned.length >= 2;
  const isVilla  = hasHome && (homesOwned[0]?.value || 0) > 8000000;
  const homeColor = needsRenovation ? '#9ca3af' : (isVilla ? '#f59e0b' : '#60a5fa');
  const roofColor = needsRenovation ? '#6b7280' : (isVilla ? '#b45309' : '#1d4ed8');

  if (isRenting || !hasHome) {
    return (
      <g>
        {/* Apartment block */}
        <rect x="62" y="92" width="78" height="63" fill="#94a3b8" rx="3" />
        <rect x="62" y="87" width="78" height="9"  fill="#64748b" rx="2" />
        {/* Windows grid */}
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => (
            <rect key={`w${row}${col}`}
              x={71 + col * 24} y={101 + row * 19}
              width="15" height="11"
              fill="#fbbf24" rx="2" opacity="0.9" />
          ))
        )}
        {/* Door */}
        <rect x="93" y="141" width="16" height="14" fill="#78350f" rx="1" />
        {/* Label */}
        <text x="101" y="84" fontSize="7" textAnchor="middle" fill="#475569" fontWeight="600">APARTMENTS</text>
      </g>
    );
  }

  if (isVilla) {
    return (
      <g>
        {/* Villa body */}
        <rect x="48" y="108" width="105" height="47" fill={homeColor} rx="3" />
        {/* Roof */}
        <polygon points="48,108 100,76 153,108" fill={roofColor} />
        {/* Crack if renovation needed */}
        {needsRenovation && (
          <>
            <line x1="82" y1="94" x2="74" y2="109" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
            <line x1="74" y1="109" x2="80" y2="118" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {/* Trees */}
        <circle cx="38" cy="148" r="11" fill="#22c55e" />
        <rect x="36" y="148" width="4" height="10" fill="#78350f" />
        <circle cx="165" cy="149" r="9" fill="#16a34a" />
        <rect x="163" y="149" width="4" height="9" fill="#78350f" />
        {/* Windows */}
        <rect x="68" y="117" width="20" height="15" fill="#bae6fd" rx="2" />
        <rect x="112" y="117" width="20" height="15" fill="#bae6fd" rx="2" />
        {/* Door */}
        <rect x="88" y="126" width="18" height="22" fill="#78350f" rx="2" />
        <circle cx="104" cy="137" r="2" fill="#fbbf24" />
        {/* Second property */}
        {hasSecond && (
          <g opacity="0.88">
            <rect x="168" y="118" width="68" height="37" fill="#a78bfa" rx="3" />
            <polygon points="168,118 202,98 236,118" fill="#7c3aed" />
            <rect x="178" y="126" width="14" height="11" fill="#c4b5fd" rx="1" />
            <rect x="198" y="126" width="14" height="11" fill="#c4b5fd" rx="1" />
            <rect x="186" y="131" width="12" height="18" fill="#4c1d95" rx="1" />
            <text x="202" y="148" fontSize="6.5" textAnchor="middle" fill="white" fontWeight="700">FOR RENT</text>
          </g>
        )}
      </g>
    );
  }

  // Standard owned home
  return (
    <g>
      {/* House body */}
      <rect x="58" y="112" width="88" height="43" fill={homeColor} rx="3" />
      {/* Roof */}
      <polygon points="58,112 102,83 145,112" fill={roofColor} />
      {/* Renovation cracks */}
      {needsRenovation && (
        <>
          <line x1="88" y1="99" x2="80" y2="113" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="100" y="119" width="15" height="11" fill="#6b7280" rx="1" />
        </>
      )}
      {/* Windows */}
      <rect x="74" y="120" width="18" height="13" fill={needsRenovation ? '#9ca3af' : '#bae6fd'} rx="2" />
      <rect x="110" y="120" width="18" height="13" fill={needsRenovation ? '#9ca3af' : '#bae6fd'} rx="2" />
      {/* Door */}
      <rect x="90" y="127" width="15" height="18" fill="#78350f" rx="2" />
      <circle cx="103" cy="136" r="2" fill="#fbbf24" />
      {/* Second property */}
      {hasSecond && (
        <g opacity="0.88">
          <rect x="160" y="120" width="65" height="35" fill="#a78bfa" rx="3" />
          <polygon points="160,120 193,102 225,120" fill="#7c3aed" />
          <rect x="168" y="128" width="13" height="10" fill="#c4b5fd" rx="1" />
          <rect x="186" y="128" width="13" height="10" fill="#c4b5fd" rx="1" />
          <rect x="174" y="133" width="11" height="16" fill="#4c1d95" rx="1" />
          <text x="193" y="147" fontSize="6.5" textAnchor="middle" fill="white" fontWeight="700">FOR RENT</text>
        </g>
      )}
    </g>
  );
}

function CarVisual({ tier }) {
  const bodyColor = tier === 'wealthy' ? '#1e293b' : tier === 'comfortable' ? '#1d4ed8' : '#6b7280';
  const shimmer   = tier === 'wealthy' ? '#334155' : tier === 'comfortable' ? '#3b82f6' : '#9ca3af';
  return (
    <g>
      {/* Body */}
      <rect x="193" y="143" width="72" height="17" fill={bodyColor} rx="5" />
      {/* Cabin */}
      <rect x="205" y="133" width="48" height="15" fill={bodyColor} rx="4" />
      {/* Windshields */}
      <rect x="208" y="135" width="20" height="11" fill="#bae6fd" rx="2" opacity="0.75" />
      <rect x="231" y="135" width="19" height="11" fill="#bae6fd" rx="2" opacity="0.75" />
      {/* Highlight strip */}
      <rect x="193" y="145" width="72" height="3" fill={shimmer} rx="1" opacity="0.5" />
      {/* Wheels */}
      <circle cx="212" cy="161" r="8" fill="#111827" />
      <circle cx="212" cy="161" r="4" fill="#6b7280" />
      <circle cx="251" cy="161" r="8" fill="#111827" />
      <circle cx="251" cy="161" r="4" fill="#6b7280" />
      {/* Headlight */}
      <rect x="261" y="147" width="5" height="7" fill="#fef08a" rx="1" opacity="0.9" />
    </g>
  );
}

function AvatarVisual({ tier, married }) {
  const shirtColors = {
    starter:     '#6b7280',
    middle:      '#3b82f6',
    comfortable: '#7c3aed',
    wealthy:     '#111827',
  };
  const shirt = shirtColors[tier] || '#6b7280';

  return (
    <g>
      {/* Player */}
      {/* Head */}
      <circle cx="28" cy="136" r="11" fill="#fcd9b6" />
      {/* Hair */}
      <path d="M17,132 Q28,122 39,132" fill="#374151" />
      {/* Body */}
      <rect x="20" y="147" width="16" height="22" fill={shirt} rx="4" />
      {/* Arms */}
      <rect x="13" y="150" width="8" height="14" fill={shirt} rx="3" />
      <rect x="35" y="150" width="8" height="14" fill={shirt} rx="3" />
      {/* Legs */}
      <rect x="20" y="167" width="7" height="12" fill="#374151" rx="2" />
      <rect x="29" y="167" width="7" height="12" fill="#374151" rx="2" />

      {/* Partner (if married) */}
      {married && (
        <g>
          {/* Head */}
          <circle cx="52" cy="136" r="10" fill="#fcd9b6" />
          {/* Hair - longer */}
          <path d="M41,134 Q52,122 63,134 L63,140 Q52,136 41,140Z" fill="#78350f" />
          {/* Body */}
          <rect x="44" y="146" width="16" height="22" fill="#ec4899" rx="4" />
          {/* Arms */}
          <rect x="37" y="149" width="8" height="13" fill="#ec4899" rx="3" />
          <rect x="59" y="149" width="8" height="13" fill="#ec4899" rx="3" />
          {/* Legs */}
          <rect x="44" y="166" width="7" height="12" fill="#374151" rx="2" />
          <rect x="53" y="166" width="7" height="12" fill="#374151" rx="2" />
        </g>
      )}
    </g>
  );
}

export default function LifestyleScene() {
  const player             = useGameStore(s => s.player);
  const incomes            = useGameStore(s => s.incomes);
  const businessIncome     = useGameStore(s => s.businessIncome);
  const homesOwned         = useGameStore(s => s.homesOwned || []);
  const carsOwned          = useGameStore(s => s.carsOwned || []);
  const married            = useGameStore(s => s.married || false);
  const homeNeedsRenovation = useGameStore(s => s.homeNeedsRenovation || false);

  const tier     = getLifestyleTier(incomes, businessIncome, homesOwned, carsOwned);
  const cityTier = player?.cityTier || 2;
  const isRenting = player?.isRenting ?? true;

  const skyPalettes = {
    1: { top: '#bfdbfe', bot: '#dbeafe', ground: '#86efac', path: '#d1d5db' },
    2: { top: '#d1fae5', bot: '#a7f3d0', ground: '#6ee7b7', path: '#d4a373' },
    3: { top: '#fef3c7', bot: '#fde68a', ground: '#d4a373', path: '#c9b99a' },
  };
  const pal = skyPalettes[cityTier] || skyPalettes[2];

  const tierLabels = {
    starter: 'Getting Started',
    middle: 'Middle Class',
    comfortable: 'Comfortable',
    wealthy: 'Wealthy',
  };

  const housingLabel = !player ? '' :
    player.isRenting ? 'Renting' :
    homesOwned.length >= 2 ? 'Home Owner + Investment Property' :
    'Home Owner';

  return (
    <div className="mx-4 my-3 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Your Life</span>
        <span className="text-[10px] text-text-muted">
          {tierLabels[tier] || tier}
          {housingLabel ? ` · ${housingLabel}` : ''}
        </span>
      </div>

      <svg
        viewBox="0 0 400 180"
        className="w-full"
        style={{ height: '160px', display: 'block' }}
        aria-label="Lifestyle visual"
      >
        <defs>
          <linearGradient id="lsSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pal.top} />
            <stop offset="100%" stopColor={pal.bot} />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="180" fill="url(#lsSkyGrad)" />

        {/* Sun */}
        <circle cx="362" cy="28" r="18" fill="#fef08a" opacity="0.9" />
        <circle cx="362" cy="28" r="24" fill="#fef9c3" opacity="0.35" />

        {/* City background */}
        <CityBg tier={cityTier} />

        {/* Ground strip */}
        <rect x="0" y="155" width="400" height="25" fill={pal.ground} />
        {/* Path */}
        <rect x="0" y="164" width="400" height="16" fill={pal.path} opacity="0.55" />

        {/* Home */}
        <HomeVisual
          isRenting={isRenting}
          homesOwned={homesOwned}
          needsRenovation={homeNeedsRenovation}
        />

        {/* Car */}
        {carsOwned.length > 0 && <CarVisual tier={tier} />}

        {/* Avatar */}
        <AvatarVisual tier={tier} married={married} />
      </svg>
    </div>
  );
}
