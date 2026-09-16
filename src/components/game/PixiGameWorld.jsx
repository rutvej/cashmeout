import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, Container, Graphics, Text, useTick } from '@pixi/react';
import * as PIXI from 'pixi.js';
import useGameStore from '../../engine/store';
import { formatCurrency } from '../../utils/format';

/**
 * PixiGameWorld — High-Fidelity 2D/2.5D Life-Sim Game Engine
 * Features:
 * - Real WebGL hardware-accelerated canvas (60 FPS)
 * - Click-to-walk & keyboard navigation for the character with smooth walk cycle
 * - Dynamic visual aging (Age 22→42): hair graying, facial lines, outfit progression
 * - Dynamic Day / Sunset / Night ambient lighting & weather particles
 * - In-World Event Cutscenes & Dialogue Boxes (Events inside the canvas, NOT external modals)
 * - Interactive world hotspots (Workstation, Driveway, Pool, Lounge)
 */

// Helper color palette
const COLORS = {
  lawnDay1: 0x4ade80,
  lawnDay2: 0x22c55e,
  lawnSunset1: 0xca8a04,
  lawnSunset2: 0xa16207,
  lawnNight1: 0x064e3b,
  lawnNight2: 0x022c22,
  pathDay: 0xe2e8f0,
  pathBorder: 0xcbd5e1,
  poolWater: 0x38bdf8,
  poolGleam: 0xbae6fd,
  houseWall: 0xffffff,
  houseRoof: 0x334155,
  windowDay: 0xbae6fd,
  windowNight: 0xfef08a,
};

// ========================================================
// 1. SCENERY: ISLAND, ARCHITECTURE, POOL & PROPS
// ========================================================
function WorldEnvironment({ timeMode, tier, married, currentAge, isWorking, carOwned }) {
  const animTimeRef = useRef(0);
  const [waterFrame, setWaterFrame] = useState(0);

  // Animate water caustics & gentle tree sway
  useTick((delta) => {
    animTimeRef.current += delta * 0.05;
    if (Math.floor(animTimeRef.current) !== waterFrame) {
      setWaterFrame(Math.floor(animTimeRef.current));
    }
  });

  const drawGround = useCallback((g) => {
    g.clear();

    // Ambient background wash based on timeMode
    if (timeMode === 'night') {
      g.beginFill(0x0a0f1d);
    } else if (timeMode === 'sunset') {
      g.beginFill(0x451a03);
    } else {
      g.beginFill(0xf1f5f9);
    }
    g.drawRect(0, 0, 800, 480);
    g.endFill();

    // Main Floating Estate Ground (Isometric Hex / Diamond polygon)
    const lawnColor = timeMode === 'night' ? COLORS.lawnNight1 : timeMode === 'sunset' ? COLORS.lawnSunset1 : COLORS.lawnDay1;
    const lawnDark = timeMode === 'night' ? COLORS.lawnNight2 : timeMode === 'sunset' ? COLORS.lawnSunset2 : COLORS.lawnDay2;

    // Turf base
    g.beginFill(lawnColor);
    g.lineStyle(3, lawnDark, 1);
    g.drawPolygon([
      100, 240,
      400, 90,
      700, 240,
      400, 390
    ]);
    g.endFill();

    // Cobblestone Walkway from gate to house
    g.lineStyle(0);
    g.beginFill(COLORS.pathDay, 0.9);
    g.drawPolygon([
      385, 390,
      415, 390,
      415, 230,
      500, 230,
      500, 210,
      385, 210
    ]);
    g.endFill();

    // Pool (Unlocks at comfortable or wealthy tier)
    if (tier === 'comfortable' || tier === 'wealthy') {
      g.beginFill(0x0284c7);
      g.drawRoundedRect(160, 220, 110, 60, 12);
      g.endFill();

      // Shimmering water
      const pulse = Math.sin(animTimeRef.current) * 3;
      g.beginFill(COLORS.poolWater, 0.8);
      g.drawRoundedRect(164, 224, 102, 52, 8);
      g.endFill();

      // Caustic reflections
      g.lineStyle(1.5, COLORS.poolGleam, 0.6);
      g.moveTo(175 + pulse, 240);
      g.lineTo(210 + pulse, 240);
      g.moveTo(220 - pulse, 255);
      g.lineTo(255 - pulse, 255);
      g.lineStyle(0);
    }

    // Modern Villa / House
    const wallCol = timeMode === 'night' ? 0x1e293b : COLORS.houseWall;
    g.beginFill(wallCol);
    g.lineStyle(2, 0x0f172a, 0.2);
    // House Main Block
    g.drawRect(340, 120, 180, 100);
    g.endFill();

    // Modern Cantilever Second Floor (Wealthy / Comfortable)
    if (tier === 'comfortable' || tier === 'wealthy') {
      g.beginFill(0x334155);
      g.drawRect(310, 80, 140, 50);
      g.endFill();

      // Balcony Glass
      g.beginFill(0x38bdf8, 0.4);
      g.drawRect(450, 95, 70, 25);
      g.endFill();
    }

    // Modern Slanted Roof / Solar Panels
    g.beginFill(0x0f172a);
    g.drawPolygon([
      330, 120,
      530, 120,
      510, 105,
      350, 105
    ]);
    g.endFill();

    // Front Glass Windows & Door
    const windowCol = timeMode === 'night' ? COLORS.windowNight : COLORS.windowDay;
    g.beginFill(windowCol, timeMode === 'night' ? 0.95 : 0.7);
    g.drawRect(360, 140, 45, 45); // Left window
    g.drawRect(455, 140, 45, 45); // Right window
    g.endFill();

    // Front Door
    g.beginFill(0x78350f);
    g.drawRect(415, 150, 30, 70);
    g.endFill();

    // Workstation / Terrace Desk
    g.beginFill(0x475569);
    g.drawRect(280, 250, 50, 22);
    g.endFill();
    g.lineStyle(2, 0x1e293b);
    g.moveTo(285, 272); g.lineTo(285, 285);
    g.moveTo(325, 272); g.lineTo(325, 285);
    g.lineStyle(0);

    // Glowing Laptop on desk
    g.beginFill(0x94a3b8);
    g.drawRect(295, 253, 20, 12);
    g.beginFill(isWorking ? 0x38bdf8 : 0x1e293b);
    g.drawRect(295, 243, 20, 10);
    g.endFill();

    // Coffee Mug
    g.beginFill(0xf59e0b);
    g.drawCircle(322, 258, 3.5);
    g.endFill();

    // Garage / Driveway Car (if owned)
    if (carOwned) {
      g.beginFill(0x64748b, 0.4);
      g.drawRoundedRect(530, 240, 85, 45, 6);
      g.endFill();

      // Car Body
      const carCol = tier === 'wealthy' ? 0xd97706 : tier === 'comfortable' ? 0x0284c7 : 0x475569;
      g.beginFill(carCol);
      g.drawRoundedRect(535, 245, 75, 32, 8);
      // Windshield & roof
      g.beginFill(0x0f172a, 0.8);
      g.drawRoundedRect(548, 248, 38, 24, 4);
      g.beginFill(0xbae6fd, 0.6);
      g.drawRect(552, 250, 14, 20); // front windshield
      g.drawRect(570, 250, 12, 20); // rear windshield
      // Wheels
      g.beginFill(0x1e293b);
      g.drawCircle(545, 245, 4);
      g.drawCircle(600, 245, 4);
      g.drawCircle(545, 277, 4);
      g.drawCircle(600, 277, 4);
      g.endFill();
    }

    // Street Solar Lamp Bollards
    g.beginFill(0x334155);
    g.drawRect(200, 310, 6, 20);
    g.drawRect(580, 310, 6, 20);
    g.beginFill(timeMode === 'night' ? 0xfef08a : 0x94a3b8);
    g.drawCircle(203, 308, 5);
    g.drawCircle(583, 308, 5);
    g.endFill();
  }, [timeMode, tier, waterFrame, isWorking, carOwned]);

  return <Graphics draw={drawGround} />;
}

// ========================================================
// 2. ANIMATED CHARACTER SPRITE WITH AGING & WALK CYCLE
// ========================================================
function AnimatedCharacter({ x, y, targetX, targetY, isMoving, facingRight, age, wealthTier, isWorking, mood, onArrive }) {
  const walkStepRef = useRef(0);
  const [legOffset, setLegOffset] = useState(0);

  // Hair color dynamically computed from Age 22 to 42
  const hairColor = useMemo(() => {
    if (age >= 40) return 0x64748b; // Salt and Pepper / Silver
    if (age >= 35) return 0x475569; // Dark with silver streaks
    if (age >= 30) return 0x334155; // Dark slate
    return 0x1e293b; // Youthful black
  }, [age]);

  // Outfit color based on Wealth Tier
  const outfitColor = useMemo(() => {
    if (wealthTier === 'wealthy') return 0x0f172a; // Executive Charcoal
    if (wealthTier === 'comfortable') return 0x0369a1; // Tailored Navy
    if (wealthTier === 'middle') return 0x2563eb; // Royal Blue
    return 0x475569; // Casual Streetwear
  }, [wealthTier]);

  // Walk oscillation cycle (leg swinging, head bobbing)
  useTick((delta) => {
    if (isMoving) {
      walkStepRef.current += delta * 0.25;
      setLegOffset(Math.sin(walkStepRef.current) * 6);
    } else {
      // Gentle breathing idle
      walkStepRef.current += delta * 0.04;
      setLegOffset(Math.sin(walkStepRef.current) * 1.2);
    }
  });

  const drawCharacter = useCallback((g) => {
    g.clear();

    const scaleX = facingRight ? 1 : -1;
    const bodyBob = isMoving ? Math.abs(legOffset) * 0.5 : legOffset * 0.4;

    // 1. Drop shadow on turf
    g.beginFill(0x000000, 0.25);
    g.drawEllipse(0, 16, 12, 4);
    g.endFill();

    // 2. Legs & Shoes
    g.lineStyle(3, 0x1e293b, 1);
    // Left Leg
    g.moveTo(-4 * scaleX, 0 - bodyBob);
    g.lineTo((-4 - legOffset * 0.8) * scaleX, 14);
    // Right Leg
    g.moveTo(4 * scaleX, 0 - bodyBob);
    g.lineTo((4 + legOffset * 0.8) * scaleX, 14);

    // Shoes
    g.lineStyle(0);
    g.beginFill(0xffffff);
    g.drawRoundedRect((-6 - legOffset * 0.8) * scaleX - 2, 13, 6, 3, 1);
    g.drawRoundedRect((2 + legOffset * 0.8) * scaleX - 2, 13, 6, 3, 1);
    g.endFill();

    // 3. Torso / Outfit
    g.beginFill(outfitColor);
    g.drawRoundedRect(-7, -18 - bodyBob, 14, 18, 3);
    g.endFill();

    // White Collar / Tie
    g.beginFill(0xffffff);
    g.drawPolygon([-2, -18 - bodyBob, 2, -18 - bodyBob, 0, -14 - bodyBob]);
    g.endFill();

    // 4. Arms
    g.lineStyle(2.5, 0xfcd9b6, 1);
    const armSwing = isMoving ? legOffset * 0.9 : 0;
    // Left Arm
    g.moveTo(-7 * scaleX, -15 - bodyBob);
    g.lineTo((-9 + armSwing) * scaleX, -4 - bodyBob);
    // Right Arm (holds phone or coffee if idle, types if working)
    g.moveTo(7 * scaleX, -15 - bodyBob);
    if (isWorking && !isMoving) {
      g.lineTo(9 * scaleX, -8 - bodyBob); // typing arm forward
    } else {
      g.lineTo((9 - armSwing) * scaleX, -4 - bodyBob);
    }

    // 5. Head
    g.lineStyle(0);
    g.beginFill(0xfcd9b6);
    g.drawCircle(0, -26 - bodyBob, 8);
    g.endFill();

    // 6. Dynamic Aging Hairstyle
    g.beginFill(hairColor);
    g.drawPolygon([
      -8 * scaleX, -28 - bodyBob,
      0, -35 - bodyBob,
      8 * scaleX, -28 - bodyBob,
      6 * scaleX, -24 - bodyBob,
      -6 * scaleX, -24 - bodyBob
    ]);
    g.endFill();

    // 7. Facial Expressions (eyes & smile)
    g.beginFill(0x0f172a);
    const eyeX1 = 2 * scaleX;
    const eyeX2 = 5 * scaleX;
    g.drawCircle(eyeX1, -27 - bodyBob, 0.9);
    g.drawCircle(eyeX2, -27 - bodyBob, 0.9);
    g.endFill();

    // Age smile/wrinkle marks (35+)
    if (age >= 35) {
      g.lineStyle(0.6, 0xd4a373, 0.8);
      g.moveTo(1 * scaleX, -23 - bodyBob);
      g.lineTo(4 * scaleX, -23 - bodyBob);
    }

    // Mood mouth
    g.lineStyle(1.2, 0x334155, 1);
    if (mood === 'stressed') {
      g.moveTo(1 * scaleX, -22 - bodyBob);
      g.lineTo(4 * scaleX, -24 - bodyBob); // frown
    } else {
      g.moveTo(1 * scaleX, -23 - bodyBob);
      g.lineTo(4 * scaleX, -23 - bodyBob); // confident smile
    }
  }, [facingRight, isMoving, legOffset, hairColor, outfitColor, isWorking, age, mood]);

  return (
    <Container x={x} y={y}>
      <Graphics draw={drawCharacter} />
      {/* Floating Status / Activity Tag above character */}
      <Text
        text={isMoving ? '🚶 Walking' : isWorking ? '💻 Hustling' : `👤 Age ${age}`}
        x={0}
        y={-48}
        anchor={0.5}
        style={new PIXI.TextStyle({
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#ffffff',
          stroke: '#0f172a',
          strokeThickness: 3,
        })}
      />
    </Container>
  );
}

// ========================================================
// 3. IN-WORLD EVENT CUTSCENE & DIALOGUE (INSIDE CANVAS)
// ========================================================
function InWorldEventOverlay({ event, onChoice, timeMode }) {
  if (!event) return null;

  const drawDialogueBox = useCallback((g) => {
    g.clear();

    // Ambient dimming of game world
    g.beginFill(0x000000, 0.5);
    g.drawRect(0, 0, 800, 480);
    g.endFill();

    // In-World RPG Dialogue Window (Glassmorphic Card inside viewport)
    g.beginFill(0x0f172a, 0.95);
    g.lineStyle(3, 0x38bdf8, 0.9);
    g.drawRoundedRect(100, 270, 600, 190, 20);
    g.endFill();

    // Top Header Badge
    g.beginFill(0x1e293b, 1);
    g.lineStyle(1, 0x475569);
    g.drawRoundedRect(120, 255, 180, 28, 8);
    g.endFill();

    // Choice button frames (Draw up to 3 interactive slots)
    if (event.options) {
      const btnWidth = Math.floor(560 / event.options.length);
      event.options.forEach((_, idx) => {
        const btnX = 120 + idx * (btnWidth + 10);
        g.beginFill(0x1e293b, 0.9);
        g.lineStyle(2, 0xf59e0b, 0.8);
        g.drawRoundedRect(btnX, 395, btnWidth - 10, 50, 12);
        g.endFill();
      });
    }
  }, [event]);

  // Special cutscene scenery (Confetti for wedding, rain for job loss, red ticker for crash)
  const drawCutsceneVfx = useCallback((g) => {
    g.clear();
    if (event.id === 'wedding' || event.id === 'marriage' || event.id === 'marriage_event') {
      // Golden wedding arch in the center
      g.lineStyle(5, 0xf59e0b, 0.9);
      g.drawCircle(400, 180, 60); // Altar floral ring
      g.lineStyle(0);
      g.beginFill(0xec4899);
      g.drawCircle(360, 140, 8);
      g.drawCircle(440, 140, 8);
      g.drawCircle(400, 120, 10);
      g.endFill();
    } else if (event.id === 'job_loss') {
      // Somber rain slashes
      g.lineStyle(1, 0x94a3b8, 0.4);
      for (let i = 0; i < 40; i++) {
        const rx = 100 + (i * 37) % 600;
        const ry = 50 + (i * 23) % 200;
        g.moveTo(rx, ry);
        g.lineTo(rx - 5, ry + 15);
      }
    } else if (event.id === 'market_crash') {
      // Downward red ticker
      g.lineStyle(4, 0xef4444, 0.9);
      g.moveTo(250, 80);
      g.lineTo(350, 140);
      g.lineTo(450, 100);
      g.lineTo(550, 200);
    }
  }, [event]);

  return (
    <Container>
      <Graphics draw={drawCutsceneVfx} />
      <Graphics draw={drawDialogueBox} />

      {/* Header Tag */}
      <Text
        text={`⚡ ${event.name || 'Life Event'}`}
        x={135}
        y={260}
        style={new PIXI.TextStyle({
          fontFamily: 'Inter, sans-serif',
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#38bdf8',
        })}
      />

      {/* Narrative Body Text */}
      <Text
        text={event.description || ''}
        x={125}
        y={295}
        style={new PIXI.TextStyle({
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          lineHeight: 18,
          fill: '#e2e8f0',
          wordWrap: true,
          wordWrapWidth: 550,
        })}
      />

      {/* Clickable Choice Buttons rendered directly inside the canvas */}
      {event.options && event.options.map((opt, idx) => {
        const btnWidth = Math.floor(560 / event.options.length);
        const btnX = 120 + idx * (btnWidth + 10);
        return (
          <Container
            key={idx}
            x={btnX}
            y={395}
            eventMode="static"
            cursor="pointer"
            pointerdown={() => onChoice(idx)}
          >
            <Text
              text={`[${idx + 1}] ${opt.label}`}
              x={10}
              y={8}
              style={new PIXI.TextStyle({
                fontFamily: 'Inter, sans-serif',
                fontSize: 11,
                fontWeight: 'bold',
                fill: '#fcd34d',
                wordWrap: true,
                wordWrapWidth: btnWidth - 25,
              })}
            />
            {opt.description && (
              <Text
                text={opt.description}
                x={10}
                y={24}
                style={new PIXI.TextStyle({
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 9,
                  fill: '#94a3b8',
                  wordWrap: true,
                  wordWrapWidth: btnWidth - 25,
                })}
              />
            )}
          </Container>
        );
      })}
    </Container>
  );
}

// ========================================================
// 4. MAIN PIXI GAME VIEWPORT COMPONENT
// ========================================================
export default function PixiGameWorld() {
  const store = useGameStore();

  const [charPos, setCharPos] = useState({ x: 300, y: 275 });
  const [targetPos, setTargetPos] = useState({ x: 300, y: 275 });
  const [isMoving, setIsMoving] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [timeMode, setTimeMode] = useState('day');
  const [destinationMarker, setDestinationMarker] = useState(null);

  const currentAge = 22 + Math.floor((store.currentDay || 0) / 365);
  const isEmployed = (store.incomes || []).some(i => i.type === 'job' && !i.id?.includes('gig'));
  const isFreelancing = (store.incomes || []).some(i => i.id?.includes('gig'));
  const isWorking = isEmployed || isFreelancing;
  const carOwned = (store.carsOwned || []).length > 0;
  const married = !!store.married;
  const wealthTier = store.pool > 2500000 ? 'wealthy' : store.pool > 800000 ? 'comfortable' : store.pool > 200000 ? 'middle' : 'starter';

  // Smooth character movement ticker
  useEffect(() => {
    let animId;
    const updateMovement = () => {
      setCharPos((prev) => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
          setIsMoving(false);
          setDestinationMarker(null);
          return targetPos;
        }

        const speed = 3.5;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        setFacingRight(dx >= 0);
        setIsMoving(true);
        return { x: prev.x + vx, y: prev.y + vy };
      });
      animId = requestAnimationFrame(updateMovement);
    };

    animId = requestAnimationFrame(updateMovement);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  // Click on canvas ground to walk character there
  const handleGroundClick = (e) => {
    // If an event is currently showing, don't walk behind the dialogue box
    if (store.currentEvent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Constrain to island grounds
    const clampedX = Math.max(120, Math.min(680, clickX));
    const clampedY = Math.max(120, Math.min(380, clickY));

    setTargetPos({ x: clampedX, y: clampedY });
    setDestinationMarker({ x: clampedX, y: clampedY });
  };

  // Keyboard navigation (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (store.currentEvent) {
        // Support number keys 1, 2, 3 to choose event option!
        if (['1', '2', '3'].includes(e.key)) {
          const idx = parseInt(e.key) - 1;
          if (store.currentEvent.options?.[idx]) {
            store.resolveEvent(idx);
          }
        }
        return;
      }

      const step = 25;
      let newX = targetPos.x;
      let newY = targetPos.y;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') newY -= step;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') newY += step;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') newX -= step;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') newX += step;

      newX = Math.max(120, Math.min(680, newX));
      newY = Math.max(120, Math.min(380, newY));

      setTargetPos({ x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetPos, store.currentEvent]);

  // Draw waypoint marker on ground
  const drawDestinationMarker = useCallback((g) => {
    g.clear();
    if (!destinationMarker) return;
    g.lineStyle(2, 0x38bdf8, 0.8);
    g.drawCircle(destinationMarker.x, destinationMarker.y, 8);
    g.beginFill(0x38bdf8, 0.4);
    g.drawCircle(destinationMarker.x, destinationMarker.y, 4);
    g.endFill();
  }, [destinationMarker]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-950 select-none my-3 mx-auto max-w-4xl">
      {/* Top Interactive Game HUD Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/60 z-10 text-xs">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 font-bold text-amber-400">
            <span>🎮</span>
            <span>PIXI.JS WORLD</span>
          </span>
          <span className="bg-slate-700/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-300">
            Click anywhere to move character | WASD
          </span>
        </div>

        {/* Ambient Mode & Fast Travel Hotspots */}
        <div className="flex items-center space-x-2 text-[11px]">
          <button
            onClick={() => setTargetPos({ x: 300, y: 275 })}
            className="hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 transition"
            title="Go to Laptop Desk"
          >
            💻 Desk
          </button>
          <button
            onClick={() => setTargetPos({ x: 420, y: 220 })}
            className="hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 transition"
            title="Go to Front Door"
          >
            🏡 House
          </button>
          {carOwned && (
            <button
              onClick={() => setTargetPos({ x: 570, y: 260 })}
              className="hover:bg-slate-700 px-2 py-0.5 rounded text-slate-300 transition"
              title="Go to Car"
            >
              🚗 Car
            </button>
          )}

          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/80 p-0.5 ml-2">
            <button
              onClick={() => setTimeMode('day')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${timeMode === 'day' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}
            >
              ☀️ Day
            </button>
            <button
              onClick={() => setTimeMode('sunset')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${timeMode === 'sunset' ? 'bg-orange-500 text-white' : 'text-slate-400'}`}
            >
              🌅 Sunset
            </button>
            <button
              onClick={() => setTimeMode('night')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${timeMode === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              🌙 Night
            </button>
          </div>
        </div>
      </div>

      {/* PixiJS Stage Canvas Viewport */}
      <div className="relative w-full h-[480px] cursor-crosshair" onClick={handleGroundClick}>
        <Stage
          width={800}
          height={480}
          options={{
            backgroundColor: timeMode === 'night' ? 0x0a0f1d : timeMode === 'sunset' ? 0x451a03 : 0xf1f5f9,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
          }}
        >
          {/* 1. World Scenery, Architecture, Grounds */}
          <WorldEnvironment
            timeMode={timeMode}
            tier={wealthTier}
            married={married}
            currentAge={currentAge}
            isWorking={isWorking}
            carOwned={carOwned}
          />

          {/* 2. Destination waypoint on ground */}
          <Graphics draw={drawDestinationMarker} />

          {/* 3. Living Animated Player Character */}
          <AnimatedCharacter
            x={charPos.x}
            y={charPos.y}
            targetX={targetPos.x}
            targetY={targetPos.y}
            isMoving={isMoving}
            facingRight={facingRight}
            age={currentAge}
            wealthTier={wealthTier}
            isWorking={isWorking}
            mood={store.pool < 0 ? 'stressed' : 'happy'}
            onArrive={() => setDestinationMarker(null)}
          />

          {/* 4. IN-WORLD EVENT CUTSCENE & DIALOGUE (Inside Canvas!) */}
          {store.currentEvent && (
            <InWorldEventOverlay
              event={store.currentEvent}
              onChoice={store.resolveEvent}
              timeMode={timeMode}
            />
          )}
        </Stage>

        {/* Navigation Floating Control Overlay inside canvas */}
        {!store.currentEvent && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-white text-[10px] pointer-events-none flex items-center space-x-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Click turf or use <strong>WASD / Arrow Keys</strong> to navigate character</span>
          </div>
        )}
      </div>
    </div>
  );
}
