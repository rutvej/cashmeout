import { GameState } from '../types/game';

export type EventCategory =
  | 'daily'
  | 'income'
  | 'dilemma'
  | 'health'
  | 'opportunity'
  | 'market'
  | 'npc'
  | 'milestone';

export interface ChoicePreview {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface ChoiceResult {
  outcomeText: string;
  moneyDelta?: number;
  physicalDelta?: number;
  mentalDelta?: number;
  energyDelta?: number;
  stressDelta?: number;
}

export interface EventChoice {
  id: string;
  label: string;
  emoji?: string;
  preview?: ChoicePreview[];
  disabled?: (state: GameState) => boolean;
  disabledReason?: string;
  onSelect: (state: GameState) => ChoiceResult;
}

export interface EventCardDef {
  id: string;
  category: EventCategory;
  title: string;
  emoji: string;
  narrative: string;
  priority: number; // Higher numbers appear first (e.g. 100 for medical emergencies, 50 for milestones)
  cooldownDays?: number; // Days before this card can appear again
  once?: boolean; // Can only trigger once per lifetime
  condition?: (state: GameState) => boolean;
  choices: EventChoice[];
}

export interface ActiveEventCard {
  instanceId: string;
  defId: string;
  category: EventCategory;
  title: string;
  emoji: string;
  narrative: string;
  day: number;
  choices: {
    id: string;
    label: string;
    emoji?: string;
    preview?: ChoicePreview[];
    disabled?: boolean;
    disabledReason?: string;
  }[];
  resolved?: boolean;
  selectedChoiceId?: string;
  outcomeText?: string;
  moneyDelta?: number;
}
