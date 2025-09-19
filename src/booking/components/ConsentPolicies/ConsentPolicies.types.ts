// src/booking/components/ConsentPolicies/ConsentPolicies.types.ts
// Types for the consent and policies component

import type { CanonicalService } from "../../lib/types";

// Consent types
export type ConsentType = 
  | "required" // Must be accepted to proceed
  | "optional" // Can be declined
  | "informational"; // Information only, no consent needed

// Policy types
export type PolicyType = 
  | "privacy" 
  | "terms" 
  | "cookies" 
  | "data-processing" 
  | "marketing" 
  | "communications" 
  | "cancellation" 
  | "refund" 
  | "liability" 
  | "custom";

// Consent status
export type ConsentStatus = "pending" | "accepted" | "declined" | "not-applicable";

// Individual consent item
export interface ConsentItem {
  /** Unique consent identifier */
  id: string;
  /** Consent type */
  type: ConsentType;
  /** Display label */
  label: string;
  /** Detailed description */
  description?: string;
  /** Whether this consent is required */
  required: boolean;
  /** Current consent status */
  status: ConsentStatus;
  /** Related policy document */
  policyType?: PolicyType;
  /** Policy document URL or content */
  policyUrl?: string;
  /** Policy content (if inline) */
  policyContent?: string;
  /** Policy version */
  policyVersion?: string;
  /** When consent was given/declined */
  consentDate?: string;
  /** Consent expiry date */
  expiryDate?: string;
  /** Purpose of data processing */
  purpose?: string;
  /** Legal basis for processing */
  legalBasis?: LegalBasis;
  /** Data categories being processed */
  dataCategories?: string[];
  /** Third parties data may be shared with */
  thirdParties?: ThirdParty[];
  /** User's rights regarding this data */
  userRights?: UserRight[];
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// Legal basis for data processing (GDPR)
export type LegalBasis = 
  | "consent" 
  | "contract" 
  | "legal-obligation" 
  | "vital-interests" 
  | "public-task" 
  | "legitimate-interests";

// Third party data sharing
export interface ThirdParty {
  /** Third party name */
  name: string;
  /** Purpose of sharing */
  purpose: string;
  /** Third party type */
  type: "processor" | "controller" | "joint-controller";
  /** Location/jurisdiction */
  location?: string;
  /** Privacy policy URL */
  privacyPolicyUrl?: string;
}

// User rights under privacy laws
export interface UserRight {
  /** Right type */
  type: "access" | "rectification" | "erasure" | "portability" | "restriction" | "objection" | "automated-decision-making";
  /** Description of the right */
  description: string;
  /** How to exercise this right */
  howToExercise?: string;
  /** Contact information */
  contactInfo?: string;
}

// Policy document
export interface PolicyDocument {
  /** Policy identifier */
  id: string;
  /** Policy type */
  type: PolicyType;
  /** Policy title */
  title: string;
  /** Policy content */
  content: string;
  /** Policy version */
  version: string;
  /** Effective date */
  effectiveDate: string;
  /** Last updated date */
  lastUpdated: string;
  /** Language/locale */
  language: string;
  /** Policy URL (if external) */
  url?: string;
  /** Summary for quick reading */
  summary?: string;
  /** Key points */
  keyPoints?: string[];
}

// Main component props
export interface ConsentPoliciesProps {
  /** Array of consent items to display */
  consents: ConsentItem[];
  /** Service context for customization */
  service?: CanonicalService;
  /** Display variant */
  variant?: ConsentVariant;
  /** Layout orientation */
  layout?: "vertical" | "horizontal" | "grid";
  /** Show policy previews inline */
  showPolicyPreviews?: boolean;
  /** Show consent date/time */
  showConsentDates?: boolean;
  /** Show legal basis information */
  showLegalBasis?: boolean;
  /** Show data processing purposes */
  showDataProcessing?: boolean;
  /** Show third party information */
  showThirdParties?: boolean;
  /** Show user rights */
  showUserRights?: boolean;
  /** Allow consent withdrawal */
  allowWithdrawal?: boolean;
  /** Compact mode for limited space */
  compact?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Callback when consent status changes */
  onConsentChange?: (consentId: string, status: ConsentStatus, metadata?: any) => void;
  /** Callback when policy is viewed */
  onPolicyView?: (policyType: PolicyType, consentId: string) => void;
  /** Callback for analytics tracking */
  onTrack?: (event: string, properties: Record<string, any>) => void;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Custom consent renderer */
  customConsentRenderer?: (consent: ConsentItem, index: number) => React.ReactNode;
  /** Custom policy renderer */
  customPolicyRenderer?: (policy: PolicyDocument) => React.ReactNode;
  /** Validation errors */
  validationErrors?: Record<string, string>;
  /** Show validation immediately */
  showValidationImmediately?: boolean;
}

// Display variants
export type ConsentVariant = 
  | "standard" // Standard checkboxes with labels
  | "detailed" // Full descriptions and legal information
  | "minimal" // Compact with essential information only
  | "modal" // Modal overlay with full policy text
  | "inline" // Inline policy text with consents
  | "wizard"; // Step-by-step consent flow

// Component state
export interface ConsentState {
  /** Current consent statuses */
  consentStatuses: Record<string, ConsentStatus>;
  /** Expanded policy views */
  expandedPolicies: Set<string>;
  /** Currently viewing policy */
  viewingPolicy?: PolicyDocument;
  /** Modal open state */
  modalOpen: boolean;
  /** Loading states for individual consents */
  loading: Set<string>;
  /** Validation errors */
  errors: Record<string, string>;
  /** Consent history */
  consentHistory: ConsentRecord[];
}

// Consent record for history tracking
export interface ConsentRecord {
  /** Consent ID */
  consentId: string;
  /** Status at time of record */
  status: ConsentStatus;
  /** Timestamp */
  timestamp: string;
  /** User agent */
  userAgent?: string;
  /** IP address (if available) */
  ipAddress?: string;
  /** Policy version at time of consent */
  policyVersion?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// Consent validation
export interface ConsentValidation {
  /** Whether all required consents are given */
  isValid: boolean;
  /** Missing required consents */
  missingRequired: string[];
  /** Expired consents */
  expiredConsents: string[];
  /** Invalid consent states */
  invalidStates: string[];
  /** Validation errors */
  errors: Record<string, string>;
}

// Analytics events
export type ConsentEvent = 
  | "consent_view"
  | "consent_accept" 
  | "consent_decline"
  | "consent_withdraw"
  | "policy_view"
  | "policy_download"
  | "consent_error"
  | "consent_validation";

export interface ConsentAnalytics {
  /** Event type */
  event: ConsentEvent;
  /** Consent ID */
  consentId?: string;
  /** Policy type */
  policyType?: PolicyType;
  /** Service context */
  service?: CanonicalService;
  /** Consent status */
  status?: ConsentStatus;
  /** Timestamp */
  timestamp: number;
  /** Additional properties */
  properties?: Record<string, any>;
}

// Consent preferences
export interface ConsentPreferences {
  /** Marketing communications */
  marketing: boolean;
  /** Analytics cookies */
  analytics: boolean;
  /** Functional cookies */
  functional: boolean;
  /** Performance tracking */
  performance: boolean;
  /** Third-party integrations */
  thirdParty: boolean;
  /** Email notifications */
  emailNotifications: boolean;
  /** SMS notifications */
  smsNotifications: boolean;
  /** Push notifications */
  pushNotifications: boolean;
  /** Data sharing */
  dataSharing: boolean;
  /** Personalization */
  personalization: boolean;
}

// Cookie consent specifics
export interface CookieConsent {
  /** Essential cookies (always required) */
  essential: boolean;
  /** Analytics cookies */
  analytics: boolean;
  /** Marketing cookies */
  marketing: boolean;
  /** Functional cookies */
  functional: boolean;
  /** Preference cookies */
  preferences: boolean;
}

// GDPR/CCPA compliance data
export interface ComplianceData {
  /** User's jurisdiction */
  jurisdiction: "EU" | "CA" | "US" | "UK" | "OTHER";
  /** Applicable regulations */
  regulations: ("GDPR" | "CCPA" | "PIPEDA" | "UK-GDPR")[];
  /** Data controller information */
  dataController: {
    name: string;
    address: string;
    email: string;
    phone?: string;
    dpoEmail?: string;
  };
  /** Data protection officer contact */
  dpo?: {
    name: string;
    email: string;
    phone?: string;
  };
  /** Supervisory authority */
  supervisoryAuthority?: {
    name: string;
    website: string;
    complaintUrl: string;
  };
}

// Consent export data
export interface ConsentExportData {
  /** User identifier */
  userId?: string;
  /** Export timestamp */
  exportDate: string;
  /** Consent records */
  consents: ConsentRecord[];
  /** Policy versions */
  policyVersions: Record<string, string>;
  /** Compliance data */
  compliance: ComplianceData;
  /** Export format version */
  version: string;
}

// Accessibility configuration
export interface ConsentAccessibility {
  /** ARIA labels for consents */
  ariaLabels?: Record<string, string>;
  /** Screen reader announcements */
  announcements?: Record<string, string>;
  /** Keyboard navigation */
  keyboardNavigation?: boolean;
  /** High contrast mode */
  highContrast?: boolean;
  /** Large text mode */
  largeText?: boolean;
  /** Simplified language */
  simplifiedLanguage?: boolean;
}

// Internationalization
export interface ConsentI18n {
  /** Language code */
  language: string;
  /** Consent translations */
  consents: Record<string, {
    label: string;
    description?: string;
    purpose?: string;
  }>;
  /** Common UI translations */
  ui: {
    accept: string;
    decline: string;
    acceptAll: string;
    declineAll: string;
    customize: string;
    save: string;
    cancel: string;
    learnMore: string;
    withdraw: string;
    viewPolicy: string;
    required: string;
    optional: string;
    lastUpdated: string;
    effectiveDate: string;
    version: string;
  };
}

// Theme customization
export interface ConsentTheme {
  /** Primary color */
  primaryColor?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Border color */
  borderColor?: string;
  /** Border radius */
  borderRadius?: string;
  /** Font family */
  fontFamily?: string;
  /** Font size */
  fontSize?: string;
  /** Spacing unit */
  spacing?: string;
}