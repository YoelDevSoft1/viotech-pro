"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Token de recuperación no válido o faltante.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setError("Token de recuperación no válido.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo restablecer la contraseña.");
      }

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido al restablecer la contraseña.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <main className="min-h-screen bg-background px-6 py-24 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-24 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-medium text-foreground">
            Restablecer contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu nueva contraseña.
          </p>
        </div>

        {success ? (
          <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-8 space-y-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-foreground">
              Contraseña restablecida
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.
            </p>
          </div>
        ) : (
          <form className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
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
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Debe contener al menos una mayúscula, una minúscula y un número.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Confirmar contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
              disabled={loading || !token}
            >
              {loading ? "Restableciendo..." : "Restablecer contraseña"}
            </button>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background px-6 py-24 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

