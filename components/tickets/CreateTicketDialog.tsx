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
import { toast } from "sonner"; // O tu sistema de Toast

// Esquema de validación
const ticketSchema = z.object({
  titulo: z.string().min(3, "El título es obligatorio"),
  descripcion: z.string().optional(),
  prioridad: z.string(),
  impacto: z.string(),
  urgencia: z.string(),
  categoria: z.string(),
  tipo: z.string(),
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
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
  
  // Hooks de datos
  const { data: orgs } = useOrganizations();
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

      toast.success("Ticket creado correctamente");
      form.reset();
      setFiles([]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al crear ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Ticket</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="titulo" render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl><Input placeholder="Ej: Error en facturación" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="tipo" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="requerimiento">Requerimiento</SelectItem>
                                <SelectItem value="incidente">Incidente</SelectItem>
                                <SelectItem value="consulta">Consulta</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="prioridad" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="baja">Baja</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                {/* Repite lógica similar para Impacto y Urgencia si es necesario */}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="organizationId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Organización</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
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
                        <FormLabel>Proyecto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedOrg}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
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
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea rows={4} {...field} /></FormControl>
                </FormItem>
            )} />

            <div className="space-y-2">
                <FormLabel>Adjuntos</FormLabel>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                    <Input 
                        type="file" 
                        multiple 
                        className="border-0 bg-transparent h-auto text-sm p-0 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                    />
                </div>
                {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} archivo(s) seleccionado(s)</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Ticket
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}