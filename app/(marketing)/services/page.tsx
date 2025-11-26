"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Search,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, logout, refreshAccessToken, isTokenExpired } from "@/lib/auth";
import {
  fetchUserServices,
  type Service,
  calculateServiceProgress,
  getDaysUntilExpiration,
  formatPrice,
} from "@/lib/services";

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Fecha inválida";
  }
};

const getStatusColor = (estado: string) => {
  switch (estado) {
    case "activo":
      return "text-green-500 bg-green-500/10 border-green-500/20";
    case "expirado":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "pendiente":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    default:
      return "text-muted-foreground bg-muted/20 border-border";
  }
};

const getStatusLabel = (estado: string) => {
  switch (estado) {
    case "activo":
      return "Activo";
    case "expirado":
      return "Expirado";
    case "pendiente":
      return "Pendiente";
    default:
      return estado;
  }
};

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let token = getAccessToken();
      if (!token) {
        router.replace("/login?from=/services");
        return;
      }

      if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
        } else {
          await logout();
          router.replace("/login?from=/services&reason=token_expired");
          return;
        }
      }

      const data = await fetchUserServices();
      setServices(data);
    } catch (err: any) {
      console.error("Error fetching services:", err);
      setError(err.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filtrar servicios
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchQuery === "" ||
      service.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tipo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || service.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeServices = services.filter((s) => s.estado === "activo").length;
  const expiredServices = services.filter((s) => s.estado === "expirado").length;
  const pendingServices = services.filter((s) => s.estado === "pendiente").length;

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-muted-foreground">Cargando servicios...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-medium text-foreground">Mis Servicios</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiona tus servicios y licencias contratadas
              </p>
            </div>
          </div>
          <Link
            href="/services/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Comprar Servicio
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Total
            </p>
            <p className="text-2xl font-medium text-foreground">{services.length}</p>
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Activos
            </p>
            <p className="text-2xl font-medium text-green-500">{activeServices}</p>
          </div>
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Pendientes
            </p>
            <p className="text-2xl font-medium text-yellow-500">{pendingServices}</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Expirados
            </p>
            <p className="text-2xl font-medium text-red-500">{expiredServices}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterStatus === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus("activo")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterStatus === "activo"
                  ? "bg-green-500 text-white border-green-500"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus("pendiente")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterStatus === "pendiente"
                  ? "bg-yellow-500 text-white border-yellow-500"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterStatus("expirado")}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                filterStatus === "expirado"
                  ? "bg-red-500 text-white border-red-500"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              Expirados
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-500">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={fetchServices}
              className="ml-auto px-4 py-2 rounded-lg border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-border/70 bg-muted/20 p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {services.length === 0
                ? "No tienes servicios aún"
                : "No se encontraron servicios"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {services.length === 0
                ? "Comienza comprando tu primer servicio desde nuestro catálogo"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {services.length === 0 && (
              <Link
                href="/services/catalog"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Ver Catálogo de Servicios
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const progress = calculateServiceProgress(service);
              const daysLeft = getDaysUntilExpiration(service);
              const StatusIcon =
                service.estado === "activo"
                  ? CheckCircle2
                  : service.estado === "expirado"
                  ? XCircle
                  : Clock;

              return (
                <div
                  key={service.id}
                  className="rounded-2xl border border-border/70 bg-background/70 p-6 space-y-4 hover:border-border transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground mb-1">
                        {service.nombre}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {service.tipo}
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(
                        service.estado
                      )}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {getStatusLabel(service.estado)}
                    </div>
                  </div>

                  {/* Progress */}
                  {progress !== null && service.estado === "activo" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="text-foreground font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="space-y-2 text-sm">
                    {service.fecha_compra && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Comprado: {formatDate(service.fecha_compra)}</span>
                      </div>
                    )}
                    {service.fecha_expiracion && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          Expira: {formatDate(service.fecha_expiracion)}
                          {daysLeft !== null && daysLeft > 0 && (
                            <span className="ml-2 text-xs">
                              ({daysLeft} {daysLeft === 1 ? "día" : "días"} restantes)
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  {service.precio && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {formatPrice(service.precio, "COP")}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-border/50">
                    <button
                      onClick={() => {
                        // TODO: Abrir modal de detalles o página de detalles
                        console.log("Ver detalles de servicio:", service.id);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

