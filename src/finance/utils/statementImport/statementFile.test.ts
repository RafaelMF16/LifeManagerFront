import { describe, expect, it } from 'vitest'
import { decodeStatementFile } from './decodeStatementFile'
import { hashAccountId } from './readStatementFile'
import { keepImportableLines, todayIso } from './statementLines'

function windows1252(text: string) {
  // "é" is 0xE9 in Windows-1252 (and an invalid lone byte in UTF-8).
  return Uint8Array.from(text, (character) => character.charCodeAt(0)).buffer
}

describe('decodeStatementFile', () => {
  it('reads UTF-8, with or without a byte order mark', () => {
    const utf8 = new TextEncoder().encode('Débito')
    expect(decodeStatementFile(utf8.buffer)).toBe('Débito')
    expect(decodeStatementFile(new Uint8Array([0xef, 0xbb, 0xbf, ...utf8]).buffer)).toBe('Débito')
  })

  it('falls back to Windows-1252 when the bytes are not UTF-8', () => {
    expect(decodeStatementFile(windows1252('Débito'))).toBe('Débito')
  })

  it('reads a Windows-1252 file that says so in its OFX header', () => {
    expect(decodeStatementFile(windows1252('CHARSET:1252\n<MEMO>Pão'))).toContain('Pão')
  })

  it('reads UTF-8 even when the OFX header claims Windows-1252, as Banco Inter exports', () => {
    const inter = new TextEncoder().encode('ENCODING:USASCII\nCHARSET:1252\n<NAME>Aplicação\n<NAME>Fatura cartão Inter')

    const text = decodeStatementFile(inter.buffer)

    expect(text).toContain('<NAME>Aplicação')
    expect(text).toContain('Fatura cartão Inter')
  })

  it('reads Windows-1252 even when the OFX header claims UTF-8', () => {
    expect(decodeStatementFile(windows1252('ENCODING:UTF-8\nCHARSET:NONE\n<MEMO>Pão'))).toContain('Pão')
  })
})

describe('keepImportableLines', () => {
  it('leaves out zero amounts, dates before 2000 and future dates', () => {
    const line = (date: string, amount: number) => ({ date, description: 'x', amount, fitid: null })

    const result = keepImportableLines(
      [line('2024-03-01', -10), line('2024-03-02', 0), line('1999-12-31', -1), line('2026-10-20', -5), line('2026-10-19', 3)],
      '2026-10-19',
    )

    expect(result.lines.map((kept) => kept.date)).toEqual(['2024-03-01', '2026-10-19'])
    expect(result.skippedCount).toBe(3)
  })

  it('formats the local day', () => {
    expect(todayIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('hashAccountId', () => {
  it('gives a stable SHA-256 hex digest', async () => {
    const hash = await hashAccountId('0260:12345-6')

    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(await hashAccountId('0260:12345-6')).toBe(hash)
    expect(await hashAccountId('0260:12345-7')).not.toBe(hash)
  })
})
