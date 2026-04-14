// Implement pipeline(functions, initialValue) here
// functions: array of async functions, each takes one arg and returns a promise
// initialValue: the starting value passed to the first function
// Each function's output becomes the next function's input
// Returns the final result

async function pipeline(functions, initialValue) {
    let output = initialValue;
    for (let i=0; i<functions.length; i++){
        let fn = functions[i];
        output = await fn(output);
    }
    return output;
}

module.exports = { pipeline };
