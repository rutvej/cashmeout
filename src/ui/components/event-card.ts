import { ActiveEventCard } from '../../events/event-types';

export function renderEventCard(
  card: ActiveEventCard,
  onChoose: (choiceId: string) => void
): HTMLElement {
  const cardEl = document.createElement('div');
  cardEl.className = `event-card-item ${card.resolved ? 'resolved' : ''}`;
  cardEl.id = `event-card-${card.instanceId}`;

  const categoryBadgeClass = getCategoryBadgeClass(card.category);
  const categoryLabel = getCategoryLabel(card.category);

  cardEl.innerHTML = `
    <div class="event-card-header">
      <span class="event-category-badge ${categoryBadgeClass}">${card.emoji} ${categoryLabel}</span>
      <span class="event-day-tag">Day ${card.day}</span>
    </div>
    
    <div class="event-card-body">
      <h3 class="event-card-title">${card.title}</h3>
      <p class="event-card-narrative">${card.narrative}</p>
    </div>

    <div class="event-card-choices" id="choices-${card.instanceId}">
      ${card.resolved ? renderResolvedState(card) : renderChoiceButtons(card)}
    </div>
  `;

  if (!card.resolved) {
    card.choices.forEach(c => {
      const btn = cardEl.querySelector(`#btn-choice-${c.id}`);
      if (btn && !c.disabled) {
        btn.addEventListener('click', () => {
          // Add click pop effect
          btn.classList.add('pop-press');
          onChoose(c.id);
        });
      }
    });
  }

  return cardEl;
}

function renderChoiceButtons(card: ActiveEventCard): string {
  return card.choices.map(c => {
    const disabledAttr = c.disabled ? 'disabled' : '';
    const disabledClass = c.disabled ? 'btn-choice-disabled' : '';
    const previewsHtml = c.preview ? c.preview.map(p => `
      <span class="choice-preview-pill preview-${p.type}">${p.text}</span>
    `).join('') : '';

    return `
      <button class="btn-event-choice ${disabledClass}" id="btn-choice-${c.id}" ${disabledAttr}>
        <div class="choice-main-row">
          <span class="choice-emoji">${c.emoji || '👉'}</span>
          <span class="choice-label">${c.label}</span>
        </div>
        ${c.disabled && c.disabledReason ? `
          <div class="choice-disabled-note">⚠️ ${c.disabledReason}</div>
        ` : ''}
        ${previewsHtml ? `<div class="choice-previews-row">${previewsHtml}</div>` : ''}
      </button>
    `;
  }).join('');
}

function renderResolvedState(card: ActiveEventCard): string {
  const chosen = card.choices.find(c => c.id === card.selectedChoiceId);
  const label = chosen ? chosen.label : 'Completed';
  return `
    <div class="event-resolved-box">
      <div class="resolved-header">
        <span class="resolved-check">✓</span>
        <span class="resolved-label">Chosen: <strong>${label}</strong></span>
      </div>
      ${card.outcomeText ? `<div class="resolved-outcome-text">${card.outcomeText}</div>` : ''}
    </div>
  `;
}

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'milestone': return 'badge-cat-milestone';
    case 'health': return 'badge-cat-health';
    case 'opportunity': return 'badge-cat-opportunity';
    case 'market': return 'badge-cat-market';
    case 'npc': return 'badge-cat-npc';
    case 'income': return 'badge-cat-income';
    case 'dilemma': return 'badge-cat-dilemma';
    default: return 'badge-cat-daily';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'milestone': return 'Milestone';
    case 'health': return 'Health & Vitality';
    case 'opportunity': return 'Opportunity';
    case 'market': return 'Market Pulse';
    case 'npc': return 'City Resident';
    case 'income': return 'Income & Cashflow';
    case 'dilemma': return 'Life Dilemma';
    default: return 'Daily Life';
  }
}
