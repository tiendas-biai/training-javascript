// Implement batchExecute(tasks, batchSize) here
// tasks: array of functions that return promises
// batchSize: how many tasks to run per batch
// Run a batch, wait for all to finish, then run the next batch
// Returns a promise that resolves with all results in order

async function batchExecute(tasks, batchSize) {
    let counter = 0;
    let results = [];
    while(counter<tasks.length){
        let batch = [];
        for (let i=0; i<batchSize; ++i){
            if (counter>=tasks.length){
                break
            }
            batch.push(tasks[counter]());
            counter++;
        }
        let batchResult = await Promise.all(batch);
        results = results.concat(batchResult);
    }
    return results
}

module.exports = { batchExecute };
