"use client";

import { useState, useMemo } from "react";
import { History, User, Calendar, FileText, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLog, useAuditLogStats } from "@/lib/hooks/useAuditLog";
import type { AuditLog, AuditLogFilters, AuditLogAction, AuditLogEntityType } from "@/lib/types/audit-log";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

const actionColors: Record<AuditLogAction, string> = {
  create: "bg-green-500/10 text-green-700 dark:text-green-400",
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400",
  assign: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  status_change: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  comment: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  approve: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  reject: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  login: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  logout: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  permission_change: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

function AuditLogItem({ log }: { log: AuditLog }) {
  const tAuditLog = useTranslationsSafe("auditLog");
  const { formatDate, formatRelativeTime, locale } = useI18n();

  const actionLabel = tAuditLog(`actions.${log.action}`);
  const entityTypeLabel = tAuditLog(`entityTypes.${log.entityType}`);

  return (
    <div className="flex gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <History className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("text-xs", actionColors[log.action])}>
              {actionLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {entityTypeLabel}
            </Badge>
            {log.entityName && (
              <span className="text-sm font-medium text-foreground truncate">
                {log.entityName}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(log.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
        {log.userName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{log.userName}</span>
            {log.userEmail && (
              <>
                <span>•</span>
                <span>{log.userEmail}</span>
              </>
            )}
          </div>
        )}
        {log.changes && log.changes.length > 0 && (
          <div className="mt-2 space-y-1">
            {log.changes.map((change, idx) => (
              <div key={idx} className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <span className="font-medium">{change.field}:</span>{" "}
                <span className="line-through text-red-600 dark:text-red-400">
                  {String(change.oldValue || "N/A")}
                </span>{" "}
                →{" "}
                <span className="text-green-600 dark:text-green-400">
                  {String(change.newValue || "N/A")}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 text-xs text-muted-foreground">
          {formatDate(log.createdAt, "PPpp")}
        </div>
      </div>
    </div>
  );
}

export function AuditLogView({
  entityType,
  entityId,
  showFilters = true,
}: {
  entityType?: string;
  entityId?: string;
  showFilters?: boolean;
}) {
  const [filters, setFilters] = useState<AuditLogFilters>({
    entityType: entityType as AuditLogEntityType | undefined,
    entityId: entityId,
  });
  const [search, setSearch] = useState("");
  const tAuditLog = useTranslationsSafe("auditLog");

  const { data: logs = [], isLoading } = useAuditLog(filters);
  const { data: stats } = useAuditLogStats();

  // Crear labels dinámicos usando traducciones
  const actionLabels = useMemo(() => {
    const actions: AuditLogAction[] = [
      "create", "update", "delete", "assign", "status_change",
      "comment", "approve", "reject", "login", "logout", "permission_change"
    ];
    return actions.reduce((acc, action) => {
      acc[action] = tAuditLog(`actions.${action}`);
      return acc;
    }, {} as Record<AuditLogAction, string>);
  }, [tAuditLog]);

  const entityTypeLabels = useMemo(() => {
    const types: AuditLogEntityType[] = [
      "ticket", "project", "user", "organization", "comment",
      "blog_post", "blog_comment", "notification", "system"
    ];
    return types.reduce((acc, type) => {
      acc[type] = tAuditLog(`entityTypes.${type}`);
      return acc;
    }, {} as Record<AuditLogEntityType, string>);
  }, [tAuditLog]);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {tAuditLog("title")}
        </CardTitle>
        <CardDescription>
          {tAuditLog("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showFilters && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{tAuditLog("search")}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={tAuditLog("searchPlaceholder")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-8"
                    />
                  </div>
                  <Button size="sm" onClick={handleSearch}>
                    {tAuditLog("searchButton")}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{tAuditLog("action")}</label>
                <Select
                  value={filters.action || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("action", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tAuditLog("allActions")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tAuditLog("allActions")}</SelectItem>
                    {Object.entries(actionLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{tAuditLog("entityType")}</label>
                <Select
                  value={filters.entityType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("entityType", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tAuditLog("allTypes")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tAuditLog("allTypes")}</SelectItem>
                    {Object.entries(entityTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">{tAuditLog("noRecords")}</p>
          </div>
        ) : (
          <div className="space-y-0 border rounded-lg overflow-hidden">
            {logs.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

