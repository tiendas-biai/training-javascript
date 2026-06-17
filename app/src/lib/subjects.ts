// Subject registry — the single point of extension for adding a new subject.
// A new subject = one entry here + one data file in ../../data/. Nothing else changes.
import type { Card, Subject } from '../types';
import { authConfig, cardsFromApi } from '../auth/authEnv';

// JSON modules infer literal types (e.g. difficulty: string); cast through the
// loader so data files stay the single source of truth without per-file types.
const load = (p: Promise<unknown>) => p as Promise<{ default: Card[] }>;

// When VITE_CARDS_FROM_API is enabled, fetch a subject's bank from the cards API
// (public, no auth) and fall back to the bundled JSON if the API is unavailable.
// Default behavior (flag off) is the bundled import, unchanged.
function loader(id: string, bundled: () => Promise<{ default: Card[] }>) {
  return async (): Promise<{ default: Card[] }> => {
    if (cardsFromApi) {
      try {
        const res = await fetch(`${authConfig.apiUrl}/cards/${id}`);
        if (res.ok) {
          const cards = (await res.json()) as Card[];
          if (Array.isArray(cards) && cards.length > 0) return { default: cards };
        }
      } catch {
        // fall through to the bundled bank
      }
    }
    return bundled();
  };
}

export const subjects: Record<string, Subject> = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    icon: 'JS',
    color: '#f7df1e',
    storageKey: 'srs:javascript',
    loadData: loader('javascript', () => load(import('../../data/javascript.json'))),
  },
  react: {
    id: 'react',
    label: 'React',
    icon: '⚛',
    color: '#61dafb',
    storageKey: 'srs:react',
    loadData: loader('react', () => load(import('../../data/react.json'))),
  },
  node: {
    id: 'node',
    label: 'Node.js',
    icon: 'No',
    color: '#8cc84b',
    storageKey: 'srs:node',
    loadData: loader('node', () => load(import('../../data/node.json'))),
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    icon: 'TS',
    color: '#3178c6',
    storageKey: 'srs:typescript',
    loadData: loader('typescript', () => load(import('../../data/typescript.json'))),
  },
  aws: {
    id: 'aws',
    label: 'AWS SAA',
    icon: '☁',
    color: '#ff9900',
    storageKey: 'srs:aws',
    loadData: loader('aws', () => load(import('../../data/aws.json'))),
  },
};

export function getSubject(id: string | undefined): Subject | null {
  return (id && subjects[id]) || null;
}

export function listSubjects(): Subject[] {
  return Object.values(subjects);
}
