"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff, Lock, Mail, User, Quote } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Componentes UI (Shadcn)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Hooks de lógica
import { useLogin, useRegister } from "@/lib/hooks/useAuth";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

// --- Esquemas de Validación (Zod) ---
// Los mensajes de validación se mantienen en español por ahora
// Se pueden migrar después si es necesario
const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
  remember: z.boolean().default(false),
});

const registerSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

function LoginPageContent() {
  const [showPass, setShowPass] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || undefined;
  const tAuth = useTranslationsSafe("auth");
  
  // React Query Hooks
  const { mutate: login, isPending: isLoggingIn } = useLogin(redirectTo);
  const { mutate: register, isPending: isRegistering } = useRegister();

  // Formulario de Login
  const loginForm = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // Formulario de Registro
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: "", email: "", password: "", confirmPassword: "" },
  });

  // Submit Handlers
  const onLogin = (values: z.input<typeof loginSchema>) => {
    // Ensure remember is always a boolean
    const processedValues = {
      ...values,
      remember: values.remember ?? false,
    };
    login(processedValues);
  };

  const onRegister = (values: z.infer<typeof registerSchema>) => {
    register(values, {
      onSuccess: () => {
        setIsRegisterOpen(false);
        registerForm.reset();
        loginForm.setValue("email", values.email);
      }
    });
  };

  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Columna Izquierda - Testimonial/Branding */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20 text-primary mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>
            <span className="ml-2">VioTech Solutions</span>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <Quote className="h-8 w-8 text-primary/60" />
              <p className="text-lg text-foreground/90">
                "Esta plataforma ha transformado la forma en que gestionamos nuestros servicios.
                La interfaz es intuitiva y el soporte excepcional."
              </p>
              <footer className="text-sm text-muted-foreground">
                <div className="font-semibold text-foreground">Sofia Davis</div>
                <div>CEO, Acme Inc</div>
              </footer>
            </blockquote>
          </div>
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                {tAuth("createAccount")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {tAuth("createAccountDescription")}
              </p>
            </div>

            {/* Formulario de Login */}
            <Card className="border-border/60 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">{tAuth("signIn")}</CardTitle>
                <CardDescription>
                  {tAuth("signInDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{tAuth("email")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder={tAuth("emailPlaceholder")} 
                                className="pl-9" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>{tAuth("password")}</FormLabel>
                            <Link 
                              href="/forgot-password" 
                              className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                            >
                              {tAuth("forgotPassword")}
                            </Link>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type={showPass ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pl-9 pr-9" 
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                              >
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="remember"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                              {tAuth("rememberMe")}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoggingIn}>
                      {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoggingIn ? tAuth("validating") : tAuth("signIn")}
                    </Button>
                  </form>
                </Form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {tAuth("orContinueWith")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setIsRegisterOpen(true)}
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {tAuth("createNewAccount")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="px-8 text-center text-sm text-muted-foreground">
              {tAuth("termsAndPrivacyStart")}{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                {tAuth("termsOfService")}
              </Link>{" "}
              {tAuth("termsAndPrivacyAnd")}{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                {tAuth("privacyPolicy")}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Versión Móvil - Sin dos columnas */}
      <div className="container relative flex h-screen flex-col items-center justify-center md:hidden">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Crear una cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu correo electrónico para crear tu cuenta
            </p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="nombre@empresa.com" 
                              className="pl-9" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Contraseña</FormLabel>
                          <Link 
                            href="/forgot-password" 
                            className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              type={showPass ? "text" : "password"} 
                              placeholder="••••••••" 
                              className="pl-9 pr-9" 
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="remember"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                            Recordar mi sesión
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoggingIn ? "Validando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </Form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                Crear cuenta nueva
              </Button>
            </CardContent>
          </Card>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Modal de Registro */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{tAuth("createAccount")}</DialogTitle>
            <DialogDescription>
              {tAuth("createAccountDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4 mt-2">
              <FormField
                control={registerForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth("fullName")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={tAuth("fullNamePlaceholder")} className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth("email")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={tAuth("emailPlaceholder")} className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tAuth("password")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={tAuth("passwordPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tAuth("confirmPassword")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={tAuth("confirmPasswordPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsRegisterOpen(false)}>
                  {tAuth("cancel")}
                </Button>
                <Button type="submit" disabled={isRegistering}>
                  {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isRegistering ? tAuth("creating") : tAuth("register")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
