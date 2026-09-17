export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogSink = (level: LogLevel, args: unknown[]) => void;

const consoleSink: LogSink = (level, args) => {
  const write =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  write(...args);
};

let sink: LogSink = consoleSink;

/**
 * Redirect core's diagnostics.
 *
 * The default writes to the console, which is right in a browser. Hosts that
 * reserve stdout for a protocol must route these elsewhere — an MCP server on a
 * stdio transport, for instance, frames JSON-RPC on stdout, and a stray
 * console.log corrupts the stream. Passing undefined restores the default.
 */
export const setLogSink = (next: LogSink | undefined) => {
  sink = next ?? consoleSink;
};

export const log = {
  debug: (...args: unknown[]) => sink("debug", args),
  info: (...args: unknown[]) => sink("info", args),
  warn: (...args: unknown[]) => sink("warn", args),
  error: (...args: unknown[]) => sink("error", args),
};
