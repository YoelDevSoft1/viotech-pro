"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo procesar la solicitud.");
      }

      setSuccess(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido al procesar la solicitud.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-24 flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-medium text-foreground">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {success ? (
          <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-8 space-y-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
              <Mail className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-foreground">
              Email enviado
            </h2>
            <p className="text-sm text-muted-foreground">
              Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
              Revisa tu bandeja de entrada y spam.
            </p>
            <p className="text-xs text-muted-foreground">
              El enlace expirará en 60 minutos.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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

