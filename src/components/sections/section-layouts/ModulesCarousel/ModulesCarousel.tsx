// src/components/sections/section-layouts/ModulesCarousel/ModulesCarousel.tsx
"use client";

import React from "react";
import clsx from "clsx";
import { ModuleCard } from "./ModuleCard";
import type { ModulesSectionData } from "@/types/servicesTemplate.types";

type Props = ModulesSectionData & {
  className?: string;
};

export default function ModulesCarousel({
  title,
  subtitle,
  items,
  layout = "carousel",
  className,
}: Props) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const isGrid = layout === "grid";

  return (
    <section className={clsx("mx-auto max-w-[1200px] px-4 py-10", className)}>
      {(title || subtitle) && (
        <header className="mb-6 text-center">
          {title && (
            <h2 className="text-2xl font-semibold tracking-wide">{title}</h2>
          )}
          {subtitle && (
            <p className="mx-auto mt-2 max-w-[70ch] opacity-80">{subtitle}</p>
          )}
          <hr className="mx-auto mt-6 w-[min(680px,90%)] border-0 h-px bg-[color-mix(in_oklab,_var(--border-subtle,_rgba(255,255,255,.12))_90%,_transparent)]" />
        </header>
      )}

      {/* Carousel or Grid */}
      {isGrid ? (
        <ul
          role="list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((it) => (
            <li key={it.id || it.href}>
              <ModuleCard {...it} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex snap-x snap-mandatory gap-4 pb-2">
            {items.map((it) => (
              <ModuleCard key={it.id || it.href} {...it} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
