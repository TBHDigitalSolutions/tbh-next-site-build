# BookingForm Component

A comprehensive, production-ready form component for the Booking domain with advanced validation, accessibility features, conditional logic, and multi-layout support.

## Features

- **Multiple Field Types**: Text, email, phone, textarea, select, radio, checkbox, file upload, and more
- **Advanced Validation**: Real-time validation with custom rules and error handling
- **Conditional Logic**: Show/hide fields based on user input
- **Multiple Layouts**: Single-column, two-column, accordion, and step-by-step layouts
- **File Upload Support**: Drag-and-drop file uploads with validation
- **Auto-save**: Automatic form data saving with recovery
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Responsive Design**: Mobile-first responsive layout
- **Analytics Ready**: Built-in form interaction tracking
- **Customizable**: Extensive theming and custom field renderers

## Installation & Setup

### 1. File Structure
```
src/booking/components/BookingForm/
├── BookingForm.tsx
├── BookingForm.types.ts
├── BookingForm.module.css
└── index.ts
```

### 2. Dependencies
The component requires these utilities from your booking lib:
- `validateFormField()` - Field validation logic
- `sanitizeFormData()` - Data sanitization
- `trackBookingFormEvent()` - Analytics tracking
- Form utility functions (see utils section)

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
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 28px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --radius-full: 999px;
  
  /* Font sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-smooth: 300ms ease;
  
  /* Shadows */
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  /* Fonts */
  --font-body: system-ui, sans-serif;
  --font-heading: inherit;
}
```

## Usage

### Basic Usage
```tsx
import { BookingForm } from '@/booking/components/BookingForm';
import { createIntakeFormFields } from '@/booking/lib/utils';

function IntakeFormPage() {
  const config = {
    service: 'web-development-services',
    variant: 'intake',
    fields: createIntakeFormFields(),
    submission: {
      endpoint: '/api/forms/submit',
      method: 'POST',
      successMessage: 'Thank you for your submission!'
    },
    validation: {
      validateOnBlur: true,
      validateOnChange: false,
      showValidationImmediately: false
    },
    ui: {
      layout: 'single-column',
      showProgress: true,
      grouping: true,
      compact: false,
      showOptionalIndicators: true
    }
  };

  const handleSubmit = async (data) => {
    console.log('Form submitted:', data);
    // Handle form submission
  };

  return (
    <BookingForm
      config={config}
      onSubmit={handleSubmit}
    />
  );
}
```

### Advanced Usage with Custom Fields
```tsx
import { BookingForm } from '@/booking/components/BookingForm';

function CustomFormPage() {
  const config = {
    service: 'web-development-services',
    variant: 'custom',
    fields: [
      {
        id: 'customer.name',
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true,
        validation: {
          minLength: 2,
          maxLength: 100
        },
        helpText: 'Please enter your first and last name'
      },
      {
        id: 'customer.email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'your@email.com',
        required: true,
        helpText: 'We\'ll use this to send you updates'
      },
      {
        id: 'meeting.type',
        type: 'radio',
        label: 'Preferred Meeting Type',
        required: true,
        options: [
          { value: 'video', label: 'Video Call', description: 'Meet via Zoom or Google Meet' },
          { value: 'phone', label: 'Phone Call', description: 'Traditional phone conversation' },
          { value: 'in-person', label: 'In Person', description: 'Meet at our office' }
        ]
      },
      {
        id: 'requirements.projectDescription',
        type: 'textarea',
        label: 'Project Description',
        placeholder: 'Tell us about your project...',
        required: true,
        validation: {
          minLength: 20,
          maxLength: 2000
        }
      }
    ],
    submission: {
      endpoint: '/api/forms/submit',
      method: 'POST',
      autoSave: {
        enabled: true,
        interval: 30,
        key: 'booking-form-autosave'
      }
    },
    validation: {
      validateOnBlur: true,
      validateOnChange: true,
      showValidationImmediately: false
    },
    ui: {
      layout: 'two-column',
      showProgress: true,
      grouping: true,
      compact: false,
      showOptionalIndicators: true
    }
  };

  return (
    <BookingForm
      config={config}
      onSubmit={handleSubmit}
      onChange={(data) => console.log('Form changed:', data)}
      onTrack={(event, properties) => analytics.track(event, properties)}
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `FormConfig` | Complete form configuration |
| `onSubmit` | `(data: FormData) => Promise<void>` | Form submission handler |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | `Partial<FormData>` | `{}` | Initial form data |
| `disabled` | `boolean` | `false` | Disable entire form |
| `loading` | `boolean` | `false` | Show loading state |
| `className` | `string` | `""` | Additional CSS class |
| `onChange` | `(data: Partial<FormData>) => void` | `undefined` | Form data change callback |
| `onValidationError` | `(errors: FormErrors) => void` | `undefined` | Validation error callback |
| `onFileUpload` | `(files: File[], fieldId: string) => Promise<string[]>` | `undefined` | File upload handler |
| `onAutoSave` | `(data: Partial<FormData>) => void` | `undefined` | Auto-save callback |
| `onTrack` | `(event: string, properties: object) => void` | `undefined` | Analytics tracking |
| `customRenderers` | `Record<string, React.ComponentType<FieldRendererProps>>` | `{}` | Custom field renderers |
| `errorDisplay` | `"inline" \| "summary" \| "both"` | `"inline"` | Error display mode |
| `requiredIndicator` | `string` | `"*"` | Required field indicator |
| `optionalIndicator` | `string` | `"(optional)"` | Optional field indicator |

## Form Configuration

### FormConfig Structure
```typescript
interface FormConfig {
  service: CanonicalService;
  variant: FormVariant;
  fields: FormField[];
  submission: SubmissionConfig;
  validation: ValidationConfig;
  ui: UIConfig;
}
```

### Field Types

**Text Fields**
- `text` - Single-line text input
- `email` - Email address with validation
- `phone` - Phone number with formatting
- `url` - URL with validation
- `number` - Numeric input with min/max
- `textarea` - Multi-line text area

**Selection Fields**
- `select` - Dropdown selection
- `radio` - Single choice from options
- `checkbox` - Multiple selections or single toggle

**Date/Time Fields**
- `date` - Date picker
- `time` - Time picker
- `datetime` - Date and time picker

**File Upload**
- `file` - File upload with drag-and-drop

### Field Validation

```typescript
interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  custom?: (value: any, formData: FormData) => string | null;
}
```

### Conditional Logic

```typescript
interface ConditionalLogic {
  dependsOn: string;
  showWhen: any;
  operator?: "equals" | "not-equals" | "contains" | "greater-than" | "less-than";
}
```

Example:
```typescript
{
  id: 'meeting.location',
  type: 'text',
  label: 'Meeting Location',
  required: true,
  conditional: {
    dependsOn: 'meeting.type',
    showWhen: 'in-person',
    operator: 'equals'
  }
}
```

## Pre-built Form Configurations

### Intake Form
```typescript
import { createIntakeFormFields } from '@/booking/lib/utils';

const intakeConfig = {
  service: 'web-development-services',
  variant: 'intake',
  fields: createIntakeFormFields(),
  // ... other config
};
```

### Consultation Form
```typescript
import { createConsultationFormFields } from '@/booking/lib/utils';

const consultationConfig = {
  service: 'web-development-services',
  variant: 'consultation',
  fields: createConsultationFormFields(),
  // ... other config
};
```

### Quote Request Form
```typescript
import { createQuoteFormFields } from '@/booking/lib/utils';

const quoteConfig = {
  service: 'web-development-services',
  variant: 'quote',
  fields: createQuoteFormFields(),
  // ... other config
};
```

## Advanced Features

### File Upload Configuration
```typescript
{
  id: 'requirements.attachments',
  type: 'file',
  label: 'Project Files',
  required: false,
  validation: {
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedFileTypes: [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword'
    ]
  },
  helpText: 'Upload any relevant documents or images'
}
```

### Auto-save Configuration
```typescript
submission: {
  endpoint: '/api/forms/submit',
  method: 'POST',
  autoSave: {
    enabled: true,
    interval: 30, // seconds
    key: 'booking-form-autosave'
  }
}
```

### Custom Field Renderers
```typescript
const customRenderers = {
  'custom-rating': RatingFieldRenderer,
  'custom-slider': SliderFieldRenderer,
};

<BookingForm
  config={config}
  customRenderers={customRenderers}
  onSubmit={handleSubmit}
/>
```

### Multi-step Forms
```typescript
ui: {
  layout: 'steps',
  showProgress: true,
  progressPosition: 'top',
  grouping: true,
  compact: false,
  showOptionalIndicators: true
}
```

## Form Layouts

### Single Column (Default)
Best for most forms. Fields are stacked vertically.

### Two Column
Arranges fields in a two-column grid. Good for forms with many short fields.

### Accordion
Groups related fields in collapsible sections.

### Steps
Multi-step wizard with progress indication.

## Validation

### Built-in Validation
- Required fields
- Email format
- Phone number format
- URL format
- Number ranges
- Text length limits
- File type and size restrictions

### Custom Validation
```typescript
{
  id: 'customer.password',
  type: 'text',
  label: 'Password',
  required: true,
  validation: {
    custom: (value, formData) => {
      if (value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain an uppercase letter';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain a number';
      }
      return null;
    }
  }
}
```

### Validation Timing
- `validateOnBlur` - Validate when field loses focus
- `validateOnChange` - Validate on every keystroke
- `showValidationImmediately` - Show errors immediately

## Accessibility

### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper form structure with labels and fieldsets
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Focus Management**: Visible focus indicators
- **Error Handling**: Clear error messages associated with fields

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Shift + Tab` | Navigate backwards |
| `Enter` | Submit form or select option |
| `Space` | Toggle checkboxes and radio buttons |
| `Arrow Keys` | Navigate radio button groups |
| `Escape` | Clear field or close dropdowns |

## Performance

### Optimization Features
- **Lazy Validation**: Only validate when necessary
- **Debounced Auto-save**: Prevent excessive save operations
- **Efficient Rendering**: Minimal re-renders with React.memo
- **Code Splitting**: Dynamic imports for complex field types

### Performance Targets
- **Initial Render**: < 300ms
- **Field Interaction**: < 50ms response time
- **Form Submission**: < 1s processing time
- **Bundle Size**: < 60KB gzipped

## Testing

### Running Tests
```bash
# Run validation tests
npm run test:form

# Run accessibility tests
npm run test:a11y:form

# Run performance tests
npm run test:perf:form
```

### Test Coverage
- **Unit Tests**: Field validation and form logic
- **Integration Tests**: Form submission and data flow
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Render times and interaction speeds
- **E2E Tests**: Complete user workflows

## Analytics

### Tracked Events
- `booking_form_view` - Initial form view
- `booking_form_field_focus` - Field interaction start
- `booking_form_field_change` - Field value changes
- `booking_form_submit` - Form submission attempts
- `booking_form_complete` - Successful submissions
- `booking_form_abandon` - Form abandonment

### Analytics Integration
```typescript
<BookingForm
  config={config}
  onSubmit={handleSubmit}
  onTrack={(event, properties) => {
    // Google Analytics
    gtag('event', event, properties);
    
    // Mixpanel
    mixpanel.track(event, properties);
    
    // Custom analytics
    analytics.track(event, properties);
  }}
/>
```

## Error Handling

### Common Issues

**Validation Errors**
- Check field configuration and validation rules
- Verify required fields have values
- Ensure custom validation functions return proper types

**Submission Failures**
- Verify endpoint URL and method
- Check network connectivity
- Validate request format and authentication

**File Upload Issues**
- Check file size and type restrictions
- Verify upload endpoint configuration
- Handle upload progress and errors gracefully

### Debug Mode
Enable detailed logging:
```typescript
<BookingForm
  config={config}
  onSubmit={handleSubmit}
  onTrack={(event, properties) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Form Event:', event, properties);
    }
  }}
/>
```

## Customization

### Theming
Use CSS custom properties to customize appearance:
```css
.booking-form {
  --accent-primary: #your-brand-color;
  --border-radius: 8px;
  --font-family: 'Your Font', sans-serif;
}
```

### Custom Field Types
Create custom field renderers:
```typescript
const CustomSliderRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled
}) => {
  return (
    <div className="custom-slider">
      <input
        type="range"
        min={field.validation?.min || 0}
        max={field.validation?.max || 100}
        value={value || 50}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
      {error && <div className="error">{error}</div>}
    </div>
  );
};
```

## Deployment Checklist

### Pre-deployment
- [ ] All validation tests passing
- [ ] Accessibility audit complete
- [ ] Form configurations validated
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] Analytics tracking verified
- [ ] Cross-browser testing complete
- [ ] Mobile responsiveness confirmed

### Production Setup
- [ ] Form submission endpoints configured
- [ ] File upload storage configured
- [ ] Auto-save storage configured
- [ ] Analytics tracking enabled
- [ ] Error monitoring set up
- [ ] Rate limiting configured

### Post-deployment
- [ ] Monitor form submission rates
- [ ] Track validation error patterns
- [ ] Monitor performance metrics
- [ ] Validate analytics data
- [ ] Test user workflows
- [ ] Monitor auto-save functionality

## Troubleshooting

### Form Not Submitting
1. Check network requests in browser dev tools
2. Verify endpoint URL and method
3. Check form validation status
4. Verify required fields are completed

### Validation Not Working
1. Check field configuration
2. Verify validation rules syntax
3. Test with known valid/invalid data
4. Check console for JavaScript errors

### Auto-save Not Working
1. Verify auto-save configuration
2. Check local storage permissions
3. Test callback function implementation
4. Monitor console for errors

### Accessibility Issues
1. Run automated accessibility scanner
2. Test with screen reader
3. Verify keyboard navigation
4. Check color contrast ratios

## Maintenance

### Regular Tasks
- Update form field configurations
- Review validation rules effectiveness
- Monitor form completion rates
- Update accessibility standards compliance
- Review and optimize performance

### Updates and Versioning
When updating the component:
1. Run full test suite
2. Update documentation
3. Test with existing form configurations
4. Verify backwards compatibility
5. Update changelog

## Support

For issues and questions:
1. Check component documentation
2. Review field configuration syntax
3. Test with minimal configuration
4. Check browser console for errors
5. Contact development team with specific details

---

**Version**: 1.0.0
**Last Updated**: 2025-09-15
**Compatibility**: React 19+, Next.js 15+