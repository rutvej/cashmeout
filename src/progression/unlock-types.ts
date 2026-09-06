import { GameState } from '../types/game';

export type FeatureId =
  | 'banking'
  | 'loans'
  | 'insurance'
  | 'stocks'
  | 'gold'
  | 'real-estate'
  | 'business';

export interface FeatureUnlockDef {
  id: FeatureId;
  name: string;
  icon: string;
  tagline: string;
  requirementText: string;
  unlockDayMin?: number;
  unlockNetWorthMin?: number;
  condition: (state: GameState) => boolean;
  progress: (state: GameState) => { current: number; target: number; pct: number };
}
