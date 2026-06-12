import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

// The registry's dynamic JSON imports don't resolve in Jest; mock with a tiny bank.
jest.mock('../lib/subjects', () => {
  const cards = [
    {
      id: 'mock-1', topic: 'Topic A', subtopic: 'S', difficulty: 'easy',
      question: 'Mock question one?', answer: 'A1', explanation: 'E1', tags: ['t1'],
    },
    {
      id: 'mock-mr-1', type: 'multiple-response', topic: 'Topic B', subtopic: 'S', difficulty: 'hard',
      question: 'Mock multi?', options: ['G1', 'G2', 'B1', 'B2', 'B3'], answers: ['G1', 'G2'],
      explanation: 'E2', tags: ['t2'],
    },
  ];
  const subject = {
    id: 'mocksubj', label: 'Mock Subject', icon: 'MS', color: '#123456',
    storageKey: 'srs:mocksubj',
    loadData: () => Promise.resolve({ default: cards }),
  };
  return {
    subjects: { mocksubj: subject },
    getSubject: (id: string | undefined) => (id === 'mocksubj' ? subject : null),
    listSubjects: () => [subject],
  };
});

afterEach(() => localStorage.clear());

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('routing', () => {
  test('subject picker renders a tile per subject with counts', async () => {
    renderAt('/');
    expect(await screen.findByText('Mock Subject')).toBeInTheDocument();
    expect(screen.getByText('2 cards · 2 due')).toBeInTheDocument();
  });

  test('clicking a tile navigates to the subject home', async () => {
    renderAt('/');
    await userEvent.click(await screen.findByText('Mock Subject'));
    expect(await screen.findByRole('heading', { name: 'Mock Subject' })).toBeInTheDocument();
    expect(screen.getByText('Start Session · 2 cards')).toBeInTheDocument();
  });

  test('unknown subject redirects to the picker', async () => {
    renderAt('/not-a-subject');
    expect(await screen.findByText('Pick a subject to study')).toBeInTheDocument();
  });

  test('unknown card id redirects to the subject library', async () => {
    renderAt('/mocksubj/card/does-not-exist');
    expect(await screen.findByText('Card Library')).toBeInTheDocument();
  });

  test('card detail renders an MR card with all correct options highlighted', async () => {
    renderAt('/mocksubj/card/mock-mr-1');
    expect(await screen.findByText('Card Detail')).toBeInTheDocument();
    expect(screen.getByText('G1')).toHaveClass('correct');
    expect(screen.getByText('G2')).toHaveClass('correct');
    expect(screen.getByText('B1')).not.toHaveClass('correct');
    expect(screen.getByText('Never studied')).toBeInTheDocument();
  });
});

describe('card library', () => {
  test('search filters rows', async () => {
    renderAt('/mocksubj/card-library');
    expect(await screen.findByText('Mock question one?')).toBeInTheDocument();
    expect(screen.getByText('Mock multi?')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/search/i), 'multi');
    expect(screen.queryByText('Mock question one?')).not.toBeInTheDocument();
    expect(screen.getByText('Mock multi?')).toBeInTheDocument();
    expect(screen.getByText('1 cards')).toBeInTheDocument();
  });

  test('status chips show global counts and filter the table', async () => {
    renderAt('/mocksubj/card-library');
    await screen.findByText('Mock question one?');

    expect(screen.getByRole('button', { name: 'All (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New (2)' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Mastered (0)' }));
    expect(screen.getByText('No cards match the current filters.')).toBeInTheDocument();
    // chip counts unchanged by the active filter
    expect(screen.getByRole('button', { name: 'All (2)' })).toBeInTheDocument();
  });

  test('clicking a row opens the card detail', async () => {
    renderAt('/mocksubj/card-library');
    await userEvent.click(await screen.findByText('Mock question one?'));
    expect(await screen.findByText('Card Detail')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
  });
});
