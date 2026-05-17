const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"

type FetchOptions = RequestInit & { requireAuth?: boolean }

export async function api<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { requireAuth = true, headers: customHeaders, ...rest } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  }

  if (requireAuth) {
    const token = localStorage.getItem("struktura:access_token:v1")
    if (token) headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...rest,
  })

  if (res.status === 204) return undefined as unknown as T
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? res.statusText, body)
  }

  return res.json()
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(
    status: number,
    message: string,
    body: unknown,
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export function setAccessToken(token: string): void {
  localStorage.setItem("struktura:access_token:v1", token)
}

export function clearAccessToken(): void {
  localStorage.removeItem("struktura:access_token:v1")
}

export function getAccessToken(): string | null {
  return localStorage.getItem("struktura:access_token:v1")
}
