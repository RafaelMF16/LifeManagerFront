import { useId } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import type { HabitDifficulty, HabitFrequencyType, HabitKind, HabitResponseDto } from '../../types/HabitDtos'
import { HABIT_ARCHIVED_CODE, HABIT_NOT_FOUND_CODE, habitErrorFieldMap } from '../../validation/habitErrorMap'
import {
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_MAX_TIMES_PER_WEEK,
  HABIT_MIN_TIMES_PER_WEEK,
  HABIT_NAME_MAX_LENGTH,
  HABIT_TRIGGER_MAX_LENGTH,
  habitSchema,
} from '../../validation/habitSchema'
import type { HabitFormValues } from '../../validation/habitSchema'
import WeekdayPicker from '../WeekdayPicker/WeekdayPicker'
import './HabitFormModal.css'

const KINDS: HabitKind[] = ['Positive', 'Negative']
const DIFFICULTIES: HabitDifficulty[] = ['Easy', 'Medium', 'Hard']
const FREQUENCIES: HabitFrequencyType[] = ['Daily', 'WeekDays', 'TimesPerWeek']

interface HabitFormModalProps {
  /** The habit being edited; omitted when creating a new one. */
  habit?: HabitResponseDto
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: HabitFormValues) => Promise<void>
}

function toDefaultValues(habit: HabitResponseDto | undefined): HabitFormValues {
  return {
    name: habit?.name ?? '',
    description: habit?.description ?? '',
    trigger: habit?.trigger ?? '',
    kind: habit?.kind ?? 'Positive',
    difficulty: habit?.difficulty ?? 'Easy',
    frequencyType: habit?.frequencyType ?? 'Daily',
    weekDays: habit?.weekDays ?? [],
    timesPerWeek: habit?.timesPerWeek ? String(habit.timesPerWeek) : '3',
  }
}

function HabitFormModal({ habit, onClose, onSubmit }: HabitFormModalProps) {
  const { t: translate } = useTranslation(['habits', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const isEditing = Boolean(habit)

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(habitSchema, { defaultValues: toDefaultValues(habit) })
  const kind = useWatch({ control, name: 'kind' })
  const difficulty = useWatch({ control, name: 'difficulty' })
  const frequencyType = useWatch({ control, name: 'frequencyType' })
  const weekDays = useWatch({ control, name: 'weekDays' })

  const fieldError = (message: string | undefined) => (message ? translate(message) : undefined)

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        // Archived (or gone) in another tab while the form was open: there is nothing to save.
        const fallback =
          err.code === HABIT_ARCHIVED_CODE
            ? 'habits:habits.validation.archived'
            : err.code === HABIT_NOT_FOUND_CODE
              ? 'habits:habits.validation.notFound'
              : undefined
        applyApiErrorToForm(err, setError, habitErrorFieldMap, translate, fallback)
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  function renderKindField() {
    if (isEditing) {
      return (
        <div className="lm-habit-form__group">
          <span className="lm-habit-form__label">{translate('habits:habits.form.kindLabel')}</span>
          <span className="lm-habit-form__locked">{translate(`habits:habits.form.kindOptions.${kind}`)}</span>
          <span className="lm-habit-form__hint">{translate('habits:habits.form.kindLockedHint')}</span>
        </div>
      )
    }

    return (
      <div className="lm-habit-form__group">
        <span className="lm-habit-form__label" aria-hidden="true">
          {translate('habits:habits.form.kindLabel')}
        </span>
        <SegmentedControl
          size="md"
          aria-label={translate('habits:habits.form.kindLabel')}
          options={KINDS.map((option) => ({ value: option, label: translate(`habits:habits.form.kindOptions.${option}`) }))}
          value={kind}
          onChange={(value) => setValue('kind', value, { shouldValidate: true })}
          className="lm-habit-form__segments lm-habit-form__segments--2"
        />
        <span className="lm-habit-form__hint">{translate(`habits:habits.form.kindHints.${kind}`)}</span>
      </div>
    )
  }

  function renderFrequencyField() {
    // A habit to avoid counts every day without a relapse: there is nothing to choose.
    if (kind === 'Negative') {
      return <p className="lm-habit-form__note">{translate('habits:habits.form.negativeFrequencyHint')}</p>
    }

    return (
      <>
        <div className="lm-habit-form__group">
          <span className="lm-habit-form__label" aria-hidden="true">
            {translate('habits:habits.form.frequencyLabel')}
          </span>
          <SegmentedControl
            size="md"
            aria-label={translate('habits:habits.form.frequencyLabel')}
            options={FREQUENCIES.map((option) => ({
              value: option,
              label: translate(`habits:habits.form.frequencyOptions.${option}`),
            }))}
            value={frequencyType}
            onChange={(value) => setValue('frequencyType', value, { shouldValidate: true })}
            className="lm-habit-form__segments lm-habit-form__segments--3"
          />
          {errors.frequencyType?.message ? (
            <span className="lm-habit-form__error">{translate(errors.frequencyType.message)}</span>
          ) : null}
        </div>

        {frequencyType === 'WeekDays' ? (
          <WeekdayPicker
            label={translate('habits:habits.form.weekDaysLabel')}
            value={weekDays}
            onChange={(value) => setValue('weekDays', value, { shouldValidate: true })}
            error={fieldError(errors.weekDays?.message)}
          />
        ) : null}

        {frequencyType === 'TimesPerWeek' ? (
          <Input
            type="number"
            label={translate('habits:habits.form.timesPerWeekLabel')}
            hint={translate('habits:habits.form.timesPerWeekHint')}
            min={HABIT_MIN_TIMES_PER_WEEK}
            max={HABIT_MAX_TIMES_PER_WEEK}
            inputMode="numeric"
            numeric
            containerClassName="lm-habit-form__times"
            error={fieldError(errors.timesPerWeek?.message)}
            {...register('timesPerWeek')}
          />
        ) : null}
      </>
    )
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate(isEditing ? 'habits:habits.form.editTitle' : 'habits:habits.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('habits:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <div className="lm-habit-form__fields">
            {renderKindField()}

            <Input
              label={translate('habits:habits.form.nameLabel')}
              placeholder={translate('habits:habits.form.namePlaceholder')}
              maxLength={HABIT_NAME_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              error={fieldError(errors.name?.message)}
              {...register('name')}
            />

            <div className="lm-habit-form__group">
              <span className="lm-habit-form__label" aria-hidden="true">
                {translate('habits:habits.form.difficultyLabel')}
              </span>
              <SegmentedControl
                size="md"
                aria-label={translate('habits:habits.form.difficultyLabel')}
                options={DIFFICULTIES.map((option) => ({
                  value: option,
                  label: translate(`habits:habits.form.difficultyOptions.${option}`),
                }))}
                value={difficulty}
                onChange={(value) => setValue('difficulty', value, { shouldValidate: true })}
                className="lm-habit-form__segments lm-habit-form__segments--3"
              />
              <span className="lm-habit-form__hint">{translate('habits:habits.form.difficultyHint')}</span>
            </div>

            {renderFrequencyField()}

            <Input
              label={translate('habits:habits.form.triggerLabel')}
              placeholder={translate('habits:habits.form.triggerPlaceholder')}
              hint={translate('habits:habits.form.triggerHint')}
              maxLength={HABIT_TRIGGER_MAX_LENGTH}
              autoComplete="off"
              error={fieldError(errors.trigger?.message)}
              {...register('trigger')}
            />

            <Input
              label={translate('habits:habits.form.descriptionLabel')}
              placeholder={translate('habits:habits.form.descriptionPlaceholder')}
              maxLength={HABIT_DESCRIPTION_MAX_LENGTH}
              autoComplete="off"
              error={fieldError(errors.description?.message)}
              {...register('description')}
            />

            {isEditing ? <p className="lm-habit-form__note">{translate('habits:habits.form.editHint')}</p> : null}
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-habit-form__server-error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('habits:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'habits:habits.form.save' : 'habits:habits.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default HabitFormModal
