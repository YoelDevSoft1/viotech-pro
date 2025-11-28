import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* CORRECCIÓN: 'mx-auto' para centrar el contenido */}
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1 text-sm rounded-full">
            🚀 Nueva versión 2.0 disponible
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            Digitaliza tu PyME <br className="hidden md:block" />
            con tecnología premium.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-[800px] text-balance">
            Desarrollo web de alto impacto, infraestructura cloud segura y consultoría estratégica. 
            Ayudamos a empresas colombianas a escalar sin límites técnicos.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/services/catalog">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-base h-12 rounded-full px-8">
                Ver Planes <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 rounded-full px-8">
                Agendar Consultoría
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Elementos decorativos de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[100px] rounded-full -z-10" />
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Todo lo que necesitas para crecer</h2>
            <p className="text-muted-foreground mt-2">Tecnología enterprise adaptada a tu escala.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Ultra Rápido",
                desc: "Sitios optimizados para Core Web Vitals. Carga en milisegundos, no segundos."
              },
              {
                icon: Shield,
                title: "Seguridad Bancaria",
                desc: "Protección DDoS, certificados SSL y encriptación de datos end-to-end."
              },
              {
                icon: BarChart3,
                title: "Analytics Integrado",
                desc: "Paneles de control en tiempo real para tomar decisiones basadas en datos."
              },
              {
                icon: Globe,
                title: "Dominio Global",
                desc: "Infraestructura desplegada en el borde (Edge) para acceso mundial instantáneo."
              },
              {
                icon: CheckCircle2,
                title: "Soporte 24/7",
                desc: "Equipo de ingeniería dedicado. Resolvemos incidencias antes de que las notes."
              },
              {
                icon: ArrowRight,
                title: "Escalabilidad",
                desc: "Arquitectura serverless que crece automáticamente con tu tráfico."
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-background border-border/50 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "+50", label: "Proyectos Entregados" },
              { value: "99.9%", label: "Uptime Garantizado" },
              { value: "24h", label: "Tiempo de Soporte" },
              { value: "+10k", label: "Usuarios Impactados" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-4xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none">
            {/* CORRECCIÓN DARK MODE: Usar primary-foreground/10 en lugar de white/10 */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/10 to-transparent pointer-events-none" />
            
            <div className="p-8 md:p-16 text-center relative z-10 flex flex-col items-center">
              {/* CORRECCIÓN DARK MODE: Quitamos 'text-white' para heredar 'text-primary-foreground' */}
              <h2 className="text-3xl font-bold mb-4 text-primary-foreground">¿Listo para transformar tu negocio?</h2>
              <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8 text-lg">
                Agenda una consultoría gratuita de 30 minutos y descubre cómo podemos acelerar tu crecimiento digital hoy mismo.
              </p>
              <div className="flex justify-center gap-4 w-full sm:w-auto">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="font-semibold w-full sm:w-auto">
                    Comenzar Ahora
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}