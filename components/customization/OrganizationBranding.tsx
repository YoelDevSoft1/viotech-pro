"use client";

import { useState } from "react";
import { Palette, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useOrganizationBranding } from "@/lib/hooks/useCustomization";
import { useOrg } from "@/lib/hooks/useOrg";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export function OrganizationBranding() {
  const { orgId } = useOrg();
  const { data: branding, isLoading } = useOrganizationBranding(orgId || undefined);
  const tCustomization = useTranslationsSafe("customization");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tCustomization("organizationBranding")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!branding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {tCustomization("organizationBranding")}
          </CardTitle>
          <CardDescription>
            {tCustomization("organizationBrandingDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            {tCustomization("branding.notAvailable")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding de Organización
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia de tu organización
            </CardDescription>
          </div>
          <Badge variant={branding.enabled ? "default" : "secondary"}>
            {branding.enabled ? tCustomization("active") : tCustomization("inactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div className="space-y-2">
          <Label>{tCustomization("branding.logo")}</Label>
          <div className="flex items-center gap-4">
            {branding.logo && (
              <div className="relative">
                <img
                  src={branding.logo}
                  alt={tCustomization("branding.logo")}
                  className="h-16 w-16 object-contain border rounded"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {branding.logo ? tCustomization("branding.changeLogo") : tCustomization("branding.uploadLogo")}
            </Button>
          </div>
        </div>

        {/* Colores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">{tCustomization("branding.primaryColor")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="primary-color"
                type="color"
                value={branding.primaryColor || "#6366f1"}
                className="h-10 w-20"
                disabled
              />
              <Input
                value={branding.primaryColor || "#6366f1"}
                placeholder="#6366f1"
                className="flex-1"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">{tCustomization("branding.secondaryColor")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={branding.secondaryColor || "#8b5cf6"}
                className="h-10 w-20"
                disabled
              />
              <Input
                value={branding.secondaryColor || "#8b5cf6"}
                placeholder="#8b5cf6"
                className="flex-1"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color">{tCustomization("branding.accentColor")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="accent-color"
                type="color"
                value={branding.accentColor || "#a78bfa"}
                className="h-10 w-20"
                disabled
              />
              <Input
                value={branding.accentColor || "#a78bfa"}
                placeholder="#a78bfa"
                className="flex-1"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="branding-enabled">{tCustomization("branding.enableBranding")}</Label>
            <p className="text-xs text-muted-foreground">
              {tCustomization("branding.enableBrandingDescription")}
            </p>
          </div>
          <Switch id="branding-enabled" checked={branding.enabled} disabled />
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {tCustomization("branding.editNote")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

