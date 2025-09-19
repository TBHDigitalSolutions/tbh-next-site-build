// src/components/sections/Web-Dev/PortfolioDemo/Modal/ModalPortal.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";

/**
 * ModalPortal
 * ----------------------------------------------------------------------------
 * A robust portal for rendering modals into document.body (or a custom root).
 *
 * Features
 * - SSR-safe: renders nothing until mounted on the client.
 * - Creates (or reuses) a single root container by id (default: "modal-root").
 * - Per-modal host node for predictable stacking and cleanup.
 * - Optional background inerting (inert + aria-hidden) for accessibility.
 * - Global ref-count so multiple modals coexist without fighting over inert.
 *
 * Usage:
 *   <ModalPortal>
 *     <YourModal />
 *   </ModalPortal>
 *
 *   // With options:
 *   <ModalPortal rootId="modal-root" inertSiblings>
 *     <YourModal />
 *   </ModalPortal>
 */

export type ModalPortalProps = {
  children: React.ReactNode;
  /** The id of the shared root node appended to <body> (created if absent). */
  rootId?: string;
  /** When true (default), apply `inert` + `aria-hidden` to body children except the portal root. */
  inertSiblings?: boolean;
  /** Optional class for the per-modal host element */
  hostClassName?: string;
  /** Optional data-testid for E2E/integration tests */
  "data-testid"?: string;
};

// ----------------------- Module-level state (stacking) -----------------------

let globalStackCount = 0;
let savedSiblingsState:
  | Array<{ el: Element; ariaHidden: string | null; inertPresent: boolean }>
  | null = null;

/** Make all body children except `exceptEl` inert + aria-hidden (once). */
function inertBodySiblings(exceptEl: Element) {
  if (typeof document === "undefined") return;
  if (savedSiblingsState) return; // already inerted by another modal

  const siblings = Array.from(document.body.children).filter((el) => el !== exceptEl);
  savedSiblingsState = siblings.map((el) => {
    const prevAriaHidden = el.getAttribute("aria-hidden");
    const prevInertPresent = (el as HTMLElement).inert === true;
    (el as HTMLElement).inert = true;
    el.setAttribute("aria-hidden", "true");
    return { el, ariaHidden: prevAriaHidden, inertPresent: prevInertPresent };
  });
}

/** Restore body siblings to their previous state (when last modal closes). */
function restoreBodySiblings() {
  if (!savedSiblingsState) return;
  for (const { el, ariaHidden, inertPresent } of savedSiblingsState) {
    if (ariaHidden === null) el.removeAttribute("aria-hidden");
    else el.setAttribute("aria-hidden", ariaHidden);
    (el as HTMLElement).inert = inertPresent;
  }
  savedSiblingsState = null;
}

// ------------------------------- Component -----------------------------------

const ModalPortal: React.FC<ModalPortalProps> = ({
  children,
  rootId = "modal-root",
  inertSiblings = true,
  hostClassName,
  "data-testid": dataTestId,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const rootRef = React.useRef<HTMLElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  // Ensure there is a shared root element under <body> with the given id.
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    let root = document.getElementById(rootId) as HTMLElement | null;

    if (!root) {
      root = document.createElement("div");
      root.setAttribute("id", rootId);
      // Keep the root at the end of <body> for highest stacking by default
      document.body.appendChild(root);
    }

    // Create a per-modal host element to avoid sibling reordering for multiple modals
    const host = document.createElement("div");
    if (hostClassName) host.className = hostClassName;
    if (dataTestId) host.setAttribute("data-testid", dataTestId);

    root.appendChild(host);

    rootRef.current = root;
    hostRef.current = host;

    // Manage global stack + inerting
    globalStackCount += 1;
    if (inertSiblings && globalStackCount === 1) {
      inertBodySiblings(root);
      document.body.setAttribute("data-modal-open", "true");
    }

    setMounted(true);

    return () => {
      // Cleanup the host
      if (hostRef.current && hostRef.current.parentNode) {
        hostRef.current.parentNode.removeChild(hostRef.current);
      }
      hostRef.current = null;

      // If no more modals, restore siblings and attributes
      globalStackCount = Math.max(0, globalStackCount - 1);
      if (globalStackCount === 0) {
        if (inertSiblings) {
          restoreBodySiblings();
        }
        document.body.removeAttribute("data-modal-open");
      }

      // Do not remove the shared root; keep it for future modals
      rootRef.current = null;
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId, inertSiblings, hostClassName, dataTestId]);

  // SSR-safety: render nothing until mounted on the client
  if (!mounted || !hostRef.current) {
    return null;
  }

  return createPortal(children, hostRef.current);
};

export default ModalPortal;
