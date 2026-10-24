import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toFormAmount } from '../validation/amountSchema'
import { budgetPlanSchema, readTotal } from '../validation/budgetPlanSchema'

interface TotalField {
  month: string
  text: string
  touched: boolean
  /** A translation key from the save's response. */
  serverError: string | null
}

/**
 * The budget's total as the text typed in its field. The text follows the draft's total (`draftTotal`) whenever the
 * draft changes from outside the field (a month loads, a discard, a copy), adjusted during render so the first
 * paint already has it; typing hands the total read from the text (null while it isn't one) to `onTotalChange`.
 */
export function useBudgetTotalField(month: string, draftTotal: number | null, onTotalChange: (total: number | null) => void) {
  const { i18n } = useTranslation()
  const [stored, setField] = useState<TotalField>({ month, text: '', touched: false, serverError: null })

  let field = stored
  const typedTotal = readTotal(field.text)
  // Another month, a total that came from outside, or a total taken away from outside (a discard). Text that
  // isn't a valid total yet (the user is typing) matches a draft without one, so it stays.
  if (field.month !== month || (draftTotal !== null && typedTotal !== draftTotal) || (draftTotal === null && typedTotal !== null)) {
    field = { month, text: draftTotal === null ? '' : toFormAmount(draftTotal, i18n.language), touched: false, serverError: null }
    setField(field)
  }

  const check = budgetPlanSchema.safeParse({ total: field.text })

  return {
    text: field.text,
    /** A translation key: the save's error, or the field's own once it was touched. */
    error: field.serverError ?? (field.touched && !check.success ? check.error.issues[0].message : null),
    change(text: string) {
      setField({ ...field, text, serverError: null })
      onTotalChange(readTotal(text))
    },
    /** Shows the field's own error from now on (on blur, or a save without a total). */
    touch() {
      setField({ ...field, touched: true })
    },
    /** Back to a fresh field, without errors (a discard). */
    reset() {
      setField({ ...field, touched: false, serverError: null })
    },
    showServerError(translationKey: string) {
      setField({ ...field, serverError: translationKey })
    },
  }
}
