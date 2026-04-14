// Implement retryWithBackoff(fn, options) here
// fn: async function to retry
// options: { maxAttempts, initialDelay, factor }
// Retries fn with exponential backoff between attempts
// No delay before first attempt
// Delay pattern: initialDelay, initialDelay*factor, initialDelay*factor^2, ...

function sleep(timeout){
    return new Promise((resolve)=>setTimeout(resolve,timeout));
}

async function retryWithBackoff(fn, { maxAttempts, initialDelay, factor }) {
    let delay = 0;
    for (let i=0; i<maxAttempts; i++){
        try{
           return await fn();
        } catch (e){
            if (i===maxAttempts-1){
                throw e;
            }
            delay = initialDelay*Math.pow(factor,i);
            await sleep(delay)
        }
    }
}

module.exports = { retryWithBackoff };
