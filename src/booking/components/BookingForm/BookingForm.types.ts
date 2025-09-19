// src/booking/components/BookingForm/BookingForm.types.ts
// Types for the booking form component

import type { CanonicalService, BookingProvider } from "../../lib/types";

// Form field types
export interface FormField {
  /** Field identifier */
  id: string;
  /** Field type */
  type: FieldType;
  /** Display label */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is required */
  required: boolean;
  /** Validation rules */
  validation?: FieldValidation;
  /** Field options for select/radio */
  options?: FieldOption[];
  /** Default value */
  defaultValue?: any;
  /** Help text */
  helpText?: string;
  /** Field group for organization */
  group?: string;
  /** Conditional display logic */
  conditional?: ConditionalLogic;
  /** Custom field properties */
  properties?: Record<string, any>;
}

export type FieldType = 
  | "text" 
  | "email" 
  | "phone" 
  | "textarea" 
  | "select" 
  | "radio" 
  | "checkbox" 
  | "date" 
  | "time" 
  | "datetime" 
  | "number" 
  | "url" 
  | "file";

export interface FieldValidation {
  /** Minimum length for text fields */
  minLength?: number;
  /** Maximum length for text fields */
  maxLength?: number;
  /** Pattern for regex validation */
  pattern?: string;
  /** Custom validation function */
  custom?: (value: any, formData: FormData) => string | null;
  /** Minimum value for numbers */
  min?: number;
  /** Maximum value for numbers */
  max?: number;
  /** File type restrictions */
  acceptedFileTypes?: string[];
  /** Maximum file size in bytes */
  maxFileSize?: number;
}

export interface FieldOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Additional description */
  description?: string;
}

export interface ConditionalLogic {
  /** Field ID to watch */
  dependsOn: string;
  /** Value that triggers display */
  showWhen: any;
  /** Operator for comparison */
  operator?: "equals" | "not-equals" | "contains" | "greater-than" | "less-than";
}

// Form data structure
export interface FormData {
  /** Customer information */
  customer: CustomerFormData;
  /** Meeting preferences */
  meeting: MeetingFormData;
  /** Additional requirements */
  requirements?: RequirementsFormData;
  /** Marketing preferences */
  marketing?: MarketingFormData;
  /** Custom fields */
  custom?: Record<string, any>;
}

export interface CustomerFormData {
  /** Full name */
  name: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone?: string;
  /** Company name */
  company?: string;
  /** Job title */
  title?: string;
  /** Timezone */
  timezone: string;
}

export interface MeetingFormData {
  /** Preferred meeting type */
  type: "video" | "phone" | "in-person";
  /** Meeting duration preference */
  duration?: number;
  /** Preferred time slots */
  preferredTimes?: string[];
  /** Meeting location for in-person */
  location?: string;
  /** Special instructions */
  instructions?: string;
}

export interface RequirementsFormData {
  /** Project description */
  projectDescription?: string;
  /** Budget range */
  budget?: string;
  /** Timeline requirements */
  timeline?: string;
  /** Specific goals */
  goals?: string[];
  /** Additional notes */
  notes?: string;
}

export interface MarketingFormData {
  /** Email marketing consent */
  emailConsent: boolean;
  /** SMS marketing consent */
  smsConsent?: boolean;
  /** How they heard about us */
  source?: string;
  /** UTM parameters */
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

// Form configuration
export interface FormConfig {
  /** Service this form is for */
  service: CanonicalService;
  /** Form variant */
  variant: FormVariant;
  /** Available form fields */
  fields: FormField[];
  /** Form submission settings */
  submission: SubmissionConfig;
  /** Validation settings */
  validation: ValidationConfig;
  /** UI settings */
  ui: UIConfig;
}

export type FormVariant = "intake" | "consultation" | "quote" | "contact" | "custom";

export interface SubmissionConfig {
  /** Submission endpoint */
  endpoint: string;
  /** HTTP method */
  method: "POST" | "PUT";
  /** Success redirect URL */
  successUrl?: string;
  /** Success message */
  successMessage?: string;
  /** Auto-save settings */
  autoSave?: {
    enabled: boolean;
    interval: number; // seconds
    key: string;
  };
  /** File upload settings */
  fileUpload?: {
    enabled: boolean;
    maxFiles: number;
    maxSize: number; // bytes
    allowedTypes: string[];
    endpoint: string;
  };
}

export interface ValidationConfig {
  /** Validate on blur */
  validateOnBlur: boolean;
  /** Validate on change */
  validateOnChange: boolean;
  /** Show validation immediately */
  showValidationImmediately: boolean;
  /** Custom validation messages */
  messages?: Record<string, string>;
}

export interface UIConfig {
  /** Form layout */
  layout: "single-column" | "two-column" | "accordion" | "steps";
  /** Show progress indicator */
  showProgress: boolean;
  /** Progress position */
  progressPosition?: "top" | "bottom" | "sticky";
  /** Field grouping */
  grouping: boolean;
  /** Compact mode */
  compact: boolean;
  /** Show optional field indicators */
  showOptionalIndicators: boolean;
}

// Main component props
export interface BookingFormProps {
  /** Form configuration */
  config: FormConfig;
  /** Initial form data */
  initialData?: Partial<FormData>;
  /** Whether form is disabled */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Form submission callback */
  onSubmit: (data: FormData) => Promise<void>;
  /** Form data change callback */
  onChange?: (data: Partial<FormData>) => void;
  /** Validation error callback */
  onValidationError?: (errors: FormErrors) => void;
  /** File upload callback */
  onFileUpload?: (files: File[], fieldId: string) => Promise<string[]>;
  /** Auto-save callback */
  onAutoSave?: (data: Partial<FormData>) => void;
  /** Analytics callback */
  onTrack?: (event: string, properties: Record<string, any>) => void;
  /** Custom field renderers */
  customRenderers?: Record<string, React.ComponentType<FieldRendererProps>>;
  /** Error display mode */
  errorDisplay?: "inline" | "summary" | "both";
  /** Required field indicator */
  requiredIndicator?: string;
  /** Optional field indicator */
  optionalIndicator?: string;
}

// Form state management
export interface FormState {
  /** Current form data */
  data: Partial<FormData>;
  /** Validation errors */
  errors: FormErrors;
  /** Touched fields */
  touched: Set<string>;
  /** Loading state */
  loading: boolean;
  /** Submission state */
  submitting: boolean;
  /** Form validity */
  isValid: boolean;
  /** Current step (for multi-step forms) */
  currentStep: number;
  /** Auto-save status */
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
  /** File uploads in progress */
  uploading: Set<string>;
}

export interface FormErrors {
  /** Field-level errors */
  fields: Record<string, string>;
  /** Form-level errors */
  form?: string;
  /** Server-side errors */
  server?: string[];
}

// Field renderer props
export interface FieldRendererProps {
  /** Field configuration */
  field: FormField;
  /** Current field value */
  value: any;
  /** Field error message */
  error?: string;
  /** Whether field is disabled */
  disabled: boolean;
  /** Whether field is required */
  required: boolean;
  /** Whether field has been touched */
  touched: boolean;
  /** Field change handler */
  onChange: (value: any) => void;
  /** Field blur handler */
  onBlur: () => void;
  /** Field focus handler */
  onFocus: () => void;
  /** Additional props */
  [key: string]: any;
}

// Form validation result
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Field errors */
  errors: Record<string, string>;
  /** Warnings (non-blocking) */
  warnings?: Record<string, string>;
}

// Form submission data
export interface SubmissionData extends FormData {
  /** Form metadata */
  metadata: {
    /** Form ID */
    formId: string;
    /** Service */
    service: CanonicalService;
    /** Submission timestamp */
    timestamp: string;
    /** User agent */
    userAgent: string;
    /** Referrer */
    referrer?: string;
    /** UTM parameters */
    utm?: MarketingFormData['utm'];
    /** Form completion time */
    completionTime: number; // seconds
  };
}

// Auto-save data structure
export interface AutoSaveData {
  /** Saved form data */
  data: Partial<FormData>;
  /** Save timestamp */
  timestamp: number;
  /** Form version */
  version: string;
  /** Expiration time */
  expiresAt: number;
}

// Form analytics events
export interface FormAnalyticsEvent {
  /** Event type */
  type: "view" | "start" | "complete" | "abandon" | "error" | "field_focus" | "field_blur";
  /** Form identifier */
  formId: string;
  /** Service context */
  service: CanonicalService;
  /** Field identifier (for field events) */
  fieldId?: string;
  /** Error details (for error events) */
  error?: string;
  /** Completion time (for complete events) */
  completionTime?: number;
  /** Step number (for multi-step forms) */
  step?: number;
  /** Additional properties */
  properties?: Record<string, any>;
}

// Form step configuration (for multi-step forms)
export interface FormStep {
  /** Step identifier */
  id: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Fields in this step */
  fields: string[];
  /** Whether step is optional */
  optional?: boolean;
  /** Step validation rules */
  validation?: (data: Partial<FormData>) => ValidationResult;
  /** Conditional step logic */
  conditional?: ConditionalLogic;
}

// Field group configuration
export interface FieldGroup {
  /** Group identifier */
  id: string;
  /** Group title */
  title: string;
  /** Group description */
  description?: string;
  /** Whether group is collapsible */
  collapsible?: boolean;
  /** Whether group starts collapsed */
  defaultCollapsed?: boolean;
  /** Fields in this group */
  fields: string[];
}

// Form theme customization
export interface FormTheme {
  /** Primary color */
  primaryColor?: string;
  /** Error color */
  errorColor?: string;
  /** Success color */
  successColor?: string;
  /** Border radius */
  borderRadius?: string;
  /** Font family */
  fontFamily?: string;
  /** Input height */
  inputHeight?: string;
  /** Spacing unit */
  spacing?: string;
}