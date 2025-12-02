/**
 * Logger estructurado para VioTech Pro Frontend
 * 
 * Proporciona logging consistente con niveles, contexto y envío automático
 * de errores críticos al backend para centralización.
 */

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  organizationId?: string;
  route?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    // Determinar nivel de log según entorno
    const envLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info').toLowerCase() as LogLevel;
    const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    this.level = validLevels.includes(envLevel) ? envLevel : 'info';
    
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private async sendToBackend(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    // Solo enviar errores críticos (error y fatal) al backend
    if (level !== 'error' && level !== 'fatal') {
      return;
    }

    // Enviar a Sentry si está disponible (solo en el cliente)
    if (typeof window !== 'undefined' && (level === 'error' || level === 'fatal')) {
      try {
        // Intentar importar Sentry dinámicamente (solo si está instalado)
        // Usar dynamic import con tipo any para evitar errores de TypeScript si no está instalado
        const SentryModule = await import('@sentry/nextjs' as string).catch(() => null);
        if (SentryModule && typeof SentryModule === 'object' && 'captureException' in SentryModule) {
          const Sentry = SentryModule as any;
          if (error) {
            Sentry.captureException(error, {
              tags: {
                logger: true,
                level,
              },
              contexts: {
                logger: {
                  message,
                  context,
                },
              },
              level: level === 'fatal' ? 'fatal' : 'error',
            });
          } else {
            Sentry.captureMessage(message, {
              tags: {
                logger: true,
                level,
              },
              contexts: {
                logger: {
                  context,
                },
              },
              level: level === 'fatal' ? 'fatal' : 'error',
            });
          }
        }
      } catch {
        // Sentry no está disponible, continuar normalmente
      }
    }

    // Enviar al backend para centralización
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          context: {
            ...context,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          },
          error: error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Fallar silenciosamente si no se puede enviar el log
      });
    } catch {
      // Ignorar errores de red al enviar logs
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, context);

    // En desarrollo, usar console con colores
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' || level === 'fatal' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'debug' || level === 'trace' ? 'debug' : 
                           'log';
      console[consoleMethod](formattedMessage);
      if (error) {
        console.error(error);
      }
    } else {
      // En producción, usar console solo para errores críticos
      if (level === 'error' || level === 'fatal') {
        console.error(formattedMessage, error || '');
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      }
    }

    // Enviar errores críticos al backend
    if (level === 'error' || level === 'fatal') {
      this.sendToBackend(level, message, context, error);
    }
  }

  trace(message: string, context?: LogContext) {
    this.log('trace', message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('error', message, context, err);
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('fatal', message, context, err);
  }

  // Métodos de conveniencia para eventos comunes

  apiError(endpoint: string, method: string, status: number, message: string, context?: LogContext) {
    this.error(`API Error: ${method} ${endpoint} - ${status}`, undefined, {
      ...context,
      endpoint,
      method,
      status,
      apiError: true,
    });
  }

  authEvent(event: 'login' | 'logout' | 'token_refresh' | 'token_expired', userId?: string, context?: LogContext) {
    this.info(`Auth Event: ${event}`, {
      ...context,
      userId,
      authEvent: true,
    });
  }

  businessEvent(event: string, context?: LogContext) {
    this.info(`Business Event: ${event}`, {
      ...context,
      businessEvent: true,
    });
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Exportar tipos para uso en otros archivos
export type { LogLevel, LogContext };

