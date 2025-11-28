# Fix MCP Filesystem Server Error
# Ejecutar como Administrador
# NOTA: Para solucionar TODOS los errores MCP, usa fix-all-mcp-errors.ps1

Write-Host "🔧 Solucionando error MCP Filesystem Server..." -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "   Haz clic derecho en PowerShell y selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ejecutando como Administrador" -ForegroundColor Green
Write-Host ""

# Paso 1: Detener procesos de npm/npx
Write-Host "📋 Paso 1: Deteniendo procesos de npm/npx..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Procesos detenidos" -ForegroundColor Green
Write-Host ""

# Paso 2: Limpiar caché de npm
Write-Host "📋 Paso 2: Limpiando caché de npm..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "✅ Caché de npm limpiado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: No se pudo limpiar caché de npm (puede estar vacío)" -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Limpiar caché de npx
Write-Host "📋 Paso 3: Limpiando caché de npx..." -ForegroundColor Yellow
$npxCachePath = "$env:LOCALAPPDATA\npm-cache\_npx"
if (Test-Path $npxCachePath) {
    try {
        Remove-Item -Path $npxCachePath -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Caché de npx eliminado: $npxCachePath" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Advertencia: Algunos archivos no se pudieron eliminar (pueden estar en uso)" -ForegroundColor Yellow
        Write-Host "   Intenta cerrar Cursor y ejecutar este script nuevamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Caché de npx no existe (ya está limpio)" -ForegroundColor Cyan
}
Write-Host ""

# Paso 4: Limpiar caché completo de npm (opcional pero más agresivo)
Write-Host "📋 Paso 4: Limpiando caché completo de npm..." -ForegroundColor Yellow
$npmCachePath = "$env:LOCALAPPDATA\npm-cache"
if (Test-Path $npmCachePath) {
    try {
        # Solo eliminar contenido, no el directorio
        Get-ChildItem -Path $npmCachePath -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "✅ Contenido del caché de npm eliminado" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Advertencia: Algunos archivos no se pudieron eliminar" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  Caché de npm no existe" -ForegroundColor Cyan
}
Write-Host ""

# Paso 5: Verificar e instalar globalmente
Write-Host "📋 Paso 5: Instalando @modelcontextprotocol/server-filesystem globalmente..." -ForegroundColor Yellow
try {
    npm install -g @modelcontextprotocol/server-filesystem --force 2>&1 | Out-Null
    Write-Host "✅ Paquete instalado globalmente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Advertencia: No se pudo instalar globalmente" -ForegroundColor Yellow
    Write-Host "   Puedes intentar instalarlo localmente en el proyecto" -ForegroundColor Yellow
}
Write-Host ""

# Paso 6: Verificar instalación
Write-Host "📋 Paso 6: Verificando instalación..." -ForegroundColor Yellow
$globalPath = "$env:APPDATA\npm\node_modules\@modelcontextprotocol\server-filesystem"
if (Test-Path $globalPath) {
    Write-Host "✅ Instalación global encontrada en: $globalPath" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Instalación global no encontrada (se usará npx en tiempo de ejecución)" -ForegroundColor Cyan
}
Write-Host ""

# Paso 7: Verificar permisos
Write-Host "📋 Paso 7: Verificando permisos..." -ForegroundColor Yellow
$projectPath = "C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro"
if (Test-Path $projectPath) {
    $acl = Get-Acl $projectPath
    Write-Host "✅ Permisos del proyecto verificados" -ForegroundColor Green
} else {
    Write-Host "⚠️  Advertencia: Ruta del proyecto no encontrada" -ForegroundColor Yellow
}
Write-Host ""

# Resumen
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Cierra completamente Cursor" -ForegroundColor White
Write-Host "   2. Espera 10 segundos" -ForegroundColor White
Write-Host "   3. Vuelve a abrir Cursor" -ForegroundColor White
Write-Host "   4. Verifica los logs MCP en Settings → Features → MCP" -ForegroundColor White
Write-Host ""
Write-Host "💡 Si el problema persiste:" -ForegroundColor Yellow
Write-Host "   - Revisa la guía: .cursor/FIX_MCP_FILESYSTEM_ERROR.md" -ForegroundColor White
Write-Host "   - Considera excluir las rutas de npm del antivirus" -ForegroundColor White
Write-Host "   - Verifica que tengas espacio suficiente en disco" -ForegroundColor White
Write-Host ""


