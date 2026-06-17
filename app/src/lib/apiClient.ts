import { authConfig } from '../auth/authEnv';

const API_URL = authConfig.apiUrl ?? '';

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}: ${body}`);
    this.name = 'ApiError';
  }
}

export type ApiClient = <T>(path: string, init?: RequestInit) => Promise<T>;

// Given a token-getter (from useAuth0's getAccessTokenSilently), returns a typed
// fetch helper that attaches the bearer token. Replaces RTK Query's prepareHeaders.
export function makeApiClient(getToken: () => Promise<string>): ApiClient {
  return async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.status === 204 ? (undefined as T) : res.json();
  };
}
