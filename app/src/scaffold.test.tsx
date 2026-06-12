// Phase 0 sanity check: TypeScript + JSX + RTL + jsdom pipeline works.
// Replaced by real suites in Phase 1; delete when lib/ tests exist.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

function Probe() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>clicked {count}</button>;
}

test('react renders and responds to events under jest', async () => {
  render(<Probe />);
  const btn = screen.getByRole('button', { name: /clicked 0/ });
  await userEvent.click(btn);
  expect(screen.getByRole('button', { name: /clicked 1/ })).toBeInTheDocument();
});

test('localStorage is available in jsdom', () => {
  localStorage.setItem('srs:test', JSON.stringify({ ok: true }));
  expect(JSON.parse(localStorage.getItem('srs:test')!)).toEqual({ ok: true });
  localStorage.removeItem('srs:test');
});
