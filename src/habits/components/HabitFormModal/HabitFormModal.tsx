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
  HABIT_TARGET_MAX_VALUE,
  HABIT_TARGET_UNIT_MAX_LENGTH,
  HABIT_TRIGGER_MAX_LENGTH,
  habitSchema,
} from '../../validation/habitSchema'
import type { HabitFormValues } from '../../validation/habitSchema'
import WeekdayPicker from '../WeekdayPicker/WeekdayPicker'
import './HabitFormModal.css'

const KINDS: HabitKind[] = ['Positive', 'Negative']
const DIFFICULTIES: HabitDifficulty[] = ['Easy', 'Medium', 'Hard']
const FREQUENCIES: HabitFrequencyType[] = ['Daily', 'WeekDays', 'TimesPerWeek']
/** Ids under `habits.form.targetUnits`; the unit field still takes any text. */
const UNIT_SUGGESTIONS = ['ml', 'pages', 'min', 'steps', 'm', 'times'] as const

interface HabitFormModalProps {
  /** The habit being edited; omitted when creating a new one. */
  habit?: HabitResponseDto
  /** Creating only: values to start from, e.g. a starter habit. */
  initialValues?: Partial<HabitFormValues>
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: HabitFormValues) => Promise<void>
}

function toDefaultValues(habit: HabitResponseDto | undefined, initialValues?: Partial<HabitFormValues>): HabitFormValues {
  const defaults: HabitFormValues = {
    name: habit?.name ?? '',
    description: habit?.description ?? '',
    trigger: habit?.trigger ?? '',
    kind: habit?.kind ?? 'Positive',
    difficulty: habit?.difficulty ?? 'Easy',
    frequencyType: habit?.frequencyType ?? 'Daily',
    weekDays: habit?.weekDays ?? [],
    timesPerWeek: habit?.timesPerWeek ? String(habit.timesPerWeek) : '3',
    measured: habit?.targetValue != null,
    targetValue: habit?.targetValue != null ? String(habit.targetValue) : '',
    targetUnit: habit?.targetUnit ?? '',
    targetStep: habit?.targetStep != null ? String(habit.targetStep) : '',
  }
  return habit ? defaults : { ...defaults, ...initialValues }
}

function HabitFormModal({ habit, initialValues, onClose, onSubmit }: HabitFormModalProps) {
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
  } = useZodForm(habitSchema, { defaultValues: toDefaultValues(habit, initialValues) })
  const kind = useWatch({ control, name: 'kind' })
  const difficulty = useWatch({ control, name: 'difficulty' })
  const frequencyType = useWatch({ control, name: 'frequencyType' })
  const weekDays = useWatch({ control, name: 'weekDays' })
  const measured = useWatch({ control, name: 'measured' })
  const unitListId = `${titleId}-units`

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
          onChange={(value) => {
            setValue('kind', value, { shouldValidate: true })
            // Only a habit to build takes a target; switching to "avoid" drops it.
            if (value === 'Negative') setValue('measured', false, { shouldValidate: true })
          }}
          className="lm-habit-form__segments lm-habit-form__segments--2"
        />
        <span className="lm-habit-form__hint">{translate(`habits:habits.form.kindHints.${kind}`)}</span>
      </div>
    )
  }

  function renderFrequencyField() {
    // A habit to avoid reads the same choices differently: the days it is avoided, or a weekly limit.
    const negative = kind === 'Negative'
    const frequencyLabel = translate(negative ? 'habits:habits.form.frequencyLabelNegative' : 'habits:habits.form.frequencyLabel')

    return (
      <>
        <div className="lm-habit-form__group">
          <span className="lm-habit-form__label" aria-hidden="true">
            {frequencyLabel}
          </span>
          <SegmentedControl
            size="md"
            aria-label={frequencyLabel}
            options={FREQUENCIES.map((option) => ({
              value: option,
              label: translate(
                negative ? `habits:habits.form.frequencyOptionsNegative.${option}` : `habits:habits.form.frequencyOptions.${option}`,
              ),
            }))}
            value={frequencyType}
            onChange={(value) => setValue('frequencyType', value, { shouldValidate: true })}
            className="lm-habit-form__segments lm-habit-form__segments--3"
          />
          {errors.frequencyType?.message ? (
            <span className="lm-habit-form__error">{translate(errors.frequencyType.message)}</span>
          ) : null}
          {negative ? (
            <span className="lm-habit-form__hint">{translate(`habits:habits.form.frequencyHintsNegative.${frequencyType}`)}</span>
          ) : null}
        </div>

        {frequencyType === 'WeekDays' ? (
          <WeekdayPicker
            label={translate(negative ? 'habits:habits.form.weekDaysLabelNegative' : 'habits:habits.form.weekDaysLabel')}
            value={weekDays}
            onChange={(value) => setValue('weekDays', value, { shouldValidate: true })}
            error={fieldError(errors.weekDays?.message)}
          />
        ) : null}

        {frequencyType === 'TimesPerWeek' ? (
          <Input
            type="number"
            label={translate(negative ? 'habits:habits.form.timesPerWeekLabelNegative' : 'habits:habits.form.timesPerWeekLabel')}
            hint={negative ? undefined : translate('habits:habits.form.timesPerWeekHint')}
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

  function renderTargetField() {
    if (kind !== 'Positive') return null

    return (
      <div className="lm-habit-form__group">
        <label className="lm-habit-form__check">
          <input type="checkbox" aria-describedby={`${titleId}-measured`} {...register('measured')} />
          {translate('habits:habits.form.measuredLabel')}
        </label>
        <span id={`${titleId}-measured`} className="lm-habit-form__hint lm-habit-form__hint--check">
          {translate(measured ? 'habits:habits.form.measuredHintOn' : 'habits:habits.form.measuredHintOff')}
        </span>
        {errors.measured?.message ? <span className="lm-habit-form__error">{translate(errors.measured.message)}</span> : null}

        {measured ? (
          <div className="lm-habit-form__target">
            <Input
              type="number"
              label={translate('habits:habits.form.targetValueLabel')}
              placeholder="2000"
              min={1}
              max={HABIT_TARGET_MAX_VALUE}
              inputMode="numeric"
              numeric
              error={fieldError(errors.targetValue?.message)}
              {...register('targetValue')}
            />
            <Input
              label={translate('habits:habits.form.targetUnitLabel')}
              placeholder={translate('habits:habits.form.targetUnits.ml')}
              maxLength={HABIT_TARGET_UNIT_MAX_LENGTH}
              autoComplete="off"
              list={unitListId}
              error={fieldError(errors.targetUnit?.message)}
              {...register('targetUnit')}
            />
            <datalist id={unitListId}>
              {UNIT_SUGGESTIONS.map((unit) => (
                <option key={unit} value={translate(`habits:habits.form.targetUnits.${unit}`)} />
              ))}
            </datalist>
            <Input
              type="number"
              label={translate('habits:habits.form.targetStepLabel')}
              placeholder="250"
              min={1}
              max={HABIT_TARGET_MAX_VALUE}
              inputMode="numeric"
              numeric
              hint={translate('habits:habits.form.targetStepHint')}
              error={fieldError(errors.targetStep?.message)}
              {...register('targetStep')}
            />
          </div>
        ) : null}
      </div>
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

            {renderTargetField()}

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
