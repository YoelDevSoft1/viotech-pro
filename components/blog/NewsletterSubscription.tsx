"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function NewsletterSubscription() {
  const [email, setEmail] = useState("");

  const { mutate: subscribe, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post("/blog/newsletter/subscribe", { email });
      return data;
    },
    onSuccess: () => {
      toast.success("¡Te has suscrito exitosamente!");
      setEmail("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al suscribirse. Intenta nuevamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Por favor ingresa un email válido");
      return;
    }
    subscribe(email);
  };

  return (
    <Card className="bg-primary text-primary-foreground border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-6 h-6" />
          <CardTitle className="text-2xl">Newsletter</CardTitle>
        </div>
        <CardDescription className="text-primary-foreground/90">
          Recibe artículos sobre consultoría TI, transformación digital y mejores prácticas
          tecnológicas directamente en tu correo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="flex-1 bg-background text-foreground"
            required
          />
          <Button type="submit" disabled={isPending} variant="secondary">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suscribiendo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Suscribirse
              </>
            )}
          </Button>
        </form>
        <p className="text-xs text-primary-foreground/70 mt-2">
          No compartimos tu información. Puedes cancelar la suscripción en cualquier momento.
        </p>
      </CardContent>
    </Card>
  );
}

