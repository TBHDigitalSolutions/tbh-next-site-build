// src/packages/lib/narrative.ts

/** Canonical narrative keys (compiled HTML). */
export const NARRATIVE_KEYS = {
  purpose: "purposeHtml",
} as const;

type AnyRec = Record<string, unknown>;

export function hasPurpose(n?: AnyRec): boolean {
  const v = n?.[NARRATIVE_KEYS.purpose];
  return typeof v === "string" && v.trim().length > 0;
}

/** Returns a trimmed string or undefined (safe to pass to dangerouslySetInnerHTML). */
export function htmlOrUndefined(s?: string | null): string | undefined {
  if (!s) return undefined;
  const t = String(s).trim();
  return t.length ? t : undefined;
}
