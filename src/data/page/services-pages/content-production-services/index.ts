// Hub: Content Production Services (Level 1)
// Template: HubTemplate
// NOTE: Cross-domain content (portfolio/testimonials/faqs/modules) is pulled
// by selectors or from _shared/*.json; keep page-specific copy here.

import type { HubTemplateData } from '@/types/servicesTemplate.types'

const data: HubTemplateData = {
  kind: 'hub',
  slug: 'content-production-services',
  title: 'Content Production Services',
  hero: {
    content: {
      title: 'Content that looks great, reads clearly, and ships on schedule',
      subtitle:
        'From strategy and copy to photo, video, and packaging—our team builds an efficient, repeatable content engine.',
      primaryCta: { label: 'Start a project', href: '/contact' },
      secondaryCta: { label: 'View portfolio', href: '#portfolio' }
    },
    background: {
      type: 'image',
      src: '/images/hero/content-production-hero.jpg',
      alt: 'Content production—design, copy, photo, and video workflow'
    }
  },

  twoColVideo: {
    title: 'Process that scales with you',
    description:
      'We combine a clear editorial strategy, reusable templates, and a predictable production cadence. The result: higher output, consistent quality, and faster time to publish.',
    video: {
      src: '/video/content-production-overview.mp4',
      poster: '/images/video-posters/content-production.jpg',
      autoPlay: false,
      loop: false,
      muted: true
    },
    cta: { label: 'See examples', href: '#portfolio' }
  },

  // Cards shown at Level 1. These mirror your L2 routes.
  serviceCards: {
    title: 'Explore Services',
    subtitle: 'Choose a track or mix & match for your needs',
    items: [
      {
        title: 'Creative Services',
        description: 'Design systems, brand identity, photography & video',
        href: '/services/content-production-services/creative-services',
        highlights: ['Design', 'Photography', 'Video']
      },
      {
        title: 'Writing & Editorial',
        description: 'Copywriting, editorial strategy, and content governance',
        href: '/services/content-production-services/writing-editorial',
        highlights: ['Web & ad copy', 'Editorial calendar', 'Guidelines']
      },
      {
        title: 'Production & Publishing',
        description: 'CMS publishing, channel packaging, and distribution ops',
        href: '/services/content-production-services/production-publishing',
        highlights: ['CMS ops', 'Channel packages', 'QA workflows']
      },
      {
        title: 'Sales & Marketing Materials',
        description: 'Collateral that explains, convinces, and closes',
        href: '/services/content-production-services/sales-marketing-materials',
        highlights: ['Sales decks', 'Case studies', 'Brand collateral']
      }
    ]
  },

  // Optional: descriptive pillars (used by ServicesAndCapabilities)
  capabilities: {
    title: 'What we deliver',
    description:
      'Purpose-built content across design, copy, photo, and video—supported by a tight editorial operating system.',
    pillars: [
      {
        id: 'creative-services',
        title: 'Creative Services',
        description:
          'Brand & design systems, production-ready visuals, and on-brand assets.',
        deliverables: [
          'Design system foundations',
          'Brand identity & guidelines',
          'Photography & video toolkits'
        ]
      },
      {
        id: 'writing-editorial',
        title: 'Writing & Editorial',
        description: 'Clear, persuasive copy with a durable editorial cadence.',
        deliverables: [
          'Web, ad & email copy',
          'Editorial calendar & workflow',
          'Voice & style guidelines'
        ]
      },
      {
        id: 'production-publishing',
        title: 'Production & Publishing',
        description: 'CMS operations, packaging, and multi-channel rollout.',
        deliverables: [
          'CMS publishing playbooks',
          'Channel-specific packages',
          'QA & review checklists'
        ]
      },
      {
        id: 'sales-marketing-materials',
        title: 'Sales & Marketing Materials',
        description:
          'Collateral libraries that educate, differentiate, and convert.',
        deliverables: [
          'Sales decks & one-pagers',
          'Case studies & white papers',
          'Event & trade-show kits'
        ]
      }
    ],
    ctas: {
      primary: { label: 'Talk to production', href: '/book' },
      secondary: { label: 'See portfolio', href: '#portfolio' }
    }
  },

  // Leave portfolio/testimonials/faq to selectors or _shared JSON fallback.
  // carousel?: { ... }   // (selector-powered)
  // testimonials?: { ... } // (selector or _shared/testimonials.json)
  // faq?: { ... }          // (selector or _shared/faqs.json)

  cta: {
    title: 'Need to scale content without sacrificing quality?',
    description:
      'Let’s plan a cadence, build your templates, and start shipping high-quality content on a repeatable schedule.',
    primaryCta: { label: 'Start a project', href: '/contact' },
    secondaryCta: { label: 'Book a call', href: '/book' },
    layout: 'centered',
    backgroundType: 'gradient',
    trustElements: ['On-time delivery', 'Source files included', 'Clear SOWs']
  },

  seo: {
    title:
      'Content Production Services | Design, Copy, Photo & Video that Ships',
    description:
      'Content production at scale: design systems, copywriting, photography, video, CMS publishing, and sales collateral with a repeatable editorial cadence.',
    canonical: '/services/content-production-services'
  }
}

export default data
