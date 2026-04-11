// Implement promiseAllSettled(promises) here
// - Always resolves, never rejects
// - Waits for every promise to settle (resolve or reject)
// - Returns array of { status: 'fulfilled', value } or { status: 'rejected', reason }
// - Results in same order as input
// - Do NOT use Promise.allSettled

function promiseAllSettled(promises) {

    return new Promise((resolve) => {
        let results = new Array(promises.length);
        let settled = 0;
        if (promises.length===0){
            resolve([]);
        }
        promises.forEach((promise,i)=>{
            Promise.resolve(promise).then((value)=>{
                results[i] = {status: 'fulfilled', value};
            }).catch((reason)=>{
                results[i] = {status: 'rejected', reason}
            }).finally(()=>{
                settled++
                if (settled === promises.length) resolve(results);
            })
        })
    })
}

// v2: using a for loop instead of forEach — same parallel behavior
function promiseAllSettledV2(promises) {
    return new Promise((resolve) => {
        let results = new Array(promises.length);
        let settled = 0;
        if (promises.length === 0) {
            resolve([]);
        }
        for (let i = 0; i < promises.length; i++) {
            Promise.resolve(promises[i]).then((value) => {
                results[i] = {status: 'fulfilled', value};
            }).catch((reason) => {
                results[i] = {status: 'rejected', reason};
            }).finally(() => {
                settled++;
                if (settled === promises.length) resolve(results);
            });
        }
    });
}

module.exports = {promiseAllSettled, promiseAllSettledV2};
