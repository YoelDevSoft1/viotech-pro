import { buildApiUrl } from './api';
import { getAccessToken, refreshAccessToken, isTokenExpired } from './auth';

export interface WompiWidgetData {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  signature: string;
  customerEmail: string;
  customerFullName: string;
  serviceId: string;
  redirectUrl: string;
  plan: {
    id: string;
    nombre: string;
    precio: number;
  };
}

export interface WompiTransactionResponse {
  checkout_url: string;
  transaction_id: string;
  service_id: string;
  plan: {
    id: string;
    nombre: string;
    precio: number;
  };
  wompi_reference: string;
}

/**
 * Prepara los datos necesarios para abrir el Widget de Wompi
 * Este método NO crea la transacción, solo genera los parámetros para el widget
 */
export async function prepareWompiWidget(planId: string): Promise<WompiWidgetData> {
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

  const response = await fetch(buildApiUrl('/payments/prepare-widget'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || error.message || 'Error al preparar pago');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Crea una transacción de pago (método legacy con redirect)
 * @deprecated Usar prepareWompiWidget + Wompi Widget en su lugar
 */
export async function createWompiTransaction(planId: string): Promise<WompiTransactionResponse> {
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

  const response = await fetch(buildApiUrl('/payments/create-transaction'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({ planId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    const errorMessage = error.error || error.message || `Error al crear transacción de pago (${response.status})`;
    console.error('Error del servidor al crear transacción:', {
      status: response.status,
      statusText: response.statusText,
      error: error
    });
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Formatea el monto en centavos a formato legible
 */
export function formatAmountInCents(amountInCents: number, currency: string = 'COP'): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

