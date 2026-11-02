import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Dialog from '../../../shared/components/Dialog/Dialog'
import Icon from '../../../shared/components/Icon/Icon'
import IconButton from '../../../shared/components/IconButton/IconButton'
import Input from '../../../shared/components/Input/Input'
import { isAbortError, isSessionExpiredError } from '../../../shared/services/httpClient'
import { isApiError } from '../../../shared/types/ApiError'
import { joinInvite, previewInvite } from '../../services/rankingService'
import type { RankingGroupDetailsDto, RankingGroupPreviewDto } from '../../types/RankingDtos'
import { parseInviteCode } from '../../utils/ranking'
import { inviteErrorKey } from '../../validation/rankingErrorMap'
import './JoinGroupDialog.css'

interface JoinGroupDialogProps {
  /** A code from an invite link: the dialog opens on its preview. */
  initialCode?: string
  onClose: () => void
  onJoined: (group: RankingGroupDetailsDto) => void
}

type Preview = { code: string; group: RankingGroupPreviewDto }

/** Joins a group by its code: type or paste it (a whole link works too), see the group, then confirm. */
function JoinGroupDialog({ initialCode, onClose, onJoined }: JoinGroupDialogProps) {
  const { t: translate } = useTranslation(['habits', 'common'])
  const titleId = useId()
  const [input, setInput] = useState(initialCode ?? '')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function errorMessage(err: unknown) {
    if (isApiError(err)) return translate(inviteErrorKey(err.code) ?? 'common:errors.generic')
    return translate('common:errors.connection.message')
  }

  async function loadPreview(code: string, signal?: AbortSignal) {
    setBusy(true)
    setError(null)
    try {
      const group = await previewInvite(code, signal)
      if (!signal?.aborted) setPreview({ code, group })
    } catch (err) {
      if (isAbortError(err) || isSessionExpiredError(err) || signal?.aborted) return
      setError(errorMessage(err))
    } finally {
      if (!signal?.aborted) setBusy(false)
    }
  }

  // An invite link opens straight on its group.
  useEffect(() => {
    const code = initialCode ? parseInviteCode(initialCode) : null
    if (!code) return
    const controller = new AbortController()
    void loadPreview(code, controller.signal)
    return () => controller.abort()
    // Only the code the dialog opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (preview) void join()
    else submitCode()
  }

  function backToCode() {
    setPreview(null)
    setError(null)
  }

  function submitCode() {
    const code = parseInviteCode(input)
    if (!code) {
      setError(translate('habits:ranking.join.errors.invalid'))
      return
    }
    void loadPreview(code)
  }

  async function join() {
    if (!preview) return
    setBusy(true)
    setError(null)
    try {
      onJoined(await joinInvite(preview.code))
    } catch (err) {
      if (isSessionExpiredError(err)) return
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="lm-dialog__header">
          <h2 id={titleId} className="lm-dialog__title">
            {translate('habits:ranking.join.title')}
          </h2>
          <IconButton icon="x" size="sm" label={translate('habits:actions.close')} onClick={onClose} />
        </div>

        <div className="lm-dialog__body">
          {preview ? (
            <div className="lm-join-group__preview">
              <span className="lm-join-group__icon">
                <Icon name="users" size={20} aria-hidden="true" />
              </span>
              <div className="lm-join-group__group">
                <strong className="lm-join-group__name">{preview.group.name}</strong>
                <span className="lm-join-group__meta">
                  {translate('habits:ranking.join.owner', { name: preview.group.ownerName })} ·{' '}
                  {translate('habits:ranking.members.count', { count: preview.group.memberCount })}
                </span>
                {preview.group.alreadyMember ? (
                  <span className="lm-join-group__note">{translate('habits:ranking.join.errors.alreadyMember')}</span>
                ) : null}
              </div>
            </div>
          ) : (
            <Input
              label={translate('habits:ranking.join.codeLabel')}
              hint={translate('habits:ranking.join.codeHint')}
              placeholder="ABCD2345"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              autoFocus
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          )}

          {error ? (
            <p className="lm-join-group__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="lm-dialog__footer">
          {preview ? (
            <Button variant="secondary" onClick={backToCode}>
              {translate('habits:ranking.join.otherCode')}
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClose}>
              {translate('habits:actions.cancel')}
            </Button>
          )}
          {preview ? (
            preview.group.alreadyMember ? null : (
              <Button type="submit" variant="primary" icon="log-in" loading={busy}>
                {translate('habits:ranking.join.confirm')}
              </Button>
            )
          ) : (
            <Button type="submit" variant="primary" loading={busy}>
              {translate('habits:ranking.join.next')}
            </Button>
          )}
        </div>
      </form>
    </Dialog>
  )
}

export default JoinGroupDialog
