"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";
import { RedirectPanel } from "@/components/common/RedirectPanel";

export default function ServicesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(Boolean(token));
  }, []);

  // Mostrar panel de redirección mientras se verifica autenticación
  if (isAuthenticated === null) {
    return <RedirectPanel redirectTo="/client/services" delay={4000} />;
  }

  // Si está autenticado, redirigir a servicios de cliente
  if (isAuthenticated) {
    return <RedirectPanel redirectTo="/client/services" delay={4000} />;
  }

  // Si no está autenticado, redirigir a login con return URL
  return <RedirectPanel redirectTo="/login?from=/client/services" delay={4000} />;
}
