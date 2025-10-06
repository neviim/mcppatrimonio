import type { LogLevel, LogEntry } from "../core/types.js";
import { env } from "../config/env.js";

class Logger {
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private minLevel: LogLevel;

  constructor() {
    this.minLevel = env.LOG_LEVEL;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.minLevel];
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    let message = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context) {
      message += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return message;
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const formatted = this.formatMessage(entry);

    switch (entry.level) {
      case "error":
        console.error(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "debug":
        console.debug(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log({
      level: "debug",
      message,
      timestamp: new Date(),
      context,
    });
  }

  info(message: string, context?: Record<string, any>): void {
    this.log({
      level: "info",
      message,
      timestamp: new Date(),
      context,
    });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log({
      level: "warn",
      message,
      timestamp: new Date(),
      context,
    });
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log({
      level: "error",
      message,
      timestamp: new Date(),
      context,
      error,
    });
  }
}

export const logger = new Logger();
