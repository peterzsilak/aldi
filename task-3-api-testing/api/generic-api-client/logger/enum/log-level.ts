export enum LogLevel {
    Silent = "silent",
    Error = "error",
    Warn = "warn",
    Info = "info",
    Debug = "debug",
}

export const LOG_LEVEL_WEIGHT: Record<LogLevel, number> = {
    [LogLevel.Silent]: 0,
    [LogLevel.Error]: 1,
    [LogLevel.Warn]: 2,
    [LogLevel.Info]: 3,
    [LogLevel.Debug]: 4,
};
