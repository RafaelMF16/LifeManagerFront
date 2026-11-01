import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import {
  RANKING_GROUP_NOT_FOUND_CODE,
  RANKING_NOT_OWNER_CODE,
  RANKING_TOO_MANY_GROUPS_CODE,
  rankingGroupErrorFieldMap,
} from '../../validation/rankingErrorMap'
import { RANKING_GROUP_NAME_MAX_LENGTH, rankingGroupSchema } from '../../validation/rankingGroupSchema'
import type { RankingGroupFormValues } from '../../validation/rankingGroupSchema'
import './RankingGroupFormModal.css'

interface RankingGroupFormModalProps {
  /** The current name when renaming; omitted when creating. */
  name?: string
  onClose: () => void
  /** Persists the name; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: RankingGroupFormValues) => Promise<void>
}

const FALLBACKS: Record<string, string> = {
  [RANKING_TOO_MANY_GROUPS_CODE]: 'habits:ranking.validation.tooManyGroups',
  [RANKING_NOT_OWNER_CODE]: 'habits:ranking.validation.notOwner',
  [RANKING_GROUP_NOT_FOUND_CODE]: 'habits:ranking.validation.gone',
}

/** Creates a group, or renames it (owner only). */
function RankingGroupFormModal({ name, onClose, onSubmit }: RankingGroupFormModalProps) {
  const { t: translate } = useTranslation(['habits', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const isRenaming = name !== undefined

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(rankingGroupSchema, { defaultValues: { name: name ?? '' } })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) applyApiErrorToForm(err, setError, rankingGroupErrorFieldMap, translate, FALLBACKS[err.code])
      else showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
    }
  })

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate(isRenaming ? 'habits:ranking.form.renameTitle' : 'habits:ranking.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('habits:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <Input
            label={translate('habits:ranking.form.nameLabel')}
            placeholder={translate('habits:ranking.form.namePlaceholder')}
            hint={isRenaming ? undefined : translate('habits:ranking.form.createHint')}
            maxLength={RANKING_GROUP_NAME_MAX_LENGTH}
            autoComplete="off"
            autoFocus
            error={errors.name?.message ? translate(errors.name.message) : undefined}
            {...register('name')}
          />

          {errors.root?.serverError?.message ? (
            <p className="lm-ranking-group-form__server-error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('habits:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isRenaming ? 'habits:ranking.form.save' : 'habits:ranking.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default RankingGroupFormModal
