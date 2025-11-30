import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { ExecutiveDashboard, KPI } from "@/lib/types/reports";

/**
 * Exportar Dashboard Ejecutivo a PDF
 */
export function exportExecutiveDashboardToPDF(
  dashboard: ExecutiveDashboard,
  title: string = "Dashboard Ejecutivo"
) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Título
  doc.setFontSize(18);
  doc.text(title, margin, 15);

  // Fecha de exportación
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Exportado el: ${format(new Date(), "PPpp", { locale: es })}`,
    margin,
    22
  );

  // Período
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Período: ${format(new Date(dashboard.period.start), "PP", { locale: es })} - ${format(new Date(dashboard.period.end), "PP", { locale: es })}`,
    margin,
    30
  );

  // KPIs
  const kpiData = dashboard.kpis.map((kpi) => [
    kpi.name,
    `${kpi.value}${kpi.unit || ""}`,
    kpi.target ? `${kpi.target}${kpi.unit || ""}` : "N/A",
    kpi.trend || "N/A",
    kpi.category,
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["KPI", "Valor", "Objetivo", "Tendencia", "Categoría"]],
    body: kpiData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // Métricas de Proyectos
  const projectData = [
    ["Total Proyectos", dashboard.projectMetrics.totalProjects],
    ["Proyectos Activos", dashboard.projectMetrics.activeProjects],
    ["Proyectos Completados", dashboard.projectMetrics.completedProjects],
    ["Tiempo Promedio de Entrega", `${dashboard.projectMetrics.averageDeliveryTime.toFixed(1)} días`],
    ["Tasa de Entrega a Tiempo", `${dashboard.projectMetrics.onTimeDeliveryRate.toFixed(1)}%`],
    ["Duración Promedio", `${dashboard.projectMetrics.averageProjectDuration.toFixed(1)} días`],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Métrica", "Valor"]],
    body: projectData,
    theme: "striped",
    headStyles: { fillColor: [34, 197, 94] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // Métricas de Tickets
  const ticketData = [
    ["Total Tickets", dashboard.ticketMetrics.totalTickets],
    ["Tickets Abiertos", dashboard.ticketMetrics.openTickets],
    ["Tickets Resueltos", dashboard.ticketMetrics.resolvedTickets],
    ["Tiempo Promedio de Resolución", `${dashboard.ticketMetrics.averageResolutionTime.toFixed(1)} horas`],
    ["Tiempo Promedio de Respuesta", `${dashboard.ticketMetrics.averageResponseTime.toFixed(1)} horas`],
    ["Cumplimiento SLA", `${dashboard.ticketMetrics.slaComplianceRate.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Métrica", "Valor"]],
    body: ticketData,
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // Métricas de Recursos
  const resourceData = [
    ["Total Recursos", dashboard.resourceMetrics.totalResources],
    ["Recursos Activos", dashboard.resourceMetrics.activeResources],
    ["Utilización Promedio", `${dashboard.resourceMetrics.averageUtilization.toFixed(1)}%`],
    ["Sobreasignaciones", dashboard.resourceMetrics.overallocationCount],
    ["Recursos en Vacaciones", dashboard.resourceMetrics.resourcesOnLeave],
    ["Certificaciones por Expirar", dashboard.resourceMetrics.certificationsExpiring],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Métrica", "Valor"]],
    body: resourceData,
    theme: "striped",
    headStyles: { fillColor: [139, 92, 246] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // Métricas de Satisfacción
  const satisfactionData = [
    ["NPS (Net Promoter Score)", dashboard.satisfactionMetrics.nps.toFixed(1)],
    ["Calificación Promedio", `${dashboard.satisfactionMetrics.averageRating.toFixed(1)}/5`],
    ["Tasa de Respuesta", `${dashboard.satisfactionMetrics.responseRate.toFixed(1)}%`],
    ["Total de Feedback", dashboard.satisfactionMetrics.feedbackCount],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Métrica", "Valor"]],
    body: satisfactionData,
    theme: "striped",
    headStyles: { fillColor: [236, 72, 153] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // Guardar PDF
  doc.save(`dashboard-ejecutivo-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

/**
 * Exportar Dashboard Ejecutivo a Excel
 */
export function exportExecutiveDashboardToExcel(
  dashboard: ExecutiveDashboard,
  title: string = "Dashboard Ejecutivo"
) {
  const workbook = XLSX.utils.book_new();

  // Hoja de KPIs
  const kpisData = [
    ["KPI", "Valor", "Unidad", "Objetivo", "Tendencia", "Valor Tendencia", "Categoría"],
    ...dashboard.kpis.map((kpi) => [
      kpi.name,
      kpi.value,
      kpi.unit || "",
      kpi.target || "",
      kpi.trend || "",
      kpi.trendValue || "",
      kpi.category,
    ]),
  ];

  const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
  kpisSheet["!cols"] = [
    { wch: 30 }, // KPI
    { wch: 15 }, // Valor
    { wch: 10 }, // Unidad
    { wch: 15 }, // Objetivo
    { wch: 12 }, // Tendencia
    { wch: 15 }, // Valor Tendencia
    { wch: 15 }, // Categoría
  ];
  XLSX.utils.book_append_sheet(workbook, kpisSheet, "KPIs");

  // Hoja de Proyectos
  const projectsData = [
    ["Métrica", "Valor"],
    ["Total Proyectos", dashboard.projectMetrics.totalProjects],
    ["Proyectos Activos", dashboard.projectMetrics.activeProjects],
    ["Proyectos Completados", dashboard.projectMetrics.completedProjects],
    ["Tiempo Promedio de Entrega (días)", dashboard.projectMetrics.averageDeliveryTime],
    ["Tasa de Entrega a Tiempo (%)", dashboard.projectMetrics.onTimeDeliveryRate],
    ["Duración Promedio (días)", dashboard.projectMetrics.averageProjectDuration],
  ];

  const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
  projectsSheet["!cols"] = [
    { wch: 35 }, // Métrica
    { wch: 15 }, // Valor
  ];
  XLSX.utils.book_append_sheet(workbook, projectsSheet, "Proyectos");

  // Hoja de Tickets
  const ticketsData = [
    ["Métrica", "Valor"],
    ["Total Tickets", dashboard.ticketMetrics.totalTickets],
    ["Tickets Abiertos", dashboard.ticketMetrics.openTickets],
    ["Tickets Resueltos", dashboard.ticketMetrics.resolvedTickets],
    ["Tiempo Promedio de Resolución (horas)", dashboard.ticketMetrics.averageResolutionTime],
    ["Tiempo Promedio de Respuesta (horas)", dashboard.ticketMetrics.averageResponseTime],
    ["Cumplimiento SLA (%)", dashboard.ticketMetrics.slaComplianceRate],
  ];

  const ticketsSheet = XLSX.utils.aoa_to_sheet(ticketsData);
  ticketsSheet["!cols"] = [
    { wch: 40 }, // Métrica
    { wch: 15 }, // Valor
  ];
  XLSX.utils.book_append_sheet(workbook, ticketsSheet, "Tickets");

  // Hoja de Recursos
  const resourcesData = [
    ["Métrica", "Valor"],
    ["Total Recursos", dashboard.resourceMetrics.totalResources],
    ["Recursos Activos", dashboard.resourceMetrics.activeResources],
    ["Utilización Promedio (%)", dashboard.resourceMetrics.averageUtilization],
    ["Sobreasignaciones", dashboard.resourceMetrics.overallocationCount],
    ["Recursos en Vacaciones", dashboard.resourceMetrics.resourcesOnLeave],
    ["Certificaciones por Expirar", dashboard.resourceMetrics.certificationsExpiring],
  ];

  const resourcesSheet = XLSX.utils.aoa_to_sheet(resourcesData);
  resourcesSheet["!cols"] = [
    { wch: 30 }, // Métrica
    { wch: 15 }, // Valor
  ];
  XLSX.utils.book_append_sheet(workbook, resourcesSheet, "Recursos");

  // Hoja de Satisfacción
  const satisfactionData = [
    ["Métrica", "Valor"],
    ["NPS (Net Promoter Score)", dashboard.satisfactionMetrics.nps],
    ["Calificación Promedio", dashboard.satisfactionMetrics.averageRating],
    ["Tasa de Respuesta (%)", dashboard.satisfactionMetrics.responseRate],
    ["Total de Feedback", dashboard.satisfactionMetrics.feedbackCount],
  ];

  const satisfactionSheet = XLSX.utils.aoa_to_sheet(satisfactionData);
  satisfactionSheet["!cols"] = [
    { wch: 30 }, // Métrica
    { wch: 15 }, // Valor
  ];
  XLSX.utils.book_append_sheet(workbook, satisfactionSheet, "Satisfacción");

  // Hoja de Resumen
  const summaryData = [
    ["Resumen Ejecutivo", ""],
    ["Período", `${format(new Date(dashboard.period.start), "dd/MM/yyyy", { locale: es })} - ${format(new Date(dashboard.period.end), "dd/MM/yyyy", { locale: es })}`],
    ["", ""],
    ["Métricas Clave", ""],
    ["Proyectos Activos", dashboard.projectMetrics.activeProjects],
    ["Tickets Abiertos", dashboard.ticketMetrics.openTickets],
    ["Utilización de Recursos", `${dashboard.resourceMetrics.averageUtilization.toFixed(1)}%`],
    ["NPS", dashboard.satisfactionMetrics.nps.toFixed(1)],
    ["Tasa de Entrega a Tiempo", `${dashboard.projectMetrics.onTimeDeliveryRate.toFixed(1)}%`],
    ["Cumplimiento SLA", `${dashboard.ticketMetrics.slaComplianceRate.toFixed(1)}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [
    { wch: 30 }, // Etiqueta
    { wch: 30 }, // Valor
  ];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

  // Guardar Excel
  XLSX.writeFile(workbook, `dashboard-ejecutivo-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}

