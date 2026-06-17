import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subject } from '../types';
import { listSubjects } from '../lib/subjects';
import { loadProgress } from '../lib/storage';
import { computeStats } from '../lib/srs';
import { AuthButtons } from '../auth/AuthButtons';

interface Tile {
  subject: Subject;
  total: number;
  dueToday: number;
}

export function SubjectPicker() {
  const navigate = useNavigate();
  const [tiles, setTiles] = useState<Tile[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(
      listSubjects().map(async subject => {
        const cards = (await subject.loadData()).default;
        const stats = computeStats(cards, loadProgress(subject.storageKey));
        return { subject, total: cards.length, dueToday: stats.dueToday };
      }),
    ).then(result => { if (alive) setTiles(result); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="screen">
      <div className="auth-bar"><AuthButtons /></div>
      <header className="app-header">
        <h1 className="app-title">Dev Drill</h1>
        <p className="app-subtitle">Pick a subject to study</p>
      </header>
      <div className="subject-tiles">
        {(tiles ?? []).map(({ subject, total, dueToday }) => (
          <button
            key={subject.id}
            className="subject-tile"
            style={{ '--subject-color': subject.color } as React.CSSProperties}
            onClick={() => navigate(`/${subject.id}`)}
          >
            <span className="subject-icon">{subject.icon}</span>
            <span className="subject-label">{subject.label}</span>
            <span className="subject-counts">
              {total === 0 ? 'No cards yet' : `${total} cards · ${dueToday} due`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
