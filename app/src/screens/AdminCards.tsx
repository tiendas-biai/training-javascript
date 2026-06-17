import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import type { Card } from '../types';
import { makeCardsApi } from '../lib/cardsApi';
import { plainText } from '../components/RichText';
import { typeLabel, DiffBadge } from '../components/badges';
import { useSubjectCtx } from './SubjectLayout';
import { AdminCardForm } from './AdminCardForm';

export function AdminCards() {
  const { subject } = useSubjectCtx();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const api = useMemo(() => makeCardsApi(getAccessTokenSilently), [getAccessTokenSilently]);

  const [cards, setCards] = useState<Card[] | null>(null);
  const [editing, setEditing] = useState<Card | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    setCards(null);
    setError(null);
    api.list(subject.id).then(setCards).catch(e => setError(`Failed to load cards: ${e}`));
  }, [api, subject.id]);

  useEffect(() => { reload(); }, [reload]);

  async function handleSave(card: Card) {
    setBusy(true);
    setError(null);
    try {
      if (editing === 'new') await api.create(subject.id, card);
      else await api.update(subject.id, card.id, card);
      setEditing(null);
      reload();
    } catch (e) {
      setError(`Save failed: ${e}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(card: Card) {
    if (!confirm(`Delete card "${card.id}"? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    try {
      await api.remove(subject.id, card.id);
      reload();
    } catch (e) {
      setError(`Delete failed: ${e}`);
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <AdminCardForm
        initial={editing === 'new' ? null : editing}
        existingIds={(cards ?? []).map(c => c.id)}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="screen">
      <div className="lib-header">
        <button className="exit-btn" onClick={() => navigate(`/${subject.id}`)}>← {subject.label}</button>
        <span className="lib-title">Manage cards</span>
        <button className="btn-primary admin-new" onClick={() => setEditing('new')}>+ New card</button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {cards === null ? (
        <p className="admin-muted">Loading cards…</p>
      ) : cards.length === 0 ? (
        <p className="admin-muted">No cards in this subject's table yet.</p>
      ) : (
        <>
          <p className="admin-muted">{cards.length} cards (live from the API)</p>
          <table className="lib-table">
            <thead>
              <tr><th>Question</th><th>Type</th><th>Difficulty</th><th></th></tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id}>
                  <td>
                    <div className="lib-q">{plainText(card.question)}</div>
                    <div className="q-id">{card.id}</div>
                  </td>
                  <td>{typeLabel(card)}</td>
                  <td><DiffBadge difficulty={card.difficulty} /></td>
                  <td className="admin-actions">
                    <button className="btn-secondary" disabled={busy} onClick={() => setEditing(card)}>Edit</button>
                    <button className="btn-reset" disabled={busy} onClick={() => handleDelete(card)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
