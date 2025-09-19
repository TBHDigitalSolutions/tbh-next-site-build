# ConsentPolicies Component

A comprehensive consent and policy management component for GDPR/CCPA compliance, featuring multiple display variants, policy previews, accessibility support, and analytics integration.

## Features

- **GDPR/CCPA Compliance**: Full support for privacy regulations with proper consent tracking
- **Multiple Display Variants**: Standard, detailed, minimal, modal, inline, and wizard modes
- **Policy Management**: Inline policy previews, external links, and modal displays
- **Consent Tracking**: Complete audit trail with timestamps and user agent tracking
- **User Rights**: Display and management of data subject rights (access, rectification, erasure)
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Analytics Ready**: Built-in tracking for consent interactions and compliance metrics
- **Cookie Management**: Specialized cookie consent with categorization
- **Withdrawal Support**: Easy consent withdrawal with audit trail

## Installation & Setup

### 1. File Structure
```
src/booking/components/ConsentPolicies/
├── ConsentPolicies.tsx
├── ConsentPolicies.types.ts
├── ConsentPolicies.module.css
└── index.ts
```

### 2. Dependencies
The component requires these utilities from your booking lib:
- `trackConsentEvent()` - Analytics tracking
- Consent utility functions (see utils section)
- Policy document management

### 3. CSS Variables
Ensure your CSS includes these custom properties:
```css
:root {
  /* Background colors */
  --bg-surface: #ffffff;
  --bg-elevated: #f8f9fa;
  --bg-secondary: #f1f5f9;
  
  /* Text colors */
  --text-primary: #121417;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-danger: #dc2626;
  
  /* Border colors */
  --border-subtle: #e5e5e5;
  --border-strong: #d1d5db;
  
  /* Accent colors */
  --accent-primary: #0ea5e9;
  --accent-secondary: #0284c7;
  --accent-contrast: #ffffff;
  
  /* Success colors */
  --success-primary: #10b981;
  --success-contrast: #ffffff;
  
  /* Warning colors */
  --warning-primary: #f59e0b;
  
  /* Additional styling variables */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --transition-fast: 150ms ease;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

## Usage

### Basic Usage
```

# ConsentPolicies Component

A comprehensive consent and policy management component for GDPR/CCPA compliance, featuring multiple display variants, policy previews, accessibility support, and analytics integration.

## Features

- **GDPR/CCPA Compliance**: Full support for privacy regulations with proper consent tracking
- **Multiple Display Variants**: Standard, detailed, minimal, modal, inline, and wizard modes
- **Policy Management**: Inline policy previews, external links, and modal displays
- **Consent Tracking**: Complete audit trail with timestamps and user agent tracking
- **User Rights**: Display and management of data subject rights (access, rectification, erasure)
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Analytics Ready**: Built-in tracking for consent interactions and compliance metrics
- **Cookie Management**: Specialized cookie consent with categorization
- **Withdrawal Support**: Easy consent withdrawal with audit trail

## Installation & Setup

### 1. File Structure
```
src/booking/components/ConsentPolicies/
├── ConsentPolicies.tsx
├── ConsentPolicies.types.ts
├── ConsentPolicies.module.css
├── lib/
│   ├── utils.ts
│   └── index.ts
├── index.ts
└── README.md
```

### 2. Dependencies
The component requires these utilities from your booking lib:
- `trackConsentEvent()` - Analytics tracking
- Consent utility functions (see lib/utils.ts)
- Policy document management

### 3. CSS Variables
Ensure your CSS includes these custom properties:
```css
:root {
  /* Background colors */
  --bg-surface: #ffffff;
  --bg-elevated: #f8f9fa;
  --bg-secondary: #f1f5f9;
  
  /* Text colors */
  --text-primary: #121417;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-danger: #dc2626;
  
  /* Border colors */
  --border-subtle: #e5e5e5;
  --border-strong: #d1d5db;
  
  /* Accent colors */
  --accent-primary: #0ea5e9;
  --accent-secondary: #0284c7;
  --accent-contrast: #ffffff;
  
  /* Success colors */
  --success-primary: #10b981;
  --success-contrast: #ffffff;
  
  /* Warning colors */
  --warning-primary: #f59e0b;
  
  /* Additional styling variables */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --transition-fast: 150ms ease;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

## Usage

### Basic Usage
```tsx
import { ConsentPolicies } from '@/booking/components/ConsentPolicies';
import { getBookingConsents } from '@/booking/components/ConsentPolicies/lib/utils';

function BookingPage() {
  const [consents, setConsents] = useState(() => 
    getBookingConsents('web-development-services')
  );

  const handleConsentChange = (consentId: string, status: ConsentStatus) => {
    setConsents(prev => prev.map(consent => 
      consent.id === consentId 
        ? { ...consent, status, consentDate: status === 'accepted' ? new Date().toISOString() : undefined }
        : consent
    ));
  };

  return (
    <ConsentPolicies
      consents={consents}
      service="web-development-services"
      variant="standard"
      onConsentChange={handleConsentChange}
    />
  );
}
```

### Advanced Usage with Full Features
```tsx
import { ConsentPolicies } from '@/booking/components/ConsentPolicies';
import { 
  getBookingConsents,
  validateAllConsents,
  saveConsentsToStorage,
} from '@/booking/components/ConsentPolicies/lib/utils';

function AdvancedConsentPage() {
  const [consents, setConsents] = useState(() => 
    getBookingConsents('marketing-services')
  );
  const [showValidation, setShowValidation] = useState(false);

  const validation = validateAllConsents(consents);

  const handleConsentChange = (consentId: string, status: ConsentStatus, metadata?: any