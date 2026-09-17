/**
 * Node ESM resolution hook.
 *
 * `core` is compiled with moduleResolution "node", so its emitted JavaScript
 * contains extensionless relative imports (`from "./PouchDB"`). Bundlers such
 * as Vite resolve those happily, which is why frontendv2 works, but Node's ESM
 * loader requires a fully specified path and throws ERR_MODULE_NOT_FOUND.
 *
 * This hook only runs *after* normal resolution has already failed, so it can
 * never shadow a correct resolution — it just retries with the extensions Node
 * would have tried under CommonJS.
 *
 * The durable fix is to make core emit fully specified imports; see mcp/README.md.
 */
type ResolveResult = { url: string; format?: string | null; shortCircuit?: boolean };
type NextResolve = (specifier: string, context: unknown) => Promise<ResolveResult>;

const CANDIDATE_SUFFIXES = [".js", "/index.js"];

export const resolve = async (
  specifier: string,
  context: unknown,
  nextResolve: NextResolve,
): Promise<ResolveResult> => {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
    if (!isRelative || (err as NodeJS.ErrnoException)?.code !== "ERR_MODULE_NOT_FOUND") {
      throw err;
    }
    for (const suffix of CANDIDATE_SUFFIXES) {
      try {
        return await nextResolve(specifier + suffix, context);
      } catch {
        // try the next candidate
      }
    }
    throw err;
  }
};
