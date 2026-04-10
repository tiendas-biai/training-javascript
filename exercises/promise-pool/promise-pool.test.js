const { promisePool } = require('./promise-pool');

describe('promisePool', () => {
  test('returns all results in order', async () => {
    const tasks = [
      () => Promise.resolve('a'),
      () => Promise.resolve('b'),
      () => Promise.resolve('c'),
    ];

    const results = await promisePool(tasks, 2);
    expect(results).toEqual(['a', 'b', 'c']);
  });

  test('respects concurrency limit', async () => {
    let running = 0;
    let maxRunning = 0;

    const makeTask = (value, delay) => () =>
      new Promise(resolve => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        setTimeout(() => {
          running--;
          resolve(value);
        }, delay);
      });

    const tasks = [
      makeTask(1, 50),
      makeTask(2, 30),
      makeTask(3, 40),
      makeTask(4, 20),
      makeTask(5, 10),
    ];

    const results = await promisePool(tasks, 2);
    expect(maxRunning).toBeLessThanOrEqual(2);
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  test('handles concurrency greater than task count', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.resolve(2),
    ];

    const results = await promisePool(tasks, 10);
    expect(results).toEqual([1, 2]);
  });

  test('rejects immediately if any task fails', async () => {
    const tasks = [
      () => Promise.resolve(1),
      () => Promise.reject(new Error('fail')),
      () => Promise.resolve(3),
    ];

    await expect(promisePool(tasks, 2)).rejects.toThrow('fail');
  });

  test('handles empty task array', async () => {
    const results = await promisePool([], 3);
    expect(results).toEqual([]);
  });

  test('runs tasks sequentially when concurrency is 1', async () => {
    const order = [];

    const makeTask = (value, delay) => () =>
      new Promise(resolve => {
        order.push(`start:${value}`);
        setTimeout(() => {
          order.push(`end:${value}`);
          resolve(value);
        }, delay);
      });

    const tasks = [
      makeTask('a', 20),
      makeTask('b', 10),
      makeTask('c', 10),
    ];

    const results = await promisePool(tasks, 1);
    expect(results).toEqual(['a', 'b', 'c']);
    expect(order).toEqual([
      'start:a', 'end:a',
      'start:b', 'end:b',
      'start:c', 'end:c',
    ]);
  });
});
