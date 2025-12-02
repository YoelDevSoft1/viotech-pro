/**
 * Componente de Reviews de Servicio
 * Lista de reviews con formulario para crear
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, ThumbsUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceRating } from "./ServiceRating";
import { useServiceReviews, useCreateServiceReview, useMarkReviewHelpful } from "@/lib/hooks/useServicesMarketplace";
import { getAccessToken } from "@/lib/auth";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { ServiceReview } from "@/lib/types/services";
import { cn } from "@/lib/utils";

interface ServiceReviewsProps {
  serviceId: string;
  className?: string;
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200, "El título no puede exceder 200 caracteres"),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres").max(2000, "El comentario no puede exceder 2000 caracteres"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export function ServiceReviews({ serviceId, className }: ServiceReviewsProps) {
  const t = useTranslationsSafe("services.marketplace.reviews");
  const isAuthenticated = !!getAccessToken();
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | undefined>();

  const { data: reviewsData, isLoading } = useServiceReviews(serviceId, {
    sortBy,
    rating: filterRating,
    limit: 10,
  });

  const createReview = useCreateServiceReview();
  const markHelpful = useMarkReviewHelpful();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error(t("loginRequired"));
      return;
    }

    try {
      await createReview.mutateAsync({
        serviceId,
        data: {
          rating: selectedRating,
          title: data.title,
          comment: data.comment,
        },
      });
      toast.success(t("created"));
      reset();
      setSelectedRating(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error") || "Error al crear review");
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error(t("loginRequiredHelpful"));
      return;
    }

    try {
      await markHelpful.mutateAsync({ reviewId });
      toast.success(t("markedHelpful"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error") || "Error al marcar como útil");
    }
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue("rating", rating);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const reviews = reviewsData?.reviews || [];
  const summary = reviewsData?.summary;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Resumen de ratings */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>{t("summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{summary.average.toFixed(1)}</div>
                <ServiceRating rating={summary.average} count={summary.count} size="lg" />
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = summary.distribution[String(rating) as keyof typeof summary.distribution] || 0;
                  const percentage = summary.count > 0 ? (count / summary.count) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-8">{rating}★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y ordenamiento */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterRating === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterRating(undefined)}
          >
            {t("all")}
          </Button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Button
              key={rating}
              variant={filterRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(filterRating === rating ? undefined : rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("newest")}
          >
            {t("sortNewest")}
          </Button>
          <Button
            variant={sortBy === "helpful" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("helpful")}
          >
            {t("sortHelpful")}
          </Button>
        </div>
      </div>

      {/* Formulario de review (si está autenticado) */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>{t("writeReview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Rating selector */}
              <div>
                <Label>{t("rating")}</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      className={cn(
                        "transition-colors",
                        selectedRating >= rating
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      )}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8",
                          selectedRating >= rating && "fill-current"
                        )}
                      />
                    </button>
                  ))}
                  {selectedRating > 0 && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {t("ratingLabel", { rating: selectedRating })}
                    </span>
                  )}
                </div>
                {errors.rating && (
                  <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">{t("titleLabel")}</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder={t("titlePlaceholder")}
                  className="mt-1"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment">{t("commentLabel")}</Label>
                <Textarea
                  id="comment"
                  {...register("comment")}
                  placeholder={t("commentPlaceholder")}
                  className="mt-1 min-h-[100px]"
                />
                {errors.comment && (
                  <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={createReview.isPending || selectedRating === 0}
                className="w-full"
                title={selectedRating === 0 ? t("selectRatingFirst") || "Selecciona una calificación primero" : undefined}
              >
                {createReview.isPending ? t("submitting") : t("submit")}
              </Button>
              {selectedRating === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {t("selectRatingFirst") || "Selecciona una calificación para continuar"}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filterRating
                  ? t("noReviewsFiltered", { rating: filterRating })
                  : t("noReviews")}
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onMarkHelpful={() => handleMarkHelpful(review.id)}
              t={t}
            />
          ))
        )}
      </div>

      {/* Paginación */}
      {reviewsData && reviewsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={reviewsData.pagination.page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {reviewsData.pagination.page} de {reviewsData.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={reviewsData.pagination.page === reviewsData.pagination.totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({
  review,
  onMarkHelpful,
  t,
}: {
  review: ServiceReview;
  onMarkHelpful: () => void;
  t: (key: string) => string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.userAvatar || undefined} />
            <AvatarFallback>
              {review.userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.userName}</span>
                  {review.verified && (
                    <Badge variant="secondary" className="text-xs">     
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {t("verified")}
                    </Badge>
                  )}
                </div>
                <ServiceRating rating={review.rating} size="sm" />
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
            <h4 className="font-semibold">{review.title}</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {review.comment}
            </p>
            <div className="flex items-center gap-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkHelpful}
                  className="text-muted-foreground"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {t("helpful")} ({review.helpful})
                </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

