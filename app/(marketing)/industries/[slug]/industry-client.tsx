"use client";

import Link from "next/link";
import { ArrowRight, Check, TrendingUp, ShoppingCart, Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const iconMap = {
  TrendingUp,
  ShoppingCart,
  Heart,
};

interface IndustryPageClientProps {
  industry: {
    title: string;
    description: string;
    icon: keyof typeof iconMap;
    challenges: string[];
    solutions: string[];
    caseStudy: {
      client: string;
      result: string;
    };
  };
  slug: string;
}

export function IndustryPageClient({ industry, slug }: IndustryPageClientProps) {
  const Icon = iconMap[industry.icon] || TrendingUp;
  const t = useTranslationsSafe("marketing.industries");

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
            
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-foreground/5">
                <Icon className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              {industry.title}
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {industry.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  {t("scheduleConsultation")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/case-studies">
                  {t("viewCaseStudies")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t("commonChallenges")} {slug === "fintech" ? "Fintech" : slug === "retail" ? "Retail" : "Salud"}
              </h2>
              <p className="text-muted-foreground">
                {t("commonChallengesDescription")}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {industry.challenges.map((challenge, index) => (
                <Card key={index} className="border-destructive/20">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{challenge}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {t("ourSolutions")}
              </h2>
              <p className="text-muted-foreground">
                {t("ourSolutionsDescription")}
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {industry.solutions.map((solution, index) => (
                <Card key={index} className="border-primary/20">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{solution}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-4">
                  {t("caseStudy")}
                </Badge>
                <CardTitle className="text-3xl mb-2">
                  {industry.caseStudy.client}
                </CardTitle>
                <CardDescription className="text-primary-foreground/90 text-lg">
                  {industry.caseStudy.result}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link href="/case-studies">
                    {t("viewFullCase")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">
                {t("cta.title")} {slug === "fintech" ? "fintech" : slug === "retail" ? "retail" : "clínica"}?
              </CardTitle>
              <CardDescription className="text-lg">
                {t("cta.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" asChild>
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

