// Subject registry — the single point of extension for adding a new subject.
// A new subject = one entry here + one data file in ../data/. Nothing else changes.

export const subjects = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    icon: 'JS',
    color: '#f7df1e',
    storageKey: 'srs:javascript',
    loadData: () => import('../data/javascript.json'),
  },
  react: {
    id: 'react',
    label: 'React',
    icon: '⚛',
    color: '#61dafb',
    storageKey: 'srs:react',
    loadData: () => import('../data/react.json'),
  },
  node: {
    id: 'node',
    label: 'Node.js',
    icon: 'No',
    color: '#8cc84b',
    storageKey: 'srs:node',
    loadData: () => import('../data/node.json'),
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    icon: 'TS',
    color: '#3178c6',
    storageKey: 'srs:typescript',
    loadData: () => import('../data/typescript.json'),
  },
};

export function getSubject(id) {
  return subjects[id] ?? null;
}

export function listSubjects() {
  return Object.values(subjects);
}
