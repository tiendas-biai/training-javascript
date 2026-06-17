import { act, renderHook, waitFor } from '@testing-library/react';
import { useProgress } from './useProgress';
import type { Progress, Subject } from '../types';

// Mutable auth state so one file can exercise both the anonymous and the
// authenticated branch (jest.mock here overrides the global auth0 mapper).
let authState: {
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessTokenSilently: () => Promise<string>;
};
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => authState,
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
}));

const subject: Subject = {
  id: 'sub', label: 'Sub', icon: 'S', color: '#000',
  storageKey: 'srs:sub', loadData: () => Promise.resolve({ default: [] }),
};

const p = (id: string, over: Partial<Progress> = {}): Progress => ({
  id, phase: 'review', interval: 5, ease: 2.5, nextDue: 0, lastReviewed: null, totalSeen: 1, ...over,
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('useProgress — anonymous (localStorage)', () => {
  beforeEach(() => {
    authState = { isAuthenticated: false, isLoading: false, getAccessTokenSilently: async () => '' };
  });

  test('hydrates synchronously from localStorage with loading=false', () => {
    localStorage.setItem('srs:sub', JSON.stringify({ c1: p('c1') }));
    const { result } = renderHook(() => useProgress(subject));
    expect(result.current.loading).toBe(false);
    expect(result.current.progressMap).toEqual({ c1: p('c1') });
  });

  test('update optimistically sets state and persists to localStorage', () => {
    const { result } = renderHook(() => useProgress(subject));
    act(() => result.current.update('c1', p('c1')));
    expect(result.current.progressMap).toEqual({ c1: p('c1') });
    expect(JSON.parse(localStorage.getItem('srs:sub')!)).toEqual({ c1: p('c1') });
  });

  test('reset clears state and storage', () => {
    localStorage.setItem('srs:sub', JSON.stringify({ c1: p('c1') }));
    const { result } = renderHook(() => useProgress(subject));
    act(() => result.current.reset());
    expect(result.current.progressMap).toEqual({});
    expect(localStorage.getItem('srs:sub')).toBeNull();
  });
});

describe('useProgress — authenticated (API)', () => {
  beforeEach(() => {
    authState = { isAuthenticated: true, isLoading: false, getAccessTokenSilently: async () => 'tok' };
  });

  test('loads from the API and exposes the map after the loading guard', async () => {
    const fetchMock = jest.fn(async () => ({
      ok: true, status: 200, json: async () => ({ c1: p('c1') }),
    })) as unknown as typeof fetch;
    global.fetch = fetchMock;

    const { result } = renderHook(() => useProgress(subject));
    expect(result.current.loading).toBe(true); // guard while remote load pending
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.progressMap).toEqual({ c1: p('c1') });
    const [url, init] = (fetchMock as jest.Mock).mock.calls[0];
    expect(url).toBe('/progress/sub');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  test('update PUTs the grade to the API', async () => {
    const fetchMock = jest.fn(async () => ({ ok: true, status: 204, json: async () => undefined }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useProgress(subject));
    await waitFor(() => expect(result.current.loading).toBe(false));
    fetchMock.mockClear();

    await act(async () => { result.current.update('c1', p('c1')); });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/progress/sub/c1');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual(p('c1'));
  });
});
