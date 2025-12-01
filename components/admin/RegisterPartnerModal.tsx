"use client";

import { useState, useEffect } from "react";
import { useRegisterPartner } from "@/lib/hooks/usePartnersAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

interface RegisterPartnerModalProps {
  onClose: () => void;
}

interface User {
  id: string;
  nombre: string;
  email: string;
}

export function RegisterPartnerModal({ onClose }: RegisterPartnerModalProps) {
  const [formData, setFormData] = useState({
    userId: "",
    organizationId: "",
    tier: "bronze" as const,
    commissionRate: 10.0,
    status: "active" as const,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const registerPartner = useRegisterPartner();
  const t = useTranslationsSafe("partners.admin");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = getAccessToken();
        if (!token) return;

        const response = await fetch(buildApiUrl("/users"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const usersList = Array.isArray(data.data) ? data.data : Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : [];
          setUsers(usersList);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await registerPartner.mutateAsync({
        userId: formData.userId,
        organizationId: formData.organizationId || undefined,
        tier: formData.tier,
        commissionRate: formData.commissionRate,
        status: formData.status,
      });
      onClose();
    } catch (error) {
      // Error manejado por el hook
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("register.title")}</DialogTitle>
          <DialogDescription>{t("register.description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">{t("register.user")} *</Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => setFormData({ ...formData, userId: value })}
              required
            >
              <SelectTrigger id="userId">
                <SelectValue placeholder={t("register.selectUser")} />
              </SelectTrigger>
              <SelectContent>
                {loadingUsers ? (
                  <SelectItem value="" disabled>{t("register.loadingUsers")}</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nombre} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tier">{t("register.tier")}</Label>
            <Select
              value={formData.tier}
              onValueChange={(value) => setFormData({ ...formData, tier: value as any })}
            >
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">{t("tiers.bronze")}</SelectItem>
                <SelectItem value="silver">{t("tiers.silver")}</SelectItem>
                <SelectItem value="gold">{t("tiers.gold")}</SelectItem>
                <SelectItem value="platinum">{t("tiers.platinum")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="commissionRate">{t("register.commissionRate")}</Label>
            <Input
              id="commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.commissionRate}
              onChange={(e) =>
                setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div>
            <Label htmlFor="status">{t("register.status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="active">{t("status.active")}</SelectItem>
                <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("register.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={registerPartner.isPending || !formData.userId}
            >
              {registerPartner.isPending ? t("register.registering") : t("register.register")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

