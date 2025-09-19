// Web Development Services intake form configuration
// Service-specific form fields and validation

import type { IntakeFormSpec } from '../_types';

export const WEB_DEVELOPMENT_INTAKE: IntakeFormSpec = {
  service: 'web-development-services',
  title: 'Web Development Project Details',
  description: 'Help us understand your web development needs so we can provide you with the best solution.',
  submitText: 'Continue to Scheduling',
  successMessage: 'Thank you! We\'ve received your project details.',
  
  fields: [
    {
      name: 'projectType',
      label: 'What type of web project do you need?',
      type: 'select',
      required: true,
      options: [
        { label: 'New website', value: 'new-website' },
        { label: 'Website redesign', value: 'redesign' },
        { label: 'E-commerce site', value: 'ecommerce' },
        { label: 'Web application', value: 'web-app' },
        { label: 'Landing pages', value: 'landing-pages' },
        { label: 'Website maintenance', value: 'maintenance' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'currentWebsite',
      label: 'Do you currently have a website?',
      type: 'radio',
      required: true,
      options: [
        { label: 'Yes, and I want to redesign it', value: 'yes-redesign' },
        { label: 'Yes, but I need a new one', value: 'yes-new' },
        { label: 'No, this is my first website', value: 'no' },
      ],
    },
    {
      name: 'websiteUrl',
      label: 'Current website URL',
      type: 'text',
      placeholder: 'https://www.example.com',
      conditional: {
        dependsOn: 'currentWebsite',
        value: ['yes-redesign', 'yes-new'],
      },
    },
    {
      name: 'industry',
      label: 'What industry are you in?',
      type: 'select',
      required: true,
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Finance', value: 'finance' },
        { label: 'Education', value: 'education' },
        { label: 'Retail/E-commerce', value: 'retail' },
        { label: 'Professional Services', value: 'professional-services' },
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Restaurant/Food', value: 'restaurant' },
        { label: 'Non-profit', value: 'non-profit' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'features',
      label: 'Which features do you need? (Select all that apply)',
      type: 'checkbox',
      options: [
        { label: 'Contact forms', value: 'contact-forms' },
        { label: 'Online booking/scheduling', value: 'booking' },
        { label: 'E-commerce/shopping cart', value: 'ecommerce' },
        { label: 'User accounts/login', value: 'user-accounts' },
        { label: 'Payment processing', value: 'payments' },
        { label: 'Blog/news section', value: 'blog' },
        { label: 'Photo/video galleries', value: 'galleries' },
        { label: 'Search functionality', value: 'search' },
        { label: 'Multi-language support', value: 'multilingual' },
        { label: 'Third-party integrations', value: 'integrations' },
      ],
    },
    {
      name: 'designPreferences',
      label: 'Design preferences',
      type: 'textarea',
      placeholder: 'Describe your preferred style, colors, any inspiration websites, etc.',
      validation: {
        maxLength: 500,
      },
    },
    {
      name: 'targetAudience',
      label: 'Who is your target audience?',
      type: 'textarea',
      required: true,
      placeholder: 'Describe your ideal customers/users',
      validation: {
        maxLength: 300,
      },
    },
    {
      name: 'budget',
      label: 'What\'s your budget range for this project?',
      type: 'select',
      required: true,
      options: [
        { label: 'Under $5,000', value: 'under-5k' },
        { label: '$5,000 - $10,000', value: '5k-10k' },
        { label: '$10,000 - $25,000', value: '10k-25k' },
        { label: '$25,000 - $50,000', value: '25k-50k' },
        { label: 'Over $50,000', value: 'over-50k' },
        { label: 'I\'m not sure yet', value: 'unsure' },
      ],
    },
    {
      name: 'timeline',
      label: 'When do you need this completed?',
      type: 'select',
      required: true,
      options: [
        { label: 'ASAP (Rush job)', value: 'asap' },
        { label: 'Within 1 month', value: '1-month' },
        { label: '1-3 months', value: '1-3-months' },
        { label: '3-6 months', value: '3-6-months' },
        { label: 'No specific deadline', value: 'flexible' },
      ],
    },
    {
      name: 'additionalInfo',
      label: 'Any additional information or specific requirements?',
      type: 'textarea',
      placeholder: 'Tell us about any specific technical requirements, integrations needed, or other details...',
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