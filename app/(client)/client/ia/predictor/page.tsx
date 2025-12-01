"use client";

import TimelinePredictor from "@/components/common/TimelinePredictor";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function PredictorPage() {
  const tPredictor = useTranslationsSafe("client.ia.predictor");
  
  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {tPredictor("backToDashboard")}
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tPredictor("title")}
          </p>
          <h1 className="text-3xl font-medium text-foreground">{tPredictor("pageTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {tPredictor("description")}
          </p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-background/80 p-6">
          <TimelinePredictor />
        </div>
      </div>
    </main>
  );
}
