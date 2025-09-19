// src/data/portfolio/items/migrated-items.ts

import type { Project } from '../index';

/**
 * MIGRATED PORTFOLIO ITEMS
 * 
 * These items have been migrated from legacy format to the new consolidated structure.
 * Original files: brand-film-acme.ts, site-alpha.ts
 * 
 * Migration changes:
 * - category: "video" -> "video-production", "web" -> "web-development"
 * - Legacy video.embedUrl -> media.src with type: "video"
 * - Legacy web.demoUrl -> media.src with type: "interactive"
 * - Added required thumbnails and priority for featured items
 * - Standardized metrics format to string values
 */

export const MIGRATED_PORTFOLIO_ITEMS: Project[] = [
  // Migrated from brand-film-acme.ts
  {
    id: "brand-film-acme",
    title: "Acme Brand Film",
    description: "Anthem spot highlighting Acme's mission, shot across 3 locations with compelling narrative storytelling.",
    category: "video-production", // Migrated from "video"
    client: "Acme Corp",
    featured: true,
    priority: 1, // Added for featured ordering
    tags: ["anthem", "b2b", "multi-location", "brand-story"],
    media: {
      type: "video", // Migrated structure
      src: "https://player.vimeo.com/video/123456789", // From video.embedUrl
      poster: "/portfolio/acme/poster.jpg", // Added required poster
      thumbnail: "/portfolio/acme/thumb.jpg", // Preserved thumbnail
      alt: "Acme brand film showcasing company mission and values"
    },
    href: "/case-studies/acme-brand-film", // From cta.href
    metrics: [
      { label: "Brand Awareness Lift", value: "+67%" },
      { label: "Employee Engagement", value: "+34%" },
      { label: "Video Completion Rate", value: "89%" }
    ]
  },

  // Migrated from site-alpha.ts  
  {
    id: "site-alpha",
    title: "Alpha SaaS Website",
    description: "Next.js site with headless CMS and live pricing experiments, showcasing modern SaaS architecture.",
    category: "web-development", // Migrated from "web"
    client: "Alpha Inc.",
    featured: true,
    priority: 2, // Added for featured ordering
    tags: ["saas", "nextjs", "cms", "pricing", "experiments"],
    media: {
      type: "interactive", // Migrated structure
      src: "https://alpha.example.com", // From web.demoUrl
      thumbnail: "/portfolio/alpha/thumb.jpg", // Preserved thumbnail
      title: "Alpha SaaS Platform Demo", // Added for interactive demos
      alt: "Alpha SaaS website interactive demonstration"
    },
    href: "https://alpha.example.com", // From cta.href
    metrics: [
      { label: "Page Load Speed", value: "1.8s" },
      { label: "Conversion Rate", value: "+45%" },
      { label: "User Engagement", value: "+78%" }
    ]
  }
];

// ============================
// MIGRATION UTILITIES
// ============================

/**
 * Legacy project interface for migration reference
 */
interface LegacyPortfolioItem {
  id: string;
  title: string;
  category: string; // "video", "web", etc.
  client?: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  video?: {
    embedUrl: string;
    poster?: string;
  };
  web?: {
    demoUrl: string;
    screenshots?: string[];
  };
  cta?: {
    label: string;
    href: string;
  };
  featured?: boolean;
  date?: string;
}

/**
 * Migration function to convert legacy items to new format
 */
export const migrateLegacyItem = (legacyItem: LegacyPortfolioItem): Project => {
  // Category mapping
  const categoryMap: Record<string, "web-development" | "video-production" | "seo-services" | "marketing-automation" | "content-production" | "lead-generation"> = {
    'web': 'web-development',
    'video': 'video-production',
    'seo': 'seo-services',
    'automation': 'marketing-automation',
    'content': 'content-production',
    'leadgen': 'lead-generation',
    'lead-gen': 'lead-generation'
  };

  const category = categoryMap[legacyItem.category] || legacyItem.category as any;

  // Determine media type and source
  let media: Project['media'];
  
  if (legacyItem.video) {
    media = {
      type: "video",
      src: legacyItem.video.embedUrl,
      poster: legacyItem.video.poster || `${legacyItem.thumbnail?.replace('thumb.jpg', 'poster.jpg')}`,
      thumbnail: legacyItem.thumbnail || `${legacyItem.id}/thumb.jpg`,
      alt: `${legacyItem.title} video`
    };
  } else if (legacyItem.web) {
    media = {
      type: "interactive",
      src: legacyItem.web.demoUrl,
      thumbnail: legacyItem.thumbnail || `${legacyItem.id}/thumb.jpg`,
      title: `${legacyItem.title} Demo`,
      alt: `${legacyItem.title} interactive demonstration`
    };
  } else {
    // Default to image
    media = {
      type: "image",
      src: legacyItem.thumbnail || `${legacyItem.id}/image.jpg`,
      thumbnail: legacyItem.thumbnail || `${legacyItem.id}/thumb.jpg`,
      alt: legacyItem.title
    };
  }

  return {
    id: legacyItem.id,
    title: legacyItem.title,
    description: legacyItem.description,
    category,
    client: legacyItem.client,
    featured: legacyItem.featured,
    priority: legacyItem.featured ? 1 : undefined, // Default priority for featured items
    tags: legacyItem.tags,
    media,
    href: legacyItem.cta?.href,
    metrics: [] // Would need to be populated manually based on performance data
  };
};

/**
 * Batch migration function for multiple legacy items
 */
export const migrateLegacyItems = (legacyItems: LegacyPortfolioItem[]): Project[] => {
  const migrated: Project[] = [];
  const errors: { item: LegacyPortfolioItem; error: string }[] = [];

  legacyItems.forEach(item => {
    try {
      const migratedItem = migrateLegacyItem(item);
      migrated.push(migratedItem);
    } catch (error) {
      errors.push({
        item,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  if (errors.length > 0) {
    console.warn('Migration errors:', errors);
  }

  console.log(`Successfully migrated ${migrated.length} items, ${errors.length} errors`);
  return migrated;
};

// ============================
// VALIDATION FOR MIGRATED ITEMS
// ============================

/**
 * Validate migrated items against new schema
 */
export const validateMigratedItems = (): boolean => {
  let valid = true;

  MIGRATED_PORTFOLIO_ITEMS.forEach(item => {
    // Check required fields
    if (!item.id || !item.title || !item.category) {
      console.error(`Invalid migrated item: ${item.id} missing required fields`);
      valid = false;
    }

    // Check category is valid
    const validCategories = [
      'web-development', 'video-production', 'seo-services', 
      'marketing-automation', 'content-production', 'lead-generation'
    ];
    if (!validCategories.includes(item.category)) {
      console.error(`Invalid category for ${item.id}: ${item.category}`);
      valid = false;
    }

    // Check media structure
    if (!item.media.type || !item.media.src) {
      console.error(`Invalid media for ${item.id}: missing type or src`);
      valid = false;
    }

    // Check featured items have priority
    if (item.featured && !item.priority) {
      console.warn(`Featured item ${item.id} should have priority`);
    }
  });

  return valid;
};

// ============================
// INTEGRATION HELPERS
// ============================

/**
 * Get migrated items by category
 */
export const getMigratedItemsByCategory = (category: string): Project[] => {
  return MIGRATED_PORTFOLIO_ITEMS.filter(item => item.category === category);
};

/**
 * Get stats for migrated items
 */
export const getMigrationStats = () => {
  const total = MIGRATED_PORTFOLIO_ITEMS.length;
  const featured = MIGRATED_PORTFOLIO_ITEMS.filter(item => item.featured).length;
  const byCategory = MIGRATED_PORTFOLIO_ITEMS.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    featured,
    byCategory,
    migrationDate: new Date().toISOString()
  };
};

// Run validation on import
if (process.env.NODE_ENV === 'development') {
  const isValid = validateMigratedItems();
  if (isValid) {
    console.log('✅ All migrated portfolio items are valid');
  } else {
    console.error('❌ Some migrated portfolio items have validation errors');
  }
  
  console.log('Migration stats:', getMigrationStats());
}