"use client";
import Image from "next/image";
import clsx from "clsx";
import styles from "./TechItem.module.css";
import type { Tech } from "./TechStack.types";

type TechItemProps = {
  tech: Tech;
  showExperience?: boolean;
  showProjectCounts?: boolean;
  className?: string;
};

export default function TechItem({
  tech,
  showExperience = true,
  showProjectCounts = true,
  className,
}: TechItemProps) {
  return (
    <article className={clsx(styles.card, tech.featured && styles.featured, className)} role="listitem">
      {tech.logo && (
        <Image
          src={tech.logo}
          alt={tech.name}
          width={40}
          height={40}
          className={styles.logo}
        />
      )}
      <h3 className={styles.title}>{tech.name}</h3>
      <div className={styles.meta}>
        <span className={styles.badge}>{tech.category}</span>
        {showExperience && tech.experience && <span className={styles.badge}>{tech.experience}</span>}
        {showProjectCounts && typeof tech.projects === "number" && (
          <span className={styles.badge}>{tech.projects} projects</span>
        )}
        {tech.expertise && <span className={styles.badge}>{tech.expertise}</span>}
      </div>
      {tech.link && (
        <a href={tech.link} className={styles.link} aria-label={`Open ${tech.name} docs`}>
          Docs
        </a>
      )}
    </article>
  );
}
