# Script pour nettoyer les imports Supabase restants

$financeDir = "src\components\module\Finance"

Write-Host "=== Nettoyage des imports Supabase ===" -ForegroundColor Cyan
Write-Host ""

Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Supprimer les imports Supabase client
    $content = $content -replace "import \{ supabase \} from ['\`"]@/lib/supabase/client['\`""]\r?\n", ""
    
    # Supprimer les imports event-budgets
    $content = $content -replace "import \{[^}]*\} from ['\`"]@/lib/supabase/event-budgets['\`""]\r?\n", ""
    
    # Supprimer les imports budget-alerts
    $content = $content -replace "import [^;]* from ['\`"]@/lib/supabase/budget-alerts['\`""]\r?\n", ""
    
    # Supprimer les imports hooks Supabase generiques
    $content = $content -replace "import \{[^}]*\} from ['\`"]@/lib/supabase/hooks['\`""]\r?\n", ""
    
    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Nettoyage termine ===" -ForegroundColor Green
