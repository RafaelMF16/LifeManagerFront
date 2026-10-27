import { useId, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../../shared/components/Button/Button'
import Icon from '../../../shared/components/Icon/Icon'
import './StatementUpload.css'

export type StatementUploadBusy = 'reading' | 'creating' | null

interface StatementUploadProps {
  /** What the page is doing with the last file; the area is locked meanwhile. */
  busy: StatementUploadBusy
  onFile: (file: File) => void
}

/** Where the bank file goes in: a button to pick it, and (with a mouse) a drop area. */
function StatementUpload({ busy, onFile }: StatementUploadProps) {
  const { t: translate } = useTranslation('finance')
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const [dragging, setDragging] = useState(false)

  function pick(files: FileList | null) {
    const file = files?.[0]
    if (file && !busy) onFile(file)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    pick(event.dataTransfer.files)
  }

  return (
    <section className="lm-statement-upload" aria-busy={busy !== null} data-tour="imports.upload">
      <div
        className={`lm-statement-upload__area${dragging ? ' lm-statement-upload__area--dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          if (!busy) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <Icon name="upload" size={24} className="lm-statement-upload__icon" aria-hidden="true" />
        {busy ? (
          <p className="lm-statement-upload__status" role="status">
            {translate(busy === 'reading' ? 'finance:imports.upload.reading' : 'finance:imports.upload.creating')}
          </p>
        ) : (
          <>
            <p className="lm-statement-upload__title">{translate('finance:imports.upload.title')}</p>
            <p className="lm-statement-upload__drop-hint">{translate('finance:imports.upload.dropHint')}</p>
          </>
        )}
        <Button variant="primary" icon="upload" loading={busy !== null} aria-describedby={hintId} onClick={() => inputRef.current?.click()}>
          {translate('finance:imports.upload.choose')}
        </Button>
        <span id={hintId} className="lm-statement-upload__formats">
          {translate('finance:imports.upload.formats')}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".ofx,.qfx,.csv,.txt,text/csv,application/x-ofx"
          className="lm-statement-upload__input"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            pick(event.target.files)
            // The same file can be chosen again after fixing it.
            event.target.value = ''
          }}
        />
      </div>
    </section>
  )
}

export default StatementUpload
