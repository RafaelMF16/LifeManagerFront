export interface UpdateCurrentUserDto {
  name: string
}

export interface UpdatedUserNameResponseDto {
  name: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export interface RequestAccountDeletionDto {
  password: string
}

export interface AccountDeletionResponseDto {
  /** When the account will be deleted (ISO instant); signing in before it cancels. */
  scheduledFor: string
}
