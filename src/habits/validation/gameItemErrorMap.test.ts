import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import {
  GAME_ITEM_ALREADY_UNDONE_CODE,
  GAME_ITEM_PURCHASE_NOT_FOUND_CODE,
  gameItemErrorMessages,
  SILENT_GAME_ITEM_CODES,
} from './gameItemErrorMap'

function lookup(locale: unknown, key: string) {
  return key
    .replace('habits:', '')
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], locale)
}

describe('gameItemErrorMessages', () => {
  it('explains every refusal the player can meet in both languages', () => {
    expect(Object.keys(gameItemErrorMessages)).toHaveLength(7)
    for (const key of Object.values(gameItemErrorMessages)) {
      expect(typeof lookup(ptBR, key)).toBe('string')
      expect(typeof lookup(enUS, key)).toBe('string')
    }
  })

  it('keeps quiet about purchases undone or gone in another tab', () => {
    expect([...SILENT_GAME_ITEM_CODES]).toEqual([GAME_ITEM_ALREADY_UNDONE_CODE, GAME_ITEM_PURCHASE_NOT_FOUND_CODE])
    for (const code of SILENT_GAME_ITEM_CODES) expect(gameItemErrorMessages[code]).toBeUndefined()
  })
})
