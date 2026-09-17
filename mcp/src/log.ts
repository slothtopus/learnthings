/**
 * On a stdio MCP transport, stdout carries framed JSON-RPC and nothing else.
 * `core` logs liberally with console.log (sync progress, db creation, ...), so
 * every console channel is pinned to stderr before core is ever imported.
 * Claude Desktop surfaces stderr in its MCP logs, so nothing is lost.
 */
export const redirectConsoleToStderr = () => {
  const toStderr =
    (level: string) =>
    (...args: unknown[]) => {
      const text = args
        .map((a) => (typeof a === "string" ? a : safeInspect(a)))
        .join(" ");
      process.stderr.write(`[${level}] ${text}\n`);
    };

  console.log = toStderr("core");
  console.info = toStderr("core");
  console.debug = toStderr("core");
  console.warn = toStderr("warn");
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
