// Implement retry(fn, n) here
// It should call fn() up to n times, returning the result on success
// If all n attempts fail, it should throw the last error

async function retry(fn, n) {
    for (let i=0; i<n; i++){
        try{
            return await fn();
        } catch (e) {
            if (i===n-1){
                throw(e);
            }
        }
    }
}

module.exports = { retry };
