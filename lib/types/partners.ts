/**
 * Tipos para el Portal de Partners
 */

export interface Partner {
  id: string;
  userId: string;
  organizationId: string;
  status: "pending" | "active" | "suspended" | "inactive";
  tier: "bronze" | "silver" | "gold" | "platinum";
  commissionRate: number; // Porcentaje de comisión (ej: 15 = 15%)
  totalRevenue: number;
  totalLeads: number;
  conversionRate: number;
  joinedAt: string;
  lastActiveAt: string;
  certifications: string[];
  performanceScore: number; // 0-100
}

export interface PartnerLead {
  id: string;
  partnerId: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  source: "referral" | "direct" | "campaign";
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  value?: number; // Valor estimado del lead
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerCommission {
  id: string;
  partnerId: string;
  leadId: string;
  amount: number;
  rate: number;
  status: "pending" | "approved" | "paid" | "cancelled";
  period: string; // "2024-01" formato YYYY-MM
  paidAt?: string;
  createdAt: string;
}

export interface MarketingMaterial {
  id: string;
  title: string;
  description: string;
  type: "logo" | "banner" | "brochure" | "video" | "presentation" | "other";
  category: "general" | "service" | "industry" | "case-study";
  fileUrl: string;
  thumbnailUrl?: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerTraining {
  id: string;
  title: string;
  description: string;
  type: "video" | "document" | "course" | "webinar";
  duration?: number; // En minutos
  level: "beginner" | "intermediate" | "advanced";
  required: boolean;
  completedBy: string[]; // IDs de partners que lo completaron
  createdAt: string;
}

export interface PartnerCertification {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  validFor: number; // Días de validez
  issuedAt?: string;
  expiresAt?: string;
  status: "not_started" | "in_progress" | "completed" | "expired";
}

export interface ReferralCode {
  id: string;
  partnerId: string;
  code: string;
  type: "discount" | "commission" | "bonus";
  discount?: number; // Porcentaje de descuento
  commission?: number; // Comisión adicional
  bonus?: number; // Bono fijo
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
}

export interface PartnerPerformance {
  partnerId: string;
  period: string; // "2024-01"
  leadsGenerated: number;
  leadsConverted: number;
  conversionRate: number;
  revenue: number;
  commissions: number;
  averageDealSize: number;
  topPerformingService?: string;
  trends: {
    leads: number[];
    conversions: number[];
    revenue: number[];
  };
}

export interface PartnerDashboard {
  partner: Partner;
  stats: {
    totalLeads: number;
    activeLeads: number;
    conversionRate: number;
    totalRevenue: number;
    pendingCommissions: number;
    paidCommissions: number;
    performanceScore: number;
  };
  recentLeads: PartnerLead[];
  recentCommissions: PartnerCommission[];
  upcomingTrainings: PartnerTraining[];
  certifications: PartnerCertification[];
  performance: PartnerPerformance[];
}

// Tipos para administración de partners
export interface PartnerWithUser extends Partner {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
  } | null;
}

export interface PartnerDetail extends Partner {
  user: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    organizationId: string | null;
  } | null;
  stats: {
    totalLeads: number;
    activeLeads: number;
    convertedLeads: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
  };
}

export interface RegisterPartnerData {
  userId: string;
  organizationId?: string;
  tier?: "bronze" | "silver" | "gold" | "platinum";
  commissionRate?: number;
  status?: "pending" | "active" | "suspended" | "inactive";
}

export interface UpdatePartnerData {
  status?: "pending" | "active" | "suspended" | "inactive";
  tier?: "bronze" | "silver" | "gold" | "platinum";
  commissionRate?: number;
}

