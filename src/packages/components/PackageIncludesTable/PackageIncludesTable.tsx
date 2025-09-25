"use client";

import * as React from "react";
import cls from "./PackageIncludesTable.module.css";

export type PackageInclude = { section: string; items: string[] };

export type PackageIncludesTableProps = {
  sections: PackageInclude[];
  /** Optional heading above the list */
  title?: string;
  /** Enable search */
  enableSearch?: boolean;
  /** Make sections collapsible (details/summary). */
  collapsible?: boolean;
  /** If collapsible, open this many sections initially (from top). Default: all. */
  initiallyOpenCount?: number;
  /** Compact paddings */
  dense?: boolean;
  /** Force all sections expanded when printing */
  printExpandAll?: boolean;
  /** Called when a section toggles open/closed */
  onToggleSection?: (section: string, open: boolean) => void;
  /** className/id passthrough */
  className?: string;
  id?: string;
};

function useInitialOpen(count: number | undefined, len: number) {
  if (!count || count >= len) return new Set(Array.from({ length: len }, (_, i) => i));
  return new Set(Array.from({ length: count }, (_, i) => i));
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  const before = text.slice(0, i);
  const hit = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <>
      {before}<mark className={cls.mark}>{hit}</mark>{after}
    </>
  );
}

export default function PackageIncludesTable({
  sections,
  title,
  enableSearch = false,
  collapsible = true,
  initiallyOpenCount,
  dense = false,
  printExpandAll = true,
  onToggleSection,
  className,
  id,
}: PackageIncludesTableProps) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<Set<number>>(() => useInitialOpen(initiallyOpenCount, sections.length));

  React.useEffect(() => {
    setOpen(useInitialOpen(initiallyOpenCount, sections.length));
  }, [initiallyOpenCount, sections.length]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections.map((s) => ({ ...s, _items: s.items }));
    return sections
      .map((s) => ({ ...s, _items: s.items.filter((it) => it.toLowerCase().includes(q)) }))
      .filter((s) => s._items.length > 0);
  }, [sections, query]);

  const allOpen = open.size === sections.length;

  const toggleAll = (nextOpen: boolean) => {
    const next = nextOpen ? new Set(Array.from({ length: sections.length }, (_, i) => i)) : new Set<number>();
    setOpen(next);
  };

  const onToggle = (idx: number, next: boolean, name: string) => {
    const s = new Set(open);
    if (next) s.add(idx); else s.delete(idx);
    setOpen(s);
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "includes_section_toggle", { section: name, open: next });
    }
    onToggleSection?.(name, next);
  };

  return (
    <section className={[cls.root, dense ? cls.dense : "", printExpandAll ? cls.printAll : "", className].filter(Boolean).join(" ")} id={id}>
      <div className={cls.toolbar}>
        {title && <h2 className={cls.title}>{title}</h2>}
        {enableSearch && (
          <div className={cls.search}>
            <svg className={cls.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <label className="sr-only" htmlFor="pkg-includes-search">Search features</label>
            <input
              id="pkg-includes-search"
              className={cls.searchInput}
              type="search"
              placeholder="Search features"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
        {collapsible && sections.length > 1 && (
          <div className={cls.controls} role="group" aria-label="Expand or collapse all sections">
            <button type="button" className={[cls.btn, cls.btnSecondary].join(" ")} onClick={() => toggleAll(true)} disabled={allOpen}>
              Expand all
            </button>
            <button type="button" className={cls.btn} onClick={() => toggleAll(false)} disabled={!allOpen}>
              Collapse all
            </button>
          </div>
        )}
      </div>

      <div className={cls.sections}>
        {filtered.map((sec, i) => {
          const idx = sections.findIndex((s) => s.section === sec.section);
          const isOpen = !collapsible || open.has(idx);
          const itemCount = sec._items ? sec._items.length : sec.items.length;
          const items = (sec as any)._items ?? sec.items;
          return (
            <details key={sec.section} className={cls.section} open={isOpen} onToggle={(e) => onToggle(idx, (e.target as HTMLDetailsElement).open, sec.section)}>
              <summary className={cls.summary}>
                <h3 className={cls.sectionTitle}>{sec.section}</h3>
                <span className={cls.count}>{itemCount}</span>
              </summary>
              <div className={cls.items}>
                <ul className={cls.list}>
                  {items.map((it: string, j: number) => (
                    <li key={j} className={cls.item}>{highlight(it, query)}</li>
                  ))}
                </ul>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

---

import * as React from "react";
import styles from "./PackageIncludesTable.module.css";

export type IncludeValue = boolean | "limit" | "add-on" | string | number;

export type Column = { id: string; label: string; note?: string };
export type Row = {
  id: string;
  label: string;
  note?: string;
  /** key is Column.id */
  values: Record<string, IncludeValue>;
};

export type PackageIncludesTableProps = {
  columns: Column[];
  rows: Row[];
  caption?: string;
  legend?: boolean; // show icon legend
  className?: string;
};

const Check = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}><path fill="currentColor" d="M16.7 5.7a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 10.1a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.3a1 1 0 0 1 1.9 0z"/></svg>
);
const X = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}><path fill="currentColor" d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 0 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z"/></svg>
);
const Minus = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}><path fill="currentColor" d="M4 10.5a.5.5 0 0 1 .5-.5h11a.5.5 0 1 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
);
const Plus = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}><path fill="currentColor" d="M10 4a.75.75 0 0 1 .75.75V9.25h4.5a.75.75 0 1 1 0 1.5h-4.5v4.5a.75.75 0 1 1-1.5 0v-4.5H4.25a.75.75 0 1 1 0-1.5h4.5V4.75A.75.75 0 0 1 10 4z"/></svg>
);

function renderValue(v: IncludeValue) {
  if (v === true) return <span className={`${styles.icon} ${styles.yes}`}><Check /></span>;
  if (v === false) return <span className={`${styles.icon} ${styles.no}`}><X /></span>;
  if (v === "limit") return <span className={`${styles.pill} ${styles.limited}`} title="Limited">{/* icon */}<Minus className={styles.inlineIcon}/><span>Limit</span></span>;
  if (v === "add-on") return <span className={`${styles.pill} ${styles.addon}`} title="Available as add-on"><Plus className={styles.inlineIcon}/><span>Add-on</span></span>;
  return <span className={styles.text}>{String(v)}</span>;
}

export default function PackageIncludesTable({
  columns,
  rows,
  caption,
  legend = true,
  className
}: PackageIncludesTableProps) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            <th className={styles.hFeature} scope="col">Feature</th>
            {columns.map(col => (
              <th key={col.id} className={styles.hTier} scope="col">
                <div className={styles.thInner}>
                  <span className={styles.tierLabel}>{col.label}</span>
                  {col.note ? <span className={styles.tierNote}>{col.note}</span> : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className={styles.featureCell}>
                <div className={styles.featureInner}>
                  <span className={styles.featureLabel}>{row.label}</span>
                  {row.note ? <span className={styles.featureNote}>{row.note}</span> : null}
                </div>
              </th>
              {columns.map((col) => (
                <td key={col.id} className={styles.valueCell}>
                  {renderValue(row.values[col.id] as IncludeValue)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {legend && (
        <div className={styles.legend} aria-label="Legend">
          <span className={styles.legendItem}><span className={`${styles.legendIcon} ${styles.yes}`}><Check/></span> Included</span>
          <span className={styles.legendItem}><span className={`${styles.legendIcon} ${styles.no}`}><X/></span> Not included</span>
          <span className={styles.legendItem}><span className={`${styles.legendIcon} ${styles.limited}`}><Minus/></span> Limited</span>
          <span className={styles.legendItem}><span className={`${styles.legendIcon} ${styles.addon}`}><Plus/></span> Add-on</span>
        </div>
      )}
    </div>
  );
}
