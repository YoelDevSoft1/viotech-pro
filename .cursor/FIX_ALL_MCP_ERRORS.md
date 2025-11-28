# 🔧 Solución Completa: Errores MCP

## 📋 Problemas Identificados

### 1. **Filesystem Server** ❌
- **Error**: `ENOENT: no such file or directory, stat 'C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro\docs'`
- **Causa**: El directorio `docs` no existe pero está configurado
- **Solución**: Remover `docs` de la configuración o crear el directorio

### 2. **Secure Terminal Server** ❌
- **Error**: `404 Not Found - GET https://registry.npmjs.org/tumf-mcp-shell-server`
- **Causa**: El paquete `tumf-mcp-shell-server` no existe en npm
- **Solución**: Usar un servidor alternativo o remover esta configuración

### 3. **GitHub Remote Server** ⚠️
- **Error**: Paquete deprecado + errores de permisos en caché
- **Causa**: `@modelcontextprotocol/server-github` está deprecado
- **Solución**: Remover o comentar esta configuración

### 4. **Sequential Thinking & Memory** ⚠️
- **Error**: Errores de permisos (EPERM) y archivos faltantes (ENOENT) en caché de npm
- **Causa**: Caché de npm corrupto
- **Solución**: Limpiar caché completamente

## ✅ Solución Paso a Paso

### Paso 1: Limpiar Caché de npm/npx (CRÍTICO)

Ejecuta en PowerShell **como Administrador**:

```powershell
# Detener procesos
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar cachés
npm cache clean --force
Remove-Item -Path "$env:LOCALAPPDATA\npm-cache\_npx" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\npm-cache" -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar también el caché de nvm si usas nvm
if (Test-Path "$env:LOCALAPPDATA\nvm") {
    Get-ChildItem -Path "$env:LOCALAPPDATA\nvm" -Filter "*cache*" -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
}
```

### Paso 2: Actualizar Configuración MCP

**Opción A: Usar configuración corregida (recomendado)**

Copia el contenido de `.cursor/mcp.json.fixed` a tu archivo `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro"
      ]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Cambios realizados:**
- ✅ Removido directorio `docs` inexistente
- ✅ Removido `secure-terminal` (paquete no existe)
- ✅ Removido `github-remote` (deprecado)
- ✅ Mantenidos solo servidores funcionales

**Opción B: Crear directorio docs (si lo necesitas)**

```powershell
New-Item -ItemType Directory -Path "docs" -Force
```

Luego puedes agregar `docs` de vuelta a la configuración.

### Paso 3: Instalar Paquetes Globalmente (Opcional pero Recomendado)

```powershell
npm install -g @modelcontextprotocol/server-filesystem --force
npm install -g @modelcontextprotocol/server-sequential-thinking --force
npm install -g @modelcontextprotocol/server-memory --force
```

Si instalas globalmente, actualiza `mcp.json` para usar las rutas globales (ver `.cursor/mcp.json.alternative`).

### Paso 4: Reiniciar Cursor

1. **Cierra completamente Cursor** (no solo la ventana)
2. **Espera 10 segundos**
3. **Vuelve a abrir Cursor**
4. **Verifica**: Settings → Features → MCP → Logs

## 🔄 Script Automatizado Completo

Ejecuta `.cursor/fix-all-mcp-errors.ps1` como Administrador:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\cursor\fix-all-mcp-errors.ps1
```

## 📝 Configuración Mínima Recomendada

Para empezar rápido, usa esta configuración mínima:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro"
      ]
    }
  }
}
```

Esto solo activa el servidor filesystem que es el más importante y funcional.

## 🚨 Notas Importantes

1. **El paquete `tumf-mcp-shell-server` no existe** - No hay alternativa directa, pero puedes usar comandos directamente en Cursor
2. **El servidor GitHub está deprecado** - Si necesitas GitHub, busca alternativas o usa la API directamente
3. **El caché corrupto es el problema principal** - Limpia completamente antes de continuar
4. **Antivirus puede bloquear** - Considera excluir `C:\Users\Admin\AppData\Local\npm-cache`

## ✅ Verificación

Después de aplicar las correcciones:

1. ✅ Filesystem server inicia sin errores
2. ✅ No hay errores 404 de paquetes inexistentes
3. ✅ No hay errores EPERM masivos
4. ✅ Los servidores funcionales (sequential-thinking, memory) inician correctamente

---

**Última actualización:** Noviembre 2024



