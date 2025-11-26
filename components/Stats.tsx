"use client";

import { motion } from "framer-motion";

const kpis = [
  {
    value: "50+",
    label: "Implementaciones enterprise",
    detail: "De salud, fintech y retail en LATAM",
  },
  {
    value: "98%",
    label: "Satisfacción NPS",
    detail: "Quarterly pulse con stakeholders",
  },
  {
    value: "24/7",
    label: "Soporte gestionado",
    detail: "SRE on-call & monitoreo avanzado",
  },
];

const delivery = [
  {
    phase: "Discovery -> MVP",
    timing: "2-4 semanas",
    description: "Workshops, blueprint técnico y primer release productivo.",
  },
  {
    phase: "Escalamiento",
    timing: "+40% velocidad",
    description: "Roadmap trimestral, squads híbridos y automatización QA.",
  },
  {
    phase: "Operación",
    timing: "99.95% SLA",
    description: "Monitoreo activo, playbooks incidentes y FinOps.",
  },
];

export default function Stats() {
  return (
    <section className="py-28 px-6 border-y border-border/70" id="metrics">
      <div className="max-w-[90vw] mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Impacto cuantificable
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Resultados obsesionados con métricas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gobernamos proyectos con KPIs compartidos, cuadros ejecutivos y SLA
            exigentes para cada release.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,0.6fr] gap-10 items-start">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl border border-border/70 p-6 bg-background/60"
              >
                <p className="text-4xl font-medium text-foreground mb-2">
                  {kpi.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {kpi.label}
                </p>
                <p className="text-sm text-muted-foreground">{kpi.detail}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-6"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                Velocity y madurez
              </p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Desde Discovery hasta soporte gestionado
              </p>
            </div>
            <div className="space-y-5">
              {delivery.map((stage) => (
                <div key={stage.phase} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-foreground">{stage.phase}</p>
                    <p className="text-muted-foreground">{stage.timing}</p>
                  </div>
                  <div className="h-1 rounded-full bg-border">
                    <div className="h-full rounded-full bg-foreground/80 w-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stage.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
