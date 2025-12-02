/**
 * Cliente de Página de Comparación
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { ServiceComparison } from "@/components/services/ServiceComparison";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import type { ServicePlanExtended } from "@/lib/types/services";

export function ComparePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslationsSafe("services.marketplace.comparison");
  const tCatalog = useTranslationsSafe("services.catalog");
  const initialIds = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  const handleServiceSelect = (service: ServicePlanExtended) => {
    router.push(`/services/catalog/${service.slug}`);
  };

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/services/catalog"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {tCatalog("backToServices")}
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t("description")}
          </p>
        </div>

        {/* Comparación */}
        <ServiceComparison
          initialServiceIds={initialIds}
          onServiceSelect={handleServiceSelect}
        />
      </div>
    </PageShell>
  );
}

