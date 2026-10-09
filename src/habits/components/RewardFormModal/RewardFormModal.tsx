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
import type { RewardResponseDto } from '../../types/RewardDtos'
import { REWARD_ICONS, rewardIcon } from '../../utils/rewardIcons'
import { REWARD_ARCHIVED_CODE, REWARD_NOT_FOUND_CODE, rewardErrorFieldMap } from '../../validation/rewardErrorMap'
import { REWARD_MAX_COST, REWARD_MIN_COST, REWARD_NAME_MAX_LENGTH, rewardSchema } from '../../validation/rewardSchema'
import type { RewardFormValues } from '../../validation/rewardSchema'
import './RewardFormModal.css'

interface RewardFormModalProps {
  /** The reward being edited; omitted when creating a new one. */
  reward?: RewardResponseDto
  /** Creating only: values to start from, e.g. a starter reward. */
  initialValues?: RewardFormValues
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: RewardFormValues) => Promise<void>
}

function toDefaultValues(reward: RewardResponseDto | undefined, initialValues?: RewardFormValues): RewardFormValues {
  if (!reward && initialValues) return initialValues
  return {
    name: reward?.name ?? '',
    cost: reward ? String(reward.cost) : '',
    icon: rewardIcon(reward?.icon),
  }
}

function RewardFormModal({ reward, initialValues, onClose, onSubmit }: RewardFormModalProps) {
  const { t: translate } = useTranslation(['habits', 'common'])
  const titleId = useId()
  const iconLabelId = useId()
  const { show: showErrorModal } = useErrorModal()
  const isEditing = Boolean(reward)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(rewardSchema, { defaultValues: toDefaultValues(reward, initialValues) })
  const icon = useWatch({ control, name: 'icon' })

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        // Archived (or gone) in another tab while the form was open: there is nothing to save.
        const fallback =
          err.code === REWARD_ARCHIVED_CODE
            ? 'habits:shop.validation.archived'
            : err.code === REWARD_NOT_FOUND_CODE
              ? 'habits:shop.validation.notFound'
              : undefined
        applyApiErrorToForm(err, setError, rewardErrorFieldMap, translate, fallback)
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
            {translate(isEditing ? 'habits:shop.form.editTitle' : 'habits:shop.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('habits:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-reward-form__fields">
            <Input
              label={translate('habits:shop.form.nameLabel')}
              placeholder={translate('habits:shop.form.namePlaceholder')}
              maxLength={REWARD_NAME_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              error={fieldError(errors.name?.message)}
              {...register('name')}
            />

            <Input
              type="number"
              label={translate('habits:shop.form.costLabel')}
              hint={translate('habits:shop.form.costHint')}
              min={REWARD_MIN_COST}
              max={REWARD_MAX_COST}
              inputMode="numeric"
              numeric
              icon="coins"
              containerClassName="lm-reward-form__cost"
              error={fieldError(errors.cost?.message)}
              {...register('cost')}
            />

            <div className="lm-reward-form__group">
              <span id={iconLabelId} className="lm-reward-form__label">
                {translate('habits:shop.form.iconLabel')}
              </span>
              <div className="lm-reward-form__icons" role="group" aria-labelledby={iconLabelId}>
                {REWARD_ICONS.map((option) => {
                  const picked = icon === option
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={picked}
                      aria-label={translate(`habits:shop.form.icons.${option}`)}
                      title={translate(`habits:shop.form.icons.${option}`)}
                      className={`lm-reward-form__icon${picked ? ' lm-reward-form__icon--picked' : ''}`}
                      onClick={() => setValue('icon', option, { shouldDirty: true })}
                    >
                      <Icon name={option} size={18} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </div>

            {isEditing ? <p className="lm-reward-form__note">{translate('habits:shop.form.editHint')}</p> : null}
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-reward-form__server-error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('habits:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'habits:shop.form.save' : 'habits:shop.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default RewardFormModal
