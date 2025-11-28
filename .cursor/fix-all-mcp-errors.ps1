# Fix All MCP Errors - Script Completo
# Ejecutar como Administrador

Write-Host "Solucionando TODOS los errores MCP..." -ForegroundColor Cyan
Write-Host ""

# Verificar si se ejecuta como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "   Haz clic derecho en PowerShell y selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Ejecutando como Administrador" -ForegroundColor Green
Write-Host ""

# Paso 1: Detener procesos
Write-Host "Paso 1: Deteniendo procesos de Node.js/npm..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*" -or $_.ProcessName -like "*cursor*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "OK: Procesos detenidos" -ForegroundColor Green
Write-Host ""

# Paso 2: Limpiar caché de npm
Write-Host "Paso 2: Limpiando caché de npm..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "OK: Caché de npm limpiado" -ForegroundColor Green
} catch {
    Write-Host "ADVERTENCIA: No se pudo limpiar caché de npm" -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Limpiar caché de npx
Write-Host "Paso 3: Limpiando caché de npx..." -ForegroundColor Yellow
$npxCachePath = "$env:LOCALAPPDATA\npm-cache\_npx"
if (Test-Path $npxCachePath) {
    try {
        Get-ChildItem -Path $npxCachePath -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Remove-Item -Path $npxCachePath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "OK: Caché de npx eliminado" -ForegroundColor Green
    } catch {
        Write-Host "ADVERTENCIA: Algunos archivos no se pudieron eliminar" -ForegroundColor Yellow
        Write-Host "   Intenta cerrar Cursor completamente y ejecutar este script nuevamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "INFO: Caché de npx no existe" -ForegroundColor Cyan
}
Write-Host ""

# Paso 4: Limpiar caché completo de npm
Write-Host "Paso 4: Limpiando caché completo de npm..." -ForegroundColor Yellow
$npmCachePath = "$env:LOCALAPPDATA\npm-cache"
if (Test-Path $npmCachePath) {
    try {
        Get-ChildItem -Path $npmCachePath -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "OK: Contenido del caché de npm eliminado" -ForegroundColor Green
    } catch {
        Write-Host "ADVERTENCIA: Algunos archivos no se pudieron eliminar" -ForegroundColor Yellow
    }
} else {
    Write-Host "INFO: Caché de npm no existe" -ForegroundColor Cyan
}
Write-Host ""

# Paso 5: Limpiar caché de nvm si existe
Write-Host "Paso 5: Limpiando caché de nvm (si existe)..." -ForegroundColor Yellow
$nvmPath = "$env:LOCALAPPDATA\nvm"
if (Test-Path $nvmPath) {
    try {
        Get-ChildItem -Path $nvmPath -Filter "*cache*" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "OK: Caché de nvm limpiado" -ForegroundColor Green
    } catch {
        Write-Host "INFO: No se encontró caché de nvm o ya está limpio" -ForegroundColor Cyan
    }
} else {
    Write-Host "INFO: nvm no está instalado" -ForegroundColor Cyan
}
Write-Host ""

# Paso 6: Crear directorio docs si no existe
Write-Host "Paso 6: Verificando directorio docs..." -ForegroundColor Yellow
$projectPath = "C:\Users\Admin\Documents\SMD VITAL\SMD VITAL\viotech-pro"
$docsPath = Join-Path $projectPath "docs"
if (-not (Test-Path $docsPath)) {
    try {
        New-Item -ItemType Directory -Path $docsPath -Force | Out-Null
        Write-Host "OK: Directorio docs creado" -ForegroundColor Green
    } catch {
        Write-Host "ADVERTENCIA: No se pudo crear el directorio docs" -ForegroundColor Yellow
    }
} else {
    Write-Host "INFO: Directorio docs ya existe" -ForegroundColor Cyan
}
Write-Host ""

# Paso 7: Instalar paquetes globalmente (opcional)
Write-Host "Paso 7: Instalando paquetes MCP globalmente..." -ForegroundColor Yellow
$packages = @(
    "@modelcontextprotocol/server-filesystem",
    "@modelcontextprotocol/server-sequential-thinking",
    "@modelcontextprotocol/server-memory"
)

foreach ($package in $packages) {
    try {
        Write-Host "   Instalando $package..." -ForegroundColor Cyan
        npm install -g $package --force 2>&1 | Out-Null
        Write-Host "   OK: $package instalado" -ForegroundColor Green
    } catch {
        Write-Host "   ADVERTENCIA: No se pudo instalar $package" -ForegroundColor Yellow
    }
}
Write-Host ""

# Resumen
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Cierra completamente Cursor" -ForegroundColor White
Write-Host "   2. Espera 10 segundos" -ForegroundColor White
Write-Host "   3. Vuelve a abrir Cursor" -ForegroundColor White
Write-Host "   4. Verifica los logs MCP en Settings -> Features -> MCP" -ForegroundColor White
Write-Host ""
Write-Host "Si el problema persiste:" -ForegroundColor Yellow
Write-Host "   - Revisa: .cursor/FIX_ALL_MCP_ERRORS.md" -ForegroundColor White
Write-Host "   - Excluye rutas de npm del antivirus" -ForegroundColor White
Write-Host "   - Verifica espacio en disco" -ForegroundColor White
Write-Host ""
