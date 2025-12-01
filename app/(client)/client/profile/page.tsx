"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, User, Mail, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const getProfileSchema = (t: (key: string) => string) => z.object({
  nombre: z.string().min(2, t("validation.nameMin")),
  email: z.string().email(t("validation.emailInvalid")),
});

type ProfileFormValues = z.infer<ReturnType<typeof getProfileSchema>>;

export default function ProfilePage() {
  const { data: user, isLoading, refetch } = useCurrentUser();
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const tProfile = useTranslationsSafe("profile");
  const profileSchema = getProfileSchema(tProfile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: user?.nombre || "",
      email: user?.email || "",
    },
    values: {
      nombre: user?.nombre || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    setSuccess(false);
    try {
      await apiClient.put("/auth/me", values);
      toast.success(tProfile("success.updated"));
      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error.message || tProfile("error.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.nombre
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/client/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al dashboard
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias de cuenta.
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Tu perfil se ha actualizado correctamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Foto de Perfil</CardTitle>
            <CardDescription>Tu foto de perfil visible para otros usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUploader
              currentAvatar={user?.avatar}
              userName={user?.nombre || tProfile("user")}
              initials={initials}
              size="md"
            />
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Información Personal</CardTitle>
            <CardDescription>
              Actualiza tu información personal. Estos datos serán visibles en tu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {tProfile("fullName")}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder={tProfile("fullNamePlaceholder")} {...field} />
                      </FormControl>
                      <FormDescription>
                        {tProfile("fullNameDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nombre@empresa.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tu dirección de correo electrónico para notificaciones y acceso.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/client/dashboard">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de Cuenta</CardTitle>
          <CardDescription>Detalles de tu cuenta que no se pueden modificar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                ID de Usuario
              </p>
              <p className="text-sm font-mono text-foreground break-all">{user?.id || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rol
              </p>
              <p className="text-sm font-medium text-foreground capitalize">{user?.rol || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

