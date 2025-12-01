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
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const forgotSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

export default function ForgotPasswordPage() {
  const { mutate: recover, isPending, isSuccess } = useForgotPassword();
  const tAuth = useTranslationsSafe("auth");

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
          <CardTitle className="text-xl text-center">{tAuth("emailSent")}</CardTitle>
          <CardDescription className="text-center">
            {tAuth("emailSentDescriptionStart")} <strong>{form.getValues("email")}</strong>, {tAuth("emailSentDescriptionEnd")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="bg-primary/10 p-4 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">{tAuth("backToSignIn")}</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">{tAuth("recoverPassword")}</CardTitle>
        <CardDescription>
          {tAuth("recoverPasswordDescription")}
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
                  <FormLabel>{tAuth("email")}</FormLabel>
                  <FormControl>
                    <Input placeholder={tAuth("emailPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? tAuth("sending") : tAuth("sendLink")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> {tAuth("back")}
        </Link>
      </CardFooter>
    </Card>
  );
}