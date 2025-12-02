/**
 * Cliente de Página de Detalle de Servicio
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, ShoppingCart, Share2, AlertCircle, Loader2 } from "lucide-react";
import { PageShell } from "@/components/ui/shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ServiceRating } from "@/components/services/ServiceRating";
import { ServiceReviews } from "@/components/services/ServiceReviews";
import { ServiceSpecsTable } from "@/components/services/ServiceSpecsTable";
import { useServiceBySlug } from "@/lib/hooks/useServicesMarketplace";
import { RelatedServices } from "@/components/services/ServiceRecommendations";
import { formatPrice } from "@/lib/services";
import CheckoutModal from "@/components/payments/CheckoutModal";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ServiceDetailClientProps {
  slug: string;
}

export function ServiceDetailClient({ slug }: ServiceDetailClientProps) {
  const router = useRouter();
  const t = useTranslationsSafe("services.marketplace.detail");
  const tCatalog = useTranslationsSafe("services.catalog");
  const { data: service, isLoading, isError, error } = useServiceBySlug(slug);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleBuy = () => {
    if (service) {
      setIsCheckoutOpen(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share && service) {
      try {
        await navigator.share({
          title: service.nombre,
          text: service.descripcionCorta || service.descripcion,
          url: window.location.href,
        });
      } catch (err) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("linkCopied"));
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  if (isError || !service) {
    return (
      <PageShell>
        <Alert variant="destructive" className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || t("errorLoading")}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-4">
          <Link href="/services/catalog">
            <Button variant="outline">{t("backToCatalog")}</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  const hasDiscount = service.metadata?.discount;
  const finalPrice = hasDiscount
    ? service.precio * (1 - hasDiscount.percentage / 100)
    : service.precio;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-primary">
            {tCatalog("title")}
          </Link>
          <span>/</span>
          <Link href="/services/catalog" className="hover:text-primary">
            {tCatalog("title")}
          </Link>
          <span>/</span>
          <span className="text-foreground">{service.nombre}</span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagen */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.nombre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {t("noImage")}
              </div>
            )}
          </div>

          {/* Info principal */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold">{service.nombre}</h1>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-lg text-muted-foreground">{service.tipo}</p>
            </div>

            {/* Rating */}
            {service.rating && service.rating.count > 0 && (
              <div className="flex items-center gap-4">
                <ServiceRating
                  rating={service.rating.average}
                  count={service.rating.count}
                  size="lg"
                />
                <Link
                  href="#reviews"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {t("viewAllReviews")}
                </Link>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {service.metadata?.popular && (
                <Badge variant="default">{tCatalog("mostPopular")}</Badge>
              )}
              {service.metadata?.new && (
                <Badge variant="secondary">{tCatalog("new")}</Badge>
              )}
              {service.metadata?.featured && (
                <Badge variant="outline">{tCatalog("featured")}</Badge>
              )}
              {service.categorias?.map((cat) => (
                <Badge key={cat.id} variant="outline">
                  {cat.nombre}
                </Badge>
              ))}
            </div>

            {/* Precio */}
            <div className="space-y-2">
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(service.precio, service.currency)}
                  </span>
                  <Badge variant="destructive">
                    -{hasDiscount.percentage}%
                  </Badge>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {formatPrice(finalPrice, service.currency)}
                </span>
                {service.durationDays > 0 && (
                  <span className="text-lg text-muted-foreground">
                    / {service.durationDays} {tCatalog("days")}
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={handleBuy}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("buyNow")}
              </Button>
            </div>

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">{t("tagsLabel")}</p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Descripción, Features, Specs, Reviews */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">{t("tabs.description")}</TabsTrigger>
            <TabsTrigger value="features">{t("tabs.features")}</TabsTrigger>
            <TabsTrigger value="specs">{t("tabs.specs")}</TabsTrigger>
            <TabsTrigger value="reviews">
              {t("tabs.reviews")} ({service.rating?.count || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {service.descripcion}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("featuresTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <ServiceSpecsTable service={service} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6" id="reviews">
            <ServiceReviews serviceId={service.id} />
          </TabsContent>
        </Tabs>

        {/* Servicios relacionados */}
        <RelatedServices serviceId={service.id} />

        {/* Volver */}
        <div className="flex justify-center">
          <Link href="/services/catalog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToCatalog")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Checkout Modal */}
      {service && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          plan={service}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            router.push("/services?payment=success");
          }}
          onError={() => setIsCheckoutOpen(false)}
        />
      )}
    </PageShell>
  );
}

