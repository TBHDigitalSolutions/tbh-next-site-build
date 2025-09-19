// Tolerant mappers from page-data → ServicesAndCapabilitiesExpandable props

import type { NormalizableInput, ServicesAndCapabilitiesExpandableProps, Pillar, InlineBullet, ExpandableItem, AnyCapabilitiesLike, LegacyCapabilitiesBlock } from "./types";

/* -------------------------- Type guards / helpers -------------------------- */

function isArray<T = unknown>(v: unknown): v is T[] {
  return Array.isArray(v);
}
function isObject(v: unknown): v is Record<string, any> {
  return v !== null && typeof v === "object";
}
function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}
function asStringArray(v: unknown): string[] | undefined {
  if (!v) return undefined;
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  return undefined;
}
function coerceDeliverables(d: unknown): string[] | undefined {
  if (!d) return undefined;
  if (Array.isArray(d)) return d.filter((x) => typeof x === "string") as string[];
  if (typeof d === "string") return [d];
  return undefined;
}

function hasOwn<T extends object>(obj: T, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** Determine if input already looks like our final props */
function isFinalProps(v: unknown): v is ServicesAndCapabilitiesExpandableProps {
  return isObject(v) && (
    hasOwn(v, "pillars") ||
    hasOwn(v, "bullets") ||
    hasOwn(v, "expandable")
  );
}

/* ----------------------------- Normalizers ----------------------------- */

function normalizePillars(src: unknown): Pillar[] | undefined {
  if (!isArray(src)) return undefined;

  const items: Pillar[] = [];

  for (const raw of src) {
    if (!isObject(raw)) continue;

    const title = asString(raw.title);
    if (!title) continue;

    const id = asString(raw.id) ?? slugify(title);
    const description = asString(raw.description);
    const deliverables = coerceDeliverables(raw.deliverables);
    const icon = (raw.icon ?? undefined) as Pillar["icon"];

    items.push({ id, title, description, deliverables, icon });
  }

  return items.length ? items : undefined;
}

function normalizeBullets(src: unknown): InlineBullet[] | undefined {
  if (!src) return undefined;

  const out: InlineBullet[] = [];

  if (isArray(src)) {
    for (const raw of src) {
      if (typeof raw === "string") {
        out.push({ label: raw });
        continue;
      }
      if (isObject(raw)) {
        const label = asString(raw.label) ?? asString(raw.title); // tolerate "title"
        if (!label) continue;
        out.push({ label, href: asString(raw.href) });
      }
    }
  }

  return out.length ? out : undefined;
}

function normalizeExpandable(src: unknown): ExpandableItem[] | undefined {
  if (!isArray(src)) return undefined;

  const out: ExpandableItem[] = [];

  for (const raw of src) {
    if (!isObject(raw)) continue;
    const title = asString(raw.title);
    if (!title) continue;

    const id = asString(raw.id) ?? slugify(title);
    const summary = asString(raw.summary);

    let details: string | string[] | undefined;
    if (typeof raw.details === "string") {
      details = raw.details;
    } else if (isArray(raw.details)) {
      details = raw.details.filter((x) => typeof x === "string") as string[];
    }

    let cta: ExpandableItem["cta"];
    if (isObject(raw.cta)) {
      const label = asString(raw.cta.label);
      const href = asString(raw.cta.href);
      if (label && href) cta = { label, href };
    }

    const tag = asString(raw.tag);

    out.push({ id, title, summary, details, cta, tag });
  }

  return out.length ? out : undefined;
}

/* ------------------------------ Entry points ------------------------------ */

/**
 * Accepts:
 * - Final props (passes through)
 * - { block: {...} } or raw capabilities-like object
 * - Objects that wrap capabilities under `capabilities`
 */
export function normalizeProps(input: NormalizableInput): ServicesAndCapabilitiesExpandableProps {
  // Already final?
  if (isFinalProps(input)) {
    // Ensure arrays are clean before returning
    return {
      ...input,
      pillars: normalizePillars((input as any).pillars),
      bullets: normalizeBullets((input as any).bullets),
      expandable: normalizeExpandable((input as any).expandable),
    };
  }

  // If consumer passed { block: ... }
  if (isObject(input) && hasOwn(input, "block")) {
    const block = (input as any).block;
    const analyticsId = (input as any).analyticsId;
    const className = (input as any).className;
    return fromAnyCapabilitiesLike(block, analyticsId, className);
  }

  // Otherwise, treat input as AnyCapabilitiesLike
  return fromAnyCapabilitiesLike(input as AnyCapabilitiesLike);
}

function fromAnyCapabilitiesLike(
  src: AnyCapabilitiesLike | unknown,
  analyticsId?: string,
  className?: string
): ServicesAndCapabilitiesExpandableProps {
  // Shape A: { capabilities: {...}, title?, description? }
  if (isObject(src) && "capabilities" in src && isObject((src as any).capabilities)) {
    const cap = (src as any).capabilities as LegacyCapabilitiesBlock;
    const title = asString(cap.title) ?? asString((src as any).title);
    const intro =
      asString(cap.description) ??
      asString(cap.intro) ??
      asString((src as any).description) ??
      asString((src as any).intro);

    return {
      title,
      intro,
      pillars: normalizePillars(cap.pillars),
      bullets: normalizeBullets(cap.bullets),
      expandable: normalizeExpandable(cap.expandable),
      analyticsId,
      className,
    };
  }

  // Shape B: direct capabilities-like object
  if (isObject(src)) {
    const cap = src as LegacyCapabilitiesBlock;
    return {
      title: asString(cap.title),
      intro: asString(cap.description) ?? asString(cap.intro),
      pillars: normalizePillars(cap.pillars),
      bullets: normalizeBullets(cap.bullets),
      expandable: normalizeExpandable(cap.expandable),
      analyticsId,
      className,
    };
  }

  // Fallback: empty props (component will render null)
  return {};
}

/* --------------------------------- Utils --------------------------------- */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}
