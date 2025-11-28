"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForgotPassword } from "@/lib/hooks/useAuth";

const forgotSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

export default function ForgotPasswordPage() {
  const { mutate: recover, isPending, isSuccess } = useForgotPassword();

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: z.infer<typeof forgotSchema>) => {
    recover(values.email);
  };

  if (isSuccess) {
    return (
      <Card className="border-border/60 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-center">¡Correo enviado!</CardTitle>
          <CardDescription className="text-center">
            Si existe una cuenta asociada a <strong>{form.getValues("email")}</strong>, recibirás un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Volver al inicio de sesión</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo y te enviaremos las instrucciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Link>
      </CardFooter>
    </Card>
  );
}