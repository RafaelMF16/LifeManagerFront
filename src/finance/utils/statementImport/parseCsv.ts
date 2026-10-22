import { StatementFileError } from './statementLines'

export type CsvDelimiter = ',' | ';' | '\t'

const DELIMITERS: CsvDelimiter[] = [';', ',', '\t']
const SAMPLE_LINES = 10

/** Counts the delimiter outside quotes on each of the first lines. */
function countsPerLine(text: string, delimiter: CsvDelimiter) {
  const counts: number[] = []
  let count = 0
  let quoted = false

  for (let index = 0; index < text.length && counts.length < SAMPLE_LINES; index++) {
    const character = text[index]
    if (character === '"') quoted = !quoted
    else if (!quoted && character === delimiter) count++
    else if (!quoted && character === '\n') {
      counts.push(count)
      count = 0
    }
  }
  if (count > 0) counts.push(count)

  return counts.filter((value, index) => value > 0 || index === 0)
}

/**
 * The delimiter that splits the first lines into the same number of columns (more than one), preferring the one
 * with more columns. Brazilian exports use ";" (the comma is the decimal separator), others ",", a few tabs.
 */
export function detectDelimiter(text: string): CsvDelimiter {
  let best: { delimiter: CsvDelimiter; score: number } = { delimiter: ',', score: -1 }

  for (const delimiter of DELIMITERS) {
    const counts = countsPerLine(text, delimiter)
    if (counts.length === 0 || counts[0] === 0) continue

    const consistent = counts.filter((value) => value === counts[0]).length / counts.length
    const score = consistent * 100 + counts[0]
    if (score > best.score) best = { delimiter, score }
  }

  return best.delimiter
}

/**
 * Splits a CSV text into rows of cells (RFC 4180: quoted cells may hold the delimiter, line breaks and doubled
 * quotes). Blank lines are dropped and every cell is trimmed.
 */
export function parseCsv(text: string, delimiter: CsvDelimiter = detectDelimiter(text)): string[][] {
  const content = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  const endCell = () => {
    row.push(cell.trim())
    cell = ''
  }
  const endRow = () => {
    endCell()
    if (row.some((value) => value !== '')) rows.push(row)
    row = []
  }

  for (let index = 0; index < content.length; index++) {
    const character = content[index]

    if (quoted) {
      if (character === '"' && content[index + 1] === '"') {
        cell += '"'
        index++
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === delimiter) {
      endCell()
    } else if (character === '\n') {
      endRow()
    } else if (character !== '\r') {
      cell += character
    }
  }
  if (cell !== '' || row.length > 0) endRow()

  if (rows.length === 0) throw new StatementFileError('emptyCsv')
  return rows
}
