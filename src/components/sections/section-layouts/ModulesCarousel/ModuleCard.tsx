// src/components/sections/section-layouts/ModulesCarousel/ModuleCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/atoms/Button/Button";
import type { ModuleCardItem } from "@/types/servicesTemplate.types";

type Props = ModuleCardItem & { className?: string };

export function ModuleCard({
  title,
  description,
  href,
  badge,
  icon,
  image,
  cta,
  className = "",
}: Props) {
  return (
    <article
      className={[
        "group relative w-[18rem] shrink-0 snap-start overflow-hidden rounded-2xl",
        "border border-[color-mix(in_oklab,_var(--border-subtle,_rgba(255,255,255,.12))_92%,_transparent)]",
        "bg-[linear-gradient(180deg,_rgba(255,255,255,.06),_rgba(255,255,255,.04))]",
        "shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-transform duration-200 hover:-translate-y-0.5",
        className,
      ].join(" ")}
    >
      {/* Media */}
      <div className="relative aspect-[16/9] w-full">
        {image?.src ? (
          <Image
            src={image.src}
            alt={image.alt || ""}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 288px"
            priority={false}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-4xl opacity-80">
            {typeof icon === "string" ? icon : icon ?? "🧩"}
          </div>
        )}

        {badge && (
          <span className="absolute right-2 top-2 rounded-full border bg-black/40 px-2 py-0.5 text-xs text-white backdrop-blur">
            {badge}
          </span>
        )}
      </div>

      {/* Content (consistent layout across all cards) */}
      <div
        className={[
          // 3-row grid: title (auto) / description (flex 1) / cta (auto)
          "grid h-full grid-rows-[auto,1fr,auto] gap-3 p-4",
        ].join(" ")}
      >
        {/* Title — always single line */}
        <h3
          className="truncate text-base font-semibold leading-tight group-hover:underline"
          title={title}
        >
          {title}
        </h3>

        {/* Description — clamp to 3 lines, set a min-height so cards align */}
        {description ? (
          <p className="line-clamp-3 min-h-[3.5rem] text-sm opacity-80">
            {description}
          </p>
        ) : (
          // Keep height even if missing description
          <div className="min-h-[3.5rem]" />
        )}

        {/* CTA */}
        <div className="mt-1 self-start">
          <Button
            href={href}
            variant="secondary"
            size="sm"
            aria-label={cta?.ariaLabel || `${title} – open`}
            className="relative z-10" // ensure it sits above the stretched link
          >
            {cta?.label || "Explore"}
          </Button>
        </div>
      </div>

      {/* Whole-card stretched link (kept below CTA via z-index) */}
      <Link
        href={href}
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 z-0"
      >
        <span className="sr-only">{title}</span>
      </Link>
    </article>
  );
}

export default ModuleCard;
