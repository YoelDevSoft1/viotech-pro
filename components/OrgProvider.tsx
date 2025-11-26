"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiFetch, type ApiError } from "@/lib/apiClient";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const inFlight = useRef(false);

  const refreshOrgs = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<any>({
        path: "/organizations",
        auth: true,
      });
      const data = payload?.data?.organizations || payload?.data || payload?.organizations || payload || [];
      const mapped: Org[] = (Array.isArray(data) ? data : []).map((o: any) => ({
        id: String(o.id),
        nombre: o.nombre || o.name || String(o.id),
      }));
      setOrgs(mapped);
      if (!initialized.current && mapped.length && !orgId) {
        setOrgId(mapped[0].id);
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as ApiError)?.payload && typeof (err as ApiError).payload === "object"
            ? JSON.stringify((err as ApiError).payload)
            : "No se pudieron cargar organizaciones";
      setError(msg);
    } finally {
      inFlight.current = false;
      setLoading(false);
      initialized.current = true;
    }
  }, [orgId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) setOrgId(saved);
    refreshOrgs();
  }, [refreshOrgs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (orgId) window.localStorage.setItem(STORAGE_KEY, orgId);
  }, [orgId]);

  const selectedOrg = useMemo(() => {
    return orgs.find((o) => o.id === orgId) || (orgId ? { id: orgId, nombre: orgId } : null);
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
