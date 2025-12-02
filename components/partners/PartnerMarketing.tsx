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
import { Search, Download, FileText, Image, Video, ExternalLink, FileX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PartnerMarketing() {
  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
  });
  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const t = useTranslationsSafe("partners.marketing");
  const { formatDate } = useI18n();

  // Convertir "all" a undefined para el hook
  const materialFilters = {
    category: filters.category === "all" ? undefined : filters.category,
    type: filters.type === "all" ? undefined : filters.type,
  };
  const { data: materials, isLoading } = usePartnerMarketingMaterials(materialFilters);

  const filteredMaterials = materials?.filter((material) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      material.title.toLowerCase().includes(searchLower) ||
      material.description?.toLowerCase().includes(searchLower) ||
      material.category.toLowerCase().includes(searchLower)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "banner":
      case "logo":
        return Image;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      service: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      industry: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "case-study": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return styles[category as keyof typeof styles] || styles.general;
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
                  <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                  <SelectItem value="general">{t("category.general")}</SelectItem>
                  <SelectItem value="service">{t("category.service")}</SelectItem>
                  <SelectItem value="industry">{t("category.industry")}</SelectItem>
                  <SelectItem value="case-study">{t("category.caseStudy")}</SelectItem>
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
                  <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                  <SelectItem value="logo">{t("type.logo")}</SelectItem>
                  <SelectItem value="banner">{t("type.banner")}</SelectItem>
                  <SelectItem value="brochure">{t("type.brochure")}</SelectItem>
                  <SelectItem value="video">{t("type.video")}</SelectItem>
                  <SelectItem value="presentation">{t("type.presentation")}</SelectItem>
                  <SelectItem value="other">{t("type.other")}</SelectItem>
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
            <div className="text-center py-12">
              <FileX className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{t("emptyMaterials.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("emptyMaterials.description")}
              </p>
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
                      <CardTitle className="text-lg">{material.title}</CardTitle>
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
                      <span>{t("downloads")}: {material.downloadCount || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(material.fileUrl, "_blank");
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
            <DialogTitle>{selectedMaterial?.title}</DialogTitle>
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
                  <p className="text-sm font-medium text-muted-foreground">{t("downloads")}</p>
                  <p className="text-sm">{selectedMaterial.downloadCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("updated")}</p>
                  <p className="text-sm">{formatDate(selectedMaterial.updatedAt, "PPp")}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => window.open(selectedMaterial.fileUrl, "_blank")}
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

