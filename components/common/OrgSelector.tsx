"use client";

import { useEffect, useState } from "react";
import { useOrg } from "@/lib/hooks/useOrg";
export type { Org } from "@/components/common/OrgProvider";
import type { Org } from "@/components/common/OrgProvider";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

type Props = {
  onChange?: (org: Org | null) => void;
  label?: string;
};

export default function OrgSelector({ onChange, label }: Props) {
  const { orgId, orgs, setOrgId, selectedOrg, refreshOrgs, loading, error } = useOrg();
  const [customOrg, setCustomOrg] = useState("");
  const tCommon = useTranslationsSafe("common");

  useEffect(() => {
    if (!orgs.length && !loading) {
      refreshOrgs();
    }
  }, [orgs.length, loading, refreshOrgs]);

  useEffect(() => {
    onChange?.(selectedOrg);
  }, [selectedOrg, onChange]);

  return (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {label || tCommon("organization")}
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
          <option value="">{tCommon("selectOrganization")}</option>
          {Array.isArray(orgs) && orgs.map((org) => (
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
          placeholder={tCommon("orgIdPlaceholder")}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {tCommon("orgSelectorHelp")}
      </p>
      {loading && (
        <p className="text-[11px] text-muted-foreground">
          {tCommon("loadingOrganizations")} {error?.includes("tardando") && tCommon("serverStarting")}
        </p>
      )}
      {error && !loading && (
        <p className="text-[11px] text-amber-600 dark:text-amber-500">
          {error.includes("tardando") ? "⚠️ " : ""}
          {error}
        </p>
      )}
    </div>
  );
}
