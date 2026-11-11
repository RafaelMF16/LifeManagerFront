import { describe, expect, it } from 'vitest'
import { closeVisibleToast, EMPTY_TOAST_STACK, expireTransientToast, showToast, visibleToast } from './toastStack'

const update = { message: 'Nova versão disponível' }
const saved = { message: 'Lançamento criado' }

describe('toastStack', () => {
  it('mostra o fixo e, por cima dele, um temporário', () => {
    const pinned = showToast(EMPTY_TOAST_STACK, update, true)
    expect(visibleToast(pinned)).toBe(update)

    expect(visibleToast(showToast(pinned, saved, false))).toBe(saved)
  })

  it('volta ao fixo quando o temporário expira ou é fechado', () => {
    const both = showToast(showToast(EMPTY_TOAST_STACK, update, true), saved, false)

    expect(visibleToast(expireTransientToast(both))).toBe(update)
    expect(visibleToast(closeVisibleToast(both))).toBe(update)
  })

  it('fechar o fixo some com ele', () => {
    const pinned = showToast(EMPTY_TOAST_STACK, update, true)

    expect(visibleToast(closeVisibleToast(pinned))).toBeNull()
  })

  it('um temporário novo troca o anterior, e um fixo novo aparece na hora', () => {
    const other = { message: 'Categoria criada' }
    const two = showToast(showToast(EMPTY_TOAST_STACK, saved, false), other, false)
    expect(visibleToast(two)).toBe(other)

    expect(visibleToast(showToast(two, update, true))).toBe(update)
  })
})
