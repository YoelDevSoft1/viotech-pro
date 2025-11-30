# 📊 Requisitos Backend: Reportes Ejecutivos

## 🎯 Objetivo

Implementar un sistema completo de reportes ejecutivos que permita:
- Generar dashboards ejecutivos con KPIs
- Crear reportes automáticos (diarios, semanales, mensuales)
- Exportar reportes a PDF/Excel
- Comparar métricas históricas
- Generar predicciones con IA

---

## 📊 Endpoints Requeridos

### **1. GET /api/reports/executive**
Obtener dashboard ejecutivo con KPIs y métricas.

**Query Parameters:**
- `organizationId` (opcional) - Filtrar por organización
- `startDate` (opcional) - Fecha de inicio (ISO date)
- `endDate` (opcional) - Fecha de fin (ISO date)
- `period` (opcional) - Período: "daily", "weekly", "monthly", "quarterly", "yearly"

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-12-01",
      "end": "2024-12-31"
    },
    "projectMetrics": {
      "totalProjects": 25,
      "activeProjects": 10,
      "completedProjects": 15,
      "averageDeliveryTime": 45.5,
      "onTimeDeliveryRate": 85.2,
      "averageProjectDuration": 60.3,
      "projectsByStatus": { "activo": 10, "completado": 15 },
      "projectsByType": { "desarrollo": 20, "soporte": 5 }
    },
    "ticketMetrics": {
      "totalTickets": 150,
      "openTickets": 25,
      "resolvedTickets": 125,
      "averageResolutionTime": 24.5,
      "averageResponseTime": 2.3,
      "slaComplianceRate": 92.5,
      "ticketsByStatus": { "abierto": 25, "resuelto": 125 },
      "ticketsByPriority": { "P1": 10, "P2": 30, "P3": 80, "P4": 30 },
      "ticketsByCategory": { "bug": 50, "feature": 70, "soporte": 30 }
    },
    "resourceMetrics": {
      "totalResources": 15,
      "activeResources": 12,
      "averageUtilization": 75.5,
      "overallocationCount": 2,
      "resourcesOnLeave": 3,
      "skillsDistribution": { "React": 8, "Node.js": 10 },
      "certificationsExpiring": 5
    },
    "satisfactionMetrics": {
      "nps": 65,
      "averageRating": 4.5,
      "responseRate": 80.2,
      "satisfactionByCategory": { "soporte": 4.6, "desarrollo": 4.4 },
      "feedbackCount": 120
    },
    "financialMetrics": {
      "totalRevenue": 500000,
      "totalCosts": 350000,
      "profit": 150000,
      "profitMargin": 30,
      "revenueByService": { "consultoria": 300000, "soporte": 200000 },
      "costsByCategory": { "personal": 250000, "infraestructura": 100000 }
    },
    "kpis": [
      {
        "id": "kpi-1",
        "name": "Tasa de Entrega a Tiempo",
        "value": 85.2,
        "unit": "%",
        "target": 90,
        "trend": "up",
        "trendValue": 5.2,
        "period": "monthly",
        "category": "projects"
      }
    ],
    "trends": [
      {
        "id": "trend-1",
        "type": "line",
        "title": "Tickets por Semana",
        "data": [
          { "x": "2024-12-01", "y": 10 },
          { "x": "2024-12-08", "y": 15 }
        ],
        "xAxisLabel": "Semana",
        "yAxisLabel": "Tickets"
      }
    ],
    "comparisons": [
      {
        "current": {
          "period": { "start": "2024-12-01", "end": "2024-12-31" },
          "value": 85.2
        },
        "previous": {
          "period": { "start": "2024-11-01", "end": "2024-11-30" },
          "value": 80.0
        },
        "change": 5.2,
        "changeType": "increase"
      }
    ]
  }
}
```

**Lógica:**
- Calcular métricas de proyectos basado en proyectos del período
- Calcular métricas de tickets basado en tickets del período
- Calcular métricas de recursos basado en recursos y carga de trabajo
- Calcular métricas de satisfacción basado en feedback/ratings
- Calcular KPIs principales
- Generar datos de tendencias para gráficos
- Comparar con período anterior

---

### **2. GET /api/reports**
Listar reportes generados.

**Query Parameters:**
- `organizationId` (opcional)
- `startDate` (opcional)
- `endDate` (opcional)
- `type` (opcional) - "executive", "operational", "financial", "custom"

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Reporte Ejecutivo Diciembre 2024",
      "type": "executive",
      "period": {
        "start": "2024-12-01",
        "end": "2024-12-31"
      },
      "generatedAt": "2024-12-31T23:59:59.000Z",
      "generatedBy": "user-id",
      "kpis": [...],
      "charts": [...],
      "summary": "Resumen del reporte...",
      "organizationId": "uuid"
    }
  ]
}
```

---

### **3. GET /api/reports/:id**
Obtener un reporte específico.

**Respuesta:** Mismo formato que el item del array anterior.

---

### **4. POST /api/reports/generate**
Generar un nuevo reporte.

**Body:**
```json
{
  "type": "executive",
  "period": {
    "start": "2024-12-01",
    "end": "2024-12-31"
  },
  "filters": {
    "organizationId": "uuid"
  }
}
```

**Respuesta:** Reporte generado (mismo formato que GET /api/reports/:id).

---

### **5. GET /api/reports/:id/export**
Exportar reporte a PDF o Excel.

**Query Parameters:**
- `format` (requerido) - "pdf" o "excel"

**Respuesta:** Archivo binario (PDF o Excel).

---

### **6. GET /api/reports/automated**
Listar reportes automáticos configurados.

**Query Parameters:**
- `organizationId` (opcional)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Reporte Semanal Ejecutivo",
      "type": "weekly",
      "recipients": ["user-id-1", "user-id-2"],
      "format": "pdf",
      "schedule": {
        "time": "09:00",
        "timezone": "America/Bogota",
        "dayOfWeek": 1
      },
      "enabled": true,
      "lastGenerated": "2024-12-23T09:00:00.000Z",
      "nextGeneration": "2024-12-30T09:00:00.000Z",
      "organizationId": "uuid"
    }
  ]
}
```

---

### **7. POST /api/reports/automated**
Crear un reporte automático.

**Body:**
```json
{
  "name": "Reporte Semanal Ejecutivo",
  "type": "weekly",
  "recipients": ["user-id-1", "user-id-2"],
  "format": "pdf",
  "schedule": {
    "time": "09:00",
    "timezone": "America/Bogota",
    "dayOfWeek": 1
  },
  "enabled": true,
  "organizationId": "uuid"
}
```

---

### **8. PUT /api/reports/automated/:id**
Actualizar un reporte automático.

---

### **9. DELETE /api/reports/automated/:id**
Eliminar un reporte automático.

---

### **10. GET /api/reports/predictions**
Obtener predicciones con IA.

**Query Parameters:**
- `metric` (opcional) - Filtrar por métrica específica

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "metric": "onTimeDeliveryRate",
      "currentValue": 85.2,
      "predictedValue": 88.5,
      "confidence": 85,
      "timeframe": "30d",
      "factors": [
        "Tendencia histórica positiva",
        "Mejora en gestión de recursos",
        "Reducción de sobreasignaciones"
      ],
      "recommendations": [
        "Mantener el ritmo actual de entrega",
        "Continuar optimizando asignación de recursos"
      ]
    }
  ]
}
```

---

## 🗄️ Estructura de Base de Datos

### **Tabla: `reports`**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('executive', 'operational', 'financial', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  kpis JSONB,
  charts JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tabla: `automated_reports`**
```sql
CREATE TABLE automated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  recipients TEXT[] NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'excel', 'both')),
  schedule_time TIME NOT NULL,
  schedule_timezone VARCHAR(50) DEFAULT 'America/Bogota',
  schedule_day_of_week INTEGER CHECK (schedule_day_of_week >= 0 AND schedule_day_of_week <= 6),
  schedule_day_of_month INTEGER CHECK (schedule_day_of_month >= 1 AND schedule_day_of_month <= 31),
  enabled BOOLEAN DEFAULT true,
  last_generated TIMESTAMPTZ,
  next_generation TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Lógica de Negocio

### **1. Cálculo de Métricas de Proyectos**

- **Total Proyectos:** Contar proyectos en el período
- **Activos:** Proyectos con estado "activo"
- **Completados:** Proyectos con estado "completado"
- **Tiempo Promedio de Entrega:** Promedio de días entre inicio y fin de proyectos completados
- **Tasa de Entrega a Tiempo:** Porcentaje de proyectos completados antes de la fecha objetivo
- **Duración Promedio:** Promedio de duración de proyectos

### **2. Cálculo de Métricas de Tickets**

- **Total Tickets:** Contar tickets en el período
- **Abiertos:** Tickets con estado "abierto" o "en_progreso"
- **Resueltos:** Tickets con estado "resuelto" o "cerrado"
- **Tiempo Promedio de Resolución:** Promedio de horas entre creación y resolución
- **Tiempo Promedio de Respuesta:** Promedio de horas hasta primera respuesta
- **Cumplimiento SLA:** Porcentaje de tickets que cumplen con SLA

### **3. Cálculo de Métricas de Recursos**

- **Total Recursos:** Contar recursos activos
- **Utilización Promedio:** Promedio de utilización de recursos
- **Sobreasignaciones:** Contar recursos con utilización > 100%
- **Recursos en Vacaciones:** Contar recursos con estado "on_leave"

### **4. Cálculo de KPIs**

KPIs principales:
- Tasa de Entrega a Tiempo (objetivo: 90%)
- Cumplimiento SLA (objetivo: 95%)
- Utilización de Recursos (objetivo: 80%)
- NPS (objetivo: 50+)

### **5. Generación de Tendencias**

- Agrupar datos por período (día, semana, mes)
- Calcular valores agregados
- Generar datos para gráficos de línea, barra, área

### **6. Comparativas Históricas**

- Comparar período actual con período anterior equivalente
- Calcular cambio porcentual
- Identificar si es aumento, disminución o estable

### **7. Predicciones con IA**

- Usar datos históricos para entrenar modelo
- Predecir valores futuros (7d, 30d, 90d, 1y)
- Calcular nivel de confianza
- Identificar factores que influyen
- Generar recomendaciones

---

## 📝 Permisos y Seguridad

### **GET /api/reports/executive**
- ✅ Requiere autenticación
- ✅ Cliente solo ve reportes de su organización
- ✅ Agente/admin ven todos los reportes

### **POST /api/reports/generate**
- ✅ Requiere autenticación
- ✅ Solo admin/agente pueden generar reportes

### **GET/POST/PUT/DELETE /api/reports/automated**
- ✅ Requiere autenticación
- ✅ Solo admin puede gestionar reportes automáticos

### **GET /api/reports/predictions**
- ✅ Requiere autenticación
- ✅ Solo admin/agente pueden ver predicciones

---

## 🚀 Integración con Sistema Existente

- ✅ Usa datos de proyectos existentes
- ✅ Usa datos de tickets existentes
- ✅ Usa datos de recursos existentes
- ✅ Integra con sistema de feedback/satisfacción (futuro)
- ✅ Compatible con sistema de organizaciones

---

## ✅ Checklist de Implementación

- [ ] Crear tabla `reports`
- [ ] Crear tabla `automated_reports`
- [ ] Implementar `GET /api/reports/executive`
- [ ] Implementar `GET /api/reports`
- [ ] Implementar `GET /api/reports/:id`
- [ ] Implementar `POST /api/reports/generate`
- [ ] Implementar `GET /api/reports/:id/export`
- [ ] Implementar `GET /api/reports/automated`
- [ ] Implementar `POST /api/reports/automated`
- [ ] Implementar `PUT /api/reports/automated/:id`
- [ ] Implementar `DELETE /api/reports/automated/:id`
- [ ] Implementar `GET /api/reports/predictions`
- [ ] Implementar cálculo de métricas
- [ ] Implementar generación de tendencias
- [ ] Implementar comparativas históricas
- [ ] Implementar predicciones con IA
- [ ] Implementar scheduler para reportes automáticos
- [ ] Integrar rutas en `index.cjs`
- [ ] Documentación Swagger

---

**Última actualización:** Diciembre 2024  
**Estado:** 📋 Requisitos definidos - Pendiente implementación backend

