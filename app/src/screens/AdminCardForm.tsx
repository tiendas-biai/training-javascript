import { useState } from 'react';
import type { Card, CardType, Difficulty } from '../types';
import { getCardType } from '../lib/session';

interface Props {
  initial: Card | null;          // null = creating a new card
  existingIds: string[];         // for create-time id uniqueness
  onSave: (card: Card) => void;
  onCancel: () => void;
}

interface FormState {
  id: string;
  type: CardType;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  explanation: string;
  tags: string;        // comma-separated in the UI
  answer: string;      // reveal + multiple-choice
  options: string[];   // multiple-choice + multiple-response
  answers: string[];   // multiple-response
}

function toForm(card: Card | null): FormState {
  if (!card) {
    return {
      id: '', type: 'reveal', topic: '', subtopic: '', difficulty: 'medium',
      question: '', explanation: '', tags: '', answer: '', options: ['', ''], answers: [],
    };
  }
  const type = getCardType(card);
  return {
    id: card.id,
    type,
    topic: card.topic ?? '',
    subtopic: card.subtopic ?? '',
    difficulty: card.difficulty,
    question: card.question ?? '',
    explanation: card.explanation ?? '',
    tags: (card.tags ?? []).join(', '),
    answer: 'answer' in card ? card.answer : '',
    options: 'options' in card ? [...card.options] : ['', ''],
    answers: 'answers' in card ? [...card.answers] : [],
  };
}

// Build a Card from the form, or throw a human-readable validation error.
function toCard(f: FormState): Card {
  const id = f.id.trim();
  if (!id) throw new Error('ID is required');
  if (!f.question.trim()) throw new Error('Question is required');

  const base = {
    id,
    topic: f.topic.trim(),
    subtopic: f.subtopic.trim(),
    difficulty: f.difficulty,
    question: f.question,
    explanation: f.explanation,
    tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
  };

  if (f.type === 'reveal') {
    if (!f.answer.trim()) throw new Error('Answer is required');
    return { ...base, type: 'reveal', answer: f.answer };
  }

  const options = f.options.map(o => o.trim()).filter(Boolean);
  if (options.length < 2) throw new Error('At least 2 options are required');

  if (f.type === 'multiple-choice') {
    if (!options.includes(f.answer)) throw new Error('Pick the correct option');
    return { ...base, type: 'multiple-choice', options, answer: f.answer };
  }

  const answers = f.answers.filter(a => options.includes(a));
  if (answers.length < 2) throw new Error('Select at least 2 correct options');
  return { ...base, type: 'multiple-response', options, answers };
}

export function AdminCardForm({ initial, existingIds, onSave, onCancel }: Props) {
  const [f, setF] = useState<FormState>(() => toForm(initial));
  const [error, setError] = useState<string | null>(null);
  const isNew = initial === null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setF(prev => ({ ...prev, [key]: value }));

  const setOption = (i: number, value: string) =>
    setF(prev => {
      const options = [...prev.options];
      const old = options[i];
      options[i] = value;
      // keep answer/answers in sync with renamed options
      return {
        ...prev,
        options,
        answer: prev.answer === old ? value : prev.answer,
        answers: prev.answers.map(a => (a === old ? value : a)),
      };
    });

  const removeOption = (i: number) =>
    setF(prev => {
      const removed = prev.options[i];
      return {
        ...prev,
        options: prev.options.filter((_, idx) => idx !== i),
        answer: prev.answer === removed ? '' : prev.answer,
        answers: prev.answers.filter(a => a !== removed),
      };
    });

  const toggleAnswer = (opt: string) =>
    setF(prev => ({
      ...prev,
      answers: prev.answers.includes(opt)
        ? prev.answers.filter(a => a !== opt)
        : [...prev.answers, opt],
    }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isNew && existingIds.includes(f.id.trim())) throw new Error('That ID already exists');
      onSave(toCard(f));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="screen">
      <div className="lib-header">
        <button type="button" className="exit-btn" onClick={onCancel}>← Cancel</button>
        <span className="lib-title">{isNew ? 'New card' : `Edit ${initial!.id}`}</span>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>ID
          <input value={f.id} disabled={!isNew} onChange={e => set('id', e.target.value)}
            placeholder="e.g. react-hooks-010" />
        </label>

        <div className="admin-form-row">
          <label>Type
            <select value={f.type} onChange={e => set('type', e.target.value as CardType)}>
              <option value="reveal">Reveal</option>
              <option value="multiple-choice">Multiple choice</option>
              <option value="multiple-response">Multiple response</option>
            </select>
          </label>
          <label>Difficulty
            <select value={f.difficulty} onChange={e => set('difficulty', e.target.value as Difficulty)}>
              {(['easy', 'medium', 'hard'] as const).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>

        <div className="admin-form-row">
          <label>Topic <input value={f.topic} onChange={e => set('topic', e.target.value)} /></label>
          <label>Subtopic <input value={f.subtopic} onChange={e => set('subtopic', e.target.value)} /></label>
        </div>

        <label>Question
          <textarea value={f.question} rows={3} onChange={e => set('question', e.target.value)} />
        </label>

        {f.type === 'reveal' && (
          <label>Answer
            <textarea value={f.answer} rows={2} onChange={e => set('answer', e.target.value)} />
          </label>
        )}

        {f.type !== 'reveal' && (
          <fieldset className="admin-options">
            <legend>Options {f.type === 'multiple-choice' ? '(pick the correct one)' : '(check all correct)'}</legend>
            {f.options.map((opt, i) => (
              <div key={i} className="admin-option-row">
                {f.type === 'multiple-choice' ? (
                  <input type="radio" name="mcq-answer" checked={f.answer === opt && opt !== ''}
                    onChange={() => set('answer', opt)} aria-label={`correct ${i + 1}`} />
                ) : (
                  <input type="checkbox" checked={f.answers.includes(opt) && opt !== ''}
                    onChange={() => toggleAnswer(opt)} aria-label={`correct ${i + 1}`} />
                )}
                <input value={opt} onChange={e => setOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                <button type="button" className="admin-remove" onClick={() => removeOption(i)}
                  disabled={f.options.length <= 2} aria-label={`remove ${i + 1}`}>×</button>
              </div>
            ))}
            <button type="button" className="btn-secondary admin-add-option"
              onClick={() => set('options', [...f.options, ''])}>+ Add option</button>
          </fieldset>
        )}

        <label>Explanation
          <textarea value={f.explanation} rows={2} onChange={e => set('explanation', e.target.value)} />
        </label>

        <label>Tags (comma-separated)
          <input value={f.tags} onChange={e => set('tags', e.target.value)} placeholder="hooks, state" />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">{isNew ? 'Create card' : 'Save changes'}</button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
