// /src/data/booking/intake/marketing-services.ts
import type { IntakeForm } from '@/data/booking/_types';

export const marketingIntake: IntakeForm = {
  service: 'marketing-services',
  fields: [
    { id: 'full_name', label: 'Full name', type: 'text', required: true },
    { id: 'email', label: 'Work email', type: 'email', required: true },
    { id: 'company', label: 'Company', type: 'text', required: false },
    { id: 'website', label: 'Website / domain', type: 'text', required: false },
    {
      id: 'channels',
      label: 'Primary channel of interest',
      type: 'select',
      options: ['Paid Search', 'Paid Social', 'Organic Social', 'Email/SMS', 'Content Marketing', 'Marketing Automation'],
      required: true,
    },
    {
      id: 'kpi',
      label: 'Primary KPI',
      type: 'select',
      options: ['Leads', 'Purchases / ROAS', 'Traffic', 'Engagement', 'Pipeline / SQLs'],
      required: true,
    },
    {
      id: 'ad_spend',
      label: 'Current / planned monthly ad spend',
      type: 'select',
      options: ['None', '<$5k', '$5k–$20k', '$20k–$50k', '$50k+'],
      required: false,
    },
    {
      id: 'martech',
      label: 'Marketing automation / CRM',
      type: 'select',
      options: ['None', 'HubSpot', 'Klaviyo', 'Mailchimp', 'Salesforce', 'Zoho', 'Other'],
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
      id: 'notes',
      label: 'Context / goals',
      type: 'textarea',
      required: false,
      placeholder: 'Describe your audience, offers, key products, or current campaigns…',
    },
    {
      id: 'consent',
      label: 'I agree to the Privacy Policy and Terms',
      type: 'checkbox',
      required: true,
    },
  ],
};
