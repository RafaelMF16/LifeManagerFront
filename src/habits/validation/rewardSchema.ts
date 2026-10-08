import { z } from 'zod'
import { REWARD_ICONS } from '../utils/rewardIcons'

// Espelha LifeManager.Domain/Rewards (RewardName, Reward.MinCost/MaxCost).
export const REWARD_NAME_MAX_LENGTH = 60
export const REWARD_MIN_COST = 1
export const REWARD_MAX_COST = 100_000

const COST_PATTERN = /^\d{1,6}$/

export const rewardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'habits:shop.validation.name.required' }) // code: Rewards.NameIsNullOrWhiteSpace
    .max(REWARD_NAME_MAX_LENGTH, { message: 'habits:shop.validation.name.tooLong' }), // code: Rewards.NameTooLong
  /** Typed as text: whole coins only. */
  cost: z
    .string()
    .trim()
    .refine(
      (value) => COST_PATTERN.test(value) && Number(value) >= REWARD_MIN_COST && Number(value) <= REWARD_MAX_COST,
      { message: 'habits:shop.validation.cost.invalid' }, // code: Rewards.InvalidCost
    ),
  icon: z.enum(REWARD_ICONS),
})

export type RewardFormValues = z.infer<typeof rewardSchema>
