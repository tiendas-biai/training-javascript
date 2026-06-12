export function SessionHeader({ remaining, done = 0, onExit }: {
  remaining: number;
  done?: number;
  onExit: () => void;
}) {
  // "left" counts queue entries, including learning cards that cycle back —
  // "done" gives visible progress even when the queue length doesn't shrink.
  return (
    <div className="session-header">
      <button className="exit-btn" onClick={onExit}>← Exit</button>
      <span className="progress-label">{done} done · {remaining} left</span>
    </div>
  );
}
