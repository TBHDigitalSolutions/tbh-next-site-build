// src/components/sections/Web-Dev/PortfolioDemo/utils/detectEmbedBlocked.ts
/**
 * detectEmbedBlocked
 * ----------------------------------------------------------------------------
 * Best-effort detection for iframe embeds that fail due to `X-Frame-Options`
 * or `Content-Security-Policy: frame-ancestors`, slow networks, or invalid src.
 *
 * HOW IT WORKS
 * - Waits for the iframe `load` event or a timeout (default 3000ms).
 * - On `load`, attempts to inspect the document:
 *     • If same-origin and the document/body is empty → likely blocked or invalid.
 *     • If cross-origin → we cannot introspect; treat as loaded (not blocked),
 *       but expose `crossOrigin: true` so callers can decide.
 * - On timeout with no load → mark as `blocked: true` (common in XFO/CSP blocks).
 *
 * NOTE
 * - There is no 100%-reliable way to distinguish all block causes in the browser.
 *   This utility is intentionally pragmatic and tuned for our use-case: most demos
 *   are same-origin `/demos/<slug>/index.html`. For third-party URLs, the result
 *   may be `crossOrigin: true`.
 *
 * USAGE
 *   const result = await detectEmbedBlocked(iframeEl, { timeoutMs: 3000 });
 *   if (result.blocked) { showFallback(); }
 */

export type DetectEmbedBlockedOptions = {
  /** How long to wait (ms) before assuming a block/timeout (default 3000) */
  timeoutMs?: number;
  /**
   * If true (default), a same-origin document with an empty body is treated
   * as blocked. Set false if your demos intentionally render empty bodies.
   */
  treatEmptyDocumentAsBlocked?: boolean;
};

export type DetectEmbedBlockedResult = {
  /** Whether the iframe reported `load` */
  loaded: boolean;
  /** Our best guess whether embedding was blocked */
  blocked: boolean;
  /** Was the document cross-origin (we couldn't introspect)? */
  crossOrigin: boolean;
  /** Quick reason code to help with logging/UI */
  reason:
    | "ok"
    | "timeout"
    | "error"
    | "empty_document"
    | "invalid_src"
    | "unknown";
  /** Extra details for diagnostics (optional) */
  details?: string;
};

const DEFAULT_TIMEOUT = 3000;

/** Safely test if the iframe document is same-origin and accessible. */
function getIframeDocumentSafe(iframe: HTMLIFrameElement): Document | null {
  try {
    // Accessing contentDocument throws on cross-origin if not allowed.
    return iframe.contentDocument ?? null;
  } catch {
    return null;
  }
}

/** Heuristic: consider a document "empty" if body has no elements and no text. */
function isDocumentEmpty(doc: Document | null): boolean {
  if (!doc) return true;
  const body = doc.body;
  if (!body) return true;
  if (body.childElementCount > 0) return false;
  const text = (body.textContent || "").trim();
  return text.length === 0;
}

/**
 * Detect if an iframe embed was likely blocked.
 * Returns a Promise that resolves once we know (load/timeout/error).
 */
export function detectEmbedBlocked(
  iframe: HTMLIFrameElement | null | undefined,
  opts: DetectEmbedBlockedOptions = {}
): Promise<DetectEmbedBlockedResult> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    treatEmptyDocumentAsBlocked = true,
  } = opts;

  return new Promise<DetectEmbedBlockedResult>((resolve) => {
    if (!iframe) {
      resolve({
        loaded: false,
        blocked: true,
        crossOrigin: false,
        reason: "unknown",
        details: "No iframe element provided.",
      });
      return;
    }

    const src = (iframe.getAttribute("src") || "").trim();

    if (!src || src === "about:blank") {
      resolve({
        loaded: false,
        blocked: true,
        crossOrigin: false,
        reason: "invalid_src",
        details: `Invalid or empty src: "${src}"`,
      });
      return;
    }

    let done = false;
    const finish = (result: DetectEmbedBlockedResult) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(result);
    };

    const onLoad = () => {
      // If load fired, we try to introspect
      const doc = getIframeDocumentSafe(iframe);
      const crossOrigin = !doc;

      if (!crossOrigin) {
        const empty = isDocumentEmpty(doc);
        if (empty && treatEmptyDocumentAsBlocked) {
          finish({
            loaded: true,
            blocked: true,
            crossOrigin: false,
            reason: "empty_document",
            details: "Same-origin document appears empty after load.",
          });
          return;
        }
      }

      finish({
        loaded: true,
        blocked: false,
        crossOrigin,
        reason: "ok",
      });
    };

    const onError = () => {
      finish({
        loaded: false,
        blocked: true,
        crossOrigin: false,
        reason: "error",
        details: "Iframe error event.",
      });
    };

    const timer = window.setTimeout(() => {
      // If we timed out without load, it's very likely frame-ancestors/XFO
      finish({
        loaded: false,
        blocked: true,
        crossOrigin: false,
        reason: "timeout",
        details: `No load event within ${timeoutMs}ms.`,
      });
    }, Math.max(0, timeoutMs));

    const cleanup = () => {
      window.clearTimeout(timer);
      iframe.removeEventListener("load", onLoad as any);
      iframe.removeEventListener("error", onError as any);
    };

    // Attach listeners *after* setting timer to avoid races
    iframe.addEventListener("load", onLoad as any, { once: true });
    // Not all browsers fire `error` for CSP/XFO, but it doesn't hurt to listen
    iframe.addEventListener("error", onError as any, { once: true });

    // In case the iframe was already loaded before we attached (edge case),
    // try a microtask check.
    queueMicrotask(() => {
      if (done) return;
      try {
        // Some browsers expose readyState for frame docs; if complete, synthesize onLoad.
        const doc = getIframeDocumentSafe(iframe);
        if (doc && (doc.readyState === "interactive" || doc.readyState === "complete")) {
          onLoad();
        }
      } catch {
        // ignore
      }
    });
  });
}

export default detectEmbedBlocked;
