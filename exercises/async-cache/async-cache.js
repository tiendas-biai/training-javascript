// Implement createAsyncCache(fn) here
// fn: an async function that takes a string key and returns a promise
// Returns a wrapped function that:
//   - Caches results per key
//   - Deduplicates in-flight calls for the same key
//   - Retries on failure (don't cache rejections)

function createAsyncCache(fn) {
    // your code here
}

module.exports = { createAsyncCache };
