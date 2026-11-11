import type { ToastAction } from './ToastContext'

export interface ToastEntry {
  message: string
  detail?: string
  action?: ToastAction
}

/**
 * At most one persistent toast (e.g. "New version available") under the usual timed one: a timed toast shows over it
 * and, once it goes, the persistent one is back, so a "Saved" never makes the update notice disappear for good.
 */
export interface ToastStack {
  pinned: ToastEntry | null
  transient: ToastEntry | null
}

export const EMPTY_TOAST_STACK: ToastStack = { pinned: null, transient: null }

/** A new persistent toast shows at once (replacing any timed one); a timed one replaces the previous timed one. */
export function showToast(stack: ToastStack, entry: ToastEntry, persistent: boolean): ToastStack {
  return persistent ? { pinned: entry, transient: null } : { ...stack, transient: entry }
}

export function visibleToast(stack: ToastStack): ToastEntry | null {
  return stack.transient ?? stack.pinned
}

/** The X or the action closes the toast on screen: the timed one if any, otherwise the persistent one. */
export function closeVisibleToast(stack: ToastStack): ToastStack {
  return stack.transient ? { ...stack, transient: null } : { ...stack, pinned: null }
}

export function expireTransientToast(stack: ToastStack): ToastStack {
  return { ...stack, transient: null }
}
