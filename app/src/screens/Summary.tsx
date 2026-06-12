import type { SessionStats } from '../types';

export function Summary({ stats, onAgain, onHome }: {
  stats: SessionStats;
  onAgain: () => void;
  onHome: () => void;
}) {
  const { reviewed, correct } = stats;
  const pct = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;
  const icon = pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪';

  return (
    <div className="screen">
      <div className="summary">
        <div className="summary-icon">{icon}</div>
        <h2 className="summary-title">Session complete!</h2>
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="summary-stat-val">{reviewed}</span>
            <span className="summary-stat-label">Reviewed</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-val">{correct}</span>
            <span className="summary-stat-label">Good/Easy</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat-val">{pct}%</span>
            <span className="summary-stat-label">Accuracy</span>
          </div>
        </div>
        <button className="btn-primary" onClick={onAgain}>Study Again</button>
        <button className="btn-secondary" onClick={onHome}>Back to Home</button>
      </div>
    </div>
  );
}
