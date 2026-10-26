import { apiRequest } from '../../shared/services/httpClient'
import type { LoginFormValues, RegisterFormValues } from '../validation/userSchemas'
import type { LoginRequestDto, LoginResponseDto, RegisterRequestDto } from '../types/AuthDtos'
import { setAccessToken } from '../../shared/services/tokenStorage'
import type { UserPreferences } from '../../shared/types/UserPreferences'
import { toUserPreferencesDto } from '../../shared/utils/userPreferencesMapper'

export async function login(data: LoginFormValues): Promise<void> {
  const response = await apiRequest<LoginResponseDto>('/api/Auth/Login', {
    method: 'POST',
    body: { email: data.email, password: data.password } satisfies LoginRequestDto,
  })

  setAccessToken(response.accessToken)
}

export async function register(data: RegisterFormValues, preferences: UserPreferences): Promise<void> {
  await apiRequest<void>('/api/Auth/Register', {
    method: 'POST',
    body: {
      name: data.name,
      email: data.email,
      ...toUserPreferencesDto(preferences),
    } satisfies RegisterRequestDto,
  })
}
