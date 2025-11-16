"use client";

import { ArrowRight, MapPin, PlayCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const industries = ["Salud", "Fintech", "Retail", "Logística inteligente"];

const heroStats = [
  { label: "Time-to-market promedio", value: "3.5 semanas" },
  { label: "Arquitecturas auditadas", value: "15 industrias" },
  { label: "Disponibilidad SLA", value: "99.95%" },
];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-16 overflow-hidden"
      id="hero"
    >
      {/* Animated code background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <div className="relative max-w-6xl mx-auto text-center space-y-8">
        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground"
        >
          <MapPin className="w-3 h-3" />
          Bogotá, Colombia
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground leading-[1.1]"
        >
          Consultoría TI
          <span className="block mt-2">
            y desarrollo{" "}
            <span className="italic font-light">de software</span>
          </span>
        </motion.h1>

        {/* Sector focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground"
        >
          {industries.map((industry) => (
            <span
              key={industry}
              className="px-3 py-1 rounded-full border border-border"
            >
              {industry}
            </span>
          ))}
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
        >
          Transformamos empresas con consultoría estratégica, plataformas cloud
          y experiencias digitales enfocadas en revenue. Nos integrarnos a tus
          squads como partner de producto para lanzar soluciones críticas sin
          fricción.
        </motion.p>

        {/* Trust indicators inline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground pt-2"
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground"></div>
            <span>+5 años de experiencia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground"></div>
            <span>50+ proyectos entregados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground"></div>
            <span>98% satisfacción</span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
        >
          <a
            href="https://calendly.com/viotech/demo"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background text-sm font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-foreground/10"
            target="_blank"
            rel="noreferrer"
          >
            Agendar demo estratégica
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#services"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border text-sm font-medium transition-all hover:bg-muted"
          >
            Conocer servicios
          </a>

          <a
            href="https://wa.link/1r4ul7"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-medium transition-all hover:bg-muted border border-border"
            target="_blank"
            rel="noreferrer"
          >
            Hablar con un consultor
          </a>
        </motion.div>

        {/* Experience preview + metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr,0.7fr] gap-8 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="rounded-3xl border border-border/70 bg-gradient-to-br from-muted/60 via-background to-background p-1"
          >
            <div className="rounded-3xl bg-background p-8 text-left space-y-6">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <PlayCircle className="w-4 h-4" />
                Blueprint digital
              </div>
              <p className="text-2xl sm:text-3xl font-medium text-foreground leading-tight">
                Arquitecturas personalizadas, roadmaps claros y governance
                continuo para cada release.
              </p>
              <div className="grid sm:grid-cols-2 gap-6">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-medium text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  Workshops <span className="text-foreground">Discovery</span> ·
                  Arquitectura cloud · SecOps · QA continuo · Acompañamiento
                  post-lanzamiento.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-3xl border border-border/60 bg-muted/40 p-8 space-y-6"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Protocolos Enterprise
            </div>
            <ul className="space-y-4 text-sm text-foreground">
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground mt-2" />
                <span>Pentesting trimestral y cumplimiento HIPAA / ISO 27001</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground mt-2" />
                <span>Tableros ejecutivos con métricas en tiempo real</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground mt-2" />
                <span>Equipos híbridos en Colombia y LATAM</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Client logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-20 border-t border-border"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <p className="font-medium">
                Empresas que confían en VioTech Solutions
              </p>
              <p className="text-muted-foreground/80">
                Salud · Logística · Retail · Educación
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-muted-foreground">
              <span className="text-base font-medium hover:text-foreground transition-colors cursor-default">
                SMD Vital Bogotá
              </span>
              <span className="text-base font-medium hover:text-foreground transition-colors cursor-default">
                MedicExpress
              </span>
              <span className="text-base font-medium hover:text-foreground transition-colors cursor-default">
                ServiMedic 24/7
              </span>
              <span className="text-base font-medium hover:text-foreground transition-colors cursor-default">
                Tech Shop Bogotá
              </span>
              <span className="text-base font-medium hover:text-foreground transition-colors cursor-default">
                FinanciaYa
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
