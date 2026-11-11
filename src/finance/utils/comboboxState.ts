/**
 * The state machine of a combobox with a listbox popup (WAI-ARIA APG pattern), kept pure so it can be tested
 * without rendering. The component owns the chosen value and the options; this only tracks what the field shows,
 * whether the list is open, what is being searched and which option is active.
 *
 * - `text` is what the input shows; `query` is what the user typed since the list opened (empty = no search).
 * - `activeIndex` points into the options the component renders (special rows such as "Load more" included),
 *   `-1` when none is active.
 * - Leaving without a choice (`revert`) puts back the current value's name: loose text never becomes a value.
 */
export interface ComboboxState {
  isOpen: boolean
  text: string
  query: string
  activeIndex: number
}

export type ComboboxAction =
  /** Focus or click: opens the list without a search. */
  | { type: 'open' }
  /** The user typed: searches it, opening the list. */
  | { type: 'type'; text: string }
  /** A search answered with `count` options. */
  | { type: 'results'; count: number }
  /** Arrow up (`-1`) or down (`1`) among `count` options; opens the list when closed. */
  | { type: 'move'; delta: 1 | -1; count: number }
  /** An option was chosen: closes showing its name. */
  | { type: 'select'; text: string }
  /** Escape or leaving without a choice: closes showing the current value's name. */
  | { type: 'revert'; text: string }
  /** The value changed from outside (form reset, edited record loaded). */
  | { type: 'sync'; text: string }

export function initialComboboxState(valueName: string | null): ComboboxState {
  return { isOpen: false, text: valueName ?? '', query: '', activeIndex: -1 }
}

function clamp(index: number, count: number) {
  return Math.min(Math.max(index, 0), count - 1)
}

export function comboboxReducer(state: ComboboxState, action: ComboboxAction): ComboboxState {
  switch (action.type) {
    case 'open':
      return { ...state, isOpen: true, query: '', activeIndex: -1 }

    case 'type':
      return { isOpen: true, text: action.text, query: action.text, activeIndex: -1 }

    case 'results': {
      if (action.count === 0) return { ...state, activeIndex: -1 }
      // A typed search makes its best match active, so Enter picks it right away.
      if (state.activeIndex === -1) return { ...state, activeIndex: state.query.trim() ? 0 : -1 }
      return { ...state, activeIndex: clamp(state.activeIndex, action.count) }
    }

    case 'move': {
      if (action.count === 0) return { ...state, isOpen: true }
      if (!state.isOpen || state.activeIndex === -1) {
        return { ...state, isOpen: true, activeIndex: action.delta > 0 ? 0 : action.count - 1 }
      }
      return { ...state, activeIndex: clamp(state.activeIndex + action.delta, action.count) }
    }

    case 'select':
    case 'revert':
      return initialComboboxState(action.text)

    case 'sync':
      return state.isOpen ? state : { ...state, text: action.text }
  }
}
