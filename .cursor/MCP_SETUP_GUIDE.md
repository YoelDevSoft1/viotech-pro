# 🚀 Guía de Configuración MCP (Model Context Protocol)

Esta guía te ayudará a configurar completamente el stack MCP gratuito en Cursor para desarrollo autónomo.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Servidores MCP](#configuración-de-servidores-mcp)
3. [Obtención de API Keys](#obtención-de-api-keys)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Verificación y Troubleshooting](#verificación-y-troubleshooting)

---

## 🔧 Requisitos Previos

### Software Necesario

- ✅ **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
- ✅ **Docker Desktop** (para PostgreSQL MCP) - [Descargar](https://www.docker.com/products/docker-desktop/)
- ✅ **Git** - [Descargar](https://git-scm.com/)
- ✅ **Cursor IDE** con soporte MCP

### Verificar Instalaciones

```powershell
# Verificar Node.js
node --version

# Verificar Docker
docker --version

# Verificar Git
git --version
```

---

## 🔑 Obtención de API Keys

### 1. GitHub Personal Access Token (PAT)

**Pasos:**

1. Ve a [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click en **"Generate new token (classic)"**
3. Configura:
   - **Note:** `Cursor MCP Integration`
   - **Expiration:** 90 días (o según tu preferencia)
   - **Scopes necesarios:**
     - ✅ `repo` (acceso completo a repositorios)
     - ✅ `workflow` (para GitHub Actions)
     - ✅ `read:user` (información del usuario)
4. Click en **"Generate token"**
5. **⚠️ IMPORTANTE:** Copia el token inmediatamente (solo se muestra una vez)
6. Reemplaza `ghp_YOUR_TOKEN_HERE` en `.cursor/mcp.json`

### 2. Brave Search API Key

**Pasos:**

1. Ve a [Brave Search API](https://brave.com/search/api/)
2. Crea una cuenta gratuita (si no tienes una)
3. Ve al Dashboard → **API Keys**
4. Genera una nueva API Key
5. **Límites gratuitos:**
   - 2,000 consultas/mes
   - 1 consulta/segundo (QPS)
6. Reemplaza `BSA_YOUR_API_KEY_HERE` en `.cursor/mcp.json`

---

## 🗄️ Configuración de Base de Datos

### Opción A: PostgreSQL Local con Docker

Si tienes PostgreSQL corriendo localmente o en Docker:

1. **Identifica tu conexión:**
   ```powershell
   # Si usas Supabase, obtén la connection string del dashboard
   # Formato: postgresql://user:password@host:port/database
   ```

2. **Actualiza la configuración en `.cursor/mcp.json`:**
   ```json
   "postgres-advanced": {
     "command": "docker",
     "args": [
       "run",
       "-i",
       "--rm",
       "-e",
       "POSTGRES_CONNECTION_STRING=postgresql://admin:TU_PASSWORD@host.docker.internal:5432/tickets_db",
       "ghcr.io/henkdz/postgresql-mcp-server:latest"
     ]
   }
   ```

3. **Para Supabase:**
   - Obtén la connection string desde el dashboard de Supabase
   - Reemplaza `host.docker.internal` con la IP/host de tu base de datos
   - Ejemplo: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

### Opción B: Deshabilitar PostgreSQL MCP (si no lo necesitas)

Si no trabajas con bases de datos en esta sesión, puedes comentar o eliminar la sección `postgres-advanced` del archivo `mcp.json` para ahorrar recursos.

---

## ⚙️ Configuración de Rutas (Windows)

El archivo `mcp.json` ya está configurado con las rutas de tu proyecto. Si necesitas agregar más directorios:

```json
"filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro",
    "C:\\ruta\\a\\otro\\directorio"
  ]
}
```

**Nota:** En Windows, usa barras invertidas dobles (`\\`) o barras normales (`/`) en JSON.

---

## 🔒 Configuración Segura de Variables de Entorno

**⚠️ NUNCA subas tu archivo `mcp.json` con tokens reales a Git.**

### Opción 1: Variables de Entorno del Sistema

1. Configura variables de entorno en Windows:
   ```powershell
   # PowerShell (Administrador)
   [System.Environment]::SetEnvironmentVariable("GITHUB_PAT", "ghp_tu_token", "User")
   [System.Environment]::SetEnvironmentVariable("BRAVE_API_KEY", "BSA_tu_key", "User")
   ```

2. Actualiza `mcp.json` para usar variables:
   ```json
   "env": {
     "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PAT}",
     "BRAVE_API_KEY": "${BRAVE_API_KEY}"
   }
   ```

### Opción 2: Archivo .env.local (Recomendado)

1. Crea `.cursor/.env.local`:
   ```env
   GITHUB_PERSONAL_ACCESS_TOKEN=ghp_tu_token_aqui
   BRAVE_API_KEY=BSA_tu_key_aqui
   POSTGRES_CONNECTION_STRING=postgresql://...
   ```

2. Asegúrate de que `.cursor/.env.local` esté en `.gitignore`

---

## ✅ Verificación y Troubleshooting

### 1. Verificar que los Servidores MCP se Inician

1. Abre Cursor
2. Ve a **Settings → Features → MCP**
3. Deberías ver todos los servidores listados
4. Si algún servidor muestra error (rojo), revisa los logs

### 2. Probar Servidores Individualmente

#### Filesystem
```powershell
# En Cursor, prueba:
"Lista los archivos en el directorio raíz del proyecto"
```

#### Secure Terminal
```powershell
# En Cursor, prueba:
"Ejecuta 'npm --version' para verificar Node.js"
```

#### GitHub
```powershell
# En Cursor, prueba:
"Lista los issues abiertos en este repositorio"
```

#### Brave Search
```powershell
# En Cursor, prueba:
"Busca información sobre Next.js 16"
```

### 3. Errores Comunes

#### Error: "ENOENT" en Filesystem
- **Causa:** Ruta incorrecta o no existe
- **Solución:** Verifica que las rutas en `mcp.json` existan y usen el formato correcto para Windows

#### Error: "Docker not found"
- **Causa:** Docker Desktop no está corriendo
- **Solución:** Inicia Docker Desktop y espera a que esté completamente iniciado

#### Error: "Invalid token" en GitHub
- **Causa:** Token expirado o sin permisos
- **Solución:** Genera un nuevo token con los scopes correctos

#### Error: "Rate limit exceeded" en Brave
- **Causa:** Excediste el límite de 1 QPS
- **Solución:** Espera unos segundos entre búsquedas

---

## 📊 Servidores MCP Configurados

| Servidor | Propósito | Estado |
|----------|-----------|--------|
| `filesystem` | Lectura/escritura de archivos | ✅ Activo |
| `secure-terminal` | Ejecución segura de comandos | ✅ Activo |
| `github-remote` | Integración con GitHub | ⚠️ Requiere token |
| `postgres-advanced` | Gestión de base de datos | ⚠️ Requiere Docker |
| `brave-search` | Búsqueda web privada | ⚠️ Requiere API key |
| `sequential-thinking` | Planificación estructurada | ✅ Activo |
| `memory` | Memoria persistente | ✅ Activo |

---

## 🎯 Próximos Pasos

1. ✅ Configura todas las API keys
2. ✅ Verifica que Docker esté corriendo (si usas PostgreSQL MCP)
3. ✅ Prueba cada servidor individualmente
4. ✅ Comienza a usar el agente para tareas de desarrollo

---

## 📚 Recursos Adicionales

- [Documentación Oficial MCP](https://modelcontextprotocol.io/)
- [Repositorio de Servidores MCP](https://github.com/modelcontextprotocol/servers)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

---

## 🔐 Seguridad

- ✅ Nunca compartas tu `mcp.json` con tokens reales
- ✅ Usa variables de entorno para credenciales
- ✅ Rota tus tokens periódicamente
- ✅ Revisa los permisos de los comandos en `ALLOW_COMMANDS`
- ✅ Limita las rutas del filesystem a lo estrictamente necesario

---

**Última actualización:** Diciembre 2024  
**Versión de configuración:** 1.0.0





