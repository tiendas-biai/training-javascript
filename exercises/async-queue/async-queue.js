// Implement AsyncQueue class here
// constructor(concurrency): max number of tasks running at once
// enqueue(fn): adds a task, returns a promise with the task's result
// Tasks run in order, respecting concurrency limit
// When a task finishes, the next queued task starts automatically

class AsyncQueue {
    constructor(concurrency) {
        this.queue = [];
        this.concurrenty = concurrency;
        this.running = 0;
    }

    run() {
        while (this.running < this.concurrenty && this.queue.length > 0) {
            const {fn, resolve, reject} = this.queue.shift();
            this.running++
            fn()
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.running--;
                    this.run();
                })
        }
    }

    enqueue(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({fn, resolve, reject});
            this.run();
        })

    }
}

module.exports = {AsyncQueue};
