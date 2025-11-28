# Script para corregir case sensitivity de archivos UI
# Este script renombra archivos en Git para que coincidan con los imports

Write-Host "=== Corrigiendo Case Sensitivity en Componentes UI ===" -ForegroundColor Cyan

# Archivos que necesitan renombrarse (de mayúsculas a minúsculas)
$renames = @(
    @{ Old = "components/ui/Badge.tsx"; New = "components/ui/badge-temp.tsx" },
    @{ Old = "components/ui/Breadcrumb.tsx"; New = "components/ui/breadcrumb-temp.tsx" },
    @{ Old = "components/ui/Button.tsx"; New = "components/ui/button-temp.tsx" },
    @{ Old = "components/ui/Card.tsx"; New = "components/ui/card-temp.tsx" },
    @{ Old = "components/ui/Pagination.tsx"; New = "components/ui/pagination-temp.tsx" },
    @{ Old = "components/ui/Select.tsx"; New = "components/ui/select-temp.tsx" },
    @{ Old = "components/ui/Skeleton.tsx"; New = "components/ui/skeleton-temp.tsx" },
    @{ Old = "components/ui/State.tsx"; New = "components/ui/state-temp.tsx" },
    @{ Old = "components/ui/Table.tsx"; New = "components/ui/table-temp.tsx" },
    @{ Old = "components/ui/ToastProvider.tsx"; New = "components/ui/toast-provider-temp.tsx" }
)

Write-Host "`nPaso 1: Renombrando archivos a nombres temporales..." -ForegroundColor Yellow
foreach ($rename in $renames) {
    $oldFile = $rename.Old
    $tempFile = $rename.New
    
    if (git ls-files --error-unmatch $oldFile 2>&1 | Out-Null) {
        Write-Host "  Renombrando: $oldFile -> $tempFile" -ForegroundColor Gray
        git mv $oldFile $tempFile
    }
}

Write-Host "`nPaso 2: Renombrando archivos temporales a nombres finales (minúsculas)..." -ForegroundColor Yellow
$finalRenames = @(
    @{ Old = "components/ui/badge-temp.tsx"; New = "components/ui/badge.tsx" },
    @{ Old = "components/ui/breadcrumb-temp.tsx"; New = "components/ui/breadcrumb.tsx" },
    @{ Old = "components/ui/button-temp.tsx"; New = "components/ui/button.tsx" },
    @{ Old = "components/ui/card-temp.tsx"; New = "components/ui/card.tsx" },
    @{ Old = "components/ui/pagination-temp.tsx"; New = "components/ui/pagination.tsx" },
    @{ Old = "components/ui/select-temp.tsx"; New = "components/ui/select.tsx" },
    @{ Old = "components/ui/skeleton-temp.tsx"; New = "components/ui/skeleton.tsx" },
    @{ Old = "components/ui/state-temp.tsx"; New = "components/ui/state.tsx" },
    @{ Old = "components/ui/table-temp.tsx"; New = "components/ui/table.tsx" },
    @{ Old = "components/ui/toast-provider-temp.tsx"; New = "components/ui/toast-provider.tsx" }
)

foreach ($rename in $finalRenames) {
    $tempFile = $rename.Old
    $finalFile = $rename.New
    
    if (git ls-files --error-unmatch $tempFile 2>&1 | Out-Null) {
        Write-Host "  Renombrando: $tempFile -> $finalFile" -ForegroundColor Gray
        git mv $tempFile $finalFile
    }
}

Write-Host "`n✅ Corrección completada!" -ForegroundColor Green
Write-Host "`nVerificar cambios:" -ForegroundColor Yellow
Write-Host "  git status" -ForegroundColor Gray
Write-Host "`nPara commit:" -ForegroundColor Yellow
Write-Host "  git add -A" -ForegroundColor Gray
Write-Host "  git commit -m 'fix: renombrar componentes UI a minúsculas para compatibilidad case-sensitive'" -ForegroundColor Gray

