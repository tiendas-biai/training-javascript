import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminCardForm } from './AdminCardForm';
import type { Card } from '../types';

afterEach(() => jest.restoreAllMocks());

test('builds a deepDive from the form fields on save', async () => {
  const onSave = jest.fn();
  render(<AdminCardForm initial={null} existingIds={[]} onSave={onSave} onCancel={() => {}} />);

  await userEvent.type(screen.getByLabelText('ID'), 'js-1');
  await userEvent.type(screen.getByLabelText('Question'), 'Q?');
  await userEvent.type(screen.getByLabelText('Answer'), 'A.');
  await userEvent.type(screen.getByLabelText('Explanation (markdown)'), 'Because reasons.');

  await userEvent.click(screen.getByRole('button', { name: '+ Add resource' }));
  await userEvent.type(screen.getByLabelText('resource label 1'), 'MDN');
  await userEvent.type(screen.getByLabelText('resource url 1'), 'https://mdn.dev/');

  await userEvent.click(screen.getByRole('button', { name: 'Create card' }));

  expect(onSave).toHaveBeenCalledTimes(1);
  const saved = onSave.mock.calls[0][0] as Card;
  expect(saved.deepDive).toEqual({
    explanation: 'Because reasons.',
    resources: [{ label: 'MDN', url: 'https://mdn.dev/' }],
  });
});

test('omits deepDive entirely when no deep-dive fields are filled', async () => {
  const onSave = jest.fn();
  render(<AdminCardForm initial={null} existingIds={[]} onSave={onSave} onCancel={() => {}} />);

  await userEvent.type(screen.getByLabelText('ID'), 'js-2');
  await userEvent.type(screen.getByLabelText('Question'), 'Q?');
  await userEvent.type(screen.getByLabelText('Answer'), 'A.');
  await userEvent.click(screen.getByRole('button', { name: 'Create card' }));

  expect((onSave.mock.calls[0][0] as Card).deepDive).toBeUndefined();
});

test('rejects a deep dive that has an example but no explanation', async () => {
  const onSave = jest.fn();
  render(<AdminCardForm initial={null} existingIds={[]} onSave={onSave} onCancel={() => {}} />);

  await userEvent.type(screen.getByLabelText('ID'), 'js-3');
  await userEvent.type(screen.getByLabelText('Question'), 'Q?');
  await userEvent.type(screen.getByLabelText('Answer'), 'A.');
  await userEvent.type(screen.getByLabelText(/^Example/), '```js\n1;\n```');
  await userEvent.click(screen.getByRole('button', { name: 'Create card' }));

  expect(onSave).not.toHaveBeenCalled();
  expect(screen.getByText(/explanation is required/i)).toBeInTheDocument();
});

test('hydrates the form from an existing card deepDive', () => {
  const card: Card = {
    id: 'js-4', topic: 'T', subtopic: 'S', difficulty: 'easy',
    question: 'Q?', answer: 'A.', explanation: 'E', tags: [],
    deepDive: { explanation: 'Deep prose.', resources: [{ label: 'L', url: 'https://x.dev/' }] },
  };
  render(<AdminCardForm initial={card} existingIds={[]} onSave={() => {}} onCancel={() => {}} />);

  expect(screen.getByLabelText('Explanation (markdown)')).toHaveValue('Deep prose.');
  expect(screen.getByLabelText('resource label 1')).toHaveValue('L');
  expect(screen.getByLabelText('resource url 1')).toHaveValue('https://x.dev/');
});
