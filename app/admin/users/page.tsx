"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Shield, ShieldOff, UserX } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired } from "@/lib/auth";

type User = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado?: string;
};

const mockUsers: User[] = [
  { id: "1", nombre: "Ana Torres", email: "ana@example.com", rol: "admin", estado: "activo" },
  { id: "2", nombre: "Luis Pérez", email: "luis@example.com", rol: "ops", estado: "activo" },
  { id: "3", nombre: "Marta Díaz", email: "marta@example.com", rol: "support", estado: "suspendido" },
];

const ADMIN_MOCK = process.env.NEXT_PUBLIC_ADMIN_MOCK === "true";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const apiBase = useMemo(() => buildApiUrl("").replace(/\/+$/, ""), []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      if (ADMIN_MOCK) {
        setUsers(mockUsers);
        setLoading(false);
        return;
      }
      let token = getAccessToken();
      if (!token) {
        setError("No autenticado");
        setLoading(false);
        return;
      }
      if (isTokenExpired(token)) {
        const newToken = await refreshAccessToken();
        if (newToken) token = newToken;
      }
      try {
        const res = await fetch(`${apiBase}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) {
          throw new Error(payload?.error || payload?.message || "No se pudo cargar usuarios");
        }
        const data = payload.data || payload.users || [];
        setUsers(
          data.map((u: any) => ({
            id: u.id,
            nombre: u.nombre || u.name || "",
            email: u.email || "",
            rol: u.rol || u.role || "",
            estado: u.estado || u.status || "activo",
          }))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cargar usuarios";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [apiBase]);

  const filtered = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      u.rol.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Usuarios
          </p>
          <h1 className="text-2xl font-medium text-foreground">Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">
            Cambia roles y estados. (Acciones se activan cuando el backend esté listo)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent pl-9 pr-3 py-2 text-sm"
            placeholder="Buscar por nombre, email o rol"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/80 overflow-hidden">
        <div className="grid grid-cols-[2fr,2fr,1fr,1fr] bg-muted/30 px-4 py-2 text-xs text-muted-foreground uppercase tracking-[0.2em]">
          <span>Usuario</span>
          <span>Email</span>
          <span>Rol</span>
          <span>Estado</span>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Cargando usuarios...</div>
        ) : error ? (
          <div className="p-4 text-sm text-amber-700">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Sin resultados.</div>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[2fr,2fr,1fr,1fr] items-center px-4 py-3 border-t border-border/60 text-sm"
            >
              <div>
                <p className="text-foreground">{user.nombre || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">ID: {user.id}</p>
              </div>
              <p className="text-muted-foreground">{user.email}</p>
              <span className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
                {user.rol?.toLowerCase() === "admin" ? (
                  <Shield className="w-3 h-3" />
                ) : user.rol ? (
                  <ShieldOff className="w-3 h-3" />
                ) : (
                  <UserX className="w-3 h-3" />
                )}
                {user.rol || "sin rol"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {user.estado || "activo"}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
