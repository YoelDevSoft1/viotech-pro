"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

const technologies = [
  {
    category: "Frontend",
    tools: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Vue.js",
      "Astro",
    ],
  },
  {
    category: "Backend",
    tools: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Redis", "GraphQL"],
  },
  {
    category: "Cloud & DevOps",
    tools: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Terraform"],
  },
  {
    category: "Mobile",
    tools: [
      "React Native",
      "Flutter",
      "iOS",
      "Android",
      "Progressive Web Apps",
    ],
  },
];

const industries = [
  {
    name: "Salud",
    description: "Escalabilidad y cumplimiento HIPAA/FHIR.",
    stack: ["Next.js", "Node.js", "FHIR APIs", "PostgreSQL", "AWS", "Datadog"],
  },
  {
    name: "Fintech",
    description: "Arquitecturas seguras con KYC/KYB y pagos locales.",
    stack: [
      "React",
      "Go",
      "GraphQL",
      "Kafka",
      "AWS Organizations",
      "Plaid/Stripe",
    ],
  },
  {
    name: "Retail & eCommerce",
    description: "Headless commerce y experiencias omnicanal.",
    stack: ["Next.js", "Medusa", "Shopify API", "Redis", "Vercel", "Segment"],
  },
];

const badges = [
  "AWS Advanced Partner",
  "Azure Cloud Expert",
  "ISO 27001 Ready",
  "Product-Led Alliance Member",
];

export default function TechStack() {
  const [activeIndustry, setActiveIndustry] = useState(industries[0]);

  return (
    <section className="py-32 px-6 bg-muted/30" id="tech">
      <div className="max-w-[90vw] mx-auto space-y-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-2 leading-[1.1]">
            Tecnología de vanguardia
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stack curado para empresas que requieren disponibilidad, seguridad y
            velocidad de iteración.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2"
              >
                <Award className="w-3 h-3" />
                {badge}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-12">
          {/* Tech Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-6 rounded-3xl border border-border/70 bg-background/80 p-6"
              >
                {/* Category Title */}
                <div className="pb-4 border-b border-border">
                  <h3 className="text-sm font-medium uppercase tracking-widest text-foreground">
                    {tech.category}
                  </h3>
                </div>

                {/* Tools List */}
                <ul className="space-y-3">
                  {tech.tools.map((tool) => (
                    <li
                      key={tool}
                      className="flex items-center gap-3 group cursor-default"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-foreground/20 group-hover:bg-foreground transition-colors" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                        {tool}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Industry toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
                Stack por industria
              </p>
              <div className="flex flex-wrap gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry.name}
                    onClick={() => setActiveIndustry(industry)}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      activeIndustry.name === industry.name
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    type="button"
                  >
                    {industry.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-medium text-foreground">
                {activeIndustry.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeIndustry.stack.map((tool) => (
                  <span
                    key={tool}
                    className="px-3 py-1 text-xs uppercase tracking-widest rounded-full bg-muted text-foreground"
                  >
                    {tool}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Seleccionamos partners y frameworks según tu madurez, volumen de
                usuarios y auditorías requeridas.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
