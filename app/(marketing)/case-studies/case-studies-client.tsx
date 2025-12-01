"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useMemo } from "react";

export function CaseStudiesPageClient() {
  const t = useTranslationsSafe("marketing.caseStudies");
  
  const caseStudies = useMemo(() => [
    {
      client: t("studies.smdVital.client"),
      industry: t("studies.smdVital.industry"),
      challenge: t("studies.smdVital.challenge"),
      solution: t("studies.smdVital.solution"),
      results: [
        { icon: TrendingUp, metric: "40%", label: t("studies.smdVital.results.timeReduction") },
        { icon: Users, metric: "2.5x", label: t("studies.smdVital.results.morePatients") },
        { icon: Zap, metric: "95%", label: t("studies.smdVital.results.satisfaction") },
      ],
    },
    {
      client: t("studies.medicExpress.client"),
      industry: t("studies.medicExpress.industry"),
      challenge: t("studies.medicExpress.challenge"),
      solution: t("studies.medicExpress.solution"),
      results: [
        { icon: TrendingUp, metric: "60%", label: t("studies.medicExpress.results.onTimeDeliveries") },
        { icon: Users, metric: "3x", label: t("studies.medicExpress.results.customerRetention") },
        { icon: Zap, metric: "100%", label: t("studies.medicExpress.results.traceability") },
      ],
    },
    {
      client: t("studies.techShop.client"),
      industry: t("studies.techShop.industry"),
      challenge: t("studies.techShop.challenge"),
      solution: t("studies.techShop.solution"),
      results: [
        { icon: TrendingUp, metric: "180%", label: t("studies.techShop.results.conversions") },
        { icon: Users, metric: "4x", label: t("studies.techShop.results.speed") },
        { icon: Zap, metric: "85%", label: t("studies.techShop.results.mobileTraffic") },
      ],
    },
    {
      client: t("studies.financiaYa.client"),
      industry: t("studies.financiaYa.industry"),
      challenge: t("studies.financiaYa.challenge"),
      solution: t("studies.financiaYa.solution"),
      results: [
        { icon: TrendingUp, metric: "250%", label: t("studies.financiaYa.results.loansProcessed") },
        { icon: Users, metric: "5x", label: t("studies.financiaYa.results.activeUsers") },
        { icon: Zap, metric: "99.9%", label: t("studies.financiaYa.results.uptime") },
      ],
    },
  ], [t]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> {t("backToHome")}
            </Link>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              {t("title")}
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {caseStudies.map((study, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {study.industry}
                      </Badge>
                      <CardTitle className="text-2xl">{study.client}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">{t("challenge")}</h3>
                    <p className="text-muted-foreground">{study.challenge}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">{t("solution")}</h3>
                    <p className="text-muted-foreground">{study.solution}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-foreground">{t("results")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {study.results.map((result, i) => {
                        const Icon = result.icon;
                        return (
                          <div
                            key={i}
                            className="rounded-2xl border border-border/70 p-4 text-center bg-muted/30"
                          >
                            <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-medium text-foreground">
                              {result.metric}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">
                              {result.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground border-none max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">
                {t("cta.title")}
              </CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg">
                {t("cta.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  {t("cta.button")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

