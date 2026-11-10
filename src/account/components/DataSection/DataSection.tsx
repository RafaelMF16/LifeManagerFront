import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import { useErrorModal } from '../../../shared/hooks/useErrorModal'
import { isAbortError, isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { downloadAccountData } from '../../services/accountService'
import { TOO_MANY_REQUESTS_CODE } from '../../validation/accountErrorMap'
import AccountSection from '../AccountSection/AccountSection'

/** "Download my data": the whole account as one JSON file. */
function DataSection() {
  const { t: translate } = useTranslation(['account', 'common'])
  const { show: showErrorModal } = useErrorModal()
  const [downloading, setDownloading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Leaving the page cancels a download still running.
  useEffect(() => () => abortRef.current?.abort(), [])

  async function download() {
    const controller = new AbortController()
    abortRef.current = controller
    setDownloading(true)

    try {
      await downloadAccountData(controller.signal)
    } catch (err) {
      if (isAbortError(err) || isSessionExpiredError(err)) return
      if (isApiError(err) && err.code === TOO_MANY_REQUESTS_CODE) {
        showErrorModal(translate('account:data.errorTitle'), translate('account:data.tooManyRequests'))
      } else {
        showErrorModal(translate('common:errors.connection.title'), translate('common:errors.connection.message'))
      }
    } finally {
      if (!controller.signal.aborted) setDownloading(false)
    }
  }

  return (
    <AccountSection title={translate('account:data.title')} icon="download" tourTarget="account.data">
      <div className="lm-account-row">
        <div className="lm-account-row__text">
          <p className="lm-account-row__value">{translate('account:data.label')}</p>
          <p className="lm-account-row__hint">{translate('account:data.description')}</p>
        </div>
        <Button variant="secondary" size="sm" icon="download" loading={downloading} onClick={() => void download()}>
          {translate(downloading ? 'account:data.preparing' : 'account:data.action')}
        </Button>
      </div>
    </AccountSection>
  )
}

export default DataSection
