import { useTranslation } from 'react-i18next'
import { useErrorModal } from '../../shared/hooks/useErrorModal'
import { isSessionExpiredError } from '../../shared/services/httpClient'
import { isApiError } from '../../shared/types/ApiError'
import { savingsGoalActionMessage } from '../validation/savingsGoalErrorMap'

/** Errors from a goal's archive/restore end in an error modal; the caller then reloads what it shows. */
export function useSavingsGoalActionError() {
  const { t: translate } = useTranslation(['finance', 'common'])
  const { show: showErrorModal } = useErrorModal()

  return function showActionError(err: unknown) {
    if (isSessionExpiredError(err)) return
    if (!isApiError(err)) {
      showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      return
    }
    showErrorModal(translate('finance:savingsGoals.errors.actionTitle'), translate(savingsGoalActionMessage(err.code)))
  }
}
