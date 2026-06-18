import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Card } from '../types';
import { getOrCreate } from '../lib/srs';
import type { StoredProgressMap } from '../lib/srs';
import { useProgress } from '../hooks/useProgress';
import { useSubjectCtx } from './SubjectLayout';
import { plainText } from '../components/RichText';
import { DiffBadge } from '../components/badges';

type Status = 'new' | 'learning' | 'review' | 'mastered';

function getStatus(card: Card, progressMap: StoredProgressMap): Status {
  const s = getOrCreate(card.id, progressMap);
  if (s.totalSeen === 0) return 'new';
  if (s.phase === 'learning') return 'learning';
  if (s.interval >= 7) return 'mastered';
  return 'review';
}

function StatusBadge({ card, progressMap }: { card: Card; progressMap: StoredProgressMap }) {
  const status = getStatus(card, progressMap);
  const s = getOrCreate(card.id, progressMap);
  if (status === 'new') return <span className="badge badge-lib-new">New</span>;
  if (status === 'learning') return <span className="badge badge-learning">Learning</span>;
  if (status === 'mastered') return <span className="badge badge-lib-mastered">Mastered</span>;
  return <span className="badge badge-review">Review · {s.interval}d</span>;
}

export function CardLibrary() {
  const { subject, cards } = useSubjectCtx();
  const navigate = useNavigate();
  const { progressMap, setFlag } = useProgress(subject);
  const [params, setParams] = useSearchParams();

  const statusFilter = params.get('filter') ?? 'all';
  const attemptedFilter = params.get('attempted') ?? 'all';
  const topicFilter = params.get('topic') ?? '';
  const search = params.get('q') ?? '';

  const topics = useMemo(() => [...new Set(cards.map(c => c.topic))].sort(), [cards]);
  const now = Date.now();
  const isDue = (card: Card) => getOrCreate(card.id, progressMap).nextDue <= now;

  // Chip counts are global reference totals — unaffected by the other filters.
  const counts = useMemo(() => ({
    all: cards.length,
    new: cards.filter(c => getStatus(c, progressMap) === 'new').length,
    learning: cards.filter(c => getStatus(c, progressMap) === 'learning').length,
    due: cards.filter(isDue).length,
    mastered: cards.filter(c => getStatus(c, progressMap) === 'mastered').length,
    flagged: cards.filter(c => getOrCreate(c.id, progressMap).flagged).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [cards, progressMap]);

  function setParam(key: string, value: string, defaultValue = '') {
    const next = new URLSearchParams(params);
    if (value === defaultValue || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const filtered = cards.filter(card => {
    const s = getOrCreate(card.id, progressMap);
    const status = getStatus(card, progressMap);
    if (statusFilter === 'new' && status !== 'new') return false;
    if (statusFilter === 'learning' && status !== 'learning') return false;
    if (statusFilter === 'mastered' && status !== 'mastered') return false;
    if (statusFilter === 'due' && !isDue(card)) return false;
    if (statusFilter === 'flagged' && !s.flagged) return false;
    if (attemptedFilter === 'attempted' && s.lastReviewed == null) return false;
    if (attemptedFilter === 'not-attempted' && s.lastReviewed != null) return false;
    if (topicFilter && card.topic !== topicFilter) return false;
    if (search && !card.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const chips = [
    ['all', `All (${counts.all})`],
    ['new', `New (${counts.new})`],
    ['learning', `Learning (${counts.learning})`],
    ['due', `Due (${counts.due})`],
    ['mastered', `Mastered (${counts.mastered})`],
    ['flagged', `🚩 Flagged (${counts.flagged})`],
  ] as const;

  return (
    <div className="screen">
      <div className="lib-header">
        <button className="exit-btn" onClick={() => navigate(`/${subject.id}`)}>← Back</button>
        <span className="lib-title">Card Library</span>
        <span className="lib-count">{filtered.length} cards</span>
      </div>

      <div className="lib-filters">
        <div className="lib-chips">
          {chips.map(([val, label]) => (
            <button
              key={val}
              className={`chip${statusFilter === val ? ' active' : ''}`}
              onClick={() => setParam('filter', val)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="lib-controls">
          <input
            className="search-box"
            type="text"
            placeholder="Search questions…"
            value={search}
            onChange={e => setParam('q', e.target.value)}
          />
          <select className="filter-select" value={topicFilter} onChange={e => setParam('topic', e.target.value)}>
            <option value="">All Topics</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={attemptedFilter} onChange={e => setParam('attempted', e.target.value)}>
            <option value="all">All</option>
            <option value="attempted">Attempted</option>
            <option value="not-attempted">Not attempted</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="lib-empty">No cards match the current filters.</p>
      ) : (
        <div className="lib-table-wrap">
          <table className="lib-table">
            <thead>
              <tr>
                <th className="col-q">Question</th>
                <th className="col-topic">Topic</th>
                <th className="col-diff">Difficulty</th>
                <th className="col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(card => {
                const raw = plainText(card.question);
                const q = raw.length > 80 ? raw.slice(0, 80) + '…' : raw;
                const flagged = getOrCreate(card.id, progressMap).flagged ?? false;
                return (
                  <tr key={card.id}>
                    <td className="col-q">
                      <button className="q-link" onClick={() => navigate(`/${subject.id}/card/${card.id}`)}>
                        <span className="q-text">{q}</span>
                        <span className="q-id">{card.id}</span>
                      </button>
                    </td>
                    <td className="col-topic"><span className="badge">{card.topic}</span></td>
                    <td className="col-diff"><DiffBadge difficulty={card.difficulty} /></td>
                    <td className="col-status">
                      <button
                        type="button"
                        className={`flag-btn flag-btn-sm${flagged ? ' active' : ''}`}
                        aria-pressed={flagged ? true : false}
                        title={flagged ? 'Unflag this card' : 'Flag this card to study later'}
                        onClick={() => setFlag(card.id, !flagged)}
                      >
                        🚩
                      </button>
                      <StatusBadge card={card} progressMap={progressMap} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
