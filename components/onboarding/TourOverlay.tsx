"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { TourPosition } from "@/lib/hooks/useNativeTour";

interface TourOverlayProps {
  spotlightPosition: TourPosition | null;
  isVisible: boolean;
  className?: string;
}

export function TourOverlay({ spotlightPosition, isVisible, className }: TourOverlayProps) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", updateViewport, true);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("scroll", updateViewport, true);
    };
  }, []);

  if (!isVisible) return null;

  if (!spotlightPosition || viewport.width === 0 || viewport.height === 0) {
    // Si no hay spotlight, mostrar overlay completo
    return (
      <div
        className={cn(
          "fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const { top, left, width, height } = spotlightPosition;
  const { width: viewportWidth, height: viewportHeight } = viewport;

  // Crear 4 rectángulos alrededor del spotlight:
  // 1. Arriba
  // 2. Derecha
  // 3. Abajo
  // 4. Izquierda

  return (
    <div className="fixed inset-0 z-[9997] pointer-events-none" aria-hidden="true">
      {/* Área superior */}
      {top > 0 && (
        <div
          className="absolute bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: `${Math.max(0, top)}px`,
          }}
        />
      )}

      {/* Área inferior */}
      {top + height < viewportHeight && (
        <div
          className="absolute bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{
            top: `${top + height}px`,
            left: 0,
            width: "100%",
            height: `${Math.max(0, viewportHeight - (top + height))}px`,
          }}
        />
      )}

      {/* Área izquierda */}
      {left > 0 && (
        <div
          className="absolute bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{
            top: `${Math.max(0, top)}px`,
            left: 0,
            width: `${Math.max(0, left)}px`,
            height: `${Math.max(0, height)}px`,
          }}
        />
      )}

      {/* Área derecha */}
      {left + width < viewportWidth && (
        <div
          className="absolute bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{
            top: `${Math.max(0, top)}px`,
            left: `${left + width}px`,
            width: `${Math.max(0, viewportWidth - (left + width))}px`,
            height: `${Math.max(0, height)}px`,
          }}
        />
      )}
    </div>
  );
}

