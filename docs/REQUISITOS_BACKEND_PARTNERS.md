# 🎯 Requisitos Backend: Portal de Partners

## 🎯 Objetivo

Implementar un sistema completo de gestión de partners que permita a los partners generar leads, recibir comisiones, acceder a materiales de marketing, completar trainings y certificaciones, y gestionar códigos de referido.

---

## 📊 Endpoints Requeridos

### **1. GET /api/partners/dashboard**
Obtener el dashboard completo del partner actual.

**Autenticación:** Requerida (Bearer token)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "partner": {
      "id": "partner-id",
      "userId": "user-id",
      "organizationId": "org-id",
      "status": "active",
      "tier": "gold",
      "commissionRate": 15,
      "totalRevenue": 50000,
      "totalLeads": 120,
      "conversionRate": 12.5,
      "joinedAt": "2024-01-15T10:00:00.000Z",
      "lastActiveAt": "2024-12-01T10:00:00.000Z",
      "certifications": ["cert-1", "cert-2"],
      "performanceScore": 85
    },
    "stats": {
      "totalLeads": 120,
      "activeLeads": 15,
      "conversionRate": 12.5,
      "totalRevenue": 50000,
      "pendingCommissions": 5000,
      "paidCommissions": 45000,
      "performanceScore": 85
    },
    "recentLeads": [
      {
        "id": "lead-id",
        "partnerId": "partner-id",
        "email": "lead@example.com",
        "name": "John Doe",
        "company": "Company Inc",
        "phone": "+1234567890",
        "source": "referral",
        "status": "qualified",
        "value": 5000,
        "convertedAt": null,
        "createdAt": "2024-12-01T10:00:00.000Z",
        "updatedAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "recentCommissions": [
      {
        "id": "commission-id",
        "partnerId": "partner-id",
        "leadId": "lead-id",
        "amount": 750,
        "rate": 15,
        "status": "paid",
        "period": "2024-11",
        "paidAt": "2024-12-01T10:00:00.000Z",
        "createdAt": "2024-11-15T10:00:00.000Z"
      }
    ],
    "upcomingTrainings": [
      {
        "id": "training-id",
        "title": "Advanced Sales Techniques",
        "description": "Learn advanced sales techniques",
        "type": "video",
        "duration": 60,
        "level": "advanced",
        "required": false,
        "completedBy": ["partner-1"],
        "createdAt": "2024-11-01T10:00:00.000Z"
      }
    ],
    "certifications": [
      {
        "id": "cert-id",
        "title": "Certified Partner",
        "description": "Basic partner certification",
        "requirements": ["Complete onboarding", "Generate 10 leads"],
        "validFor": 365,
        "issuedAt": "2024-01-15T10:00:00.000Z",
        "expiresAt": "2025-01-15T10:00:00.000Z",
        "status": "completed"
      }
    ],
    "performance": [
      {
        "partnerId": "partner-id",
        "period": "2024-11",
        "leadsGenerated": 10,
        "leadsConverted": 2,
        "conversionRate": 20,
        "revenue": 10000,
        "commissions": 1500,
        "averageDealSize": 5000,
        "topPerformingService": "Development",
        "trends": {
          "leads": [8, 9, 10, 12, 10],
          "conversions": [1, 2, 1, 2, 2],
          "revenue": [8000, 9000, 10000, 12000, 10000]
        }
      }
    ]
  }
}
```

**Lógica:**
- Verificar que el usuario tenga rol de partner
- Calcular estadísticas en tiempo real
- Obtener leads recientes (últimos 10)
- Obtener comisiones recientes (últimas 10)
- Obtener trainings disponibles y próximos
- Obtener certificaciones del partner
- Calcular performance por período

---

### **2. GET /api/partners/leads**
Obtener leads del partner con filtros opcionales.

**Query Parameters:**
- `status` (opcional) - Filtrar por estado: "new", "contacted", "qualified", "converted", "lost"
- `source` (opcional) - Filtrar por fuente: "referral", "direct", "campaign"
- `startDate` (opcional) - Fecha de inicio (ISO 8601)
- `endDate` (opcional) - Fecha de fin (ISO 8601)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lead-id",
      "partnerId": "partner-id",
      "email": "lead@example.com",
      "name": "John Doe",
      "company": "Company Inc",
      "phone": "+1234567890",
      "source": "referral",
      "status": "qualified",
      "value": 5000,
      "convertedAt": null,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-01T10:00:00.000Z"
    }
  ]
}
```

---

### **3. POST /api/partners/leads**
Crear un nuevo lead para el partner.

**Body:**
```json
{
  "email": "lead@example.com",
  "name": "John Doe",
  "company": "Company Inc",
  "phone": "+1234567890",
  "source": "referral"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "lead-id",
    "partnerId": "partner-id",
    "email": "lead@example.com",
    "name": "John Doe",
    "company": "Company Inc",
    "phone": "+1234567890",
    "source": "referral",
    "status": "new",
    "value": null,
    "convertedAt": null,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Validaciones:**
- Email válido y único por partner
- Nombre requerido
- Source debe ser uno de los valores permitidos

---

### **4. GET /api/partners/commissions**
Obtener comisiones del partner con filtros opcionales.

**Query Parameters:**
- `status` (opcional) - Filtrar por estado: "pending", "approved", "paid", "cancelled"
- `period` (opcional) - Período en formato "YYYY-MM"

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "commission-id",
      "partnerId": "partner-id",
      "leadId": "lead-id",
      "amount": 750,
      "rate": 15,
      "status": "paid",
      "period": "2024-11",
      "paidAt": "2024-12-01T10:00:00.000Z",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ]
}
```

---

### **5. GET /api/partners/marketing-materials**
Obtener materiales de marketing disponibles.

**Query Parameters:**
- `type` (opcional) - Filtrar por tipo: "logo", "banner", "brochure", "video", "presentation", "other"
- `category` (opcional) - Filtrar por categoría: "general", "service", "industry", "case-study"

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "material-id",
      "title": "Company Logo Pack",
      "description": "Official logos in various formats",
      "type": "logo",
      "category": "general",
      "fileUrl": "https://storage.example.com/materials/logo-pack.zip",
      "thumbnailUrl": "https://storage.example.com/materials/logo-pack-thumb.png",
      "downloadCount": 150,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

---

### **6. GET /api/partners/trainings**
Obtener trainings disponibles para el partner.

**Query Parameters:**
- `type` (opcional) - Filtrar por tipo: "video", "document", "course", "webinar"
- `level` (opcional) - Filtrar por nivel: "beginner", "intermediate", "advanced"
- `required` (opcional) - Filtrar por requerido: true/false

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "training-id",
      "title": "Advanced Sales Techniques",
      "description": "Learn advanced sales techniques",
      "type": "video",
      "duration": 60,
      "level": "advanced",
      "required": false,
      "completedBy": ["partner-1"],
      "createdAt": "2024-11-01T10:00:00.000Z"
    }
  ]
}
```

---

### **7. POST /api/partners/trainings/:trainingId/complete**
Marcar un training como completado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "trainingId": "training-id",
    "completed": true,
    "completedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Lógica:**
- Agregar el partnerId a `completedBy` del training
- Si el training es requerido y es el último requerido, verificar si se puede otorgar certificación

---

### **8. GET /api/partners/certifications**
Obtener certificaciones del partner.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cert-id",
      "title": "Certified Partner",
      "description": "Basic partner certification",
      "requirements": ["Complete onboarding", "Generate 10 leads"],
      "validFor": 365,
      "issuedAt": "2024-01-15T10:00:00.000Z",
      "expiresAt": "2025-01-15T10:00:00.000Z",
      "status": "completed"
    }
  ]
}
```

---

### **9. GET /api/partners/referral-codes**
Obtener códigos de referido del partner.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "code-id",
      "partnerId": "partner-id",
      "code": "PARTNER2024",
      "type": "discount",
      "discount": 10,
      "commission": null,
      "bonus": null,
      "maxUses": 100,
      "usedCount": 45,
      "expiresAt": "2025-12-31T23:59:59.000Z",
      "active": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### **10. POST /api/partners/referral-codes**
Crear un nuevo código de referido.

**Body:**
```json
{
  "type": "discount",
  "discount": 10,
  "maxUses": 100,
  "expiresAt": "2025-12-31T23:59:59.000Z"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "code-id",
    "partnerId": "partner-id",
    "code": "PARTNER2024ABC",
    "type": "discount",
    "discount": 10,
    "commission": null,
    "bonus": null,
    "maxUses": 100,
    "usedCount": 0,
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "active": true,
    "createdAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Lógica:**
- Generar código único (combinación de texto y números)
- Validar que el tipo y los valores correspondientes sean correctos
- Si es tipo "discount", `discount` es requerido
- Si es tipo "commission", `commission` es requerido
- Si es tipo "bonus", `bonus` es requerido

---

### **11. GET /api/partners/performance**
Obtener reportes de performance del partner.

**Query Parameters:**
- `period` (opcional) - Período específico en formato "YYYY-MM"

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "partnerId": "partner-id",
      "period": "2024-11",
      "leadsGenerated": 10,
      "leadsConverted": 2,
      "conversionRate": 20,
      "revenue": 10000,
      "commissions": 1500,
      "averageDealSize": 5000,
      "topPerformingService": "Development",
      "trends": {
        "leads": [8, 9, 10, 12, 10],
        "conversions": [1, 2, 1, 2, 2],
        "revenue": [8000, 9000, 10000, 12000, 10000]
      }
    }
  ]
}
```

**Lógica:**
- Si no se especifica período, devolver últimos 12 meses
- Calcular tendencias semanales dentro del período
- Identificar servicio más exitoso basado en conversiones

---

## 🗄️ Esquema de Base de Datos

### **Tabla: `partners`**
```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_partners_user_id ON partners(user_id);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_tier ON partners(tier);
```

---

### **Tabla: `partner_leads`**
```sql
CREATE TABLE partner_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  source VARCHAR(20) NOT NULL CHECK (source IN ('referral', 'direct', 'campaign')),
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  value DECIMAL(12,2),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, email)
);

CREATE INDEX idx_partner_leads_partner_id ON partner_leads(partner_id);
CREATE INDEX idx_partner_leads_status ON partner_leads(status);
CREATE INDEX idx_partner_leads_source ON partner_leads(source);
CREATE INDEX idx_partner_leads_created_at ON partner_leads(created_at);
```

---

### **Tabla: `partner_commissions`**
```sql
CREATE TABLE partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES partner_leads(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  period VARCHAR(7) NOT NULL, -- Formato YYYY-MM
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_commissions_partner_id ON partner_commissions(partner_id);
CREATE INDEX idx_partner_commissions_status ON partner_commissions(status);
CREATE INDEX idx_partner_commissions_period ON partner_commissions(period);
```

---

### **Tabla: `marketing_materials`**
```sql
CREATE TABLE marketing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('logo', 'banner', 'brochure', 'video', 'presentation', 'other')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('general', 'service', 'industry', 'case-study')),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketing_materials_type ON marketing_materials(type);
CREATE INDEX idx_marketing_materials_category ON marketing_materials(category);
```

---

### **Tabla: `partner_trainings`**
```sql
CREATE TABLE partner_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'document', 'course', 'webinar')),
  duration INTEGER, -- En minutos
  level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Tabla: `partner_training_completions`**
```sql
CREATE TABLE partner_training_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES partner_trainings(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, training_id)
);

CREATE INDEX idx_training_completions_partner_id ON partner_training_completions(partner_id);
CREATE INDEX idx_training_completions_training_id ON partner_training_completions(training_id);
```

---

### **Tabla: `partner_certifications`**
```sql
CREATE TABLE partner_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements JSONB, -- Array de strings
  valid_for INTEGER NOT NULL, -- Días de validez
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_certifications_partner_id ON partner_certifications(partner_id);
CREATE INDEX idx_partner_certifications_status ON partner_certifications(status);
```

---

### **Tabla: `referral_codes`**
```sql
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('discount', 'commission', 'bonus')),
  discount DECIMAL(5,2),
  commission DECIMAL(5,2),
  bonus DECIMAL(12,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_codes_partner_id ON referral_codes(partner_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_active ON referral_codes(active);
```

---

## 🔧 Lógica de Negocio

### **1. Cálculo de Performance Score**

El performance score se calcula basado en:
- **Leads generados (30%):** Número de leads en los últimos 3 meses
- **Tasa de conversión (30%):** Porcentaje de leads convertidos
- **Revenue generado (25%):** Ingresos totales en los últimos 3 meses
- **Trainings completados (10%):** Porcentaje de trainings requeridos completados
- **Certificaciones activas (5%):** Número de certificaciones válidas

**Fórmula:**
```
performanceScore = (
  (leadsScore * 0.30) +
  (conversionScore * 0.30) +
  (revenueScore * 0.25) +
  (trainingsScore * 0.10) +
  (certsScore * 0.05)
)
```

Cada componente se normaliza a 0-100.

---

### **2. Actualización de Tier**

Los tiers se actualizan automáticamente basado en el performance score:
- **Bronze:** 0-40 puntos
- **Silver:** 41-60 puntos
- **Gold:** 61-80 puntos
- **Platinum:** 81-100 puntos

Se actualiza mensualmente.

---

### **3. Cálculo de Comisiones**

Cuando un lead se convierte:
1. Se calcula el valor de la comisión: `leadValue * (commissionRate / 100)`
2. Se crea un registro en `partner_commissions` con status "pending"
3. Se actualiza el `total_revenue` del partner
4. Se actualiza el `conversion_rate` del partner

**Aprobación de Comisiones:**
- Las comisiones se aprueban automáticamente si el lead se convierte dentro de 30 días
- Las comisiones se aprueban manualmente por un admin si pasan 30 días

**Pago de Comisiones:**
- Se procesan mensualmente
- Se agrupan por período (YYYY-MM)
- Se genera un reporte de pago

---

### **4. Generación de Códigos de Referido**

Los códigos se generan con el formato:
- Prefijo basado en el tier del partner (BRONZE, SILVER, GOLD, PLAT)
- Año actual
- 4 caracteres alfanuméricos aleatorios

Ejemplo: `GOLD2024A3B7`

---

### **5. Validación de Certificaciones**

Las certificaciones se otorgan automáticamente cuando:
- Se completan todos los trainings requeridos
- Se cumplen todos los requisitos (ej: generar X leads, alcanzar Y revenue)

Las certificaciones expiran después de `valid_for` días desde `issued_at`.

---

## 📝 Permisos y Seguridad

### **Todos los endpoints:**
- ✅ Requieren autenticación
- ✅ Solo el partner puede ver/modificar sus propios datos
- ✅ Los admins pueden ver todos los partners y sus datos

### **Endpoints específicos:**
- `GET /api/partners/dashboard` - Solo partners
- `POST /api/partners/leads` - Solo partners activos
- `POST /api/partners/referral-codes` - Solo partners activos
- `GET /api/partners/performance` - Solo partners

---

## 🔄 Integraciones

### **1. Sistema de Leads**
- Cuando un lead se convierte, se crea automáticamente una comisión
- Se actualiza el estado del lead a "converted"
- Se registra el `converted_at`

### **2. Sistema de Pagos**
- Las comisiones se pueden pagar vía transferencia bancaria
- Se integra con el sistema de facturación para generar facturas

### **3. Sistema de Notificaciones**
- Notificación cuando se genera un nuevo lead
- Notificación cuando se aprueba una comisión
- Notificación cuando se paga una comisión
- Notificación cuando expira una certificación

---

## 📊 Métricas y Reportes

### **Métricas del Dashboard:**
- Total de leads generados
- Leads activos (status: new, contacted, qualified)
- Tasa de conversión
- Revenue total
- Comisiones pendientes
- Comisiones pagadas
- Performance score

### **Reportes de Performance:**
- Leads generados por período
- Conversiones por período
- Revenue por período
- Tendencias semanales
- Servicio más exitoso
- Comparación con períodos anteriores

---

## 🚀 Próximos Pasos

1. Implementar endpoints en el backend
2. Crear migraciones de base de datos
3. Implementar lógica de cálculo de performance
4. Integrar con sistema de pagos
5. Configurar notificaciones automáticas
6. Crear reportes ejecutivos para admins

