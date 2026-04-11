const { AsyncQueue } = require('./async-queue');

describe('AsyncQueue', () => {
    test('runs a single task and returns its result', async () => {
        const queue = new AsyncQueue(2);
        const result = await queue.enqueue(() => Promise.resolve('hello'));
        expect(result).toBe('hello');
    });

    test('runs tasks concurrently up to the limit', async () => {
        const queue = new AsyncQueue(2);
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

        const p1 = queue.enqueue(makeTask(100));
        const p2 = queue.enqueue(makeTask(100));
        const p3 = queue.enqueue(makeTask(100));
        const p4 = queue.enqueue(makeTask(100));

        await Promise.all([p1, p2, p3, p4]);
        expect(maxRunning).toBe(2);
    });

    test('enqueue returns a promise that resolves with the task result', async () => {
        const queue = new AsyncQueue(1);
        const r1 = await queue.enqueue(() => Promise.resolve('a'));
        const r2 = await queue.enqueue(() => Promise.resolve('b'));
        expect(r1).toBe('a');
        expect(r2).toBe('b');
    });

    test('enqueue returns a promise that rejects if the task fails', async () => {
        const queue = new AsyncQueue(1);
        await expect(
            queue.enqueue(() => Promise.reject(new Error('boom')))
        ).rejects.toThrow('boom');
    });

    test('a failed task does not block the queue', async () => {
        const queue = new AsyncQueue(1);

        await expect(
            queue.enqueue(() => Promise.reject(new Error('fail')))
        ).rejects.toThrow('fail');

        const result = await queue.enqueue(() => Promise.resolve('ok'));
        expect(result).toBe('ok');
    });

    test('tasks start immediately if concurrency is not full', async () => {
        const queue = new AsyncQueue(3);
        const log = [];

        queue.enqueue(() => { log.push('a'); return Promise.resolve(); });
        queue.enqueue(() => { log.push('b'); return Promise.resolve(); });

        // Give microtasks time to run
        await Promise.resolve();

        expect(log).toEqual(['a', 'b']);
    });

    test('tasks run in enqueue order', async () => {
        const queue = new AsyncQueue(1);
        const log = [];

        const p1 = queue.enqueue(() => {
            log.push('a');
            return new Promise(resolve => setTimeout(resolve, 50));
        });
        const p2 = queue.enqueue(() => {
            log.push('b');
            return Promise.resolve();
        });
        const p3 = queue.enqueue(() => {
            log.push('c');
            return Promise.resolve();
        });

        await Promise.all([p1, p2, p3]);
        expect(log).toEqual(['a', 'b', 'c']);
    });

    test('dynamically added tasks are processed', async () => {
        const queue = new AsyncQueue(1);
        const log = [];

        const p1 = queue.enqueue(() => {
            log.push('first');
            return new Promise(resolve => setTimeout(resolve, 50));
        });

        await p1;

        // Add more tasks after the first one completes
        const p2 = queue.enqueue(() => {
            log.push('second');
            return Promise.resolve();
        });

        await p2;
        expect(log).toEqual(['first', 'second']);
    });
});
