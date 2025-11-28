# Script de configuración MCP para Windows
# Ejecuta este script en PowerShell para configurar MCP automáticamente

Write-Host "🚀 Configurando MCP (Model Context Protocol) para Cursor..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host "`n📦 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar Docker (opcional, solo si usas PostgreSQL MCP)
Write-Host "`n🐳 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker no está instalado. El servidor PostgreSQL MCP no funcionará." -ForegroundColor Yellow
    Write-Host "   Instala Docker Desktop desde https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
}

# Crear directorio .cursor si no existe
if (-not (Test-Path ".cursor")) {
    New-Item -ItemType Directory -Path ".cursor" | Out-Null
    Write-Host "✅ Directorio .cursor creado" -ForegroundColor Green
}

# Copiar plantilla a mcp.json si no existe
if (-not (Test-Path ".cursor\mcp.json")) {
    if (Test-Path ".cursor\mcp.json.template") {
        Copy-Item ".cursor\mcp.json.template" ".cursor\mcp.json"
        Write-Host "✅ Archivo mcp.json creado desde plantilla" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró la plantilla mcp.json.template" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  mcp.json ya existe. No se sobrescribirá." -ForegroundColor Yellow
}

# Verificar que .gitignore incluya .cursor/.env.local
$gitignorePath = ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw
    if ($gitignoreContent -notmatch "\.cursor.*\.env") {
        Add-Content $gitignorePath "`n# Cursor MCP secrets`n.cursor/.env.local`n.cursor/*.env"
        Write-Host "✅ .gitignore actualizado para proteger credenciales" -ForegroundColor Green
    }
}

Write-Host "`n📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Edita .cursor\mcp.json y reemplaza los placeholders:" -ForegroundColor White
Write-Host "   - ghp_YOUR_TOKEN_HERE → Tu GitHub Personal Access Token" -ForegroundColor Gray
Write-Host "   - BSA_YOUR_API_KEY_HERE → Tu Brave Search API Key" -ForegroundColor Gray
Write-Host "   - YOUR_PASSWORD → Tu contraseña de PostgreSQL (si aplica)" -ForegroundColor Gray
Write-Host "`n2. Lee la guía completa: .cursor\MCP_SETUP_GUIDE.md" -ForegroundColor White
Write-Host "`n3. Reinicia Cursor para que los cambios surtan efecto" -ForegroundColor White

Write-Host "`n✅ Configuración inicial completada!" -ForegroundColor Green





