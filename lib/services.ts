import { buildApiUrl } from './api';
import { getAccessToken, refreshAccessToken, isTokenExpired } from './auth';

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

/**
 * Obtiene todos los servicios del usuario autenticado
 */
export async function fetchUserServices(organizationId?: string): Promise<Service[]> {
  let token = getAccessToken();
  
  if (!token) {
    throw new Error('No autenticado. Por favor inicia sesión.');
  }

  // Verificar y refrescar token si es necesario
  if (isTokenExpired(token)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      token = newToken;
    } else {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
  }

  const url = organizationId
    ? `${buildApiUrl('/services/me')}?organizationId=${organizationId}`
    : buildApiUrl('/services/me');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || error.message || 'Error al obtener servicios');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Obtiene el catálogo de servicios disponibles para compra
 */
export async function fetchServiceCatalog(): Promise<ServicePlan[]> {
  const response = await fetch(buildApiUrl('/services/catalog'), {
    headers: {
      'Cache-Control': 'no-store',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || error.message || 'Error al obtener catálogo de servicios');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Calcula el progreso de un servicio basado en fechas
 */
export function calculateServiceProgress(service: Service): number | null {
  if (!service.fecha_compra || !service.fecha_expiracion) {
    return null;
  }

  const start = new Date(service.fecha_compra).getTime();
  const end = new Date(service.fecha_expiracion).getTime();
  
  if (isNaN(start) || isNaN(end) || end <= start) {
    return service.estado === 'expirado' ? 100 : null;
  }

  const total = end - start;
  const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
  return Math.round((elapsed / total) * 100);
}

/**
 * Obtiene días restantes hasta expiración
 */
export function getDaysUntilExpiration(service: Service): number | null {
  if (!service.fecha_expiracion) {
    return null;
  }

  const expiration = new Date(service.fecha_expiracion).getTime();
  const now = Date.now();
  const diff = expiration - now;
  
  if (diff < 0) {
    return 0; // Ya expirado
  }

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Formatea el precio en formato de moneda
 */
export function formatPrice(price: number | null | undefined, currency: string = 'COP'): string {
  if (price === null || price === undefined) {
    return 'N/A';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

