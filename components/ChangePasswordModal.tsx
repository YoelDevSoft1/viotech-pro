"use client";

import { useState, type FormEvent } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError("La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error("No estás autenticado. Por favor, inicia sesión nuevamente.");
      }

      const response = await fetch(buildApiUrl("/auth/password"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo cambiar la contraseña.");
      }

      setSuccess(true);
      
      // Limpiar formulario
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Cerrar modal después de 2 segundos y redirigir a login
      setTimeout(() => {
        onClose();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido al cambiar la contraseña.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Seguridad
            </p>
            <h4 className="text-2xl font-medium text-foreground">
              Cambiar contraseña
            </h4>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
            Contraseña cambiada exitosamente. Serás redirigido al inicio de sesión.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 pr-24"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-1.5 right-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 pr-24"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-1.5 right-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Debe contener al menos una mayúscula, una minúscula y un número.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 pr-24"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-1.5 right-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

