// src/core/logger.ts

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    silent: 99
};

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel): void {
    currentLevel = level;
}

export function getLogLevel(): LogLevel {
    return currentLevel;
}

function enabled(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel] && currentLevel !== "silent";
}

export const log = {
    debug: (...args: unknown[]) => {
        if (enabled("debug")) console.debug("[GeoLens]", ...args);
    },
    info: (...args: unknown[]) => {
        if (enabled("info")) console.info("[GeoLens]", ...args);
    },
    warn: (...args: unknown[]) => {
        if (enabled("warn")) console.warn("[GeoLens]", ...args);
    },
    error: (...args: unknown[]) => {
        if (enabled("error")) console.error("[GeoLens]", ...args);
    }
};
