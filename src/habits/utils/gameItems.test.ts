import i18next from 'i18next'
import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import type { GameItemDto } from '../types/GameItemDtos'
import type { PlayerProfileDto } from '../types/PlayerProfileDtos'
import { gameItemBlockedReason, gameItemEffect, gameItemName, gameItemUsage, hpHealedNow } from './gameItems'

const i18n = i18next.createInstance()
void i18n.init({
  resources: { 'en-US': { habits: enUS }, 'pt-BR': { habits: ptBR } },
  lng: 'pt-BR',
  ns: ['habits'],
  interpolation: { escapeValue: false },
})
const pt = i18n.getFixedT('pt-BR')
const en = i18n.getFixedT('en-US')

const potion: GameItemDto = {
  kind: 'HpPotion',
  price: 40,
  hpRestore: 25,
  limit: 3,
  limitPeriod: 'Day',
  purchasedInPeriod: 1,
  availability: 'Available',
}

const freeze: GameItemDto = {
  kind: 'StreakFreeze',
  price: 150,
  hpRestore: null,
  limit: 1,
  limitPeriod: 'Week',
  purchasedInPeriod: 0,
  availability: 'Available',
}

function profile(overrides: Partial<PlayerProfileDto> = {}): PlayerProfileDto {
  return {
    level: 1,
    xpInLevel: 0,
    xpToNextLevel: 100,
    totalXp: 0,
    hp: 70,
    maxHp: 100,
    coins: 100,
    streakFreezes: 0,
    maxStreakFreezes: 2,
    avatar: 'Cat',
    title: null,
    ...overrides,
  }
}

describe('game item labels', () => {
  it('names the items and their effects in both languages', () => {
    expect(gameItemName('HpPotion', pt)).toBe('Poção de HP')
    expect(gameItemName('StreakFreeze', en)).toBe('Streak freeze')
    expect(gameItemEffect(potion, pt)).toBe('+25 HP')
    expect(gameItemEffect(freeze, en)).toBe('+1 streak freeze')
  })

  it('shows the period usage', () => {
    expect(gameItemUsage(potion, pt)).toBe('1 de 3 hoje')
    expect(gameItemUsage(freeze, pt)).toBe('0 de 1 nesta semana')
    expect(gameItemUsage(freeze, en)).toBe('0 of 1 this week')
  })
})

describe('gameItemBlockedReason', () => {
  it('lets the item be bought when nothing stops it', () => {
    expect(gameItemBlockedReason(potion, profile(), pt)).toBeNull()
  })

  it('names the limit of the item period first', () => {
    expect(gameItemBlockedReason({ ...potion, availability: 'LimitReached' }, profile({ coins: 0 }), pt)).toBe('Limite de hoje atingido')
    expect(gameItemBlockedReason({ ...freeze, availability: 'LimitReached' }, profile(), en)).toBe("This week's limit reached")
  })

  it('names a full HP or full freezes', () => {
    expect(gameItemBlockedReason({ ...potion, availability: 'HpFull' }, profile(), pt)).toBe('HP cheio')
    expect(gameItemBlockedReason({ ...freeze, availability: 'StreakFreezesFull' }, profile(), pt)).toBe('Proteções cheias (2/2)')
  })

  it('counts the missing coins from the newest profile', () => {
    expect(gameItemBlockedReason(freeze, profile({ coins: 149 }), pt)).toBe('Falta 1 moeda')
    expect(gameItemBlockedReason({ ...freeze, availability: 'InsufficientCoins' }, profile({ coins: 200 }), pt)).toBeNull()
    expect(gameItemBlockedReason({ ...potion, availability: 'InsufficientCoins' }, undefined, en)).toBe('40 coins short')
  })
})

describe('hpHealedNow', () => {
  it('caps the heal at what is missing to the maximum', () => {
    expect(hpHealedNow(potion, profile({ hp: 70 }))).toBe(25)
    expect(hpHealedNow(potion, profile({ hp: 90 }))).toBe(10)
    expect(hpHealedNow(potion, undefined)).toBe(25)
    expect(hpHealedNow(freeze, profile())).toBe(0)
  })
})
