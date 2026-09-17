/**
 * PouchDB 9.0.0 predates Node's built-in fetch.
 *
 * When replicating an attachment, its HTTP adapter picks how to read the body:
 *
 *     if ('buffer' in response) { blob = await response.buffer(); }
 *     else                     { blob = await response.blob();   }
 *
 * `.buffer()` is the node-fetch v2 API. Node 18+ ships undici, whose Response
 * has no `.buffer()`, so PouchDB takes the browser branch and produces a Blob —
 * which it then hands to `binaryMd5`, which calls Node's crypto, which rejects
 * Blob outright:
 *
 *     TypeError: The "data" argument must be of type string or an instance of
 *     Buffer, TypedArray, or DataView. Received an instance of Blob
 *
 * Worse, the rejection escapes the replication promise, so the sync neither
 * resolves nor rejects — it simply hangs.
 *
 * Restoring `.buffer()` puts PouchDB back on the Node branch. It is added
 * lazily per response and consumes nothing unless PouchDB calls it, so it is
 * inert for every other request the process makes.
 *
 * This only bites decks that actually carry attachments (images, audio).
 * The browser client is unaffected: there, Blob is the correct type.
 */
export const installFetchBufferCompat = () => {
  const native = globalThis.fetch;
  if (typeof native !== "function") return;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await native(input, init);
    if (typeof (response as { buffer?: unknown }).buffer !== "function") {
      Object.defineProperty(response, "buffer", {
        value: async () => Buffer.from(await response.arrayBuffer()),
        writable: true,
        configurable: true,
        enumerable: false,
      });
    }
    return response;
  };
};
