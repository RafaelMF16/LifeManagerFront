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
