"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const caseStudies = [
  {
    client: "SMD Vital Bogotá",
    industry: "Salud",
    challenge: "Sistema de gestión de pacientes obsoleto y procesos manuales",
    solution: "Plataforma web integral con gestión de citas, historias clínicas digitales y dashboard analítico en tiempo real",
    results: [
      { icon: TrendingUp, metric: "40%", label: "Reducción tiempos" },
      { icon: Users, metric: "2.5x", label: "Más pacientes" },
      { icon: Zap, metric: "95%", label: "Satisfacción" },
    ],
  },
  {
    client: "MedicExpress",
    industry: "Logística médica",
    challenge: "Falta de visibilidad en entregas y comunicación deficiente con clientes",
    solution: "App móvil con tracking en tiempo real, notificaciones automáticas y sistema de gestión de inventario integrado",
    results: [
      { icon: TrendingUp, metric: "60%", label: "Entregas a tiempo" },
      { icon: Users, metric: "3x", label: "Retención clientes" },
      { icon: Zap, metric: "100%", label: "Trazabilidad" },
    ],
  },
  {
    client: "Tech Shop Bogotá",
    industry: "E-commerce",
    challenge: "Sitio web lento y tasa de conversión baja",
    solution: "Rediseño completo con Next.js, optimización de performance y checkout simplificado con pasarelas locales",
    results: [
      { icon: TrendingUp, metric: "180%", label: "Conversiones" },
      { icon: Users, metric: "4x", label: "Velocidad" },
      { icon: Zap, metric: "85%", label: "Mobile traffic" },
    ],
  },
  {
    client: "FinanciaYa",
    industry: "Fintech",
    challenge: "Plataforma de préstamos con problemas de escalabilidad y seguridad",
    solution: "Arquitectura cloud-native, implementación de seguridad bancaria y sistema de scoring automatizado",
    results: [
      { icon: TrendingUp, metric: "250%", label: "Préstamos procesados" },
      { icon: Users, metric: "5x", label: "Usuarios activos" },
      { icon: Zap, metric: "99.9%", label: "Uptime" },
    ],
  },
];

export function CaseStudiesPageClient() {
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
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Volver al inicio
            </Link>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Casos de Éxito
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transformaciones digitales medibles que impulsan el crecimiento empresarial
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
                    <h3 className="font-semibold mb-2 text-foreground">Desafío</h3>
                    <p className="text-muted-foreground">{study.challenge}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Solución</h3>
                    <p className="text-muted-foreground">{study.solution}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-foreground">Resultados</h3>
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
                ¿Listo para ser nuestro próximo caso de éxito?
              </CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg">
                Agenda una consultoría gratuita y descubre cómo podemos transformar tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  Agendar Consultoría Gratuita
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

