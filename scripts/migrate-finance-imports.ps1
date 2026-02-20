# Script de migration des imports du module Finance
# Remplace tous les imports absolus par des imports relatifs ou absolus corrects

$financeDir = "src\components\module\Finance"

Write-Host "=== Migration des imports du module Finance ===" -ForegroundColor Cyan
Write-Host ""

# Pattern 1: Remplacer les imports de composants UI du module Finance
Write-Host "1. Remplacement des imports UI du module Finance..." -ForegroundColor Yellow
Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Remplacer les imports du module Finance/ui vers les composants du projet
    if ($content -match "from ['`"]\.\.?/ui/") {
        $content = $content -replace "from ['`"]\.\./ui/Button['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]\.\./ui/Input['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]\.\./ui/Badge['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]\.\./ui/Select['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]\.\./ui/Textarea['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]\.\./ui/Card['`"]", "from '@/components/ui/molecules'"
        $content = $content -replace "from ['`"]\.\./ui/Modal['`"]", "from '@/components/ui/organisms'"
        $content = $content -replace "from ['`"]\.\./ui/PageToolbar['`"]", "from '@/components/ui/organisms'"
        $content = $content -replace "from ['`"]\.\./ui/TagMultiSelect['`"]", "from '@/components/ui/molecules'"
        $content = $content -replace "from ['`"]\.\./ui/AssetUploaderPanel['`"]", "from '@/components/ui/molecules'"
        $modified = $true
    }
    
    # Remplacer @/components/ui/ par le bon chemin
    if ($content -match "from ['`"]@/components/ui/") {
        $content = $content -replace "from ['`"]@/components/ui/Button['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]@/components/ui/Input['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]@/components/ui/Badge['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]@/components/ui/Select['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]@/components/ui/Textarea['`"]", "from '@/components/ui/atoms'"
        $content = $content -replace "from ['`"]@/components/ui/Card['`"]", "from '@/components/ui/molecules'"
        $content = $content -replace "from ['`"]@/components/ui/Modal['`"]", "from '@/components/ui/organisms'"
        $content = $content -replace "from ['`"]@/components/ui/PageToolbar['`"]", "from '@/components/ui/organisms'"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 2: Remplacer les imports de types
Write-Host ""
Write-Host "2. Remplacement des imports de types..." -ForegroundColor Yellow
Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $modified = $false
    
    if ($content -match "from ['`"]\.\.?/types/finance['`"]") {
        $content = $content -replace "from ['`"]\.\./types/finance['`"]", "from '@/types/finance'"
        $content = $content -replace "from ['`"]\.\./\.\./types/finance['`"]", "from '@/types/finance'"
        $modified = $true
    }
    
    if ($content -match "from ['`"]@/types['`"]") {
        $content = $content -replace "from ['`"]@/types['`"]", "from '@/types/finance'"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 3: Remplacer les imports utilitaires
Write-Host ""
Write-Host "3. Remplacement des imports utilitaires..." -ForegroundColor Yellow
Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $modified = $false
    
    if ($content -match "from ['`"]@/lib/utils/cn['`"]") {
        $content = $content -replace "from ['`"]@/lib/utils/cn['`"]", "from '@/lib/utils'"
        $modified = $true
    }
    
    if ($content -match "from ['`"]\.\./utils/cn['`"]") {
        $content = $content -replace "from ['`"]\.\./utils/cn['`"]", "from '@/lib/utils'"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 4: Remplacer imports providers
Write-Host ""
Write-Host "4. Remplacement imports providers..." -ForegroundColor Yellow
Get-ChildItem -Path $financeDir -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $modified = $false
    
    if ($content -match "from ['`"]@/lib/providers/ToolbarProvider['`"]") {
        $content = $content -replace "from ['`"]@/lib/providers/ToolbarProvider['`"]", "from '@/components/providers/ToolbarProvider'"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline -Encoding UTF8
        Write-Host "  OK: $($_.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Migration terminee ===" -ForegroundColor Green
