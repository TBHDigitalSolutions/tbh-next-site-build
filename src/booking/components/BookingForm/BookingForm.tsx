"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { validateFormField, sanitizeFormData } from "../../lib/utils";
import { trackBookingFormEvent } from "../../lib/metrics";
import styles from "./BookingForm.module.css";
import type {
  BookingFormProps,
  FormState,
  FormData,
  FormField,
  FormErrors,
  ValidationResult,
  FieldRendererProps,
} from "./BookingForm.types";

// Icons - replace with your icon library in production
const RequiredIcon = () => <span className={styles.requiredIndicator}>*</span>;
const OptionalIcon = () => <span className={styles.optionalIndicator}>(optional)</span>;
const ErrorIcon = () => <span>⚠️</span>;
const SuccessIcon = () => <span>✅</span>;
const ChevronIcon = () => <span>▼</span>;
const UploadIcon = () => <span>📁</span>;
const FileIcon = () => <span>📄</span>;
const RemoveIcon = () => <span>✕</span>;
const SaveIcon = () => <span>💾</span>;

// Default form configuration
const DEFAULT_CONFIG = {
  validation: {
    validateOnBlur: true,
    validateOnChange: false,
    showValidationImmediately: false,
    messages: {},
  },
  ui: {
    layout: "single-column" as const,
    showProgress: false,
    grouping: true,
    compact: false,
    showOptionalIndicators: true,
  },
};

export default function BookingForm(props: BookingFormProps) {
  const {
    config,
    initialData = {},
    disabled = false,
    loading = false,
    className = "",
    onSubmit,
    onChange,
    onValidationError,
    onFileUpload,
    onAutoSave,
    onTrack,
    customRenderers = {},
    errorDisplay = "inline",
    requiredIndicator = "*",
    optionalIndicator = "(optional)",
  } = props;

  // Merge config with defaults
  const finalConfig = useMemo(() => ({
    ...config,
    validation: { ...DEFAULT_CONFIG.validation, ...config.validation },
    ui: { ...DEFAULT_CONFIG.ui, ...config.ui },
  }), [config]);

  // Form state
  const [state, setState] = useState<FormState>(() => ({
    data: { ...initialData },
    errors: { fields: {} },
    touched: new Set(),
    loading: false,
    submitting: false,
    isValid: false,
    currentStep: 0,
    autoSaveStatus: "idle",
    uploading: new Set(),
  }));

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef(Date.now());
  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Track form view on mount
  useEffect(() => {
    trackBookingFormEvent({
      type: "view",
      formId: `${config.service}-${config.variant}`,
      service: config.service,
      timestamp: Date.now(),
    });

    onTrack?.("booking_form_view", {
      service: config.service,
      variant: config.variant,
      form_id: `${config.service}-${config.variant}`,
    });
  }, [config.service, config.variant, onTrack]);

  // Auto-save functionality
  useEffect(() => {
    if (!config.submission.autoSave?.enabled) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (Object.keys(state.data).length > 0) {
        setState(prev => ({ ...prev, autoSaveStatus: "saving" }));
        
        onAutoSave?.(state.data);
        
        // Simulate auto-save completion
        setTimeout(() => {
          setState(prev => ({ ...prev, autoSaveStatus: "saved" }));
          setTimeout(() => {
            setState(prev => ({ ...prev, autoSaveStatus: "idle" }));
          }, 2000);
        }, 500);
      }
    }, (config.submission.autoSave.interval || 30) * 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.data, config.submission.autoSave, onAutoSave]);

  // Validate form field
  const validateField = useCallback((field: FormField, value: any, formData: Partial<FormData>): string | null => {
    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    // Skip validation for empty optional fields
    if (!field.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'phone':
        const phoneRegex = /^[\+]?[\d\s\(\)\-\.]{10,}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number';
        }
        break;

      case 'url':
        try {
          new URL(value);
        } catch {
          return 'Please enter a valid URL';
        }
        break;

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return 'Please enter a valid number';
        }
        if (field.validation?.min !== undefined && num < field.validation.min) {
          return `Value must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          return `Value must be no more than ${field.validation.max}`;
        }
        break;
    }

    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `${field.label} must be no more than ${field.validation.maxLength} characters`;
    }

    // Pattern validation
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    // Custom validation
    if (field.validation?.custom) {
      return field.validation.custom(value, formData as FormData);
    }

    return null;
  }, []);

  // Validate entire form
  const validateForm = useCallback((data: Partial<FormData>): ValidationResult => {
    const errors: Record<string, string> = {};
    
    for (const field of config.fields) {
      // Check conditional logic
      if (field.conditional && !shouldShowField(field, data)) {
        continue;
      }

      const fieldPath = field.id;
      const fieldValue = getFieldValue(data, fieldPath);
      const error = validateField(field, fieldValue, data);
      
      if (error) {
        errors[fieldPath] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [config.fields, validateField]);

  // Get field value from nested form data
  const getFieldValue = useCallback((data: Partial<FormData>, fieldPath: string): any => {
    const parts = fieldPath.split('.');
    let value: any = data;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }, []);

  // Set field value in nested form data
  const setFieldValue = useCallback((data: Partial<FormData>, fieldPath: string, value: any): Partial<FormData> => {
    const parts = fieldPath.split('.');
    const newData = { ...data };
    let current: any = newData;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current[part] = { ...current[part] };
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
    return newData;
  }, []);

  // Check if field should be shown based on conditional logic
  const shouldShowField = useCallback((field: FormField, data: Partial<FormData>): boolean => {
    if (!field.conditional) return true;

    const dependencyValue = getFieldValue(data, field.conditional.dependsOn);
    const showWhen = field.conditional.showWhen;
    const operator = field.conditional.operator || 'equals';

    switch (operator) {
      case 'equals':
        return dependencyValue === showWhen;
      case 'not-equals':
        return dependencyValue !== showWhen;
      case 'contains':
        return Array.isArray(dependencyValue) && dependencyValue.includes(showWhen);
      case 'greater-than':
        return Number(dependencyValue) > Number(showWhen);
      case 'less-than':
        return Number(dependencyValue) < Number(showWhen);
      default:
        return true;
    }
  }, [getFieldValue]);

  // Handle field change
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setState(prev => {
      const newData = setFieldValue(prev.data, fieldId, value);
      const field = config.fields.find(f => f.id === fieldId);
      
      let newErrors = { ...prev.errors };
      
      // Validate on change if enabled
      if (finalConfig.validation.validateOnChange && field) {
        const error = validateField(field, value, newData);
        if (error) {
          newErrors.fields = { ...newErrors.fields, [fieldId]: error };
        } else {
          delete newErrors.fields[fieldId];
        }
      }

      // Validate form
      const validation = validateForm(newData);
      
      return {
        ...prev,
        data: newData,
        errors: newErrors,
        isValid: validation.isValid,
      };
    });

    onChange?.(state.data);

    // Track field interaction
    onTrack?.("booking_form_field_change", {
      field_id: fieldId,
      service: config.service,
      form_id: `${config.service}-${config.variant}`,
    });
  }, [config.fields, config.service, config.variant, finalConfig.validation, setFieldValue, validateField, validateForm, onChange, onTrack, state.data]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldId: string) => {
    setState(prev => ({ ...prev, touched: new Set([...prev.touched, fieldId]) }));

    // Validate on blur if enabled
    if (finalConfig.validation.validateOnBlur) {
      const field = config.fields.find(f => f.id === fieldId);
      if (field) {
        const value = getFieldValue(state.data, fieldId);
        const error = validateField(field, value, state.data);
        
        setState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            fields: error 
              ? { ...prev.errors.fields, [fieldId]: error }
              : { ...prev.errors.fields, [fieldId]: undefined }
          }
        }));
      }
    }
  }, [config.fields, finalConfig.validation.validateOnBlur, getFieldValue, state.data, validateField]);

  // Handle file upload
  const handleFileUpload = useCallback(async (fieldId: string, files: File[]) => {
    if (!onFileUpload) return;

    setState(prev => ({ 
      ...prev, 
      uploading: new Set([...prev.uploading, fieldId]) 
    }));

    try {
      const uploadedUrls = await onFileUpload(files, fieldId);
      handleFieldChange(fieldId, uploadedUrls);
    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          fields: { ...prev.errors.fields, [fieldId]: 'File upload failed' }
        }
      }));
    } finally {
      setState(prev => ({ 
        ...prev, 
        uploading: new Set([...prev.uploading].filter(id => id !== fieldId)) 
      }));
    }
  }, [onFileUpload, handleFieldChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.submitting || disabled) return;

    // Validate form
    const validation = validateForm(state.data);
    
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, fields: validation.errors },
        touched: new Set(config.fields.map(f => f.id)),
      }));

      onValidationError?.(prev => ({ ...prev, fields: validation.errors }));
      
      // Focus first error field
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField) {
        const element = fieldRefs.current.get(firstErrorField);
        element?.focus();
      }

      return;
    }

    setState(prev => ({ ...prev, submitting: true }));

    try {
      // Sanitize form data
      const sanitizedData = sanitizeFormData(state.data);
      
      // Add metadata
      const submissionData = {
        ...sanitizedData,
        metadata: {
          formId: `${config.service}-${config.variant}`,
          service: config.service,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          completionTime: Math.round((Date.now() - startTimeRef.current) / 1000),
        },
      };

      await onSubmit(submissionData as FormData);

      // Track successful submission
      trackBookingFormEvent({
        type: "complete",
        formId: `${config.service}-${config.variant}`,
        service: config.service,
        completionTime: submissionData.metadata.completionTime,
        timestamp: Date.now(),
      });

      onTrack?.("booking_form_submit", {
        service: config.service,
        form_id: `${config.service}-${config.variant}`,
        completion_time: submissionData.metadata.completionTime,
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          form: error instanceof Error ? error.message : 'Submission failed'
        }
      }));

      trackBookingFormEvent({
        type: "error",
        formId: `${config.service}-${config.variant}`,
        service: config.service,
        error: error instanceof Error ? error.message : 'Submission failed',
        timestamp: Date.now(),
      });
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  }, [state.submitting, state.data, disabled, validateForm, config.fields, config.service, config.variant, onValidationError, onSubmit, onTrack]);

  // Field renderer
  const renderField = useCallback((field: FormField): React.ReactNode => {
    if (!shouldShowField(field, state.data)) {
      return null;
    }

    const value = getFieldValue(state.data, field.id);
    const error = state.errors.fields[field.id];
    const touched = state.touched.has(field.id);
    const isDisabled = disabled || loading;
    const isUploading = state.uploading.has(field.id);

    const fieldProps: FieldRendererProps = {
      field,
      value,
      error,
      disabled: isDisabled,
      required: field.required,
      touched,
      onChange: (newValue) => handleFieldChange(field.id, newValue),
      onBlur: () => handleFieldBlur(field.id),
      onFocus: () => {
        onTrack?.("booking_form_field_focus", {
          field_id: field.id,
          service: config.service,
        });
      },
    };

    // Use custom renderer if available
    if (customRenderers[field.type]) {
      const CustomRenderer = customRenderers[field.type];
      return <CustomRenderer key={field.id} {...fieldProps} />;
    }

    // Default field rendering
    return (
      <div 
        key={field.id} 
        className={`${styles.field} ${finalConfig.ui.compact ? styles.compact : ''} ${
          error && touched ? styles.invalid : ''
        } ${value && !error ? styles.valid : ''}`}
      >
        <label htmlFor={field.id} className={styles.label}>
          {field.label}
          {field.required ? (
            <RequiredIcon />
          ) : finalConfig.ui.showOptionalIndicators ? (
            <OptionalIcon />
          ) : null}
        </label>

        {renderFieldInput(field, fieldProps, isUploading)}

        {field.helpText && (
          <div className={styles.helpText}>{field.helpText}</div>
        )}

        {error && touched && (
          <div className={styles.errorMessage}>
            <ErrorIcon />
            {error}
          </div>
        )}
      </div>
    );
  }, [
    shouldShowField,
    state.data,
    state.errors.fields,
    state.touched,
    state.uploading,
    disabled,
    loading,
    getFieldValue,
    handleFieldChange,
    handleFieldBlur,
    config.service,
    finalConfig.ui.compact,
    finalConfig.ui.showOptionalIndicators,
    customRenderers,
    onTrack,
  ]);

  // Render field input based on type
  const renderFieldInput = useCallback((
    field: FormField, 
    fieldProps: FieldRendererProps, 
    isUploading: boolean
  ): React.ReactNode => {
    const { value, onChange, onBlur, onFocus, disabled, error } = fieldProps;
    const inputClassName = `${styles.input} ${error ? styles.error : ''}`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.id}
            ref={(el) => el && fieldRefs.current.set(field.id, el)}
            className={`${styles.textarea} ${error ? styles.error : ''}`}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            rows={4}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <select
            id={field.id}
            ref={(el) => el && fieldRefs.current.set(field.id, el)}
            className={`${styles.select} ${error ? styles.error : ''}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
          >
            {field.placeholder && (
              <option value="">{field.placeholder}</option>
            )}
            {field.options?.map((option) => (
              <option 
                key={option.value} 
                value={option.value} 
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className={styles.radioGroup}>
            {field.options?.map((option) => (
              <label key={option.value} className={`${styles.radioOption} ${value === option.value ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  onFocus={onFocus}
                  disabled={disabled || option.disabled}
                  className={styles.radioInput}
                />
                <div>
                  <div className={styles.optionLabel}>{option.label}</div>
                  {option.description && (
                    <div className={styles.optionDescription}>{option.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes
          return (
            <div className={styles.checkboxGroup}>
              {field.options.map((option) => (
                <label key={option.value} className={`${styles.checkboxOption} ${(value || []).includes(option.value) ? styles.selected : ''}`}>
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={(value || []).includes(option.value)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      onChange(newValues);
                    }}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    disabled={disabled || option.disabled}
                    className={styles.checkboxInput}
                  />
                  <div>
                    <div className={styles.optionLabel}>{option.label}</div>
                    {option.description && (
                      <div className={styles.optionDescription}>{option.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <label className={`${styles.checkboxOption} ${value ? styles.selected : ''}`}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled}
                className={styles.checkboxInput}
              />
              <span className={styles.optionLabel}>{field.label}</span>
            </label>
          );
        }

      case 'file':
        return (
          <div className={styles.fileUpload}>
            <input
              type="file"
              id={field.id}
              ref={(el) => el && fieldRefs.current.set(field.id, el)}
              className={styles.fileUploadInput}
              multiple={field.validation?.maxFiles !== 1}
              accept={field.validation?.acceptedFileTypes?.join(',')}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleFileUpload(field.id, files);
                }
              }}
              disabled={disabled || isUploading}
            />
            <div className={styles.fileUploadContent}>
              <div className={styles.fileUploadIcon}>
                <UploadIcon />
              </div>
              <div className={styles.fileUploadText}>
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </div>
              <div className={styles.fileUploadHint}>
                {field.validation?.acceptedFileTypes?.join(', ')} up to {formatFileSize(field.validation?.maxFileSize)}
              </div>
            </div>
            {value && Array.isArray(value) && value.length > 0 && (
              <div className={styles.fileList}>
                {value.map((fileUrl: string, index: number) => (
                  <div key={index} className={styles.fileItem}>
                    <FileIcon />
                    <span className={styles.fileName}>File {index + 1}</span>
                    <button
                      type="button"
                      className={styles.removeFile}
                      onClick={() => {
                        const newFiles = value.filter((_: string, i: number) => i !== index);
                        onChange(newFiles);
                      }}
                    >
                      <RemoveIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            id={field.id}
            ref={(el) => el && fieldRefs.current.set(field.id, el)}
            className={inputClassName}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            step={field.type === 'number' ? 'any' : undefined}
          />
        );
    }
  }, [handleFileUpload]);

  // Format file size
  const formatFileSize = useCallback((bytes?: number): string => {
    if (!bytes) return '10MB';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Group fields by their group property
  const groupedFields = useMemo(() => {
    const groups: Record<string, FormField[]> = { default: [] };
    
    config.fields.forEach(field => {
      const groupName = field.group || 'default';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(field);
    });
    
    return groups;
  }, [config.fields]);

  // Calculate form progress
  const progress = useMemo(() => {
    const totalFields = config.fields.filter(field => shouldShowField(field, state.data)).length;
    const completedFields = config.fields.filter(field => {
      if (!shouldShowField(field, state.data)) return false;
      const value = getFieldValue(state.data, field.id);
      return value !== undefined && value !== null && value !== '';
    }).length;
    
    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  }, [config.fields, shouldShowField, state.data, getFieldValue]);

  // Render form errors summary
  const renderErrorSummary = useCallback(() => {
    const fieldErrors = Object.values(state.errors.fields).filter(Boolean);
    const formError = state.errors.form;
    const serverErrors = state.errors.server || [];
    
    const allErrors = [...fieldErrors, ...(formError ? [formError] : []), ...serverErrors];
    
    if (allErrors.length === 0) return null;

    return (
      <div className={styles.errorSummary}>
        <h3 className={styles.errorSummaryTitle}>Please fix the following errors:</h3>
        <ul className={styles.errorSummaryList}>
          {allErrors.map((error, index) => (
            <li key={index} className={styles.errorSummaryItem}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }, [state.errors]);

  // Render auto-save status
  const renderAutoSaveStatus = useCallback(() => {
    if (!config.submission.autoSave?.enabled) return null;

    return (
      <div className={`${styles.autoSave} ${styles[state.autoSaveStatus]}`}>
        <span className={styles.autoSaveIcon}>
          <SaveIcon />
        </span>
        {state.autoSaveStatus === 'saving' && 'Saving...'}
        {state.autoSaveStatus === 'saved' && 'Saved'}
        {state.autoSaveStatus === 'error' && 'Save failed'}
      </div>
    );
  }, [config.submission.autoSave?.enabled, state.autoSaveStatus]);

  return (
    <div className={`${styles.form} ${className}`}>
      {/* Form Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {config.variant === 'intake' && 'Tell us about your project'}
          {config.variant === 'consultation' && 'Book your consultation'}
          {config.variant === 'quote' && 'Get a quote'}
          {config.variant === 'contact' && 'Get in touch'}
          {config.variant === 'custom' && 'Contact us'}
        </h1>
        <p className={styles.description}>
          {config.variant === 'intake' && 'Help us understand your needs so we can provide the best service.'}
          {config.variant === 'consultation' && 'Schedule a free consultation to discuss your project.'}
          {config.variant === 'quote' && 'Provide your project details to receive a custom quote.'}
          {config.variant === 'contact' && 'We\'d love to hear from you. Send us a message and we\'ll get back to you soon.'}
          {config.variant === 'custom' && 'Please fill out the form below and we\'ll be in touch.'}
        </p>
      </div>

      {/* Progress Indicator */}
      {finalConfig.ui.showProgress && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressText}>
            <span className={styles.stepIndicator}>
              Progress: {Math.round(progress)}%
            </span>
            <span>
              {Math.round(progress) === 100 ? 'Ready to submit' : 'Complete all fields'}
            </span>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className={`${styles.content} ${finalConfig.ui.compact ? styles.compact : ''}`}>
          {/* Error Summary */}
          {errorDisplay === 'summary' || errorDisplay === 'both' ? renderErrorSummary() : null}

          {/* Loading State */}
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              Loading form...
            </div>
          )}

          {/* Form Fields */}
          {!loading && Object.entries(groupedFields).map(([groupName, fields]) => {
            if (fields.length === 0) return null;

            const isDefaultGroup = groupName === 'default';
            
            return (
              <div key={groupName} className={styles.fieldGroup}>
                {!isDefaultGroup && (
                  <div className={styles.groupHeader}>
                    <h2 className={styles.groupTitle}>
                      {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
                    </h2>
                  </div>
                )}
                
                {finalConfig.ui.layout === 'two-column' && fields.length > 1 ? (
                  <div className={styles.fieldRow}>
                    {fields.map((field, index) => (
                      <div key={field.id} className={styles.fieldColumn}>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                ) : (
                  fields.map(field => renderField(field))
                )}
              </div>
            );
          })}

          {/* Auto-save Status */}
          {renderAutoSaveStatus()}
        </div>

        {/* Form Actions */}
        <div className={styles.actions}>
          <div className={styles.actionGroup}>
            <button
              type="button"
              className={`${styles.button} ${styles.ghost}`}
              onClick={() => {
                setState(prev => ({ 
                  ...prev, 
                  data: {}, 
                  errors: { fields: {} }, 
                  touched: new Set() 
                }));
              }}
              disabled={disabled || state.submitting}
            >
              Clear Form
            </button>
          </div>

          <div className={styles.actionGroup}>
            <button
              type="submit"
              className={`${styles.button} ${styles.primary}`}
              disabled={disabled || state.submitting || !state.isValid}
            >
              {state.submitting ? (
                <>
                  <div className={styles.buttonSpinner} />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}