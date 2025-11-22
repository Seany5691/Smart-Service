/**
 * Accessibility Utilities
 * Helper functions for improving accessibility across the application
 */

/**
 * Generates a unique ID for form elements to link labels and inputs
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Announces a message to screen readers
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Gets appropriate ARIA label for common actions
 */
export function getActionLabel(action: string, context?: string): string {
  const labels: Record<string, string> = {
    'edit': `Edit ${context || 'item'}`,
    'delete': `Delete ${context || 'item'}`,
    'view': `View ${context || 'item'} details`,
    'close': `Close ${context || 'dialog'}`,
    'open': `Open ${context || 'menu'}`,
    'add': `Add new ${context || 'item'}`,
    'save': `Save ${context || 'changes'}`,
    'cancel': `Cancel ${context || 'action'}`,
    'search': `Search ${context || ''}`,
    'filter': `Filter ${context || 'results'}`,
    'sort': `Sort ${context || 'items'}`,
    'refresh': `Refresh ${context || 'data'}`,
    'download': `Download ${context || 'file'}`,
    'upload': `Upload ${context || 'file'}`,
    'print': `Print ${context || 'document'}`,
  };
  
  return labels[action.toLowerCase()] || action;
}

/**
 * Formats a number for screen readers
 */
export function formatNumberForScreenReader(num: number, unit?: string): string {
  const formatted = new Intl.NumberFormat('en-US').format(num);
  return unit ? `${formatted} ${unit}${num !== 1 ? 's' : ''}` : formatted;
}

/**
 * Formats a date for screen readers
 */
export function formatDateForScreenReader(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(dateObj);
}

/**
 * Gets appropriate role for interactive elements
 */
export function getInteractiveRole(element: 'button' | 'link' | 'tab' | 'menuitem'): string {
  return element;
}

/**
 * Checks if an element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  const isInteractive = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
  
  return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
}

/**
 * Traps focus within a modal or dialog
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  firstElement?.focus();
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Gets appropriate ARIA label for status badges
 */
export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'open': 'Status: Open',
    'in-progress': 'Status: In Progress',
    'pending': 'Status: Pending',
    'resolved': 'Status: Resolved',
    'closed': 'Status: Closed',
    'cancelled': 'Status: Cancelled',
    'high': 'Priority: High',
    'medium': 'Priority: Medium',
    'low': 'Priority: Low',
    'urgent': 'Priority: Urgent',
  };
  
  return statusLabels[status.toLowerCase()] || `Status: ${status}`;
}

/**
 * Creates accessible loading state announcement
 */
export function announceLoadingState(isLoading: boolean, context?: string): void {
  if (isLoading) {
    announceToScreenReader(`Loading ${context || 'content'}`, 'polite');
  } else {
    announceToScreenReader(`${context || 'Content'} loaded`, 'polite');
  }
}

/**
 * Creates accessible error announcement
 */
export function announceError(error: string): void {
  announceToScreenReader(`Error: ${error}`, 'assertive');
}

/**
 * Creates accessible success announcement
 */
export function announceSuccess(message: string): void {
  announceToScreenReader(`Success: ${message}`, 'polite');
}
