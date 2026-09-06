import { GameState } from '../types/game';
import { FeatureId, FeatureUnlockDef } from './unlock-types';
import { FEATURE_UNLOCKS } from './unlock-catalog';

export class UnlockManager {
  private unlockedFeatures: Set<FeatureId> = new Set();

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('cashflow_unlocked_features');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            arr.forEach((id: FeatureId) => this.unlockedFeatures.add(id));
          }
        }
      }
    } catch {
      // ignore
    }
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          'cashflow_unlocked_features',
          JSON.stringify(Array.from(this.unlockedFeatures))
        );
      }
    } catch {
      // ignore
    }
  }

  public isUnlocked(featureId: FeatureId): boolean {
    return this.unlockedFeatures.has(featureId);
  }

  /**
   * Scans all features against the current game state.
   * Returns newly unlocked features that weren't previously unlocked.
   */
  public checkNewUnlocks(state: GameState): FeatureUnlockDef[] {
    const newlyUnlocked: FeatureUnlockDef[] = [];

    for (const def of FEATURE_UNLOCKS) {
      if (!this.unlockedFeatures.has(def.id)) {
        if (def.condition(state)) {
          this.unlockedFeatures.add(def.id);
          newlyUnlocked.push(def);
        }
      }
    }

    if (newlyUnlocked.length > 0) {
      this.save();
    }

    return newlyUnlocked;
  }

  public getFeatureDef(featureId: FeatureId): FeatureUnlockDef | undefined {
    return FEATURE_UNLOCKS.find(f => f.id === featureId);
  }
}
