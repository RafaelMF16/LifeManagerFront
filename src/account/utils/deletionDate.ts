/** The deletion's day in the toast, day and month in the user's language ("17/11" / "11/17"), in the browser's zone. */
export function deletionDateLabel(scheduledFor: string, language: string): string {
  return new Intl.DateTimeFormat(language, { day: '2-digit', month: '2-digit' }).format(new Date(scheduledFor))
}
