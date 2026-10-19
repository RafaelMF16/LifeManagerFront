import { parseStatementAmount } from './statementAmount'
import { StatementFileError, isValidDay, toIsoDate } from './statementLines'
import type { StatementLineInput } from './statementLines'

export interface OfxStatement {
  /** Bank and account ids read from the file (`BANKID:ACCTID`), or null when it has none. Never sent as is. */
  accountId: string | null
  lines: StatementLineInput[]
}

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': ' ' }

function decodeEntities(value: string) {
  return value.replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
}

/**
 * The value of a leaf element. OFX 1.x is SGML and leaves leaf tags unclosed (`<TRNAMT>-42.90` and a line break),
 * OFX 2.x is XML (`<TRNAMT>-42.90</TRNAMT>`): in both, the value runs until the next tag or line break.
 */
function element(block: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<\\r\\n]*)`, 'i').exec(block)
  if (!match) return null

  const value = decodeEntities(match[1]).trim()
  return value === '' ? null : value
}

/** Aggregates (`<STMTTRN>…</STMTTRN>`) are closed in both versions. */
function blocks(text: string, tag: string): string[] {
  return [...text.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'gi'))].map((match) => match[1])
}

/** `YYYYMMDD[HHMMSS[.XXX]][[-3:BRT]]` → `YYYY-MM-DD` (the day as the bank wrote it; the time is dropped). */
function parseOfxDate(value: string | null): string | null {
  const match = value ? /^(\d{4})(\d{2})(\d{2})/.exec(value) : null
  if (!match) return null

  const [year, month, day] = match.slice(1).map(Number)
  return isValidDay(year, month, day) ? toIsoDate(year, month, day) : null
}

/** NAME and MEMO: banks put the merchant in either, or a short one in NAME and the full text in MEMO. */
function describe(name: string | null, memo: string | null) {
  if (!name) return memo ?? ''
  if (!memo) return name

  const upperName = name.toUpperCase()
  const upperMemo = memo.toUpperCase()
  if (upperMemo.includes(upperName)) return memo
  if (upperName.includes(upperMemo)) return name
  return `${name} - ${memo}`
}

/**
 * Reads the transactions of an OFX statement (bank account or credit card). Lines whose date or amount can't be
 * read are skipped; a file with none left fails with `noTransactions`.
 */
export function parseOfx(text: string): OfxStatement {
  if (!/<OFX>/i.test(text)) throw new StatementFileError('notOfx')

  const account = blocks(text, 'BANKACCTFROM')[0] ?? blocks(text, 'CCACCTFROM')[0]
  const accountParts = account ? [element(account, 'BANKID'), element(account, 'ACCTID')].filter(Boolean) : []

  const lines: StatementLineInput[] = []
  for (const transaction of blocks(text, 'STMTTRN')) {
    const date = parseOfxDate(element(transaction, 'DTPOSTED'))
    const amountText = element(transaction, 'TRNAMT')
    // OFX amounts never group thousands; Brazilian banks sometimes write the decimals after a comma.
    const amount = amountText === null ? null : parseStatementAmount(amountText, amountText.includes(',') ? ',' : '.')
    if (date === null || amount === null) continue

    lines.push({
      date,
      description: describe(element(transaction, 'NAME'), element(transaction, 'MEMO')),
      amount,
      fitid: element(transaction, 'FITID'),
    })
  }

  if (lines.length === 0) throw new StatementFileError('noTransactions')

  return { accountId: accountParts.length > 0 ? accountParts.join(':') : null, lines }
}
