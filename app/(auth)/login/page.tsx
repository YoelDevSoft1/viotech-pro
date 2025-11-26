"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Lock, X } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { saveTokens } from "@/lib/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);

  const getRedirectPath = () => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("from") || "/dashboard";
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    setLoginLoading(true);

    try {
      const response = await fetch(buildApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.data?.token) {
        throw new Error(data?.error || data?.message || "No se pudo iniciar sesión.");
      }

      const token: string = data.data.token;
      const refreshToken: string = data.data.refreshToken || "";
      const nombre: string = data.data.nombre || data.data.user?.nombre || "";

      saveTokens(token, refreshToken, nombre, rememberMe);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("authChanged", {
            detail: { isAuthenticated: true, userName: nombre },
          }),
        );
      }

      setLoginSuccess("Inicio de sesión exitoso. Redirigiendo...");
      setLoginPassword("");

      const redirectPath = getRedirectPath();
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = redirectPath;
        }
      }, 800);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido al iniciar sesión.";
      setLoginError(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);

    if (registerPassword.length < 8) {
      setRegisterError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Las contraseñas no coinciden.");
      return;
    }

    setRegisterLoading(true);
    try {
      const response = await fetch(buildApiUrl("/auth/registro"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo crear la cuenta.");
      }

      setRegisterSuccess(
        data?.message || "Cuenta creada. Inicia sesión con tus credenciales.",
      );
      setLoginEmail(registerEmail.trim());
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al registrar.";
      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange =
    (setter: (value: string) => void) =>
    (event: ChangeEvent<HTMLInputElement>) =>
      setter(event.target.value);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12 flex items-center">
      <div className="w-full max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1fr,1fr]">
        <section className="rounded-3xl border border-border/70 bg-muted/20 p-8 space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Acceso seguro
          </p>
          <h1 className="text-3xl font-medium text-foreground leading-tight">
            Inicia sesión para administrar tus proyectos y tickets.
          </h1>
          <p className="text-sm text-muted-foreground">
            Usa tu email y contraseña registrados. Si olvidaste tu acceso, recupera la
            contraseña o crea tu cuenta.
          </p>
          <div className="text-xs text-muted-foreground">
            <p>
              ¿Problemas? <Link href="/forgot-password" className="underline">Recuperar contraseña</Link>
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Iniciar sesión</p>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={loginEmail}
                onChange={handleInputChange(setLoginEmail)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 pr-24"
                  placeholder="********"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={handleInputChange(setLoginPassword)}
                />
                <button
                  type="button"
                  className="absolute inset-y-1.5 right-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-2" htmlFor="login-remember">
                <input
                  id="login-remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-foreground"
                />
                Recordarme
              </label>
              <Link href="/forgot-password" className="underline">
                Olvidé mi contraseña
              </Link>
            </div>

            {loginError && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                {loginError}
              </p>
            )}
            {loginSuccess && (
              <p className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-600">
                {loginSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
            >
              {loginLoading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="border-t border-border/60 pt-4 text-sm text-muted-foreground space-y-2">
            <p>¿Aún no tienes cuenta?</p>
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/40"
            >
              Crear cuenta
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Registro
                </p>
                <h4 className="text-2xl font-medium text-foreground">Crear cuenta</h4>
              </div>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                onClick={() => setShowRegisterModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="register-name"
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
                >
                  Nombre
                </label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  value={registerName}
                  onChange={handleInputChange(setRegisterName)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="register-email"
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
                >
                  Correo electrónico
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={handleInputChange(setRegisterEmail)}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="register-password"
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
                >
                  Contraseña
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={handleInputChange(setRegisterPassword)}
                />
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                  value={registerConfirmPassword}
                  onChange={handleInputChange(setRegisterConfirmPassword)}
                />
              </div>

              {registerError && (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                  {registerError}
                </p>
              )}
              {registerSuccess && (
                <p className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-600">
                  {registerSuccess}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
                >
                  {registerLoading ? "Creando..." : "Crear cuenta"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
