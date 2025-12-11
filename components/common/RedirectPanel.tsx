"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Shield } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";

interface RedirectPanelProps {
  redirectTo: string;
  delay?: number; // Tiempo en ms antes de redirigir (default: 3500)
  className?: string;
}

export function RedirectPanel({ redirectTo, delay = 3500, className }: RedirectPanelProps) {
  const router = useRouter();
  const t = useTranslationsSafe("marketing.redirect");
  const [countdown, setCountdown] = useState(Math.ceil(delay / 1000));

  useEffect(() => {
    // Countdown visual
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirección después del delay
    const redirectTimer = setTimeout(() => {
      router.push(redirectTo);
    }, delay);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(redirectTimer);
    };
  }, [redirectTo, delay, router]);

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-2xl p-8 md:p-10 text-center space-y-6 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          {/* Icon with animation */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-10 h-10 text-primary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-3xl font-bold text-foreground relative z-10"
          >
            {t("title")}
          </motion.h1>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed relative z-10"
          >
            {t("message")}
          </motion.p>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-muted/50 border border-border/50 rounded-lg p-4 space-y-2 relative z-10"
          >
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>{t("info")}</span>
            </div>
          </motion.div>

          {/* Countdown and redirect indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground relative z-10"
          >
            <ArrowRight className="w-4 h-4 animate-pulse" />
            <span>
              {t("redirecting")} {countdown > 0 && `(${countdown}s)`}
            </span>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: delay / 1000, ease: "linear" }}
            className="h-1 bg-primary/20 rounded-full overflow-hidden relative z-10"
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: delay / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

