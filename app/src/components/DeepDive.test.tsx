import { render, screen } from '@testing-library/react';
import { DeepDive } from './DeepDive';
import type { DeepDive as DeepDiveData } from '../types';

const full: DeepDiveData = {
  explanation: 'This explains the concept clearly.',
  example: '```js\nconst x = 1;\n```',
  resources: [{ label: 'MDN docs', url: 'https://developer.mozilla.org/' }],
};

describe('DeepDive', () => {
  test('renders explanation, example (with copy), and resource links', () => {
    render(<DeepDive data={full} />);

    expect(screen.getByText('This explains the concept clearly.')).toBeInTheDocument();

    // Example block reuses the RichText code block, which carries the Copy button.
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'MDN docs' });
    expect(link).toHaveAttribute('href', 'https://developer.mozilla.org/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('omits the example and resources sections when absent', () => {
    render(<DeepDive data={{ explanation: 'Just prose.' }} />);

    expect(screen.getByText('Just prose.')).toBeInTheDocument();
    expect(screen.queryByText('Example')).not.toBeInTheDocument();
    expect(screen.queryByText('Further reading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });
});
