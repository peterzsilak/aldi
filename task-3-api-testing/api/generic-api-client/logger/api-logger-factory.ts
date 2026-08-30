import type { GenericApiClientConfig } from "@api/generic-api-client/generic-api-client-config";
import type { ApiLogger } from "@api/generic-api-client/logger/api-logger";
import { ConsoleApiLogger } from "@api/generic-api-client/logger/console-api-logger";
import { LOG_LEVEL_WEIGHT, LogLevel } from "@api/generic-api-client/logger/enum/log-level";

function levelFromEnv(): LogLevel {
    const raw = process.env["API_LOG_LEVEL"]?.toLowerCase();

    return raw !== undefined && raw in LOG_LEVEL_WEIGHT ? (raw as LogLevel) : LogLevel.Silent;
}

/**
 * Resolution order: explicit logger from the config, then the configured level,
 * then the `API_LOG_LEVEL` environment variable, then silent.
 */
export function createApiLogger(clientName: string, config?: GenericApiClientConfig): ApiLogger {
    if (config?.logger) {
        return config.logger;
    }

    return new ConsoleApiLogger(clientName, config?.logLevel ?? levelFromEnv());
}
