"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useLocaleContext } from "@/lib/contexts/LocaleContext";
import { useMemo } from "react";

export function HomePageClient() {
  const t = useTranslationsSafe("marketing.home");
  const { locale } = useLocaleContext(); // Obtener locale para forzar re-render cuando cambie

  const features = useMemo(
    () => [
      {
        icon: Zap,
        title: t("features.ultraFast.title"),
        desc: t("features.ultraFast.description"),
      },
      {
        icon: Shield,
        title: t("features.bankSecurity.title"),
        desc: t("features.bankSecurity.description"),
      },
      {
        icon: BarChart3,
        title: t("features.analytics.title"),
        desc: t("features.analytics.description"),
      },
      {
        icon: Globe,
        title: t("features.globalDomain.title"),
        desc: t("features.globalDomain.description"),
      },
      {
        icon: CheckCircle2,
        title: t("features.support24x7.title"),
        desc: t("features.support24x7.description"),
      },
      {
        icon: ArrowRight,
        title: t("features.scalability.title"),
        desc: t("features.scalability.description"),
      },
    ],
    [t, locale]
  );

  const stats = useMemo(
    () => [
      { value: "+50", label: t("stats.projectsDelivered") },
      { value: "99.9%", label: t("stats.uptimeGuaranteed") },
      { value: "24h", label: t("stats.supportTime") },
      { value: "+10k", label: t("stats.usersImpacted") },
    ],
    [t, locale]
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm rounded-full">
            {t("newVersion")}
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground leading-normal pb-1">
            {t("heroTitle")} <br className="hidden md:block" />
            {t("heroTitleLine2")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-[800px] text-balance">
            {t("heroDescription")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 rounded-full px-8 shadow-lg">
                {t("scheduleConsultation")} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/services/catalog">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 rounded-full px-8">
                {t("viewPlans")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Elementos decorativos de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[100px] rounded-full -z-10" />
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground mt-2">{t("featuresSubtitle")}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Card key={i} className="bg-background border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-4xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/10 to-transparent pointer-events-none" />

            <div className="p-8 md:p-16 text-center relative z-10 flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-4 text-primary-foreground">{t("cta.title")}</h2>
              <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
                {t("cta.description")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto shadow-lg">
                    {t("cta.scheduleConsultation")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/case-studies" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-semibold w-full sm:w-auto border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    {t("cta.viewCaseStudies")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

