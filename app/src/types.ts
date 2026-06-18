// Shared domain types for the Dev Drill app.

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Rating = 'hard' | 'good' | 'easy';
export type CardType = 'reveal' | 'multiple-choice' | 'multiple-response';

interface BaseCard {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  explanation: string;
  tags: string[];
}

export interface RevealCard extends BaseCard {
  type?: 'reveal';
  answer: string;
}

export interface MCQCard extends BaseCard {
  type: 'multiple-choice';
  options: string[];
  answer: string;
}

export interface MRCard extends BaseCard {
  type: 'multiple-response';
  options: string[];
  answers: string[];
}

export type Card = RevealCard | MCQCard | MRCard;

export interface Progress {
  id: string;
  phase: 'learning' | 'review';
  interval: number;
  ease: number;
  nextDue: number;
  lastReviewed: number | null;
  totalSeen: number;
  // Personal "study this later" flag, toggled from the session header. Orthogonal
  // to SM-2 state; undefined/absent means unflagged.
  flagged?: boolean;
}

export type ProgressMap = Record<string, Progress>;

export interface Subject {
  id: string;
  label: string;
  icon: string;
  color: string;
  storageKey: string;
  loadData: () => Promise<{ default: Card[] }>;
}

export interface SessionFilters {
  topic?: string;
  difficulty?: string;
  type?: string;
  tag?: string;
}

export interface SessionStats {
  reviewed: number;
  correct: number;
}
