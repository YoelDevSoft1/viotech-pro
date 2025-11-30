"use client";

// Fallback translations en español
const fallbackTranslations: Record<string, string> = {
  "navigation.dashboard": "Dashboard",
  "navigation.tickets": "Tickets",
  "navigation.projects": "Proyectos",
  "navigation.resources": "Recursos",
  "navigation.reports": "Reportes",
  "navigation.settings": "Configuración",
  "navigation.notifications": "Notificaciones",
  "sidebar.myTickets": "Mis Tickets",
  "sidebar.myServices": "Mis Servicios",
  "sidebar.artificialIntelligence": "Inteligencia Artificial",
  "sidebar.payments": "Pagos",
  "sidebar.users": "Usuarios",
  "sidebar.health": "Health",
  "sidebar.blog": "Blog",
  "sidebar.comments": "Comentarios",
  "sidebar.auditLog": "Audit Log",
  "sidebar.administration": "Administración",
  "sidebar.operations": "Operaciones",
  "sidebar.controlPanel": "Panel de Control",
  "sidebar.help": "Ayuda",
  "sidebar.technicalSupport": "Soporte Técnico",
  "ui.noItemsAvailable": "No hay items disponibles",
  "ui.quickCreate": "Quick Create",
  "ui.refresh": "Actualizar",
  "common.close": "Cerrar",
};

/**
 * Hook seguro de traducciones que funciona incluso durante prerender
 * Por ahora usa fallback, cuando next-intl esté completamente activo se puede migrar
 */
export function useTranslationsSafe(namespace?: string) {
  // Por ahora siempre usar fallback hasta que next-intl esté completamente configurado
  // TODO: Migrar a next-intl cuando el middleware esté activo
  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return fallbackTranslations[fullKey] || fallbackTranslations[key] || key;
  };
}

