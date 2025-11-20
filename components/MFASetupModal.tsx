"use client";

import { useState, useEffect } from "react";
import { X, Shield, CheckCircle, AlertCircle, Copy, Download } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MFASetupModal({ isOpen, onClose, onSuccess }: MFASetupModalProps) {
  const [step, setStep] = useState<"setup" | "verify" | "success">("setup");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [otpauthUrl, setOtpauthUrl] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && step === "setup") {
      handleSetup();
    }
  }, [isOpen, step]);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) {
        setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
        return;
      }

      const response = await fetch(buildApiUrl("/mfa/setup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error al iniciar configuración de MFA");
      }

      setQrCode(data.data.qrCode);
      setSecret(data.data.secret);
      setOtpauthUrl(data.data.otpauthUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!token || token.length !== 6) {
      setError("El código debe tener 6 dígitos");
      setLoading(false);
      return;
    }

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setError("No estás autenticado. Por favor, inicia sesión nuevamente.");
        return;
      }

      const response = await fetch(buildApiUrl("/mfa/verify"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          secret,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Código inválido");
      }

      setBackupCodes(data.data.backupCodes || []);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar código");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "viotech-mfa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep("setup");
    setQrCode("");
    setSecret("");
    setToken("");
    setBackupCodes([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-background p-8 space-y-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "setup" && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-foreground" />
                <h2 className="text-xl font-medium">Configurar Autenticación de Dos Factores</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Escanea el código QR con tu app de autenticación (Google Authenticator, Authy, etc.)
              </p>
            </div>

            {loading && !qrCode && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-500">Error</p>
                  <p className="text-sm text-red-500/80">{error}</p>
                </div>
              </div>
            )}

            {qrCode && (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>

                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    O ingresa manualmente
                  </p>
                  <code className="text-xs font-mono break-all text-foreground">{secret}</code>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Código de verificación (6 dígitos)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || token.length !== 6}
                    className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verificando..." : "Verificar y Habilitar"}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {step === "success" && (
          <>
            <div className="space-y-2 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-500/20 p-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <h2 className="text-xl font-medium">MFA Habilitado Exitosamente</h2>
              <p className="text-sm text-muted-foreground">
                Guarda estos códigos de respaldo en un lugar seguro. Solo se mostrarán una vez.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Códigos de Respaldo
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCodes}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Copiar códigos"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownloadCodes}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Descargar códigos"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="text-xs font-mono p-2 rounded-lg bg-muted text-center"
                  >
                    {code}
                  </code>
                ))}
              </div>
              {copied && (
                <p className="text-xs text-green-500 text-center">Códigos copiados al portapapeles</p>
              )}
            </div>

            <button
              onClick={() => {
                handleClose();
                onSuccess();
              }}
              className="w-full py-3 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              Continuar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

