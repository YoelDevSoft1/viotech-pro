"use client";

import { useState } from "react";
import { useNewsletterSubscribe } from "@/lib/hooks/useBlog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Loader2, Check } from "lucide-react";

interface NewsletterSubscriptionProps {
  source?: string;
}

export function NewsletterSubscription({ source = "blog" }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState("");
  const subscribe = useNewsletterSubscribe();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      return;
    }
    try {
      await subscribe.mutateAsync({ email, source });
      setEmail("");
    } catch (error) {
      // Error ya manejado en el hook
    }
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
            disabled={subscribe.isPending}
            className="flex-1 bg-background text-foreground"
            required
          />
          <Button type="submit" disabled={subscribe.isPending} variant="secondary">
            {subscribe.isPending ? (
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

