"use client";

// src/booking/components/ConsentPolicies/ConsentPolicies.tsx
// Production-ready consent and policies management component

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { 
  trackConsentEvent,
  updateConsentStatus,
  validateAllConsents,
  generateAriaLabel,
  announceConsentChange,
  saveConsentsToStorage,
  saveConsentHistory,
  generateConsentRecord,
} from "./lib/utils";
import styles from "./ConsentPolicies.module.css";
import type {
  ConsentPoliciesProps,
  ConsentItem,
  ConsentState,
  ConsentStatus,
  ConsentValidation,
  PolicyDocument,
  ConsentRecord,
} from "./ConsentPolicies.types";

// Icon components - replace with your icon library in production
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
    <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={styles.loadingSpinner}>
    <path d="M8 3a5 5 0 1 0 5 5h-2a3 3 0 1 1-3-3V3z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
  </svg>
);

// Default props
const DEFAULT_PROPS = {
  variant: "standard" as const,
  layout: "vertical" as const,
  showPolicyPreviews: false,
  showConsentDates: false,
  showLegalBasis: false,
  showDataProcessing: false,
  showThirdParties: false,
  showUserRights: false,
  allowWithdrawal: true,
  compact: false,
  loading: false,
  showValidationImmediately: false,
};

export default function ConsentPolicies(props: ConsentPoliciesProps) {
  const {
    consents: initialConsents,
    service,
    variant = DEFAULT_PROPS.variant,
    layout = DEFAULT_PROPS.layout,
    showPolicyPreviews = DEFAULT_PROPS.showPolicyPreviews,
    showConsentDates = DEFAULT_PROPS.showConsentDates,
    showLegalBasis = DEFAULT_PROPS.showLegalBasis,
    showDataProcessing = DEFAULT_PROPS.showDataProcessing,
    showThirdParties = DEFAULT_PROPS.showThirdParties,
    showUserRights = DEFAULT_PROPS.showUserRights,
    allowWithdrawal = DEFAULT_PROPS.allowWithdrawal,
    compact = DEFAULT_PROPS.compact,
    className = "",
    onConsentChange,
    onPolicyView,
    onTrack,
    loading = DEFAULT_PROPS.loading,
    error,
    customConsentRenderer,
    customPolicyRenderer,
    validationErrors,
    showValidationImmediately = DEFAULT_PROPS.showValidationImmediately,
  } = props;

  // Internal state
  const [state, setState] = useState<ConsentState>(() => ({
    consentStatuses: initialConsents.reduce((acc, consent) => {
      acc[consent.id] = consent.status;
      return acc;
    }, {} as Record<string, ConsentStatus>),
    expandedPolicies: new Set(),
    modalOpen: false,
    loading: new Set(),
    errors: {},
    consentHistory: [],
  }));

  // Refs for accessibility
  const announceRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Current consents with updated statuses
  const currentConsents = useMemo(() => {
    return initialConsents.map(consent => ({
      ...consent,
      status: state.consentStatuses[consent.id] || consent.status,
    }));
  }, [initialConsents, state.consentStatuses]);

  // Validation state
  const validation = useMemo(() => {
    return validateAllConsents(currentConsents);
  }, [currentConsents]);

  // Handle consent status change
  const handleConsentChange = useCallback((
    consentId: string, 
    newStatus: ConsentStatus,
    metadata?: any
  ) => {
    const consent = currentConsents.find(c => c.id === consentId);
    if (!consent) return;

    // Update internal state
    setState(prev => ({
      ...prev,
      consentStatuses: {
        ...prev.consentStatuses,
        [consentId]: newStatus,
      },
      errors: {
        ...prev.errors,
        [consentId]: '', // Clear any existing errors
      },
    }));

    // Create consent record for history
    const record = generateConsentRecord({
      ...consent,
      status: newStatus,
    });
    saveConsentHistory(record);

    // Track analytics
    trackConsentEvent({
      event: newStatus === 'accepted' ? 'consent_accept' : 'consent_decline',
      consentId,
      policyType: consent.policyType,
      service,
      status: newStatus,
      timestamp: Date.now(),
      properties: metadata,
    });

    // Announce to screen readers
    if (announceRef.current) {
      announceRef.current.textContent = announceConsentChange(consent, newStatus);
    }

    // Save to storage
    const updatedConsents = updateConsentStatus(currentConsents, consentId, newStatus, metadata);
    saveConsentsToStorage(updatedConsents);

    // Call external handler
    onConsentChange?.(consentId, newStatus, metadata);

    // Track event
    onTrack?.("consent_change", {
      consent_id: consentId,
      new_status: newStatus,
      policy_type: consent.policyType,
      service,
      ...metadata,
    });
  }, [currentConsents, service, onConsentChange, onTrack]);

  // Handle policy view
  const handlePolicyView = useCallback((consent: ConsentItem) => {
    if (!consent.policyType) return;

    // Track policy view
    trackConsentEvent({
      event: 'policy_view',
      consentId: consent.id,
      policyType: consent.policyType,
      service,
      timestamp: Date.now(),
    });

    onPolicyView?.(consent.policyType, consent.id);
    onTrack?.("policy_view", {
      consent_id: consent.id,
      policy_type: consent.policyType,
      service,
    });
  }, [service, onPolicyView, onTrack]);

  // Toggle policy expansion
  const togglePolicyExpansion = useCallback((consentId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedPolicies);
      if (newExpanded.has(consentId)) {
        newExpanded.delete(consentId);
      } else {
        newExpanded.add(consentId);
      }
      return {
        ...prev,
        expandedPolicies: newExpanded,
      };
    });

    const consent = currentConsents.find(c => c.id === consentId);
    if (consent) {
      handlePolicyView(consent);
    }
  }, [currentConsents, handlePolicyView]);

  // Handle accept all
  const handleAcceptAll = useCallback(() => {
    currentConsents.forEach(consent => {
      if (consent.status === 'pending') {
        handleConsentChange(consent.id, 'accepted', { bulk_action: 'accept_all' });
      }
    });

    onTrack?.("consent_accept_all", {
      service,
      consent_count: currentConsents.length,
    });
  }, [currentConsents, handleConsentChange, service, onTrack]);

  // Handle decline all optional
  const handleDeclineAllOptional = useCallback(() => {
    currentConsents.forEach(consent => {
      if (!consent.required && consent.status === 'pending') {
        handleConsentChange(consent.id, 'declined', { bulk_action: 'decline_optional' });
      }
    });

    onTrack?.("consent_decline_optional", {
      service,
      optional_count: currentConsents.filter(c => !c.required).length,
    });
  }, [currentConsents, handleConsentChange, service, onTrack]);

  // Get consent completion stats
  const completionStats = useMemo(() => {
    const total = currentConsents.length;
    const accepted = currentConsents.filter(c => c.status === 'accepted').length;
    const declined = currentConsents.filter(c => c.status === 'declined').length;
    const pending = currentConsents.filter(c => c.status === 'pending').length;
    const required = currentConsents.filter(c => c.required).length;
    const optional = currentConsents.filter(c => !c.required).length;

    return { total, accepted, declined, pending, required, optional };
  }, [currentConsents]);

  // Format date for display
  const formatDate = useCallback((dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }, []);

  // Render individual consent item
  const renderConsentItem = useCallback((consent: ConsentItem, index: number) => {
    if (customConsentRenderer) {
      return customConsentRenderer(consent, index);
    }

    const isExpanded = state.expandedPolicies.has(consent.id);
    const isLoading = state.loading.has(consent.id);
    const error = state.errors[consent.id] || validationErrors?.[consent.id];
    const isChecked = consent.status === 'accepted';
    const isDisabled = loading || isLoading || (consent.required && consent.status === 'accepted');

    return (
      <div
        key={consent.id}
        className={`
          ${styles.consentItem}
          ${consent.required ? styles.required : styles.optional}
          ${error ? styles.error : ""}
        `.trim()}
      >
        <div
          className={`${styles.consentHeader} ${isDisabled ? styles.disabled : ""}`}
          onClick={() => !isDisabled && handleConsentChange(
            consent.id,
            isChecked ? 'declined' : 'accepted'
          )}
          onKeyDown={(e) => {
            if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleConsentChange(consent.id, isChecked ? 'declined' : 'accepted');
            }
          }}
          tabIndex={isDisabled ? -1 : 0}
          role="button"
          aria-label={generateAriaLabel(consent)}
        >
          <div className={styles.checkbox}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={isChecked}
              disabled={isDisabled}
              onChange={() => {}} // Controlled by onClick handler
              aria-describedby={consent.description ? `${consent.id}-desc` : undefined}
            />
            <div className={styles.customCheckbox}>
              {isLoading ? <LoadingSpinner /> : isChecked && <CheckIcon />}
            </div>
          </div>

          <div className={styles.consentContent}>
            <h3 className={styles.consentLabel}>{consent.label}</h3>
            
            {consent.description && (
              <p id={`${consent.id}-desc`} className={styles.consentDescription}>
                {consent.description}
              </p>
            )}

            <div className={styles.consentMeta}>
              {consent.required ? (
                <span className={styles.requiredBadge}>Required</span>
              ) : (
                <span className={styles.optionalBadge}>Optional</span>
              )}

              {showConsentDates && consent.consentDate && (
                <span className={styles.consentDate}>
                  Accepted: {formatDate(consent.consentDate)}
                </span>
              )}

              {showLegalBasis && consent.legalBasis && (
                <span className={styles.legalBasis}>
                  Legal basis: {consent.legalBasis.replace('-', ' ')}
                </span>
              )}

              {consent.policyUrl && (
                <button
                  className={styles.policyLink}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (showPolicyPreviews) {
                      togglePolicyExpansion(consent.id);
                    } else {
                      window.open(consent.policyUrl, '_blank', 'noopener,noreferrer');
                      handlePolicyView(consent);
                    }
                  }}
                  aria-expanded={showPolicyPreviews ? isExpanded : undefined}
                >
                  {showPolicyPreviews ? (isExpanded ? 'Hide' : 'View') : 'Read'} Policy
                  {!showPolicyPreviews && <ExternalLinkIcon />}
                </button>
              )}
            </div>

            {error && (
              <div className={styles.error} role="alert">
                <ErrorIcon />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Expanded policy content */}
        {showPolicyPreviews && isExpanded && (
          <div className={styles.policyExpanded}>
            <h4 className={styles.policyTitle}>
              {consent.policyType?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Policy
            </h4>

            {consent.purpose && (
              <div className={styles.policySummary}>
                <strong>Purpose:</strong> {consent.purpose}
              </div>
            )}

            {showDataProcessing && consent.dataCategories && consent.dataCategories.length > 0 && (
              <div className={styles.dataProcessing}>
                <h5 className={styles.dataProcessingTitle}>Data Processing</h5>
                <div className={styles.dataCategories}>
                  {consent.dataCategories.map(category => (
                    <span key={category} className={styles.dataCategory}>
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showThirdParties && consent.thirdParties && consent.thirdParties.length > 0 && (
              <div className={styles.thirdParties}>
                <h5 className={styles.dataProcessingTitle}>Third Parties</h5>
                {consent.thirdParties.map((party, idx) => (
                  <div key={idx} className={styles.thirdParty}>
                    <strong>{party.name}</strong> ({party.type}) - {party.purpose}
                    {party.location && ` (${party.location})`}
                  </div>
                ))}
              </div>
            )}

            {showUserRights && consent.userRights && consent.userRights.length > 0 && (
              <div className={styles.userRights}>
                <h5 className={styles.userRightsTitle}>Your Rights</h5>
                {consent.userRights.map((right, idx) => (
                  <div key={idx} className={styles.userRight}>
                    <strong>{right.type.replace('-', ' ')}</strong>: {right.description}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.policyVersion}>
              <span>Version: {consent.policyVersion || '1.0'}</span>
              {consent.expiryDate && (
                <span>Expires: {formatDate(consent.expiryDate)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [
    customConsentRenderer,
    state.expandedPolicies,
    state.loading,
    state.errors,
    validationErrors,
    loading,
    handleConsentChange,
    showConsentDates,
    showLegalBasis,
    showPolicyPreviews,
    showDataProcessing,
    showThirdParties,
    showUserRights,
    formatDate,
    togglePolicyExpansion,
    handlePolicyView,
  ]);

  // Render validation summary
  const renderValidationSummary = useCallback(() => {
    if (validation.isValid || (!showValidationImmediately && validation.errors.length === 0)) {
      return null;
    }

    return (
      <div className={styles.validationSummary} role="alert">
        <h4 className={styles.validationTitle}>
          Please review the following:
        </h4>
        <ul className={styles.validationList}>
          {validation.missingRequired.map(consentId => {
            const consent = currentConsents.find(c => c.id === consentId);
            return (
              <li key={consentId} className={styles.validationItem}>
                {consent?.label || consentId} is required
              </li>
            );
          })}
          {validation.expiredConsents.map(consentId => {
            const consent = currentConsents.find(c => c.id === consentId);
            return (
              <li key={consentId} className={styles.validationItem}>
                {consent?.label || consentId} consent has expired
              </li>
            );
          })}
          {validation.errors.map((error, idx) => (
            <li key={idx} className={styles.validationItem}>
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  }, [validation, showValidationImmediately, currentConsents]);

  // Render consent summary
  const renderConsentSummary = useCallback(() => {
    if (variant === 'minimal' || compact) return null;

    return (
      <div className={styles.consentSummary}>
        <h3 className={styles.summaryTitle}>Consent Summary</h3>
        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{completionStats.total}</div>
            <div className={styles.statLabel}>Total</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{completionStats.accepted}</div>
            <div className={styles.statLabel}>Accepted</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{completionStats.declined}</div>
            <div className={styles.statLabel}>Declined</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNumber}>{completionStats.pending}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
      </div>
    );
  }, [variant, compact, completionStats]);

  // Component classes
  const componentClasses = `
    ${styles.consentPolicies}
    ${styles[variant]}
    ${compact ? styles.compact : ""}
    ${className}
  `.trim();

  const layoutClasses = `${styles.layout} ${styles[layout]}`;

  return (
    <div className={componentClasses}>
      {/* Screen reader announcements */}
      <div 
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Header */}
      {variant !== 'minimal' && (
        <div className={styles.header}>
          <h2 className={styles.title}>
            Privacy & Consent Preferences
          </h2>
          <p className={styles.subtitle}>
            Please review and accept our policies to continue with your booking.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className={styles.error} role="alert">
          <ErrorIcon />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles.loading}>
          <LoadingSpinner />
        </div>
      )}

      {/* Validation summary */}
      {renderValidationSummary()}

      {/* Consent summary */}
      {renderConsentSummary()}

      {/* Consent items */}
      <div className={layoutClasses}>
        {currentConsents.map((consent, index) => renderConsentItem(consent, index))}
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${styles.primary}`}
          onClick={handleAcceptAll}
          disabled={loading || currentConsents.every(c => c.status !== 'pending')}
        >
          Accept All
        </button>
        
        <button
          className={styles.actionButton}
          onClick={handleDeclineAllOptional}
          disabled={loading || currentConsents.filter(c => !c.required && c.status === 'pending').length === 0}
        >
          Decline Optional
        </button>

        {allowWithdrawal && (
          <button
            className={`${styles.actionButton} ${styles.danger}`}
            onClick={() => {
              currentConsents.forEach(consent => {
                if (consent.status === 'accepted' && !consent.required) {
                  handleConsentChange(consent.id, 'declined', { action: 'withdrawal' });
                }
              });
              onTrack?.("consent_withdraw_all", { service });
            }}
            disabled={loading || currentConsents.filter(c => c.status === 'accepted' && !c.required).length === 0}
          >
            Withdraw Consent
          </button>
        )}
      </div>
    </div>
  );
}