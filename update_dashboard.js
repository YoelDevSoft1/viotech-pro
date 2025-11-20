const fs = require('fs');

// Leer el archivo backup
let content = fs.readFileSync('./app/dashboard/page.tsx.backup', 'utf8');

// 1. Agregar import después de buildApiUrl
content = content.replace(
  'import { buildApiUrl } from "@/lib/api";',
  `import { buildApiUrl } from "@/lib/api";
import { fetchDashboardMetrics, type DashboardMetrics } from "@/lib/metrics";`
);

// 2. Agregar estados después de attachmentsUploading
content = content.replace(
  '  const [attachmentsUploading, setAttachmentsUploading] = useState(false);',
  `  const [attachmentsUploading, setAttachmentsUploading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);`
);

// 3. Agregar función fetchMetrics antes de handleCreateTicket
const fetchMetricsFunc = `
  const fetchMetrics = useCallback(
    async (authToken: string) => {
      if (!authToken) return;
      setMetricsLoading(true);
      try {
        const metrics = await fetchDashboardMetrics(authToken);
        setDashboardMetrics(metrics);
      } catch (metricsError) {
        console.error("Error al cargar métricas:", metricsError);
        // No mostramos error al usuario, usamos fallback a cálculos locales
        setDashboardMetrics(null);
      } finally {
        setMetricsLoading(false);
      }
    },
    []
  );

`;

content = content.replace(
  '  const handleCreateTicket = async (event: FormEvent<HTMLFormElement>) => {',
  fetchMetricsFunc + '  const handleCreateTicket = async (event: FormEvent<HTMLFormElement>) => {'
);

// 4. Agregar useEffect después del useEffect de selectedTicket
const useEffectMetrics = `
  useEffect(() => {
    if (token && !metricsLoading && !dashboardMetrics) {
      fetchMetrics(token);
    }
  }, [token, fetchMetrics, metricsLoading, dashboardMetrics]);

`;

content = content.replace(
  '  useEffect(() => {\n    setTicketComment("");\n  }, [selectedTicket?.id]);',
  '  useEffect(() => {\n    setTicketComment("");\n  }, [selectedTicket?.id]);' + useEffectMetrics
);

// 5. Reemplazar el useMemo de metrics
const oldMetricsRegex = /  const metrics = useMemo\(\(\) => \{[\s\S]*?\}, \[services\]\);/;
const newMetricsUsememo = `  const metrics = useMemo(() => {
    // Si tenemos métricas del backend, usarlas
    if (dashboardMetrics) {
      return [
        {
          title: "Servicios activos",
          value: \`\${dashboardMetrics.serviciosActivos}\`,
          description: "Proyectos enterprise en ejecución",
        },
        {
          title: "Próxima renovación",
          value: dashboardMetrics.proximaRenovacion 
            ? formatDate(dashboardMetrics.proximaRenovacion)
            : "Por definir",
          description: "Próximo servicio a renovar",
        },
        {
          title: "Avance promedio",
          value: \`\${dashboardMetrics.avancePromedio}%\`,
          description: "KPIs globales del trimestre",
        },
        {
          title: "Tickets abiertos",
          value: \`\${dashboardMetrics.ticketsAbiertos}\`,
          description: "Solicitudes de soporte activas",
        },
        {
          title: "Tickets resueltos",
          value: \`\${dashboardMetrics.ticketsResueltos}\`,
          description: "Casos cerrados exitosamente",
        },
        {
          title: "SLA cumplido",
          value: \`\${dashboardMetrics.slaCumplido}%\`,
          description: "Acuerdo activo para top tier",
        },
      ];
    }

    // Fallback: calcular métricas localmente si no hay datos del backend
    if (!services.length) {
      return [
        { title: "Servicios activos", value: "0", description: "Esperando tu próximo proyecto" },
        { title: "Próxima renovación", value: "Por definir", description: "Sin fechas programadas" },
        { title: "Avance promedio", value: "0%", description: "KPIs globales del trimestre" },
      ];
    }

    const activeServices = services.filter((service) => service.estado === "activo");
    const sortedRenewals = [...services]
      .filter((service) => service.fecha_expiracion)
      .sort(
        (a, b) =>
          new Date(a.fecha_expiracion || "").getTime() -
          new Date(b.fecha_expiracion || "").getTime(),
      );

    const avgProgress =
      Math.round(
        (activeServices.reduce(
          (acc, service) => acc + (service.progreso ?? computeProgressFromDates(service) ?? 0),
          0,
        ) /
          (activeServices.length || 1)) *
          10,
      ) / 10;

    return [
      {
        title: "Servicios activos",
        value: \`\${activeServices.length}\`,
        description: "Proyectos enterprise en ejecución",
      },
      {
        title: "Próxima renovación",
        value: sortedRenewals.length ? formatDate(sortedRenewals[0].fecha_expiracion) : "Por definir",
        description: sortedRenewals.length ? sortedRenewals[0].nombre : "Sin proyectos pendientes",
      },
      {
        title: "Avance promedio",
        value: \`\${Number.isFinite(avgProgress) ? avgProgress : 0}%\`,
        description: "KPIs globales del trimestre",
      },
    ];
  }, [services, dashboardMetrics]);`;

content = content.replace(oldMetricsRegex, newMetricsUsememo);

// Guardar el archivo modificado
fs.writeFileSync('./app/dashboard/page.tsx', content, 'utf8');

console.log('✅ Dashboard actualizado exitosamente');
