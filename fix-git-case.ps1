# Script para corregir case sensitivity en Git
# Elimina archivos con mayúsculas de Git y agrega los archivos con minúsculas

Write-Host "=== Corrección de Case Sensitivity en Git ===" -ForegroundColor Cyan
Write-Host ""

# Lista de archivos a corregir
$filesToFix = @(
    "Badge.tsx",
    "Breadcrumb.tsx", 
    "Button.tsx",
    "Card.tsx",
    "Pagination.tsx",
    "Select.tsx",
    "Skeleton.tsx",
    "State.tsx",
    "Table.tsx",
    "ToastProvider.tsx"
)

Write-Host "Eliminando archivos con mayúsculas del índice de Git..." -ForegroundColor Yellow
foreach ($file in $filesToFix) {
    $gitPath = "components/ui/$file"
    
    # Verificar si el archivo está en Git
    $inGit = git ls-files --error-unmatch $gitPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Eliminando de Git: $gitPath" -ForegroundColor Gray
        git rm --cached $gitPath
    } else {
        Write-Host "  No está en Git: $gitPath" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "Agregando archivos con minúsculas a Git..." -ForegroundColor Yellow

# Badge
if (Test-Path "components/ui/badge.tsx") {
    Write-Host "  Agregando: components/ui/badge.tsx" -ForegroundColor Gray
    git add -f components/ui/badge.tsx
}

# Breadcrumb  
if (Test-Path "components/ui/breadcrumb.tsx") {
    Write-Host "  Agregando: components/ui/breadcrumb.tsx" -ForegroundColor Gray
    git add -f components/ui/breadcrumb.tsx
}

# Button
if (Test-Path "components/ui/button.tsx") {
    Write-Host "  Agregando: components/ui/button.tsx" -ForegroundColor Gray
    git add -f components/ui/button.tsx
}

# Card
if (Test-Path "components/ui/card.tsx") {
    Write-Host "  Agregando: components/ui/card.tsx" -ForegroundColor Gray
    git add -f components/ui/card.tsx
}

# Pagination
if (Test-Path "components/ui/pagination.tsx") {
    Write-Host "  Agregando: components/ui/pagination.tsx" -ForegroundColor Gray
    git add -f components/ui/pagination.tsx
}

# Select
if (Test-Path "components/ui/select.tsx") {
    Write-Host "  Agregando: components/ui/select.tsx" -ForegroundColor Gray
    git add -f components/ui/select.tsx
}

# Skeleton
if (Test-Path "components/ui/skeleton.tsx") {
    Write-Host "  Agregando: components/ui/skeleton.tsx" -ForegroundColor Gray
    git add -f components/ui/skeleton.tsx
}

# State
if (Test-Path "components/ui/state.tsx") {
    Write-Host "  Agregando: components/ui/state.tsx" -ForegroundColor Gray
    git add -f components/ui/state.tsx
}

# Table
if (Test-Path "components/ui/table.tsx") {
    Write-Host "  Agregando: components/ui/table.tsx" -ForegroundColor Gray
    git add -f components/ui/table.tsx
}

# ToastProvider - este necesita ser renombrado a toast-provider.tsx
if (Test-Path "components/ui/ToastProvider.tsx") {
    Write-Host "  Copiando ToastProvider.tsx a toast-provider.tsx..." -ForegroundColor Gray
    Copy-Item "components/ui/ToastProvider.tsx" "components/ui/toast-provider.tsx" -Force
    git add -f components/ui/toast-provider.tsx
    git rm --cached components/ui/ToastProvider.tsx
}

Write-Host ""
Write-Host "✅ Corrección completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Verifica los cambios:" -ForegroundColor Yellow
Write-Host "  git status" -ForegroundColor Gray
Write-Host ""
Write-Host "Para hacer commit:" -ForegroundColor Yellow
Write-Host "  git commit -m 'fix: corregir case sensitivity de componentes UI para compatibilidad con Netlify'" -ForegroundColor Gray

