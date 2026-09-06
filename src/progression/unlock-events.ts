import { ActiveEventCard } from '../events/event-types';
import { FeatureUnlockDef } from './unlock-types';

export function createUnlockMilestoneCard(
  feature: FeatureUnlockDef,
  day: number
): ActiveEventCard {
  return {
    instanceId: `card-unlock-${feature.id}-${day}-${Date.now()}`,
    defId: `unlock-${feature.id}`,
    category: 'milestone',
    title: `🎉 UNLOCKED: ${feature.name}!`,
    emoji: feature.icon,
    narrative: `Congratulations! ${feature.tagline} This capability is now fully operational in your Life Status panel.`,
    day,
    choices: [
      {
        id: 'acknowledge-unlock',
        label: `Start Using ${feature.name} 🚀`,
        emoji: '✨',
        preview: [
          { text: 'Feature Active', type: 'positive' }
        ]
      }
    ],
    resolved: false
  };
}
