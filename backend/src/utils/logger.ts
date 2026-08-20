import fs from "fs";
import path from "path";

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private minLevel: LogLevel;
  private logDir: string;

  private levelPriority: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  constructor(level: LogLevel = "info") {
    this.minLevel = level;
    this.logDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] <= this.levelPriority[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private write(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    };

    const formatted = this.formatEntry(entry);

    //if (process.env.NODE_ENV === "development") {
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}:`;
      if (metadata && Object.keys(metadata).length > 0) {
        console.log(`${prefix} ${message} ${JSON.stringify(metadata)}`);
      } else {
        console.log(`${prefix} ${message}`);
      }
   // }

    if (level === "error") {
      const errorLogPath = path.join(this.logDir, "error.log");
      fs.appendFileSync(errorLogPath, formatted + "\n");
    }
    const combinedLogPath = path.join(this.logDir, "combined.log");
    fs.appendFileSync(combinedLogPath, formatted + "\n");
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.write("error", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.write("warn", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.write("info", message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.write("debug", message, metadata);
  }
}

const logLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
const logger = new Logger(logLevel);

export default logger;


