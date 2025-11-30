import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { GanttData, GanttTask, GanttMilestone } from "@/lib/types/gantt";

/**
 * Exportar Gantt Chart a PDF
 */
export function exportGanttToPDF(ganttData: GanttData, projectName: string) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - 2 * margin;

  // Título
  doc.setFontSize(18);
  doc.text(`Gantt Chart - ${projectName}`, margin, 15);
  
  // Fecha de exportación
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Exportado el: ${format(new Date(), "PPpp", { locale: es })}`,
    margin,
    22
  );

  // Información del proyecto
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha de inicio: ${format(ganttData.project.startDate, "PP", { locale: es })}`, margin, 30);
  doc.text(`Fecha de fin: ${format(ganttData.project.endDate, "PP", { locale: es })}`, margin, 36);

  // Tabla de tareas
  const tableData = ganttData.tasks.map((task) => [
    task.name,
    format(task.start, "dd/MM/yyyy"),
    format(task.end, "dd/MM/yyyy"),
    `${task.progress}%`,
    task.priority || "N/A",
    task.status || "N/A",
    task.assignedToName || "Sin asignar",
    task.isCritical ? "Sí" : "No",
    task.slack !== undefined ? `${task.slack} días` : "N/A",
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Tarea", "Inicio", "Fin", "Progreso", "Prioridad", "Estado", "Asignado", "Crítica", "Holgura"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    margin: { left: margin, right: margin },
  });

  // Milestones
  if (ganttData.milestones && ganttData.milestones.length > 0) {
    const milestoneData = ganttData.milestones.map((milestone) => [
      milestone.title,
      format(milestone.date, "dd/MM/yyyy"),
      milestone.description || "",
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Milestone", "Fecha", "Descripción"]],
      body: milestoneData,
      theme: "striped",
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 8 },
      margin: { left: margin, right: margin },
    });
  }

  // Guardar PDF
  doc.save(`gantt-${projectName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

/**
 * Exportar Gantt Chart a Excel
 */
export function exportGanttToExcel(ganttData: GanttData, projectName: string) {
  const workbook = XLSX.utils.book_new();

  // Hoja de Tareas
  const tasksData = [
    ["Tarea", "Inicio", "Fin", "Duración (días)", "Progreso (%)", "Prioridad", "Estado", "Asignado", "Dependencias", "Crítica", "Holgura (días)"],
    ...ganttData.tasks.map((task) => {
      const duration = Math.ceil(
        (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24)
      );
      return [
        task.name,
        format(task.start, "dd/MM/yyyy"),
        format(task.end, "dd/MM/yyyy"),
        duration,
        task.progress,
        task.priority || "N/A",
        task.status || "N/A",
        task.assignedToName || "Sin asignar",
        (task.dependencies || []).join(", "),
        task.isCritical ? "Sí" : "No",
        task.slack !== undefined ? task.slack : "N/A",
      ];
    }),
  ];

  const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
  
  // Ajustar ancho de columnas
  tasksSheet["!cols"] = [
    { wch: 30 }, // Tarea
    { wch: 12 }, // Inicio
    { wch: 12 }, // Fin
    { wch: 12 }, // Duración
    { wch: 12 }, // Progreso
    { wch: 10 }, // Prioridad
    { wch: 12 }, // Estado
    { wch: 20 }, // Asignado
    { wch: 30 }, // Dependencias
    { wch: 10 }, // Crítica
    { wch: 12 }, // Holgura
  ];

  XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tareas");

  // Hoja de Milestones
  if (ganttData.milestones && ganttData.milestones.length > 0) {
    const milestonesData = [
      ["Milestone", "Fecha", "Descripción"],
      ...ganttData.milestones.map((milestone) => [
        milestone.title,
        format(milestone.date, "dd/MM/yyyy"),
        milestone.description || "",
      ]),
    ];

    const milestonesSheet = XLSX.utils.aoa_to_sheet(milestonesData);
    milestonesSheet["!cols"] = [
      { wch: 30 }, // Milestone
      { wch: 12 }, // Fecha
      { wch: 50 }, // Descripción
    ];

    XLSX.utils.book_append_sheet(workbook, milestonesSheet, "Milestones");
  }

  // Hoja de Resumen
  const summaryData = [
    ["Información del Proyecto", ""],
    ["Nombre", projectName],
    ["Fecha de Inicio", format(ganttData.project.startDate, "dd/MM/yyyy")],
    ["Fecha de Fin", format(ganttData.project.endDate, "dd/MM/yyyy")],
    ["", ""],
    ["Estadísticas", ""],
    ["Total de Tareas", ganttData.tasks.length],
    ["Tareas Completadas", ganttData.tasks.filter((t) => t.progress === 100).length],
    ["Tareas en Progreso", ganttData.tasks.filter((t) => t.progress > 0 && t.progress < 100).length],
    ["Tareas Pendientes", ganttData.tasks.filter((t) => t.progress === 0).length],
    ["Progreso Promedio", `${Math.round(ganttData.tasks.reduce((acc, t) => acc + t.progress, 0) / ganttData.tasks.length)}%`],
    ["Total de Milestones", ganttData.milestones?.length || 0],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [
    { wch: 25 }, // Etiqueta
    { wch: 30 }, // Valor
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

  // Guardar Excel
  XLSX.writeFile(workbook, `gantt-${projectName}-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}

