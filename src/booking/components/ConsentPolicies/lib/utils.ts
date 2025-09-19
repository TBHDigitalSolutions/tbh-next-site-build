// src/booking/components/ConsentPolicies/lib/utils.ts
// Production utilities for ConsentPolicies component

import type {
  ConsentItem,
  ConsentStatus,
  ConsentType,
  PolicyType,
  ConsentAnalytics,
  ConsentPreferences,
  LegalBasis,
  ConsentRecord,
  ConsentValidation,
  PolicyDocument,
  ThirdParty,
  UserRight,
  ConsentExportData,
  ComplianceData,
} from '../ConsentPolicies.types';
import type { CanonicalService } from '../../../lib/types';

// Storage keys for different types of consent data
const CONSENT_STORAGE_KEY = 'user_consents';
const CONSENT_HISTORY_KEY = 'consent_history';
const PREFERENCES_STORAGE_KEY = 'consent_preferences';

/**
 * Create common consent configurations for services
 */
export function createPrivacyConsent(required: boolean = true): ConsentItem {
  return {
    id: 'privacy-policy',
    type: required ? 'required' : 'optional',
    label: 'Privacy Policy',
    description: 'I have read and agree to the Privacy Policy regarding how my personal data will be processed.',
    required,
    status: 'pending',
    policyType: 'privacy',
    policyUrl: '/policies/privacy',
    purpose: 'To inform you about how we collect, use, and protect your personal information',
    legalBasis: 'consent',
    dataCategories: ['contact information', 'service preferences', 'communication history'],
    userRights: [
      {
        type: 'access',
        description: 'You have the right to access your personal data',
        howToExercise: 'Contact us at privacy@company.com',
        contactInfo: 'privacy@company.com',
      },
      {
        type: 'rectification',
        description: 'You have the right to correct inaccurate data',
        howToExercise: 'Update your profile or contact support',
      },
      {
        type: 'erasure',
        description: 'You have the right to request deletion of your data',
        howToExercise: 'Submit a deletion request through our privacy portal',
      },
      {
        type: 'portability',
        description: 'You have the right to receive your data in a portable format',
        howToExercise: 'Request data export through your account settings',
      },
    ],
  };
}

export function createTermsConsent(required: boolean = true): ConsentItem {
  return {
    id: 'terms-conditions',
    type: required ? 'required' : 'optional',
    label: 'Terms and Conditions',
    description: 'I agree to the Terms and Conditions governing the use of this service.',
    required,
    status: 'pending',
    policyType: 'terms',
    policyUrl: '/policies/terms',
    purpose: 'To establish the legal agreement for service usage',
    legalBasis: 'contract',
    dataCategories: ['service usage', 'account information', 'transaction history'],
  };
}

export function createMarketingConsent(required: boolean = false): ConsentItem {
  return {
    id: 'marketing-communications',
    type: 'optional',
    label: 'Marketing Communications',
    description: 'I would like to receive marketing emails about new services, promotions, and company updates.',
    required,
    status: 'pending',
    policyType: 'marketing',
    policyUrl: '/policies/marketing',
    purpose: 'To send you relevant marketing communications and service updates',
    legalBasis: 'consent',
    dataCategories: ['email address', 'communication preferences', 'service interests'],
    thirdParties: [
      {
        name: 'Email Service Provider',
        purpose: 'Email delivery and analytics',
        type: 'processor',
        location: 'United States',
        privacyPolicyUrl: 'https://example.com/privacy',
      },
      {
        name: 'Marketing Analytics Platform',
        purpose: 'Campaign performance tracking',
        type: 'processor',
        location: 'European Union',
      },
    ],
    expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
  };
}

export function createCookieConsent(): ConsentItem[] {
  return [
    {
      id: 'essential-cookies',
      type: 'required',
      label: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function properly and cannot be disabled.',
      required: true,
      status: 'accepted',
      policyType: 'cookies',
      policyUrl: '/policies/cookies#essential',
      purpose: 'Website functionality, security, and user authentication',
      legalBasis: 'legitimate-interests',
      dataCategories: ['session data', 'security tokens', 'user preferences'],
    },
    {
      id: 'analytics-cookies',
      type: 'optional',
      label: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website to improve user experience.',
      required: false,
      status: 'pending',
      policyType: 'cookies',
      policyUrl: '/policies/cookies#analytics',
      purpose: 'Website analytics and performance monitoring',
      legalBasis: 'consent',
      dataCategories: ['browsing behavior', 'device information', 'usage patterns'],
      thirdParties: [
        {
          name: 'Google Analytics',
          purpose: 'Website analytics',
          type: 'processor',
          location: 'United States',
          privacyPolicyUrl: 'https://policies.google.com/privacy',
        },
      ],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    },
    {
      id: 'marketing-cookies',
      type: 'optional',
      label: 'Marketing Cookies',
      description: 'Used to deliver personalized advertisements and track marketing campaign effectiveness.',
      required: false,
      status: 'pending',
      policyType: 'cookies',
      policyUrl: '/policies/cookies#marketing',
      purpose: 'Personalized advertising and marketing campaign tracking',
      legalBasis: 'consent',
      dataCategories: ['browsing history', 'interests', 'demographic information'],
      thirdParties: [
        {
          name: 'Google Ads',
          purpose: 'Targeted advertising',
          type: 'joint-controller',
          location: 'United States',
          privacyPolicyUrl: 'https://policies.google.com/privacy',
        },
        {
          name: 'Facebook Pixel',
          purpose: 'Social media advertising',
          type: 'joint-controller',
          location: 'United States',
          privacyPolicyUrl: 'https://www.facebook.com/privacy/policy',
        },
      ],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    },
    {
      id: 'functional-cookies',
      type: 'optional',
      label: 'Functional Cookies',
      description: 'Remember your preferences and settings to provide a personalized experience.',
      required: false,
      status: 'pending',
      policyType: 'cookies',
      policyUrl: '/policies/cookies#functional',
      purpose: 'Enhanced functionality and personalization',
      legalBasis: 'consent',
      dataCategories: ['user preferences', 'language settings', 'accessibility options'],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    },
  ];
}

export function createDataProcessingConsent(service: CanonicalService): ConsentItem {
  const serviceName = service.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    id: 'data-processing',
    type: 'required',
    label: 'Data Processing Agreement',
    description: `I consent to the processing of my personal data necessary to provide the requested ${serviceName} services.`,
    required: true,
    status: 'pending',
    policyType: 'data-processing',
    policyUrl: '/policies/data-processing',
    purpose: `To provide ${serviceName} services as requested and maintain our business relationship`,
    legalBasis: 'contract',
    dataCategories: [
      'contact information',
      'service requirements',
      'project details',
      'communication records',
      'billing information',
    ],
    thirdParties: [
      {
        name: 'Payment Processor',
        purpose: 'Payment processing and fraud prevention',
        type: 'processor',
        location: 'United States',
      },
      {
        name: 'Cloud Storage Provider',
        purpose: 'Secure data storage and backup',
        type: 'processor',
        location: 'Multiple regions',
      },
    ],
    expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 3 years
  };
}

/**
 * Validation utilities
 */
export function validateConsent(consent: ConsentItem): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!consent.id || consent.id.trim() === '') {
    errors.push('Consent ID is required');
  }

  if (!consent.label || consent.label.trim() === '') {
    errors.push('Consent label is required');
  }

  if (consent.required && consent.status === 'declined') {
    errors.push(`${consent.label} is required and cannot be declined`);
  }

  if (consent.expiryDate) {
    const expiry = new Date(consent.expiryDate);
    if (expiry < new Date() && consent.status === 'accepted') {
      errors.push(`${consent.label} consent has expired`);
    }
  }

  if (consent.type === 'required' && !consent.required) {
    errors.push('Required consent type must have required flag set to true');
  }

  if (!isValidConsentStatus(consent.status)) {
    errors.push(`Invalid consent status: ${consent.status}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateAllConsents(consents: ConsentItem[]): ConsentValidation {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  const expiredConsents: string[] = [];
  const invalidStates: string[] = [];
  const ids = new Set<string>();

  consents.forEach((consent, index) => {
    // Check for duplicate IDs
    if (ids.has(consent.id)) {
      errors[consent.id] = `Duplicate consent ID: ${consent.id}`;
    } else {
      ids.add(consent.id);
    }

    // Validate individual consent
    const validation = validateConsent(consent);
    if (!validation.valid) {
      errors[consent.id] = validation.errors.join(', ');
    }

    // Check required consents
    if (consent.required && consent.status !== 'accepted') {
      missingRequired.push(consent.id);
    }

    // Check expired consents
    if (consent.expiryDate && new Date(consent.expiryDate) < new Date() && consent.status === 'accepted') {
      expiredConsents.push(consent.id);
    }

    // Check invalid states
    if (!isValidConsentStatus(consent.status)) {
      invalidStates.push(consent.id);
    }

    // Generate warnings
    if (consent.optional && consent.status === 'pending') {
      warnings.push(`Optional consent "${consent.label}" has not been addressed`);
    }
  });

  return {
    isValid: Object.keys(errors).length === 0 && missingRequired.length === 0,
    errors: Object.values(errors),
    warnings,
    missingRequired,
    expiredConsents,
    invalidStates,
  };
}

/**
 * Status management utilities
 */
export function updateConsentStatus(
  consents: ConsentItem[],
  consentId: string,
  status: ConsentStatus,
  metadata?: Record<string, any>
): ConsentItem[] {
  return consents.map(consent => 
    consent.id === consentId 
      ? { 
          ...consent, 
          status, 
          consentDate: status === 'accepted' ? new Date().toISOString() : consent.consentDate,
          metadata: { ...consent.metadata, ...metadata }
        }
      : consent
  );
}

export function getConsentsByStatus(consents: ConsentItem[], status: ConsentStatus): ConsentItem[] {
  return consents.filter(consent => consent.status === status);
}

export function getRequiredConsents(consents: ConsentItem[]): ConsentItem[] {
  return consents.filter(consent => consent.required);
}

export function getOptionalConsents(consents: ConsentItem[]): ConsentItem[] {
  return consents.filter(consent => !consent.required);
}

export function areAllRequiredConsentsAccepted(consents: ConsentItem[]): boolean {
  return getRequiredConsents(consents).every(consent => consent.status === 'accepted');
}

export function getConsentCompletionRate(consents: ConsentItem[]): number {
  if (consents.length === 0) return 0;
  const addressedConsents = consents.filter(c => c.status !== 'pending').length;
  return Math.round((addressedConsents / consents.length) * 100);
}

/**
 * GDPR/CCPA compliance utilities
 */
export function generateConsentRecord(consent: ConsentItem, userInfo?: any): ConsentRecord {
  return {
    consentId: consent.id,
    status: consent.status,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server-side',
    policyVersion: consent.policyVersion || '1.0',
    metadata: {
      ...consent.metadata,
      userId: userInfo?.id,
      sessionId: userInfo?.sessionId,
      legalBasis: consent.legalBasis,
      purpose: consent.purpose,
      expiryDate: consent.expiryDate,
    },
  };
}

export function exportConsentData(
  consents: ConsentItem[], 
  userInfo?: any,
  complianceData?: ComplianceData
): ConsentExportData {
  const consentRecords = consents.map(consent => generateConsentRecord(consent, userInfo));
  
  return {
    userId: userInfo?.id,
    exportDate: new Date().toISOString(),
    consents: consentRecords,
    policyVersions: consents.reduce((acc, consent) => {
      acc[consent.id] = consent.policyVersion || '1.0';
      return acc;
    }, {} as Record<string, string>),
    compliance: complianceData || getDefaultComplianceData(),
    version: '1.0',
    formatVersion: 'consent-export-v1.0',
    metadata: {
      exportReason: 'user-request',
      includesHistory: true,
      dataController: complianceData?.dataController?.name || 'TBH Digital Solutions',
    },
  };
}

function getDefaultComplianceData(): ComplianceData {
  return {
    jurisdiction: 'US',
    regulations: ['CCPA'],
    dataController: {
      name: 'TBH Digital Solutions',
      address: '123 Business St, City, State 12345',
      email: 'privacy@tbhdigital.com',
      phone: '+1 (555) 123-4567',
      dpoEmail: 'dpo@tbhdigital.com',
    },
    dpo: {
      name: 'Data Protection Officer',
      email: 'dpo@tbhdigital.com',
    },
    supervisoryAuthority: {
      name: 'California Attorney General',
      website: 'https://oag.ca.gov/',
      complaintUrl: 'https://oag.ca.gov/privacy/ccpa',
    },
  };
}

/**
 * Analytics and tracking
 */
export function trackConsentEvent(analytics: ConsentAnalytics): void {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', analytics.event, {
      consent_id: analytics.consentId,
      policy_type: analytics.policyType,
      service: analytics.service,
      status: analytics.status,
      timestamp: analytics.timestamp,
      ...analytics.properties,
    });
  }

  // Custom analytics
  if (typeof window !== 'undefined' && window.analytics?.track) {
    window.analytics.track(`consent_${analytics.event}`, {
      consentId: analytics.consentId,
      policyType: analytics.policyType,
      service: analytics.service,
      status: analytics.status,
      timestamp: analytics.timestamp,
      ...analytics.properties,
    });
  }

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Consent Analytics]', analytics.event, analytics);
  }
}

export function createConsentAnalytics(
  event: string,
  consentId?: string,
  additionalData?: Record<string, any>
): ConsentAnalytics {
  return {
    event: event as any,
    consentId,
    timestamp: Date.now(),
    properties: additionalData,
  };
}

/**
 * Preferences management
 */
export function createConsentPreferences(consents: ConsentItem[]): ConsentPreferences {
  const preferences: ConsentPreferences = {
    marketing: false,
    analytics: false,
    functional: false,
    performance: false,
    thirdParty: false,
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
    dataSharing: false,
    personalization: false,
  };

  consents.forEach(consent => {
    if (consent.status === 'accepted') {
      switch (consent.id) {
        case 'marketing-communications':
        case 'marketing-cookies':
          preferences.marketing = true;
          preferences.emailNotifications = true;
          break;
        case 'analytics-cookies':
          preferences.analytics = true;
          preferences.performance = true;
          break;
        case 'functional-cookies':
          preferences.functional = true;
          preferences.personalization = true;
          break;
        case 'third-party-integrations':
          preferences.thirdParty = true;
          break;
        case 'data-sharing':
          preferences.dataSharing = true;
          break;
      }
    }
  });

  return preferences;
}

export function applyPreferencesToConsents(
  consents: ConsentItem[],
  preferences: ConsentPreferences
): ConsentItem[] {
  return consents.map(consent => {
    let newStatus: ConsentStatus = consent.status;

    switch (consent.id) {
      case 'marketing-communications':
      case 'marketing-cookies':
        newStatus = preferences.marketing ? 'accepted' : 'declined';
        break;
      case 'analytics-cookies':
        newStatus = preferences.analytics ? 'accepted' : 'declined';
        break;
      case 'functional-cookies':
        newStatus = preferences.functional ? 'accepted' : 'declined';
        break;
      case 'third-party-integrations':
        newStatus = preferences.thirdParty ? 'accepted' : 'declined';
        break;
      case 'data-sharing':
        newStatus = preferences.dataSharing ? 'accepted' : 'declined';
        break;
    }

    if (newStatus !== consent.status) {
      return {
        ...consent,
        status: newStatus,
        consentDate: newStatus === 'accepted' ? new Date().toISOString() : consent.consentDate,
      };
    }

    return consent;
  });
}

/**
 * Storage utilities
 */
export function saveConsentsToStorage(consents: ConsentItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    const consentData = {
      consents: consents.map(consent => ({
        id: consent.id,
        status: consent.status,
        consentDate: consent.consentDate,
        policyVersion: consent.policyVersion,
        metadata: consent.metadata,
      })),
      savedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
  } catch (error) {
    console.warn('Failed to save consents to storage:', error);
  }
}

export function loadConsentsFromStorage(): any | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!saved) return null;
    
    const consentData = JSON.parse(saved);
    
    // Check if data is not too old (6 months)
    const isExpired = (Date.now() - new Date(consentData.savedAt).getTime()) > (6 * 30 * 24 * 60 * 60 * 1000);
    if (isExpired) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    
    return consentData;
  } catch (error) {
    console.warn('Failed to load saved consents:', error);
    return null;
  }
}

export function clearConsentsFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    localStorage.removeItem(CONSENT_HISTORY_KEY);
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear saved consents:', error);
  }
}

export function saveConsentHistory(record: ConsentRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const existingHistory = localStorage.getItem(CONSENT_HISTORY_KEY);
    const history: ConsentRecord[] = existingHistory ? JSON.parse(existingHistory) : [];
    
    history.push(record);
    
    // Keep only last 100 records
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    localStorage.setItem(CONSENT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save consent history:', error);
  }
}

/**
 * Service-specific configurations
 */
export function getBookingConsents(service: CanonicalService): ConsentItem[] {
  const baseConsents = [
    createPrivacyConsent(true),
    createTermsConsent(true),
    createDataProcessingConsent(service),
  ];

  // Add service-specific consents
  switch (service) {
    case 'marketing-services':
      baseConsents.push(createMarketingConsent(false));
      baseConsents.push(...createCookieConsent().filter(c => c.id !== 'essential-cookies'));
      break;
    case 'web-development-services':
      baseConsents.push(...createCookieConsent());
      break;
    case 'seo-services':
      baseConsents.push(createMarketingConsent(false));
      baseConsents.push(...createCookieConsent().filter(c => ['analytics-cookies', 'marketing-cookies'].includes(c.id)));
      break;
    default:
      baseConsents.push(createMarketingConsent(false));
      baseConsents.push(...createCookieConsent().filter(c => c.id === 'analytics-cookies'));
  }

  return baseConsents;
}

/**
 * Consent expiry utilities
 */
export function getExpiringConsents(consents: ConsentItem[], daysAhead: number = 30): ConsentItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  
  return consents.filter(consent => {
    if (!consent.expiryDate || consent.status !== 'accepted') return false;
    
    const expiryDate = new Date(consent.expiryDate);
    return expiryDate <= cutoffDate;
  });
}

export function renewConsentExpiry(consent: ConsentItem, extensionDays: number = 365): ConsentItem {
  const newExpiryDate = new Date();
  newExpiryDate.setDate(newExpiryDate.getDate() + extensionDays);
  
  return {
    ...consent,
    expiryDate: newExpiryDate.toISOString(),
    consentDate: new Date().toISOString(),
    policyVersion: (parseInt(consent.policyVersion || '1.0') + 0.1).toFixed(1),
  };
}

/**
 * Accessibility helpers
 */
export function generateAriaLabel(consent: ConsentItem): string {
  const status = consent.status === 'accepted' ? 'accepted' : 
                consent.status === 'declined' ? 'declined' : 'pending';
  const required = consent.required ? 'required' : 'optional';
  
  return `${consent.label}, ${required} consent, currently ${status}`;
}

export function announceConsentChange(consent: ConsentItem, newStatus: ConsentStatus): string {
  const action = newStatus === 'accepted' ? 'accepted' : 'declined';
  return `${consent.label} consent has been ${action}`;
}

/**
 * Type guards and validators
 */
export function isValidConsentStatus(status: string): status is ConsentStatus {
  return ['pending', 'accepted', 'declined', 'not-applicable'].includes(status);
}

export function isValidConsentType(type: string): type is ConsentType {
  return ['required', 'optional', 'informational'].includes(type);
}

export function isValidPolicyType(type: string): type is PolicyType {
  return [
    'privacy', 'terms', 'cookies', 'data-processing', 'marketing', 
    'communications', 'cancellation', 'refund', 'liability', 'custom'
  ].includes(type);
}

/**
 * Form integration utilities
 */
export function syncConsentsWithForm(formData: any, consents: ConsentItem[]): ConsentItem[] {
  return consents.map(consent => {
    const formValue = formData[consent.id];
    if (formValue !== undefined) {
      const newStatus: ConsentStatus = formValue ? 'accepted' : 'declined';
      return {
        ...consent,
        status: newStatus,
        consentDate: newStatus === 'accepted' ? new Date().toISOString() : consent.consentDate,
      };
    }
    return consent;
  });
}

export function extractFormDataFromConsents(consents: ConsentItem[]): Record<string, boolean> {
  return consents.reduce((acc, consent) => {
    acc[consent.id] = consent.status === 'accepted';
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Bulk operations
 */
export function acceptAllOptionalConsents(consents: ConsentItem[]): ConsentItem[] {
  return consents.map(consent => 
    !consent.required && consent.status === 'pending'
      ? { ...consent, status: 'accepted', consentDate: new Date().toISOString() }
      : consent
  );
}

export function declineAllOptionalConsents(consents: ConsentItem[]): ConsentItem[] {
  return consents.map(consent => 
    !consent.required && consent.status === 'pending'
      ? { ...consent, status: 'declined' }
      : consent
  );
}

export function resetAllConsents(consents: ConsentItem[]): ConsentItem[] {
  return consents.map(consent => ({
    ...consent,
    status: consent.required ? 'pending' : 'pending',
    consentDate: undefined,
  }));
}

// Global type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    analytics?: {
      track: (eventName: string, properties: Record<string, any>) => void;
    };
  }
}