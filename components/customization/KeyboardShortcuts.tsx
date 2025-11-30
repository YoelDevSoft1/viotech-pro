"use client";

import { useState, useEffect } from "react";
import { Keyboard, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useKeyboardShortcuts,
  useUpdateKeyboardShortcuts,
} from "@/lib/hooks/useCustomization";
import { Skeleton } from "@/components/ui/skeleton";
import type { KeyboardShortcut } from "@/lib/types/customization";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  navigation: "Navegación",
  actions: "Acciones",
  views: "Vistas",
  custom: "Personalizados",
};

export function KeyboardShortcuts() {
  const { data: shortcuts = [], isLoading } = useKeyboardShortcuts();
  const [searchQuery, setSearchQuery] = useState("");
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setPressedKeys((prev) => new Set([...prev, key]));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atajos de Teclado</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const filteredShortcuts = shortcuts.filter((shortcut) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      shortcut.description.toLowerCase().includes(query) ||
      shortcut.action.toLowerCase().includes(query) ||
      shortcut.key.toLowerCase().includes(query)
    );
  });

  const groupedShortcuts = filteredShortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>
  );

  const formatKey = (key: string, modifiers?: string[]) => {
    const parts: string[] = [];
    if (modifiers?.includes("ctrl")) parts.push("Ctrl");
    if (modifiers?.includes("alt")) parts.push("Alt");
    if (modifiers?.includes("shift")) parts.push("Shift");
    if (modifiers?.includes("meta")) parts.push("Cmd");
    parts.push(key.toUpperCase());
    return parts.join(" + ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Atajos de Teclado
        </CardTitle>
        <CardDescription>
          Atajos de teclado disponibles en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atajos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {Object.entries(groupedShortcuts).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {categoryLabels[category] || category}
            </h4>
            <div className="space-y-2">
              {items.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg",
                    !shortcut.enabled && "opacity-50"
                  )}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{shortcut.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {shortcut.action}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatKey(shortcut.key, shortcut.modifiers)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredShortcuts.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No se encontraron atajos de teclado
          </div>
        )}
      </CardContent>
    </Card>
  );
}

