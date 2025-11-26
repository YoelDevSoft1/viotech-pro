"use client";

import { motion } from "framer-motion";
import { MessageSquare, FileSearch, Rocket, LineChart, Clock3, ShieldCheck, Smartphone } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Consultoría inicial",
    description:
      "Sesión gratuita de 45 minutos para entender tus objetivos, desafíos y requisitos. Análisis profundo de tu negocio y oportunidades.",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Auditoría y propuesta",
    description:
      "Evaluación técnica completa de sistemas actuales. Propuesta detallada con arquitectura, tecnologías, timeline y presupuesto transparente.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Desarrollo ágil",
    description:
      "Sprints de 2 semanas con entregas continuas. Comunicación constante, demos semanales y ajustes en tiempo real según feedback.",
  },
  {
    number: "04",
    icon: LineChart,
    title: "Lanzamiento y soporte",
    description:
      "Deploy optimizado, capacitación del equipo y documentación completa. Monitoreo 24/7 y soporte técnico continuo incluido.",
  },
];

const rituals = [
  {
    icon: Clock3,
    title: "Daily syncs",
    description: "Seguimiento diario con PM dedicado y tablero Kanban compartido.",
  },
  {
    icon: ShieldCheck,
    title: "QA continuo",
    description: "Pipelines automatizados, pruebas exploratorias y monitoreo 24/7.",
  },
  {
    icon: Smartphone,
    title: "Canais abiertos",
    description: "Slack, WhatsApp y portal ejecutivo con reporting semanal.",
  },
];

export default function Process() {
  return (
    <section className="py-32 px-6" id="process">
      <div className="max-w-[90vw] mx-auto">
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
              Nuestra metodología
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            Proceso transparente
            <span className="block">
              y orientado a{" "}
              <span className="italic font-light">resultados</span>
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            De la idea al producto en 4 fases estructuradas con comunicación
            constante
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-8 lg:p-10 rounded-lg border border-border hover:bg-muted/30 transition-all">
                {/* Left: Number & Icon */}
                <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start gap-4">
                  <div className="text-6xl font-light text-foreground/10 group-hover:text-foreground/20 transition-colors">
                    {step.number}
                  </div>
                  <div className="p-3 rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                    <step.icon className="w-6 h-6 text-foreground" />
                  </div>
                </div>

                {/* Right: Content */}
                <div className="lg:col-span-10 space-y-3">
                  <h3 className="text-2xl font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-3xl">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="ml-8 lg:ml-[4.5rem] h-8 w-px bg-border" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-lg bg-muted/30 border border-border"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-medium text-foreground mb-2">
                2-4 semanas
              </div>
              <div className="text-sm text-muted-foreground">
                Tiempo promedio MVP
              </div>
            </div>
            <div>
              <div className="text-3xl font-medium text-foreground mb-2">
                100% transparente
              </div>
              <div className="text-sm text-muted-foreground">
                Sin costos ocultos
              </div>
            </div>
            <div>
              <div className="text-3xl font-medium text-foreground mb-2">
                Comunicación diaria
              </div>
              <div className="text-sm text-muted-foreground">
                Vía WhatsApp/Slack
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {rituals.map((ritual) => (
            <div
              key={ritual.title}
              className="p-6 rounded-2xl border border-border/70 bg-background/70 space-y-3"
            >
              <div className="inline-flex p-3 rounded-full bg-foreground/5">
                <ritual.icon className="w-5 h-5 text-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">
                {ritual.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {ritual.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
