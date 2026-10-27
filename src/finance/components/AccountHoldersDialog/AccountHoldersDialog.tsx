import { useEffect, useId, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import { useCurrentUser } from '../../../shared/hooks/useCurrentUser'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { isAbortError, isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { getAccountHolders, saveAccountHolders } from '../../services/accountHolderService'
import { resolveAccountHolderError } from '../../validation/accountHolderErrorMap'
import { ACCOUNT_HOLDERS_MAX, ACCOUNT_HOLDER_NAME_MAX_LENGTH, accountHoldersSchema } from '../../validation/accountHoldersSchema'
import './AccountHoldersDialog.css'

interface AccountHoldersDialogProps {
  onClose: () => void
  /** Called once the list was saved; the dialog doesn't close itself. */
  onSaved: () => void
}

/**
 * Edits the names, as the bank writes them, of the people and companies that own the user's accounts: transfers to
 * them come into an import left out. Loads the list on open and saves it whole.
 */
function AccountHoldersDialog({ onClose, onSaved }: AccountHoldersDialogProps) {
  const { t: translate } = useTranslation(['finance', 'common'])
  const titleId = useId()
  const { show: showErrorModal } = useErrorModal()
  const { name: userName } = useCurrentUser()
  const [load, setLoad] = useState<{ status: 'loading' | 'ready' | 'failed'; attempt: number }>({ status: 'loading', attempt: 0 })
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(accountHoldersSchema, { defaultValues: { holders: [] } })
  const { fields, append, remove } = useFieldArray({ control, name: 'holders' })

  useEffect(() => {
    const controller = new AbortController()

    getAccountHolders(controller.signal).then(
      (response) => {
        reset({ holders: response.names.map((name) => ({ name })) })
        setLoad((current) => ({ ...current, status: 'ready' }))
      },
      (err: unknown) => {
        // An expired session is already redirected by the root route.
        if (isAbortError(err) || isSessionExpiredError(err)) return
        setLoad((current) => ({ ...current, status: 'failed' }))
      },
    )

    return () => controller.abort()
  }, [reset, load.attempt])

  const retry = () => setLoad((current) => ({ status: 'loading', attempt: current.attempt + 1 }))

  const submit = handleSubmit(async (values) => {
    try {
      await saveAccountHolders(values.holders.map((holder) => holder.name))
      onSaved()
    } catch (err) {
      if (isSessionExpiredError(err)) return
      if (!isApiError(err)) {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
        return
      }

      const target = resolveAccountHolderError(err)
      if (target.index !== null && target.index < fields.length) {
        setError(`holders.${target.index}.name`, { type: 'server', message: target.message }, { shouldFocus: true })
      } else {
        setError('root.serverError', { type: 'server', message: target.message })
      }
    }
  })

  const full = fields.length >= ACCOUNT_HOLDERS_MAX

  return (
    <Dialog labelledBy={titleId} onClose={onClose} className="lm-account-holders">
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('finance:accountHolders.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('finance:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          <p className="lm-account-holders__intro">{translate('finance:accountHolders.intro')}</p>
          <p className="lm-account-holders__note">
            {userName
              ? translate('finance:accountHolders.registeredName', { name: userName })
              : translate('finance:accountHolders.registeredNameUnknown')}
          </p>

          {load.status === 'loading' ? (
            <p className="lm-account-holders__status" role="status">
              {translate('finance:accountHolders.loading')}
            </p>
          ) : load.status === 'failed' ? (
            <div className="lm-account-holders__failed" role="alert">
              <p className="lm-account-holders__error">{translate('finance:accountHolders.loadError')}</p>
              <Button variant="secondary" size="sm" onClick={retry}>
                {translate('finance:accountHolders.retry')}
              </Button>
            </div>
          ) : (
            <>
              {fields.length === 0 ? (
                <p className="lm-account-holders__status">{translate('finance:accountHolders.empty')}</p>
              ) : (
                <ol className="lm-account-holders__list">
                  {fields.map((field, index) => {
                    const message = errors.holders?.[index]?.name?.message
                    return (
                      <li key={field.id} className="lm-account-holders__item">
                        <div className="lm-account-holders__field">
                          <Input
                            label={translate('finance:accountHolders.nameLabel', { number: index + 1 })}
                            placeholder={translate('finance:accountHolders.namePlaceholder')}
                            maxLength={ACCOUNT_HOLDER_NAME_MAX_LENGTH}
                            autoComplete="off"
                            error={message ? translate(message) : undefined}
                            {...register(`holders.${index}.name`)}
                          />
                        </div>
                        <IconButton
                          icon="trash-2"
                          size="sm"
                          className="lm-account-holders__remove"
                          label={translate('finance:accountHolders.remove', { number: index + 1 })}
                          onClick={() => remove(index)}
                        />
                      </li>
                    )
                  })}
                </ol>
              )}

              <Button
                variant="ghost"
                size="sm"
                icon="plus"
                className="lm-account-holders__add"
                disabled={full}
                onClick={() => append({ name: '' })}
              >
                {translate('finance:accountHolders.add')}
              </Button>
              {full ? (
                <p className="lm-account-holders__note">{translate('finance:accountHolders.limit', { max: ACCOUNT_HOLDERS_MAX })}</p>
              ) : null}
            </>
          )}

          {errors.root?.serverError?.message ? (
            <p className="lm-account-holders__error" role="alert">
              {translate(errors.root.serverError.message)}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          <Button variant="secondary" onClick={onClose}>
            {translate('finance:actions.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={load.status !== 'ready'}>
            {translate('finance:accountHolders.save')}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default AccountHoldersDialog
