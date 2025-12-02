/**
 * Helper para inicializar Sentry con contexto de usuario
 * 
 * Este archivo proporciona funciones para agregar contexto de usuario
 * y configuración adicional a Sentry después de la inicialización.
 * 
 * Solo funciona si @sentry/nextjs está instalado.
 */

/**
 * Configura el usuario actual en Sentry para tracking y filtrado
 */
export async function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
  organizationId?: string;
}) {
  if (typeof window === "undefined") return;

  try {
    // Importar Sentry dinámicamente (solo si está instalado)
    const SentryModule = await import("@sentry/nextjs" as string).catch(() => null);
    if (SentryModule && typeof SentryModule === 'object' && 'setUser' in SentryModule) {
      const Sentry = SentryModule as any;
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username || user.email,
        organizationId: user.organizationId,
      });
    }
  } catch {
    // Sentry no está disponible, ignorar
  }
}

/**
 * Limpia el usuario de Sentry (usar en logout)
 */
export async function clearSentryUser() {
  if (typeof window === "undefined") return;

  try {
    const SentryModule = await import("@sentry/nextjs" as string).catch(() => null);
    if (SentryModule && typeof SentryModule === 'object' && 'setUser' in SentryModule) {
      const Sentry = SentryModule as any;
      Sentry.setUser(null);
    }
  } catch {
    // Sentry no está disponible, ignorar
  }
}

/**
 * Agrega tags personalizados a Sentry
 */
export async function setSentryTag(key: string, value: string) {
  if (typeof window === "undefined") return;

  try {
    const SentryModule = await import("@sentry/nextjs" as string).catch(() => null);
    if (SentryModule && typeof SentryModule === 'object' && 'setTag' in SentryModule) {
      const Sentry = SentryModule as any;
      Sentry.setTag(key, value);
    }
  } catch {
    // Sentry no está disponible, ignorar
  }
}

/**
 * Agrega contexto adicional a Sentry
 */
export async function setSentryContext(name: string, context: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    const SentryModule = await import("@sentry/nextjs" as string).catch(() => null);
    if (SentryModule && typeof SentryModule === 'object' && 'setContext' in SentryModule) {
      const Sentry = SentryModule as any;
      Sentry.setContext(name, context);
    }
  } catch {
    // Sentry no está disponible, ignorar
  }
}

