/**
 * The toast of a quick entry: "Transaction saved in November 2026", plus "· month created" when the entry opened
 * its month. `period` is the month of the date, in the UI language, lowercase where the language writes it so.
 */
export function quickTransactionToast(isoDate: string, monthCreated: boolean, language: string) {
  const [year, month] = isoDate.split('-').map(Number)
  const period = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    Date.UTC(year, month - 1, 1),
  )

  return {
    key: monthCreated ? 'finance:transactions.quick.savedMonthCreated' : 'finance:transactions.quick.saved',
    period,
  } as const
}
