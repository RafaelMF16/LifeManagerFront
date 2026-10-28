import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from '../../shared/services/httpClient'
import { getGameItems, purchaseGameItem, undoGameItemPurchase } from './gameItemService'

vi.mock('../../shared/services/httpClient', () => ({ apiRequest: vi.fn().mockResolvedValue({}) }))

describe('gameItemService', () => {
  beforeEach(() => vi.mocked(apiRequest).mockClear())

  it('reads the catalog with the abort signal', async () => {
    const controller = new AbortController()
    await getGameItems(controller.signal)
    expect(apiRequest).toHaveBeenCalledWith('/api/GameItems', { method: 'GET', signal: controller.signal })
  })

  it('buys an item by its kind', async () => {
    await purchaseGameItem('HpPotion')
    expect(apiRequest).toHaveBeenCalledWith('/api/GameItems/HpPotion/Purchase', { method: 'POST' })
  })

  it('undoes a purchase by its id', async () => {
    await undoGameItemPurchase(12)
    expect(apiRequest).toHaveBeenCalledWith('/api/GameItems/Purchases/12', { method: 'DELETE' })
  })
})
