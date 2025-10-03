import { useEffect, useCallback } from 'react';
import { ACCESSIBILITY_CONSTANTS } from '../constants';

interface UseAccessibilityReturn {
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  trapFocus: (element: HTMLElement, event: KeyboardEvent) => void;
  focusElement: (selector: string) => void;
  initAccessibility: () => void;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    let liveRegion = document.getElementById('a11y-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'a11y-live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;
  }, []);

  const trapFocus = useCallback((element: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }, []);

  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const initAccessibility = useCallback(() => {
    // Add accessibility attributes to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach(el => {
      if (!el.hasAttribute('aria-label')) {
        const label = el.textContent || el.getAttribute('placeholder') || el.getAttribute('title');
        if (label) {
          el.setAttribute('aria-label', label.trim());
        }
      }
    });

    // Ensure proper focus management
    const handleKeyboardNavigation = (event: KeyboardEvent) => {
      if (event.key === ACCESSIBILITY_CONSTANTS.KEYBOARD_SHORTCUTS.TAB) {
        const activeModals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        if (activeModals.length > 0) {
          trapFocus(activeModals[0] as HTMLElement, event);
        }
      }

      if (event.key === ACCESSIBILITY_CONSTANTS.KEYBOARD_SHORTCUTS.ESCAPE) {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[data-close-modal]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardNavigation);

    // Add skip link if it doesn't exist
    if (!document.querySelector('[data-skip-link]')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = ACCESSIBILITY_CONSTANTS.ARIA_LABELS.SKIP_TO_CONTENT;
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
      skipLink.setAttribute('data-skip-link', 'true');
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Add main content landmark
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }

    // Initialize high contrast mode
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    }

    // Initialize reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboardNavigation);
    };
  }, [trapFocus]);

  useEffect(() => {
    const cleanup = initAccessibility();
    return cleanup;
  }, [initAccessibility]);

  return {
    announceToScreenReader,
    trapFocus,
    focusElement,
    initAccessibility,
  };
};
