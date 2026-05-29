/**
 * Central HTTP client for DormShare API.
 *
 * - Reads VITE_API_BASE_URL from env
 * - Attaches JWT bearer token from localStorage
 * - Handles 401 by clearing token (caller decides navigation)
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://dormshare-ydaw.onrender.com'

const TOKEN_KEY = 'dormshare_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/** Custom error with HTTP status */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/** Build headers with optional auth */
function authHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders }
  const token = getStoredToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** Generic request — returns parsed JSON or throws ApiError */
async function request<T>(method: string, path: string, opts?: {
  body?: unknown
  formData?: FormData
  headers?: Record<string, string>
}): Promise<T> {
  const url = `${API_BASE}${path}`

  const headers = authHeaders(opts?.headers)

  // If we have formData, don't set Content-Type (browser sets boundary)
  if (!opts?.formData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, {
    method,
    headers,
    body: opts?.formData ?? (opts?.body !== undefined ? JSON.stringify(opts.body) : undefined),
  })

  // 204 No Content
  if (res.status === 204) {
    return undefined as T
  }

  // Try to parse JSON response
  let data: unknown
  try {
    data = await res.json()
  } catch {
    // Non-JSON response
    if (!res.ok) {
      throw new ApiError(res.status, `Request failed: ${res.statusText}`)
    }
    return undefined as T
  }

  if (!res.ok) {
    const detail = (data as { detail?: string })?.detail || res.statusText
    throw new ApiError(res.status, detail)
  }

  return data as T
}

// ── Public helpers ─────────────────────────────

export function apiGet<T>(path: string): Promise<T> {
  return request<T>('GET', path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, { body })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('PATCH', path, { body })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>('DELETE', path)
}

export function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  return request<T>('POST', path, { formData })
}

export { API_BASE, TOKEN_KEY }
