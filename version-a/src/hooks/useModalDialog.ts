'use client';

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Drives a native modal <dialog> from React state (shared by the product details dialog and the
 * cart drawer):
 * - `open` → showModal() / close(); the native modal gives role="dialog", aria-modal and an inert
 *   background for free;
 * - Esc (native `cancel` → `close`) and clicks on the backdrop close it;
 * - Tab / Shift+Tab wrap inside the dialog (the native dialog would otherwise let focus escape to the
 *   browser UI);
 * - on close, focus returns to the element that opened it.
 */
export function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusTo.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    onClose();
    const target = returnFocusTo.current;
    returnFocusTo.current = null;
    // The opener may have been unmounted meanwhile; only refocus it if still in the page.
    if (target?.isConnected) target.focus();
  }

  // The content fills the dialog box, so a click whose target is the <dialog> itself hit the backdrop.
  // The press must start there too: a text selection that starts inside and ends on the backdrop
  // also dispatches a click on the <dialog> (the common ancestor) and must not close it.
  function handlePointerDown(event: PointerEvent<HTMLDialogElement>) {
    pressedOnBackdrop.current = event.target === event.currentTarget;
  }

  function handleClick(event: MouseEvent<HTMLDialogElement>) {
    const fromBackdrop = pressedOnBackdrop.current;
    pressedOnBackdrop.current = false;
    if (fromBackdrop && event.target === event.currentTarget) event.currentTarget.close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const focusables = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /** Closes without restoring focus — for links that move the user elsewhere (e.g. to #contatti). */
  function closeWithoutReturningFocus() {
    returnFocusTo.current = null;
    ref.current?.close();
  }

  return {
    ref,
    closeWithoutReturningFocus,
    dialogProps: {
      ref,
      'aria-modal': true as const,
      onClose: handleClose,
      onPointerDown: handlePointerDown,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    },
  };
}
