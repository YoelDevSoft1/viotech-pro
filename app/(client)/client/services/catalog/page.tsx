"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CatalogPageClient } from "@/app/(marketing)/services/catalog/catalog-client";
import { getAccessToken } from "@/lib/auth";

export default function ClientServicesCatalogPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/client/services/catalog");
    }
  }, [router]);

  return <CatalogPageClient />;
}
