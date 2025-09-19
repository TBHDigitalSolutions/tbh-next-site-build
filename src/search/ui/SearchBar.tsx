// ===================================================================
// /src/search/ui/SearchBar.tsx
// ===================================================================
// Minimal search input component for headers and inline use

"use client";

import React, { useState } from 'react';
import styles from './search.module.css';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  showButton?: boolean;
  buttonText?: string;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * Minimal search bar component for headers and inline use
 */
export default function SearchBar({
  value = '',
  onChange,
  onSubmit,
  placeholder = 'Search...',
  loading = false,
  disabled = false,
  showButton = true,
  buttonText = 'Search',
  autoFocus = false,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  'aria-label': ariaLabel = 'Search',
  'aria-describedby': ariaDescribedby,
  ...props
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  
  const currentValue = onChange ? value : internalValue;
  const handleChange = onChange || setInternalValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = () => {
    if (onSubmit && !disabled && !loading) {
      onSubmit();
    }
  };

  return (
    <div className={`${styles.searchBar} ${className}`} {...props}>
      <input
        type="text"
        className={`${styles.searchInput} ${inputClassName}`}
        value={currentValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        autoComplete="off"
        spellCheck="false"
      />
      
      {showButton && (
        <button
          type="button"
          className={`${styles.searchButton} ${styles.primary} ${buttonClassName}`}
          onClick={handleSubmit}
          disabled={disabled || loading}
          aria-label={loading ? 'Searching...' : buttonText}
        >
          {loading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} aria-hidden="true" />
              Searching...
            </span>
          ) : (
            buttonText
          )}
        </button>
      )}
    </div>
  );
}