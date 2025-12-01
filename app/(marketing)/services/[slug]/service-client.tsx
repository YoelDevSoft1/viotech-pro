"use client";

import Link from "next/link";
import { ArrowRight, Check, Code2, Brain, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const iconMap = {
  Code2,
  Brain,
  Headphones,
};

interface ServicePageClientProps {
  service: {
    title: string;
    description: string;
    icon: keyof typeof iconMap;
    features: string[];
    benefits: string[];
  };
  slug: string;
}

export function ServicePageClient({ service, slug }: ServicePageClientProps) {
  const Icon = iconMap[service.icon] || Code2;
  const t = useTranslationsSafe("marketing.services.detail");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Link
              href="/services"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> {t("backToServices")}
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-foreground/5">
                <Icon className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              {service.title}
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {service.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  {t("scheduleConsultation")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/services/catalog">
                  {t("viewPlans")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t("whatIncludes")}
              </h2>
              <p className="text-muted-foreground">
                {t("whatIncludesDescription")}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {service.features.map((feature, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t("measurableBenefits")}
              </h2>
              <p className="text-muted-foreground">
                {t("measurableBenefitsDescription")}
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {service.benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">{benefit}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground border-none max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">
                {t("readyToStart")}
              </CardTitle>
              <CardDescription className="text-primary-foreground/90">
                {t("readyToStartDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  {t("scheduleConsultation")}
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

