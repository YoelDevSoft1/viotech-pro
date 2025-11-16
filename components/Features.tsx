"use client";

import { motion } from "framer-motion";
import { Zap, BarChart3, Lock, Headphones } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Ultra Rápido",
    description:
      "Carga en menos de 1 segundo. Optimizado para Core Web Vitals y SEO.",
  },
  {
    icon: BarChart3,
    title: "Analíticas",
    description:
      "Seguimiento en tiempo real de conversiones, visitantes y rendimiento.",
  },
  {
    icon: Lock,
    title: "Seguro",
    description:
      "Protección de datos, HTTPS, cumplimiento normativo y backups diarios.",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description:
      "Atención inmediata vía WhatsApp. Actualizaciones y mantenimiento incluido.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Soluciones completas para PyMEs que buscan crecer online
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-lg border border-border hover:bg-muted/50 transition-all"
            >
              <feature.icon className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <a
            href="https://wa.link/1r4ul7"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium transition-all hover:scale-105 active:scale-95"
          >
            Hablar con el equipo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
