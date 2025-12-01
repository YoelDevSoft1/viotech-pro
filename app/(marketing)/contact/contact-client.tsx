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
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

type ContactFormValues = {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  message: string;
};

export function ContactPageClient() {
  const t = useTranslationsSafe("marketing.contact");

  // Schema de validación con Zod usando traducciones
  const contactFormSchema = z.object({
    name: z.string().min(2, t("validation.nameMin")),
    email: z.string().email(t("validation.emailInvalid")),
    company: z.string().optional(),
    projectType: z.string().min(1, t("validation.projectTypeRequired")),
    message: z.string().min(10, t("validation.messageMin")),
  });

  const contactMethods = [
    {
      icon: MessageSquare,
      title: t("methods.whatsapp.title"),
      description: t("methods.whatsapp.description"),
      action: t("methods.whatsapp.action"),
      href: "https://wa.link/1r4ul7",
      primary: true,
    },
    {
      icon: Mail,
      title: t("methods.email.title"),
      description: t("methods.email.description"),
      action: t("methods.email.action"),
      href: "mailto:contacto@viotech.com.co",
      primary: false,
    },
  ];

  const info = [
    {
      icon: MapPin,
      label: t("info.location"),
      value: t("info.locationValue"),
    },
    {
      icon: Clock,
      label: t("info.schedule"),
      value: t("info.scheduleValue"),
    },
  ];

  const projectTypes = [
    t("projectTypes.software"),
    t("projectTypes.consulting"),
    t("projectTypes.webDesign"),
    t("projectTypes.cloud"),
    t("projectTypes.digital"),
    t("projectTypes.other"),
  ];

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
      
      toast.success(t("form.success"), {
        description: t("form.successDescription"),
      });
      
      form.reset();
    } catch (error) {
      toast.error(t("form.error"), {
        description: t("form.errorDescription"),
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
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("description")}
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
              <CardTitle>{t("form.title")}</CardTitle>
              <CardDescription>
                {t("form.description")}
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
                          <FormLabel>{t("form.name")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.namePlaceholder")} {...field} />
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
                          <FormLabel>{t("form.email")}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t("form.emailPlaceholder")} {...field} />
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
                          <FormLabel>{t("form.company")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("form.companyPlaceholder")} {...field} />
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
                          <FormLabel>{t("form.projectType")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("form.projectTypePlaceholder")} />
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
                        <FormLabel>{t("form.message")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("form.messagePlaceholder")}
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
                        {t("form.submitting")}
                      </>
                    ) : (
                      <>
                        {t("form.submit")}
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
              <CardTitle>{t("availability.title")}</CardTitle>
              <CardDescription>
                {t("availability.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-3xl font-medium text-foreground">4</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t("availability.discoveryCalls")}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-3xl font-medium text-foreground">2</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {t("availability.strategyWorkshops")}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t("availability.calendarNote1")}</p>
                <p>{t("availability.calendarNote2")}</p>
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
                  {t("availability.scheduleDemo")}
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
              <span>{t("trust.freeConsultation")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>{t("trust.noCommitment")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>{t("trust.fastResponse")}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

