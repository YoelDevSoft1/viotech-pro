"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function ClientDashboardRedirect() {
  // Simple alias to keep backward compatibility with /client/dashboard
  useEffect(() => {
    redirect("/dashboard");
  }, []);

  return null;
}
