import { apiRequest } from '../../shared/services/httpClient'
import type { LoginFormValues, RegisterFormValues } from '../validation/userSchemas'
import type { LoginRequestDto, LoginResponseDto, RegisterRequestDto } from '../types/AuthDtos'
import { setAccessToken } from './tokenStorage'

export async function login(data: LoginFormValues): Promise<void> {
  const response = await apiRequest<LoginResponseDto>('/api/Auth/Login', {
    method: 'POST',
    body: { email: data.email, password: data.password } satisfies LoginRequestDto,
  })

  setAccessToken(response.accessToken)
}

export async function register(data: RegisterFormValues): Promise<void> {
  await apiRequest<void>('/api/Auth/Register', {
    method: 'POST',
    body: {
      name: data.name,
      email: data.email,
      userPassword: data.password,
    } satisfies RegisterRequestDto,
  })
}
