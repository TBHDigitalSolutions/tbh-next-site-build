// ===================================================================
// /src/components/portfolio/PortfolioModal/adapters.ts
// ===================================================================
// Tolerant adapter to normalize arbitrary “portfolio item” input
// into a PortfolioModalProject for the modal.
// - Coerces metrics to strings
// - Infers media type from common fields/extensions if missing
// - Fills safe minimal defaults
// ===================================================================

import type {
  PMedia,
  PMediaType,
  PMetric,
  PortfolioModalProject,
} from "./PortfolioModal.types";
import { parsePortfolioModalProject } from "./utils/portfolioModalValidator";

// --------- helpers ---------

function inferMediaTypeFromUrl(url: string): PMediaType {
  const u = (url || "").toLowerCase();
  if (u.endsWith(".pdf")) return "pdf";
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/.test(u)) return "video";
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/.test(u)) return "image";
  return "interactive";
}

function coerceMetrics(rawMetrics: any): PMetric[] | undefined {
  if (!Array.isArray(rawMetrics)) return undefined;
  const list = rawMetrics
    .map((m: any) => {
      if (m && typeof m === "object" && "label" in m) {
        return { label: String(m.label), value: String((m as any).value ?? "") };
      }
      if (Array.isArray(m) && m.length >= 2) {
        return { label: String(m[1]), value: String(m[0]) };
      }
      return null;
    })
    .filter(Boolean) as PMetric[];
  return list.length ? list : undefined;
}

// --------- adapter ---------

/**
 * Normalize unknown input → PortfolioModalProject.
 * Supports many legacy/common shapes:
 *  - media under { media: { type, src, poster, alt } } or shorthand fields
 *  - metrics as [{label,value}] or [value,label] tuples
 *  - id from id/slug/key/uid (fallback generated)
 */
export function toPortfolioModalProject(raw: any): PortfolioModalProject {
  if (!raw || typeof raw !== "object") {
    throw new Error("PortfolioModal project must be an object");
  }

  // Identity & strings
  const id =
    raw.id ?? raw.slug ?? raw.key ?? raw.uid ?? Math.random().toString(36).slice(2);
  const title = raw.title ?? raw.name ?? raw.headline ?? "Untitled Project";

  const description = raw.description ?? raw.summary ?? raw.excerpt ?? raw.caption;
  const client = raw.client ?? raw.customer ?? raw.brand;
  const href = raw.href ?? raw.url ?? raw.link;

  // Tags (tolerant)
  const tags =
    Array.isArray(raw.tags) ? raw.tags.filter(Boolean)
    : Array.isArray(raw.labels) ? raw.labels.filter(Boolean)
    : undefined;

  // Metrics
  const metrics = coerceMetrics(raw.metrics);

  // Media src & type discovery across common fields
  const candidateSrc =
    raw.media?.src ??
    raw.mediaUrl ??
    raw.embedUrl ??
    raw.video?.src ??
    raw.image?.src ??
    raw.pdf?.src ??
    raw.url ??
    raw.src;

  const explicitType: PMediaType | undefined =
    raw.media?.type ??
    raw.mediaType ??
    raw.type ??
    (raw.video ? "video" : undefined) ??
    (raw.image ? "image" : undefined) ??
    (raw.pdf ? "pdf" : undefined);

  const type: PMediaType = explicitType ?? (candidateSrc ? inferMediaTypeFromUrl(candidateSrc) : "interactive");

  const poster = raw.media?.poster ?? raw.video?.poster ?? raw.poster;
  const alt = raw.media?.alt ?? raw.image?.alt ?? raw.alt ?? title;
  const media: PMedia = {
    type,
    src: candidateSrc || href || "",
    poster,
    alt,
    title: raw.media?.title ?? raw.image?.title ?? raw.video?.title,
  };

  const project: PortfolioModalProject = {
    id: String(id),
    title: String(title),
    description: description ? String(description) : undefined,
    client: client ? String(client) : undefined,
    href: href ? String(href) : undefined,
    tags,
    metrics,
    media,
  };

  // Validate tolerantly first (no-throw), then strict if needed
  const ok = parsePortfolioModalProject(project, false);
  if (ok) return ok;

  // salvage: ensure media.src isn't empty (fallback to href)
  if (!project.media.src && project.href) {
    project.media.src = project.href;
  }
  const second = parsePortfolioModalProject(project, false);
  if (second) return second;

  // throw with strict validation so callers get a clear error
  return parsePortfolioModalProject(project, true)!;
}

/** Convenience batch helper for galleries/collections. */
export function toPortfolioModalProjects(list: unknown[], strict = false): PortfolioModalProject[] {
  const out: PortfolioModalProject[] = [];
  for (const item of list || []) {
    try {
      out.push(toPortfolioModalProject(item));
    } catch {
      if (strict) throw;
      // otherwise skip invalid entries
    }
  }
  return out;
}
