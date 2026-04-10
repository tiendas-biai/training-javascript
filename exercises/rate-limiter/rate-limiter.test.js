const { rateLimitedExecute } = require('./rate-limiter');

describe('rateLimitedExecute', () => {
    test('runs all tasks and returns results in order', async () => {
        const tasks = [
            () => Promise.resolve(1),
            () => Promise.resolve(2),
            () => Promise.resolve(3),
        ];
        const results = await rateLimitedExecute(tasks, 2, 100);
        expect(results).toEqual([1, 2, 3]);
    });

    test('respects rate limit — does not start more than maxPerWindow in a window', async () => {
        const startTimes = [];
        const baseTime = Date.now();

        const makeTask = (id) => () => {
            startTimes.push({ id, time: Date.now() - baseTime });
            return Promise.resolve(id);
        };

        const tasks = [
            makeTask(0), makeTask(1), makeTask(2),
            makeTask(3), makeTask(4),
        ];

        await rateLimitedExecute(tasks, 2, 200);

        // First 2 should start near t=0
        expect(startTimes[0].time).toBeLessThan(50);
        expect(startTimes[1].time).toBeLessThan(50);

        // Next 2 should start near t=200 (after the window)
        expect(startTimes[2].time).toBeGreaterThanOrEqual(150);
        expect(startTimes[3].time).toBeGreaterThanOrEqual(150);

        // Last one should start near t=400
        expect(startTimes[4].time).toBeGreaterThanOrEqual(350);
    });

    test('tasks can overlap — rate limits starts, not active count', async () => {
        let running = 0;
        let maxRunning = 0;

        const makeTask = (delay) => () =>
            new Promise(resolve => {
                running++;
                maxRunning = Math.max(maxRunning, running);
                setTimeout(() => {
                    running--;
                    resolve();
                }, delay);
            });

        // 2 slow tasks per window — they'll still be running when next window starts
        const tasks = [
            makeTask(300), makeTask(300),
            makeTask(50), makeTask(50),
        ];

        await rateLimitedExecute(tasks, 2, 100);

        // Tasks from window 1 (300ms) overlap with tasks from window 2
        // So more than 2 can be running at the same time
        expect(maxRunning).toBeGreaterThan(2);
    });

    test('handles maxPerWindow larger than tasks array', async () => {
        const tasks = [
            () => Promise.resolve('a'),
            () => Promise.resolve('b'),
        ];
        const results = await rateLimitedExecute(tasks, 10, 100);
        expect(results).toEqual(['a', 'b']);
    });

    test('handles maxPerWindow of 1 (one task per window)', async () => {
        const startTimes = [];
        const baseTime = Date.now();

        const makeTask = (id) => () => {
            startTimes.push(Date.now() - baseTime);
            return Promise.resolve(id);
        };

        const tasks = [makeTask(0), makeTask(1), makeTask(2)];
        const results = await rateLimitedExecute(tasks, 1, 100);

        expect(results).toEqual([0, 1, 2]);
        // Each task starts in a new window
        expect(startTimes[1]).toBeGreaterThanOrEqual(80);
        expect(startTimes[2]).toBeGreaterThanOrEqual(180);
    });

    test('returns empty array for empty tasks', async () => {
        const results = await rateLimitedExecute([], 3, 100);
        expect(results).toEqual([]);
    });

    test('rejects if any task fails', async () => {
        const tasks = [
            () => Promise.resolve(1),
            () => Promise.reject(new Error('rate limit fail')),
            () => Promise.resolve(3),
        ];

        await expect(rateLimitedExecute(tasks, 3, 100)).rejects.toThrow('rate limit fail');
    });

    test('preserves result order regardless of resolve times', async () => {
        const tasks = [
            () => new Promise(resolve => setTimeout(() => resolve('slow'), 150)),
            () => new Promise(resolve => setTimeout(() => resolve('fast'), 10)),
        ];

        const results = await rateLimitedExecute(tasks, 2, 100);
        expect(results).toEqual(['slow', 'fast']);
    });
});
