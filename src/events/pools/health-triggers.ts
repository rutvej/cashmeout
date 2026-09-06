import { EventCardDef } from '../event-types';

export const HEALTH_TRIGGER_EVENTS: EventCardDef[] = [
  {
    id: 'health-acid-reflux-warning',
    category: 'health',
    title: 'Severe Acid Reflux Flareup',
    emoji: '🔥',
    narrative: 'Days of spicy roadside oily snacks have ignited a blazing fire in your chest and throat. Breathing hurts.',
    priority: 45,
    cooldownDays: 6,
    condition: (state) => state.player.consequenceMeters.cheapFoodDays >= 10,
    choices: [
      {
        id: 'buy-antacids-clinic',
        label: 'Visit Clinic & Buy Antacids',
        emoji: '💊',
        preview: [
          { text: '-₹450', type: 'negative' },
          { text: '+15 Physical', type: 'positive' },
          { text: 'Resets Food Meter', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 450,
        disabledReason: 'Need ₹450 cash',
        onSelect: (state) => {
          state.player.money -= 450;
          state.player.health.physical = Math.min(100, state.player.health.physical + 15);
          state.player.consequenceMeters.cheapFoodDays = Math.max(0, state.player.consequenceMeters.cheapFoodDays - 6);
          return {
            outcomeText: 'Doctor prescribed proton-pump inhibitors and advised bland curd rice. The heartburn settles down.',
            moneyDelta: -450,
            physicalDelta: 15
          };
        }
      },
      {
        id: 'soda-and-prayer',
        label: 'Drink Lemon Soda & Bear It',
        emoji: '🍋',
        preview: [
          { text: '-₹20', type: 'neutral' },
          { text: '-10 Physical', type: 'negative' },
          { text: '+8 Stress', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money -= 20;
          state.player.health.physical = Math.max(0, state.player.health.physical - 10);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 8);
          return {
            outcomeText: 'The soda gave a momentary burp, but the burning returned with a vengeance. Sleep was impossible.',
            moneyDelta: -20,
            physicalDelta: -10,
            stressDelta: 8
          };
        }
      }
    ]
  },
  {
    id: 'health-lumbar-spasm-warning',
    category: 'health',
    title: 'Crippling Lower Back Pain',
    emoji: '⚡',
    narrative: 'You try to bend down to tie your shoelaces and a sharp needle of pain shoots up your lumbar spine. Too many hours slumped at your chair.',
    priority: 45,
    cooldownDays: 8,
    condition: (state) => state.player.consequenceMeters.noExerciseDays >= 18,
    choices: [
      {
        id: 'physio-massage-session',
        label: 'Book Physiotherapist Session',
        emoji: '🩺',
        preview: [
          { text: '-₹1,200', type: 'negative' },
          { text: '+20 Physical', type: 'positive' },
          { text: 'Spine Relieved', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 1200,
        disabledReason: 'Need ₹1,200 cash',
        onSelect: (state) => {
          state.player.money -= 1200;
          state.player.health.physical = Math.min(100, state.player.health.physical + 20);
          state.player.consequenceMeters.noExerciseDays = Math.max(0, state.player.consequenceMeters.noExerciseDays - 10);
          return {
            outcomeText: 'The physio cracked your thoracic joints and taught you core stabilization drills. You can stand tall again!',
            moneyDelta: -1200,
            physicalDelta: 20
          };
        }
      },
      {
        id: 'painkiller-spray',
        label: 'Spray Volini & Keep Working',
        emoji: '🧴',
        preview: [
          { text: '-₹150', type: 'neutral' },
          { text: '-12 Energy', type: 'negative' },
          { text: 'Temporary numb', type: 'neutral' }
        ],
        onSelect: (state) => {
          state.player.money -= 150;
          state.player.health.energy = Math.max(0, state.player.health.energy - 12);
          return {
            outcomeText: 'Smelling heavily of menthol, you powered through work, but the dull ache lurks beneath every movement.',
            moneyDelta: -150,
            energyDelta: -12
          };
        }
      }
    ]
  },
  {
    id: 'health-sudden-fever',
    category: 'health',
    title: 'Viral Fever & Body Aches',
    emoji: '🌡️',
    narrative: 'You wake up shiver-sweating with a 101°F fever. Your throat feels like sandpaper.',
    priority: 50,
    cooldownDays: 15,
    choices: [
      {
        id: 'take-sick-leave',
        label: 'Take 2 Days Sick Leave & Rest',
        emoji: '🛏️',
        preview: [
          { text: '-₹500 Meds', type: 'negative' },
          { text: '+30 Energy & Recovery', type: 'positive' }
        ],
        disabled: (state) => state.player.money < 500,
        disabledReason: 'Need ₹500 cash for meds',
        onSelect: (state) => {
          state.player.money -= 500;
          state.player.health.physical = Math.min(100, state.player.health.physical + 15);
          state.player.health.energy = Math.min(100, state.player.health.energy + 25);
          return {
            outcomeText: 'You drank warm ginger soup, took paracetamol, and slept like a log. Your immune system rebounded.',
            moneyDelta: -500,
            physicalDelta: 15,
            energyDelta: 25
          };
        }
      },
      {
        id: 'drag-to-work-fever',
        label: 'Pop Paracetamol & Go to Work',
        emoji: '💼',
        preview: [
          { text: '-₹50 Meds', type: 'neutral' },
          { text: '-25 Energy', type: 'negative' },
          { text: '-20 Physical', type: 'negative' }
        ],
        onSelect: (state) => {
          state.player.money -= 50;
          state.player.health.physical = Math.max(0, state.player.health.physical - 20);
          state.player.health.energy = Math.max(0, state.player.health.energy - 25);
          state.player.stats.stress = Math.min(100, state.player.stats.stress + 15);
          return {
            outcomeText: 'A nightmare day. You made sloppy typos, infected your coworker, and went home feeling completely drained.',
            moneyDelta: -50,
            physicalDelta: -20,
            energyDelta: -25,
            stressDelta: 15
          };
        }
      }
    ]
  }
];
