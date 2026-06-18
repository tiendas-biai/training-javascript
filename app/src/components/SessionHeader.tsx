export function SessionHeader({ remaining, done = 0, onExit, flagged, onToggleFlag }: {
  remaining: number;
  done?: number;
  onExit: () => void;
  flagged?: boolean;
  onToggleFlag?: () => void;
}) {
  // "left" counts queue entries, including learning cards that cycle back —
  // "done" gives visible progress even when the queue length doesn't shrink.
  return (
    <div className="session-header">
      <button className="exit-btn" onClick={onExit}>← Exit</button>
      {onToggleFlag && (
        <button
          type="button"
          className={`flag-btn${flagged ? ' active' : ''}`}
          aria-pressed={flagged ? true : false}
          title={flagged ? 'Unflag this card' : 'Flag this card to study later'}
          onClick={onToggleFlag}
        >
          🚩
        </button>
      )}
      <span className="progress-label">{done} done · {remaining} left</span>
    </div>
  );
}
