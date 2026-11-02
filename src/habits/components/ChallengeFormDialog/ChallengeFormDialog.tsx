import { useEffect, useId, useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import SegmentedControl from '../../../shared/components/SegmentedControl/SegmentedControl'
import Select from '../../../shared/components/Select/Select'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { createChallenge, previewChallenge } from '../../services/challengeService'
import type { ChallengeDto, ChallengePreviewDto, ChallengeType, ChallengeWeekDto, CreateChallengeRequestDto } from '../../types/ChallengeDtos'
import { challengeAmount, challengeReward, effortKey, parseWholeNumber } from '../../utils/challenges'
import { challengeErrorFieldMap, challengeWeekErrorKey } from '../../validation/challengeErrorMap'
import { createChallengeSchema } from '../../validation/challengeSchema'
import './ChallengeFormDialog.css'

interface ChallengeFormDialogProps {
  week: ChallengeWeekDto
  onClose: () => void
  onCreated: (challenge: ChallengeDto) => void
}

const TYPES: ChallengeType[] = ['Frequency', 'Volume']

/**
 * A new challenge for the week: a habit, what it counts and the target, with the limits the backend sent and a preview
 * of the effort and reward (the same values the challenge will store).
 */
function ChallengeFormDialog({ week, onClose, onCreated }: ChallengeFormDialogProps) {
  const { t: translate, i18n } = useTranslation(['habits', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const schema = useMemo(() => createChallengeSchema(week.habits), [week.habits])
  const first = week.habits[0]

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useZodForm(schema, {
    defaultValues: { habitId: first ? String(first.habitId) : '', type: first?.maxVolume !== null && first ? 'Volume' : 'Frequency', target: '' },
  })

  const [habitId, type, target] = useWatch({ control, name: ['habitId', 'type', 'target'] })
  const option = week.habits.find((habit) => String(habit.habitId) === habitId)
  const measurable = option?.maxVolume !== null && option !== undefined
  const request = toRequest({ habitId, type, target })
  const valid = schema.safeParse({ habitId, type, target }).success
  const previewKey = valid && request ? JSON.stringify(request) : null
  const debouncedKey = useDebouncedValue(previewKey, 350)
  const [preview, setPreview] = useState<{ key: string; value: ChallengePreviewDto } | null>(null)

  useEffect(() => {
    if (!debouncedKey) return
    const controller = new AbortController()
    previewChallenge(JSON.parse(debouncedKey) as CreateChallengeRequestDto, controller.signal).then(
      (value) => setPreview({ key: debouncedKey, value }),
      () => undefined,
    )
    return () => controller.abort()
  }, [debouncedKey])

  const shownPreview = preview && preview.key === previewKey ? preview.value : null

  function toRequest(values: { habitId: string; type: ChallengeType; target: string }): CreateChallengeRequestDto | null {
    const parsedTarget = parseWholeNumber(values.target)
    if (!values.habitId || parsedTarget === null) return null
    return { habitId: Number(values.habitId), type: values.type, target: parsedTarget, week: week.week }
  }

  const submit = handleSubmit(async (values) => {
    const body = toRequest(values)
    if (!body) return
    try {
      onCreated(await createChallenge(body))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) applyApiErrorToForm(err, setError, challengeErrorFieldMap, translate, challengeWeekErrorKey(err.code) ?? undefined)
      else showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    }
  })

  const max = option ? (type === 'Volume' ? (option.maxVolume ?? 0) : option.maxFrequency) : 0
  const done = option ? (type === 'Volume' ? option.volumeProgress : option.frequencyProgress) : 0
  const measure = { type, unit: option?.unit ?? null }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate(week.week === 'Next' ? 'habits:challenges.form.titleNext' : 'habits:challenges.form.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('habits:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body lm-challenge-form">
          <Select
            label={translate('habits:challenges.form.habit')}
            options={week.habits.map((habit) => ({ value: String(habit.habitId), label: habit.name }))}
            error={errors.habitId?.message ? translate(errors.habitId.message) : undefined}
            {...register('habitId', {
              onChange: (event: { target: { value: string } }) => {
                const picked = week.habits.find((habit) => String(habit.habitId) === event.target.value)
                if (picked && picked.maxVolume === null) setValue('type', 'Frequency', { shouldValidate: true })
              },
            })}
          />

          {measurable ? (
            <div className="lm-challenge-form__group">
              <span className="lm-challenge-form__label" aria-hidden="true">
                {translate('habits:challenges.form.type')}
              </span>
              <SegmentedControl
                size="md"
                aria-label={translate('habits:challenges.form.type')}
                options={TYPES.map((value) => ({ value, label: translate(`habits:challenges.form.types.${value}`) }))}
                value={type}
                onChange={(value) => setValue('type', value, { shouldValidate: true })}
                className="lm-challenge-form__segments"
              />
              {errors.type?.message ? (
                <span className="lm-challenge-form__error" role="alert">
                  {translate(errors.type.message)}
                </span>
              ) : null}
            </div>
          ) : null}

          <Input
            label={translate(type === 'Volume' ? 'habits:challenges.form.targetVolume' : 'habits:challenges.form.targetFrequency', {
              unit: option?.unit ?? '',
            })}
            inputMode="numeric"
            autoComplete="off"
            hint={
              option
                ? translate('habits:challenges.form.targetHint', {
                    max: challengeAmount(max, measure, translate, i18n.language),
                    done: challengeAmount(done, measure, translate, i18n.language),
                  })
                : undefined
            }
            error={errors.target?.message ? translate(errors.target.message) : undefined}
            {...register('target')}
          />

          <div className="lm-challenge-form__preview" aria-live="polite">
            {shownPreview ? (
              <>
                <span className="lm-challenge-form__effort">{translate(effortKey(shownPreview.effort))}</span>
                <span>{challengeReward(shownPreview, translate)}</span>
                <span className="lm-challenge-form__baseline">
                  {shownPreview.baseline === null
                    ? translate('habits:challenges.form.noBaseline')
                    : translate('habits:challenges.form.baseline', {
                        amount: challengeAmount(Math.round(shownPreview.baseline), measure, translate, i18n.language),
                      })}
                </span>
              </>
            ) : (
              <span className="lm-challenge-form__baseline">{translate('habits:challenges.form.previewHint')}</span>
            )}
          </div>

          {errors.root?.serverError?.message ? (
            <p className="lm-challenge-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('habits:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" icon="target" loading={isSubmitting}>
            {translate('habits:challenges.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ChallengeFormDialog
