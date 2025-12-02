"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onContact?: () => void;
  className?: string;
  variant?: "default" | "card";
}

export function ErrorState({
  title = "Error al cargar",
  description = "No pudimos cargar la información. Por favor, intenta de nuevo.",
  onRetry,
  onContact,
  className,
  variant = "default",
}: ErrorStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center py-8 px-4 text-center", className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      <div className="flex gap-2">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
        {onContact && (
          <Button onClick={onContact} variant="ghost" size="sm">
            Contactar soporte
          </Button>
        )}
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <Card>
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }

  return content;
}

