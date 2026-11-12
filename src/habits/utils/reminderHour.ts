import type { SelectOption } from '../../shared/components/Select/Select'

/** The form offers reminders from 06:00 on; the backend accepts any hour (0–23). */
export const FIRST_OFFERED_REMINDER_HOUR = 6
export const LAST_REMINDER_HOUR = 23

/** "20:00" in pt-BR, "8:00 PM" in en-US. The hour is the backend's business time zone, so no conversion. */
export function formatReminderHour(hour: number, locale: string): string {
  // A 12-hour clock reads "8:00 PM", a 24-hour one "08:00".
  const hourDigits = locale.startsWith('en') ? 'numeric' : '2-digit'
  return new Intl.DateTimeFormat(locale, { hour: hourDigits, minute: '2-digit', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, 0, 1, hour)),
  )
}

/** The select's hours (value = the hour as text); an hour the habit already has outside the list stays in it. */
export function reminderHourOptions(locale: string, current?: number | null): SelectOption[] {
  const hours: number[] = []
  for (let hour = FIRST_OFFERED_REMINDER_HOUR; hour <= LAST_REMINDER_HOUR; hour++) hours.push(hour)
  if (current != null && !hours.includes(current)) hours.push(current)

  return hours.sort((a, b) => a - b).map((hour) => ({ value: String(hour), label: formatReminderHour(hour, locale) }))
}
