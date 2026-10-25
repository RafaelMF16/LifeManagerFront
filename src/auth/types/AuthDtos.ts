import type { LanguageDto, ThemeDto } from '../../shared/types/UserPreferencesDtos'

export interface LoginRequestDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
}

// language/theme: os da tela de cadastro; o backend cria as categorias padrão nesse idioma e salva as preferências
export interface RegisterRequestDto {
  name: string
  email: string
  userPassword: string
  language: LanguageDto
  theme: ThemeDto
}
