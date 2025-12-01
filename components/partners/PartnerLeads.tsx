"use client";

import { useState } from "react";
import { usePartnerLeads, useCreatePartnerLead } from "@/lib/hooks/usePartners";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { Plus, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const leadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  company: z.string().optional(),
  phone: z.string().optional(),
  source: z.enum(["referral", "direct", "campaign"]),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function PartnerLeads() {
  const [filters, setFilters] = useState({
    status: "",
    source: "",
  });
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const t = useTranslationsSafe("partners.leads");
  const { formatDate, formatCurrency } = useI18n();

  const { data: leads, isLoading } = usePartnerLeads(filters);
  const createLead = useCreatePartnerLead();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const sourceValue = watch("source");

  const filteredLeads = leads?.filter((lead) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      lead.company?.toLowerCase().includes(searchLower)
    );
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      await createLead.mutateAsync(data);
      reset();
      setShowCreateModal(false);
    } catch (error) {
      // Error manejado por el hook
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      converted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return styles[status as keyof typeof styles] || styles.new;
  };

  const getSourceBadge = (source: string) => {
    const styles = {
      referral: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      direct: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      campaign: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return styles[source as keyof typeof styles] || styles.direct;
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
          {t("createLead")}
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allStatuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="new">{t("status.new")}</SelectItem>
                  <SelectItem value="contacted">{t("status.contacted")}</SelectItem>
                  <SelectItem value="qualified">{t("status.qualified")}</SelectItem>
                  <SelectItem value="converted">{t("status.converted")}</SelectItem>
                  <SelectItem value="lost">{t("status.lost")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={filters.source}
                onValueChange={(value) => setFilters({ ...filters, source: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.allSources")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t("filters.allSources")}</SelectItem>
                  <SelectItem value="referral">{t("source.referral")}</SelectItem>
                  <SelectItem value="direct">{t("source.direct")}</SelectItem>
                  <SelectItem value="campaign">{t("source.campaign")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>{t("leadsList")}</CardTitle>
          <CardDescription>
            {t("totalLeads", { count: filteredLeads?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.email")}</TableHead>
                  <TableHead>{t("table.company")}</TableHead>
                  <TableHead>{t("table.source")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.value")}</TableHead>
                  <TableHead>{t("table.created")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filteredLeads || filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("noLeads")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company || "—"}</TableCell>
                      <TableCell>
                        <Badge className={getSourceBadge(lead.source)}>
                          {t(`source.${lead.source}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(lead.status)}>
                          {t(`status.${lead.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.value ? formatCurrency(lead.value) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.createdAt, "PP")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Crear Lead */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createLead")}</DialogTitle>
            <DialogDescription>{t("createLeadDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{t("form.name")} *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder={t("form.namePlaceholder")}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{t("form.email")} *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder={t("form.emailPlaceholder")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company">{t("form.company")}</Label>
              <Input
                id="company"
                {...register("company")}
                placeholder={t("form.companyPlaceholder")}
              />
            </div>

            <div>
              <Label htmlFor="phone">{t("form.phone")}</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder={t("form.phonePlaceholder")}
              />
            </div>

            <div>
              <Label htmlFor="source">{t("form.source")} *</Label>
              <Select
                value={sourceValue}
                onValueChange={(value) => setValue("source", value as "referral" | "direct" | "campaign")}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder={t("form.selectSource")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referral">{t("source.referral")}</SelectItem>
                  <SelectItem value="direct">{t("source.direct")}</SelectItem>
                  <SelectItem value="campaign">{t("source.campaign")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-sm text-destructive mt-1">{errors.source.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                {t("form.cancel")}
              </Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending ? t("form.creating") : t("form.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

