"use client";

import Link from "next/link";
import { ArrowRight, Target, Users, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export function AboutPageClient() {
  const t = useTranslationsSafe("marketing.about");

  const values = [
    {
      icon: Target,
      title: t("values.results.title"),
      description: t("values.results.description"),
    },
    {
      icon: Zap,
      title: t("values.speed.title"),
      description: t("values.speed.description"),
    },
    {
      icon: Shield,
      title: t("values.security.title"),
      description: t("values.security.description"),
    },
    {
      icon: Globe,
      title: t("values.global.title"),
      description: t("values.global.description"),
    },
  ];

  const stats = [
    { value: "+50", label: t("stats.projectsDelivered") },
    { value: "5+", label: t("stats.yearsExperience") },
    { value: "99.9%", label: t("stats.uptimeAverage") },
    { value: "98%", label: t("stats.clientSatisfaction") },
  ];

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

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-4xl font-bold text-foreground">{stat.value}</h3>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-4">{t("mission.title")}</CardTitle>
                <CardDescription className="text-lg">
                  {t("mission.description")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t("values.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("values.subtitle")}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t("team.title")}
              </h2>
              <p className="text-muted-foreground">
                {t("team.subtitle")}
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{t("team.multidisciplinary.title")}</h3>
                    <p className="text-muted-foreground">
                      {t("team.multidisciplinary.description")}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {t("team.multidisciplinary.detail")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
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

