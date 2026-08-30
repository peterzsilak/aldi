import type { ApiLogger } from "@api/generic-api-client/logger/api-logger";
import { LOG_LEVEL_WEIGHT, LogLevel } from "@api/generic-api-client/logger/enum/log-level";

/**
 * Minimal level-aware console logger. Silent by default so that green runs stay
 * readable; raise the level with the `API_LOG_LEVEL` environment variable.
 */
export class ConsoleApiLogger implements ApiLogger {
    private readonly threshold: number;

    constructor(
        private readonly clientName: string,
        level: LogLevel = LogLevel.Silent,
    ) {
        this.threshold = LOG_LEVEL_WEIGHT[level];
    }

    public debug(message: string, meta?: Record<string, unknown>): void {
        this.write(LogLevel.Debug, message, meta);
    }

    public info(message: string, meta?: Record<string, unknown>): void {
        this.write(LogLevel.Info, message, meta);
    }

    public warn(message: string, meta?: Record<string, unknown>): void {
        this.write(LogLevel.Warn, message, meta);
    }

    public error(message: string, meta?: Record<string, unknown>): void {
        this.write(LogLevel.Error, message, meta);
    }

    private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
        if (LOG_LEVEL_WEIGHT[level] > this.threshold) {
            return;
        }

        const line = `[${new Date().toISOString()}] [${level}] [${this.clientName}] ${message}`;

        console.log(meta === undefined ? line : `${line} ${JSON.stringify(meta)}`);
    }
}
