export function SessionHeader({ remaining, onExit }: { remaining: number; onExit: () => void }) {
  return (
    <div className="session-header">
      <button className="exit-btn" onClick={onExit}>← Exit</button>
      <span className="progress-label">{remaining} left</span>
    </div>
  );
}
