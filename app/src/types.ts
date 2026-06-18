// Shared domain types for the Dev Drill app.

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Rating = 'hard' | 'good' | 'easy';
export type CardType = 'reveal' | 'multiple-choice' | 'multiple-response';

// A teaching-grade write-up for a card, authored offline (see documents/prompts/)
// and stored separately from the bank — either in app/data/deepdives/<subject>.json
// (bundled path) or as a `deepDive` attribute on the card item (cards API path).
export interface DeepDiveResource {
  label: string;
  url: string;
}

export interface DeepDive {
  // Markdown (rendered via RichText): problem → why → why the solution works → mistakes.
  explanation: string;
  // A single fenced code block, e.g. ```tsx … ```. Optional (AWS cards may omit it).
  example?: string;
  resources?: DeepDiveResource[];
}

// id → DeepDive, the shape of each app/data/deepdives/<subject>.json file.
export type DeepDiveMap = Record<string, DeepDive>;

interface BaseCard {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question: string;
  explanation: string;
  tags: string[];
  // Optional deep dive. Never written into the bank data/*.json files; present only
  // on cards served by the cards API (where it rides along on the item).
  deepDive?: DeepDive;
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
