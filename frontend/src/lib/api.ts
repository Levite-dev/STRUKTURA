import { supabase } from './supabase';

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && accessToken) {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      setAccessToken(data.session.access_token);
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
      const retry = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!retry.ok) throw new Error(await retry.text());
      return retry.json() as Promise<T>;
    }
  }

  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string): Promise<T> => request<T>('GET', path);
export const apiPost = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('POST', path, body);
export const apiPatch = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>('PATCH', path, body);
export const apiDelete = <T>(path: string): Promise<T> => request<T>('DELETE', path);

// Legacy `api` function kept for backwards compatibility with existing callers
export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type FetchOptions = RequestInit & { requireAuth?: boolean };

export async function api<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { requireAuth = true, headers: customHeaders, ...rest } = options;
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (requireAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${baseUrl}${path}`, { headers, ...rest });

  if (res.status === 204) return undefined as unknown as T;
  if (!res.ok) {
    const bodyJson = await res.json().catch(() => ({}));
    throw new ApiError(res.status, bodyJson.detail ?? res.statusText, bodyJson);
  }
  return res.json();
}
