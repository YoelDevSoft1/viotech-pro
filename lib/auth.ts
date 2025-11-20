// lib/auth.ts
// Utilidades para manejo de autenticación con refresh tokens

import { buildApiUrl } from "./api";

const TOKEN_STORAGE_KEY = "viotech_token";
const REFRESH_TOKEN_STORAGE_KEY = "viotech_refresh_token";
const USERNAME_STORAGE_KEY = "viotech_user_name";

/**
 * Obtener access token del storage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  
  // Intentar localStorage primero
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY) || 
                window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  
  return token;
}

/**
 * Obtener refresh token del storage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  
  // Intentar localStorage primero
  const token = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || 
                window.sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  
  return token;
}

/**
 * Guardar tokens en storage
 */
export function saveTokens(
  accessToken: string,
  refreshToken: string,
  username: string,
  rememberMe: boolean = false
): void {
  if (typeof window === "undefined") return;
  
  const preferredStorage = rememberMe ? window.localStorage : window.sessionStorage;
  const secondaryStorage = rememberMe ? window.sessionStorage : window.localStorage;

  // Guardar en storage preferido
  preferredStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
  preferredStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  preferredStorage.setItem(USERNAME_STORAGE_KEY, username);

  // Limpiar del storage secundario
  secondaryStorage.removeItem(TOKEN_STORAGE_KEY);
  secondaryStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  secondaryStorage.removeItem(USERNAME_STORAGE_KEY);

  // Legacy keys (para compatibilidad)
  window.localStorage.setItem("authTokenVioTech", accessToken);
  window.localStorage.setItem("userNameVioTech", username);
}

/**
 * Limpiar todos los tokens
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USERNAME_STORAGE_KEY);
  window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(USERNAME_STORAGE_KEY);
  
  // Legacy keys
  window.localStorage.removeItem("authTokenVioTech");
  window.localStorage.removeItem("userNameVioTech");
}

/**
 * Refrescar access token usando refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(buildApiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.data?.token) {
      // Refresh token inválido o expirado
      clearTokens();
      return null;
    }

    const newAccessToken = data.data.token;
    const newRefreshToken = data.data.refreshToken || refreshToken; // Mantener refresh token si no se renueva

    // Actualizar tokens en storage
    const username = window.localStorage.getItem(USERNAME_STORAGE_KEY) || 
                     window.sessionStorage.getItem(USERNAME_STORAGE_KEY) || "";
    
    // Determinar si estaba en localStorage (rememberMe)
    const rememberMe = !!window.localStorage.getItem(TOKEN_STORAGE_KEY);
    
    saveTokens(newAccessToken, newRefreshToken, username, rememberMe);

    return newAccessToken;
  } catch (error) {
    console.error("Error al refrescar token:", error);
    clearTokens();
    return null;
  }
}

/**
 * Hacer logout y revocar token en el servidor
 */
export async function logout(): Promise<void> {
  const token = getAccessToken();
  
  // Intentar revocar token en el servidor (no bloquear si falla)
  if (token) {
    try {
      await fetch(buildApiUrl("/auth/logout"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error al hacer logout en servidor:", error);
      // Continuar con limpieza local aunque falle el servidor
    }
  }

  // Limpiar tokens localmente
  clearTokens();

  // Disparar evento para notificar a otros componentes
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("authChanged", {
        detail: { isAuthenticated: false, userName: null },
      })
    );
  }
}

/**
 * Verificar si un token está expirado (decodificación básica)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() >= exp;
  } catch {
    return true; // Si no se puede decodificar, asumir expirado
  }
}

/**
 * Obtener tiempo restante hasta expiración del token (en segundos)
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    const remaining = Math.floor((exp - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return null;
  }
}

