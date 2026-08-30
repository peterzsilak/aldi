import type { GenericApiClientConfig } from "@api/generic-api-client/generic-api-client-config";
import { TaskApiErrorHandler } from "@api/task-api-client/error-handler/task-api-error-handler";

export const TASK_API_DEFAULTS = {
    timeout: 10_000,
    retry: {
        maxAttempts: 3,
        delayMs: 100,
        backoffFactor: 2,
    },
} as const;

/**
 * Builds the client config for a given task service instance. Tests only have to
 * provide the base URL; timeouts, retries and error mapping come from here.
 */
export function createTaskApiClientConfig(basePath: string, overrides: Partial<GenericApiClientConfig> = {}): GenericApiClientConfig {
    return {
        basePath,
        timeout: TASK_API_DEFAULTS.timeout,
        retry: { ...TASK_API_DEFAULTS.retry },
        errorHandler: new TaskApiErrorHandler(),
        ...overrides,
    };
}
