# 📋 Guía Completa: Página de Recursos 100% Operativa

## 🎯 Objetivo

Implementar una página de recursos completamente funcional con todas las funcionalidades avanzadas del backend, incluyendo:
- Listado y filtrado de recursos
- Visualización de carga de trabajo
- Gestión de disponibilidad
- Calendario de recursos
- Gestión de vacaciones
- Skills y certificaciones
- Detección de conflictos

---

## 📊 Paso 1: Configurar API Client

### 1.1 Crear/Actualizar `lib/api/resources.ts`

```typescript
// lib/api/resources.ts
import { apiClient } from './client';

export interface Resource {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatar: string | null;
  role: string;
  organizationId: string | null;
  availability: {
    status: 'available' | 'busy' | 'unavailable' | 'on_leave';
    workingHours: {
      start: string; // "09:00"
      end: string; // "18:00"
      timezone: string; // "America/Bogota"
    };
    workingDays: number[]; // [1, 2, 3, 4, 5] (1=Lunes, 7=Domingo)
    vacations: Vacation[];
    customUnavailable: any[];
  };
  skills: Skill[];
  certifications: Certification[];
  currentWorkload: number; // Porcentaje 0-100
  maxWorkload: number; // Porcentaje 0-100
}

export interface Vacation {
  id: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  type: 'vacation' | 'sick_leave' | 'personal' | 'other';
  description: string | null;
  approved: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number | null;
  verified: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string; // ISO date
  expiryDate: string | null; // ISO date
  credentialId: string | null;
  credentialUrl: string | null;
  verified: boolean;
}

export interface WorkloadData {
  resourceId: string;
  resourceName: string;
  period: {
    start: string;
    end: string;
  };
  dailyWorkload: Array<{
    date: string; // "2025-01-13"
    hours: number;
    tasks: string[]; // IDs de tickets
    utilization: number; // Porcentaje 0-100
    availableHours: number;
  }>;
  totalHours: number;
  totalAvailableHours: number;
  averageUtilization: number;
  maxUtilization: number;
  conflicts: Array<{
    id: string;
    date: string;
    type: 'overallocation' | 'unavailable';
    severity: 'error' | 'warning';
    message: string;
    tasks: string[];
    suggestedResolution: string;
  }>;
}

export interface CalendarEvent {
  id: string;
  resourceId: string;
  resourceName: string;
  type: 'task' | 'vacation';
  title: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  color: string;
  taskId?: string;
  vacationId?: string;
  description: string | null;
}

// GET /api/resources - Listar recursos
export async function getResources(params?: {
  organizationId?: string;
  role?: string;
  availability?: string;
  skill?: string;
  search?: string;
}): Promise<Resource[]> {
  const queryParams = new URLSearchParams();
  if (params?.organizationId) queryParams.append('organizationId', params.organizationId);
  if (params?.role) queryParams.append('role', params.role);
  if (params?.availability) queryParams.append('availability', params.availability);
  if (params?.skill) queryParams.append('skill', params.skill);
  if (params?.search) queryParams.append('search', params.search);

  const response = await apiClient.get<{ success: boolean; data: Resource[] }>(
    `/resources?${queryParams.toString()}`
  );
  return response.data.data || [];
}

// GET /api/resources/:id - Obtener recurso específico
export async function getResource(id: string): Promise<Resource> {
  const response = await apiClient.get<{ success: boolean; data: Resource }>(
    `/resources/${id}`
  );
  return response.data.data;
}

// GET /api/resources/:id/workload - Obtener carga de trabajo
export async function getResourceWorkload(
  id: string,
  startDate: string,
  endDate: string
): Promise<WorkloadData> {
  const response = await apiClient.get<{ success: boolean; data: WorkloadData }>(
    `/resources/${id}/workload?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data.data;
}

// GET /api/resources/calendar - Obtener calendario
export async function getResourcesCalendar(
  resourceIds: string[],
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const response = await apiClient.get<{ success: boolean; data: CalendarEvent[] }>(
    `/resources/calendar?resourceIds=${resourceIds.join(',')}&startDate=${startDate}&endDate=${endDate}`
  );
  return response.data.data || [];
}

// POST /api/resources/:id/vacations - Crear vacación
export async function createVacation(
  resourceId: string,
  data: {
    startDate: string;
    endDate: string;
    type?: 'vacation' | 'sick_leave' | 'personal' | 'other';
    description?: string;
  }
): Promise<Vacation> {
  const response = await apiClient.post<{ success: boolean; data: Vacation }>(
    `/resources/${resourceId}/vacations`,
    data
  );
  return response.data.data;
}

// PUT /api/resources/:id/vacations/:vacationId - Actualizar vacación
export async function updateVacation(
  resourceId: string,
  vacationId: string,
  data: {
    startDate?: string;
    endDate?: string;
    type?: 'vacation' | 'sick_leave' | 'personal' | 'other';
    description?: string;
    approved?: boolean;
  }
): Promise<Vacation> {
  const response = await apiClient.put<{ success: boolean; data: Vacation }>(
    `/resources/${resourceId}/vacations/${vacationId}`,
    data
  );
  return response.data.data;
}

// DELETE /api/resources/:id/vacations/:vacationId - Eliminar vacación
export async function deleteVacation(
  resourceId: string,
  vacationId: string
): Promise<void> {
  await apiClient.delete(`/resources/${resourceId}/vacations/${vacationId}`);
}

// POST /api/resources/:id/skills - Agregar skill
export async function addSkill(
  resourceId: string,
  data: {
    name: string;
    category?: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }
): Promise<Skill> {
  const response = await apiClient.post<{ success: boolean; data: Skill }>(
    `/resources/${resourceId}/skills`,
    data
  );
  return response.data.data;
}

// POST /api/resources/:id/certifications - Agregar certificación
export async function addCertification(
  resourceId: string,
  data: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }
): Promise<Certification> {
  const response = await apiClient.post<{ success: boolean; data: Certification }>(
    `/resources/${resourceId}/certifications`,
    data
  );
  return response.data.data;
}

// PUT /api/resources/:id/availability - Actualizar disponibilidad
export async function updateAvailability(
  resourceId: string,
  data: {
    status?: 'available' | 'busy' | 'unavailable' | 'on_leave';
    workingHours?: {
      start: string;
      end: string;
      timezone?: string;
    };
    workingDays?: number[];
    maxWorkload?: number;
  }
): Promise<Resource['availability']> {
  const response = await apiClient.put<{ success: boolean; data: Resource['availability'] }>(
    `/resources/${resourceId}/availability`,
    data
  );
  return response.data.data;
}
```

---

## 🎣 Paso 2: Crear Custom Hooks

### 2.1 Crear `lib/hooks/useResources.ts`

**⚠️ Nota importante**: Este hook ya existe y ha sido actualizado con validación de `currentWorkload`. La implementación actual incluye:

- Validación de tipos para `currentWorkload` y `maxWorkload` (asegura que sean números válidos)
- Manejo de valores `null`/`undefined` del backend
- Validación en componentes que usan estos hooks (ver Paso 6 y siguientes)

```typescript
// lib/hooks/useResources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getResources,
  getResource,
  getResourceWorkload,
  getResourcesCalendar,
  createVacation,
  updateVacation,
  deleteVacation,
  addSkill,
  addCertification,
  updateAvailability,
  Resource,
  WorkloadData,
  CalendarEvent,
} from '@/lib/api/resources';

// Hook para listar recursos
export function useResources(params?: {
  organizationId?: string;
  role?: string;
  availability?: string;
  skill?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['resources', params],
    queryFn: () => getResources(params),
    staleTime: 30000, // 30 segundos
  });
}

// Hook para obtener un recurso específico
export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => getResource(id),
    enabled: !!id,
  });
}

// Hook para obtener carga de trabajo
export function useResourceWorkload(
  id: string,
  startDate: string,
  endDate: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['resource-workload', id, startDate, endDate],
    queryFn: () => getResourceWorkload(id, startDate, endDate),
    enabled: enabled && !!id && !!startDate && !!endDate,
    staleTime: 60000, // 1 minuto
  });
}

// Hook para obtener calendario
export function useResourcesCalendar(
  resourceIds: string[],
  startDate: string,
  endDate: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['resources-calendar', resourceIds, startDate, endDate],
    queryFn: () => getResourcesCalendar(resourceIds, startDate, endDate),
    enabled: enabled && resourceIds.length > 0 && !!startDate && !!endDate,
    staleTime: 60000, // 1 minuto
  });
}

// Hook para crear vacación
export function useCreateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: string; data: any }) =>
      createVacation(resourceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources-calendar'] });
    },
  });
}

// Hook para actualizar vacación
export function useUpdateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resourceId,
      vacationId,
      data,
    }: {
      resourceId: string;
      vacationId: string;
      data: any;
    }) => updateVacation(resourceId, vacationId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources-calendar'] });
    },
  });
}

// Hook para eliminar vacación
export function useDeleteVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, vacationId }: { resourceId: string; vacationId: string }) =>
      deleteVacation(resourceId, vacationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources-calendar'] });
    },
  });
}

// Hook para agregar skill
export function useAddSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: string; data: any }) =>
      addSkill(resourceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// Hook para agregar certificación
export function useAddCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: string; data: any }) =>
      addCertification(resourceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// Hook para actualizar disponibilidad
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: string; data: any }) =>
      updateAvailability(resourceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resource-workload'] });
    },
  });
}
```

---

## 🎨 Paso 3: Componente Principal de Listado

### 3.1 Crear `components/resources/ResourcesList.tsx`

```typescript
// components/resources/ResourcesList.tsx
'use client';

import { useState } from 'react';
import { useResources } from '@/lib/hooks/useResources';
import { Resource } from '@/lib/api/resources';
import { ResourceCard } from './ResourceCard';
import { ResourceFilters } from './ResourceFilters';
import { ResourceWorkloadChart } from './ResourceWorkloadChart';

export function ResourcesList() {
  const [filters, setFilters] = useState({
    organizationId: undefined as string | undefined,
    role: undefined as string | undefined,
    availability: undefined as string | undefined,
    skill: undefined as string | undefined,
    search: undefined as string | undefined,
  });

  const { data: resources, isLoading, error } = useResources(filters);

  if (isLoading) {
    return <div>Cargando recursos...</div>;
  }

  if (error) {
    return <div>Error al cargar recursos: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recursos</h1>
        <div className="text-sm text-muted-foreground">
          {resources?.length || 0} recursos encontrados
        </div>
      </div>

      <ResourceFilters filters={filters} onFiltersChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources?.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {resources?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron recursos con los filtros aplicados
        </div>
      )}
    </div>
  );
}
```

---

## 🎴 Paso 4: Componente de Tarjeta de Recurso

### 4.1 Crear `components/resources/ResourceCard.tsx`

```typescript
// components/resources/ResourceCard.tsx
'use client';

import { Resource } from '@/lib/api/resources';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'destructive';
    if (workload >= 70) return 'warning';
    return 'default';
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'unavailable':
        return 'bg-red-500';
      case 'on_leave':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={resource.avatar || undefined} />
              <AvatarFallback>
                {resource.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                <Link
                  href={`/resources/${resource.id}`}
                  className="hover:underline"
                >
                  {resource.userName}
                </Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{resource.userEmail}</p>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${getAvailabilityColor(
              resource.availability.status
            )}`}
            title={resource.availability.status}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline">{resource.role}</Badge>
          {resource.skills.slice(0, 3).map((skill) => (
            <Badge key={skill.id} variant="secondary" className="text-xs">
              {skill.name}
            </Badge>
          ))}
          {resource.skills.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{resource.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Carga de trabajo</span>
            <span className={`font-semibold ${
              resource.currentWorkload >= 90
                ? 'text-red-600'
                : resource.currentWorkload >= 70
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}>
              {resource.currentWorkload.toFixed(1)}%
            </span>
          </div>
          <Progress
            value={resource.currentWorkload}
            className="h-2"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <div>
            Horario: {resource.availability.workingHours.start} -{' '}
            {resource.availability.workingHours.end}
          </div>
          <div>
            Días: {resource.availability.workingDays.length} días laborales
          </div>
          {resource.availability.vacations.length > 0 && (
            <div className="text-orange-600">
              {resource.availability.vacations.length} vacación(es) programada(s)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔍 Paso 5: Componente de Filtros

### 5.1 Crear `components/resources/ResourceFilters.tsx`

```typescript
// components/resources/ResourceFilters.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ResourceFiltersProps {
  filters: {
    organizationId?: string;
    role?: string;
    availability?: string;
    skill?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ResourceFilters({ filters, onFiltersChange }: ResourceFiltersProps) {
  const updateFilter = (key: string, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted rounded-lg">
      <div>
        <Label htmlFor="search">Buscar</Label>
        <Input
          id="search"
          placeholder="Nombre o email..."
          value={filters.search || ''}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="role">Rol</Label>
        <Select
          value={filters.role || ''}
          onValueChange={(value) => updateFilter('role', value)}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Todos los roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los roles</SelectItem>
            <SelectItem value="agente">Agente</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="interno">Interno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="availability">Disponibilidad</Label>
        <Select
          value={filters.availability || ''}
          onValueChange={(value) => updateFilter('availability', value)}
        >
          <SelectTrigger id="availability">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="busy">Ocupado</SelectItem>
            <SelectItem value="unavailable">No disponible</SelectItem>
            <SelectItem value="on_leave">En licencia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="skill">Skill</Label>
        <Input
          id="skill"
          placeholder="Buscar por skill..."
          value={filters.skill || ''}
          onChange={(e) => updateFilter('skill', e.target.value)}
        />
      </div>

      <div className="flex items-end">
        <button
          onClick={() => onFiltersChange({})}
          className="w-full px-4 py-2 text-sm border rounded-md hover:bg-muted"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
```

---

## 📊 Paso 6: Componente de Detalle de Recurso

### 6.1 Crear `components/resources/ResourceDetail.tsx`

```typescript
// components/resources/ResourceDetail.tsx
'use client';

import { useResource, useResourceWorkload } from '@/lib/hooks/useResources';
import { ResourceWorkloadChart } from './ResourceWorkloadChart';
import { ResourceAvailabilityForm } from './ResourceAvailabilityForm';
import { ResourceVacationsList } from './ResourceVacationsList';
import { ResourceSkillsList } from './ResourceSkillsList';
import { ResourceCertificationsList } from './ResourceCertificationsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface ResourceDetailProps {
  resourceId: string;
}

export function ResourceDetail({ resourceId }: ResourceDetailProps) {
  const { data: resource, isLoading } = useResource(resourceId);

  // Calcular fechas para la semana actual
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

  const { data: workloadData } = useResourceWorkload(
    resourceId,
    startOfWeek.toISOString().split('T')[0],
    endOfWeek.toISOString().split('T')[0],
    !!resource
  );

  if (isLoading) {
    return <div>Cargando recurso...</div>;
  }

  if (!resource) {
    return <div>Recurso no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={resource.avatar || undefined} />
              <AvatarFallback className="text-xl">
                {resource.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{resource.userName}</CardTitle>
              <p className="text-muted-foreground">{resource.userEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{resource.role}</Badge>
                <Badge
                  variant={
                    resource.availability.status === 'available'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {resource.availability.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Carga de trabajo</div>
              <div className="text-2xl font-bold">
                {resource.currentWorkload.toFixed(1)}%
              </div>
              <Progress
                value={resource.currentWorkload}
                className="w-32 mt-2"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="workload" className="w-full">
        <TabsList>
          <TabsTrigger value="workload">Carga de Trabajo</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="vacations">Vacaciones</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="workload">
          <ResourceWorkloadChart
            resourceId={resourceId}
            workloadData={workloadData}
          />
        </TabsContent>

        <TabsContent value="availability">
          <ResourceAvailabilityForm resource={resource} />
        </TabsContent>

        <TabsContent value="vacations">
          <ResourceVacationsList resourceId={resourceId} />
        </TabsContent>

        <TabsContent value="skills">
          <ResourceSkillsList resourceId={resourceId} />
        </TabsContent>

        <TabsContent value="certifications">
          <ResourceCertificationsList resourceId={resourceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 📈 Paso 7: Componente de Gráfico de Carga de Trabajo

### 7.1 Crear `components/resources/ResourceWorkloadChart.tsx`

**⚠️ Nota importante**: El componente `ResourceWorkload.tsx` ya existe y ha sido actualizado con validación de `currentWorkload`. La implementación actual incluye:

- Validación de `currentWorkload` contra datos reales de workload
- Corrección automática cuando no hay tareas asignadas (fuerza a 0%)
- Manejo de estados de carga para evitar mostrar valores incorrectos temporalmente

```typescript
// components/resources/ResourceWorkloadChart.tsx
'use client';

import { WorkloadData } from '@/lib/api/resources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

interface ResourceWorkloadChartProps {
  resourceId: string;
  workloadData?: WorkloadData;
}

export function ResourceWorkloadChart({
  resourceId,
  workloadData,
}: ResourceWorkloadChartProps) {
  if (!workloadData) {
    return <div>Cargando datos de carga de trabajo...</div>;
  }

  const chartData = workloadData.dailyWorkload.map((day) => ({
    date: format(new Date(day.date), 'dd/MM'),
    hours: day.hours,
    available: day.availableHours,
    utilization: day.utilization,
  }));

  const getBarColor = (utilization: number) => {
    if (utilization >= 90) return '#ef4444'; // red
    if (utilization >= 70) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workloadData.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              de {workloadData.totalAvailableHours.toFixed(1)}h disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilización Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workloadData.averageUtilization.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilización Máxima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workloadData.maxUtilization.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conflictos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workloadData.conflicts.length}</div>
          </CardContent>
        </Card>
      </div>

      {workloadData.conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Conflictos detectados</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 mt-2">
              {workloadData.conflicts.map((conflict) => (
                <li key={conflict.id}>
                  <strong>{conflict.date}:</strong> {conflict.message}
                  {conflict.suggestedResolution && (
                    <span className="block text-sm mt-1">
                      💡 {conflict.suggestedResolution}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Carga Diaria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilization" name="Utilización (%)">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.utilization)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ⚙️ Paso 8: Componente de Gestión de Disponibilidad

### 8.1 Crear `components/resources/ResourceAvailabilityForm.tsx`

```typescript
// components/resources/ResourceAvailabilityForm.tsx
'use client';

import { useState } from 'react';
import { Resource, updateAvailability } from '@/lib/api/resources';
import { useUpdateAvailability } from '@/lib/hooks/useResources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface ResourceAvailabilityFormProps {
  resource: Resource;
}

export function ResourceAvailabilityForm({ resource }: ResourceAvailabilityFormProps) {
  const { toast } = useToast();
  const updateAvailabilityMutation = useUpdateAvailability();

  const [formData, setFormData] = useState({
    status: resource.availability.status,
    workingHours: {
      start: resource.availability.workingHours.start,
      end: resource.availability.workingHours.end,
      timezone: resource.availability.workingHours.timezone,
    },
    workingDays: resource.availability.workingDays,
    maxWorkload: resource.maxWorkload,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAvailabilityMutation.mutateAsync({
        resourceId: resource.id,
        data: formData,
      });
      toast({
        title: 'Disponibilidad actualizada',
        description: 'La disponibilidad del recurso se ha actualizado correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la disponibilidad',
        variant: 'destructive',
      });
    }
  };

  const toggleWorkingDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const daysOfWeek = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Disponibilidad</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="busy">Ocupado</SelectItem>
                <SelectItem value="unavailable">No disponible</SelectItem>
                <SelectItem value="on_leave">En licencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Hora de inicio</Label>
              <Input
                id="start"
                type="time"
                value={formData.workingHours.start}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="end">Hora de fin</Label>
              <Input
                id="end"
                type="time"
                value={formData.workingHours.end}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div>
            <Label>Días laborales</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.workingDays.includes(day.value)}
                    onCheckedChange={() => toggleWorkingDay(day.value)}
                  />
                  <Label
                    htmlFor={`day-${day.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="maxWorkload">Carga máxima (%)</Label>
            <Input
              id="maxWorkload"
              type="number"
              min="0"
              max="100"
              value={formData.maxWorkload}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxWorkload: parseInt(e.target.value) || 100,
                }))
              }
            />
          </div>

          <Button
            type="submit"
            disabled={updateAvailabilityMutation.isPending}
          >
            {updateAvailabilityMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## 🏖️ Paso 9: Componente de Gestión de Vacaciones

### 9.1 Crear `components/resources/ResourceVacationsList.tsx`

```typescript
// components/resources/ResourceVacationsList.tsx
'use client';

import { useState } from 'react';
import { useResource } from '@/lib/hooks/useResources';
import { useCreateVacation, useUpdateVacation, useDeleteVacation } from '@/lib/hooks/useResources';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceVacationsListProps {
  resourceId: string;
}

export function ResourceVacationsList({ resourceId }: ResourceVacationsListProps) {
  const { data: resource } = useResource(resourceId);
  const { toast } = useToast();
  const createVacation = useCreateVacation();
  const updateVacation = useUpdateVacation();
  const deleteVacation = useDeleteVacation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVacation, setEditingVacation] = useState<any>(null);

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation' as 'vacation' | 'sick_leave' | 'personal' | 'other',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVacation) {
        await updateVacation.mutateAsync({
          resourceId,
          vacationId: editingVacation.id,
          data: formData,
        });
        toast({
          title: 'Vacación actualizada',
          description: 'La vacación se ha actualizado correctamente.',
        });
      } else {
        await createVacation.mutateAsync({
          resourceId,
          data: formData,
        });
        toast({
          title: 'Vacación creada',
          description: 'La vacación se ha creado correctamente.',
        });
      }
      setIsDialogOpen(false);
      setEditingVacation(null);
      setFormData({
        startDate: '',
        endDate: '',
        type: 'vacation',
        description: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar la vacación',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (vacationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta vacación?')) return;
    try {
      await deleteVacation.mutateAsync({ resourceId, vacationId });
      toast({
        title: 'Vacación eliminada',
        description: 'La vacación se ha eliminado correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la vacación',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (vacation: any) => {
    setEditingVacation(vacation);
    setFormData({
      startDate: vacation.startDate.split('T')[0],
      endDate: vacation.endDate.split('T')[0],
      type: vacation.type,
      description: vacation.description || '',
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vacaciones</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingVacation(null);
              setFormData({
                startDate: '',
                endDate: '',
                type: 'vacation',
                description: '',
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar vacación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVacation ? 'Editar vacación' : 'Nueva vacación'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="sick_leave">Licencia médica</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingVacation ? 'Actualizar' : 'Crear'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {resource?.availability.vacations.map((vacation) => (
          <Card key={vacation.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={vacation.approved ? 'default' : 'secondary'}>
                    {vacation.type}
                  </Badge>
                  {vacation.approved && (
                    <Badge variant="outline">Aprobada</Badge>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  {format(new Date(vacation.startDate), 'dd/MM/yyyy')} -{' '}
                  {format(new Date(vacation.endDate), 'dd/MM/yyyy')}
                </div>
                {vacation.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {vacation.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(vacation)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(vacation.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {resource?.availability.vacations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay vacaciones programadas
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Paso 10: Componentes de Skills y Certificaciones

### 10.1 Crear `components/resources/ResourceSkillsList.tsx`

```typescript
// components/resources/ResourceSkillsList.tsx
'use client';

import { useState } from 'react';
import { useResource } from '@/lib/hooks/useResources';
import { useAddSkill } from '@/lib/hooks/useResources';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResourceSkillsListProps {
  resourceId: string;
}

export function ResourceSkillsList({ resourceId }: ResourceSkillsListProps) {
  const { data: resource } = useResource(resourceId);
  const { toast } = useToast();
  const addSkill = useAddSkill();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    yearsOfExperience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSkill.mutateAsync({
        resourceId,
        data: {
          name: formData.name,
          category: formData.category || undefined,
          level: formData.level,
          yearsOfExperience: formData.yearsOfExperience
            ? parseInt(formData.yearsOfExperience)
            : undefined,
        },
      });
      toast({
        title: 'Skill agregado',
        description: 'El skill se ha agregado correctamente.',
      });
      setIsDialogOpen(false);
      setFormData({
        name: '',
        category: '',
        level: 'beginner',
        yearsOfExperience: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar el skill',
        variant: 'destructive',
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-500';
      case 'advanced':
        return 'bg-blue-500';
      case 'intermediate':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo skill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="level">Nivel</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, level: value }))
                  }
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                    <SelectItem value="expert">Experto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">Años de experiencia</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Agregar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resource?.skills.map((skill) => (
          <Card key={skill.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{skill.name}</div>
                  {skill.category && (
                    <div className="text-sm text-muted-foreground">{skill.category}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={getLevelColor(skill.level)}
                      variant="default"
                    >
                      {skill.level}
                    </Badge>
                    {skill.yearsOfExperience && (
                      <span className="text-sm text-muted-foreground">
                        {skill.yearsOfExperience} años
                      </span>
                    )}
                  </div>
                </div>
                {skill.verified && (
                  <Badge variant="outline">Verificado</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {resource?.skills.length === 0 && (
          <div className="text-center py-8 text-muted-foreground col-span-2">
            No hay skills registrados
          </div>
        )}
      </div>
    </div>
  );
}
```

### 10.2 Crear `components/resources/ResourceCertificationsList.tsx`

```typescript
// components/resources/ResourceCertificationsList.tsx
'use client';

import { useState } from 'react';
import { useResource } from '@/lib/hooks/useResources';
import { useAddCertification } from '@/lib/hooks/useResources';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ResourceCertificationsListProps {
  resourceId: string;
}

export function ResourceCertificationsList({ resourceId }: ResourceCertificationsListProps) {
  const { data: resource } = useResource(resourceId);
  const { toast } = useToast();
  const addCertification = useAddCertification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCertification.mutateAsync({
        resourceId,
        data: {
          name: formData.name,
          issuer: formData.issuer,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate || undefined,
          credentialId: formData.credentialId || undefined,
          credentialUrl: formData.credentialUrl || undefined,
        },
      });
      toast({
        title: 'Certificación agregada',
        description: 'La certificación se ha agregado correctamente.',
      });
      setIsDialogOpen(false);
      setFormData({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar la certificación',
        variant: 'destructive',
      });
    }
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certificaciones</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar certificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva certificación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="issuer">Emisor</Label>
                <Input
                  id="issuer"
                  value={formData.issuer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, issuer: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Fecha de emisión</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, issueDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Fecha de expiración (opcional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="credentialId">ID de credencial (opcional)</Label>
                <Input
                  id="credentialId"
                  value={formData.credentialId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, credentialId: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="credentialUrl">URL de credencial (opcional)</Label>
                <Input
                  id="credentialUrl"
                  type="url"
                  value={formData.credentialUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, credentialUrl: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Agregar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resource?.certifications.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                  <div className="text-sm mt-2">
                    Emitida: {format(new Date(cert.issueDate), 'dd/MM/yyyy')}
                  </div>
                  {cert.expiryDate && (
                    <div
                      className={`text-sm mt-1 ${
                        isExpired(cert.expiryDate) ? 'text-red-600' : 'text-muted-foreground'
                      }`}
                    >
                      Expira: {format(new Date(cert.expiryDate), 'dd/MM/yyyy')}
                      {isExpired(cert.expiryDate) && (
                        <Badge variant="destructive" className="ml-2">
                          Expirada
                        </Badge>
                      )}
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {cert.credentialId}
                    </div>
                  )}
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      Ver credencial
                    </a>
                  )}
                </div>
                {cert.verified && (
                  <Badge variant="outline">Verificada</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {resource?.certifications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground col-span-2">
            No hay certificaciones registradas
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📅 Paso 11: Componente de Calendario

### 11.1 Crear `components/resources/ResourcesCalendar.tsx`

```typescript
// components/resources/ResourcesCalendar.tsx
'use client';

import { useState } from 'react';
import { useResourcesCalendar } from '@/lib/hooks/useResources';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ResourcesCalendarProps {
  resourceIds: string[];
  startDate: Date;
  endDate: Date;
}

export function ResourcesCalendar({
  resourceIds,
  startDate,
  endDate,
}: ResourcesCalendarProps) {
  const { data: events, isLoading } = useResourcesCalendar(
    resourceIds,
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0],
    resourceIds.length > 0
  );

  if (isLoading) {
    return <div>Cargando calendario...</div>;
  }

  // Agrupar eventos por fecha
  const eventsByDate = new Map<string, typeof events>();
  events?.forEach((event) => {
    const date = event.start.split('T')[0];
    if (!eventsByDate.has(date)) {
      eventsByDate.set(date, []);
    }
    eventsByDate.get(date)!.push(event);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Recursos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from(eventsByDate.entries()).map(([date, dayEvents]) => (
            <div key={date} className="border-b pb-4">
              <div className="font-semibold mb-2">
                {format(new Date(date), 'dd/MM/yyyy')}
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 p-2 rounded"
                    style={{ backgroundColor: `${event.color}20` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.resourceName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.start), 'HH:mm')} -{' '}
                        {format(new Date(event.end), 'HH:mm')}
                      </div>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {events?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay eventos en este período
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Paso 12: Página Principal

### 12.1 Crear `app/resources/page.tsx`

```typescript
// app/resources/page.tsx
import { ResourcesList } from '@/components/resources/ResourcesList';

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-6">
      <ResourcesList />
    </div>
  );
}
```

### 12.2 Crear `app/resources/[id]/page.tsx`

```typescript
// app/resources/[id]/page.tsx
import { ResourceDetail } from '@/components/resources/ResourceDetail';

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <ResourceDetail resourceId={params.id} />
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

### Backend (Ya está listo ✅)
- [x] Endpoints de recursos implementados
- [x] Cálculo de carga de trabajo corregido
- [x] Gestión de disponibilidad
- [x] Gestión de vacaciones
- [x] Gestión de skills y certificaciones
- [x] Calendario de recursos

### Frontend (Estado actual)
- [x] Crear `lib/hooks/useResources.ts` con todos los hooks ✅ (con validación de `currentWorkload`)
- [x] Crear `lib/api/resources.ts` con funciones API centralizadas ✅
- [x] Crear componente `ResourceWorkload.tsx` ✅ (con validación de `currentWorkload`)
- [x] Crear componente `ResourceSelector.tsx` ✅ (con validación de `currentWorkload`)
- [x] Crear componente `ResourceCalendar.tsx` ✅
- [x] Crear componente `ResourcesList.tsx` ✅
- [x] Crear componente `ResourceCard.tsx` ✅
- [x] Crear componente `ResourceFilters.tsx` ✅
- [x] Crear componente `ResourceDetail.tsx` ✅
- [x] Crear componente `ResourceAvailability.tsx` ✅ (disponibilidad y vacaciones)
- [x] Crear componente `ResourceSkills.tsx` ✅ (skills y certificaciones)
- [x] Crear página `app/(ops-internal)/internal/resources/page.tsx` ✅
- [x] Crear página `app/(ops-internal)/internal/resources/[id]/page.tsx` ✅
- [x] Agregar traducciones en es.json, en.json, pt.json ✅
- [x] Barrel export `components/resources/index.ts` ✅
- [x] Validación de `currentWorkload` implementada ✅
- [ ] Pruebas end-to-end (opcional)

---

## 📦 Dependencias Necesarias

```bash
npm install recharts date-fns
```

---

## 🚀 Próximos Pasos

1. **Implementar API Client y Hooks** (Paso 1-2)
2. **Implementar Componentes Básicos** (Paso 3-5)
3. **Implementar Componentes Avanzados** (Paso 6-11)
4. **Crear Páginas** (Paso 12)
5. **Probar y Ajustar** (Testing)

---

## 🐛 Problema Conocido: `currentWorkload` Incorrecto

### Descripción del Problema

Los recursos que **NO tienen tareas asignadas** están mostrando un porcentaje de carga de trabajo incorrecto (ej: 28%) en lugar de mostrar **0%**.

### Causa

El backend retorna `currentWorkload > 0` en los endpoints:
- `GET /api/resources` 
- `GET /api/resources/:id`

Cuando el recurso no tiene tareas asignadas.

### Solución Implementada en Frontend

Se ha implementado validación en múltiples capas:

1. **`lib/hooks/useResources.ts`** (líneas 52-53, 89-90):
   - Validación de tipos para asegurar que `currentWorkload` sea un número válido
   - Manejo de valores `null`/`undefined` del backend

2. **`components/resources/ResourceWorkload.tsx`** (líneas 82-123):
   - Validación de `currentWorkload` contra datos reales de `GET /api/resources/:id/workload`
   - Si `totalHours = 0` y no hay tareas en `dailyWorkload`, fuerza `currentWorkload` a 0
   - Muestra 0% mientras carga el workload para evitar mostrar valores incorrectos

3. **`components/resources/ResourceSelector.tsx`** (líneas 66-84):
   - Misma validación aplicada para consistencia en todos los componentes

### Lógica de Validación

```typescript
// Pseudocódigo de la validación implementada
const validatedCurrentWorkload = useMemo(() => {
  if (!selectedResourceData) return 0;
  
  const backendWorkload = selectedResourceData.currentWorkload || 0;
  
  // Si tenemos datos de workload, validar contra ellos (fuente de verdad)
  if (workload) {
    const hasTasks = workload.totalHours > 0 || 
      workload.dailyWorkload.some(day => day.tasks && day.tasks.length > 0);
    
    // Si no hay tareas, el currentWorkload debe ser 0
    if (!hasTasks) {
      return 0; // Corregir valor incorrecto del backend
    }
    
    // Si hay tareas, usar el valor calculado del workload
    const calculatedWorkload = workload.averageUtilization || workload.maxUtilization || 0;
    return Math.min(calculatedWorkload, selectedResourceData.maxWorkload || 100);
  }
  
  // Si está cargando, mostrar 0 temporalmente
  if (workloadLoading) {
    return 0;
  }
  
  // Último recurso: usar el valor del backend pero validar
  return Math.max(0, backendWorkload);
}, [selectedResourceData, workload, workloadLoading]);
```

### Solución Permanente Requerida en Backend

Ver documento completo: `docs/BACKEND_ISSUE_RESOURCE_WORKLOAD.md`

**Resumen de lo que necesita el backend:**
- Calcular `currentWorkload` basándose en tareas asignadas reales
- Si no hay tareas asignadas, `currentWorkload` debe ser exactamente `0`
- Sincronizar `currentWorkload` con los datos de `GET /api/resources/:id/workload`

---

## 📝 Notas Importantes

1. **Carga de Trabajo**: 
   - El backend ahora calcula correctamente la carga basándose en horas reales. Si un ticket no tiene `estimatedDuration`, no cuenta para la carga (0%).
   - **⚠️ Problema conocido**: El backend puede retornar `currentWorkload > 0` cuando no hay tareas asignadas (ej: 28%). 
   - **✅ Solución implementada en frontend**: Se ha agregado validación en `components/resources/ResourceWorkload.tsx` y `components/resources/ResourceSelector.tsx` que:
     - Valida `currentWorkload` contra los datos reales de `GET /api/resources/:id/workload`
     - Si `totalHours = 0` y no hay tareas en `dailyWorkload`, fuerza `currentWorkload` a 0
     - Muestra 0% mientras carga el workload para evitar mostrar valores incorrectos
   - **📋 Ver**: `docs/BACKEND_ISSUE_RESOURCE_WORKLOAD.md` para detalles del problema y solución permanente requerida en backend.

2. **Permisos**: Solo agentes/admins pueden modificar disponibilidad, vacaciones, skills y certificaciones de otros recursos. Los usuarios pueden modificar solo sus propios datos.

3. **Validación**: 
   - El backend valida todos los datos antes de guardarlos. El frontend debe mostrar errores apropiados.
   - El frontend valida `currentWorkload` contra datos de workload para corregir valores incorrectos del backend.

4. **Cache**: Los hooks usan React Query para cachear datos. Los datos se invalidan automáticamente después de mutaciones.

---

## 🐛 Problemas Conocidos y Soluciones

### Problema: `currentWorkload` Incorrecto

**Síntoma**: Recursos sin tareas asignadas muestran un porcentaje de carga de trabajo incorrecto (ej: 28% en lugar de 0%).

**Causa**: El backend retorna `currentWorkload > 0` en `GET /api/resources` y `GET /api/resources/:id` cuando no hay tareas asignadas.

**Solución Temporal (Frontend)**:
- Validación implementada en `lib/hooks/useResources.ts` (líneas 52-53, 89-90)
- Validación en `components/resources/ResourceWorkload.tsx` (líneas 82-123)
- Validación en `components/resources/ResourceSelector.tsx` (líneas 66-84)

**Solución Permanente (Backend)**:
- Ver `docs/BACKEND_ISSUE_RESOURCE_WORKLOAD.md` para detalles completos
- El backend debe calcular `currentWorkload` basándose en tareas asignadas reales
- Si no hay tareas asignadas, `currentWorkload` debe ser exactamente `0`

---

**¿Listo para implementar? ¡Empecemos paso a paso!** 🚀

