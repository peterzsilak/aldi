export interface RetryOptions {
    /**
     * Total number of attempts, the first call included.
     * Example: `3` means one original call and two retries.
     */
    maxAttempts: number;

    /** Base delay (ms) before the next attempt. */
    delayMs: number;

    /**
     * Exponential multiplier applied to the delay on every retry.
     * `1` keeps the delay linear, `2` produces 100ms, 200ms, 400ms, ...
     */
    backoffFactor: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxAttempts: 1,
    delayMs: 0,
    backoffFactor: 1,
};
