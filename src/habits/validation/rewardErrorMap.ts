import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { RewardFormValues } from './rewardSchema'

// Espelha os códigos de LifeManager.Domain/Rewards/Errors/RewardErrors.cs
export const REWARD_NOT_FOUND_CODE = 'Rewards.NotFound'
export const REWARD_NAME_ALREADY_EXISTS_CODE = 'Rewards.NameAlreadyExists'
export const REWARD_ARCHIVED_CODE = 'Rewards.Archived'
export const REWARD_INSUFFICIENT_COINS_CODE = 'Rewards.InsufficientCoins'
export const REWARD_REDEMPTION_NOT_FOUND_CODE = 'Rewards.RedemptionNotFound'
export const REWARD_UNDO_OUTSIDE_WINDOW_CODE = 'Rewards.UndoOutsideWindow'
export const REWARD_ALREADY_UNDONE_CODE = 'Rewards.AlreadyUndone'

export const rewardErrorFieldMap: ApiErrorFieldMap<RewardFormValues> = {
  'Rewards.NameIsNullOrWhiteSpace': { field: 'name', message: 'habits:shop.validation.name.required' },
  'Rewards.NameTooLong': { field: 'name', message: 'habits:shop.validation.name.tooLong' },
  [REWARD_NAME_ALREADY_EXISTS_CODE]: { field: 'name', message: 'habits:shop.validation.name.taken' },
  'Rewards.InvalidCost': { field: 'cost', message: 'habits:shop.validation.cost.invalid' },
}
