import { describe, expect, it } from 'vitest'
import { detectDelimiter, parseCsv } from './parseCsv'

describe('detectDelimiter', () => {
  it('picks the delimiter that splits every line the same way', () => {
    expect(detectDelimiter('Data;Descrição;Valor\n01/03/2024;IFOOD;-42,90\n02/03/2024;UBER;-15,00')).toBe(';')
    expect(detectDelimiter('Data,Valor,Identificador,Descrição\n01/03/2024,-42.90,a1,IFOOD')).toBe(',')
    expect(detectDelimiter('date\ttitle\tamount\n2024-03-01\tIFOOD\t42.90')).toBe('\t')
  })

  it('ignores delimiters inside quotes', () => {
    expect(detectDelimiter('"Data";"Descrição";"Valor"\n"01/03/2024";"Loja, Centro";"-1,00"')).toBe(';')
  })
})

describe('parseCsv', () => {
  it('splits rows and trims cells', () => {
    expect(parseCsv('Data;Valor\r\n 01/03/2024 ; -42,90 \r\n')).toEqual([
      ['Data', 'Valor'],
      ['01/03/2024', '-42,90'],
    ])
  })

  it('keeps quoted delimiters, line breaks and doubled quotes', () => {
    expect(parseCsv('a,b\n"Loja, Centro","Disse ""oi""\nem dois"', ',')).toEqual([
      ['a', 'b'],
      ['Loja, Centro', 'Disse "oi"\nem dois'],
    ])
  })

  it('drops the byte order mark and blank lines', () => {
    expect(parseCsv('﻿a;b\n\n;\n1;2', ';')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('fails on an empty file', () => {
    expect(() => parseCsv('\n\n')).toThrow(expect.objectContaining({ reason: 'emptyCsv' }))
  })
})
