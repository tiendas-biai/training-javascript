// Subject registry — the single point of extension for adding a new subject.
// A new subject = one entry here + one data file in ../../data/. Nothing else changes.
import type { Card, Subject } from '../types';

// JSON modules infer literal types (e.g. difficulty: string); cast through the
// loader so data files stay the single source of truth without per-file types.
const load = (p: Promise<unknown>) => p as Promise<{ default: Card[] }>;

export const subjects: Record<string, Subject> = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    icon: 'JS',
    color: '#f7df1e',
    storageKey: 'srs:javascript',
    loadData: () => load(import('../../data/javascript.json')),
  },
  react: {
    id: 'react',
    label: 'React',
    icon: '⚛',
    color: '#61dafb',
    storageKey: 'srs:react',
    loadData: () => load(import('../../data/react.json')),
  },
  node: {
    id: 'node',
    label: 'Node.js',
    icon: 'No',
    color: '#8cc84b',
    storageKey: 'srs:node',
    loadData: () => load(import('../../data/node.json')),
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    icon: 'TS',
    color: '#3178c6',
    storageKey: 'srs:typescript',
    loadData: () => load(import('../../data/typescript.json')),
  },
  aws: {
    id: 'aws',
    label: 'AWS SAA',
    icon: '☁',
    color: '#ff9900',
    storageKey: 'srs:aws',
    loadData: () => load(import('../../data/aws.json')),
  },
};

export function getSubject(id: string | undefined): Subject | null {
  return (id && subjects[id]) || null;
}

export function listSubjects(): Subject[] {
  return Object.values(subjects);
}
