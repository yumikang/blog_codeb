/**
 * Structured logging utility for server-side operations
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  service?: string;
  operation?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const baseLog = {
      timestamp,
      level,
      message,
      ...context
    };

    if (this.isDevelopment) {
      // Pretty print in development
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${context ? JSON.stringify(context, null, 2) : ''}`;
    }

    // JSON format for production (easier to parse by log aggregators)
    return JSON.stringify(baseLog);
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      };
      console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
    }
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog(LogLevel.FATAL)) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      };
      console.error(this.formatMessage(LogLevel.FATAL, message, errorContext));
    }
  }

  // Helper method for timing operations
  startTimer(): () => number {
    const start = Date.now();
    return () => Date.now() - start;
  }

  // Helper method for logging HTTP requests
  logRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 500 ? LogLevel.ERROR : 
                  statusCode >= 400 ? LogLevel.WARN : 
                  LogLevel.INFO;
    
    this[level](`${method} ${path} ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      duration
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for testing purposes
export { Logger };