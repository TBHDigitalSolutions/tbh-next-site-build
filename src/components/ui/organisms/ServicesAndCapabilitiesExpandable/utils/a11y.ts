/**
 * A11y helpers for accordion button/panel pairs.
 */

export function makeId(prefix: string, id: string | number, suffix: string) {
  return `${prefix}-${String(id)}-${suffix}`;
}

export function buttonAriaProps(btnId: string, panelId: string, expanded: boolean) {
  return {
    id: btnId,
    "aria-controls": panelId,
    "aria-expanded": expanded,
  } as const;
}

export function panelAriaProps(panelId: string, btnId: string) {
  return {
    id: panelId,
    role: "region",
    "aria-labelledby": btnId,
  } as const;
}

/**
 * Safely derive IDs for a header/panel pair.
 * - prefix: stable namespace per component (e.g., "expb")
 * - rawId: item.id or index fallback
 */
export function derivePairIds(prefix: string, rawId: string | number) {
  const safe = String(rawId);
  const btnId = makeId(prefix, safe, "btn");
  const panelId = makeId(prefix, safe, "panel");
  return { btnId, panelId };
}
