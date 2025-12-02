"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TourPosition } from "@/lib/hooks/useNativeTour";

interface TourSpotlightProps {
  position: TourPosition | null;
  borderRadius?: number;
  className?: string;
}

export function TourSpotlight({ position, borderRadius = 12, className }: TourSpotlightProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (position) {
      // Pequeño delay para animación suave
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [position]);

  if (!position) return null;

  return (
    <div
      className={cn(
        "fixed z-[9998] pointer-events-none transition-all duration-300",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        borderRadius: `${borderRadius}px`,
        border: "3px solid hsl(var(--primary))",
        boxShadow: `
          0 0 0 9999px rgba(0, 0, 0, 0.6),
          0 0 0 3px hsl(var(--primary) / 0.3),
          0 0 20px hsl(var(--primary) / 0.2)
        `,
      }}
      aria-hidden="true"
    >
      {/* Contenido dentro del spotlight es interactivo */}
      <div className="absolute inset-0 pointer-events-auto" />
    </div>
  );
}

