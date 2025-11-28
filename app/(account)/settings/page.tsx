"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings, Lock, Bell, Shield, Save, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { useMFAStatus, useMFADisable } from "@/lib/hooks/useMFA";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MFASetupModal from "@/components/MFASetupModal";
import { ActiveSessionsList } from "@/components/sessions/ActiveSessionsList";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: mfaStatus, isLoading: mfaLoading } = useMFAStatus();
  const disableMFA = useMFADisable();
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [mfaSetupModalOpen, setMfaSetupModalOpen] = useState(false);
  const [disableMfaDialogOpen, setDisableMfaDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsSavingPassword(true);
    setPasswordSuccess(false);
    try {
      await apiClient.put("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success("Contraseña actualizada correctamente");
      setPasswordSuccess(true);
      passwordForm.reset();
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la contraseña");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await apiClient.put("/auth/notifications", {
        email: emailNotifications,
        push: pushNotifications,
        ticketUpdates,
        projectUpdates,
      });
      toast.success("Preferencias de notificaciones guardadas");
    } catch (error: any) {
      toast.error(error.message || "Error al guardar las preferencias");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!disablePassword) {
      toast.error("Por favor ingresa tu contraseña");
      return;
    }
    try {
      await disableMFA.mutateAsync(disablePassword);
      setDisableMfaDialogOpen(false);
      setDisablePassword("");
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración de tu cuenta, seguridad y preferencias.
          </p>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferencias
          </TabsTrigger>
        </TabsList>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura. Usa una contraseña fuerte y única.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Tu contraseña se ha actualizado correctamente.
                  </AlertDescription>
                </Alert>
              )}

              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña Actual</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Mínimo 8 caracteres. Recomendamos usar una combinación de letras, números y símbolos.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSavingPassword}>
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Actualizar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad Adicional
              </CardTitle>
              <CardDescription>
                Configuraciones adicionales para proteger tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Autenticación de dos factores (2FA)</p>
                    {mfaStatus?.enabled && (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mfaStatus?.enabled
                      ? "MFA está habilitado en tu cuenta"
                      : "Agrega una capa adicional de seguridad a tu cuenta"}
                  </p>
                  {mfaStatus?.lastVerifiedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <KeyRound className="h-3 w-3" />
                      <span>
                        Última verificación: {new Date(mfaStatus.lastVerifiedAt).toLocaleString("es-CO")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {mfaStatus?.enabled ? (
                    <AlertDialog open={disableMfaDialogOpen} onOpenChange={setDisableMfaDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Deshabilitar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deshabilitar MFA</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ingresa tu contraseña para confirmar que deseas deshabilitar la autenticación de dos factores.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Contraseña</label>
                            <Input
                              type="password"
                              value={disablePassword}
                              onChange={(e) => setDisablePassword(e.target.value)}
                              placeholder="Ingresa tu contraseña"
                              disabled={disableMFA.isPending}
                              autoFocus
                            />
                          </div>
                          {disableMFA.error && (
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {(disableMFA.error as any)?.message || "Error al deshabilitar MFA"}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDisablePassword("")}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDisableMFA}
                            disabled={!disablePassword || disableMFA.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {disableMFA.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deshabilitando...
                              </>
                            ) : (
                              "Deshabilitar MFA"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setMfaSetupModalOpen(true)}
                      disabled={mfaLoading}
                    >
                      Configurar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <ActiveSessionsList />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>
                Elige cómo y cuándo quieres recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Notificaciones por correo</p>
                    <p className="text-xs text-muted-foreground">
                      Recibe notificaciones importantes por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Notificaciones push</p>
                    <p className="text-xs text-muted-foreground">
                      Recibe notificaciones en tiempo real en tu navegador
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Actualizaciones de tickets</p>
                    <p className="text-xs text-muted-foreground">
                      Notificaciones cuando hay cambios en tus tickets
                    </p>
                  </div>
                  <Switch
                    checked={ticketUpdates}
                    onCheckedChange={setTicketUpdates}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Actualizaciones de proyectos</p>
                    <p className="text-xs text-muted-foreground">
                      Notificaciones sobre cambios en tus proyectos
                    </p>
                  </div>
                  <Switch
                    checked={projectUpdates}
                    onCheckedChange={setProjectUpdates}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                  {isSavingNotifications ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Preferencias
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferencias Generales
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Idioma</p>
                  <p className="text-xs text-muted-foreground">
                    Selecciona tu idioma preferido
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Español (Próximamente)
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Zona horaria</p>
                  <p className="text-xs text-muted-foreground">
                    Configura tu zona horaria para fechas y horas
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Automática (Próximamente)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MFA Setup Modal */}
      <MFASetupModal
        isOpen={mfaSetupModalOpen}
        onClose={() => setMfaSetupModalOpen(false)}
        onSuccess={() => {
          setMfaSetupModalOpen(false);
        }}
      />
    </div>
  );
}

