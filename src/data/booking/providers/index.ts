// /src/data/booking/providers/index.ts
// Central registry with type-safe getProvider()

import type { ProviderAdapter } from '@/booking/lib/types';
import { calcomAdapter } from './cal-com';
import { calendlyAdapter } from './calendly';
import { acuityAdapter } from './acuity';

// Keep order deterministic but rely on explicit keys for lookups.
export const PROVIDERS = {
  calcom: calcomAdapter,
  calendly: calendlyAdapter,
  acuity: acuityAdapter,
} as const;

export type ProviderKey = keyof typeof PROVIDERS;

export function getProvider(name: ProviderKey): ProviderAdapter {
  const p = PROVIDERS[name];
  if (!p) {
    // Fallback: return a disabled stub to avoid crashes
    return {
      name: name as ProviderAdapter['name'],
      isEnabled: false,
      getEmbed() {
        return { type: 'iframe', src: 'about:blank' };
      },
    };
  }
  return p;
}

// Utility: pick a safe, enabled provider (used by domain config defaults)
export function getFirstEnabledProvider(): ProviderAdapter {
  const entry = Object.values(PROVIDERS).find((p) => p.isEnabled);
  return (
    entry ?? {
      name: 'calcom',
      isEnabled: false,
      getEmbed() {
        return { type: 'iframe', src: 'about:blank' };
      },
    }
  );
}

export function listEnabledProviders(): ProviderAdapter[] {
  return Object.values(PROVIDERS).filter((p) => p.isEnabled);
}
