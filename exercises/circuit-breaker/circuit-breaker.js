// Implement CircuitBreaker class here
// constructor(fn, { maxFailures, cooldownMs })
// call(...args): executes fn if circuit allows, rejects if circuit is open
//
// States:
//   CLOSED — normal, calls go through
//   OPEN — tripped, calls rejected instantly
//   HALF-OPEN — cooldown expired, next call is a test

class CircuitBreaker {
    constructor(fn, { maxFailures, cooldownMs }) {
        // your code here
    }

    async call(...args) {
        // your code here
    }
}

module.exports = { CircuitBreaker };
