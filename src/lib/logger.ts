/**
 * 轻量结构化日志。
 * 自动脱敏:不输出 apiKey、authorization、question 等敏感字段。
 */
const SENSITIVE_KEYS = /key|token|authorization|password|secret|question|content/i;

type LogData = Record<string, unknown>;

function sanitize(data: LogData): LogData {
  const out: LogData = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.test(key)) {
      out[key] = "[redacted]";
    } else {
      out[key] = value;
    }
  }
  return out;
}

function log(level: "info" | "warn" | "error", event: string, data: LogData = {}) {
  const line = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    ...sanitize(data),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, data?: LogData) => log("info", event, data),
  warn: (event: string, data?: LogData) => log("warn", event, data),
  error: (event: string, data?: LogData) => log("error", event, data),
};
