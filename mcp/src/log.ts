/**
 * On a stdio MCP transport, stdout carries framed JSON-RPC and nothing else.
 * core's diagnostics therefore have to go to stderr, which Claude Desktop
 * surfaces in its MCP logs. core exposes setLogSink for exactly this; nothing
 * here patches the global console.
 */
import { setLogSink, type LogLevel } from "core/utils/log.js";

export const routeCoreLogsToStderr = () => {
  setLogSink((level: LogLevel, args: unknown[]) => {
    const text = args
      .map((a) => (typeof a === "string" ? a : safeInspect(a)))
      .join(" ");
    process.stderr.write(`[core:${level}] ${text}\n`);
  });
};

const safeInspect = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const log = (message: string) => {
  process.stderr.write(`[learnthings-mcp] ${message}\n`);
};
