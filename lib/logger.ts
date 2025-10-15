import fs from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

type LogLevel = "info" | "error" | "warn" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

function formatLogEntry(entry: LogEntry): string {
  const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : "";
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${dataStr}\n`;
}

function writeToFile(filename: string, content: string) {
  const filePath = path.join(logsDir, filename);
  try {
    fs.appendFileSync(filePath, content);
  } catch (error) {
    console.error("Error writing to log file:", error);
  }
}

function getLogFileName(level: LogLevel): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `${level}-${date}.log`;
}

function log(level: LogLevel, message: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };

  const formattedEntry = formatLogEntry(entry);

  // Write to console
  switch (level) {
    case "error":
      console.error(formattedEntry.trim());
      break;
    case "warn":
      console.warn(formattedEntry.trim());
      break;
    case "debug":
      console.debug(formattedEntry.trim());
      break;
    default:
      console.log(formattedEntry.trim());
  }

  // Write to file
  writeToFile(getLogFileName(level), formattedEntry);

  // Also write to combined log
  writeToFile(`combined-${new Date().toISOString().split("T")[0]}.log`, formattedEntry);
}

export const logger = {
  info: (message: string, data?: any) => log("info", message, data),
  error: (message: string, data?: any) => log("error", message, data),
  warn: (message: string, data?: any) => log("warn", message, data),
  debug: (message: string, data?: any) => log("debug", message, data),
};
