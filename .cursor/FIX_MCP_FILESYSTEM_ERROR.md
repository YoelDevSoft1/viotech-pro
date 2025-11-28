# 🔧 Solución: Error MCP Filesystem Server

## 📋 Problema Identificado

El servidor MCP filesystem está fallando debido a:
- **EPERM (Permission errors)**: Windows bloquea operaciones de archivos
- **ENOENT (File not found)**: Caché de npm/npx corrupto
- **ENOTEMPTY**: Directorios bloqueados por antivirus o procesos

## ✅ Soluciones (en orden de prioridad)

### Solución 1: Limpiar Caché de npm/npx (RECOMENDADO)

Ejecuta estos comandos en PowerShell **como Administrador**:

```powershell
# 1. Limpiar caché de npm
npm cache clean --force

# 2. Limpiar caché de npx
Remove-Item -Path "$env:LOCALAPPDATA\npm-cache\_npx" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Limpiar caché de npm completamente
Remove-Item -Path "$env:LOCALAPPDATA\npm-cache" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Reinstalar el paquete globalmente (opcional pero recomendado)
npm install -g @modelcontextprotocol/server-filesystem
```

### Solución 2: Instalación Global (Alternativa)

Si la solución 1 no funciona, instala el servidor globalmente:

```powershell
# Instalar globalmente
npm install -g @modelcontextprotocol/server-filesystem

# Luego modifica .cursor/mcp.json para usar la instalación global:
```

**Actualiza `.cursor/mcp.json`:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": [
        "C:\\Users\\Admin\\AppData\\Roaming\\npm\\node_modules\\@modelcontextprotocol\\server-filesystem\\dist\\index.js",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro\\docs"
      ]
    }
  }
}
```

**O usa npx con caché limpio:**

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "--yes",
        "--cache",
        "$env:LOCALAPPDATA\\npm-cache",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro\\docs"
      ]
    }
  }
}
```

### Solución 3: Excluir de Antivirus

1. Abre tu antivirus (Windows Defender o tercero)
2. Agrega exclusiones para:
   - `C:\Users\Admin\AppData\Local\npm-cache`
   - `C:\Users\Admin\AppData\Roaming\npm`
   - `C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro`

### Solución 4: Usar Rutas Cortas (Windows)

Si el problema persiste, usa rutas cortas de Windows:

```powershell
# Obtener ruta corta
$fso = New-Object -ComObject Scripting.FileSystemObject
$folder = $fso.GetFolder("C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro")
$folder.ShortPath
```

Luego usa la ruta corta en `mcp.json`.

### Solución 5: Usar Instalación Local del Proyecto

Instala el paquete localmente en tu proyecto:

```powershell
cd "C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro"
npm install @modelcontextprotocol/server-filesystem --save-dev
```

Luego en `mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": [
        "./node_modules/@modelcontextprotocol/server-filesystem/dist/index.js",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro",
        "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro\\docs"
      ],
      "cwd": "C:\\Users\\Admin\\Documents\\SMD VITAL\\SMD VITAL\\viotech-pro"
    }
  }
}
```

## 🚀 Script Automatizado

Ejecuta el script `.cursor/fix-mcp-filesystem.ps1` como Administrador:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\cursor\fix-mcp-filesystem.ps1
```

## ✅ Verificación

Después de aplicar la solución:

1. **Cierra completamente Cursor**
2. **Vuelve a abrir Cursor**
3. **Verifica los logs MCP**: Settings → Features → MCP → Logs
4. **Prueba el servidor**: Pide a Cursor que liste archivos en un directorio

## 🔍 Diagnóstico Adicional

Si el problema persiste, ejecuta:

```powershell
# Verificar permisos
icacls "C:\Users\Admin\AppData\Local\npm-cache"

# Verificar espacio en disco
Get-PSDrive C | Select-Object Used,Free

# Verificar procesos bloqueando
Get-Process | Where-Object {$_.Path -like "*npm*"}
```

## 📝 Notas

- **Siempre ejecuta PowerShell como Administrador** para operaciones de limpieza
- **Cierra Cursor** antes de limpiar cachés
- **Espera 30 segundos** después de limpiar antes de reiniciar Cursor
- Si usas un antivirus de terceros, puede ser necesario deshabilitarlo temporalmente

---

**Última actualización:** Noviembre 2024




