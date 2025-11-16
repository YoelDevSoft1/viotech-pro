"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Zap, Users } from "lucide-react";

const caseStudies = [
  {
    client: "SMD Vital Bogotá",
    industry: "Salud",
    challenge: "Sistema de gestión de pacientes obsoleto y procesos manuales",
    solution:
      "Plataforma web integral con gestión de citas, historias clínicas digitales y dashboard analítico en tiempo real",
    results: [
      { icon: TrendingUp, metric: "40%", label: "Reducción tiempos" },
      { icon: Users, metric: "2.5x", label: "Más pacientes" },
      { icon: Zap, metric: "95%", label: "Satisfacción" },
    ],
  },
  {
    client: "MedicExpress",
    industry: "Logística médica",
    challenge:
      "Falta de visibilidad en entregas y comunicación deficiente con clientes",
    solution:
      "App móvil con tracking en tiempo real, notificaciones automáticas y sistema de gestión de inventario integrado",
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
    solution:
      "Rediseño completo con Next.js, optimización de performance y checkout simplificado con pasarelas locales",
    results: [
      { icon: TrendingUp, metric: "180%", label: "Conversiones" },
      { icon: Users, metric: "4x", label: "Velocidad" },
      { icon: Zap, metric: "85%", label: "Mobile traffic" },
    ],
  },
];

export default function CaseStudies() {
  return (
    <section className="py-32 px-6" id="cases">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px w-12 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Casos de éxito
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            Resultados reales para
            <span className="block">empresas reales</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Transformaciones digitales medibles que impulsan el crecimiento
            empresarial
          </p>
        </motion.div>

        {/* Case Studies */}
        <div className="space-y-12">
          <div className="overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pb-8">
            <div className="flex gap-6">
              {caseStudies.map((study, index) => (
                <motion.div
                  key={study.client}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="snap-center"
                >
                  <div className="w-[320px] sm:w-[420px] lg:w-[640px] h-full p-8 lg:p-10 rounded-3xl border border-border/80 bg-background/70 hover:bg-muted/30 transition-all flex flex-col gap-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        <span className="px-3 py-1 rounded-full border border-border">
                          {study.industry}
                        </span>
                        <span>{study.client}</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {study.challenge}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {study.solution}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {study.results.map((result, i) => (
                        <div
                          key={`${study.client}-${i}`}
                          className="rounded-2xl border border-border/70 p-4 text-center bg-background/80"
                        >
                          <result.icon className="w-5 h-5 text-foreground mx-auto mb-2" />
                          <p className="text-2xl font-medium text-foreground">
                            {result.metric}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            {result.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <a
                      href="https://wa.link/1r4ul7"
                      className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                      Ver caso completo
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Desliza horizontalmente para explorar historias <ArrowRight className="w-4 h-4" />
          </p>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            ¿Listo para resultados similares en tu empresa?
          </p>
          <a
            href="https://wa.link/1r4ul7"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-sm font-medium transition-all hover:bg-muted"
          >
            Hablar con un consultor
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
