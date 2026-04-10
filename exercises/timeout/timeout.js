// Implement withTimeout(fn, ms) here
// fn: a function that returns a promise
// ms: maximum time in milliseconds to wait
// If fn() resolves within ms, return its result
// If fn() takes longer than ms, reject with Error("Operation timed out after {ms}ms")
// If fn() rejects on its own, pass that rejection through

async function withTimeout(fn, ms) {
    return await Promise.race([new Promise((resolve, reject)=>{
        setTimeout(()=>{
            reject(new Error(`Operation timed out after ${ms}ms`))
        },ms)
    }),fn()])
}

module.exports = { withTimeout };
