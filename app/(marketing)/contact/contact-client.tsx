"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MessageSquare, MapPin, Clock, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema de validación con Zod
const contactFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  projectType: z.string().min(1, "Selecciona un tipo de proyecto"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

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

const projectTypes = [
  "Desarrollo de Software",
  "Consultoría TI",
  "Diseño Web Premium",
  "Infraestructura Cloud",
  "Transformación Digital",
  "Otro",
];

export function ContactPageClient() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      projectType: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // TODO: Integrar con backend cuando esté listo
      // Por ahora simulamos el envío
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("¡Mensaje enviado!", {
        description: "Te contactaremos muy pronto.",
      });
      
      form.reset();
    } catch (error) {
      toast.error("Error al enviar", {
        description: "Por favor intenta nuevamente o contáctanos por WhatsApp.",
      });
    }
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
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6 leading-[1.1]">
            Comencemos tu proyecto
          </h1>
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
              target={method.href.startsWith("http") ? "_blank" : undefined}
              rel={method.href.startsWith("http") ? "noreferrer" : undefined}
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {info.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-4 p-6">
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
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Premium contact form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-10"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cuéntanos sobre tu proyecto</CardTitle>
              <CardDescription>
                Respuesta prioritaria en menos de 1 hora hábil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="juan@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Mi Empresa S.A.S" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de proyecto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {projectTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="¿Qué objetivo buscas? ¿Qué timeline manejas?"
                            className="min-h-[140px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar briefing
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad</CardTitle>
              <CardDescription>
                Slots ejecutivos esta semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <a
                  href="https://calendly.com/viotech/demo"
                  target="_blank"
                  rel="noreferrer"
                >
                  Agendar demo ejecutiva
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
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

