import type { IconName } from '../../shared/components/Icon/Icon'
import type { HabitFormValues } from '../validation/habitSchema'
import type { RewardFormValues } from '../validation/rewardSchema'
import type { RewardIcon } from './rewardIcons'

type Translate = (key: string) => string

/**
 * Starter habits for an empty list: easy, daily and tied to a cue, since starting with 1 to 3 easy habits is what
 * keeps a streak going. Their texts live in `habits:onboarding.habits.<id>`.
 */
export const HABIT_TEMPLATES = [
  { id: 'water', icon: 'glass-water' },
  { id: 'read', icon: 'book-open' },
  { id: 'walk', icon: 'footprints' },
] as const satisfies readonly { id: string; icon: IconName }[]

export type HabitTemplateId = (typeof HABIT_TEMPLATES)[number]['id']

/** Starter rewards for an empty shop: things the player would do anyway, priced at a few days of easy habits. */
export const REWARD_TEMPLATES = [
  { id: 'games', cost: 50, icon: 'gamepad-2' },
  { id: 'coffee', cost: 30, icon: 'coffee' },
  { id: 'episode', cost: 40, icon: 'tv' },
] as const satisfies readonly { id: string; cost: number; icon: RewardIcon }[]

export type RewardTemplateId = (typeof REWARD_TEMPLATES)[number]['id']

export function isHabitTemplateId(value: unknown): value is HabitTemplateId {
  return HABIT_TEMPLATES.some((template) => template.id === value)
}

/** The habit form's values for a starter habit, in the UI language. */
export function habitTemplateValues(id: HabitTemplateId, translate: Translate): Partial<HabitFormValues> {
  return {
    name: translate(`habits:onboarding.habits.${id}.name`),
    trigger: translate(`habits:onboarding.habits.${id}.trigger`),
    kind: 'Positive',
    difficulty: 'Easy',
    frequencyType: 'Daily',
  }
}

/** The reward form's values for a starter reward, in the UI language. */
export function rewardTemplateValues(id: RewardTemplateId, translate: Translate): RewardFormValues {
  const template = REWARD_TEMPLATES.find((reward) => reward.id === id)!
  return { name: translate(`habits:onboarding.rewards.${id}`), cost: String(template.cost), icon: template.icon }
}
