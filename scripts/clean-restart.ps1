# Script de nettoyage complet et redémarrage
Write-Host "🧹 Nettoyage complet en cours..." -ForegroundColor Cyan

# Arrêter tous les processus Node
Write-Host "⏹️  Arrêt des processus Node..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Supprimer les caches
Write-Host "🗑️  Suppression des caches..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".turbo" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Nettoyage terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Redémarrage du serveur..." -ForegroundColor Cyan
Write-Host ""

# Redémarrer
pnpm dev
