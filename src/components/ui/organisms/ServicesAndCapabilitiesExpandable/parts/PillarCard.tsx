// src/components/sections/ServicesAndCapabilities/PillarCard.tsx
"use client";

import React from "react";
import styles from "./PillarCard.module.css";

// ⬇️ Replace with your preferred icon set if needed
import {
  ClipboardList,
  Video,
  Scissors,
  Palette,
  Zap,
  Share2,
  Building2,
  Megaphone,
  CalendarDays,
  Lightbulb,
} from "lucide-react";

type IconProp = string | React.ReactNode;

export type PillarCardProps = {
  title: string;
  description: string;
  icon?: IconProp;        // ← now supports name or node
  bullets?: string[];
};

const ICON_MAP: Record<string, React.ReactNode> = {
  // service pillars
  clipboard: <ClipboardList aria-hidden="true" />,
  videocam: <Video aria-hidden="true" />,
  cut: <Scissors aria-hidden="true" />,
  "color-palette": <Palette aria-hidden="true" />,
  flash: <Zap aria-hidden="true" />,
  "share-social": <Share2 aria-hidden="true" />,

  // (optional) capabilities/use-cases if reused
  business: <Building2 aria-hidden="true" />,
  megaphone: <Megaphone aria-hidden="true" />,
  calendar: <CalendarDays aria-hidden="true" />,
  bulb: <Lightbulb aria-hidden="true" />,
};

function renderIcon(icon?: IconProp) {
  if (!icon) return null;
  if (React.isValidElement(icon)) return icon;
  if (typeof icon === "string") {
    const key = icon.trim().toLowerCase();
    return ICON_MAP[key] ?? null;
  }
  return null;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, description, icon, bullets = [] }) => {
  const topBullets = bullets.slice(0, 3);
  const IconEl = renderIcon(icon);

  return (
    <article className={styles.card}>
      {IconEl && (
        <span className={styles.icon} aria-hidden="true">
          {IconEl}
        </span>
      )}

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>

      {topBullets.length > 0 && (
        <ul className={styles.list}>
          {topBullets.map((b, i) => (
            <li key={`${title}-bullet-${i}`}>{b}</li>
          ))}
        </ul>
      )}
    </article>
  );
};

export default PillarCard;
