"use client";
import clsx from "clsx";
import styles from "./StackCategory.module.css";

type StackCategoryProps = {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function StackCategory({ title, subtitle, className, children }: StackCategoryProps) {
  const headingId = `${title.replace(/\s+/g, "-").toLowerCase()}-heading`;
  return (
    <section className={clsx(styles.wrapper, className)} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h3 id={headingId} className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
