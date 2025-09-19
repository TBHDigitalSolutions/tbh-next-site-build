// L1 Hub: SEO Services (no pricing)
// NOTE: Keep cross-domain content (testimonials/portfolio/faqs) out of here;
// it will be pulled via selectors & _shared JSON fallbacks.

import type { HubTemplateData } from '@/types/servicesTemplate.types'

const data: HubTemplateData = {
  kind: 'hub',
  slug: 'seo-services',
  title: 'SEO Services',

  hero: {
    content: {
      title: 'Technical, Content, and AI-Ready SEO',
      subtitle:
        'Improve crawlability, relevance, and authority—while preparing for AI-driven search surfaces and SGE.',
      primaryCta: { label: 'Request SEO Audit', href: '/book' },
      secondaryCta: { label: 'View Case Studies', href: '#portfolio' },
    },
    background: {
      type: 'image',
      src: '/images/heroes/seo-services-hero.jpg',
      alt: 'SEO services hero'
    }
  },

  // Optional intro/overview block
  twoColVideo: {
    title: 'Our SEO Methodology',
    description:
      'We combine deep technical fixes, durable content strategy, and authority building with AI-search readiness. ' +
      'Our approach prioritizes measurable gains without fragile hacks.',
    // Provide a video if you have one; otherwise this renders as a text intro.
    // video: { src: '/video/seo-methodology.mp4', poster: '/images/posters/seo-methodology.jpg', muted: true, loop: true }
  },

  // Directory-first stance: bullets emphasize L2 categories.
  // If you omit bullets, the template will auto-derive cards/bullets from taxonomy children.
  capabilities: {
    title: 'What We Do',
    description:
      'Choose the track that matches your current bottleneck—AI SEO, Marketing SEO, or Technical SEO. ' +
      'Each program is designed to integrate with your team and stack.',
    bullets: [
      { label: 'AI SEO', href: '/services/seo-services/ai-seo' },
      { label: 'Marketing SEO', href: '/services/seo-services/marketing' },
      { label: 'Technical SEO', href: '/services/seo-services/technical' }
    ],
    pillars: [
      {
        id: 'ai-seo',
        title: 'AI SEO',
        description: 'Optimize for SGE, assistant answers, and emerging AI search behaviors.',
        deliverables: ['Entity & schema strategy', 'Answerable content patterns', 'Visibility engineering']
      },
      {
        id: 'marketing',
        title: 'Marketing SEO',
        description: 'Content architecture, authority building, and demand capture.',
        deliverables: ['Topic clusters', 'Digital PR', 'On-page optimization']
      },
      {
        id: 'technical',
        title: 'Technical SEO',
        description: 'Indexation, performance, and platform issues that block growth.',
        deliverables: ['Core Web Vitals', 'Indexation & routing', 'Migrations & audits']
      }
    ],
    ctas: {
      primary: { label: 'Start with an Audit', href: '/book' },
      secondary: { label: 'Talk to an SEO Strategist', href: '/contact' }
    }
  },

  // (Optional) Feature carousel config—items auto-selected by selectors
  modules: {
    title: 'Explore More',
    subtitle: 'Audits, resources, and success stories',
    layout: 'carousel',
    items: [] // selectors will inject
  },

  // Let selectors/_shared provide testimonials, portfolio, and FAQs.

  cta: {
    title: 'Ready to unlock sustainable organic growth?',
    subtitle: 'No shortcuts—just disciplined execution that compounds.',
    primaryCta: { label: 'Request SEO Audit', href: '/book' },
    secondaryCta: { label: 'See Packages & Add-Ons', href: '/services/marketing/digital-advertising/packages' }, // update if you add SEO packages page later
    layout: 'centered',
    backgroundType: 'gradient',
    trustElements: ['Privacy-first', 'Transparent reporting', 'ICP-aligned content']
  },

  seo: {
    title: 'SEO Services | Technical, Marketing, and AI-Ready SEO Programs',
    description:
      'Professional SEO services spanning technical fixes, content strategy, digital PR, and AI search readiness. Built to improve visibility and conversions.',
    canonical: '/services/seo-services'
  }
}

export default data
