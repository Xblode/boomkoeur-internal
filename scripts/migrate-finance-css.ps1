# Script de migration des classes CSS et variables Tailwind du module Finance
# Remplace les classes specifiques au module par celles du design system du projet

$financeDir = "src\components\module\Finance"

Write-Host "=== Migration des classes CSS du module Finance ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Remplacement des classes Tailwind..." -ForegroundColor Yellow

Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Remplacer les variables de couleur
    $content = $content -replace 'bg-bg-card', 'bg-card-bg'
    $content = $content -replace 'bg-bg-secondary', 'bg-zinc-100 dark:bg-zinc-800'
    $content = $content -replace 'bg-bg-hover', 'bg-zinc-200 dark:bg-zinc-700'
    $content = $content -replace 'bg-bg-primary', 'bg-card-bg'
    $content = $content -replace 'text-text-primary', 'text-foreground'
    $content = $content -replace 'text-text-secondary', 'text-zinc-600 dark:text-zinc-400'
    $content = $content -replace 'text-text-muted', 'text-zinc-500'
    $content = $content -replace 'border-border(?!-custom)', 'border-border-custom'
    
    # Remplacer les classes d'accent
    $content = $content -replace 'text-accent', 'text-zinc-900 dark:text-zinc-50'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Migration CSS terminee ===" -ForegroundColor Green
