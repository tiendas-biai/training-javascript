// Implement promiseAll(promises) here
// - Resolves with an array of all results (in order) when every promise fulfills
// - Rejects immediately with the first error if any promise rejects
// - Do NOT use Promise.all

function promiseAll(promises) {
    return new Promise((resolve,reject)=>{
        let results = [];
        let resolved = 0;
        if (promises.length===0){
            resolve(promises);
            return
        }
        promises.forEach((promise, i)=>{
            Promise.resolve(promise).then((value)=>{
                results[i] = value;
                ++resolved
                if (resolved === promises.length){
                    resolve(results)
                }
            }).catch(reject)
        })
    })
}


module.exports = { promiseAll };
