// lib/auth.ts

const TOKEN_KEY = "viotech_token";
const REFRESH_KEY = "viotech_refresh_token";
const USER_KEY = "viotech_user_name";

// URL base para auth (evitamos dependencia circular con apiClient)
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL 
  ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api`
  : "http://localhost:3000/api";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

export function saveTokens(token: string, refreshToken: string, userName?: string, remember: boolean = true) {
  if (typeof window === "undefined") return;
  
  const storage = remember ? localStorage : sessionStorage;
  
  // Limpiar el otro storage para evitar duplicados
  (remember ? sessionStorage : localStorage).removeItem(TOKEN_KEY);
  (remember ? sessionStorage : localStorage).removeItem(REFRESH_KEY);

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(REFRESH_KEY, refreshToken);
  
  if (userName) {
    storage.setItem(USER_KEY, userName);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("current-user"); // Limpiar cache de usuario
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Damos 10 segundos de margen
    return Date.now() >= (payload.exp * 1000) - 10000;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("Refresh fallido");

    const data = await res.json();
    const newToken = data.data?.token || data.token;
    const newRefresh = data.data?.refreshToken || data.refreshToken || refreshToken;

    if (newToken) {
      // Detectamos dónde estaba guardado (local o session) para mantener la preferencia
      const isLocal = !!localStorage.getItem(TOKEN_KEY);
      saveTokens(newToken, newRefresh, undefined, isLocal);
      return newToken;
    }
  } catch (error) {
    clearTokens();
  }
  return null;
}

export async function logout() {
  const token = getAccessToken();
  if (token) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
    } catch (e) {
      // Ignoramos error de red en logout
    }
  }
  clearTokens();
  
  // Limpiar usuario de Sentry si está disponible
  if (typeof window !== "undefined") {
    import("@/lib/sentry-init")
      .then(({ clearSentryUser }) => clearSentryUser())
      .catch(() => {
        // Sentry no está disponible, ignorar
      });
  }
  
  // Evento para limpiar estado global si es necesario
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("authChanged", { detail: { isAuthenticated: false } }));
    window.location.href = "/login";
  }
}