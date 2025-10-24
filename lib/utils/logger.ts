/**
 * ロギングユーティリティ
 * 本番環境ではログを無効化し、パフォーマンスへの影響を最小化
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: unknown;
}

class OverlayLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private createEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      timestamp: new Date().toISOString(),
      message,
      data
    };
  }

  private formatLog(entry: LogEntry): string {
    const icon = this.getIcon(entry.level);
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    return `${icon} [${entry.level.toUpperCase()}] ${entry.message}${dataStr}`;
  }

  private getIcon(level: LogLevel): string {
    const icons: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return icons[level];
  }

  debug(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    const entry = this.createEntry('debug', message, data);
    console.debug(this.formatLog(entry));
  }

  info(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    const entry = this.createEntry('info', message, data);
    console.info(this.formatLog(entry));
  }

  warn(message: string, data?: unknown): void {
    const entry = this.createEntry('warn', message, data);
    console.warn(this.formatLog(entry));
  }

  error(message: string, error?: unknown): void {
    const entry = this.createEntry('error', message, error);
    console.error(this.formatLog(entry));
  }
}

export const logger = new OverlayLogger();