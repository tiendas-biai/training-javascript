import { RemoteProgressStore } from './remoteStore';
import type { ApiClient } from '../apiClient';
import type { Progress } from '../../types';

const progress: Progress = {
  id: 'c1', phase: 'review', interval: 5, ease: 2.5, nextDue: 0, lastReviewed: null, totalSeen: 1,
};

describe('RemoteProgressStore', () => {
  test('load GETs /progress/{subject} and returns the map', async () => {
    const api = jest.fn(async () => ({ c1: progress })) as unknown as ApiClient;
    const store = new RemoteProgressStore('react', api);
    expect(await store.load()).toEqual({ c1: progress });
    expect(api).toHaveBeenCalledWith('/progress/react');
  });

  test('save PUTs the progress to /progress/{subject}/{cardId}', async () => {
    const api = jest.fn(async () => undefined) as unknown as ApiClient;
    await new RemoteProgressStore('react', api).save('c1', progress);
    expect(api).toHaveBeenCalledWith('/progress/react/c1', {
      method: 'PUT',
      body: JSON.stringify(progress),
    });
  });

  test('reset DELETEs /progress/{subject}', async () => {
    const api = jest.fn(async () => undefined) as unknown as ApiClient;
    await new RemoteProgressStore('react', api).reset();
    expect(api).toHaveBeenCalledWith('/progress/react', { method: 'DELETE' });
  });
});
