export interface LoginRequestDto {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
}

export interface RegisterRequestDto {
  name: string
  email: string
  userPassword: string
}
