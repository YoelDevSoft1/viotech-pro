"use client";

import { useState, useCallback, useEffect } from "react";
import { usePushNotifications } from "./usePushNotifications";

/**
 * Triggers que pueden mostrar el diálogo de permisos push
 */
export type PushPermissionTrigger =
  | "onboarding_complete"
  | "first_ticket"
  | "first_login"
  | "settings"
  | "manual";

/**
 * Resultado del flujo de permisos
 */
export type PushPermissionResult = "granted" | "denied" | "dismissed" | "not_shown";

/**
 * Estado del hook usePushPermissionFlow
 */
export interface UsePushPermissionFlowState {
  /** Si el diálogo debe mostrarse */
  shouldShowDialog: boolean;
  /** Trigger actual que activó el flujo */
  currentTrigger: PushPermissionTrigger | null;
  /** Si ya se mostró el diálogo en esta sesión */
  hasShownInSession: boolean;
  /** Si el usuario ya tomó una decisión previa */
  hasUserDecided: boolean;
  /** Resultado de la última interacción */
  lastResult: PushPermissionResult | null;
}

/**
 * Acciones del hook
 */
export interface UsePushPermissionFlowActions {
  /** Iniciar el flujo de permisos */
  triggerPermissionFlow: (trigger: PushPermissionTrigger) => void;
  /** Cerrar el diálogo */
  closeDialog: () => void;
  /** Registrar el resultado */
  recordResult: (result: PushPermissionResult) => void;
  /** Reiniciar el estado (para testing) */
  reset: () => void;
}

const STORAGE_KEY = "viotech_push_permission_state";
const SESSION_SHOWN_KEY = "viotech_push_dialog_shown_session";

interface StoredState {
  hasUserDecided: boolean;
  lastResult: PushPermissionResult | null;
  dismissCount: number;
  lastDismissDate: string | null;
}

/**
 * Hook para manejar el flujo de permisos de notificaciones push
 * con soft-ask pattern y persistencia
 * 
 * @example
 * ```tsx
 * const { 
 *   shouldShowDialog, 
 *   triggerPermissionFlow, 
 *   closeDialog, 
 *   recordResult 
 * } = usePushPermissionFlow();
 * 
 * // Disparar después de completar onboarding
 * useEffect(() => {
 *   if (onboardingComplete) {
 *     triggerPermissionFlow("onboarding_complete");
 *   }
 * }, [onboardingComplete]);
 * 
 * return (
 *   <PushPermissionDialog
 *     open={shouldShowDialog}
 *     onOpenChange={(open) => !open && closeDialog()}
 *     onComplete={recordResult}
 *   />
 * );
 * ```
 */
export function usePushPermissionFlow(): UsePushPermissionFlowState & UsePushPermissionFlowActions {
  const { isSupported, permission, isSubscribed } = usePushNotifications();
  
  const [shouldShowDialog, setShouldShowDialog] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<PushPermissionTrigger | null>(null);
  const [hasShownInSession, setHasShownInSession] = useState(false);
  const [storedState, setStoredState] = useState<StoredState>({
    hasUserDecided: false,
    lastResult: null,
    dismissCount: 0,
    lastDismissDate: null,
  });

  // Cargar estado persistido
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Estado de sesión
    const sessionShown = sessionStorage.getItem(SESSION_SHOWN_KEY);
    if (sessionShown === "true") {
      setHasShownInSession(true);
    }

    // Estado persistido
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredState;
        setStoredState(parsed);
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar estado en localStorage
  const saveState = useCallback((newState: Partial<StoredState>) => {
    const updated = { ...storedState, ...newState };
    setStoredState(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [storedState]);

  // Determinar si debemos mostrar el diálogo basado en varias condiciones
  const canShowDialog = useCallback((): boolean => {
    // No mostrar si no soporta push
    if (!isSupported) return false;

    // No mostrar si ya está suscrito
    if (isSubscribed) return false;

    // No mostrar si el permiso ya está denegado (navegador)
    if (permission === "denied") return false;

    // No mostrar si ya se mostró en esta sesión
    if (hasShownInSession) return false;

    // No mostrar si el usuario ya rechazó definitivamente
    if (storedState.lastResult === "denied") return false;

    // Si el usuario ha descartado muchas veces, esperar más tiempo
    if (storedState.dismissCount >= 3) {
      const lastDismiss = storedState.lastDismissDate 
        ? new Date(storedState.lastDismissDate) 
        : null;
      if (lastDismiss) {
        const daysSinceDismiss = Math.floor(
          (Date.now() - lastDismiss.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Esperar 7 días después de 3+ dismisses
        if (daysSinceDismiss < 7) return false;
      }
    }

    return true;
  }, [isSupported, isSubscribed, permission, hasShownInSession, storedState]);

  // Trigger para mostrar el diálogo
  const triggerPermissionFlow = useCallback((trigger: PushPermissionTrigger) => {
    // Settings siempre puede mostrarse
    if (trigger === "settings" || trigger === "manual") {
      setCurrentTrigger(trigger);
      setShouldShowDialog(true);
      return;
    }

    // Para otros triggers, verificar condiciones
    if (canShowDialog()) {
      setCurrentTrigger(trigger);
      setShouldShowDialog(true);
      
      // Marcar como mostrado en sesión
      setHasShownInSession(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
      }
    }
  }, [canShowDialog]);

  // Cerrar diálogo
  const closeDialog = useCallback(() => {
    setShouldShowDialog(false);
    setCurrentTrigger(null);
  }, []);

  // Registrar resultado
  const recordResult = useCallback((result: PushPermissionResult) => {
    const newState: Partial<StoredState> = {
      lastResult: result,
    };

    if (result === "granted" || result === "denied") {
      newState.hasUserDecided = true;
    }

    if (result === "dismissed") {
      newState.dismissCount = storedState.dismissCount + 1;
      newState.lastDismissDate = new Date().toISOString();
    }

    saveState(newState);
    closeDialog();
  }, [storedState.dismissCount, saveState, closeDialog]);

  // Reset para testing
  const reset = useCallback(() => {
    setStoredState({
      hasUserDecided: false,
      lastResult: null,
      dismissCount: 0,
      lastDismissDate: null,
    });
    setHasShownInSession(false);
    setShouldShowDialog(false);
    setCurrentTrigger(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_SHOWN_KEY);
    }
  }, []);

  return {
    shouldShowDialog,
    currentTrigger,
    hasShownInSession,
    hasUserDecided: storedState.hasUserDecided,
    lastResult: storedState.lastResult,
    triggerPermissionFlow,
    closeDialog,
    recordResult,
    reset,
  };
}

export default usePushPermissionFlow;

