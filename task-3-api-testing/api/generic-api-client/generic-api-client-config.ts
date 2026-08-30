import type { ApiErrorHandler } from "@api/generic-api-client/error-handler/api-error-handler";
import type { ApiLogger } from "@api/generic-api-client/logger/api-logger";
import type { LogLevel } from "@api/generic-api-client/logger/enum/log-level";
import type { RetryOptions } from "@api/generic-api-client/retry-options";

export interface GenericApiClientConfig {
    /** Absolute base URL every relative path is resolved against. */
    basePath: string;
    /** Per-request timeout in milliseconds. */
    timeout?: number;
    /** Default headers merged into every request. */
    defaultHeaders?: Record<string, string>;
    retry?: RetryOptions;
    errorHandler?: ApiErrorHandler;
    logger?: ApiLogger;
    logLevel?: LogLevel;
}
