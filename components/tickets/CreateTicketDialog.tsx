"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Shadcn Dialog
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Paperclip } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { uploadTicketAttachment } from "@/lib/storage/uploadTicketAttachment";
import { useOrganizations, useProjects } from "@/lib/hooks/useResources";
import { ResourceSelector } from "@/components/resources/ResourceSelector";
import { toast } from "sonner";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

// Esquema de validación - VALIDACIÓN C2.2: Campos con rangos y enums
// Se actualizará dinámicamente con traducciones
const getTicketSchema = (t: (key: string) => string) => z.object({
  // Asunto: longitud mínima 5, máxima 200 chars (VALIDACIÓN C2.2)
  titulo: z
    .string()
    .min(5, t("validation.titleMin") || "El asunto debe tener al menos 5 caracteres")
    .max(200, t("validation.titleMax") || "El asunto no puede exceder 200 caracteres"),
  
  // Descripción: tamaño razonable (opcional pero si existe, máximo 5000 chars)
  descripcion: z
    .string()
    .max(5000, t("validation.descriptionMax") || "La descripción no puede exceder 5000 caracteres")
    .optional(),
  
  // Prioridad: enum según VALIDACIÓN C2.2 (low|medium|high|critical)
  prioridad: z.enum(["baja", "media", "alta", "critica", "low", "medium", "high", "critical"], {
    errorMap: () => ({ message: t("validation.priorityInvalid") || "Prioridad inválida" }),
  }),
  
  // Impacto: enum
  impacto: z.enum(["bajo", "medio", "alto", "critico", "low", "medium", "high", "critical"]).optional(),
  
  // Urgencia: enum
  urgencia: z.enum(["baja", "media", "alta", "critica", "low", "medium", "high", "critical"]).optional(),
  
  // Categoría: solo valores permitidos
  categoria: z.string().min(1, t("validation.categoryRequired") || "Categoría requerida"),
  
  // Tipo: solo valores permitidos
  tipo: z.string().min(1, t("validation.typeRequired") || "Tipo requerido"),
  
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  asignadoA: z.string().optional(),
  slaObjetivo: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTicketDialog({ open, onOpenChange, onSuccess }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tTickets = useTranslationsSafe("tickets");
  const tCommon = useTranslationsSafe("common");
  
  // Hooks de datos
  const { data: orgs } = useOrganizations();
  const ticketSchema = getTicketSchema(tTickets);
  const form = useForm<z.infer<typeof ticketSchema>>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      titulo: "",
      prioridad: "media",
      impacto: "medio",
      urgencia: "media",
      categoria: "general",
      tipo: "requerimiento",
    },
  });

  const selectedOrg = form.watch("organizationId");
  const { data: projects } = useProjects(selectedOrg);

  const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
    setIsSubmitting(true);
    try {
      // 1. Crear el ticket
      const { data } = await apiClient.post("/tickets", {
        ...values,
        // Convertir fecha vacía a undefined
        slaObjetivo: values.slaObjetivo ? new Date(values.slaObjetivo).toISOString() : undefined,
      });

      const ticketId = data?.data?.ticket?.id || data?.id;

      // 2. Subir adjuntos si existen
      if (ticketId && files.length > 0) {
        for (const file of files) {
          // Asumimos que uploadTicketAttachment maneja la lógica de Supabase
          // Necesitamos el token, pero apiClient lo inyecta.
          // Si uploadTicketAttachment requiere el token string explícito, habría que pasarlo
          // O refactorizar uploadTicketAttachment para usar apiClient.
          
          // Opción rápida: Obtener token de localStorage si tu función lo requiere
          const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : "";
          await uploadTicketAttachment(ticketId, file, token || "");
        }
      }

      toast.success(tTickets("success.created"));
      form.reset();
      setFiles([]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      // VALIDACIÓN C2.2: Manejo de errores 400 y 500 con mensajes claros
      const status = error?.response?.status || error?.status;
      let errorMessage = tTickets("error.createFailed");
      
      if (status === 400) {
        // Error de validación del backend
        const backendError = error?.response?.data?.error || error?.response?.data?.message || error?.message;
        if (backendError) {
          errorMessage = backendError.includes("asunto") || backendError.includes("titulo")
            ? "El asunto debe tener entre 5 y 200 caracteres"
            : backendError.includes("prioridad")
            ? "La prioridad seleccionada no es válida"
            : backendError.includes("descripción") || backendError.includes("descripcion")
            ? "La descripción no puede exceder 10,000 caracteres"
            : backendError;
        } else {
          errorMessage = "Faltan campos requeridos o el formato no es válido";
        }
      } else if (status === 500) {
        // Error del servidor - mensaje genérico sin stacktrace
        errorMessage = "Error del servidor. Por favor, intenta de nuevo más tarde.";
        console.error("Error 500 al crear ticket:", error);
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tTickets("newTicket")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="titulo" render={({ field }) => (
              <FormItem>
                <FormLabel>{tTickets("form.title")}</FormLabel>
                <FormControl><Input placeholder={tTickets("form.titlePlaceholder")} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{tTickets("category")}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="tipo" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{tTickets("form.type")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="requerimiento">{tTickets("form.typeOptions.requirement")}</SelectItem>
                                <SelectItem value="incidente">{tTickets("form.typeOptions.incident")}</SelectItem>
                                <SelectItem value="consulta">{tTickets("form.typeOptions.inquiry")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="prioridad" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{tTickets("priorityLabel")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="baja">{tTickets("priority.low")}</SelectItem>
                                <SelectItem value="media">{tTickets("priority.medium")}</SelectItem>
                                <SelectItem value="alta">{tTickets("priority.high")}</SelectItem>
                                <SelectItem value="critica">{tTickets("priority.critical")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                {/* Repite lógica similar para Impacto y Urgencia si es necesario */}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="organizationId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{tTickets("organization")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={tTickets("form.select")} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {orgs?.map((o: any) => (
                                    <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="projectId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{tTickets("form.project")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedOrg}>
                            <FormControl><SelectTrigger><SelectValue placeholder={tTickets("form.select")} /></SelectTrigger></FormControl>
                            <SelectContent>
                                {projects?.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>

            <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem>
                    <FormLabel>{tTickets("form.description")}</FormLabel>
                    <FormControl><Textarea rows={4} {...field} /></FormControl>
                </FormItem>
            )} />

            {/* Asignación de recurso */}
            <FormField control={form.control} name="asignadoA" render={({ field }) => (
                <FormItem>
                    <FormLabel>{tTickets("assignee")}</FormLabel>
                    <FormControl>
                        <ResourceSelector
                            value={field.value}
                            onValueChange={field.onChange}
                            organizationId={selectedOrg}
                            projectId={form.watch("projectId")}
                            showWorkload={true}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <div className="space-y-2">
                <FormLabel>{tTickets("form.attachments")}</FormLabel>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        type="file" 
                        multiple 
                        className="border-0 bg-transparent h-auto text-sm p-0 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                    />
                </div>
                {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} {tTickets("form.filesSelected")}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{tCommon("cancel")}</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {tTickets("create")}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}