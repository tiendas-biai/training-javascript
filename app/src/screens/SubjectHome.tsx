import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Card, SessionFilters } from '../types';
import { applyFilters, buildQueue } from '../lib/session';
import { computeStats, getNextDueTime } from '../lib/srs';
import { useProgress } from '../hooks/useProgress';
import { useSubjectCtx } from './SubjectLayout';
import { Session } from './Session';
import { NothingDue } from './NothingDue';
import { formatNextDue } from './NothingDue';
import { AuthButtons } from '../auth/AuthButtons';

type Mode =
  | { name: 'start' }
  | { name: 'session'; filters: SessionFilters; size: number; queue: Card[]; practice: boolean };

const EMPTY_FILTERS: SessionFilters = { topic: '', difficulty: '', type: '', tag: '' };

export function SubjectHome() {
  const { subject, cards } = useSubjectCtx();
  const navigate = useNavigate();
  const { progressMap, update, reset, loading } = useProgress(subject);

  const [filters, setFilters] = useState<SessionFilters>(EMPTY_FILTERS);
  const [sessionSize, setSessionSize] = useState<number>(20);
  const [mode, setMode] = useState<Mode>({ name: 'start' });

  const topics = useMemo(() => [...new Set(cards.map(c => c.topic))].sort(), [cards]);
  const tags = useMemo(() => [...new Set(cards.flatMap(c => c.tags ?? []))].sort(), [cards]);

  if (cards.length === 0) {
    return (
      <div className="screen">
        <div className="nothing-due">
          <div className="nothing-due-icon">📭</div>
          <h2>{subject.label}</h2>
          <p>No cards yet — this subject's question bank is empty.</p>
          <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => navigate('/')}>
            ← Subjects
          </button>
        </div>
      </div>
    );
  }

  // Authenticated users load progress from the cloud; show a brief loading state
  // so stats/session don't flash with empty progress. Anonymous load is synchronous.
  if (loading) {
    return (
      <div className="screen">
        <div className="auth-bar"><AuthButtons /></div>
        <header className="app-header">
          <button className="exit-btn subjects-back" onClick={() => navigate('/')}>← Subjects</button>
          <h1 className="app-title">{subject.label}</h1>
          <p className="app-subtitle">Loading your progress…</p>
        </header>
      </div>
    );
  }

  function startSession(f: SessionFilters, size: number, practice = false) {
    const queue = buildQueue(cards, progressMap, f, size, practice);
    setMode({ name: 'session', filters: f, size, queue, practice });
  }

  if (mode.name === 'session') {
    if (mode.queue.length === 0) {
      const filtered = applyFilters(cards, mode.filters);
      const stats = computeStats(filtered, progressMap);
      return (
        <NothingDue
          nextDueTs={getNextDueTime(progressMap)}
          mastered={stats.mastered}
          total={stats.total}
          onHome={() => setMode({ name: 'start' })}
        />
      );
    }
    return (
      <Session
        initialQueue={mode.queue}
        progressMap={progressMap}
        // Practice (cram) sessions must not touch the SRS schedule, so swallow grades.
        onProgress={mode.practice ? () => {} : update}
        onRestart={() => startSession(mode.filters, mode.size, mode.practice)}
        onExit={() => setMode({ name: 'start' })}
      />
    );
  }

  // ── Start screen ──
  const filtered = applyFilters(cards, filters);
  const stats = computeStats(filtered, progressMap);
  const hasDue = stats.dueToday > 0;

  let startLabel: string;
  let startDisabled: boolean;
  if (filtered.length === 0) {
    startLabel = 'No cards match filters';
    startDisabled = true;
  } else if (!hasDue) {
    startLabel = 'Nothing due today';
    startDisabled = true;
  } else {
    startLabel = 'Start Session';
    startDisabled = false;
  }

  const nextDueTsFiltered = !hasDue && filtered.length > 0
    ? filtered.map(c => {
        const s = progressMap[c.id];
        return s && 'nextDue' in s ? (s.nextDue ?? 0) : 0;
      }).filter(t => t > Date.now()).sort((a, b) => a - b)[0] ?? null
    : null;

  const effectiveSize = sessionSize === Infinity
    ? Math.min(stats.dueToday, filtered.length)
    : Math.min(sessionSize, stats.dueToday);

  const practiceSize = sessionSize === Infinity
    ? filtered.length
    : Math.min(sessionSize, filtered.length);

  const setFilter = (key: keyof SessionFilters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFilters(prev => ({ ...prev, [key]: e.target.value }));

  function handleReset() {
    if (confirm(`Reset all ${subject.label} progress? This cannot be undone.`)) reset();
  }

  return (
    <div className="screen">
      <div className="auth-bar"><AuthButtons /></div>
      <header className="app-header">
        <button className="exit-btn subjects-back" onClick={() => navigate('/')}>← Subjects</button>
        <h1 className="app-title">{subject.label}</h1>
        <p className="app-subtitle">Spaced repetition drill</p>
      </header>

      <div className="stat-tiles">
        {([
          ['attempted', `${stats.attempted}/${stats.total}`, 'Attempted'],
          ['learning', String(stats.inLearning), 'Learning'],
          ['mastered', String(stats.mastered), 'Mastered'],
          ['due', String(stats.dueToday), 'Due Today'],
        ] as const).map(([filter, val, label]) => (
          <div
            key={filter}
            className="stat-tile stat-tile-link"
            onClick={() => navigate(`/${subject.id}/card-library?filter=${filter}`)}
          >
            <span className="stat-val">{val}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="filters">
        <select className="filter-select" value={filters.topic} onChange={setFilter('topic')}>
          <option value="">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={filters.difficulty} onChange={setFilter('difficulty')}>
          <option value="">All Difficulties</option>
          {['easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" value={filters.type} onChange={setFilter('type')}>
          <option value="">All Types</option>
          <option value="reveal">Reveal</option>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="multiple-response">Multiple Response</option>
        </select>
        <select className="filter-select" value={filters.tag} onChange={setFilter('tag')}>
          <option value="">All Tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <p className="size-label">Session size</p>
      <div className="size-toggle">
        {([[10, '10'], [20, '20'], [Infinity, `All (${stats.dueToday})`]] as const).map(([size, label]) => (
          <button
            key={label}
            className={`size-btn ${sessionSize === size ? 'active' : ''}`}
            onClick={() => setSessionSize(size)}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        disabled={startDisabled}
        onClick={() => startSession(filters, sessionSize)}
      >
        {startLabel}{!startDisabled ? ` · ${effectiveSize} cards` : ''}
      </button>
      {nextDueTsFiltered != null && (
        <p className="next-due-hint">Next review {formatNextDue(nextDueTsFiltered)}</p>
      )}

      {filtered.length > 0 && (
        <button
          className="btn-secondary"
          onClick={() => startSession(filters, sessionSize, true)}
        >
          Practice {practiceSize} cards · won't affect schedule
        </button>
      )}

      <button className="btn-reset" onClick={handleReset}>Reset all progress</button>
    </div>
  );
}
