import type { Card } from '../types';
import { makeApiClient } from './apiClient';

// CRUD client for the cards API. GET is public; create/update/remove require an
// admin token (the bearer is attached by makeApiClient). The admin editor reads
// the live list here so edits are reflected immediately, regardless of whether
// the app otherwise loads bundled JSON.
export function makeCardsApi(getToken: () => Promise<string>) {
  const api = makeApiClient(getToken);
  return {
    list: (subject: string) => api<Card[]>(`/cards/${subject}`),
    create: (subject: string, card: Card) =>
      api<Card>(`/cards/${subject}`, { method: 'POST', body: JSON.stringify(card) }),
    update: (subject: string, id: string, card: Card) =>
      api<Card>(`/cards/${subject}/${id}`, { method: 'PUT', body: JSON.stringify(card) }),
    remove: (subject: string, id: string) =>
      api<void>(`/cards/${subject}/${id}`, { method: 'DELETE' }),
  };
}

export type CardsApi = ReturnType<typeof makeCardsApi>;
