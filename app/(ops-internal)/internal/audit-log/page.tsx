"use client";

import { AuditLogView } from "@/components/audit-log/AuditLogView";

export default function AuditLogPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-7xl mx-auto">
        <AuditLogView showFilters={true} />
      </div>
    </main>
  );
}

