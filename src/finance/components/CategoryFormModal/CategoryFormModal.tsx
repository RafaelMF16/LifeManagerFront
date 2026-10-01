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
import type { CategoryResponseDto } from '../../types/CategoryDtos'
import { categoryErrorFieldMap } from '../../validation/categoryErrorMap'
import { CATEGORY_NAME_MAX_LENGTH, categorySchema } from '../../validation/categorySchema'
import type { CategoryFormValues } from '../../validation/categorySchema'
import './CategoryFormModal.css'

interface CategoryFormModalProps {
  /** The category being edited; omitted when creating a new one. */
  category?: CategoryResponseDto
  onClose: () => void
  /** Persists the values; a rejection is shown on the form and keeps the modal open. */
  onSubmit: (values: CategoryFormValues) => Promise<void>
}

function CategoryFormModal({ category, onClose, onSubmit }: CategoryFormModalProps) {
  const { t: translate } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(categorySchema, { defaultValues: { name: category?.name ?? '' } })

  const isEditing = Boolean(category)

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (isApiError(err)) {
        applyApiErrorToForm(err, setError, categoryErrorFieldMap, translate)
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
            {translate(isEditing ? 'finance:categories.form.editTitle' : 'finance:categories.form.createTitle')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <Input
            label={translate('finance:categories.form.nameLabel')}
            placeholder={translate('finance:categories.form.namePlaceholder')}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            autoComplete="off"
            autoFocus
            error={errors.name?.message ? translate(errors.name.message) : undefined}
            {...register('name')}
          />

          {errors.root?.serverError?.message ? (
            <p className="lm-category-form__error" role="alert">
              {errors.root.serverError.message}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {translate(isEditing ? 'finance:categories.form.save' : 'finance:categories.form.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default CategoryFormModal
