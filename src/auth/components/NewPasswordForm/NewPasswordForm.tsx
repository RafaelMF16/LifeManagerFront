import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Input from '../../../shared/components/Input/Input'
import { useZodForm } from '../../../shared/hooks/useZodForm'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { applyApiErrorToForm } from '../../../shared/utils/applyApiErrorToForm'
import { isApiError } from '../../../shared/types/ApiError'
import { INVALID_EMAIL_TOKEN_CODE, newPasswordErrorFieldMap } from '../../validation/userErrorMap'
import { newPasswordSchema } from '../../validation/userSchemas'
import { authErrorMessageKey } from '../../utils/authApiErrors'
import type { NewPasswordFormValues } from '../../validation/userSchemas'
import '../AuthForm.css'

interface NewPasswordFormProps {
  // The account's e-mail, shown read-only (and given to password managers)
  email: string
  submitLabel: string
  onSubmit: (data: NewPasswordFormValues) => Promise<void>
  // The link stopped working while the form was open
  onInvalidLink: () => void
}

/** Password + confirmation, for the sign-up's set-password page and the password reset page. */
function NewPasswordForm({ email, submitLabel, onSubmit, onInvalidLink }: NewPasswordFormProps) {
  const { t: translate } = useTranslation(['auth', 'common'])
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useZodForm(newPasswordSchema)
  const { show: showErrorModal } = useErrorModal()

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit(data)
    } catch (err) {
      if (isApiError(err) && err.code === INVALID_EMAIL_TOKEN_CODE) {
        onInvalidLink()
      } else if (isApiError(err)) {
        applyApiErrorToForm(err, setError, newPasswordErrorFieldMap, translate, authErrorMessageKey(err))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    }
  })

  return (
    <form className="lm-auth-form__fields-group" onSubmit={submit} noValidate>
      <div className="lm-auth-form__fields">
        <Input label={translate('auth:fields.email.label')} type="email" value={email} autoComplete="username" readOnly />
        <Input
          label={translate('auth:fields.password.label')}
          type="password"
          placeholder={translate('auth:fields.password.placeholder')}
          autoComplete="new-password"
          hint={translate('auth:fields.password.hint')}
          error={errors.password?.message ? translate(errors.password.message) : undefined}
          {...register('password')}
        />
        <Input
          label={translate('auth:fields.confirmPassword.label')}
          type="password"
          placeholder={translate('auth:fields.confirmPassword.placeholder')}
          autoComplete="new-password"
          error={errors.confirmPassword?.message ? translate(errors.confirmPassword.message) : undefined}
          {...register('confirmPassword')}
        />
      </div>

      {errors.root?.serverError?.message ? (
        <p className="lm-auth-form__error" role="alert">
          {errors.root.serverError.message}
        </p>
      ) : null}

      <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}

export default NewPasswordForm
