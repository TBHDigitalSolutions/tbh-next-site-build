// /src/data/booking/intake/lead-generation-services.ts
import type { IntakeForm } from '@/data/booking/_types';

export const leadGenerationIntake: IntakeForm = {
  service: 'lead-generation-services',
  fields: [
    { id: 'full_name', label: 'Full name', type: 'text', required: true },
    { id: 'email', label: 'Work email', type: 'email', required: true },
    { id: 'company', label: 'Company', type: 'text', required: false },
    { id: 'website', label: 'Website / domain', type: 'text', required: false },
    {
      id: 'target_icp',
      label: 'Ideal customer profile (ICP)',
      type: 'textarea',
      required: true,
      placeholder: 'Industry, company size, titles, locations…',
    },
    {
      id: 'crm',
      label: 'Current CRM',
      type: 'select',
      options: ['None', 'HubSpot', 'Salesforce', 'Pipedrive', 'Zoho', 'Other'],
      required: false,
    },
    {
      id: 'sql_goal',
      label: 'Monthly SQL goal',
      type: 'select',
      options: ['<10', '10–25', '26–50', '51–100', '100+'],
      required: true,
    },
    {
      id: 'lead_sources',
      label: 'Primary lead source focus',
      type: 'select',
      options: ['Paid (Search/Social)', 'Outbound (Email/LinkedIn)', 'Inbound (SEO/Content)', 'Partnerships/Referrals'],
      required: true,
    },
    {
      id: 'timeline',
      label: 'Target start timeline',
      type: 'select',
      options: ['ASAP (0–2 weeks)', '2–4 weeks', '1–2 months', '2+ months'],
      required: true,
    },
    {
      id: 'notes',
      label: 'Context / constraints',
      type: 'textarea',
      required: false,
      placeholder: 'Compliance constraints, territories, messaging do/do-not, etc.',
    },
    {
      id: 'consent',
      label: 'I agree to the Privacy Policy and Terms',
      type: 'checkbox',
      required: true,
    },
  ],
};
