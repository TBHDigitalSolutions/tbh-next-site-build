// src/components/services/GrowthPackagesCTA/GrowthPackagesCTA.tsx
"use client";

import * as React from "react";
import Button from "@/components/ui/atoms/Button/Button";
import styles from "./GrowthPackagesCTA.module.css";

export default function GrowthPackagesCTA() {
  return (
    <section className={styles.strip} aria-labelledby="growth-packages-title">
      <div className={styles.inner}>
        <div className={styles.content}>
          <h2 id="growth-packages-title" className={styles.title}>
            View Our Growth Packages
          </h2>
          <p className={styles.subtitle}>
            Bundled services that solve real business needs with transparent pricing.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            href="/packages"
            ariaLabel="Explore Growth Packages"
            className={styles.button}
            variant="primary"
            size="md"
          >
            Explore Packages
          </Button>
        </div>
      </div>
    </section>
  );
}
