"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { apiClient } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/auth";

export type Org = { id: string; nombre: string };

type OrgContextValue = {
  orgId: string;
  orgs: Org[];
  selectedOrg: Org | null;
  loading: boolean;
  error: string | null;
  setOrgId: (id: string) => void;
  refreshOrgs: () => Promise<void>;
};

const STORAGE_KEY = "viotech_org_id";
const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [orgId, setOrgId] = useState<string>("");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const initialized = useRef(false);

  // Cargar ID del localStorage al iniciar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setOrgId(saved);
    }
  }, []);

  const refreshOrgs = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    // Verificar si hay token antes de intentar cargar
    const token = getAccessToken();
    if (!token) {
      console.log("ℹ️ No hay token de autenticación. Saltando carga de organizaciones.");
      setLoading(false);
      setError(null);
      setOrgs([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Hacemos la petición con timeout aumentado para cold starts
      // Renombramos 'data' a 'responseData' para evitar conflictos de nombres
      const { data: responseData } = await apiClient.get("/organizations", {
        timeout: 30000, // 30 segundos para esta petición específica
      });
      
      console.log("🏢 Respuesta API Organizaciones:", responseData);

      // 2. Lógica para encontrar el array correcto dentro de la respuesta
      let rawList: any[] = [];

      if (Array.isArray(responseData)) {
        // Caso: [...]
        rawList = responseData;
      } else if (responseData?.data?.organizations && Array.isArray(responseData.data.organizations)) {
        // Caso: { data: { organizations: [...] } }  <-- ESTE ES TU CASO ACTUAL
        rawList = responseData.data.organizations;
      } else if (responseData?.organizations && Array.isArray(responseData.organizations)) {
        // Caso: { organizations: [...] }
        rawList = responseData.organizations;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        // Caso: { data: [...] }
        rawList = responseData.data;
      } else {
        console.warn("⚠️ Estructura de organizaciones desconocida:", responseData);
        rawList = [];
      }

      // 3. Mapear los datos al formato del frontend
      const mapped: Org[] = rawList.map((o: any) => ({
        id: String(o.id || o._id),
        nombre: o.nombre || o.name || String(o.id || "Sin nombre"),
      }));

      setOrgs(mapped);

      // 4. Autoseleccionar organización si es necesario
      setOrgId((currentId) => {
        // Si ya hay una seleccionada, verificar que siga existiendo
        if (currentId) {
            const exists = mapped.find(o => o.id === currentId);
            return exists ? currentId : (mapped[0]?.id || "");
        }
        // Si no, seleccionar la primera disponible
        return mapped.length > 0 ? mapped[0].id : "";
      });

      // Limpiar error si la petición fue exitosa
      setError(null);

    } catch (err: any) {
      console.error("❌ Error cargando organizaciones:", err);
      
      // Si es un error 401 (no autenticado), no mostrar error crítico
      const isUnauthorized = err.response?.status === 401 || 
                            err.message?.includes("Token no proporcionado") ||
                            err.message?.includes("Acceso denegado") ||
                            err.message?.includes("Sesión expirada");
      
      if (isUnauthorized) {
        console.log("ℹ️ No autenticado. Las organizaciones se cargarán después del login.");
        setError(null);
        setOrgs([]);
        setLoading(false);
        return;
      }
      
      // Manejo mejorado de errores
      let msg = "Error cargando organizaciones";
      const isTimeout = err.message?.includes("timeout") || 
                       err.message?.includes("tardando demasiado") ||
                       err.code === 'ECONNABORTED';
      
      if (err.message) {
        msg = err.message;
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.error) {
        msg = err.response.data.error;
      }
      
      // Si es un error de timeout y aún tenemos reintentos disponibles
      if (isTimeout && retryCount < MAX_RETRIES) {
        console.warn(`⚠️ Timeout al cargar organizaciones (intento ${retryCount + 1}/${MAX_RETRIES + 1}). Reintentando...`);
        
        // Esperar un poco antes de reintentar (exponencial backoff)
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        
        // Reintentar
        return refreshOrgs(retryCount + 1);
      }
      
      // Si es timeout pero ya no hay más reintentos, mostrar mensaje informativo
      if (isTimeout) {
        msg = "El servidor está tardando en responder. Puede estar iniciando. Intenta recargar la página en unos segundos.";
        console.warn("⚠️ Timeout después de todos los reintentos - el servidor puede estar en cold start");
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial - solo si hay token
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const token = getAccessToken();
      if (token) {
        refreshOrgs();
      } else {
        setLoading(false);
      }
    }
  }, [refreshOrgs]);

  // Escuchar cambios de autenticación para cargar organizaciones cuando el usuario se autentique
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      if (event.detail.isAuthenticated) {
        // Usuario se autenticó, cargar organizaciones
        refreshOrgs();
      } else {
        // Usuario cerró sesión, limpiar organizaciones
        setOrgs([]);
        setOrgId("");
        setError(null);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("authChanged", handleAuthChange as EventListener);
      return () => {
        window.removeEventListener("authChanged", handleAuthChange as EventListener);
      };
    }
  }, [refreshOrgs]);

  // Guardar selección en localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && orgId) {
      window.localStorage.setItem(STORAGE_KEY, orgId);
    }
  }, [orgId]);

  const selectedOrg = useMemo(() => {
    return orgs.find((o) => o.id === orgId) || (orgId ? { id: orgId, nombre: "Cargando..." } : null);
  }, [orgId, orgs]);

  const value = useMemo<OrgContextValue>(
    () => ({
      orgId,
      orgs,
      selectedOrg,
      loading,
      error,
      setOrgId,
      refreshOrgs,
    }),
    [orgId, orgs, selectedOrg, loading, error, refreshOrgs],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrgContext() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrgContext must be used within OrgProvider");
  return ctx;
}