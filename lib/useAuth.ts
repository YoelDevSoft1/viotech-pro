// lib/useAuth.ts
// Hook para manejo de autenticación con refresh automático

import { useEffect, useState, useCallback } from "react";
import { getAccessToken, getRefreshToken, refreshAccessToken, logout, isTokenExpired } from "./auth";
import { buildApiUrl } from "./api";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación inicial
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken();
      
      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verificar si el token está expirado
      if (isTokenExpired(accessToken)) {
        // Intentar refrescar
        const newToken = await refreshAccessToken();
        if (newToken) {
          setToken(newToken);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setToken(accessToken);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Escuchar cambios de autenticación
    const handleAuthChange = (event: CustomEvent) => {
      setIsAuthenticated(event.detail.isAuthenticated);
      if (!event.detail.isAuthenticated) {
        setToken(null);
      }
    };

    window.addEventListener("authChanged", handleAuthChange as EventListener);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange as EventListener);
    };
  }, []);

  // Función para hacer fetch con refresh automático
  const fetchWithAuth = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let accessToken = getAccessToken();

    // Si no hay token o está expirado, intentar refrescar
    if (!accessToken || (accessToken && isTokenExpired(accessToken))) {
      accessToken = await refreshAccessToken();
      
      if (!accessToken) {
        // No se pudo refrescar, redirigir a login
        await handleLogout();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }
    }

    // Agregar token a headers
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Si el token expiró durante la request, intentar refrescar y reintentar
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Reintentar con nuevo token
        headers.set("Authorization", `Bearer ${newToken}`);
        return fetch(url, {
          ...options,
          headers,
        });
      } else {
        // No se pudo refrescar, redirigir a login
        await handleLogout();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }
    }

    return response;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsAuthenticated(false);
    setToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  return {
    token,
    isAuthenticated,
    isLoading,
    fetchWithAuth,
    logout: handleLogout,
  };
}

