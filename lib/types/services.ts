/**
 * Tipos TypeScript para el Marketplace de Servicios
 * Extiende los tipos básicos con funcionalidades del marketplace
 */

// Tipos básicos (mantener compatibilidad)
export interface Service {
  id: string;
  nombre: string;
  tipo: string;
  estado: 'activo' | 'expirado' | 'pendiente';
  fecha_compra?: string | null;
  fecha_expiracion?: string | null;
  precio?: number | null;
  detalles?: any;
  transaccion_id_wompi?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicePlan {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  currency: string;
  durationDays: number;
  features: string[];
}

// Tipos extendidos para Marketplace
export interface ServiceCategory {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  icon?: string;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceTag {
  id: string;
  nombre: string;
  slug: string;
  createdAt?: string;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number; // 1-5
  title: string;
  comment: string;
  verified: boolean; // Cliente que compró el servicio
  createdAt: string;
  updatedAt?: string;
  helpful: number; // Contador de "útil"
}

export interface ServiceMetadata {
  popular?: boolean;
  featured?: boolean;
  new?: boolean;
  bestSeller?: boolean;
  discount?: {
    percentage: number;
    validUntil: string;
  };
}

export interface ServiceRating {
  average: number;
  count: number;
}

export interface ServicePlanExtended extends ServicePlan {
  slug: string;
  descripcion: string;
  descripcionCorta?: string;
  image?: string | null;
  
  // Nuevos campos del marketplace
  categorias: ServiceCategory[];
  tags: ServiceTag[];
  rating: ServiceRating;
  metadata?: ServiceMetadata;
  
  // Para comparación
  specs?: Record<string, string | number | boolean>;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Fechas
  createdAt: string;
  updatedAt: string;
  
  // Contadores
  viewCount?: number;
  purchaseCount?: number;
}

export interface ServiceComparison {
  services: ServicePlanExtended[];
  differences: {
    field: string;
    values: Record<string, any>;
  }[];
}

export interface ServiceCatalogFilters {
  category?: string;
  tags?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price' | 'price-desc' | 'rating' | 'popular' | 'newest';
  page?: number;
  limit?: number;
}

export interface ServiceCatalogResponse {
  services: ServicePlanExtended[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: ServiceCategory[];
    tags: ServiceTag[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface ServiceReviewsResponse {
  reviews: ServiceReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    average: number;
    count: number;
    distribution: {
      '5': number;
      '4': number;
      '3': number;
      '2': number;
      '1': number;
    };
  };
}

export interface CreateReviewData {
  rating: number;
  title: string;
  comment: string;
}

