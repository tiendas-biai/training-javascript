import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { getOrCreate } from '../lib/srs';
import { getCardType } from '../lib/session';
import { useProgress } from '../hooks/useProgress';
import { useDeepDives } from '../hooks/useDeepDives';
import { useSubjectCtx } from './SubjectLayout';
import { RichText } from '../components/RichText';
import { DeepDive } from '../components/DeepDive';
import { DiffBadge, typeLabel } from '../components/badges';
import { formatNextDue } from './NothingDue';

export function CardDetail() {
  const { subject, cards } = useSubjectCtx();
  const { id } = useParams();
  const navigate = useNavigate();
  const { progressMap, setFlag } = useProgress(subject);
  const deepDives = useDeepDives(subject);

  const card = cards.find(c => c.id === id);
  if (!card) return <Navigate to={`/${subject.id}/card-library`} replace />;

  // API path puts the deep dive on the card; bundled path looks it up by id.
  const deepDive = card.deepDive ?? deepDives?.[card.id];
  const s = getOrCreate(card.id, progressMap);
  const type = getCardType(card);
  const answerSet = new Set(
    type === 'multiple-response' && 'answers' in card ? card.answers
    : type === 'multiple-choice' && 'answer' in card ? [card.answer]
    : [],
  );

  return (
    <div className="screen">
      <div className="lib-header">
        <button className="exit-btn" onClick={() => navigate(-1)}>← Back</button>
        <span className="lib-title">Card Detail</span>
      </div>

      <div className="card">
        <div className="card-meta">
          <span className="badge">{card.topic}</span>
          {card.subtopic && <span className="badge">{card.subtopic}</span>}
          <DiffBadge difficulty={card.difficulty} />
          <span className="badge">{typeLabel(card)}</span>
          {(card.tags ?? []).map(t => <span key={t} className="badge">{t}</span>)}
        </div>
        <div className="question-text"><RichText text={card.question} /></div>

        {type === 'reveal' ? (
          <div className="answer-section">
            <p className="answer-label">Answer</p>
            <div className="answer-text">{'answer' in card && <RichText text={card.answer} />}</div>
            <div className="explanation-text"><RichText text={card.explanation} /></div>
          </div>
        ) : (
          <>
            <ul className="detail-options">
              {'options' in card && card.options.map(opt => (
                <li key={opt}>
                  <span className={`detail-option${answerSet.has(opt) ? ' correct' : ''}`}>{opt}</span>
                </li>
              ))}
            </ul>
            <div className="answer-section">
              <p className="answer-label">Explanation</p>
              <div className="explanation-text"><RichText text={card.explanation} /></div>
            </div>
          </>
        )}
      </div>

      <div className="detail-progress-card">
        <div className="detail-progress-head">
          <p className="detail-section-label">Progress</p>
          <button
            type="button"
            className={`flag-toggle${s.flagged ? ' active' : ''}`}
            aria-pressed={s.flagged ? true : false}
            onClick={() => setFlag(card.id, !s.flagged)}
          >
            🚩 {s.flagged ? 'Flagged · click to unflag' : 'Flag to study later'}
          </button>
        </div>
        {s.totalSeen === 0 ? (
          <div className="detail-progress-row">
            <span className="badge badge-lib-new">New</span>
            <span className="detail-progress-info">Never studied</span>
          </div>
        ) : s.phase === 'learning' ? (
          <div className="detail-progress-row">
            <span className="badge badge-learning">Learning</span>
            <span className="detail-progress-info">
              Seen {s.totalSeen} time{s.totalSeen !== 1 ? 's' : ''} · in learning phase
            </span>
          </div>
        ) : (
          <>
            <div className="detail-progress-row">
              {s.interval >= 7
                ? <span className="badge badge-lib-mastered">Mastered</span>
                : <span className="badge badge-review">Review</span>}
              <span className="detail-progress-info">
                Interval: {s.interval}d · Ease: {s.ease.toFixed(2)} · Next: {s.nextDue > Date.now() ? formatNextDue(s.nextDue) : 'due now'}
              </span>
            </div>
            <div className="detail-progress-row" style={{ marginTop: 8 }}>
              <span className="detail-progress-info">
                Last reviewed: {s.lastReviewed ? new Date(s.lastReviewed).toLocaleDateString() : 'never'} · Seen {s.totalSeen} times
              </span>
            </div>
          </>
        )}
        <p className="q-id" style={{ marginTop: 10 }}>{card.id}</p>
      </div>

      {deepDive && <DeepDive data={deepDive} />}
    </div>
  );
}
