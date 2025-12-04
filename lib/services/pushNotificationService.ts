/**
 * Servicio para manejar notificaciones push
 * Sprint 3.3 - VioTech Pro
 */

import { apiClient } from "@/lib/apiClient";

/**
 * Datos de suscripción push serializados
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Respuesta del endpoint de VAPID key
 */
interface VapidKeyResponse {
  data: {
    publicKey: string;
  };
}

/**
 * Respuesta del endpoint de suscripciones
 */
interface SubscriptionsResponse {
  data: {
    subscriptions: Array<{
      id: string;
      endpoint: string;
      created_at: string;
    }>;
  };
}

/**
 * Servicio para gestionar notificaciones push
 */
class PushNotificationService {
  /**
   * Obtener la clave pública VAPID del backend
   */
  async getVapidKey(): Promise<string> {
    try {
      const { data } = await apiClient.get<VapidKeyResponse>("/push/vapid-key");
      return data.data.publicKey;
    } catch (error) {
      console.error("Error obteniendo VAPID key:", error);
      throw new Error("No se pudo obtener la clave VAPID del servidor");
    }
  }

  /**
   * Suscribirse a notificaciones push
   * @param subscription Datos de la suscripción push
   */
  async subscribe(subscription: PushSubscriptionData): Promise<void> {
    try {
      await apiClient.post("/push/subscribe", {
        subscription,
      });
    } catch (error) {
      console.error("Error suscribiéndose a push:", error);
      throw error;
    }
  }

  /**
   * Desuscribirse de notificaciones push
   * @param endpoint Endpoint de la suscripción a eliminar
   */
  async unsubscribe(endpoint: string): Promise<void> {
    try {
      await apiClient.delete("/push/unsubscribe", {
        data: { endpoint },
      });
    } catch (error) {
      console.error("Error desuscribiéndose de push:", error);
      throw error;
    }
  }

  /**
   * Obtener todas las suscripciones del usuario actual
   */
  async getSubscriptions(): Promise<SubscriptionsResponse["data"]["subscriptions"]> {
    try {
      const { data } = await apiClient.get<SubscriptionsResponse>("/push/subscriptions");
      return data.data.subscriptions;
    } catch (error) {
      console.error("Error obteniendo suscripciones:", error);
      throw error;
    }
  }
}

export const pushNotificationService = new PushNotificationService();

