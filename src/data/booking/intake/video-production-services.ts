// Video Production Services intake form configuration

import type { IntakeFormSpec } from '../_types';

export const VIDEO_PRODUCTION_INTAKE: IntakeFormSpec = {
  service: 'video-production-services',
  title: 'Video Production Project Details',
  description: 'Tell us about your video project so we can create the perfect content for your needs.',
  submitText: 'Continue to Scheduling',
  successMessage: 'Thank you! We\'ve received your video project details.',
  
  fields: [
    {
      name: 'videoType',
      label: 'What type of video do you need?',
      type: 'select',
      required: true,
      options: [
        { label: 'Corporate/Company overview', value: 'corporate' },
        { label: 'Product demonstration', value: 'product-demo' },
        { label: 'Testimonial/Case study', value: 'testimonial' },
        { label: 'Training/Educational', value: 'training' },
        { label: 'Marketing/Promotional', value: 'marketing' },
        { label: 'Event coverage', value: 'event' },
        { label: 'Social media content', value: 'social-media' },
        { label: 'Explainer/Animated', value: 'explainer' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'videoLength',
      label: 'Desired video length',
      type: 'select',
      required: true,
      options: [
        { label: 'Under 30 seconds', value: 'under-30s' },
        { label: '30-60 seconds', value: '30-60s' },
        { label: '1-2 minutes', value: '1-2min' },
        { label: '2-5 minutes', value: '2-5min' },
        { label: '5-10 minutes', value: '5-10min' },
        { label: 'Over 10 minutes', value: 'over-10min' },
        { label: 'Not sure yet', value: 'unsure' },
      ],
    },
    {
      name: 'videoStyle',
      label: 'What style are you looking for?',
      type: 'select',
      options: [
        { label: 'Professional/Corporate', value: 'professional' },
        { label: 'Creative/Artistic', value: 'creative' },
        { label: 'Casual/Conversational', value: 'casual' },
        { label: 'High-energy/Dynamic', value: 'high-energy' },
        { label: 'Minimalist/Clean', value: 'minimalist' },
        { label: 'Animated/Motion graphics', value: 'animated' },
        { label: 'Documentary style', value: 'documentary' },
        { label: 'Not sure yet', value: 'unsure' },
      ],
    },
    {
      name: 'location',
      label: 'Where will filming take place?',
      type: 'radio',
      required: true,
      options: [
        { label: 'At my business location', value: 'business' },
        { label: 'At your studio', value: 'studio' },
        { label: 'Multiple locations', value: 'multiple' },
        { label: 'Remote/Virtual recording', value: 'remote' },
        { label: 'Not sure yet', value: 'unsure' },
      ],
    },
    {
      name: 'participants',
      label: 'Who will be featured in the video?',
      type: 'checkbox',
      options: [
        { label: 'CEO/Executive team', value: 'executives' },
        { label: 'Employees/Team members', value: 'employees' },
        { label: 'Customers/Clients', value: 'customers' },
        { label: 'Professional actors', value: 'actors' },
        { label: 'Voice-over only', value: 'voiceover' },
        { label: 'No people (product/location focus)', value: 'no-people' },
      ],
    },
    {
      name: 'deadline',
      label: 'When do you need the final video?',
      type: 'select',
      required: true,
      options: [
        { label: 'Within 1 week (rush)', value: '1-week' },
        { label: '2-3 weeks', value: '2-3-weeks' },
        { label: '1 month', value: '1-month' },
        { label: '1-2 months', value: '1-2-months' },
        { label: 'No specific deadline', value: 'flexible' },
      ],
    },
    {
      name: 'budget',
      label: 'What\'s your budget range?',
      type: 'select',
      required: true,
      options: [
        { label: 'Under $2,000', value: 'under-2k' },
        { label: '$2,000 - $5,000', value: '2k-5k' },
        { label: '$5,000 - $10,000', value: '5k-10k' },
        { label: '$10,000 - $20,000', value: '10k-20k' },
        { label: 'Over $20,000', value: 'over-20k' },
        { label: 'I\'m not sure yet', value: 'unsure' },
      ],
    },
    {
      name: 'deliverables',
      label: 'What formats/deliverables do you need?',
      type: 'checkbox',
      options: [
        { label: 'Full-length video', value: 'full-video' },
        { label: 'Social media clips', value: 'social-clips' },
        { label: 'Different aspect ratios', value: 'multi-aspect' },
        { label: 'Subtitled versions', value: 'subtitles' },
        { label: 'Raw footage', value: 'raw-footage' },
        { label: 'Audio-only version', value: 'audio-only' },
      ],
    },
    {
      name: 'inspiration',
      label: 'Do you have any examples or inspiration?',
      type: 'textarea',
      placeholder: 'Share links to videos you like or describe the style you\'re going for...',
      validation: {
        maxLength: 500,
      },
    },
    {
      name: 'additionalInfo',
      label: 'Any additional details or requirements?',
      type: 'textarea',
      placeholder: 'Special equipment needed, accessibility requirements, branding guidelines, etc.',
      validation: {
        maxLength: 1000,
      },
    },
  ],
  
  consent: {
    privacyPolicyHref: '/privacy-policy',
    termsHref: '/terms-of-service',
    dataProcessingAgreement: true,
    marketingOptIn: false,
  },
};