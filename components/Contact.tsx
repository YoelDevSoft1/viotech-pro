"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MessageSquare, MapPin, Clock, Send } from "lucide-react";

const contactMethods = [
  {
    icon: MessageSquare,
    title: "WhatsApp",
    description: "Respuesta en menos de 1 hora",
    action: "Enviar mensaje",
    href: "https://wa.link/1r4ul7",
    primary: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: "contacto@viotech.com.co",
    action: "Enviar correo",
    href: "mailto:contacto@viotech.com.co",
    primary: false,
  },
];

const info = [
  {
    icon: MapPin,
    label: "Ubicación",
    value: "Bogotá, Colombia",
  },
  {
    icon: Clock,
    label: "Horario",
    value: "Lun-Vie 8:00-18:00",
  },
];

const initialForm = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("success");
    setTimeout(() => {
      setFormData(initialForm);
      setStatus("idle");
    }, 2000);
  };

  return (
    <section className="py-32 px-6 bg-muted/30" id="contact">
      <div className="max-w-[90vw] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            Comencemos tu proyecto
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Agenda una consultoría gratuita de 45 minutos y descubre cómo
            podemos transformar tu negocio
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group block p-8 rounded-lg border transition-all ${
                method.primary
                  ? "bg-foreground text-background border-foreground hover:scale-[1.02] shadow-lg shadow-foreground/10"
                  : "bg-background border-border hover:bg-muted/50"
              }`}
            >
              <method.icon
                className={`w-8 h-8 mb-4 ${
                  method.primary ? "text-background" : "text-foreground"
                }`}
              />
              <h3
                className={`text-xl font-medium mb-2 ${
                  method.primary ? "text-background" : "text-foreground"
                }`}
              >
                {method.title}
              </h3>
              <p
                className={`mb-6 ${
                  method.primary
                    ? "text-background/70"
                    : "text-muted-foreground"
                }`}
              >
                {method.description}
              </p>
              <span
                className={`inline-flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all ${
                  method.primary ? "text-background" : "text-foreground"
                }`}
              >
                {method.action}
                <ArrowRight className="w-4 h-4" />
              </span>
            </motion.a>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {info.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 p-6 rounded-lg bg-background border border-border"
            >
              <div className="p-3 rounded-lg bg-foreground/5">
                <item.icon className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Premium contact form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-10 mt-16"
        >
          <form
            className="p-8 rounded-2xl border border-border bg-background space-y-6"
            onSubmit={handleSubmit}
          >
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Cuéntanos sobre tu proyecto
              </p>
              <p className="text-sm text-muted-foreground">
                Respuesta prioritaria en menos de 1 hora hábil
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Correo
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Tipo de proyecto
                </label>
                <input
                  type="text"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  placeholder="Ej: Plataforma logística"
                  className="mt-2 w-full rounded-xl border border-border bg-transparent px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Mensaje
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="¿Qué objetivo buscas? ¿Qué timeline manejas?"
                className="mt-2 w-full rounded-2xl border border-border bg-transparent px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 min-h-[140px]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Enviar briefing
              <Send className="w-4 h-4" />
            </button>
            {status === "success" && (
              <p className="text-xs text-green-500">
                ¡Gracias! Te contactaremos muy pronto.
              </p>
            )}
          </form>

          <div className="p-8 rounded-2xl border border-border bg-muted/20 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Disponibilidad
              </p>
              <p className="text-2xl font-medium text-foreground">
                Slots ejecutivos esta semana
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-3xl font-medium text-foreground">4</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Discovery calls
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-3xl font-medium text-foreground">2</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Workshops estrategia
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Calendario con disponibilidad extendida para equipos globales.</p>
              <p>Firmamos NDA antes de cada sesión si es necesario.</p>
            </div>
            <a
              href="https://calendly.com/viotech/demo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-background transition"
            >
              Agendar demo ejecutiva
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Trust Signal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-12 border-t border-border"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Consultoría 100% gratuita</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Sin compromiso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Respuesta en menos de 1 hora</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
