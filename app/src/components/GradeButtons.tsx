import type { Rating } from '../types';

const LABELS: Record<Rating, string> = { hard: 'Hard', good: 'Good', easy: 'Easy' };

export function GradeButtons({
  previews,
  onGrade,
}: {
  previews: Record<Rating, string>;
  onGrade: (rating: Rating) => void;
}) {
  return (
    <div className="grade-buttons">
      {(['hard', 'good', 'easy'] as const).map(rating => (
        <button key={rating} className={`btn-${rating}`} onClick={() => onGrade(rating)}>
          {LABELS[rating]} <span className="interval-label">{previews[rating]}</span>
        </button>
      ))}
    </div>
  );
}
