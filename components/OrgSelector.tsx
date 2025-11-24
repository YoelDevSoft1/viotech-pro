"use client";

import { useEffect, useState, useCallback } from "react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken } from "@/lib/auth";

const STORAGE_KEY = "viotech_org_id";
const MOCK_ORGS = [
  { id: "org-demo-1", nombre: "Acme Corp" },
  { id: "org-demo-2", nombre: "Globex" },
  { id: "org-demo-3", nombre: "Initech" },
];

export type Org = { id: string; nombre: string };

type Props = {
  onChange?: (org: Org | null) => void;
  label?: string;
};

export default function OrgSelector({ onChange, label }: Props) {
  const [orgId, setOrgId] = useState("");
  const [customOrg, setCustomOrg] = useState("");
  const [orgs, setOrgs] = useState<Org[]>(MOCK_ORGS);

  const loadOrgs = useCallback(async () => {
    let token = getAccessToken();
    if (!token) return; // fallback to mock
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else return;
    }
    try {
      const res = await fetch(buildApiUrl("/organizations"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (res.ok && payload) {
        const data = payload.data || payload.organizations || payload;
        const mapped: Org[] = (data || []).map((o: any) => ({
          id: String(o.id),
          nombre: o.nombre || o.name || String(o.id),
        }));
        if (mapped.length) setOrgs(mapped);
      }
    } catch {
      // keep mock if fails
    }
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setOrgId(saved);
    loadOrgs();
  }, [loadOrgs]);

  useEffect(() => {
    const selected =
      orgs.find((o) => o.id === orgId) || (orgId ? { id: orgId, nombre: orgId } : null);
    if (typeof window !== "undefined") {
      if (orgId) localStorage.setItem(STORAGE_KEY, orgId);
    }
    onChange?.(selected || null);
  }, [orgId, orgs, onChange]);

  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label || "Organización"}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={orgs.some((o) => o.id === orgId) ? orgId : ""}
          onChange={(e) => {
            const val = e.target.value;
            setOrgId(val);
            setCustomOrg("");
          }}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
        >
          <option value="">Selecciona organización</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.nombre}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={customOrg}
          onChange={(e) => {
            setCustomOrg(e.target.value);
            setOrgId(e.target.value);
          }}
          placeholder="ID de organización"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        Se guarda localmente. Si no hay API disponible, se usan organizaciones mock.
      </p>
    </div>
  );
}
