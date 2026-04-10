// Implement rateLimitedExecute(tasks, maxPerWindow, windowMs) here
// tasks: array of functions that return promises
// maxPerWindow: max number of tasks that can START within a time window
// windowMs: the time window in milliseconds
// Returns a promise that resolves with all results in order

function sleep(timelapse){
    return new Promise((resolve)=>setTimeout(resolve,timelapse))
}

async function rateLimitedExecute(tasks, maxPerWindow, windowMs) {
    let counter = 0;
    let promises = [];
    while(counter<tasks.length){
        for (let i=0; i<maxPerWindow; i++){
            if (counter>=tasks.length){break}
            promises.push(tasks[counter]());
            counter++
        }
        if (counter < tasks.length){
            await sleep(windowMs);
        }
    }
    return await Promise.all(promises);

}

module.exports = { rateLimitedExecute };
