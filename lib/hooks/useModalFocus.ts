/**
 * Hook para manejar focus management en modales custom
 * - Focus trap: mantiene el focus dentro del modal
 * - ESC para cerrar
 * - Restaura focus al elemento que abrió el modal
 */

import { useEffect, useRef, RefObject } from "react";

interface UseModalFocusOptions {
  isOpen: boolean;
  onClose: () => void;
  modalRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
}

export function useModalFocus({
  isOpen,
  onClose,
  modalRef,
  initialFocusRef,
  restoreFocus = true,
}: UseModalFocusOptions) {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Guardar el elemento que tenía focus antes de abrir el modal
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus trap: mantener focus dentro del modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;

    // Obtener todos los elementos focusables dentro del modal
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(modal.querySelectorAll<HTMLElement>(focusableSelectors))
        .filter((el) => {
          // Filtrar elementos ocultos
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });
    };

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    // Focus inicial
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    // Manejar Tab para mantener focus dentro del modal
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab: ir al anterior
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        // Tab: ir al siguiente
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    // Manejar ESC para cerrar
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    // Prevenir scroll del body cuando el modal está abierto
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    modal.addEventListener('keydown', handleTabKey);
    modal.addEventListener('keydown', handleEscape);

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
      modal.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = originalOverflow;

      // Restaurar focus al elemento anterior
      if (restoreFocus && previousActiveElement.current) {
        // Usar setTimeout para asegurar que el modal se haya cerrado
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [isOpen, modalRef, initialFocusRef, onClose, restoreFocus]);
}

