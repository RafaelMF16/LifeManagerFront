import { useId } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import type { SavingsGoalResponseDto } from '../../types/SavingsGoalDtos'
import { SAVINGS_GOAL_ICONS, savingsGoalIcon } from '../../utils/savingsGoal'
import { toYearMonth } from '../../utils/yearMonth'
import { toFormAmount } from '../../validation/amountSchema'
import { savingsGoalErrorFieldMap } from '../../validation/savingsGoalErrorMap'
import { SAVINGS_GOAL_NAME_MAX_LENGTH, createSavingsGoalSchema } from '../../validation/savingsGoalSchema'
import type { SavingsGoalFormValues } from '../../validation/savingsGoalSchema'
import MoneyInput from '../MoneyInput/MoneyInput'
import MonthYearSelect from '../MonthYearSelect/MonthYearSelect'
import './SavingsGoalFormModal.css'

interface SavingsGoalFormModalProps {
  /** The goal being edited; omitted when creating a new one. */
  goal?: SavingsGoalResponseDto
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: SavingsGoalFormValues) => Promise<void>
}

function SavingsGoalFormModal({ goal, onClose, onSubmit }: SavingsGoalFormModalProps) {
  const { t: translate, i18n } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const iconLabelId = useId()
  const { show: showErrorModal } = useErrorModal()
  const isEditing = Boolean(goal)

  // A deadline can't be before the current month, on create and on edit (`SavingsGoal.TargetMonthInPast`).
  const currentMonth = toYearMonth(new Date())

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(createSavingsGoalSchema(currentMonth), {
    defaultValues: {
      name: goal?.name ?? '',
      targetAmount: goal ? toFormAmount(goal.targetAmount, i18n.language) : '',
      targetMonth: goal?.targetMonth ?? '',
      initialAmount: goal && goal.initialAmount > 0 ? toFormAmount(goal.initialAmount, i18n.language) : '',
      icon: savingsGoalIcon(goal?.icon),
    },
  })
  const targetMonth = useWatch({ control, name: 'targetMonth' })
  const icon = useWatch({ control, name: 'icon' })

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, savingsGoalErrorFieldMap, translate)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate(isEditing ? 'finance:savingsGoals.form.editTitle' : 'finance:savingsGoals.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-goal-form__fields">
            <Input
              label={translate('finance:savingsGoals.form.nameLabel')}
              placeholder={translate('finance:savingsGoals.form.namePlaceholder')}
              maxLength={SAVINGS_GOAL_NAME_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              error={fieldError(errors.name?.message)}
              {...register('name')}
            />

            <div className="lm-goal-form__row">
              <MoneyInput
                label={translate('finance:savingsGoals.form.targetLabel')}
                prefix={translate('finance:savingsGoals.form.amountPrefix')}
                placeholder={translate('finance:savingsGoals.form.amountPlaceholder')}
                error={fieldError(errors.targetAmount?.message)}
                {...register('targetAmount')}
              />
              <MoneyInput
                label={translate('finance:savingsGoals.form.initialLabel')}
                prefix={translate('finance:savingsGoals.form.amountPrefix')}
                placeholder={translate('finance:savingsGoals.form.amountPlaceholder')}
                hint={translate('finance:savingsGoals.form.initialHint')}
                error={fieldError(errors.initialAmount?.message)}
                {...register('initialAmount')}
              />
            </div>

            <MonthYearSelect
              label={translate('finance:savingsGoals.form.targetMonthLabel')}
              value={targetMonth}
              onChange={(value) => setValue('targetMonth', value, { shouldValidate: true, shouldDirty: true })}
              firstYear={Number(currentMonth.slice(0, 4))}
              emptyLabel={translate('finance:savingsGoals.form.noDeadline')}
              hint={translate('finance:savingsGoals.form.targetMonthHint')}
              error={fieldError(errors.targetMonth?.message)}
            />

            <div className="lm-goal-form__group">
              <span id={iconLabelId} className="lm-goal-form__label">
                {translate('finance:savingsGoals.form.iconLabel')}
              </span>
              <div className="lm-goal-form__icons" role="group" aria-labelledby={iconLabelId}>
                {SAVINGS_GOAL_ICONS.map((option) => {
                  const picked = icon === option
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={picked}
                      aria-label={translate(`finance:savingsGoals.form.icons.${option}`)}
                      title={translate(`finance:savingsGoals.form.icons.${option}`)}
                      className={`lm-goal-form__icon${picked ? ' lm-goal-form__icon--picked' : ''}`}
                      onClick={() => setValue('icon', option, { shouldDirty: true })}
                    >
                      <Icon name={option} size={18} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
              {errors.icon?.message ? (
                <span className="lm-goal-form__error" role="alert">
                  {translate(errors.icon.message)}
                </span>
              ) : null}
            </div>
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-goal-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'finance:savingsGoals.form.save' : 'finance:savingsGoals.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default SavingsGoalFormModal
