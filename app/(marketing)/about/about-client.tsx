"use client";

import Link from "next/link";
import { ArrowRight, Target, Users, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const values = [
  {
    icon: Target,
    title: "Enfoque en resultados",
    description: "Cada proyecto tiene objetivos claros y medibles. Nos enfocamos en entregar valor real.",
  },
  {
    icon: Zap,
    title: "Velocidad sin sacrificar calidad",
    description: "Time-to-market rápido con código limpio, arquitectura sólida y mejores prácticas.",
  },
  {
    icon: Shield,
    title: "Seguridad primero",
    description: "Cumplimiento, auditorías y protocolos enterprise desde el día uno.",
  },
  {
    icon: Globe,
    title: "Pensamiento global",
    description: "Arquitecturas que escalan internacionalmente, pensadas para el mercado global.",
  },
];

const stats = [
  { value: "+50", label: "Proyectos Entregados" },
  { value: "5+", label: "Años de Experiencia" },
  { value: "99.9%", label: "Uptime Promedio" },
  { value: "98%", label: "Satisfacción Cliente" },
];

export function AboutPageClient() {
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
              Sobre VioTech Pro
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transformamos empresas con tecnología premium. Más de 5 años ayudando a PyMEs y empresas en Colombia a escalar sin límites técnicos.
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
                <CardTitle className="text-3xl mb-4">Nuestra Misión</CardTitle>
                <CardDescription className="text-lg">
                  Acelerar el crecimiento de empresas colombianas eliminando barreras técnicas. 
                  Ofrecemos consultoría estratégica, desarrollo de software premium e infraestructura 
                  cloud que permite a nuestros clientes competir a nivel global.
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
                Nuestros Valores
              </h2>
              <p className="text-muted-foreground">
                Principios que guían cada proyecto
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
                Nuestro Equipo
              </h2>
              <p className="text-muted-foreground">
                Expertos en tecnología, diseño y estrategia
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Equipo Multidisciplinario</h3>
                    <p className="text-muted-foreground">
                      UX Designers, Tech Leads, QA Engineers, SREs y Product Managers trabajando juntos
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Contamos con un equipo híbrido distribuido entre Colombia y LATAM, 
                  especializado en diferentes áreas pero unidos por un objetivo común: 
                  entregar soluciones tecnológicas de clase mundial.
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
                ¿Quieres trabajar con nosotros?
              </CardTitle>
              <CardDescription className="text-primary-foreground/90 text-lg">
                Agenda una consultoría gratuita y descubre cómo podemos ayudarte
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

