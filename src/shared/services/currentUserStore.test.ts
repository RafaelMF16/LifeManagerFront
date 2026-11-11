import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser } from './currentUserService'
import {
  getCurrentUserSnapshot,
  loadCurrentUser,
  resetCurrentUser,
  setCurrentUserName,
  subscribeCurrentUser,
} from './currentUserStore'

vi.mock('./currentUserService', () => ({ getCurrentUser: vi.fn() }))

const getCurrentUserMock = vi.mocked(getCurrentUser)
const ana = { name: 'Ana', email: 'ana@example.com' }

describe('currentUserStore', () => {
  beforeEach(() => {
    getCurrentUserMock.mockReset()
    resetCurrentUser()
  })

  it('carrega o usuário uma vez só, mesmo com vários pedidos ao mesmo tempo', async () => {
    getCurrentUserMock.mockResolvedValue(ana)

    await Promise.all([loadCurrentUser(), loadCurrentUser()])
    await loadCurrentUser()

    expect(getCurrentUserMock).toHaveBeenCalledTimes(1)
    expect(getCurrentUserSnapshot()).toEqual({ user: ana, failed: false })
  })

  it('marca a falha e tenta de novo no próximo pedido', async () => {
    getCurrentUserMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(ana)

    await loadCurrentUser()
    expect(getCurrentUserSnapshot()).toEqual({ user: null, failed: true })

    await loadCurrentUser()
    expect(getCurrentUserSnapshot()).toEqual({ user: ana, failed: false })
  })

  it('volta a carregar (sem a falha) enquanto tenta de novo', async () => {
    getCurrentUserMock.mockRejectedValueOnce(new Error('offline'))
    await loadCurrentUser()
    let answer: (user: typeof ana) => void = () => {}
    getCurrentUserMock.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)))

    const retry = loadCurrentUser()

    expect(getCurrentUserSnapshot()).toEqual({ user: null, failed: false })
    answer(ana)
    await retry
    expect(getCurrentUserSnapshot()).toEqual({ user: ana, failed: false })
  })

  it('avisa os assinantes quando o nome muda', async () => {
    getCurrentUserMock.mockResolvedValue(ana)
    await loadCurrentUser()
    const listener = vi.fn()
    const unsubscribe = subscribeCurrentUser(listener)

    setCurrentUserName('Ana Maria')

    expect(listener).toHaveBeenCalledTimes(1)
    expect(getCurrentUserSnapshot().user).toEqual({ ...ana, name: 'Ana Maria' })
    unsubscribe()
  })

  it('não grava o usuário de uma sessão que já acabou', async () => {
    let answer: (user: typeof ana) => void = () => {}
    getCurrentUserMock.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)))

    const pending = loadCurrentUser()
    resetCurrentUser()
    answer(ana)
    await pending

    expect(getCurrentUserSnapshot()).toEqual({ user: null, failed: false })
  })
})
