import { apiRequest } from '../../shared/services/httpClient'
import type { NewPasswordFormValues } from '../../shared/validation/userFields'
import type { ForgotPasswordFormValues, LoginFormValues, RegisterFormValues } from '../validation/userSchemas'
import type {
  CompleteRegistrationRequestDto,
  EmailTokenRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  PasswordResetResponseDto,
  PendingRegistrationResponseDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from '../types/AuthDtos'
import { resetCurrentUser } from '../../shared/services/currentUserStore'
import { releasePushOfOtherAccount } from '../../shared/services/pushService'
import { clearAccessToken, setAccessToken } from '../../shared/services/tokenStorage'
import type { UserPreferences } from '../../shared/types/UserPreferences'
import { accessTokenUserId } from '../../shared/utils/pushOwner'
import { toUserPreferencesDto } from '../../shared/utils/userPreferencesMapper'

/** Signs in; `deletionCancelled` says the sign-in cancelled the account's scheduled deletion. */
export async function login(data: LoginFormValues): Promise<{ deletionCancelled: boolean }> {
  const response = await apiRequest<LoginResponseDto>('/api/Auth/Login', {
    method: 'POST',
    body: { email: data.email, password: data.password } satisfies LoginRequestDto,
  })

  setAccessToken(response.accessToken)
  // A new session: whoever was loaded before (another account on this browser) is forgotten, and so are the habit
  // reminders another account turned on here.
  resetCurrentUser()
  await releasePushOfOtherAccount(accessTokenUserId(response.accessToken))

  return { deletionCancelled: response.deletionCancelled === true }
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

// 202 whether or not the e-mail has an account: the page always shows "check your e-mail"
export async function requestPasswordReset(data: ForgotPasswordFormValues): Promise<void> {
  await apiRequest<void>('/api/Auth/ForgotPassword', {
    method: 'POST',
    body: { email: data.email } satisfies ForgotPasswordRequestDto,
  })
}

// Checks the reset link before the password form shows; 400 Auth.InvalidEmailToken when expired or used.
export function verifyPasswordReset(token: string, signal?: AbortSignal): Promise<PasswordResetResponseDto> {
  return apiRequest<PasswordResetResponseDto>('/api/Auth/ResetPassword/Verify', {
    method: 'POST',
    body: { token } satisfies EmailTokenRequestDto,
    signal,
  })
}

// Also ends every open session of the account (the backend revokes its refresh tokens). The tab's access token goes
// too, or PublicOnlyRoute would send the user from the login to /home on a session that no longer refreshes.
export async function resetPassword(token: string, data: NewPasswordFormValues): Promise<void> {
  await apiRequest<void>('/api/Auth/ResetPassword', {
    method: 'POST',
    body: { token, password: data.password } satisfies ResetPasswordRequestDto,
  })
  clearAccessToken()
}
