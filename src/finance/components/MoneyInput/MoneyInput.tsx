import type { ChangeEvent, ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../../shared/components/Input/Input'
import { formatAmountInput } from '../../validation/amountSchema'

type MoneyInputProps = Omit<ComponentProps<typeof Input>, 'inputMode' | 'numeric' | 'type'>

/**
 * A money field that fills from the right, cents first (Banco Inter style): typing 5, 0, 0 shows "5,00".
 * The typed text is rewritten before `onChange` sees it, so it works with `register` and with a controlled value.
 */
function MoneyInput({ onChange, ...rest }: MoneyInputProps) {
  const { i18n } = useTranslation()

  function change(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    input.value = formatAmountInput(input.value, i18n.language)
    // Digits come in from the right, so the caret always stays at the end.
    input.setSelectionRange(input.value.length, input.value.length)
    onChange?.(event)
  }

  return <Input inputMode="numeric" autoComplete="off" {...rest} numeric onChange={change} />
}

export default MoneyInput
