import { apiRequest } from '../../shared/services/httpClient'
import type { LoginFormValues, NewPasswordFormValues, RegisterFormValues } from '../validation/userSchemas'
import type {
  CompleteRegistrationRequestDto,
  EmailTokenRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  PendingRegistrationResponseDto,
  RegisterRequestDto,
} from '../types/AuthDtos'
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

// Checks the confirmation link before the password form shows; 400 Auth.InvalidEmailToken when expired or used.
export function verifyRegistration(token: string, signal?: AbortSignal): Promise<PendingRegistrationResponseDto> {
  return apiRequest<PendingRegistrationResponseDto>('/api/Auth/Register/Verify', {
    method: 'POST',
    body: { token } satisfies EmailTokenRequestDto,
    signal,
  })
}

export async function completeRegistration(token: string, data: NewPasswordFormValues): Promise<void> {
  await apiRequest<void>('/api/Auth/Register/Complete', {
    method: 'POST',
    body: { token, password: data.password } satisfies CompleteRegistrationRequestDto,
  })
}
