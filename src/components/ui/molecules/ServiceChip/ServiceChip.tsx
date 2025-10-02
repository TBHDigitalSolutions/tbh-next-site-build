// src/components/ui/molecules/ServiceChip/ServiceChip.tsx
"use client";

/**
 * ServiceChip
 * =============================================================================
 * Purpose
 * -------
 * A small pill with an icon + label representing a service taxonomy. Supports:
 *  - Static rendering (span)
 *  - Link rendering (a[href])
 *  - Interactive rendering (button with onClick)
 *
 * A11y
 * ----
 * - When rendered as <a>, we set role="link" and optionally aria-current="page".
 * - When rendered as <button>, we set aria-pressed for selected state.
 *
 * SSR/CSR
 * -------
 * - Marked as a client component because some usages pass `onClick`.
 */

import * as React from "react";
import styles from "./ServiceChip.module.css";

export type CoreService =
  | "webdev"
  | "seo"
  | "video"
  | "content"
  | "marketing"
  | "leadgen";

/** Allow custom service slugs too, while encouraging core names above */
export type ServiceSlug = CoreService | (string & {});

/** Visual style */
export type ServiceChipVariant = "solid" | "subtle" | "outline";
/** Density */
export type ServiceChipSize = "sm" | "md";

export type ServiceChipProps = {
  service: ServiceSlug;
  /** Visible label (fallback derived from `service`) */
  label?: string;
  /** Optional left icon (defaults to service icon) */
  icon?: React.ReactNode;
  /** Visual variant (default: subtle) */
  variant?: ServiceChipVariant;
  /** Size (default: md) */
  size?: ServiceChipSize;
  /** Selected state (for filters/toggles) */
  selected?: boolean;
  /** Disabled state (only for interactive) */
  disabled?: boolean;
  /** Render as anchor if provided */
  href?: string;
  /** Click handler → renders as <button> if provided (and no href) */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Title attribute / tooltip text */
  title?: string;
  /** Extra className or style */
  className?: string;
  style?: React.CSSProperties;
  /** Custom aria-label (if label is visually hidden elsewhere) */
  ariaLabel?: string;
};

const IconWeb = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h16V7H4zm3 9h4v-2H7v2z" fill="currentColor"/>
  </svg>
);

const IconSEO = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M10.5 3a7.5 7.5 0 1 0 4.8 13.3l4.2 4.2a1 1 0 0 0 1.4-1.4l-4.2-4.2A7.5 7.5 0 0 0 10.5 3zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11z" fill="currentColor"/>
  </svg>
);

const IconVideo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M4 6h11a2 2 0 0 1 2 2v1.6l3.3-1.9A1 1 0 0 1 22 8.6V15a1 1 0 0 1-1.7.7L17 13.8V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="currentColor"/>
  </svg>
);

const IconContent = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M6 4h12a1 1 0 0 1 1 1v14l-4-2-4 2-4-2-4 2V5a1 1 0 0 1 1-1zm1 4h10V6H7v2zm0 3h10V9H7v2zm0 3h6v-2H7v2z" fill="currentColor"/>
  </svg>
);

const IconMarketing = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M3 8a2 2 0 0 1 2-2h8l6-3v16l-6-3H5a2 2 0 0 1-2-2V8zm2 0v6h8.4l3.6 1.8V6.2L13.4 8H5z" fill="currentColor"/>
  </svg>
);

const IconLeadgen = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c4.4 0 8 2.2 8 5v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1c0-2.8 3.6-5 8-5z" fill="currentColor"/>
  </svg>
);

const defaultLabelMap: Record<CoreService, string> = {
  webdev: "Web Development",
  seo: "SEO",
  video: "Video",
  content: "Content",
  marketing: "Marketing",
  leadgen: "Lead Generation",
};

const defaultIconMap: Record<CoreService, React.ReactNode> = {
  webdev: <IconWeb className={styles.icon} />,
  seo: <IconSEO className={styles.icon} />,
  video: <IconVideo className={styles.icon} />,
  content: <IconContent className={styles.icon} />,
  marketing: <IconMarketing className={styles.icon} />,
  leadgen: <IconLeadgen className={styles.icon} />,
};

function serviceClass(service: ServiceSlug) {
  switch (service) {
    case "webdev": return styles.svcWebdev;
    case "seo": return styles.svcSeo;
    case "video": return styles.svcVideo;
    case "content": return styles.svcContent;
    case "marketing": return styles.svcMarketing;
    case "leadgen": return styles.svcLeadgen;
    default: return styles.svcCustom;
  }
}

export const ServiceChip: React.FC<ServiceChipProps> = ({
  service,
  label,
  icon,
  variant = "subtle",
  size = "md",
  selected = false,
  disabled = false,
  href,
  onClick,
  title,
  className,
  style,
  ariaLabel,
}) => {
  const isAnchor = !!href;
  const isButton = !href && !!onClick;

  const baseClass = [
    styles.chip,
    styles[variant],
    styles[size],
    serviceClass(service),
    selected ? styles.selected : "",
    (isButton || isAnchor) ? styles.interactive : "",
    className,
  ].filter(Boolean).join(" ");

  const content = (
    <>
      <span className={styles.iconWrap} aria-hidden="true">
        {icon ?? (defaultIconMap as Record<string, React.ReactNode>)[service] ?? <span className={styles.fallbackDot} />}
      </span>
      <span className={styles.text}>
        {label ?? (defaultLabelMap as Record<string, string>)[service] ?? String(service)}
      </span>
    </>
  );

  const commonProps = {
    className: baseClass,
    style,
    title,
    "aria-label": ariaLabel,
  } as const;

  if (isAnchor) {
    return (
      <a
        {...commonProps}
        href={href}
        role="link"
        aria-current={selected ? "page" : undefined}
      >
        {content}
      </a>
    );
  }

  if (isButton) {
    return (
      <button
        {...commonProps}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected || undefined}
      >
        {content}
      </button>
    );
  }

  // Non-interactive
  return <span {...commonProps}>{content}</span>;
};

export default ServiceChip;
