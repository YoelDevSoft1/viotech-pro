/**
 * Card de Servicio Mejorado
 * Incluye rating, badges, preview de imagen
 */

"use client";

import Link from "next/link";
import { Check, Sparkles, TrendingUp, Star as StarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceRating } from "./ServiceRating";
import { formatPrice } from "@/lib/services";
import type { ServicePlanExtended } from "@/lib/types/services";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ServiceCardProps {
  service: ServicePlanExtended;
  onBuy?: (service: ServicePlanExtended) => void;
  showImage?: boolean;
  className?: string;
}

export function ServiceCard({ service, onBuy, showImage = true, className }: ServiceCardProps) {
  const isPopular = service.metadata?.popular;
  const isFeatured = service.metadata?.featured;
  const isNew = service.metadata?.new;
  const hasDiscount = service.metadata?.discount;

  const handleBuy = () => {
    if (onBuy) {
      onBuy(service);
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col relative transition-all duration-200 hover:shadow-lg",
        isPopular && "border-primary shadow-md",
        className
      )}
    >
      {/* Badges */}
      <div className="absolute -top-3 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {isPopular && (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary px-2 py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500 text-white hover:bg-green-600 px-2 py-0.5">
              Nuevo
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-purple-500 text-white hover:bg-purple-600 px-2 py-0.5">
              <StarIcon className="w-3 h-3 mr-1" />
              Destacado
            </Badge>
          )}
        </div>
        {hasDiscount && (
          <Badge variant="destructive" className="px-2 py-0.5">
            -{hasDiscount.percentage}%
          </Badge>
        )}
      </div>

      {/* Imagen (opcional) */}
      {showImage && service.image && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={service.image}
            alt={service.nombre}
            fill
            className="object-cover"
          />
        </div>
      )}

      <CardHeader className={cn(showImage && service.image && "pt-6")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl line-clamp-2">{service.nombre}</CardTitle>
            <CardDescription className="uppercase text-xs font-bold tracking-wider mt-1">
              {service.tipo}
            </CardDescription>
          </div>
        </div>

        {/* Rating */}
        {service.rating && service.rating.count > 0 && (
          <div className="mt-2">
            <ServiceRating
              rating={service.rating.average}
              count={service.rating.count}
              size="sm"
            />
          </div>
        )}

        {/* Categorías */}
        {service.categorias && service.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {service.categorias.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="outline" className="text-xs">
                {cat.nombre}
              </Badge>
            ))}
            {service.categorias.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{service.categorias.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Descripción corta */}
        {service.descripcionCorta && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.descripcionCorta}
          </p>
        )}

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(service.precio, service.currency)}
            </span>
          )}
          <span className="text-3xl font-bold">
            {formatPrice(
              hasDiscount
                ? service.precio * (1 - hasDiscount.percentage / 100)
                : service.precio,
              service.currency
            )}
          </span>
          {service.durationDays > 0 && (
            <span className="text-sm text-muted-foreground">
              / {service.durationDays} días
            </span>
          )}
        </div>

        {/* Features (primeros 3) */}
        {service.features && service.features.length > 0 && (
          <ul className="space-y-2">
            {service.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="leading-tight line-clamp-1">{feature}</span>
              </li>
            ))}
            {service.features.length > 3 && (
              <li className="text-xs text-muted-foreground pl-6">
                +{service.features.length - 3} más
              </li>
            )}
          </ul>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          variant={isPopular ? "default" : "outline"}
          onClick={handleBuy}
        >
          Contratar ahora
        </Button>
        <Link
          href={`/services/catalog/${service.slug}`}
          className="text-sm text-muted-foreground hover:text-primary text-center w-full"
        >
          Ver detalles
        </Link>
      </CardFooter>
    </Card>
  );
}

