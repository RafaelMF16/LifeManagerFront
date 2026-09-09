import { useForm } from 'react-hook-form'
import type { FieldValues, Resolver, UseFormProps, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'

export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>,
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>, unknown, z.infer<TSchema>>({
    // zodResolver's inferred type collapses to FieldValues for a generic TSchema;
    // the cast restores the concrete shape without weakening the public signature above.
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<TSchema>, unknown, z.infer<TSchema>>,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
  })
}
