import { useEffect, useId, useReducer, useRef } from 'react'
import type { KeyboardEvent, Ref } from 'react'
import { useTranslation } from 'react-i18next'
import Icon from '../../../shared/components/Icon/Icon'
import Input from '../../../shared/components/Input/Input'
import { useCategorySearch } from '../../hooks/useCategorySearch'
import { comboboxReducer, initialComboboxState } from '../../utils/comboboxState'
import './CategoryPicker.css'

export interface CategoryOption {
  id: number
  name: string
}

type PickerRow =
  | { kind: 'all' }
  | { kind: 'category'; category: CategoryOption }
  | { kind: 'more' }
  | { kind: 'create'; term: string }

interface CategoryPickerProps {
  /** The chosen category. Its name comes from the caller, so it shows even when it isn't in the loaded page. */
  value: CategoryOption | null
  onChange: (category: CategoryOption | null) => void
  label?: string
  /** Names the field when there is no visible label (e.g. a picker inside a list row). */
  ariaLabel?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  /** Categories not offered (e.g. the ones that already have a budget slice). */
  excludeIds?: readonly number[]
  /** Adds a "Create category "<term>"" option for the typed text; the caller opens the category form. */
  onCreateRequest?: (term: string) => void
  /** Adds a first option with this label that chooses `null` (e.g. "All categories" in a filter). */
  allLabel?: string
  size?: 'sm' | 'md'
  containerClassName?: string
  inputRef?: Ref<HTMLInputElement>
  onBlur?: () => void
}

/**
 * Searchable category field: a WAI-ARIA combobox with a listbox popup, rendered in the page flow (not floating) so
 * it works inside a bottom sheet with the phone's keyboard open. The state machine lives in `comboboxState`.
 */
function CategoryPicker({
  value,
  onChange,
  label,
  ariaLabel,
  placeholder,
  hint,
  error,
  disabled,
  excludeIds,
  onCreateRequest,
  allLabel,
  size = 'md',
  containerClassName,
  inputRef,
  onBlur,
}: CategoryPickerProps) {
  const { t: translate } = useTranslation('finance')
  const listId = useId()
  const valueName = value?.name ?? allLabel ?? ''
  const [state, dispatch] = useReducer(comboboxReducer, valueName, initialComboboxState)
  const search = useCategorySearch(state.query, state.isOpen)
  const listRef = useRef<HTMLUListElement>(null)

  const term = state.query.trim()
  const excluded = new Set(excludeIds ?? [])
  const categories = search.categories.filter((category) => !excluded.has(category.id))
  const rows: PickerRow[] = []
  if (allLabel && !term) rows.push({ kind: 'all' })
  if (search.status === 'ready') {
    rows.push(...categories.map((category): PickerRow => ({ kind: 'category', category })))
    if (search.hasMore) rows.push({ kind: 'more' })
  }
  const hasExactMatch = categories.some((category) => category.name.localeCompare(term, undefined, { sensitivity: 'base' }) === 0)
  if (onCreateRequest && term && search.isSettled && search.status === 'ready' && !hasExactMatch) {
    rows.push({ kind: 'create', term })
  }

  const optionId = (index: number) => `${listId}-option-${index}`

  // The value changed from outside (form reset, a category created for this field).
  useEffect(() => {
    dispatch({ type: 'sync', text: valueName })
  }, [valueName])

  // A search answered: keep the active option valid (and make the best match active after typing).
  useEffect(() => {
    if (state.isOpen && search.status === 'ready') dispatch({ type: 'results', count: rows.length })
  }, [state.isOpen, search.status, search.categories, rows.length])

  // Opening scrolls the list into view, so it stays visible above the phone's keyboard inside a bottom sheet.
  useEffect(() => {
    if (!state.isOpen) return
    const frame = requestAnimationFrame(() => listRef.current?.scrollIntoView({ block: 'nearest' }))
    return () => cancelAnimationFrame(frame)
  }, [state.isOpen])

  useEffect(() => {
    if (state.activeIndex < 0) return
    document.getElementById(`${listId}-option-${state.activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [listId, state.activeIndex])

  function choose(row: PickerRow) {
    switch (row.kind) {
      case 'all':
        onChange(null)
        dispatch({ type: 'select', text: allLabel ?? '' })
        return
      case 'category':
        onChange(row.category)
        dispatch({ type: 'select', text: row.category.name })
        return
      case 'more':
        search.loadMore()
        return
      case 'create':
        dispatch({ type: 'revert', text: valueName })
        onCreateRequest?.(row.term)
        return
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const activeRow = state.isOpen && state.activeIndex >= 0 ? rows[state.activeIndex] : undefined

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault()
        dispatch({ type: 'move', delta: event.key === 'ArrowDown' ? 1 : -1, count: rows.length })
        return
      case 'Enter':
        // Inside a form, Enter on an open list picks an option instead of submitting.
        if (!state.isOpen) return
        event.preventDefault()
        if (activeRow) choose(activeRow)
        return
      case 'Escape':
        if (!state.isOpen) return
        // Closes the list only, not the dialog around it.
        event.preventDefault()
        event.stopPropagation()
        dispatch({ type: 'revert', text: valueName })
        return
      case 'Tab':
        if (activeRow && activeRow.kind !== 'more') choose(activeRow)
        return
    }
  }

  function handleBlur() {
    if (state.isOpen || state.text !== valueName) dispatch({ type: 'revert', text: valueName })
    onBlur?.()
  }

  function rowLabel(row: PickerRow) {
    switch (row.kind) {
      case 'all':
        return allLabel
      case 'category':
        return row.category.name
      case 'more':
        return translate(search.isLoadingMore ? 'categoryPicker.loadingMore' : 'categoryPicker.loadMore')
      case 'create':
        return translate('categoryPicker.create', { term: row.term })
    }
  }

  function renderStatus() {
    if (search.status === 'loading' || search.status === 'idle') {
      return <p className="lm-category-picker__status">{translate('categoryPicker.searching')}</p>
    }

    if (search.status === 'error') {
      return (
        <p className="lm-category-picker__status">
          <span>{translate('categoryPicker.error')}</span>
          <button
            type="button"
            className="lm-category-picker__retry"
            onMouseDown={(event) => event.preventDefault()}
            onClick={search.retry}
          >
            {translate('categoryPicker.retry')}
          </button>
        </p>
      )
    }

    if (categories.length === 0) {
      return (
        <p className="lm-category-picker__status">
          {translate(term ? 'categoryPicker.empty' : 'categoryPicker.noCategories')}
        </p>
      )
    }

    return null
  }

  const isSelected = (row: PickerRow) =>
    (row.kind === 'category' && row.category.id === value?.id) || (row.kind === 'all' && value === null)

  return (
    <div className={['lm-category-picker', containerClassName].filter(Boolean).join(' ')}>
      <Input
        ref={inputRef}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={state.isOpen}
        aria-controls={listId}
        aria-activedescendant={state.isOpen && state.activeIndex >= 0 ? optionId(state.activeIndex) : undefined}
        aria-label={label ? undefined : ariaLabel}
        label={label}
        icon="search"
        size={size}
        placeholder={placeholder ?? translate('categoryPicker.placeholder')}
        hint={hint}
        error={error}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        value={state.text}
        onFocus={(event) => {
          event.target.select()
          dispatch({ type: 'open' })
        }}
        onClick={() => {
          if (!state.isOpen) dispatch({ type: 'open' })
        }}
        onChange={(event) => dispatch({ type: 'type', text: event.target.value })}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />

      {state.isOpen ? (
        <div className="lm-category-picker__popup">
          <ul ref={listRef} id={listId} role="listbox" aria-label={label ?? ariaLabel} className="lm-category-picker__list">
            {rows.map((row, index) => (
              <li
                key={row.kind === 'category' ? row.category.id : row.kind}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected(row)}
                className={[
                  'lm-category-picker__option',
                  `lm-category-picker__option--${row.kind}`,
                  index === state.activeIndex && 'lm-category-picker__option--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                // mousedown would blur the input (and revert) before the click lands.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(row)}
              >
                {row.kind === 'create' ? <Icon name="plus" size={14} aria-hidden="true" /> : null}
                <span className="lm-category-picker__option-label">{rowLabel(row)}</span>
                {isSelected(row) ? <Icon name="check" size={14} aria-hidden="true" /> : null}
              </li>
            ))}
          </ul>
          <div aria-live="polite">{renderStatus()}</div>
        </div>
      ) : null}
    </div>
  )
}

export default CategoryPicker
