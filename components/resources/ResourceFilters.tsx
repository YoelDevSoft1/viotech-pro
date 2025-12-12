"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { ResourceFilters as ResourceFiltersType } from "@/lib/types/resources";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";

interface ResourceFiltersProps {
  filters: ResourceFiltersType;
  onFiltersChange: (filters: ResourceFiltersType) => void;
  className?: string;
}

export function ResourceFilters({
  filters,
  onFiltersChange,
  className,
}: ResourceFiltersProps) {
  const tResources = useTranslationsSafe("resources");
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = useCallback(
    (key: keyof ResourceFiltersType, value: string | undefined) => {
      onFiltersChange({
        ...filters,
        [key]: value || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
    },
    []
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateFilter("search", searchValue);
    },
    [searchValue, updateFilter]
  );

  const handleSearchBlur = useCallback(() => {
    updateFilter("search", searchValue);
  }, [searchValue, updateFilter]);

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    onFiltersChange({});
  }, [onFiltersChange]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Roles disponibles para filtrar (excluye clientes ya que no son recursos del equipo)
  const roles = [
    { value: "agente", label: tResources("roles.agent") },
    { value: "admin", label: tResources("roles.admin") },
    { value: "interno", label: tResources("roles.internal") },
  ];

  const availabilities = [
    { value: "available", label: tResources("status.available") },
    { value: "busy", label: tResources("status.busy") },
    { value: "unavailable", label: tResources("status.unavailable") },
    { value: "on_leave", label: tResources("status.onLeave") },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {/* Búsqueda */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={tResources("searchPlaceholder")}
            value={searchValue}
            onChange={handleSearchChange}
            onBlur={handleSearchBlur}
            className="pl-9 pr-4"
          />
        </form>

        {/* Filtros avanzados */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {tResources("filters")}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{tResources("advancedFilters")}</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {tResources("clearAll")}
                  </Button>
                )}
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label>{tResources("role")}</Label>
                <Select
                  value={filters.role || "all"}
                  onValueChange={(value) =>
                    updateFilter("role", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tResources("allRoles")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tResources("allRoles")}</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Disponibilidad */}
              <div className="space-y-2">
                <Label>{tResources("availability")}</Label>
                <Select
                  value={filters.availability || "all"}
                  onValueChange={(value) =>
                    updateFilter("availability", value === "all" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tResources("allAvailabilities")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tResources("allAvailabilities")}</SelectItem>
                    {availabilities.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skill */}
              <div className="space-y-2">
                <Label>{tResources("skill")}</Label>
                <Input
                  placeholder={tResources("skillPlaceholder")}
                  value={filters.skill || ""}
                  onChange={(e) => updateFilter("skill", e.target.value)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              {tResources("search")}: {filters.search}
              <button
                onClick={() => {
                  setSearchValue("");
                  updateFilter("search", undefined);
                }}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.role && (
            <Badge variant="secondary" className="gap-1">
              {tResources("role")}: {filters.role}
              <button
                onClick={() => updateFilter("role", undefined)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.availability && (
            <Badge variant="secondary" className="gap-1">
              {tResources("availability")}: {filters.availability}
              <button
                onClick={() => updateFilter("availability", undefined)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.skill && (
            <Badge variant="secondary" className="gap-1">
              {tResources("skill")}: {filters.skill}
              <button
                onClick={() => updateFilter("skill", undefined)}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

