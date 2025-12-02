# 🔍 Verificación de Estado Backend - Portal de Partners

## Objetivo

Este documento lista **todos los endpoints que el frontend espera** del backend para el Portal de Partners. Úsalo para verificar qué está implementado y qué falta.

---

## 📋 Endpoints Esperados por el Frontend

### **1. Dashboard del Partner**

#### `GET /api/partners/dashboard`
**Descripción:** Obtiene el dashboard completo del partner autenticado

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": "string",
      "userId": "string",
      "organizationId": "string",
      "status": "pending" | "active" | "suspended" | "inactive",
      "tier": "bronze" | "silver" | "gold" | "platinum",
      "commissionRate": 15,
      "totalRevenue": 0,
      "totalLeads": 0,
      "conversionRate": 0,
      "joinedAt": "2024-01-01T00:00:00Z",
      "lastActiveAt": "2024-01-01T00:00:00Z",
      "certifications": [],
      "performanceScore": 0
    },
    "stats": {
      "totalLeads": 0,
      "activeLeads": 0,
      "conversionRate": 0,
      "totalRevenue": 0,
      "pendingCommissions": 0,
      "paidCommissions": 0,
      "performanceScore": 0
    },
    "recentLeads": [],
    "recentCommissions": [],
    "upcomingTrainings": [],
    "certifications": [],
    "performance": []
  }
}
```

**Hook usado:** `usePartnerDashboard()` en `lib/hooks/usePartners.ts`

---

### **2. Gestión de Leads**

#### `GET /api/partners/leads`
**Descripción:** Lista los leads del partner autenticado

**Query params:**
- `status?` - Filtro por estado: "new" | "contacted" | "qualified" | "converted" | "lost"
- `source?` - Filtro por fuente: "referral" | "direct" | "campaign"
- `startDate?` - Fecha inicio (ISO string)
- `endDate?` - Fecha fin (ISO string)

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "partnerId": "string",
      "email": "string",
      "name": "string",
      "company": "string",
      "phone": "string",
      "source": "referral" | "direct" | "campaign",
      "status": "new" | "contacted" | "qualified" | "converted" | "lost",
      "value": 0,
      "convertedAt": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Hook usado:** `usePartnerLeads(filters)` en `lib/hooks/usePartners.ts`

---

#### `POST /api/partners/leads`
**Descripción:** Crea un nuevo lead para el partner autenticado

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "email": "string",
  "name": "string",
  "company": "string",
  "phone": "string",
  "source": "referral" | "direct" | "campaign"
}
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "partnerId": "string",
    "email": "string",
    "name": "string",
    "company": "string",
    "phone": "string",
    "source": "referral" | "direct" | "campaign",
    "status": "new",
    "value": null,
    "convertedAt": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Hook usado:** `useCreatePartnerLead()` en `lib/hooks/usePartners.ts`

---

### **3. Gestión de Comisiones**

#### `GET /api/partners/commissions`
**Descripción:** Lista las comisiones del partner autenticado

**Query params:**
- `status?` - Filtro por estado: "pending" | "approved" | "paid" | "cancelled"
- `period?` - Filtro por período (formato: "YYYY-MM")

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "partnerId": "string",
      "leadId": "string",
      "amount": 0,
      "rate": 15,
      "status": "pending" | "approved" | "paid" | "cancelled",
      "period": "2024-01",
      "paidAt": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Hook usado:** `usePartnerCommissions(filters)` en `lib/hooks/usePartners.ts`

---

### **4. Materiales de Marketing**

#### `GET /api/partners/marketing-materials`
**Descripción:** Lista los materiales de marketing disponibles para partners

**Query params:**
- `type?` - Filtro por tipo: "logo" | "banner" | "brochure" | "video" | "presentation" | "other"
- `category?` - Filtro por categoría: "general" | "service" | "industry" | "case-study"

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "logo" | "banner" | "brochure" | "video" | "presentation" | "other",
      "category": "general" | "service" | "industry" | "case-study",
      "fileUrl": "string",
      "thumbnailUrl": "string",
      "downloadCount": 0,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Hook usado:** `useMarketingMaterials(filters)` en `lib/hooks/usePartners.ts`

---

### **5. Trainings y Certificaciones**

#### `GET /api/partners/trainings`
**Descripción:** Lista los trainings disponibles para partners

**Query params:**
- `type?` - Filtro por tipo: "video" | "document" | "course" | "webinar"
- `level?` - Filtro por nivel: "beginner" | "intermediate" | "advanced"
- `required?` - Filtro por requerido: "true" | "false"

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "type": "video" | "document" | "course" | "webinar",
      "duration": 60,
      "level": "beginner" | "intermediate" | "advanced",
      "required": true,
      "completedBy": [],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Hook usado:** `usePartnerTrainings(filters)` en `lib/hooks/usePartners.ts`

---

#### `POST /api/partners/trainings/:id/start`
**Descripción:** Inicia un training para el partner autenticado

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "trainingId": "string",
    "status": "in_progress",
    "startedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Hook usado:** `useStartTraining()` en `lib/hooks/usePartners.ts`

---

#### `POST /api/partners/trainings/:id/complete`
**Descripción:** Marca un training como completado para el partner autenticado

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "trainingId": "string",
    "status": "completed",
    "completedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Hook usado:** `useCompleteTraining()` en `lib/hooks/usePartners.ts`

---

#### `GET /api/partners/certifications`
**Descripción:** Lista las certificaciones del partner autenticado

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "requirements": [],
      "validFor": 365,
      "issuedAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-12-31T00:00:00Z",
      "status": "not_started" | "in_progress" | "completed" | "expired"
    }
  ]
}
```

**Hook usado:** `usePartnerCertifications()` en `lib/hooks/usePartners.ts`

---

### **6. Sistema de Referidos**

#### `GET /api/partners/referral-codes`
**Descripción:** Lista los códigos de referido del partner autenticado

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "partnerId": "string",
      "code": "string",
      "type": "discount" | "commission" | "bonus",
      "discount": 10,
      "commission": 5,
      "bonus": 100,
      "maxUses": 100,
      "usedCount": 0,
      "expiresAt": "2024-12-31T00:00:00Z",
      "active": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Hook usado:** `useReferralCodes()` en `lib/hooks/usePartners.ts`

---

#### `POST /api/partners/referral-codes`
**Descripción:** Crea un nuevo código de referido para el partner autenticado

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "type": "discount" | "commission" | "bonus",
  "discount": 10,
  "commission": 5,
  "bonus": 100,
  "maxUses": 100,
  "expiresAt": "2024-12-31T00:00:00Z"
}
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "partnerId": "string",
    "code": "VIOTECH-ABC123",
    "type": "discount" | "commission" | "bonus",
    "discount": 10,
    "commission": 5,
    "bonus": 100,
    "maxUses": 100,
    "usedCount": 0,
    "expiresAt": "2024-12-31T00:00:00Z",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Hook usado:** `useCreateReferralCode()` en `lib/hooks/usePartners.ts`

---

### **7. Reportes de Performance**

#### `GET /api/partners/performance`
**Descripción:** Obtiene reportes de performance del partner autenticado

**Query params:**
- `period?` - Período específico (formato: "YYYY-MM")

**Headers:**
- `Authorization: Bearer {token}`

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "partnerId": "string",
      "period": "2024-01",
      "leadsGenerated": 10,
      "leadsConverted": 3,
      "conversionRate": 30,
      "revenue": 50000,
      "commissions": 7500,
      "averageDealSize": 16666.67,
      "topPerformingService": "Desarrollo de Software",
      "trends": {
        "leads": [5, 8, 10, 12],
        "conversions": [1, 2, 3, 4],
        "revenue": [10000, 20000, 30000, 50000]
      }
    }
  ]
}
```

**Hook usado:** `usePartnerPerformance(period)` en `lib/hooks/usePartners.ts`

---

## 🔐 Endpoints de Administración (Solo Admin)

### **8. Gestión de Partners (Admin)**

#### `GET /api/partners/admin/list`
**Descripción:** Lista todos los partners (solo admin)

**Query params:**
- `status?` - Filtro por estado
- `tier?` - Filtro por tier
- `organizationId?` - Filtro por organización

**Headers:**
- `Authorization: Bearer {token}` (debe ser admin)

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "organizationId": "string",
      "status": "pending" | "active" | "suspended" | "inactive",
      "tier": "bronze" | "silver" | "gold" | "platinum",
      "commissionRate": 15,
      "totalRevenue": 0,
      "totalLeads": 0,
      "conversionRate": 0,
      "joinedAt": "2024-01-01T00:00:00Z",
      "lastActiveAt": "2024-01-01T00:00:00Z",
      "certifications": [],
      "performanceScore": 0,
      "user": {
        "id": "string",
        "nombre": "string",
        "email": "string",
        "rol": "string"
      }
    }
  ]
}
```

**Hook usado:** `usePartnersList(filters)` en `lib/hooks/usePartnersAdmin.ts`

---

#### `GET /api/partners/admin/:id`
**Descripción:** Obtiene detalles de un partner específico (solo admin)

**Headers:**
- `Authorization: Bearer {token}` (debe ser admin)

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "organizationId": "string",
    "status": "pending" | "active" | "suspended" | "inactive",
    "tier": "bronze" | "silver" | "gold" | "platinum",
    "commissionRate": 15,
    "totalRevenue": 0,
    "totalLeads": 0,
    "conversionRate": 0,
    "joinedAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-01T00:00:00Z",
    "certifications": [],
    "performanceScore": 0,
    "user": {
      "id": "string",
      "nombre": "string",
      "email": "string",
      "rol": "string",
      "organizationId": "string"
    },
    "stats": {
      "totalLeads": 0,
      "activeLeads": 0,
      "convertedLeads": 0,
      "totalCommissions": 0,
      "pendingCommissions": 0,
      "paidCommissions": 0
    }
  }
}
```

**Hook usado:** `usePartnerDetail(partnerId)` en `lib/hooks/usePartnersAdmin.ts`

---

#### `POST /api/partners/admin/register`
**Descripción:** Registra un usuario como partner (solo admin)

**Headers:**
- `Authorization: Bearer {token}` (debe ser admin)
- `Content-Type: application/json`

**Body:**
```json
{
  "userId": "string",
  "organizationId": "string",
  "tier": "bronze" | "silver" | "gold" | "platinum",
  "commissionRate": 15,
  "status": "pending" | "active" | "suspended" | "inactive"
}
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "organizationId": "string",
    "status": "pending" | "active" | "suspended" | "inactive",
    "tier": "bronze" | "silver" | "gold" | "platinum",
    "commissionRate": 15,
    "totalRevenue": 0,
    "totalLeads": 0,
    "conversionRate": 0,
    "joinedAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-01T00:00:00Z",
    "certifications": [],
    "performanceScore": 0
  }
}
```

**Hook usado:** `useRegisterPartner()` en `lib/hooks/usePartnersAdmin.ts`

---

#### `PUT /api/partners/admin/update/:id`
**Descripción:** Actualiza un partner (solo admin)

**Headers:**
- `Authorization: Bearer {token}` (debe ser admin)
- `Content-Type: application/json`

**Body:**
```json
{
  "status": "pending" | "active" | "suspended" | "inactive",
  "tier": "bronze" | "silver" | "gold" | "platinum",
  "commissionRate": 15
}
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "organizationId": "string",
    "status": "active",
    "tier": "gold",
    "commissionRate": 20,
    "totalRevenue": 0,
    "totalLeads": 0,
    "conversionRate": 0,
    "joinedAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-01T00:00:00Z",
    "certifications": [],
    "performanceScore": 0
  }
}
```

**Hook usado:** `useUpdatePartner()` en `lib/hooks/usePartnersAdmin.ts`

---

#### `POST /api/partners/admin/:id/activate`
**Descripción:** Activa un partner (solo admin)

**Headers:**
- `Authorization: Bearer {token}` (debe ser admin)

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "active",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Hook usado:** `useActivatePartner()` en `lib/hooks/usePartnersAdmin.ts`

---

#### `POST /api/partners/admin/:id/suspend`
**Descripción:** Suspende un partner (solo admin)

**Headers:**
- `Authorization: Bearer {token}` (debe ser admin)

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "suspended",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Hook usado:** `useSuspendPartner()` en `lib/hooks/usePartnersAdmin.ts`

---

## ✅ Checklist de Verificación

**Estado:** 🟢 **COMPLETO** (17/17 endpoints implementados - Diciembre 2024)

### Endpoints del Partner
- [x] `GET /api/partners/dashboard` ✅ Implementado
- [x] `GET /api/partners/leads` ✅ Implementado
- [x] `POST /api/partners/leads` ✅ Implementado
- [x] `GET /api/partners/commissions` ✅ Implementado
- [x] `GET /api/partners/marketing-materials` ✅ Implementado
- [x] `GET /api/partners/trainings` ✅ Implementado
- [x] `POST /api/partners/trainings/:id/start` ✅ Implementado (usa `:trainingId`)
- [x] `POST /api/partners/trainings/:id/complete` ✅ Implementado (usa `:trainingId`)
- [x] `GET /api/partners/certifications` ✅ Implementado
- [x] `GET /api/partners/referral-codes` ✅ Implementado
- [x] `POST /api/partners/referral-codes` ✅ Implementado
- [x] `GET /api/partners/performance` ✅ Implementado

### Endpoints de Administración
- [x] `GET /api/partners/admin/list` ✅ Implementado
- [x] `GET /api/partners/admin/:id` ✅ Implementado (usa `:partnerId`)
- [x] `POST /api/partners/admin/register` ✅ Implementado
- [x] `PUT /api/partners/admin/update/:id` ✅ Implementado (usa `:partnerId`)
- [x] `POST /api/partners/admin/:id/activate` ✅ Implementado (usa `:partnerId`)
- [x] `POST /api/partners/admin/:id/suspend` ✅ Implementado (usa `:partnerId`)

### ⚠️ Notas de Implementación

**Nomenclatura de parámetros:**
- El backend usa `:trainingId` y `:partnerId` en lugar de `:id` para mayor claridad
- El frontend puede adaptarse fácilmente o el backend puede cambiarse a `:id` (opcional)
- **Estado actual:** Funciona correctamente con los nombres actuales

**Ajustes aplicados:**
- ✅ Respuesta de `complete training` ajustada: `status: "completed"` en lugar de `completed: true`
- ✅ Dashboard retorna correctamente `partner.certifications` como array de IDs

---

## 📝 Notas para el Backend

1. **Autenticación:** Todos los endpoints requieren JWT válido
2. **Autorización:** 
   - Endpoints `/partners/*` requieren que el usuario sea partner activo
   - Endpoints `/partners/admin/*` requieren rol `admin`
3. **Formato de respuesta:** Todos deben seguir el formato estándar:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Operación exitosa"
   }
   ```
4. **Errores:** Deben retornar:
   ```json
   {
     "success": false,
     "error": "Mensaje de error",
     "code": "ERROR_CODE"
   }
   ```
5. **Códigos HTTP:**
   - `200` - Éxito
   - `201` - Creado
   - `400` - Bad Request (validación)
   - `401` - No autenticado
   - `403` - No autorizado
   - `404` - No encontrado
   - `500` - Error del servidor

---

## 🔗 Referencias

- **Hooks del Frontend:** `lib/hooks/usePartners.ts` y `lib/hooks/usePartnersAdmin.ts`
- **Tipos TypeScript:** `lib/types/partners.ts`
- **Componentes:** `components/partners/*.tsx`
- **Roadmap:** `docs/VIOTECH_ROADMAP_STRATEGICO_2025.md` (Sprint 4.1)

---

**Última actualización:** Diciembre 2024  
**Propósito:** Verificación de estado del backend antes de implementar nuevas features

