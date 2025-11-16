import { ArrowUpRight, Linkedin, Mail, MapPin } from "lucide-react";

const footerLinks = [
  {
    title: "Servicios",
    items: [
      { label: "Consultoría TI", href: "#services" },
      { label: "Desarrollo a medida", href: "#services" },
      { label: "Diseño premium", href: "#services" },
    ],
  },
  {
    title: "Recursos",
    items: [
      { label: "Casos de éxito", href: "#cases" },
      { label: "Metodología", href: "#process" },
      { label: "Stack tecnológico", href: "#tech" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <p className="text-foreground text-lg font-medium tracking-tight">
              VioTech Solutions
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Consultoría, diseño y desarrollo especializado para empresas que
              necesitan tecnología crítica sin sacrificar velocidad ni calidad.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Bogotá · Colombia
              </span>
              <a
                href="mailto:contacto@viotech.com.co"
                className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                contacto@viotech.com.co
              </a>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                {section.title}
              </p>
              <ul className="space-y-3 text-sm">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      {item.label}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/viotech"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
            <a
              href="https://calendly.com/viotech/demo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
            >
              Agenda una demo
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <p>
            © {new Date().getFullYear()} VioTech Solutions. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
