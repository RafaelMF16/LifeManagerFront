import i18next from 'i18next'
import { describe, expect, it } from 'vitest'
import enUS from '../locales/en-US'
import ptBR from '../locales/pt-BR'
import type { PlayerAvatar } from '../types/PlayerProfileDtos'
import { PLAYER_AVATARS, avatarLook, avatarName } from './playerAvatars'

const i18n = i18next.createInstance()
void i18n.init({
  resources: { 'en-US': { habits: enUS }, 'pt-BR': { habits: ptBR } },
  lng: 'pt-BR',
  ns: ['habits'],
  interpolation: { escapeValue: false },
})

describe('playerAvatars', () => {
  it('lists the 12 avatars in the backend order', () => {
    expect(PLAYER_AVATARS).toEqual(['Cat', 'Dog', 'Bird', 'Rabbit', 'Fish', 'Turtle', 'Squirrel', 'Panda', 'Rocket', 'Flame', 'Mountain', 'Bot'])
  })

  it('names every avatar in both languages', () => {
    for (const language of ['pt-BR', 'en-US']) {
      const translate = i18n.getFixedT(language)
      for (const avatar of PLAYER_AVATARS) expect(avatarName(avatar, translate)).not.toContain('profile.avatars')
    }
    expect(avatarName('Cat', i18n.getFixedT('pt-BR'))).toBe('Gato')
    expect(avatarName('Cat', i18n.getFixedT('en-US'))).toBe('Cat')
  })

  it('falls back to the default look for an unknown avatar', () => {
    expect(avatarLook('Unicorn' as PlayerAvatar)).toEqual(avatarLook('Cat'))
  })
})
