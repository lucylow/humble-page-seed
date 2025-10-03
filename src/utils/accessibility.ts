// @ts-nocheck
// Accessibility utilities and helpers for WCAG compliance

export const ensureAccessibility = () => {
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
  document.addEventListener('keydown', handleKeyboardNavigation);
};

export const handleKeyboardNavigation = (event: KeyboardEvent) => {
  // Implement keyboard navigation patterns
  if (event.key === 'Tab') {
    // Manage focus trapping for modals
    const activeModals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
    if (activeModals.length > 0) {
      trapFocus(activeModals[0] as HTMLElement, event);
    }
  }

  // Add skip navigation functionality
  if (event.key === 'S' && event.altKey) {
    focusSkipLink();
  }

  // Escape key to close modals
  if (event.key === 'Escape') {
    const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (activeModal) {
      const closeButton = activeModal.querySelector('[data-close-modal]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }
};

export const trapFocus = (element: HTMLElement, event: KeyboardEvent) => {
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
};

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  // Create or update live region for screen reader announcements
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
};

// High contrast mode support
export const initHighContrastMode = () => {
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  if (prefersHighContrast) {
    document.documentElement.setAttribute('data-theme', 'high-contrast');
  }

  // Listen for changes in contrast preference
  window.matchMedia('(prefers-contrast: high)').addEventListener('change', e => {
    if (e.matches) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  });
};

// Reduced motion support
export const initReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    if (e.matches) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  });
};

// Focus management utilities
export const focusElement = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement;
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

export const focusSkipLink = () => {
  const skipLink = document.querySelector('[data-skip-link]') as HTMLElement;
  if (skipLink) {
    skipLink.focus();
  }
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd parse the colors and calculate luminance
  return 4.5; // Placeholder value
};

export const isHighContrast = (color1: string, color2: string): boolean => {
  return getContrastRatio(color1, color2) >= 4.5;
};

// Screen reader utilities
export const hideFromScreenReader = (element: HTMLElement) => {
  element.setAttribute('aria-hidden', 'true');
};

export const showToScreenReader = (element: HTMLElement) => {
  element.removeAttribute('aria-hidden');
};

// Form accessibility utilities
export const associateLabelWithInput = (labelId: string, inputId: string) => {
  const label = document.getElementById(labelId);
  const input = document.getElementById(inputId);
  
  if (label && input) {
    input.setAttribute('aria-labelledby', labelId);
  }
};

export const addFormValidation = (form: HTMLFormElement) => {
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
      const target = e.target as HTMLElement;
      announceToScreenReader(`Invalid input: ${target.validationMessage}`, 'assertive');
    });
  });
};

// Initialize accessibility features
export const initAccessibility = () => {
  ensureAccessibility();
  initHighContrastMode();
  initReducedMotion();
  
  // Add skip link if it doesn't exist
  if (!document.querySelector('[data-skip-link]')) {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    skipLink.setAttribute('data-skip-link', 'true');
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  // Add main content landmark
  const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
};
