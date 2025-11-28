"use client";

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  notify: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload: Toast = {
      id,
      variant: toast.variant || "info",
      duration: toast.duration || 3800,
      ...toast,
    };
    setToasts((prev) => [...prev, payload]);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration),
    );
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg backdrop-blur bg-background/90 ${
              toast.variant === "success"
                ? "border-emerald-500/40 text-emerald-700"
                : toast.variant === "error"
                ? "border-red-500/40 text-red-600"
                : "border-border text-foreground"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                <p className="text-sm">{toast.message}</p>
              </div>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-muted transition-colors"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
