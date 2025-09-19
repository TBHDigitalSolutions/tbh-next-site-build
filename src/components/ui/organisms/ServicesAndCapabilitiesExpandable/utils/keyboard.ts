/**
 * Keyboard helpers for roving focus & common activation keys.
 */

export type RovingHandlers = {
  onArrowPrev(): void;
  onArrowNext(): void;
  onHome(): void;
  onEnd(): void;
  onActivate(): void; // Enter/Space
};

/**
 * Handle roving focus keys for header buttons in an accordion/list.
 * Call inside onKeyDown of the focusable header.
 */
export function handleRovingKeyDown(
  e: React.KeyboardEvent,
  handlers: RovingHandlers
) {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowLeft":
      e.preventDefault();
      handlers.onArrowPrev();
      break;
    case "ArrowDown":
    case "ArrowRight":
      e.preventDefault();
      handlers.onArrowNext();
      break;
    case "Home":
      e.preventDefault();
      handlers.onHome();
      break;
    case "End":
      e.preventDefault();
      handlers.onEnd();
      break;
    case " ":
    case "Enter":
      e.preventDefault();
      handlers.onActivate();
      break;
    default:
      break;
  }
}

/** True if key should trigger click-like behavior */
export function isActivationKey(e: React.KeyboardEvent) {
  return e.key === " " || e.key === "Enter";
}

/** Utility to cycle an index within [0, count-1] */
export function cycleIndex(current: number, delta: number, count: number) {
  if (count <= 0) return 0;
  const next = (current + delta + count) % count;
  return next;
}
