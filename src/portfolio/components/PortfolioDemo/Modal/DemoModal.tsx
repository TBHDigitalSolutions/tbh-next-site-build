// src/components/ui/organisms/PortfolioDemo/Modal/DemoModal.tsx
"use client";

import React, { useMemo, useEffect, useCallback } from 'react';
import { UniversalPortfolioModal } from '@/portfolio/components/UniversalPortfolioModal/UniversalPortfolioModal';
import type { Project, CategorySlug, MediaType } from "@/portfolio/components/types";

// --- Safe placeholder + warnOnce utility ------------------------------------

const PLACEHOLDER_SRC = '/placeholder-demo.html';

// Deduped console.warn so we don't spam the console in carousels, etc.
const warned = new Set<string>();
function warnOnce(key: string, message: string) {
  if (warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
} 

/**
 * Force a valid media src. If empty/invalid, normalize to a predictable,
 * safe interactive placeholder so the modal always renders something.
 */
function withSafeSrc<T extends { id?: string; title?: string }>(
  base: Omit<Project, 'media'> & { media: { type: MediaType; src: string; poster?: string; alt?: string; thumbnail?: string } },
  warnKey: string
): Project {
  let { type, src, poster, alt, thumbnail } = base.media;

  if (!src || typeof src !== 'string' || src.trim() === '') {
    warnOnce(
      warnKey,
      `DemoModal: Missing media.src for "${base.title ?? base.id ?? 'unknown'}". Injecting placeholder: ${PLACEHOLDER_SRC}`
    );
    type = 'interactive';
    src = PLACEHOLDER_SRC;
    // keep poster/alt/thumbnail if present; alt fallback to title below
  }

  return {
    ...base,
    media: {
      type,
      src,
      poster,
      alt: alt || base.title,
      thumbnail
    },
    // Light hint for debugging/analytics
    tags: base.tags ? Array.from(new Set([...base.tags, 'placeholder-safe-media'])) : ['placeholder-safe-media'],
    href: base.href ?? (src !== PLACEHOLDER_SRC ? src : undefined),
  };
}

// --- Legacy types kept for back-compat --------------------------------------

interface LegacyWebDevItem {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  timeline?: string;
  technologies?: string[];
  url?: string;
  client?: string;
}

interface LegacyDemo {
  id: string;
  title: string;
  description?: string;
  client?: string;
  tags?: string[];
  category?: string;
  media?: {
    type: string;
    src: string;
    poster?: string;
    alt?: string;
    thumbnail?: string;
  };
  metrics?: Array<{ label: string; value: string }>;
  featured?: boolean;
  priority?: number;
  href?: string;
  // Legacy URL properties
  demoUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  url?: string;
  // Web-dev specific
  technologies?: string[];
  timeline?: string;
}

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;

  // New format props
  project?: Project;
  demo?: LegacyDemo;
  onPrevious?: () => void;

  // Legacy format props
  item?: LegacyWebDevItem;
  onPrev?: () => void;

  // Common
  onNext?: () => void;
  index?: number;
  total?: number;
  showNavigation?: boolean;

  // Legacy iframe/behavior props (warned in dev)
  closeOnBackdrop?: boolean;
  blockDetectMs?: number;
  srcOverride?: string;
  sandbox?: string;
  allow?: string;
  ariaLabel?: string;
  'data-testid'?: string;

  // Analytics callbacks
  onModalOpen?: (project: Project) => void;
  onModalClose?: (project: Project) => void;
  onMediaLoad?: (project: Project) => void;
  onMediaError?: (project: Project, error: string) => void;
}

// --- Converters with safe guards --------------------------------------------

const convertLegacyWebDevItem = (
  item: LegacyWebDevItem,
  options: { srcOverride?: string; sandbox?: string; allow?: string } = {}
): Project => {
  const src = options.srcOverride || item.url || '';

  const tags: string[] = [];
  if (item.technologies) tags.push(...item.technologies);
  if (item.category) tags.push(item.category);
  if (item.timeline) tags.push(item.timeline);

  const base: Omit<Project, 'media'> & {
    media: { type: MediaType; src: string; poster?: string; alt?: string; thumbnail?: string };
  } = {
    id: item.id || 'legacy-item',
    title: item.title || 'Demo Project',
    category: 'web-development',
    media: {
      type: 'interactive',
      src,
      alt: item.title || 'Interactive demo'
    },
    description: item.description,
    client: item.client,
    tags: tags.length > 0 ? tags : undefined,
    href: src
  };

  // Ensure safe src (warn once)
  return withSafeSrc(base, `legacy-webdev:${base.id}`);
};

const convertLegacyDemo = (demo: LegacyDemo): Project => {
  // Choose media from legacy fields
  let mediaType: MediaType = 'interactive';
  let mediaSrc = '';
  let poster: string | undefined;
  let alt: string | undefined;
  let thumbnail: string | undefined;

  if (demo.media) {
    mediaType = demo.media.type as MediaType;
    mediaSrc = demo.media.src;
    poster = demo.media.poster;
    alt = demo.media.alt;
    thumbnail = demo.media.thumbnail;
  } else {
    if (demo.videoUrl) {
      mediaType = 'video';
      mediaSrc = demo.videoUrl;
    } else if (demo.demoUrl || demo.url) {
      mediaType = 'interactive';
      mediaSrc = demo.demoUrl || demo.url || '';
    } else if (demo.pdfUrl) {
      mediaType = 'pdf';
      mediaSrc = demo.pdfUrl;
    } else if (demo.imageUrl) {
      mediaType = 'image';
      mediaSrc = demo.imageUrl;
    }
  }

  // Map loose legacy categories → canonical slugs
  let category: CategorySlug = 'web-development';
  if (demo.category) {
    const categoryMap: Record<string, CategorySlug> = {
      'web': 'web-development',
      'web-development': 'web-development',
      'video': 'video-production',
      'video-production': 'video-production',
      'seo': 'seo-services',
      'seo-services': 'seo-services',
      'marketing': 'marketing-automation',
      'marketing-automation': 'marketing-automation',
      'content': 'content-production',
      'content-production': 'content-production',
      'leadgen': 'lead-generation',
      'lead-generation': 'lead-generation',
    };
    category = categoryMap[demo.category.toLowerCase()] || 'web-development';
  }

  const tags: string[] = [];
  if (demo.tags) tags.push(...demo.tags);
  if (demo.technologies) tags.push(...demo.technologies);
  if (demo.timeline) tags.push(demo.timeline);

  const base: Omit<Project, 'media'> & {
    media: { type: MediaType; src: string; poster?: string; alt?: string; thumbnail?: string };
  } = {
    id: demo.id,
    title: demo.title,
    category,
    media: {
      type: mediaType,
      src: mediaSrc,
      poster,
      alt: alt || demo.title,
      thumbnail
    },
    description: demo.description,
    client: demo.client,
    tags: tags.length > 0 ? tags : undefined,
    metrics: demo.metrics,
    featured: demo.featured,
    priority: demo.priority,
    href: demo.href || demo.demoUrl || demo.url
  };

  // Ensure safe src (warn once)
  return withSafeSrc(base, `legacy-demo:${base.id}`);
};

// --- Component ---------------------------------------------------------------

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  project,
  demo,
  item,
  index,
  total,
  onPrevious,
  onPrev,
  onNext,
  showNavigation = true,

  // Legacy props (warn in dev)
  closeOnBackdrop,
  blockDetectMs,
  srcOverride,
  sandbox,
  allow,
  ariaLabel,
  'data-testid': dataTestId,

  // Analytics
  onModalOpen,
  onModalClose,
  onMediaLoad,
  onMediaError
}) => {
  // Normalize to a Project (with safe src injected when needed)
  const modalProject = useMemo<Project>(() => {
    if (project) {
      // If someone passes a new-style project with empty src, still guard.
      return withSafeSrc(
        {
          ...project,
          media: {
            ...project.media,
            src: project.media?.src ?? ''
          }
        },
        `project:${project.id}`
      );
    }

    if (demo) {
      return convertLegacyDemo(demo);
    }

    if (item) {
      return convertLegacyWebDevItem(item, { srcOverride, sandbox, allow });
    }

    warnOnce('no-input', 'DemoModal: No project, demo, or item provided; using placeholder.');
    return withSafeSrc(
      {
        id: 'fallback',
        title: 'Demo Project',
        category: 'web-development',
        media: { type: 'interactive', src: '' }
      },
      'fallback'
    );
  }, [project, demo, item, srcOverride, sandbox, allow]);

  // Dev warnings for legacy-only props
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (closeOnBackdrop !== undefined) {
        console.warn('DemoModal: closeOnBackdrop is not yet supported in UniversalPortfolioModal.');
      }
      if (sandbox || allow || srcOverride) {
        console.warn('DemoModal: iframe props (sandbox, allow, srcOverride) not yet supported.');
      }
      if (blockDetectMs !== undefined) {
        console.warn('DemoModal: blockDetectMs not yet supported.');
      }
      if (ariaLabel || dataTestId) {
        console.warn('DemoModal: ariaLabel and data-testid are not yet forwarded.');
      }
      if (item && !project && !demo) {
        console.info('DemoModal: Using legacy "item" prop. Consider migrating to "project".');
      }
      if (onPrev && !onPrevious) {
        console.info('DemoModal: Using legacy "onPrev". Consider migrating to "onPrevious".');
      }
    }
  }, [closeOnBackdrop, sandbox, allow, srcOverride, blockDetectMs, ariaLabel, dataTestId, item, project, demo, onPrev, onPrevious]);

  // Analytics bridge
  useEffect(() => {
    if (isOpen && modalProject) onModalOpen?.(modalProject);
  }, [isOpen, modalProject, onModalOpen]);

  const handleClose = useCallback(() => {
    if (modalProject) onModalClose?.(modalProject);
    onClose();
  }, [onClose, onModalClose, modalProject]);

  const handlePrevious = useCallback(() => {
    if (onPrevious) onPrevious();
    else if (onPrev) onPrev();
  }, [onPrevious, onPrev]);

  return (
    <UniversalPortfolioModal
      isOpen={isOpen}
      onClose={handleClose}
      project={modalProject}
      index={index}
      total={total}
      onPrevious={(onPrevious || onPrev) ? handlePrevious : undefined}
      onNext={onNext}
      showNavigation={showNavigation}
      onMediaLoad={onMediaLoad}
      onMediaError={onMediaError}
    />
  );
};

export default DemoModal;

// Export types for back-compat
export type { DemoModalProps, LegacyDemo, LegacyWebDevItem };