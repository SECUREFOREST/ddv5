import React, { createContext, useContext, useRef, useEffect } from 'react';
// Removed: import { useEventListener } from '../utils/memoryLeakPrevention';

const AccessibilityContext = createContext();

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export function AccessibilityProvider({ children }) {
  const liveRegionRef = useRef(null);
  const focusTrapRef = useRef(null);

  // Announce messages to screen readers
  const announce = (message, priority = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      // Clear the message after a short delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  };

  // Focus management utilities
  const focusFirstInteractive = (container) => {
    const focusableElements = container?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };

  const focusLastInteractive = (container) => {
    const focusableElements = container?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  };

  // Trap focus within a container
  const trapFocus = (container) => {
    const focusableElements = container?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  // Skip to main content functionality
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      announce('Navigated to main content');
    }
  };

  const value = {
    announce,
    focusFirstInteractive,
    focusLastInteractive,
    trapFocus,
    skipToMain,
    liveRegionRef,
    focusTrapRef
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Hidden live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
    </AccessibilityContext.Provider>
  );
} 