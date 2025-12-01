"use client";

import { useState } from "react";
import { usePartnerMarketingMaterials } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { Search, Download, FileText, Image, Video, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PartnerMarketing() {
  const [filters, setFilters] = useState({
    category: "",
    type: "",
  });
  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const t = useTranslationsSafe("partners.marketing");
  const { formatDate } = useI18n();

  const { data: materials, isLoading } = usePartnerMarketingMaterials(filters);

  const filteredMaterials = materials?.filter((material) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      material.name.toLowerCase().includes(searchLower) ||
      material.description?.toLowerCase().includes(searchLower) ||
      material.category.toLowerCase().includes(searchLower)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      logo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      banner: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      brochure: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      presentation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      video: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      social: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return styles[category as keyof typeof styles] || styles.logo;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allCategories")}</SelectItem>
                  <SelectItem value="logo">{t("category.logo")}</SelectItem>
                  <SelectItem value="banner">{t("category.banner")}</SelectItem>
                  <SelectItem value="brochure">{t("category.brochure")}</SelectItem>
                  <SelectItem value="presentation">{t("category.presentation")}</SelectItem>
                  <SelectItem value="video">{t("category.video")}</SelectItem>
                  <SelectItem value="social">{t("category.social")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allTypes")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allTypes")}</SelectItem>
                  <SelectItem value="image">{t("type.image")}</SelectItem>
                  <SelectItem value="video">{t("type.video")}</SelectItem>
                  <SelectItem value="document">{t("type.document")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Materiales */}
      {!filteredMaterials || filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              {t("noMaterials")}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => {
            const Icon = getTypeIcon(material.type);
            return (
              <Card
                key={material.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedMaterial(material)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                    </div>
                    <Badge className={getCategoryBadge(material.category)}>
                      {t(`category.${material.category}`)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {material.description || t("noDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{t("updated")}: {formatDate(material.updatedAt, "PP")}</span>
                      <span>{material.size || "—"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(material.url, "_blank");
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t("download")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMaterial(material);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle */}
      <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMaterial?.name}</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.description || t("noDescription")}
            </DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("category.label")}</p>
                  <Badge className={getCategoryBadge(selectedMaterial.category)}>
                    {t(`category.${selectedMaterial.category}`)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("type.label")}</p>
                  <p className="text-sm">{t(`type.${selectedMaterial.type}`)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("size")}</p>
                  <p className="text-sm">{selectedMaterial.size || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("updated")}</p>
                  <p className="text-sm">{formatDate(selectedMaterial.updatedAt, "PPp")}</p>
                </div>
              </div>
              {selectedMaterial.usageGuidelines && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t("usageGuidelines")}
                  </p>
                  <p className="text-sm whitespace-pre-line">
                    {selectedMaterial.usageGuidelines}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => window.open(selectedMaterial.url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("download")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedMaterial(null)}
                >
                  {t("close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

