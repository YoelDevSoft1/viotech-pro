/**
 * Componente de Rating (Estrellas)
 * Soporta display y input
 */

"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceRatingProps {
  rating: number; // 0-5 (puede ser decimal)
  count?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function ServiceRating({
  rating,
  count,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: ServiceRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    // Para hover interactivo (opcional)
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {/* Estrellas llenas */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(
              sizeClasses[size],
              "fill-yellow-400 text-yellow-400",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => handleClick(i + 1)}
            onMouseEnter={() => handleMouseEnter(i + 1)}
          />
        ))}

        {/* Media estrella */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                "text-gray-300"
              )}
            />
            <Star
              className={cn(
                sizeClasses[size],
                "fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden",
                "w-1/2",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
              onClick={() => handleClick(fullStars + 1)}
              onMouseEnter={() => handleMouseEnter(fullStars + 1)}
            />
          </div>
        )}

        {/* Estrellas vacías */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(
              sizeClasses[size],
              "text-gray-300",
              interactive && "cursor-pointer hover:scale-110 transition-transform hover:text-yellow-400"
            )}
            onClick={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
            onMouseEnter={() => handleMouseEnter(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
          />
        ))}
      </div>

      {/* Rating numérico y contador */}
      {(rating > 0 || count !== undefined) && (
        <span className={cn(
          "text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {rating > 0 && (
            <span className="font-semibold text-foreground">
              {rating.toFixed(1)}
            </span>
          )}
          {count !== undefined && (
            <span className="ml-1">
              ({count})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

