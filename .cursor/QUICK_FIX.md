# ⚡ Solución Rápida: Error MCP Filesystem

## 🚨 Problema
El servidor MCP filesystem no inicia debido a errores de permisos y caché corrupto en Windows.

## ✅ Solución en 3 Pasos

### Paso 1: Ejecutar Script de Reparación

Abre PowerShell **como Administrador** y ejecuta:

```powershell
cd "C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\cursor\fix-mcp-filesystem.ps1
```

### Paso 2: Instalar Globalmente (si el script no lo hace)

```powershell
npm install -g @modelcontextprotocol/server-filesystem --force
```

### Paso 3: Actualizar Configuración

Si tienes un archivo `.cursor/mcp.json`, cámbialo a usar la instalación global:

**Opción A: Usar instalación global (recomendado)**
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

**Opción B: Usar instalación local del proyecto**
```powershell
# En el directorio del proyecto
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

### Paso 4: Reiniciar Cursor

1. **Cierra completamente Cursor** (no solo la ventana)
2. **Espera 10 segundos**
3. **Vuelve a abrir Cursor**
4. **Verifica**: Settings → Features → MCP → Logs

## 🔍 Si Aún No Funciona

1. **Excluir de Antivirus**: Agrega exclusiones para:
   - `C:\Users\Admin\AppData\Local\npm-cache`
   - `C:\Users\Admin\AppData\Roaming\npm`

2. **Verificar Espacio en Disco**: Asegúrate de tener al menos 500MB libres

3. **Verificar Node.js**: 
   ```powershell
   node --version  # Debe ser >= 18
   npm --version
   ```

4. **Revisar Logs Detallados**: 
   - Cursor → Settings → Features → MCP
   - Busca errores específicos en los logs

## 📚 Documentación Completa

Para más detalles, consulta: `.cursor/FIX_MCP_FILESYSTEM_ERROR.md`

---

**Tiempo estimado**: 5-10 minutos




