import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichText, plainText } from './RichText';

describe('RichText', () => {
  test('renders *emphasis* as <em>', () => {
    render(<RichText text="this is *important* text" />);
    const em = screen.getByText('important');
    expect(em.tagName).toBe('EM');
  });

  test('renders **bold** as <strong>', () => {
    render(<RichText text="the **Readable** stream" />);
    const strong = screen.getByText('Readable');
    expect(strong.tagName).toBe('STRONG');
  });

  test('renders backtick spans as inline code chips', () => {
    render(<RichText text="use `Array.map` here" />);
    const code = screen.getByText('Array.map');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveClass('inline-code');
  });

  test('asterisks inside backticks are NOT treated as emphasis', () => {
    render(<RichText text="allow `s3:*` on the bucket" />);
    const code = screen.getByText('s3:*');
    expect(code).toHaveClass('inline-code');
    expect(document.querySelector('em')).toBeNull();
  });

  test('renders fenced code blocks with Prism token markup', () => {
    const { container } = render(<RichText text={'```js\nconst x = 1;\n```'} />);
    const pre = container.querySelector('pre.code-block');
    expect(pre).not.toBeNull();
    expect(pre!.querySelector('.token.keyword')).not.toBeNull(); // const
  });

  test('copy button copies the raw code and shows feedback', async () => {
    const user = userEvent.setup(); // stubs navigator.clipboard under jsdom
    render(<RichText text={'```js\nconst x = 1;\n```'} />);
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    expect(await window.navigator.clipboard.readText()).toBe('const x = 1;\n');
  });

  test('converts newlines to <br> outside code blocks', () => {
    const { container } = render(<RichText text={'line one\nline two'} />);
    expect(container.querySelectorAll('br')).toHaveLength(1);
  });

  test('renders nothing for empty text', () => {
    const { container } = render(<RichText text={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('plainText', () => {
  test('replaces code fences with [code] and strips backticks', () => {
    expect(plainText('See ```js\ncode here\n``` and `chip`')).toBe('See [code] and chip');
    expect(plainText(undefined)).toBe('');
  });
});
