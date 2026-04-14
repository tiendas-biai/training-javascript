// Implement promiseAny(promises) here
// - Resolves with the first promise that fulfills
// - Ignores rejections unless ALL promises reject
// - If all reject, reject with AggregateError containing all reasons (in order)
// - Do NOT use Promise.any

function promiseAny(promises) {
    const failed = [];
    let rejectedCount = 0;

    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            reject(new AggregateError([]));
            return;
        }
        promises.forEach((promise, i) => {
            Promise.resolve(promise)
                .then(resolve)
                .catch((error) => {
                    failed[i] = error;
                    rejectedCount++;
                    if (rejectedCount === promises.length) {
                        reject(new AggregateError(failed));
                    }
                });
        });
    });
}

module.exports = { promiseAny };
