import type { HubTemplateData } from '@/types/servicesTemplate.types'

const data: HubTemplateData = {
  kind: 'hub',
  slug: 'video-production-services',
  title: 'Video Production Services',
  hero: {
    content: {
      title: 'Professional Video Production Services',
      subtitle: 'End-to-end video production for businesses, brands, and organizations',
      primaryCta: { label: 'Start a project', href: '/contact?service=video-production' },
      secondaryCta: { label: 'View our work', href: '#portfolio' }
    },
    background: { type: 'image', src: '/images/hero/video-production-services.jpg', alt: 'Video Production Services' }
  },
  twoColVideo: {
    title: 'Complete video production process',
    description: 'From strategic concept development through final delivery and distribution optimization, we handle every aspect of professional video production.',
    video: { src: '/video/video-production-process.mp4', poster: '/images/video-posters/video-production.jpg', muted: true }
  },
  capabilities: {
    title: 'Full-service video production',
    description: 'Expert video creation across every stage of production.',
    pillars: [
      { 
        id: 'pre-production', 
        title: 'Pre-Production', 
        description: 'Strategic planning and creative development',
        icon: 'clipboard',
        deliverables: ['Concept development', 'Scripting & storyboarding', 'Location scouting', 'Production planning']
      },
      { 
        id: 'production', 
        title: 'Production', 
        description: 'Professional filming across all formats',
        icon: 'video',
        deliverables: ['Corporate videos', 'Brand films', 'Event coverage', 'Training content']
      },
      { 
        id: 'post-production', 
        title: 'Post-Production', 
        description: 'Expert editing and finishing',
        icon: 'edit',
        deliverables: ['Editing & narrative', 'Color grading & audio', 'Motion graphics', 'Multi-format delivery']
      },
      { 
        id: 'distribution', 
        title: 'Distribution', 
        description: 'Platform optimization and performance',
        icon: 'share',
        deliverables: ['Social media content', 'Ad kits', 'Multi-platform optimization', 'Analytics']
      },
      { 
        id: 'premium-packages', 
        title: 'Premium Packages', 
        description: 'Comprehensive video marketing solutions',
        icon: 'package',
        deliverables: ['Social content packs', 'Video ad campaigns', 'Thought leadership series', 'Training programs']
      }
    ],
    ctas: { 
      primary: { label: 'Discuss your project', href: '/contact?service=video-production' }
    }
  },
  cta: {
    title: 'Ready to create compelling video content?',
    description: 'Get a custom video production proposal for your project.',
    primaryCta: { label: 'Get proposal', href: '/contact?service=video-production' },
    secondaryCta: { label: 'View packages', href: '/services/video-production-services/premium-packages' }
  },
  seo: {
    title: 'Video Production Services | Professional Video Creation & Marketing',
    description: 'Complete video production services from concept to distribution. Corporate videos, brand films, social content, and video marketing campaigns.',
    canonical: '/services/video-production-services'
  }
}

export default data