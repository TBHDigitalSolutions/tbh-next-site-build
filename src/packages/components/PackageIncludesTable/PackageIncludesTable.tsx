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