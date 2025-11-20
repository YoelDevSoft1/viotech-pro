"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldCheck, AlertCircle, X } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import MFASetupModal from "./MFASetupModal";

export default function MFASettings() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado");
        return;
      }

      const response = await fetch(buildApiUrl("/mfa/status"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al obtener estado de MFA");
      }

      setMfaEnabled(data.data.mfaEnabled || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);
    setDisableError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setDisableError("No estás autenticado");
        return;
      }

      const response = await fetch(buildApiUrl("/mfa/disable"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al deshabilitar MFA");
      }

      setMfaEnabled(false);
      setDisableModalOpen(false);
      setPassword("");
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : "Error al deshabilitar MFA");
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/70 bg-background/70 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border/70 bg-background/70 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mfaEnabled ? (
              <ShieldCheck className="w-6 h-6 text-green-500" />
            ) : (
              <Shield className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-medium">Autenticación de Dos Factores (MFA)</h3>
              <p className="text-sm text-muted-foreground">
                {mfaEnabled
                  ? "MFA está habilitado en tu cuenta"
                  : "Agrega una capa adicional de seguridad a tu cuenta"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          {mfaEnabled ? (
            <button
              onClick={() => setDisableModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              Deshabilitar MFA
            </button>
          ) : (
            <button
              onClick={() => setSetupModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity text-sm font-medium"
            >
              Configurar MFA
            </button>
          )}
        </div>
      </div>

      <MFASetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onSuccess={() => {
          setSetupModalOpen(false);
          fetchMFAStatus();
        }}
      />

      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 space-y-6 relative">
            <button
              onClick={() => {
                setDisableModalOpen(false);
                setPassword("");
                setDisableError(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <h2 className="text-xl font-medium">Deshabilitar MFA</h2>
              <p className="text-sm text-muted-foreground">
                Ingresa tu contraseña para confirmar que deseas deshabilitar MFA
              </p>
            </div>

            <form onSubmit={handleDisable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground"
                  placeholder="Ingresa tu contraseña"
                  disabled={disabling}
                  autoFocus
                  required
                />
              </div>

              {disableError && (
                <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-500">{disableError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDisableModalOpen(false);
                    setPassword("");
                    setDisableError(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                  disabled={disabling}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={disabling || !password}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {disabling ? "Deshabilitando..." : "Deshabilitar MFA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

