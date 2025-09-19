// ================================================================
// Path: src/components/services/ServicesNavigation.tsx
// Client component for services navigation with active state management
// ================================================================

"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "../services.layout.module.css";

// --- Service configuration ---
interface ServiceLink {
  href: string;
  label: string;
  key: string;
  description: string;
  icon: string;
}

const SERVICE_LINKS: ServiceLink[] = [
  { 
    href: "/video-production", 
    label: "Video Production", 
    key: "video-production",
    description: "Professional video content from concept to delivery",
    icon: "videocam"
  },
  { 
    href: "/content-production", 
    label: "Content Production", 
    key: "content-production",
    description: "Editorial content that drives engagement and conversions",
    icon: "create"
  },
  { 
    href: "/web-development", 
    label: "Web Development", 
    key: "web-development",
    description: "Fast, scalable websites built with modern technologies",
    icon: "code-slash"
  },
  { 
    href: "/marketing-automation", 
    label: "Marketing Automation", 
    key: "marketing-automation",
    description: "Intelligent automation that nurtures leads and drives growth",
    icon: "git-branch"
  },
  { 
    href: "/seo-services", 
    label: "SEO Services", 
    key: "seo-services",
    description: "Comprehensive SEO strategies that drive organic traffic",
    icon: "trending-up"
  },
  { 
    href: "/lead-generation", 
    label: "Lead Generation", 
    key: "lead-generation",
    description: "Data-driven campaigns that convert prospects into customers",
    icon: "magnet"
  }
];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ServicesNavigation() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Find the current service for mobile display
  const currentService = SERVICE_LINKS.find(link => 
    pathname?.startsWith(link.href)
  );

  return (
    <nav aria-label="Services Navigation" className={styles.servicesNavigation}>
      {/* Mobile Navigation */}
      <div className={styles.mobileNav}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.mobileNavButton}
          aria-expanded={isExpanded}
          aria-haspopup="true"
        >
          <div className={styles.mobileNavCurrent}>
            {currentService && (
              <ion-icon name={currentService.icon} className={styles.mobileNavIcon}></ion-icon>
            )}
            <span className={styles.mobileNavLabel}>
              {currentService?.label || "Select Service"}
            </span>
          </div>
          <ion-icon 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            className={styles.mobileNavChevron}
          ></ion-icon>
        </button>
        
        {isExpanded && (
          <div className={styles.mobileNavDropdown}>
            {SERVICE_LINKS.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={classNames(
                    styles.mobileNavLink,
                    isActive && styles.mobileNavLinkActive
                  )}
                  onClick={() => setIsExpanded(false)}
                >
                  <ion-icon name={link.icon} className={styles.mobileNavLinkIcon}></ion-icon>
                  <div className={styles.mobileNavLinkContent}>
                    <div className={styles.mobileNavLinkTitle}>{link.label}</div>
                    <div className={styles.mobileNavLinkDesc}>{link.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className={styles.desktopNav}>
        <div className={styles.desktopNavGrid}>
          {SERVICE_LINKS.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                className={classNames(
                  styles.desktopNavCard,
                  isActive && styles.desktopNavCardActive
                )}
              >
                <div className={styles.desktopNavCardHeader}>
                  <div className={classNames(
                    styles.desktopNavCardIcon,
                    isActive && styles.desktopNavCardIconActive
                  )}>
                    <ion-icon name={link.icon}></ion-icon>
                  </div>
                  <div className={styles.desktopNavCardTitle}>{link.label}</div>
                </div>
                <p className={styles.desktopNavCardDesc}>
                  {link.description}
                </p>
                {isActive && (
                  <div className={styles.desktopNavCardIndicator}></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}