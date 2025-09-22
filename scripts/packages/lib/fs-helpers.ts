/**
 * scripts/packages/lib/fs-helpers.ts
 *
 * Small, framework-agnostic filesystem helpers for the packages build tools.
 * All functions are Promise-based and safe to use in Node 18+.
 *
 * NOTE: This file intentionally avoids glob strings inside comments that might
 * accidentally contain the substring that closes block comments.
 */

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";

/* ----------------------------------------------------------------------------
 * Existence / stats
 * --------------------------------------------------------------------------*/

/** Return true if a path exists (file or directory). */
export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Safe stat: returns the Stats object or null if the path does not exist. */
export async function statSafe(p: string): Promise<import("node:fs").Stats | null> {
  try {
    return await fs.stat(p);
  } catch {
    return null;
  }
}

/* ----------------------------------------------------------------------------
 * Directory helpers
 * --------------------------------------------------------------------------*/

/** Ensure a directory exists (mkdir -p). */
export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Ensure the parent directory for a file exists. */
export async function ensureParentDir(filePath: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
}

/* ----------------------------------------------------------------------------
 * JSON helpers
 * --------------------------------------------------------------------------*/

/**
 * Read and parse JSON with a helpful error message.
 * Optionally pass a reviver to JSON.parse.
 */
export async function readJson<T = unknown>(filePath: string, reviver?: (this: any, key: string, value: any) => any): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  try {
    return JSON.parse(raw, reviver) as T;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to parse JSON at ${filePath}\n${msg}`);
  }
}

/** Write pretty JSON with trailing newline. Creates parent dirs if needed. */
export async function writeJson(filePath: string, data: unknown, spaces = 2): Promise<void> {
  await ensureParentDir(filePath);
  const payload = JSON.stringify(data, null, spaces) + "\n";
  await fs.writeFile(filePath, payload, "utf8");
}

/**
 * Write JSON atomically:
 * - Writes to a temp file in the same directory
 * - Renames over the target to minimize partial-file states
 */
export async function writeJsonAtomic(filePath: string, data: unknown, spaces = 2): Promise<void> {
  await ensureParentDir(filePath);
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const tmp = path.join(dir, `.${base}.${process.pid}.${Date.now()}.tmp`);
  const payload = JSON.stringify(data, null, spaces) + "\n";
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, filePath);
}

/**
 * Write JSON only if content changed (reduces noisy rebuilds / git diffs).
 * Returns true when a write occurred, false when skipped.
 */
export async function writeJsonIfChanged(filePath: string, data: unknown, spaces = 2): Promise<boolean> {
  const next = JSON.stringify(data, null, spaces) + "\n";
  const existed = await pathExists(filePath);
  if (existed) {
    const prev = await fs.readFile(filePath, "utf8");
    if (prev === next) return false;
  }
  await writeJsonAtomic(filePath, data, spaces);
  return true;
}

/* ----------------------------------------------------------------------------
 * Text helpers
 * --------------------------------------------------------------------------*/

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf8");
}

export async function writeText(filePath: string, content: string): Promise<void> {
  await ensureParentDir(filePath);
  await fs.writeFile(filePath, content, "utf8");
}

/**
 * Write text only if changed. Returns true when a write occurred.
 */
export async function writeTextIfChanged(filePath: string, content: string): Promise<boolean> {
  const existed = await pathExists(filePath);
  if (existed) {
    const prev = await fs.readFile(filePath, "utf8");
    if (prev === content) return false;
  }
  await writeText(filePath, content);
  return true;
}

/* ----------------------------------------------------------------------------
 * Glob helpers
 * --------------------------------------------------------------------------*/

/**
 * List files matching one or more glob patterns.
 * Defaults are appropriate for content scanning: files only, unique, no dotfiles.
 */
export async function globFiles(patterns: string | readonly string[], options: fg.Options = {}): Promise<string[]> {
  return fg(patterns as any, {
    onlyFiles: true,
    unique: true,
    dot: false,
    followSymbolicLinks: true,
    ...options,
  });
}

/* ----------------------------------------------------------------------------
 * Misc convenience
 * --------------------------------------------------------------------------*/

/** Convert a file's mtime to a YYYY-MM-DD string. */
export async function fileMtimeYYYYMMDD(filePath: string): Promise<string> {
  const st = await fs.stat(filePath);
  return new Date(st.mtime).toISOString().slice(0, 10);
}

/**
 * Normalize a date-like input to YYYY-MM-DD or return null when invalid.
 * Accepts ISO strings or already-normalized values.
 */
export function toYYYYMMDD(input?: string | Date | null): string | null {
  if (!input) return null;
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isFinite(d.getTime())) return d.toISOString().slice(0, 10);
  if (typeof input === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
    if (m) return input.trim();
  }
  return null;
}
