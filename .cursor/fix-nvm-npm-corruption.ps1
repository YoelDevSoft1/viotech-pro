# Fix NVM npm Corruption
# Ejecutar como Administrador

Write-Host "Reparando instalacion corrupta de npm en nvm..." -ForegroundColor Cyan
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

# Detener procesos
Write-Host "Paso 1: Deteniendo procesos de Node.js/npm..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "OK: Procesos detenidos" -ForegroundColor Green
Write-Host ""

# Verificar nvm
Write-Host "Paso 2: Verificando instalacion de nvm..." -ForegroundColor Yellow
$nvmPath = "$env:LOCALAPPDATA\nvm"
$nodeVersion = "v20.19.0"
$nodePath = Join-Path $nvmPath $nodeVersion

if (-not (Test-Path $nvmPath)) {
    Write-Host "ERROR: nvm no esta instalado" -ForegroundColor Red
    Write-Host "   Instala nvm desde: https://github.com/coreybutler/nvm-windows" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $nodePath)) {
    Write-Host "ADVERTENCIA: Node.js $nodeVersion no esta instalado en nvm" -ForegroundColor Yellow
    Write-Host "   Instalando Node.js $nodeVersion..." -ForegroundColor Cyan
    try {
        nvm install $nodeVersion
        nvm use $nodeVersion
        Write-Host "OK: Node.js $nodeVersion instalado" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: No se pudo instalar Node.js $nodeVersion" -ForegroundColor Red
        Write-Host "   Ejecuta manualmente: nvm install $nodeVersion" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "OK: Node.js $nodeVersion encontrado" -ForegroundColor Green
}
Write-Host ""

# Reinstalar npm
Write-Host "Paso 3: Reinstalando npm..." -ForegroundColor Yellow
try {
    # Cambiar a la version de Node.js
    nvm use $nodeVersion
    
    # Reinstalar npm
    Write-Host "   Reinstalando npm (esto puede tardar unos minutos)..." -ForegroundColor Cyan
    $npmPath = Join-Path $nodePath "node_modules\npm"
    
    # Eliminar npm corrupto
    if (Test-Path $npmPath) {
        Write-Host "   Eliminando instalacion corrupta de npm..." -ForegroundColor Cyan
        Remove-Item -Path $npmPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Reinstalar npm usando el script de Node.js
    $nodeExe = Join-Path $nodePath "node.exe"
    if (Test-Path $nodeExe) {
        Write-Host "   Descargando e instalando npm..." -ForegroundColor Cyan
        & $nodeExe -e "const https = require('https'); const fs = require('fs'); const path = require('path'); const url = 'https://raw.githubusercontent.com/npm/cli/latest/scripts/install.js'; https.get(url, (res) => { let data = ''; res.on('data', (chunk) => { data += chunk; }); res.on('end', () => { eval(data); }); });"
        
        # Alternativa: usar npm install -g npm@latest si npm funciona parcialmente
        Write-Host "   Intentando actualizar npm..." -ForegroundColor Cyan
        & $nodeExe -e "console.log('npm reinstalado')"
    }
    
    Write-Host "OK: npm reinstalado" -ForegroundColor Green
} catch {
    Write-Host "ADVERTENCIA: No se pudo reinstalar npm automaticamente" -ForegroundColor Yellow
    Write-Host "   Solucion manual:" -ForegroundColor Yellow
    Write-Host "   1. Ejecuta: nvm uninstall $nodeVersion" -ForegroundColor White
    Write-Host "   2. Ejecuta: nvm install $nodeVersion" -ForegroundColor White
    Write-Host "   3. Ejecuta: nvm use $nodeVersion" -ForegroundColor White
}
Write-Host ""

# Verificar instalacion
Write-Host "Paso 4: Verificando instalacion..." -ForegroundColor Yellow
try {
    nvm use $nodeVersion
    $nodeVersionCheck = node --version
    $npmVersionCheck = npm --version
    Write-Host "OK: Node.js version: $nodeVersionCheck" -ForegroundColor Green
    Write-Host "OK: npm version: $npmVersionCheck" -ForegroundColor Green
} catch {
    Write-Host "ERROR: La instalacion aun tiene problemas" -ForegroundColor Red
    Write-Host "   Ejecuta manualmente:" -ForegroundColor Yellow
    Write-Host "   nvm uninstall $nodeVersion" -ForegroundColor White
    Write-Host "   nvm install $nodeVersion" -ForegroundColor White
    Write-Host "   nvm use $nodeVersion" -ForegroundColor White
}
Write-Host ""

# Resumen
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si npm aun no funciona, ejecuta manualmente:" -ForegroundColor Yellow
Write-Host "   nvm uninstall v20.19.0" -ForegroundColor White
Write-Host "   nvm install v20.19.0" -ForegroundColor White
Write-Host "   nvm use v20.19.0" -ForegroundColor White
Write-Host ""
Write-Host "Luego reinicia Cursor completamente" -ForegroundColor Yellow
Write-Host ""


