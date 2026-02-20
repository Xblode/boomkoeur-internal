# Script pour remplacer les appels Supabase par financeDataService

$financeDir = "src\components\module\Finance"

Write-Host "=== Migration des appels de services ===" -ForegroundColor Cyan
Write-Host ""

Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Supprimer les imports Supabase non utilisables
    $content = $content -replace "import \{[^}]*\} from ['\`"]@/lib/supabase/finance['\`"]\r?\n?", ""
    $content = $content -replace "import \{[^}]*\} from ['\`"]@/lib/supabase/budget-projects['\`"]\r?\n?", ""
    $content = $content -replace "import \{[^}]*\} from ['\`"]@/lib/supabase/hooks['\`"]\r?\n?", ""
    
    # Ajouter l'import financeDataService si necessaire et pas deja present
    if ($content -notmatch "financeDataService") {
        # Trouver la ligne d'import React ou premier import
        $content = $content -replace "(import \{[^}]*\} from ['\`"]react['\`"]\r?\n)", "`$1import { financeDataService } from '@/lib/services/FinanceDataService'`n"
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Migration des services terminee ===" -ForegroundColor Green
