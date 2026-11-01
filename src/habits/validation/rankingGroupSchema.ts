import { z } from 'zod'

// Espelha LifeManager.Domain/RankingGroups/ValueObjects/RankingGroupName.
export const RANKING_GROUP_NAME_MAX_LENGTH = 40

export const rankingGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'habits:ranking.validation.name.required' }) // code: RankingGroups.NameIsNullOrWhiteSpace
    .max(RANKING_GROUP_NAME_MAX_LENGTH, { message: 'habits:ranking.validation.name.tooLong' }), // code: RankingGroups.NameTooLong
})

export type RankingGroupFormValues = z.infer<typeof rankingGroupSchema>
