"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ServicesPageClient } from "@/app/(marketing)/services/services-client";
import { getAccessToken } from "@/lib/auth";

export default function ClientServicesPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/client/services");
    }
  }, [router]);

  return <ServicesPageClient />;
}
