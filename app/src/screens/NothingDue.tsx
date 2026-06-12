export function formatNextDue(ts: number): string {
  const diff = ts - Date.now();
  if (diff <= 0) return 'now';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h < 24) return `in ${h}h ${m}m`;
  return `on ${new Date(ts).toLocaleDateString()}`;
}

export function NothingDue({ nextDueTs, mastered, total, onHome }: {
  nextDueTs: number | null;
  mastered: number;
  total: number;
  onHome: () => void;
}) {
  return (
    <div className="screen">
      <div className="nothing-due">
        <div className="nothing-due-icon">🎉</div>
        <h2>All caught up!</h2>
        <p>Nothing to review right now.</p>
        {nextDueTs && (
          <p className="next-due">Next review <strong>{formatNextDue(nextDueTs)}</strong></p>
        )}
        <p style={{ marginTop: 12, color: 'var(--muted)' }}>{mastered} / {total} cards mastered</p>
        <button className="btn-primary" style={{ marginTop: 32 }} onClick={onHome}>Back to Home</button>
      </div>
    </div>
  );
}
