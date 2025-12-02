# 📚 Documentación VioTech Pro

Bienvenido a la documentación del frontend de VioTech Pro. Esta documentación está organizada para facilitar el desarrollo y mantenimiento del proyecto.

## 🚀 Inicio Rápido

Si eres nuevo en el proyecto, comienza aquí:

1. **[README Principal](../README.md)** - Configuración inicial y primeros pasos
2. **[Arquitectura](./ARCHITECTURE.md)** - Arquitectura completa del frontend
3. **[Stack Tecnológico](./STACK_TECNOLOGICO_COMPLETO.md)** - Tecnologías utilizadas

## 📖 Documentación Principal

### Arquitectura y Desarrollo

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura completa del frontend
  - Stack tecnológico
  - Estructura del proyecto
  - Patrones de desarrollo (TanStack Query, Axios, etc.)
  - Autenticación y roles
  - Integraciones con backend
  - Design system

- **[STACK_TECNOLOGICO_COMPLETO.md](./STACK_TECNOLOGICO_COMPLETO.md)** - Stack tecnológico detallado
  - Todas las librerías y dependencias
  - Justificación de cada tecnología
  - Versiones y configuraciones

### Estrategia y Roadmap

- **[VIOTECH_ROADMAP_STRATEGICO_2025.md](./VIOTECH_ROADMAP_STRATEGICO_2025.md)** - Roadmap estratégico
  - Visión y objetivos
  - Análisis del estado actual
  - Plan de desarrollo 2025
  - Funcionalidades futuras

### Agentes de Desarrollo

- **[AGENTS.md](./AGENTS.md)** - Índice de agentes
- **[agents/orchestrator-agent.md](./agents/orchestrator-agent.md)** - Agente orquestador
- **[agents/frontend-agent.md](./agents/frontend-agent.md)** - Agente frontend
- **[agents/backend-agent.md](./agents/backend-agent.md)** - Agente backend (referencia)
- **[agents/devops-agent.md](./agents/devops-agent.md)** - Agente DevOps
- **[agents/qa-agent.md](./agents/qa-agent.md)** - Agente QA
- **[agents/ux-agent.md](./agents/ux-agent.md)** - Agente UX
- **[agents/data-ml-agent.md](./agents/data-ml-agent.md)** - Agente Data/ML
- **[agents/docs-agent.md](./agents/docs-agent.md)** - Agente documentación

## 🎯 Guías por Rol

### Desarrollador Nuevo

1. Lee el [README principal](../README.md)
2. Revisa [ARCHITECTURE.md](./ARCHITECTURE.md) - Sección "Arquitectura de Desarrollo"
3. Consulta [STACK_TECNOLOGICO_COMPLETO.md](./STACK_TECNOLOGICO_COMPLETO.md) para entender las tecnologías

### Desarrollador Senior

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura completa
2. [VIOTECH_ROADMAP_STRATEGICO_2025.md](./VIOTECH_ROADMAP_STRATEGICO_2025.md) - Estrategia y roadmap
3. [AGENTS.md](./AGENTS.md) - Agentes de desarrollo

### Product Manager / UX

1. [VIOTECH_ROADMAP_STRATEGICO_2025.md](./VIOTECH_ROADMAP_STRATEGICO_2025.md) - Roadmap y visión
2. [agents/ux-agent.md](./agents/ux-agent.md) - Guías de UX

### DevOps

1. [agents/devops-agent.md](./agents/devops-agent.md) - Guías de DevOps
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Sección "Variables de Entorno"

## 🔍 Búsqueda Rápida

### ¿Cómo hacer X?

- **Cargar datos del servidor**: [ARCHITECTURE.md](./ARCHITECTURE.md#caso-a-obtener-una-lista-de-datos-get)
- **Crear/actualizar datos**: [ARCHITECTURE.md](./ARCHITECTURE.md#caso-b-enviar-datos-postput)
- **Autenticación**: [ARCHITECTURE.md](./ARCHITECTURE.md#-autenticación-y-roles)
- **Integrar con backend**: [ARCHITECTURE.md](./ARCHITECTURE.md#-integraciones-backend)
- **Usar componentes UI**: [ARCHITECTURE.md](./ARCHITECTURE.md#-design-system)

### ¿Qué tecnología usar para Y?

- **HTTP Client**: Axios (`lib/apiClient.ts`) - [ARCHITECTURE.md](./ARCHITECTURE.md#los-3-mandamientos-del-código)
- **Estado del servidor**: TanStack Query - [ARCHITECTURE.md](./ARCHITECTURE.md#los-3-mandamientos-del-código)
- **Formularios**: React Hook Form + Zod - [STACK_TECNOLOGICO_COMPLETO.md](./STACK_TECNOLOGICO_COMPLETO.md)
- **Componentes UI**: Shadcn/UI - [ARCHITECTURE.md](./ARCHITECTURE.md#-design-system)

## 📝 Mantenimiento de Documentación

### Cuándo actualizar

- **ARCHITECTURE.md**: Cuando cambie la estructura del proyecto, stack tecnológico o patrones de desarrollo
- **STACK_TECNOLOGICO_COMPLETO.md**: Cuando se agregue o actualice una dependencia
- **VIOTECH_ROADMAP_STRATEGICO_2025.md**: Cuando cambien objetivos o estrategias
- **Agentes**: Cuando cambien las reglas o comportamientos de los agentes

### Cómo contribuir

1. Actualiza la documentación cuando hagas cambios relevantes
2. Mantén los ejemplos de código actualizados
3. Agrega enlaces cruzados cuando sea relevante
4. Usa formato Markdown consistente

## 🔗 Enlaces Útiles

- [Repositorio Backend](https://github.com/viotech/backend) - API REST
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación TanStack Query](https://tanstack.com/query/latest)
- [Shadcn/UI Components](https://ui.shadcn.com/)

---

**Última actualización**: Enero 2025


