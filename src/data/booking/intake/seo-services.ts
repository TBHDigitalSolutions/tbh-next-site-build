// /src/data/booking/intake/seo-services.ts
import type { IntakeForm } from '@/data/booking/_types';

export const seoIntake: IntakeForm = {
  service: 'seo-services',
  fields: [
    { id: 'full_name', label: 'Full name', type: 'text', required: true, placeholder: 'Jane Doe' },
    { id: 'email', label: 'Work email', type: 'email', required: true, placeholder: 'jane@company.com' },
    { id: 'company', label: 'Company', type: 'text', required: false, placeholder: 'Company LLC' },
    { id: 'website', label: 'Website / domain', type: 'text', required: true, placeholder: 'https://example.com' },
    {
      id: 'cms',
      label: 'Current CMS',
      type: 'select',
      options: ['WordPress', 'Shopify', 'Webflow', 'Custom/Headless', 'Other / Not sure'],
      required: false,
    },
    {
      id: 'primary_goal',
      label: 'Primary SEO goal',
      type: 'select',
      options: ['Increase organic traffic', 'Improve rankings', 'Technical SEO', 'Content strategy', 'Local SEO'],
      required: true,
    },
    {
      id: 'content_velocity',
      label: 'Monthly content velocity',
      type: 'select',
      options: ['0–1 posts', '2–4 posts', '5–8 posts', '9+ posts'],
      required: false,
    },
    {
      id: 'tools_stack',
      label: 'SEO tools in use',
      type: 'select',
      options: ['None', 'Ahrefs', 'Semrush', 'Moz', 'Screaming Frog', 'Other'],
      required: false,
    },
    {
      id: 'timeline',
      label: 'Target start timeline',
      type: 'select',
      options: ['ASAP (0–2 weeks)', '2–4 weeks', '1–2 months', '2+ months'],
      required: true,
    },
    {
      id: 'budget',
      label: 'Estimated monthly budget',
      type: 'select',
      options: ['<$1k', '$1k–$3k', '$3k–$6k', '$6k–$10k', '$10k+'],
      required: false,
    },
    {
      id: 'notes',
      label: 'Anything else we should know?',
      type: 'textarea',
      required: false,
      placeholder: 'Share current challenges, competitors, or recent audits…',
    },
    {
      id: 'consent',
      label: 'I agree to the Privacy Policy and Terms',
      type: 'checkbox',
      required: true,
      helpText: 'Required to submit.',
    },
  ],
};
