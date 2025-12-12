"use client";

import { use } from "react";
import { ResourceDetail } from "@/components/resources/ResourceDetail";

interface ResourceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { id } = use(params);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-[1600px] mx-auto">
        <ResourceDetail resourceId={id} backHref="/internal/resources" />
      </div>
    </main>
  );
}

