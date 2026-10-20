import { decodeStatementFile } from './decodeStatementFile'
import { parseCsv } from './parseCsv'
import { parseOfx } from './parseOfx'
import { StatementFileError } from './statementLines'
import type { StatementLineInput } from './statementLines'

/** Bank files are small; anything bigger is surely not a statement (and would stall the parse). */
export const STATEMENT_MAX_FILE_BYTES = 5 * 1024 * 1024

export type StatementFile =
  | { kind: 'ofx'; fileName: string; accountKey: string | null; lines: StatementLineInput[] }
  | { kind: 'csv'; fileName: string; rows: string[][] }

/**
 * A one-way id of the account (SHA-256 of the bank and account numbers), so the backend can recognize the same
 * account's lines across imports without ever receiving the account number.
 */
export async function hashAccountId(accountId: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(accountId))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isOfx(fileName: string, text: string) {
  return /\.(ofx|qfx)$/i.test(fileName) || /^\s*(OFXHEADER|<\?xml[^>]*>\s*<\?OFX|<OFX>)/i.test(text)
}

/**
 * Reads the chosen file: an OFX statement comes out as lines ready to send; a CSV comes out as rows, for the user
 * to say which column is which. Throws `StatementFileError` when the file can't be used.
 */
export async function readStatementFile(file: File): Promise<StatementFile> {
  if (file.size > STATEMENT_MAX_FILE_BYTES) throw new StatementFileError('tooLarge')
  if (!/\.(ofx|qfx|csv|txt)$/i.test(file.name)) throw new StatementFileError('unsupported')

  const text = decodeStatementFile(await file.arrayBuffer())

  if (isOfx(file.name, text)) {
    const statement = parseOfx(text)
    const accountKey = statement.accountId ? await hashAccountId(statement.accountId) : null
    return { kind: 'ofx', fileName: file.name, accountKey, lines: statement.lines }
  }

  return { kind: 'csv', fileName: file.name, rows: parseCsv(text) }
}
