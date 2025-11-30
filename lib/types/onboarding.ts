// Tipos para el sistema de Onboarding Inteligente

export interface OnboardingStep {
  id: string;
  target: string; // Selector CSS o ID del elemento
  title: string;
  content: string | React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right" | "center" | "auto";
  disableBeacon?: boolean;
  disableOverlayClose?: boolean;
  spotlightClicks?: boolean;
  styles?: {
    options?: {
      zIndex?: number;
      primaryColor?: string;
      textColor?: string;
      backgroundColor?: string;
      overlayColor?: string;
      arrowColor?: string;
      width?: number;
    };
  };
}

export interface OnboardingTour {
  id: string;
  name: string;
  description?: string;
  steps: OnboardingStep[];
  role?: "client" | "internal" | "admin" | "all";
  enabled: boolean;
}

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category: "profile" | "organization" | "features" | "settings" | "other";
  required: boolean;
  order: number;
}

export interface OnboardingChecklist {
  id: string;
  userId: string;
  role: string;
  items: OnboardingChecklistItem[];
  completed: boolean;
  completedAt?: string;
  progress: number; // 0-100
}

export interface OnboardingProgress {
  userId: string;
  role: string;
  toursCompleted: string[]; // IDs de tours completados
  checklistProgress: number; // 0-100
  currentTour?: string; // ID del tour actual
  skippedTours: string[]; // IDs de tours saltados
  lastActiveAt: string;
}

export interface OnboardingTip {
  id: string;
  title: string;
  content: string;
  target: string; // Selector CSS
  placement?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click" | "focus" | "manual";
  role?: "client" | "internal" | "admin" | "all";
  page?: string; // Ruta donde se muestra
  enabled: boolean;
}

export interface OnboardingConfig {
  userId: string;
  role: string;
  skipOnboarding: boolean;
  showTips: boolean;
  showChecklist: boolean;
  autoStartTour?: string; // ID del tour a iniciar automáticamente
}

