/**
 * Componente de prueba para verificar que el Error Boundary funciona
 * 
 * USO: Importar temporalmente en cualquier página para probar:
 * 
 * import { ErrorTrigger } from '@/components/common/ErrorBoundary.test';
 * 
 * <ErrorTrigger />
 * 
 * Luego hacer clic en el botón para simular un error.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

function ComponenteConError(): never {
  throw new Error("Error de prueba - Esto debería ser capturado por Error Boundary");
}

export function ErrorTrigger() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    return <ComponenteConError />;
  }

  return (
    <div className="p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg space-y-2">
      <div className="flex items-center gap-2 text-yellow-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Error Boundary Test Component</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Este componente es solo para pruebas. Haz clic en el botón para simular un error.
      </p>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShouldError(true)}
      >
        Simular Error
      </Button>
    </div>
  );
}

