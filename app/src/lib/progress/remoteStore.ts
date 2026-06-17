import type { Progress } from '../../types';
import type { StoredProgressMap } from '../srs';
import type { ApiClient } from '../apiClient';
import type { ProgressStore } from './types';

// Authenticated path — talks to the progress API (backend/progress). The API
// keys everything by the verified Auth0 sub server-side, so we only ever send
// the subject/cardId. Shape returned by GET matches StoredProgressMap 1:1.
export class RemoteProgressStore implements ProgressStore {
  constructor(private readonly subjectId: string, private readonly api: ApiClient) {}

  load(): Promise<StoredProgressMap> {
    return this.api<StoredProgressMap>(`/progress/${this.subjectId}`);
  }

  async save(id: string, progress: Progress): Promise<void> {
    await this.api<void>(`/progress/${this.subjectId}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  }

  async reset(): Promise<void> {
    await this.api<void>(`/progress/${this.subjectId}`, { method: 'DELETE' });
  }
}
