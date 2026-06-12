import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RevealCard } from './RevealCard';
import { MCQCard } from './MCQCard';
import { MRCard } from './MRCard';
import type { CardInfo } from '../components/badges';
import type { MCQCard as MCQData, MRCard as MRData, Rating, RevealCard as RevealData } from '../types';

const cardInfo: CardInfo = { phase: 'learning', streak: 0, interval: 0 };
const previews: Record<Rating, string> = { hard: 'again', good: 'later', easy: '3d' };

const revealData: RevealData = {
  id: 'r1', topic: 'Arrays', subtopic: 'S', difficulty: 'easy',
  question: 'What does map do?', answer: 'Transforms elements', explanation: 'Returns a new array', tags: [],
};

const mcqData: MCQData = {
  id: 'm1', type: 'multiple-choice', topic: 'Scope', subtopic: 'S', difficulty: 'medium',
  question: 'Pick one', options: ['Right answer', 'Wrong A', 'Wrong B', 'Wrong C'],
  answer: 'Right answer', explanation: 'Because reasons', tags: [],
};

const mrData: MRData = {
  id: 'x1', type: 'multiple-response', topic: 'AWS', subtopic: 'S', difficulty: 'hard',
  question: 'Pick two', options: ['Good 1', 'Good 2', 'Bad 1', 'Bad 2', 'Bad 3'],
  answers: ['Good 1', 'Good 2'], explanation: 'Combo explanation', tags: [],
};

// Identity shuffle keeps option order deterministic.
beforeEach(() => jest.spyOn(Math, 'random').mockReturnValue(0.9999));
afterEach(() => jest.restoreAllMocks());

const noop = () => {};

describe('RevealCard', () => {
  test('hides the answer until Show Answer is clicked, then grades', async () => {
    const onGrade = jest.fn();
    render(<RevealCard card={revealData} remaining={3} cardInfo={cardInfo} previews={previews} onGrade={onGrade} onExit={noop} />);

    expect(screen.queryByText('Transforms elements')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /good/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /show answer/i }));

    expect(screen.getByText('Transforms elements')).toBeInTheDocument();
    expect(screen.getByText('Returns a new array')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /good/i }));
    expect(onGrade).toHaveBeenCalledWith('good');
  });

  test('shows remaining count and exit button', async () => {
    const onExit = jest.fn();
    render(<RevealCard card={revealData} remaining={7} cardInfo={cardInfo} previews={previews} onGrade={noop} onExit={onExit} />);
    expect(screen.getByText('7 left')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /exit/i }));
    expect(onExit).toHaveBeenCalled();
  });
});

describe('MCQCard', () => {
  test('picking the wrong option highlights correct and wrong, shows verdict', async () => {
    render(<MCQCard card={mcqData} remaining={1} cardInfo={cardInfo} previews={previews} onGrade={noop} onExit={noop} />);

    await userEvent.click(screen.getByRole('button', { name: 'Wrong A' }));

    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Right answer' })).toHaveClass('correct');
    expect(screen.getByRole('button', { name: 'Wrong A' })).toHaveClass('wrong');
    expect(screen.getByRole('button', { name: 'Wrong B' })).not.toHaveClass('wrong');
    expect(screen.getByText('Because reasons')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
  });

  test('picking the right option shows ✓ Correct', async () => {
    render(<MCQCard card={mcqData} remaining={1} cardInfo={cardInfo} previews={previews} onGrade={noop} onExit={noop} />);
    await userEvent.click(screen.getByRole('button', { name: 'Right answer' }));
    expect(screen.getByText('✓ Correct')).toBeInTheDocument();
  });

  test('options lock after answering', async () => {
    render(<MCQCard card={mcqData} remaining={1} cardInfo={cardInfo} previews={previews} onGrade={noop} onExit={noop} />);
    await userEvent.click(screen.getByRole('button', { name: 'Wrong A' }));
    expect(screen.getByRole('button', { name: 'Wrong B' })).toBeDisabled();
  });
});

describe('MRCard', () => {
  function setup(onGrade = noop) {
    render(<MRCard card={mrData} remaining={1} cardInfo={cardInfo} previews={previews} onGrade={onGrade} onExit={noop} />);
  }

  test('shows Select N hint and disables Submit until exactly N picked', async () => {
    setup();
    expect(screen.getByText('Select 2')).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: /submit/i });

    expect(submit).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Good 1' }));
    expect(submit).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Good 2' }));
    expect(submit).toBeEnabled();

    // deselect → disabled again
    await userEvent.click(screen.getByRole('button', { name: 'Good 2' }));
    expect(submit).toBeDisabled();
  });

  test('correct submission highlights answers and shows ✓ Correct', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Good 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Good 2' }));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Good 1' })).toHaveClass('correct');
    expect(screen.getByRole('button', { name: 'Good 2' })).toHaveClass('correct');
  });

  test('wrong submission flags the wrong pick and still highlights all answers', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Good 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Bad 1' }));
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bad 1' })).toHaveClass('wrong');
    expect(screen.getByRole('button', { name: 'Good 1' })).toHaveClass('correct');
    expect(screen.getByRole('button', { name: 'Good 2' })).toHaveClass('correct');
  });
});
