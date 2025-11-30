// Tipos para el sistema de Personalización Avanzada

export type ThemeMode = "light" | "dark" | "system";

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: ThemeMode;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    digest: boolean;
  };
  dashboard: {
    layout: DashboardLayout;
    widgets: DashboardWidget[];
  };
  shortcuts: Record<string, string>; // key: shortcut, value: action
  views: SavedView[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  widgetPositions: WidgetPosition[];
}

export interface WidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardWidget {
  id: string;
  type: "kpi" | "chart" | "table" | "list" | "custom";
  title: string;
  config: Record<string, any>;
  visible: boolean;
  order: number;
}

export interface SavedView {
  id: string;
  name: string;
  type: "tickets" | "projects" | "resources" | "reports" | "custom";
  filters: Record<string, any>;
  columns: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  pageSize?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationBranding {
  id: string;
  organizationId: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  customCss?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers?: ("ctrl" | "alt" | "shift" | "meta")[];
  action: string;
  description: string;
  category: "navigation" | "actions" | "views" | "custom";
  enabled: boolean;
}

export interface CustomizationConfig {
  userId: string;
  preferences: UserPreferences;
  branding?: OrganizationBranding;
  shortcuts: KeyboardShortcut[];
}

