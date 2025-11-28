import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Botón flotante para volver al inicio - Posicionado en esquina superior derecha */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <Link href="/">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-border/50 bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" /> 
            <span className="hidden sm:inline">Volver al inicio</span>
            <span className="sm:hidden">Inicio</span>
          </Button>
        </Link>
      </div>

      {/* Contenido de la página de autenticación */}
      {children}
    </div>
  );
}
