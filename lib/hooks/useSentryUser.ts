/**
 * Hook para configurar el usuario en Sentry automáticamente
 * 
 * Uso en componentes donde tengas acceso al usuario:
 * ```tsx
 * const { data: user } = useCurrentUser();
 * useSentryUser(user);
 * ```
 */

import { useEffect } from "react";
import { setSentryUser, clearSentryUser } from "@/lib/sentry-init";

interface User {
  id: string;
  email?: string;
  nombre?: string;
  name?: string;
  organizationId?: string;
  organization_id?: string;
  rol?: string;
  role?: string;
}

export function useSentryUser(user: User | null | undefined) {
  useEffect(() => {
    if (!user || !user.id) {
      // Si no hay usuario, limpiar Sentry
      clearSentryUser();
      return;
    }

    // Configurar usuario en Sentry
    setSentryUser({
      id: user.id,
      email: user.email,
      username: user.nombre || user.name,
      organizationId: user.organizationId || user.organization_id,
    });
  }, [user]);
}

