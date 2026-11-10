import { z } from 'zod'
import { userNameSchema } from '../../shared/validation/userFields'

// O mesmo nome do cadastro (UserName.Create no backend, com o trim de User.Rename).
export const editNameSchema = z.object({ name: userNameSchema })

export type EditNameFormValues = z.infer<typeof editNameSchema>
