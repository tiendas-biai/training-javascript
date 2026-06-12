import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Session } from './Session';
import type { Card, Progress, RevealCard } from '../types';

const makeCard = (id: string): RevealCard => ({
  id, topic: 'T', subtopic: 'S', difficulty: 'easy',
  question: `Question ${id}`, answer: `Answer ${id}`, explanation: 'E', tags: [],
});

const noop = () => {};

async function gradeCurrent(rating: RegExp) {
  await userEvent.click(screen.getByRole('button', { name: /show answer/i }));
  await userEvent.click(screen.getByRole('button', { name: rating }));
}

describe('Session integration', () => {
  test('a learning card graduates after two Good answers and the session ends in a summary', async () => {
    const progress: Record<string, Progress> = {};
    const onProgress = jest.fn((id: string, p: Progress) => { progress[id] = p; });
    const queue: Card[] = [makeCard('a')];

    render(
      <Session initialQueue={queue} progressMap={progress} onProgress={onProgress}
        onRestart={noop} onExit={noop} />,
    );

    // First Good: streak 1, card cycles back (still learning, queue of 1 → same card again)
    expect(screen.getByText('Question a')).toBeInTheDocument();
    expect(screen.getByText('Learning · 0/2')).toBeInTheDocument();
    await gradeCurrent(/good/i);

    // Same card again, streak now shown as 1/2
    expect(screen.getByText('Question a')).toBeInTheDocument();
    expect(screen.getByText('Learning · 1/2')).toBeInTheDocument();
    expect(progress['a'].phase).toBe('learning');

    // Second Good: graduates with a 2-day interval, queue empties → summary
    await gradeCurrent(/good/i);
    expect(progress['a'].phase).toBe('review');
    expect(progress['a'].interval).toBe(2);

    expect(screen.getByText('Session complete!')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2);     // reviewed 2, correct 2
    expect(screen.getByText('100%')).toBeInTheDocument(); // accuracy
  });

  test('Easy graduates immediately and Hard counts against accuracy', async () => {
    const progress: Record<string, Progress> = {};
    const onProgress = jest.fn((id: string, p: Progress) => { progress[id] = p; });
    const queue: Card[] = [makeCard('a'), makeCard('b')];

    render(
      <Session initialQueue={queue} progressMap={progress} onProgress={onProgress}
        onRestart={noop} onExit={noop} />,
    );

    // Card a: Easy → graduates at 3d and exits
    await gradeCurrent(/easy/i);
    expect(progress['a'].phase).toBe('review');
    expect(progress['a'].interval).toBe(3);

    // Card b: Hard → cycles; then Easy → exits
    expect(screen.getByText('Question b')).toBeInTheDocument();
    await gradeCurrent(/hard/i);
    expect(screen.getByText('Question b')).toBeInTheDocument(); // re-inserted, queue of 1
    await gradeCurrent(/easy/i);

    expect(screen.getByText('Session complete!')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();   // reviewed: 3 gradings
    expect(screen.getByText('67%')).toBeInTheDocument(); // 2 of 3 correct
  });

  test('Study Again triggers onRestart and Back to Home triggers onExit', async () => {
    const onRestart = jest.fn();
    const onExit = jest.fn();
    render(
      <Session initialQueue={[]} progressMap={{}} onProgress={noop}
        onRestart={onRestart} onExit={onExit} />,
    );

    expect(screen.getByText('Session complete!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /study again/i }));
    expect(onRestart).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /back to home/i }));
    expect(onExit).toHaveBeenCalled();
  });
});
