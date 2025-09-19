// ===================================================================
// /src/components/portfolio/UniversalPortfolioModal/adapters.ts
// ===================================================================
// Tolerant adapters to normalize arbitrary portfolio item shapes into
// the modal's unified ModalProject contract.
// - Coerces metrics to strings
// - Infers media type when missing (by extension / hints)
// - Fills minimal safe defaults
// ===================================================================

import type {
  ModalMedia,
  ModalMediaType,
  ModalMetric,
  ModalProject,
} from "./UniversalPortfolioModal.types";
import { parseModalProject } from "./utils/universalPortfolioModalValidator";

// ----------------------------
// Media helpers
// ----------------------------

function inferMediaTypeFromUrl(url: string): ModalMediaType {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf")) return "pdf";
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/.test(u)) return "video";
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/.test(u)) return "image";
  return "interactive"; // default to interactive (e.g., embeds, sandboxes, demos)
}

function pickFirstNonEmpty(...vals: Array<string | undefined>): string | undefined {
  for (const v of vals) {
    if (v && v.trim().length > 0) return v;
  }
  return undefined;
}

// ----------------------------
// Core normalizer
// ----------------------------

/**
 * Normalize unknown project-like input to ModalProject.
 * Accepts a wide range of shapes:
 *  - { id, title, description, client, href, tags, metrics, media: { type, src, poster, alt } }
 *  - alternate field names e.g. thumbnail, image, video, pdf, embed, url
 *  - metrics with numeric values (coerced to strings)
 */
export function toModalProject(raw: any): ModalProject {
  if (!raw || typeof raw !== "object") {
    throw new Error("Modal project must be an object");
  }

  // --- Basic identity fields ---
  const id: string =
    raw.id ??
    raw.slug ??
    raw.key ??
    raw.uid ??
    Math.random().toString(36).slice(2);
  const title: string =
    raw.title ?? raw.name ?? raw.headline ?? "Untitled Project";

  const description: string | undefined =
    raw.description ?? raw.summary ?? raw.excerpt ?? raw.caption;
  const client: string | undefined = raw.client ?? raw.customer ?? raw.brand;
  const href: string | undefined = raw.href ?? raw.url ?? raw.link;

  // --- Tags (tolerant) ---
  const tags: string[] | undefined = Array.isArray(raw.tags)
    ? raw.tags.filter(Boolean)
    : Array.isArray(raw.labels)
    ? raw.labels.filter(Boolean)
    : undefined;

  // --- Metrics (coerce to strings, allow {label,value} or [value,label] forms) ---
  let metrics: ModalMetric[] | undefined;
  if (Array.isArray(raw.metrics)) {
    metrics = raw.metrics
      .map((m: any) => {
        if (m && typeof m === "object" && "label" in m) {
          return { label: String(m.label), value: String((m as any).value ?? "") };
        }
        // tuple-ish support: ["98%", "Client Satisfaction"]
        if (Array.isArray(m) && m.length >= 2) {
          return { label: String(m[1]), value: String(m[0]) };
        }
        return null;
      })
      .filter(Boolean) as ModalMetric[];
  }

  // --- Media detection (tolerant) ---
  // Accept a bunch of common fields for media sources
  const mediaSrc: string | undefined =
    raw.media?.src ??
    raw.mediaUrl ??
    raw.embedUrl ??
    raw.video?.src ??
    raw.image?.src ??
    raw.pdf?.src ??
    raw.url ??
    raw.src;

  // Determine media type (prefer explicit)
  const explicitType: ModalMediaType | undefined =
    raw.media?.type ??
    raw.type ??
    raw.mediaType ??
    (raw.video ? "video" : undefined) ??
    (raw.image ? "image" : undefined) ??
    (raw.pdf ? "pdf" : undefined);

  const type: ModalMediaType =
    explicitType ?? (mediaSrc ? inferMediaTypeFromUrl(mediaSrc) : "interactive");

  const poster: string | undefined =
    raw.media?.poster ?? raw.video?.poster ?? raw.poster;

  const alt: string | undefined =
    raw.media?.alt ??
    raw.image?.alt ??
    pickFirstNonEmpty(raw.alt, raw.title, raw.name, raw.caption);

  const media: ModalMedia = {
    type,
    src: mediaSrc || href || "", // ensure non-empty; validator will catch empty if strict
    poster,
    alt,
  };

  const project: ModalProject = {
    id: String(id),
    title: String(title),
    description: description ? String(description) : undefined,
    client: client ? String(client) : undefined,
    href: href ? String(href) : undefined,
    tags,
    metrics,
    media,
  };

  // Run tolerant validation (non-throwing) to ensure shape is sound
  const validated = parseModalProject(project, /* strict */ false);
  if (validated) return validated;

  // If the tolerant parse failed (e.g., empty media.src), try to salvage:
  if (!project.media.src) {
    project.media.src = project.href || "";
  }

  const secondTry = parseModalProject(project, false);
  if (secondTry) return secondTry;

  // If still invalid, throw a clear error for the caller
  // (Callers can catch and display a fallback UI.)
  return parseModalProject(project, /* strict */ true)!;
}

/**
 * Batch helper for lists (e.g., galleries).
 * Invalid entries are filtered out in non-strict mode.
 */
export function toModalProjects(rawList: unknown[], strict = false): ModalProject[] {
  const out: ModalProject[] = [];
  for (const raw of rawList || []) {
    try {
      out.push(toModalProject(raw));
    } catch {
      if (strict) throw;
      // else skip invalid entry
    }
  }
  return out;
}
