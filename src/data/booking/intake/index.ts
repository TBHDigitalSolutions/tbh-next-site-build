// /src/data/booking/intake/index.ts
import type { IntakeForm } from '@/data/booking/_types';
import type { ServiceHub } from '@/data/booking/_types';
import { IntakeFormSchema } from '@/data/booking/_validators/schema';

// Existing service intakes (already in your repo)
import { seoIntake } from './seo-services';
import { marketingIntake } from './marketing-services';
import { leadGenerationIntake } from './lead-generation-services';
import { contentProductionIntake } from './content-production-services';
import { videoProductionIntake } from './video-production-services';
import { webDevelopmentIntake } from './web-development-services';

// Map of all service → intake forms
const INTAKES: Record<ServiceHub, IntakeForm> = {
  'seo-services': seoIntake,
  'marketing-services': marketingIntake,
  'lead-generation-services': leadGenerationIntake,
  'content-production-services': contentProductionIntake,
  'video-production-services': videoProductionIntake,
  'web-development-services': webDevelopmentIntake,
};

// Validate on module load (fail fast in dev/build)
function validateAll() {
  if (process.env.NODE_ENV !== 'production') {
    for (const [key, form] of Object.entries(INTAKES)) {
      const res = IntakeFormSchema.safeParse(form);
      if (!res.success) {
        // Surface the first issue for quick DX
        const issue = res.error.issues[0];
        throw new Error(
          `[booking:intake] Invalid intake for "${key}": ${issue?.path?.join('.') ?? ''} ${issue?.message ?? ''}`
        );
      }
    }
  }
}
validateAll();

// Public getter
export function getIntake(service: ServiceHub): IntakeForm {
  const form = INTAKES[service];
  if (!form) {
    // Defensive: return a minimal fallback that still passes schema
    return {
      service,
      fields: [
        { id: 'full_name', label: 'Full name', type: 'text', required: true },
        { id: 'email', label: 'Work email', type: 'email', required: true },
        {
          id: 'notes',
          label: 'What would you like to achieve?',
          type: 'textarea',
          required: false,
        },
        {
          id: 'consent',
          label: 'I agree to the Privacy Policy and Terms',
          type: 'checkbox',
          required: true,
        },
      ],
    };
  }
  return form;
}

// Named exports (optional, if you want direct imports elsewhere)
export {
  seoIntake,
  marketingIntake,
  leadGenerationIntake,
  contentProductionIntake,
  videoProductionIntake,
  webDevelopmentIntake,
};
