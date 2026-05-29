/**
 * Auth service — login, register, logout, token helpers.
 */
import { apiPost, setStoredToken, clearStoredToken, getStoredToken } from './apiClient'

type AuthResponse = {
  access_token: string
  token_type: string
  status?: string
}

export async function login(email: string, password: string): Promise<void> {
  const res = await apiPost<AuthResponse>('/auth/login', { email, password })
  setStoredToken(res.access_token)
}

export async function register(
  username: string,
  email: string,
  password: string,
  university: string,
): Promise<void> {
  const res = await apiPost<AuthResponse>('/auth/register', {
    username,
    email,
    password,
    university,
  })
  setStoredToken(res.access_token)
}

export function logout(): void {
  clearStoredToken()
}

export function isAuthenticated(): boolean {
  return getStoredToken() !== null
}

export { getStoredToken }
