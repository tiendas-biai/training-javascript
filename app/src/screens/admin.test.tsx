import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

jest.mock('../lib/subjects', () => {
  const cards = [
    { id: 'mock-1', topic: 'A', subtopic: 'S', difficulty: 'easy', question: 'Mock question one?', answer: 'A1', explanation: 'E1', tags: ['t1'] },
    { id: 'mock-2', topic: 'B', subtopic: 'S', difficulty: 'hard', question: 'Mock question two?', answer: 'A2', explanation: 'E2', tags: [] },
  ];
  const subject = {
    id: 'mocksubj', label: 'Mock Subject', icon: 'MS', color: '#123456',
    storageKey: 'srs:mocksubj', loadData: () => Promise.resolve({ default: cards }),
  };
  return { subjects: { mocksubj: subject }, getSubject: (id: string) => (id === 'mocksubj' ? subject : null), listSubjects: () => [subject] };
});

// Locally override the global anonymous auth mock with a configurable state.
let authState: Record<string, unknown>;
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => authState,
  Auth0Provider: ({ children }: { children: React.ReactNode }) => children,
}));

const apiCards = [
  { id: 'api-1', topic: 'A', subtopic: 'S', difficulty: 'easy', question: 'Live question one?', answer: 'a', explanation: 'e', tags: [] },
  { id: 'api-2', type: 'multiple-choice', topic: 'B', subtopic: 'S', difficulty: 'hard', question: 'Live MCQ?', options: ['x', 'y'], answer: 'x', explanation: 'e', tags: [] },
];

function mockFetch() {
  const fn = jest.fn(async (_url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    if (method === 'GET') return { ok: true, status: 200, json: async () => apiCards };
    if (method === 'DELETE') return { ok: true, status: 204 };
    return { ok: true, status: 200, json: async () => ({}) };
  });
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

const adminUser = { sub: 'u1', user_roles: ['admin'] };
const base = { isAuthenticated: true, isLoading: false, getAccessTokenSilently: async () => 'tok', loginWithRedirect: async () => {}, logout: async () => {} };

afterEach(() => { localStorage.clear(); jest.restoreAllMocks(); });

const renderAdmin = () =>
  render(<MemoryRouter initialEntries={['/mocksubj/admin']}><App /></MemoryRouter>);

test('non-admin user is refused the admin screen', async () => {
  authState = { ...base, user: { sub: 'u1', user_roles: ['viewer'] } };
  mockFetch();
  renderAdmin();
  expect(await screen.findByText('Not authorized')).toBeInTheDocument();
});

test('admin sees the live card list from the API', async () => {
  authState = { ...base, user: adminUser };
  mockFetch();
  renderAdmin();
  expect(await screen.findByText('Manage cards')).toBeInTheDocument();
  expect(await screen.findByText('Live question one?')).toBeInTheDocument();
  expect(screen.getByText('Live MCQ?')).toBeInTheDocument();
});

test('delete calls DELETE on the cards API for that id', async () => {
  authState = { ...base, user: adminUser };
  const fetchMock = mockFetch();
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  renderAdmin();
  await screen.findByText('Live question one?');

  await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

  await waitFor(() => {
    const del = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'DELETE');
    expect(del?.[0]).toBe('/cards/mocksubj/api-1');
  });
});
