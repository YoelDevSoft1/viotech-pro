"use client";

import { motion } from "framer-motion";
import { Brain, Code2, Palette, ArrowRight, Compass, Layers, Shield } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "Consultoría TI",
    description:
      "Estrategia tecnológica integral. Auditorías de infraestructura, optimización de procesos y transformación digital para empresas que buscan escalar.",
    features: [
      "Arquitectura de sistemas",
      "Migración a la nube",
      "Ciberseguridad empresarial",
      "Automatización de procesos",
    ],
  },
  {
    icon: Code2,
    title: "Desarrollo de Software",
    description:
      "Soluciones a medida con tecnologías modernas. Desde MVPs hasta plataformas empresariales robustas y escalables.",
    features: [
      "Aplicaciones web y móviles",
      "APIs y microservicios",
      "Integraciones personalizadas",
      "Mantenimiento continuo",
    ],
  },
  {
    icon: Palette,
    title: "Diseño Web Premium",
    description:
      "Sitios web de alto impacto que convierten. Diseño minimalista, ultra rápido y optimizado para SEO desde el día uno.",
    features: [
      "Landing pages profesionales",
      "E-commerce a medida",
      "Performance 100/100",
      "Diseño responsive",
    ],
  },
];

const serviceHighlights = [
  {
    title: "Sprint 0 ultra rápido",
    description: "Workshops, arquitectura y budget en 10 días hábiles.",
    icon: Compass,
  },
  {
    title: "Squads a medida",
    description: "UX, Tech Lead, QA y SRE según madurez de tu empresa.",
    icon: Layers,
  },
  {
    title: "Governance & seguridad",
    description: "ISO 27001 ready, pentesting, compliance y monitoreo.",
    icon: Shield,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-32 px-6 bg-muted/30">
      <div className="max-w-[90vw] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            Servicios de clase mundial
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Tres pilares fundamentales para transformar tu empresa digitalmente
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative"
            >
              {/* Card */}
              <div className="h-full p-10 rounded-lg border border-border bg-background hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300">
                {/* Icon */}
                <div className="mb-6">
                  <div className="inline-flex p-3 rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                    <service.icon className="w-7 h-7 text-foreground" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-medium text-foreground mb-4 tracking-tight">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="h-1 w-1 rounded-full bg-foreground flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Link */}
                <a
                  href="https://wa.link/1r4ul7"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground group-hover:gap-3 transition-all"
                >
                  Más información
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-foreground/0 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <p className="text-muted-foreground mb-6">
            ¿No estás seguro qué servicio necesitas?
          </p>
          <a
            href="https://wa.link/1r4ul7"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-foreground/10"
          >
            Agendar consultoría gratuita
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
      <div className="max-w-[90vw] mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceHighlights.map((highlight, index) => (
          <motion.div
            key={highlight.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 rounded-2xl border border-border bg-background/60"
          >
            <div className="inline-flex p-2 rounded-full bg-foreground/5 mb-4">
              <highlight.icon className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">
              {highlight.title}
            </p>
            <p className="text-sm text-muted-foreground">{highlight.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
