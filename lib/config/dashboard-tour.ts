/**
 * Configuración del Tour del Dashboard
 * Tour completo y bien diseñado para nuevos usuarios
 */

import type { OnboardingTour } from "@/lib/types/onboarding";

export const dashboardTour: OnboardingTour = {
  id: "dashboard-welcome",
  name: "Tour del Dashboard",
  description: "Conoce las principales funcionalidades de tu dashboard",
  role: "client",
  enabled: true,
  steps: [
    {
      id: "sidebar",
      target: '[data-tour="sidebar"]',
      title: "Navegación Principal",
      content: "El menú lateral te permite acceder rápidamente a todas las secciones: Dashboard, Tickets, Servicios, Pagos y más. Puedes colapsarlo o expandirlo según necesites.",
      placement: "right",
      disableBeacon: true,
    },
    {
      id: "header",
      target: '[data-tour="header"]',
      title: "Barra Superior",
      content: "Aquí encontrarás tus notificaciones, selector de idioma y botón de actualizar. Mantente al día con todo lo importante.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      id: "kpis",
      target: '[data-tour="kpis"]',
      title: "Métricas Principales",
      content: "Estas tarjetas muestran tus KPIs más importantes: tickets abiertos, servicios activos, cumplimiento de SLA y avance promedio. Revisa estos números regularmente para mantener el control.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      id: "services-panel",
      target: '[data-tour="services-panel"]',
      title: "Servicios Activos",
      content: "Aquí verás todos tus servicios contratados, su estado, fechas de expiración y progreso. Puedes renovar servicios que estén por vencer o explorar nuevos servicios desde aquí.",
      placement: "left",
      disableBeacon: true,
    },
    {
      id: "roadmap",
      target: '[data-tour="roadmap"]',
      title: "Roadmap Inmediato",
      content: "Este panel muestra los próximos hitos importantes: renovaciones de servicios y kickoffs de proyectos. Mantén un ojo aquí para no perderte fechas importantes.",
      placement: "left",
      disableBeacon: true,
    },
    {
      id: "charts",
      target: '[data-tour="charts"]',
      title: "Gráficos y Análisis",
      content: "Los gráficos de tendencias y métricas de SLA te ayudan a visualizar el rendimiento a lo largo del tiempo. Úsalos para identificar patrones y tomar decisiones informadas.",
      placement: "top",
      disableBeacon: true,
    },
  ],
};

