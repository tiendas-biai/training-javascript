// Implement retryWithBackoff(fn, options) here
// fn: async function to retry
// options: { maxAttempts, initialDelay, factor }
// Retries fn with exponential backoff between attempts
// No delay before first attempt
// Delay pattern: initialDelay, initialDelay*factor, initialDelay*factor^2, ...

async function retryWithBackoff(fn, { maxAttempts, initialDelay, factor }) {
    // your code here
}

module.exports = { retryWithBackoff };
