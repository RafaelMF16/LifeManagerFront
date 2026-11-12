// The backend's habit reminder (`HabitReminderTexts`): `{ title, body, url, tag }`. Pure, used by `src/sw.ts`.
export interface PushPayload {
  title: string
  body: string
  url: string
  /** Same tag = the newer notification replaces the older instead of stacking. */
  tag: string | undefined
}

const DEFAULT_TITLE = 'LifeManager'
const DEFAULT_URL = '/habits/today'

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

/** The push's JSON, or a generic notification when it's missing or malformed (a push must always show one). */
export function readPushPayload(data: unknown): PushPayload {
  const fields = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}

  return {
    title: text(fields.title) ?? DEFAULT_TITLE,
    body: text(fields.body) ?? '',
    url: text(fields.url) ?? DEFAULT_URL,
    tag: text(fields.tag),
  }
}

/** Where a tap on the notification goes: a path of the app only; anything pointing elsewhere opens the Today screen. */
export function notificationUrl(url: string, appOrigin: string): string {
  try {
    const target = new URL(url, appOrigin)
    if (target.origin === appOrigin) return target.href
  } catch {
    // An unparsable url falls back below.
  }
  return new URL(DEFAULT_URL, appOrigin).href
}
