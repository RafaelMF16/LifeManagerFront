import type { LanguageDto, ThemeDto } from '../../shared/types/UserPreferencesDtos'

export interface LoginRequestDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
}

// language/theme: os da tela de cadastro; viram o idioma do e-mail, das categorias padrão e as preferências
export interface RegisterRequestDto {
  name: string
  email: string
  language: LanguageDto
  theme: ThemeDto
}

// O token do link do e-mail vai sempre no corpo, nunca na URL da chamada
export interface EmailTokenRequestDto {
  token: string
}

export interface PendingRegistrationResponseDto {
  email: string
  name: string
}

export interface CompleteRegistrationRequestDto {
  token: string
  password: string
}
