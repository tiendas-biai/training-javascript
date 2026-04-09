// Implement poll(fn, condition, options) here
// fn: async function to call repeatedly
// condition: function that receives fn's result, returns true when done
// options: { interval, maxAttempts }
// Should resolve with the result when condition is met
// Should reject if maxAttempts is reached without condition being met
// Don't delay before the first attempt

function sleep(timeout){
    return new Promise((resolve)=>setTimeout(resolve,timeout))
}

async function poll(fn, condition, { interval, maxAttempts }) {
    for (let attempt=0; attempt<maxAttempts; attempt++){
        try {
            let data = await fn();
            if (condition(data)){
                return data;
            }
            await sleep(interval)
        } catch (error) {
            throw error;
        }
    }
    throw new Error();
}

module.exports = { poll };
