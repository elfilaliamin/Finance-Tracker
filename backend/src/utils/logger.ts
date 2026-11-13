export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: string;
}

class Logger {
  private format(level: LogLevel, message: string, context?: Record<string, unknown>, err?: Error): string {
    const payload: LogPayload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(err && { error: err.stack || err.message }),
    };
    return JSON.stringify(payload);
  }

  public info(message: string, context?: Record<string, unknown>): void {
    console.log(this.format('info', message, context));
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.format('warn', message, context));
  }

  public error(message: string, err?: Error, context?: Record<string, unknown>): void {
    console.error(this.format('error', message, context, err));
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, context));
    }
  }
}

export const logger = new Logger();

