"use client";

import { useState } from "react";
import { Award, Plus, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResource, useAddResourceSkill, useAddResourceCertification } from "@/lib/hooks/useResources";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { ResourceSkill, ResourceCertification } from "@/lib/types/resources";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface ResourceSkillsProps {
  resourceId: string;
}

const skillSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  yearsOfExperience: z.number().optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  issuer: z.string().min(1, "El emisor es requerido"),
  issueDate: z.string().min(1, "La fecha de emisión es requerida"),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal("")),
});

type SkillFormValues = z.infer<typeof skillSchema>;
type CertificationFormValues = z.infer<typeof certificationSchema>;

export function ResourceSkills({ resourceId }: ResourceSkillsProps) {
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);

  const { data: resource, isLoading } = useResource(resourceId);
  const addSkill = useAddResourceSkill();
  const addCertification = useAddResourceCertification();

  const skillForm = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      level: "intermediate",
      yearsOfExperience: undefined,
    },
  });

  const certForm = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    },
  });

  const onSkillSubmit = async (values: SkillFormValues) => {
    try {
      await addSkill.mutateAsync({
        resourceId,
        skill: values,
      });
      setSkillDialogOpen(false);
      skillForm.reset();
    } catch (error) {
      console.error("Error al agregar skill:", error);
    }
  };

  const onCertSubmit = async (values: CertificationFormValues) => {
    try {
      await addCertification.mutateAsync({
        resourceId,
        certification: {
          ...values,
          issueDate: values.issueDate,
          expiryDate: values.expiryDate || undefined,
          credentialUrl: values.credentialUrl || undefined,
        },
      });
      setCertDialogOpen(false);
      certForm.reset();
    } catch (error) {
      console.error("Error al agregar certificación:", error);
    }
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-green-500",
    intermediate: "bg-blue-500",
    advanced: "bg-purple-500",
    expert: "bg-red-500",
  };

  const levelLabels: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    expert: "Experto",
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills y Certificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-20 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Skills</CardTitle>
            <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Skill</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva skill al recurso
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill-name">Nombre</Label>
                    <Input
                      id="skill-name"
                      {...skillForm.register("name")}
                      placeholder="Ej: React, Node.js, AWS"
                    />
                    {skillForm.formState.errors.name && (
                      <p className="text-xs text-red-600">
                        {skillForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skill-category">Categoría</Label>
                    <Input
                      id="skill-category"
                      {...skillForm.register("category")}
                      placeholder="Ej: Programming, Design, Management"
                    />
                    {skillForm.formState.errors.category && (
                      <p className="text-xs text-red-600">
                        {skillForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skill-level">Nivel</Label>
                    <Select
                      value={skillForm.watch("level")}
                      onValueChange={(value) =>
                        skillForm.setValue("level", value as SkillFormValues["level"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                        <SelectItem value="expert">Experto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skill-years">Años de Experiencia (opcional)</Label>
                    <Input
                      id="skill-years"
                      type="number"
                      {...skillForm.register("yearsOfExperience", { valueAsNumber: true })}
                      placeholder="Ej: 3"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSkillDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addSkill.isPending}>
                      Agregar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {resource?.skills && resource.skills.length > 0 ? (
            <div className="space-y-2">
              {resource.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      <Badge
                        className={cn(
                          "text-xs",
                          levelColors[skill.level] || "bg-gray-500"
                        )}
                      >
                        {levelLabels[skill.level] || skill.level}
                      </Badge>
                      {skill.verified && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {skill.category}
                      {skill.yearsOfExperience &&
                        ` · ${skill.yearsOfExperience} año${skill.yearsOfExperience !== 1 ? "s" : ""} de experiencia`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No hay skills registradas
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificaciones
            </CardTitle>
            <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Certificación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Certificación</DialogTitle>
                  <DialogDescription>
                    Agrega una nueva certificación al recurso
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={certForm.handleSubmit(onCertSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cert-name">Nombre</Label>
                    <Input
                      id="cert-name"
                      {...certForm.register("name")}
                      placeholder="Ej: AWS Certified Solutions Architect"
                    />
                    {certForm.formState.errors.name && (
                      <p className="text-xs text-red-600">
                        {certForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cert-issuer">Emisor</Label>
                    <Input
                      id="cert-issuer"
                      {...certForm.register("issuer")}
                      placeholder="Ej: AWS, Google, Microsoft"
                    />
                    {certForm.formState.errors.issuer && (
                      <p className="text-xs text-red-600">
                        {certForm.formState.errors.issuer.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cert-issue-date">Fecha de Emisión</Label>
                      <Input
                        id="cert-issue-date"
                        type="date"
                        {...certForm.register("issueDate")}
                      />
                      {certForm.formState.errors.issueDate && (
                        <p className="text-xs text-red-600">
                          {certForm.formState.errors.issueDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cert-expiry-date">Fecha de Vencimiento (opcional)</Label>
                      <Input
                        id="cert-expiry-date"
                        type="date"
                        {...certForm.register("expiryDate")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cert-credential-id">ID de Credencial (opcional)</Label>
                    <Input
                      id="cert-credential-id"
                      {...certForm.register("credentialId")}
                      placeholder="Ej: ABC123XYZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cert-url">URL de Credencial (opcional)</Label>
                    <Input
                      id="cert-url"
                      type="url"
                      {...certForm.register("credentialUrl")}
                      placeholder="https://..."
                    />
                    {certForm.formState.errors.credentialUrl && (
                      <p className="text-xs text-red-600">
                        {certForm.formState.errors.credentialUrl.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCertDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={addCertification.isPending}>
                      Agregar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {resource?.certifications && resource.certifications.length > 0 ? (
            <div className="space-y-2">
              {resource.certifications.map((cert) => {
                const isExpired =
                  cert.expiryDate && new Date(cert.expiryDate) < new Date();

                return (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cert.name}</span>
                        {cert.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs">
                            Expirada
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {cert.issuer} · Emitida: {format(new Date(cert.issueDate), "PP", { locale: es })}
                        {cert.expiryDate &&
                          ` · Vence: ${format(new Date(cert.expiryDate), "PP", { locale: es })}`}
                      </div>
                      {cert.credentialId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {cert.credentialId}
                        </div>
                      )}
                    </div>
                    {cert.credentialUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No hay certificaciones registradas
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

