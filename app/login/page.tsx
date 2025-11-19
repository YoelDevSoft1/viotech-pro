"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Fingerprint,
  Chrome,
  Smartphone,
  X,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api";

const testimonials = [
  {
    quote:
      "El Command Center nos da visibilidad inmediata sobre roadmaps, riesgos y decisiones críticas.",
    author: "Laura Méndez",
    role: "COO · MedicExpress",
  },
];

const benefits = [
  { icon: ShieldCheck, label: "ISO 27001 ready" },
  { icon: Lock, label: "MFA + SSO" },
  { icon: Fingerprint, label: "Auditoría en vivo" },
];

const availability = [
  { metric: "99.95%", label: "SLA infraestructura" },
  { metric: "< 2 min", label: "Promedio resolución" },
];

const TOKEN_STORAGE_KEY = "viotech_token";
const USERNAME_STORAGE_KEY = "viotech_user_name";
const LEGACY_TOKEN_STORAGE_KEY = "authTokenVioTech";
const LEGACY_USERNAME_STORAGE_KEY = "userNameVioTech";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
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
      const nombre: string = data.data.nombre || data.data.user?.nombre || "";

      if (typeof window !== "undefined") {
        const preferredStorage = rememberMe ? window.localStorage : window.sessionStorage;
        const secondaryStorage = rememberMe ? window.sessionStorage : window.localStorage;

        preferredStorage.setItem(TOKEN_STORAGE_KEY, token);
        preferredStorage.setItem(USERNAME_STORAGE_KEY, nombre);

        secondaryStorage.removeItem(TOKEN_STORAGE_KEY);
        secondaryStorage.removeItem(USERNAME_STORAGE_KEY);

        window.localStorage.setItem(LEGACY_TOKEN_STORAGE_KEY, token);
        window.localStorage.setItem(LEGACY_USERNAME_STORAGE_KEY, nombre);

        window.dispatchEvent(
          new CustomEvent("authChanged", {
            detail: { isAuthenticated: true, userName: nombre },
          })
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
        data?.message || "Cuenta creada correctamente. Inicia sesión con tus credenciales."
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
    (event: ChangeEvent<HTMLInputElement>) => setter(event.target.value);

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        {/* Narrative panel */}
        <section className="rounded-3xl border border-border/70 bg-muted/30 p-10 space-y-10">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Portal ejecutivo
            </p>
            <h1 className="text-4xl font-medium text-foreground leading-tight">
              Controla tus proyectos, equipos y soporte desde un solo lugar.
            </h1>
            <p className="text-muted-foreground">
              Accede al Command Center de VioTech para dar seguimiento a
              roadmaps, aprobaciones, despliegues y KPIs compartidos con tu PM
              dedicado.
            </p>
          </div>

          <div className="space-y-6">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.author}
                className="rounded-2xl border border-border/70 bg-background/70 p-6 text-sm text-muted-foreground"
              >
                “{testimonial.quote}”
                <div className="mt-4 text-foreground">
                  {testimonial.author}
                  <span className="block text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {testimonial.role}
                  </span>
                </div>
              </blockquote>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {benefits.map((benefit) => (
              <div
                key={benefit.label}
                className="rounded-2xl border border-border/70 bg-background/60 p-4 flex items-center gap-3"
              >
                <benefit.icon className="w-4 h-4 text-foreground" />
                <span>{benefit.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/70 p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Aún no tienes acceso?
            </p>
            <Link
              href="https://calendly.com/viotech/demo"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              Agenda onboarding con nuestro equipo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Login form */}
        <section className="rounded-3xl border border-border/70 bg-background/80 p-10 space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-medium text-foreground">
              Inicia sesión
            </h2>
            <p className="text-sm text-muted-foreground">
              Accede con tus credenciales corporativas.
            </p>
          </div>

          <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 hover:scale-[1.02]">
            <Chrome className="w-4 h-4" />
            Iniciar sesión con Google Workspace
          </button>

          <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            o credenciales
          </p>

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                placeholder="nombre@empresa.com"
                value={loginEmail}
                onChange={handleInputChange(setLoginEmail)}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 pr-24"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={handleInputChange(setLoginPassword)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-1.5 right-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-border accent-foreground"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Recordarme
              </label>
              <a
                href="mailto:contacto@viotech.com.co"
                className="text-foreground hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {loginError && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                {loginError}
              </p>
            )}
            {loginSuccess && (
              <p className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-500">
                {loginSuccess}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
              disabled={loginLoading}
            >
              {loginLoading ? "Conectando..." : "Entrar al panel"}
            </button>
          </form>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-5 space-y-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 text-foreground">
              <Smartphone className="w-4 h-4" />
              MFA obligatorio
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {availability.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border/60 bg-background/70 p-3 text-center"
                >
                  <p className="text-xl font-medium text-foreground">
                    {item.metric}
                  </p>
                  <p className="uppercase tracking-[0.3em] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-background transition-all duration-200 hover:scale-[1.02]"
              onClick={() => setShowRegisterModal(true)}
            >
              Registrar cuenta
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-background p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Crear cuenta
                </p>
                <h4 className="text-2xl font-medium text-foreground">
                  Registra tu acceso al Command Center
                </h4>
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
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Nombre completo
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="Tu nombre"
                  value={registerName}
                  onChange={handleInputChange(setRegisterName)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="tucorreo@empresa.com"
                  value={registerEmail}
                  onChange={handleInputChange(setRegisterEmail)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={registerPasswordVisible ? "text" : "password"}
                    className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40 pr-24"
                    placeholder="Mínimo 8 caracteres"
                    value={registerPassword}
                    onChange={handleInputChange(setRegisterPassword)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-1.5 right-1.5 rounded-full border border-border px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setRegisterPasswordVisible((prev) => !prev)}
                  >
                    {registerPasswordVisible ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-border bg-transparent px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  placeholder="Repite tu contraseña"
                  value={registerConfirmPassword}
                  onChange={handleInputChange(setRegisterConfirmPassword)}
                  required
                />
              </div>
              {registerError && (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500">
                  {registerError}
                </p>
              )}
              {registerSuccess && (
                <p className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-xs text-green-500">
                  {registerSuccess}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
                disabled={registerLoading}
              >
                {registerLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>
            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                className="text-foreground underline"
                onClick={() => setShowRegisterModal(false)}
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
