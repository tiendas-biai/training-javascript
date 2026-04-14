// Implement CircuitBreaker class here
// constructor(fn, { maxFailures, cooldownMs })
// call(...args): executes fn if circuit allows, rejects if circuit is open
//
// States:
//   CLOSED — normal, calls go through
//   OPEN — tripped, calls rejected instantly
//   HALF-OPEN — cooldown expired, next call is a test

const STATE = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF-OPEN',
};

class CircuitBreaker {
    constructor(fn, { maxFailures, cooldownMs }) {
        this.fn = fn;
        this.maxFailures = maxFailures;
        this.cooldownMs = cooldownMs;
        this.failures = 0;
        this.state = STATE.CLOSED;
        this.openedAt = null;
    }

    ensureCircuitAllowsCall() {
        if (this.state !== STATE.OPEN) return;

        const elapsed = Date.now() - this.openedAt;
        if (elapsed < this.cooldownMs) {
            throw new Error('Circuit is open');
        }
        this.state = STATE.CLOSED;
    }

    recordSuccess() {
        this.failures = 0;
        this.state = STATE.CLOSED;
    }

    recordFailure() {
        this.failures++;
        if (this.failures >= this.maxFailures) {
            this.state = STATE.OPEN;
            this.openedAt = Date.now();
        }
    }

    async call(...args) {
        this.ensureCircuitAllowsCall();
        try {
            const value = await this.fn(...args);
            this.recordSuccess();
            return value;
        } catch (e) {
            this.recordFailure();
            throw e;
        }
    }
}

module.exports = { CircuitBreaker };