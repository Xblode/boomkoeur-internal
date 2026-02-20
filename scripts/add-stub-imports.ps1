# Script pour remplacer les imports Supabase par les stubs

$financeDir = "src\components\module\Finance"

Write-Host "=== Ajout des imports de stubs ===" -ForegroundColor Cyan
Write-Host ""

# Fichiers a corriger
$filesToFix = @(
    "components\modals\ManageBudgetTemplatesModal.tsx",
    "components\modals\NewForecastModal.tsx",
    "components\modals\CreateEventBudgetModal.tsx",
    "components\BudgetTab_new.tsx",
    "components\TransactionsTab.tsx",
    "ui\AssetUploaderPanel.tsx"
)

foreach ($file in $filesToFix) {
    $fullPath = Join-Path $financeDir $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Ajouter l'import des stubs si pas deja present
        if ($content -notmatch "@/lib/stubs/supabase-stubs") {
            $content = "import * as SupabaseStubs from '@/lib/stubs/supabase-stubs'`n" + $content
        }
        
        # Sauvegarder
        Set-Content -Path $fullPath -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  NOT FOUND: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Terminé ===" -ForegroundColor Green
