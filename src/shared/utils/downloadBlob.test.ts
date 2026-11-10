import { describe, expect, it } from 'vitest'
import { fileNameFromContentDisposition } from './downloadBlob'

describe('fileNameFromContentDisposition', () => {
  it('lê o filename entre aspas', () => {
    expect(fileNameFromContentDisposition('attachment; filename="lifemanager-2026-11-10.json"', 'x.json')).toBe(
      'lifemanager-2026-11-10.json',
    )
  })

  it('lê o filename sem aspas', () => {
    expect(fileNameFromContentDisposition('attachment; filename=lifemanager-2026-11-10.json', 'x.json')).toBe(
      'lifemanager-2026-11-10.json',
    )
  })

  it('prefere o filename* codificado', () => {
    expect(
      fileNameFromContentDisposition(`attachment; filename="dados.json"; filename*=UTF-8''meus%20dados.json`, 'x.json'),
    ).toBe('meus dados.json')
  })

  it('usa o padrão sem cabeçalho ou sem nome', () => {
    expect(fileNameFromContentDisposition(null, 'padrao.json')).toBe('padrao.json')
    expect(fileNameFromContentDisposition('attachment', 'padrao.json')).toBe('padrao.json')
  })

  it('descarta pastas no nome', () => {
    expect(fileNameFromContentDisposition('attachment; filename="../../etc/dados.json"', 'x.json')).toBe('dados.json')
  })
})
