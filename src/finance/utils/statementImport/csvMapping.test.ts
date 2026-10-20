import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyMapping, guessMapping, isMappingComplete, layoutSignature, loadRememberedMapping, parseCsvDate, rememberMapping } from './csvMapping'
import { parseCsv } from './parseCsv'

describe('parseCsvDate', () => {
  it('reads each format', () => {
    expect(parseCsvDate('05/03/2024', 'dmy')).toBe('2024-03-05')
    expect(parseCsvDate('5-3-24', 'dmy')).toBe('2024-03-05')
    expect(parseCsvDate('2024-03-05', 'ymd')).toBe('2024-03-05')
    expect(parseCsvDate('03/05/2024 10:31', 'mdy')).toBe('2024-03-05')
  })

  it('rejects days that do not exist', () => {
    expect(parseCsvDate('31/02/2024', 'dmy')).toBeNull()
    expect(parseCsvDate('Saldo anterior', 'dmy')).toBeNull()
  })
})

describe('guessMapping', () => {
  it('reads a Brazilian bank export by its header names', () => {
    const rows = parseCsv('Data;Histórico;Valor (R$)\n05/03/2024;COMPRA IFOOD;-42,90\n13/03/2024;SALARIO;5.000,00')

    expect(guessMapping(rows)).toEqual({
      hasHeader: true,
      dateColumn: 0,
      descriptionColumn: 1,
      amountMode: 'single',
      amountColumn: 2,
      debitColumn: -1,
      creditColumn: -1,
      dateFormat: 'dmy',
      decimalSeparator: ',',
      invertSign: false,
    })
  })

  it('reads a Nubank account export', () => {
    const rows = parseCsv('Data,Valor,Identificador,Descrição\n01/03/2024,-42.90,a1,IFOOD\n02/03/2024,1500.00,a2,Transferência recebida')
    const mapping = guessMapping(rows)

    expect(mapping).toMatchObject({ dateColumn: 0, amountColumn: 1, descriptionColumn: 3, decimalSeparator: '.' })
    expect(applyMapping(rows, mapping).lines).toEqual([
      { date: '2024-03-01', description: 'IFOOD', amount: -42.9, fitid: null },
      { date: '2024-03-02', description: 'Transferência recebida', amount: 1500, fitid: null },
    ])
  })

  it('finds separate debit and credit columns', () => {
    const rows = parseCsv('Data;Descrição;Valor Débito;Valor Crédito\n05/03/2024;IFOOD;42,90;\n06/03/2024;PIX;;100,00')
    const mapping = guessMapping(rows)

    expect(mapping).toMatchObject({ amountMode: 'split', debitColumn: 2, creditColumn: 3 })
    expect(applyMapping(rows, mapping).lines.map((line) => line.amount)).toEqual([-42.9, 100])
  })

  it('guesses the columns from their values when there is no header', () => {
    const rows = parseCsv('2024-03-01;Mercado do bairro;-120,50\n2024-03-02;Padaria;-9,90')
    const mapping = guessMapping(rows)

    expect(mapping).toMatchObject({ hasHeader: false, dateColumn: 0, descriptionColumn: 1, amountColumn: 2, dateFormat: 'ymd' })
    expect(isMappingComplete(mapping)).toBe(true)
  })

  it('reads month-first dates when a second part goes past 12', () => {
    const rows = parseCsv('date,title,amount\n03/25/2024,Coffee,4.50')

    expect(guessMapping(rows).dateFormat).toBe('mdy')
  })
})

describe('applyMapping', () => {
  it('leaves out rows without a date or amount and can invert the sign', () => {
    const rows = parseCsv('date,title,amount\n2024-03-01,IFOOD,42.90\nTotal,,42.90\n2024-03-02,Estorno,-10.00')
    const mapping = { ...guessMapping(rows), invertSign: true }

    const result = applyMapping(rows, mapping)

    expect(result.unreadableCount).toBe(1)
    expect(result.lines.map((line) => line.amount)).toEqual([-42.9, 10])
  })
})

describe('remembered mappings', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('stores and reads a mapping by the layout signature', () => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    })
    const rows = parseCsv('Data;Histórico;Valor\n05/03/2024;IFOOD;-42,90')
    const signature = layoutSignature(rows, true)
    const mapping = { ...guessMapping(rows), invertSign: true }

    rememberMapping(signature, mapping)

    expect(signature).toBe('data|historico|valor')
    expect(loadRememberedMapping(signature)).toEqual(mapping)
    expect(loadRememberedMapping('other')).toBeNull()
  })

  it('works without storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })

    expect(() => rememberMapping('x', guessMapping([['2024-01-01', 'a', '1']]))).not.toThrow()
    expect(loadRememberedMapping('x')).toBeNull()
  })
})
