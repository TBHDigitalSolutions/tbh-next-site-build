// ===================================================================
// /src/search/ui/CommandPalette.tsx
// ===================================================================
// Global command palette modal (⌘K)

"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '../client/useSearch';
import { highlightText } from '../client/highlight';
import styles from './search.module.css';

export interface CommandPaletteProps {
  placeholder?: string;
  shortcutKeys?: string[];
  maxResults?: number;
  className?: string;
  onClose?: () => void;
  onResultSelect?: (result: any) => void;
}

/**
 * Global command palette modal with keyboard shortcuts
 */
export default function CommandPalette({
  placeholder = 'Search everything...',
  shortcutKeys = ['k'],
  maxResults = 8,
  className = '',
  onClose,
  onResultSelect
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { query, results, loading, setQuery } = useSearch({
    autoSearch: true,
    debounceMs: 150
  });

  const displayResults = results.slice(0, maxResults);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isShortcut = shortcutKeys.some(key => 
      (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()
    );

    if (isShortcut) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, displayResults.length - 1)
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
        
      case 'Enter':
        e.preventDefault();
        if (displayResults[selectedIndex]) {
          handleResultSelect(displayResults[selectedIndex]);
        }
        break;
    }
  }, [isOpen, displayResults, selectedIndex, shortcutKeys]);

  // Set up keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleResultSelect = (result: any) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      router.push(result.path);
    }
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    onClose?.();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const formatShortcut = () => {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? '⌘' : 'Ctrl';
    return `${modifier}+${shortcutKeys[0].toUpperCase()}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.paletteOverlay} ${className}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search command palette"
    >
      <div className={styles.paletteModal}>
        {/* Header */}
        <div className={styles.paletteHeader}>
          <input
            ref={inputRef}
            type="text"
            className={styles.paletteInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search query"
            aria-expanded={displayResults.length > 0}
            aria-activedescendant={
              displayResults[selectedIndex] ? `result-${selectedIndex}` : undefined
            }
          />
          <button
            className={styles.paletteClose}
            onClick={handleClose}
            aria-label="Close search"
          >
            ✕
          </button>
        </div>

        {/* Results */}
        <div 
          ref={resultsRef}
          className={styles.paletteResults}
          role="listbox"
          aria-label="Search results"
        >
          {loading && (
            <div className={styles.loading}>
              <span className={styles.spinner} />
              Searching...
            </div>
          )}

          {!loading && displayResults.length === 0 && query && (
            <div className={styles.noResults}>
              No results found for "{query}"
            </div>
          )}

          {!loading && displayResults.map((result, index) => (
            <div
              key={result.id}
              id={`result-${index}`}
              className={`${styles.paletteResult} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleResultSelect(result)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className={styles.paletteResultTitle}>
                {highlightText(result.title, query)}
              </div>
              
              <div className={styles.paletteResultMeta}>
                {result.type}
                {result.serviceKey && ` • ${result.serviceKey}`}
                {result.category && ` • ${result.category}`}
              </div>
              
              {result.summary && (
                <div className={styles.paletteResultSummary}>
                  {highlightText(result.summary, query, { maxLength: 100 })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.paletteFooter}>
          <span>Navigate with ↑↓</span>
          <span>Select with ↵</span>
          <span>Close with {formatShortcut()} or esc</span>
        </div>
      </div>
    </div>
  );
}