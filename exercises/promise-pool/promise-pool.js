// Implement promisePool(tasks, concurrency) here
// tasks: array of functions that return promises
// concurrency: max number of tasks running at the same time
// Returns a promise that resolves with all results in order

async function promisePool(tasks, concurrency) {
    let currentIndex = 0;
    let results = new Array(tasks.length);
    async function useWorker() {
        while (currentIndex < tasks.length) {
            const index = currentIndex++;
            results[index] = await tasks[index]();
        }
    }
    //const workers = Array.from({length:concurrency}, ()=>useWorker());
    let workers = [];
    let numberOfWorkers = Math.min(concurrency, tasks.length)
    for (let i=0; i<numberOfWorkers; ++i){
        workers.push(useWorker())
    }
    await Promise.all(workers)
    return results;
}

module.exports = { promisePool };
