'use client';

import { Suspense, lazy, ComponentType } from 'react';

interface LazyModalProps {
  isOpen: boolean;
  [key: string]: any;
}

/**
 * Loading fallback for lazy-loaded modals
 */
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Higher-order component for lazy loading modals
 * Only loads the modal component when it's opened for the first time
 * 
 * @example
 * const LazyTicketModal = createLazyModal(() => import('@/components/modals/EnhancedTicketModal'));
 * 
 * // In your component:
 * {showModal && <LazyTicketModal isOpen={showModal} onClose={() => setShowModal(false)} />}
 */
export function createLazyModal<P extends LazyModalProps>(
  importFunc: () => Promise<{ default: ComponentType<P> }>
) {
  const LazyComponent = lazy(importFunc);

  return function LazyModal(props: P) {
    // Only render if modal is open
    if (!props.isOpen) {
      return null;
    }

    return (
      <Suspense fallback={<ModalLoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Pre-configured lazy modal components
 * Import these instead of the original modal components for automatic lazy loading
 */

// Ticket Modal
export const LazyEnhancedTicketModal = createLazyModal(
  () => import('@/components/modals/EnhancedTicketModal')
);

// Customer Modal
export const LazyCustomerModal = createLazyModal(
  () => import('@/components/modals/CustomerModal')
);

// Contact Modal
export const LazyAddContactModal = createLazyModal(
  () => import('@/components/modals/AddContactModal')
);

// Hardware Modal
export const LazyAddHardwareModal = createLazyModal(
  () => import('@/components/modals/AddHardwareModal')
);

// Inventory Modal
export const LazyAddInventoryModal = createLazyModal(
  () => import('@/components/modals/AddInventoryModal')
);

// Invoice Modal
export const LazyAddInvoiceModal = createLazyModal(
  () => import('@/components/modals/AddInvoiceModal')
);

// Task Modal
export const LazyAddTaskModal = createLazyModal(
  () => import('@/components/modals/AddTaskModal')
);

// Confirm Modal
export const LazyConfirmModal = createLazyModal(
  () => import('@/components/modals/ConfirmModal')
);
