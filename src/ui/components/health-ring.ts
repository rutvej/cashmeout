import { PlayerState } from '../../types/game';

export function renderHealthRing(player: PlayerState): string {
  const phys = Math.round(Math.max(0, Math.min(100, player.health.physical)));
  const ment = Math.round(Math.max(0, Math.min(100, player.health.mental)));
  const energ = Math.round(Math.max(0, Math.min(100, player.health.energy)));
  const overall = Math.round((phys + ment + energ) / 3);

  // SVG circle calculation (radius 18, circumference ~113)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall / 100) * circumference;

  let strokeColor = '#22c55e'; // green
  if (overall < 40) strokeColor = '#ef4444'; // red
  else if (overall < 70) strokeColor = '#fbbf24'; // gold

  return `
    <div class="health-vitality-widget" id="health-widget" title="Physical: ${phys}% | Mental: ${ment}% | Energy: ${energ}%">
      <div class="ring-svg-container">
        <svg width="46" height="46" viewBox="0 0 46 46">
          <circle class="ring-bg" cx="23" cy="23" r="${radius}"></circle>
          <circle
            class="ring-progress"
            cx="23"
            cy="23"
            r="${radius}"
            stroke="${strokeColor}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
          ></circle>
        </svg>
        <span class="ring-percent-text">${overall}%</span>
      </div>
      <div class="vitality-bars-mini">
        <div class="mini-bar-row" title="Physical Health: ${phys}%">
          <span class="mini-bar-dot" style="background:#22c55e;"></span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${phys}%; background:#22c55e;"></div></div>
        </div>
        <div class="mini-bar-row" title="Mental Health: ${ment}%">
          <span class="mini-bar-dot" style="background:#c084fc;"></span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${ment}%; background:#c084fc;"></div></div>
        </div>
        <div class="mini-bar-row" title="Energy: ${energ}%">
          <span class="mini-bar-dot" style="background:#fbbf24;"></span>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${energ}%; background:#fbbf24;"></div></div>
        </div>
      </div>
    </div>
  `;
}
