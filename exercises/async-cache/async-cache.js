// Implement createAsyncCache(fn) here
// fn: an async function that takes a string key and returns a promise
// Returns a wrapped function that:
//   - Caches results per key
//   - Deduplicates in-flight calls for the same key
//   - Retries on failure (don't cache rejections)

function createAsyncCache(fn) {
    const cache = new Map();

    return function(key){
        if (!cache.has(key)){
            const value = fn(key);
            cache.set(key, value);
            value.catch(()=>{
                cache.delete(key);
            })
        }
        return cache.get(key);
    }
}

module.exports = { createAsyncCache };
