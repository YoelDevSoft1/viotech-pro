"use client";

import { useState } from "react";
import { useReferralCodes, useCreateReferralCode } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { Plus, Copy, Check, ExternalLink, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const referralCodeSchema = z.object({
  type: z.enum(["discount", "commission", "bonus"]),
  discount: z.number().min(0).max(100).optional(),
  commission: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  maxUses: z.number().min(1).optional(),
  expiresAt: z.string().optional(),
}).refine((data) => {
  if (data.type === "discount" && !data.discount) return false;
  if (data.type === "commission" && !data.commission) return false;
  if (data.type === "bonus" && !data.bonus) return false;
  return true;
}, {
  message: "El valor es requerido para el tipo seleccionado",
});

type ReferralCodeFormData = z.infer<typeof referralCodeSchema>;

export function PartnerReferrals() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const t = useTranslationsSafe("partners.referrals");
  const { formatDate, formatCurrency, formatNumber } = useI18n();

  const { data: codes, isLoading } = useReferralCodes();
  const createCode = useCreateReferralCode();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ReferralCodeFormData>({
    resolver: zodResolver(referralCodeSchema),
    defaultValues: {
      type: "discount",
    },
  });

  const typeValue = watch("type");

  const onSubmit = async (data: ReferralCodeFormData) => {
    try {
      await createCode.mutateAsync({
        type: data.type,
        discount: data.type === "discount" ? data.discount : undefined,
        commission: data.type === "commission" ? data.commission : undefined,
        bonus: data.type === "bonus" ? data.bonus : undefined,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt || undefined,
      });
      reset();
      setShowCreateModal(false);
      toast.success(t("createSuccess"), {
        description: t("createSuccessDescription"),
      });
    } catch (error) {
      toast.error(t("error.createCode"), {
        description: error instanceof Error ? error.message : t("error.createCodeDescription"),
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(t("copied"));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      discount: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      commission: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      bonus: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return styles[type as keyof typeof styles] || styles.discount;
  };

  const getReferralUrl = (code: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/register?ref=${code}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("createCode")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.totalCodes")}</CardDescription>
            <CardTitle className="text-2xl">{codes?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.activeCodes")}</CardDescription>
            <CardTitle className="text-2xl">
              {codes?.filter((c) => c.active).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t("stats.totalUses")}</CardDescription>
            <CardTitle className="text-2xl">
              {codes?.reduce((acc, c) => acc + c.usedCount, 0) || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista de Códigos */}
      {!codes || codes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{t("emptyCodes.title")}</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {t("emptyCodes.description")}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("emptyCodes.action")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {codes.map((code) => (
            <Card key={code.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-mono">{code.code}</CardTitle>
                    <CardDescription className="mt-1">
                      {t(`type.${code.type}`)}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeBadge(code.type)} variant={code.active ? "default" : "secondary"}>
                    {code.active ? t("active") : t("inactive")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("value")}</p>
                      <p className="font-medium">
                        {code.type === "discount" && `${code.discount}%`}
                        {code.type === "commission" && `${code.commission}%`}
                        {code.type === "bonus" && formatCurrency(code.bonus || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("uses")}</p>
                      <p className="font-medium">
                        {code.usedCount} / {code.maxUses || "∞"}
                      </p>
                    </div>
                  </div>

                  {code.expiresAt && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">{t("expires")}</p>
                      <p className="font-medium">{formatDate(code.expiresAt, "PP")}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs">{t("referralUrl")}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={getReferralUrl(code.code)}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(getReferralUrl(code.code))}
                      >
                        {copiedCode === code.code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">{t("created")}</p>
                    <p className="text-xs">{formatDate(code.createdAt, "PPp")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Crear Código */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createCode")}</DialogTitle>
            <DialogDescription>{t("createCodeDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="type">{t("form.type")} *</Label>
              <Select
                value={typeValue}
                onValueChange={(value) => setValue("type", value as "discount" | "commission" | "bonus")}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">{t("type.discount")}</SelectItem>
                  <SelectItem value="commission">{t("type.commission")}</SelectItem>
                  <SelectItem value="bonus">{t("type.bonus")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
              )}
            </div>

            {typeValue === "discount" && (
              <div>
                <Label htmlFor="discount">{t("form.discount")} (%) *</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  {...register("discount", { valueAsNumber: true })}
                  placeholder="10"
                />
                {errors.discount && (
                  <p className="text-sm text-destructive mt-1">{errors.discount.message}</p>
                )}
              </div>
            )}

            {typeValue === "commission" && (
              <div>
                <Label htmlFor="commission">{t("form.commission")} (%) *</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  {...register("commission", { valueAsNumber: true })}
                  placeholder="5"
                />
                {errors.commission && (
                  <p className="text-sm text-destructive mt-1">{errors.commission.message}</p>
                )}
              </div>
            )}

            {typeValue === "bonus" && (
              <div>
                <Label htmlFor="bonus">{t("form.bonus")} *</Label>
                <Input
                  id="bonus"
                  type="number"
                  min="0"
                  {...register("bonus", { valueAsNumber: true })}
                  placeholder="100"
                />
                {errors.bonus && (
                  <p className="text-sm text-destructive mt-1">{errors.bonus.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="maxUses">{t("form.maxUses")}</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                {...register("maxUses", { valueAsNumber: true })}
                placeholder={t("form.maxUsesPlaceholder")}
              />
            </div>

            <div>
              <Label htmlFor="expiresAt">{t("form.expiresAt")}</Label>
              <Input
                id="expiresAt"
                type="date"
                {...register("expiresAt")}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={createCode.isPending}>
                {createCode.isPending ? t("form.creating") : t("form.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


